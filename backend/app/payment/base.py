"""Common types for payment providers."""
from dataclasses import dataclass
from typing import Protocol


class PaymentNotConfigured(Exception):
    """Raised when a provider's credentials are missing."""


@dataclass
class CheckoutResult:
    qr_code_url: str       # the data the frontend should render as a QR
    raw_response: dict     # provider raw response for debugging


@dataclass
class NotifyResult:
    order_no: str          # our order number
    provider_order_id: str # provider-side trade/transaction id
    paid_amount_cents: int
    success: bool          # provider says paid (else verify failed/abandoned)


class PaymentProvider(Protocol):
    name: str  # "alipay" | "wechat"

    def is_configured(self) -> bool: ...

    def create_qr_order(
        self, *, order_no: str, amount_cents: int, subject: str
    ) -> CheckoutResult: ...

    def parse_notify(self, *, headers: dict, body: bytes) -> NotifyResult | None:
        """Validate the webhook signature; return parsed result or None on failure."""


PROVIDERS: dict[str, PaymentProvider] = {}


def register(provider: PaymentProvider) -> PaymentProvider:
    PROVIDERS[provider.name] = provider
    return provider


def get_provider(name: str) -> PaymentProvider | None:
    return PROVIDERS.get(name)
