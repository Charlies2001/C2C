"""Subscription / billing endpoints.

For now this exposes a `mock_upgrade` endpoint that activates a 30-day
subscription without going through a real payment provider. Replace with
Stripe / WeChat Pay / Alipay webhooks once a payment partner is chosen.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..config import settings
from ..database import get_db
from ..models.user import User
from ..subscription import entitlement_status, grant_subscription

router = APIRouter(prefix="/api/billing", tags=["billing"])


class UpgradeRequest(BaseModel):
    plan: str = Field(default="monthly", max_length=50)
    # Mock-only: will be replaced by real provider's verified payment id
    mock_payment_token: str | None = Field(default=None, max_length=200)


@router.get("/me")
def my_billing(user: User = Depends(get_current_user)):
    """Current user's subscription snapshot."""
    return entitlement_status(user)


@router.get("/plans")
def list_plans():
    """Static plan catalog. Until pricing is configured this is a stub."""
    return [
        {
            "id": "monthly",
            "name": "月订阅",
            "price_cny": 29,
            "duration_days": settings.SUBSCRIPTION_DAYS,
            "features": [
                "无限次 AI 提示与教学",
                "无限次 AI 出题",
                "支持多 Provider Key 切换",
                "优先邮件支持",
            ],
        },
    ]


@router.post("/upgrade")
def upgrade(
    req: UpgradeRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """MOCK upgrade endpoint — activates a 30-day subscription unconditionally.

    Production replacement: verify payment provider's webhook signature
    BEFORE calling grant_subscription. Until then this endpoint must NOT be
    exposed publicly without auth (it already requires login, which is the
    minimum). Behind a feature flag for safety.
    """
    if not settings.ENABLE_MOCK_BILLING:
        raise HTTPException(
            status_code=501,
            detail="支付功能尚未接入，请联系管理员",
        )
    if req.plan != "monthly":
        raise HTTPException(status_code=400, detail="未知的订阅计划")
    grant_subscription(user, days=settings.SUBSCRIPTION_DAYS)
    db.commit()
    db.refresh(user)
    return entitlement_status(user)
