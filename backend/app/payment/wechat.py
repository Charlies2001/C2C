"""WeChat Pay v3 Native (scan-to-pay)."""
from __future__ import annotations

import json
import logging
import os
import tempfile

from ..config import settings
from .base import CheckoutResult, NotifyResult, PaymentNotConfigured, register

logger = logging.getLogger("codingbot.payment.wechat")


class WechatProvider:
    name = "wechat"

    def __init__(self):
        self._client = None
        self._wechat_pay_type = None

    def is_configured(self) -> bool:
        return bool(
            settings.WECHAT_APP_ID
            and settings.WECHAT_MCH_ID
            and settings.WECHAT_API_V3_KEY
            and settings.WECHAT_PRIVATE_KEY
            and settings.WECHAT_CERT_SERIAL_NO
            and settings.WECHAT_NOTIFY_URL
        )

    def _get_client(self):
        if not self.is_configured():
            raise PaymentNotConfigured("微信支付凭证未配置（WECHAT_APP_ID 等）")
        if self._client is None:
            from wechatpayv3 import WeChatPay, WeChatPayType

            cert_dir = settings.WECHAT_CERT_DIR or os.path.join(tempfile.gettempdir(), "codingbot_wechat_certs")
            os.makedirs(cert_dir, exist_ok=True)
            self._wechat_pay_type = WeChatPayType.NATIVE
            self._client = WeChatPay(
                wechatpay_type=WeChatPayType.NATIVE,
                mchid=settings.WECHAT_MCH_ID,
                private_key=settings.WECHAT_PRIVATE_KEY,
                cert_serial_no=settings.WECHAT_CERT_SERIAL_NO,
                apiv3_key=settings.WECHAT_API_V3_KEY,
                appid=settings.WECHAT_APP_ID,
                notify_url=settings.WECHAT_NOTIFY_URL,
                cert_dir=cert_dir,
            )
        return self._client

    def create_qr_order(
        self, *, order_no: str, amount_cents: int, subject: str
    ) -> CheckoutResult:
        client = self._get_client()
        # WeChat Pay's pay() returns (status_code, response_text)
        code, message = client.pay(
            description=subject,
            out_trade_no=order_no,
            amount={"total": amount_cents, "currency": "CNY"},
            pay_type=self._wechat_pay_type,
        )
        if code != 200:
            raise RuntimeError(f"WeChat pay failed: code={code} message={message}")
        try:
            data = json.loads(message) if isinstance(message, str) else message
        except json.JSONDecodeError as e:
            raise RuntimeError(f"WeChat pay invalid JSON: {message}") from e
        # Native mode returns {"code_url": "weixin://wxpay/bizpayurl?pr=..."}
        code_url = data.get("code_url", "")
        if not code_url:
            raise RuntimeError(f"WeChat pay missing code_url: {data}")
        return CheckoutResult(qr_code_url=code_url, raw_response=data)

    def parse_notify(self, *, headers: dict, body: bytes) -> NotifyResult | None:
        if not self.is_configured():
            return None
        client = self._get_client()
        # SDK callback() handles signature verification + AES-GCM decrypt
        try:
            verified = client.callback(headers=headers, body=body)
        except Exception as e:  # signature error, decrypt error, etc.
            logger.warning("wechat_notify_verify_error", extra={"error": str(e)})
            return None
        if not verified:
            logger.warning("wechat_notify_verification_failed")
            return None
        resource = verified.get("resource", {})
        plaintext = resource.get("ciphertext", {})
        if isinstance(plaintext, str):
            try:
                plaintext = json.loads(plaintext)
            except json.JSONDecodeError:
                plaintext = {}
        # WeChat Pay puts decoded payment info in resource (SDK already decrypted)
        # See SDK docs; structure: {trade_state, out_trade_no, transaction_id, amount: {total}}
        trade_state = plaintext.get("trade_state", "")
        return NotifyResult(
            order_no=plaintext.get("out_trade_no", ""),
            provider_order_id=plaintext.get("transaction_id", ""),
            paid_amount_cents=plaintext.get("amount", {}).get("total", 0),
            success=trade_state == "SUCCESS",
        )


wechat_provider = register(WechatProvider())
