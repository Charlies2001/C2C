"""Payment order — created on /checkout, updated by webhook."""
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship

from ..database import Base


class PaymentOrder(Base):
    __tablename__ = "payment_orders"

    id = Column(Integer, primary_key=True, index=True)
    # Our business order number (uuid hex), unique across all providers.
    order_no = Column(String(64), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    provider = Column(String(20), nullable=False)  # alipay | wechat
    plan = Column(String(50), nullable=False, default="monthly")
    amount_cents = Column(Integer, nullable=False)
    currency = Column(String(8), nullable=False, default="CNY")
    # pending | paid | failed | expired
    status = Column(String(20), nullable=False, default="pending", index=True)
    # Provider-side identifiers, populated after webhook verification
    provider_order_id = Column(String(128), nullable=True)
    # URL we hand to frontend to encode as a QR code (alipay qr_code or wechat code_url)
    qr_code_url = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    paid_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)

    user = relationship("User")
