from sqlalchemy import Column, Integer, String, DateTime, func
from ..database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    nickname = Column(String(100), nullable=False, default="")
    role = Column(String(20), nullable=False, default="user")  # user / admin
    # AI provider config (encrypted API key stored server-side)
    ai_provider = Column(String(50), default="anthropic")
    ai_api_key_encrypted = Column(String(512), default="")
    ai_model = Column(String(100), default="")
    created_at = Column(DateTime, server_default=func.now())
