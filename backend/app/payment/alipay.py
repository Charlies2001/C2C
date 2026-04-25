"""Alipay PC scan-to-pay (alipay.trade.precreate)."""
from __future__ import annotations

import logging

from ..config import settings
from .base import CheckoutResult, NotifyResult, PaymentNotConfigured, register

logger = logging.getLogger("codingbot.payment.alipay")


class AlipayProvider:
    name = "alipay"

    def __init__(self):
        self._client = None  # lazy-init so missing creds don't break import

    def is_configured(self) -> bool:
        return bool(
            settings.ALIPAY_APP_ID
            and settings.ALIPAY_APP_PRIVATE_KEY
            and settings.ALIPAY_PUBLIC_KEY
            and settings.ALIPAY_NOTIFY_URL
        )

    def _get_client(self):
        if not self.is_configured():
            raise PaymentNotConfigured("Alipay 凭证未配置（ALIPAY_APP_ID 等）")
        if self._client is None:
            from alipay import AliPay

            self._client = AliPay(
                appid=settings.ALIPAY_APP_ID,
                app_notify_url=settings.ALIPAY_NOTIFY_URL,
                app_private_key_string=settings.ALIPAY_APP_PRIVATE_KEY,
                alipay_public_key_string=settings.ALIPAY_PUBLIC_KEY,
                sign_type="RSA2",
                debug=settings.ALIPAY_SANDBOX,
            )
        return self._client

    def create_qr_order(
        self, *, order_no: str, amount_cents: int, subject: str
    ) -> CheckoutResult:
        client = self._get_client()
        # API expects yuan as decimal string with 2 fraction digits
        total_amount = f"{amount_cents / 100:.2f}"
        result = client.api_alipay_trade_precreate(
            subject=subject,
            out_trade_no=order_no,
            total_amount=total_amount,
            notify_url=settings.ALIPAY_NOTIFY_URL,
        )
        # result: {"qr_code": "...", "out_trade_no": "...", "code": "10000", ...}
        if not isinstance(result, dict) or result.get("code") != "10000":
            raise RuntimeError(f"Alipay precreate failed: {result}")
        qr = result.get("qr_code") or ""
        if not qr:
            raise RuntimeError(f"Alipay precreate missing qr_code: {result}")
        return CheckoutResult(qr_code_url=qr, raw_response=result)

    def parse_notify(self, *, headers: dict, body: bytes) -> NotifyResult | None:
        """Verify Alipay async notify (form-encoded POST)."""
        if not self.is_configured():
            return None
        from urllib.parse import parse_qs

        params = {k: v[0] for k, v in parse_qs(body.decode("utf-8")).items()}
        sign = params.pop("sign", None)
        params.pop("sign_type", None)
        if not sign:
            logger.warning("alipay_notify_missing_sign")
            return None
        client = self._get_client()
        if not client.verify(params, sign):
            logger.warning("alipay_notify_signature_invalid", extra={"order_no": params.get("out_trade_no")})
            return None
        # Status: TRADE_SUCCESS or TRADE_FINISHED counts as paid
        status = params.get("trade_status", "")
        success = status in ("TRADE_SUCCESS", "TRADE_FINISHED")
        try:
            paid_cents = int(round(float(params.get("total_amount", "0")) * 100))
        except ValueError:
            paid_cents = 0
        return NotifyResult(
            order_no=params.get("out_trade_no", ""),
            provider_order_id=params.get("trade_no", ""),
            paid_amount_cents=paid_cents,
            success=success,
        )


alipay_provider = register(AlipayProvider())
