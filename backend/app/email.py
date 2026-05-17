"""Minimal Resend HTTP client — sends transactional emails for password reset.

Resend SDK adds a runtime dep we don't need; the HTTP API is two lines.
"""
import logging
from typing import Optional

import httpx

from .config import settings

logger = logging.getLogger("codingbot.email")

_RESEND_ENDPOINT = "https://api.resend.com/emails"


class EmailSendError(Exception):
    """Raised when Resend rejects the request. Callers may swallow this for
    flows that must never reveal whether an email was actually delivered
    (e.g. password reset — to avoid email enumeration)."""


def send_email(to: str, subject: str, html: str, text: Optional[str] = None) -> None:
    """Send via Resend. Raises EmailSendError on any non-2xx response."""
    if not settings.RESEND_API_KEY:
        raise EmailSendError("RESEND_API_KEY not configured")

    payload = {
        "from": settings.EMAIL_FROM,
        "to": [to],
        "subject": subject,
        "html": html,
    }
    if text:
        payload["text"] = text

    try:
        with httpx.Client(timeout=10.0) as client:
            resp = client.post(
                _RESEND_ENDPOINT,
                headers={
                    "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
    except httpx.RequestError as exc:
        logger.warning("email send network error", extra={"to": to, "error": str(exc)})
        raise EmailSendError(f"network error: {exc}") from exc

    if resp.status_code >= 300:
        # Body may contain useful diagnostic but not secrets — log it.
        logger.warning(
            "email send rejected by Resend",
            extra={"to": to, "status": resp.status_code, "body": resp.text[:300]},
        )
        raise EmailSendError(f"Resend returned {resp.status_code}")

    logger.info("email sent", extra={"to": to, "subject": subject, "resend_id": resp.json().get("id")})


def render_password_reset_email(reset_url: str, nickname: str) -> tuple[str, str]:
    """Return (html, text) for the password reset email. Plain zh-CN, no marketing."""
    text = (
        f"你好 {nickname}，\n\n"
        f"我们收到了你重置 CodingBot 密码的请求。点击下方链接（15 分钟内有效）：\n\n"
        f"{reset_url}\n\n"
        f"如果不是你本人操作，请忽略此邮件，你的密码不会被修改。\n\n"
        f"—— CodingBot"
    )
    html = f"""<!doctype html>
<html lang="zh-CN">
<body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;background:#0a0a0a;color:#e5e7eb;padding:24px;">
  <div style="max-width:480px;margin:0 auto;background:#111827;border:1px solid #1f2937;border-radius:12px;padding:32px;">
    <h2 style="margin:0 0 16px;color:#fff;font-size:20px;">重置你的 CodingBot 密码</h2>
    <p style="color:#9ca3af;font-size:14px;line-height:1.6;">你好 {nickname}，</p>
    <p style="color:#9ca3af;font-size:14px;line-height:1.6;">我们收到了你重置密码的请求。点击下方按钮（<strong style="color:#fff;">15 分钟内有效</strong>）：</p>
    <p style="text-align:center;margin:24px 0;">
      <a href="{reset_url}" style="display:inline-block;padding:10px 24px;background:linear-gradient(135deg,#7c3aed,#06b6d4);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">重置密码</a>
    </p>
    <p style="color:#6b7280;font-size:12px;line-height:1.6;">或复制此链接到浏览器：<br><span style="color:#9ca3af;word-break:break-all;">{reset_url}</span></p>
    <hr style="border:none;border-top:1px solid #1f2937;margin:24px 0;">
    <p style="color:#6b7280;font-size:12px;line-height:1.6;">如果不是你本人操作，请忽略此邮件，你的密码不会被修改。</p>
  </div>
</body>
</html>"""
    return html, text
