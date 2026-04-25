"""Subscription / billing endpoints — supports Alipay + WeChat Pay (Native QR)."""
import logging
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..config import settings
from ..database import get_db
from ..models.payment import PaymentOrder
from ..models.user import User
from ..payment import PaymentNotConfigured, get_provider
from ..subscription import entitlement_status, grant_subscription

logger = logging.getLogger("codingbot.billing")
router = APIRouter(prefix="/api/billing", tags=["billing"])

ORDER_TTL_MINUTES = 30


class CheckoutRequest(BaseModel):
    provider: str = Field(max_length=20)  # alipay | wechat
    plan: str = Field(default="monthly", max_length=50)


class CheckoutResponse(BaseModel):
    order_no: str
    provider: str
    plan: str
    amount_cents: int
    qr_code_url: str
    expires_at: str


class OrderResponse(BaseModel):
    order_no: str
    provider: str
    plan: str
    amount_cents: int
    status: str  # pending | paid | failed | expired
    qr_code_url: str | None
    paid_at: str | None
    expires_at: str | None


class UpgradeRequest(BaseModel):
    plan: str = Field(default="monthly", max_length=50)


def _now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _serialize_order(o: PaymentOrder) -> OrderResponse:
    return OrderResponse(
        order_no=o.order_no,
        provider=o.provider,
        plan=o.plan,
        amount_cents=o.amount_cents,
        status=o.status,
        qr_code_url=o.qr_code_url,
        paid_at=o.paid_at.isoformat() if o.paid_at else None,
        expires_at=o.expires_at.isoformat() if o.expires_at else None,
    )


def _expire_pending_if_overdue(order: PaymentOrder) -> None:
    """Update status to 'expired' in-memory if past expires_at; caller commits."""
    if order.status == "pending" and order.expires_at and order.expires_at < _now():
        order.status = "expired"


# ─── Read endpoints ───

@router.get("/me")
def my_billing(user: User = Depends(get_current_user)):
    return entitlement_status(user)


@router.get("/plans")
def list_plans():
    return [
        {
            "id": "monthly",
            "name": "月订阅",
            "price_cents": settings.PLAN_MONTHLY_PRICE_CENTS,
            "duration_days": settings.SUBSCRIPTION_DAYS,
            "features": [
                "无限次 AI 提示与教学",
                "无限次 AI 出题",
                "支持多 Provider Key 切换",
                "优先邮件支持",
            ],
        },
    ]


@router.get("/providers")
def list_providers():
    """Which payment providers are wired up on this deployment."""
    return [
        {"id": "alipay", "name": "支付宝", "available": get_provider("alipay").is_configured()},
        {"id": "wechat", "name": "微信支付", "available": get_provider("wechat").is_configured()},
    ]


@router.get("/orders/{order_no}", response_model=OrderResponse)
def get_order(
    order_no: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = db.query(PaymentOrder).filter(PaymentOrder.order_no == order_no).first()
    if not order or order.user_id != user.id:
        raise HTTPException(status_code=404, detail="订单不存在")
    if order.status == "pending":
        _expire_pending_if_overdue(order)
        if order.status == "expired":
            db.commit()
    return _serialize_order(order)


# ─── Checkout (creates order + asks provider for QR) ───

@router.post("/checkout", response_model=CheckoutResponse)
def checkout(
    req: CheckoutRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if req.plan != "monthly":
        raise HTTPException(status_code=400, detail="未知的订阅计划")
    provider = get_provider(req.provider)
    if provider is None:
        raise HTTPException(status_code=400, detail=f"未知的支付渠道: {req.provider}")
    if not provider.is_configured():
        raise HTTPException(status_code=503, detail=f"{req.provider} 支付未配置，请联系管理员")

    order_no = uuid.uuid4().hex
    amount_cents = settings.PLAN_MONTHLY_PRICE_CENTS
    expires_at = _now() + timedelta(minutes=ORDER_TTL_MINUTES)
    order = PaymentOrder(
        order_no=order_no,
        user_id=user.id,
        provider=req.provider,
        plan=req.plan,
        amount_cents=amount_cents,
        currency="CNY",
        status="pending",
        expires_at=expires_at,
    )
    db.add(order)
    db.flush()  # assign id but don't commit yet — only commit if provider succeeds

    try:
        result = provider.create_qr_order(
            order_no=order_no,
            amount_cents=amount_cents,
            subject=f"CodingBot 月订阅",
        )
    except PaymentNotConfigured as e:
        db.rollback()
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        db.rollback()
        logger.exception("checkout_provider_error", extra={"provider": req.provider, "error": str(e)})
        raise HTTPException(status_code=502, detail="创建支付订单失败，请稍后重试")

    order.qr_code_url = result.qr_code_url
    db.commit()
    db.refresh(order)
    return CheckoutResponse(
        order_no=order.order_no,
        provider=order.provider,
        plan=order.plan,
        amount_cents=order.amount_cents,
        qr_code_url=order.qr_code_url,
        expires_at=order.expires_at.isoformat(),
    )


# ─── Webhooks ───

def _apply_paid(order: PaymentOrder, provider_order_id: str, paid_cents: int, db: Session) -> None:
    """Idempotently mark order paid + grant subscription."""
    if order.status == "paid":
        return  # already processed
    if paid_cents != order.amount_cents:
        logger.warning(
            "payment_amount_mismatch",
            extra={"order_no": order.order_no, "expected": order.amount_cents, "got": paid_cents},
        )
        order.status = "failed"
        db.commit()
        return
    order.status = "paid"
    order.provider_order_id = provider_order_id
    order.paid_at = _now()
    user = db.query(User).filter(User.id == order.user_id).first()
    if user:
        grant_subscription(user, days=settings.SUBSCRIPTION_DAYS)
    db.commit()
    logger.info(
        "payment_succeeded",
        extra={"order_no": order.order_no, "provider": order.provider, "user_id": order.user_id},
    )


async def _handle_notify(provider_name: str, request: Request, db: Session) -> dict:
    provider = get_provider(provider_name)
    if provider is None or not provider.is_configured():
        raise HTTPException(status_code=503, detail=f"{provider_name} 支付未配置")
    body = await request.body()
    headers = {k: v for k, v in request.headers.items()}
    parsed = provider.parse_notify(headers=headers, body=body)
    if parsed is None:
        raise HTTPException(status_code=400, detail="webhook 验签失败")
    if not parsed.success:
        # Acknowledge — provider will stop retrying
        return {"code": "SUCCESS"} if provider_name == "wechat" else "fail"
    order = db.query(PaymentOrder).filter(PaymentOrder.order_no == parsed.order_no).first()
    if not order:
        logger.warning("payment_unknown_order", extra={"provider": provider_name, "order_no": parsed.order_no})
        # Still ACK to avoid retry storms
        return {"code": "SUCCESS"} if provider_name == "wechat" else "success"
    _apply_paid(order, parsed.provider_order_id, parsed.paid_amount_cents, db)
    return {"code": "SUCCESS"} if provider_name == "wechat" else "success"


@router.post("/alipay/notify")
async def alipay_notify(request: Request, db: Session = Depends(get_db)):
    # Alipay expects plain text "success" body
    result = await _handle_notify("alipay", request, db)
    return result


@router.post("/wechat/notify")
async def wechat_notify(request: Request, db: Session = Depends(get_db)):
    # WeChat Pay v3 expects {"code":"SUCCESS","message":"成功"}
    return await _handle_notify("wechat", request, db)


# ─── Mock upgrade (dev only) ───

@router.post("/upgrade")
def upgrade(
    req: UpgradeRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Dev-only mock: skip payment, grant subscription. Gated by ENABLE_MOCK_BILLING."""
    if not settings.ENABLE_MOCK_BILLING:
        raise HTTPException(
            status_code=501,
            detail="支付功能尚未接入，请使用 /api/billing/checkout 走正式支付通道",
        )
    if req.plan != "monthly":
        raise HTTPException(status_code=400, detail="未知的订阅计划")
    grant_subscription(user, days=settings.SUBSCRIPTION_DAYS)
    db.commit()
    db.refresh(user)
    return entitlement_status(user)
