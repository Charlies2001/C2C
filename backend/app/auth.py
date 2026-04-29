from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from cryptography.fernet import Fernet
import base64
import hashlib

from .config import settings
from .database import get_db
from .models.user import User

# ─── Password hashing ───
# Direct bcrypt API (skipping passlib which is incompatible with bcrypt >= 5.0
# as of 2026 — passlib 1.7.4 still tries to read bcrypt.__about__.__version__,
# which was removed in bcrypt 5.0 and breaks set_backend).
#
# bcrypt only hashes the first 72 bytes of input, so we truncate explicitly.
# Pre-hashing with sha256 would lift this limit, but at the cost of breaking
# any existing hash — for a fresh project, plain truncation is simpler.

_BCRYPT_MAX_BYTES = 72


def _to_bytes(password: str) -> bytes:
    return password.encode("utf-8")[:_BCRYPT_MAX_BYTES]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(_to_bytes(password), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(_to_bytes(plain), hashed.encode("utf-8"))
    except (ValueError, TypeError):
        return False


# ─── JWT tokens ───

def create_access_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(
        {"sub": str(user_id), "exp": expire, "type": "access"},
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


def create_refresh_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    return jwt.encode(
        {"sub": str(user_id), "exp": expire, "type": "refresh"},
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


def _decode_token(token: str, expected_type: str) -> int:
    """Decode and validate JWT. Returns user_id or raises HTTPException."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token 无效或已过期")
    if payload.get("type") != expected_type:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token 类型错误")
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token 无效")
    return int(user_id)


# ─── FastAPI dependency: get current user ───

_bearer = HTTPBearer(auto_error=False)


def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User:
    """Require a valid access token. Returns the User ORM object."""
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="未登录")
    user_id = _decode_token(credentials.credentials, "access")
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="用户不存在")
    request.state.user_id = user.id
    return user


def get_optional_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Like get_current_user but returns None instead of raising if not authenticated."""
    if credentials is None:
        return None
    try:
        user_id = _decode_token(credentials.credentials, "access")
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            request.state.user_id = user.id
        return user
    except HTTPException:
        return None


def require_admin(user: User = Depends(get_current_user)) -> User:
    """Require the current user to have admin role."""
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="需要管理员权限")
    return user


# ─── API Key encryption ───

def _get_fernet() -> Fernet:
    """Derive a Fernet key from ENCRYPTION_KEY setting."""
    key = settings.ENCRYPTION_KEY
    if not key:
        # Fallback: derive from JWT secret (not ideal but works for single-instance)
        key = settings.JWT_SECRET_KEY
    # Fernet requires a 32-byte url-safe base64 key; derive one from arbitrary string
    digest = hashlib.sha256(key.encode()).digest()
    return Fernet(base64.urlsafe_b64encode(digest))


def encrypt_api_key(plain_key: str) -> str:
    if not plain_key:
        return ""
    return _get_fernet().encrypt(plain_key.encode()).decode()


def decrypt_api_key(encrypted: str) -> str:
    if not encrypted:
        return ""
    try:
        return _get_fernet().decrypt(encrypted.encode()).decode()
    except Exception:
        return ""
