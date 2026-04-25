from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship

from ..database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    nickname = Column(String(100), nullable=False, default="")
    role = Column(String(20), nullable=False, default="user")  # user / admin
    # Legacy single-provider fields — kept for backward compatibility, not actively used.
    # New code reads/writes via the user_api_keys child table (see models/api_key.py).
    ai_provider = Column(String(50), default="anthropic")
    ai_api_key_encrypted = Column(String(512), default="")
    ai_model = Column(String(100), default="")
    created_at = Column(DateTime, server_default=func.now())

    # ─── Subscription state ───
    # plan values: "trial" | "active" | "expired"
    plan = Column(String(20), nullable=False, default="trial")
    trial_ends_at = Column(DateTime, nullable=True)         # set on register
    subscription_ends_at = Column(DateTime, nullable=True)   # set on successful payment

    api_keys = relationship(
        "UserAPIKey",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
