"""Payment provider integrations.

Each provider is gated by env credentials; if they're missing, the provider
reports `is_configured() == False` and /checkout returns 503 for that provider.
This way the codebase is always importable even before a merchant account
is approved.
"""
from .alipay import alipay_provider
from .base import (
    PaymentNotConfigured,
    CheckoutResult,
    NotifyResult,
    PROVIDERS,
    get_provider,
)
from .wechat import wechat_provider

__all__ = [
    "PaymentNotConfigured",
    "CheckoutResult",
    "NotifyResult",
    "PROVIDERS",
    "get_provider",
    "alipay_provider",
    "wechat_provider",
]
