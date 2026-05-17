from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.api_key import UserAPIKey
from ..models.user import User
from ..auth import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, _decode_token,
    create_password_reset_token, decode_password_reset_token,
    get_current_user, encrypt_api_key, decrypt_api_key,
)
from ..config import settings
from ..email import EmailSendError, render_password_reset_email, send_email

router = APIRouter(prefix="/api/auth", tags=["auth"])


# ─── Schemas ───

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    nickname: str = Field(min_length=1, max_length=100)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=6, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    email: str
    nickname: str
    role: str
    ai_provider: str
    ai_model: str
    has_api_key: bool

    class Config:
        from_attributes = True


class ApiKeyRequest(BaseModel):
    provider: str = Field(max_length=50)
    api_key: str = Field(max_length=256)
    model: str = Field(default="", max_length=100)


class ApiKeyCreateRequest(BaseModel):
    provider: str = Field(max_length=50)
    api_key: str = Field(max_length=256)
    model: str = Field(default="", max_length=100)
    set_default: bool = True


class ApiKeyResponse(BaseModel):
    id: int
    provider: str
    model: str
    is_default: bool
    has_key: bool

    class Config:
        from_attributes = True


def _default_key_for(user: User, db: Session) -> UserAPIKey | None:
    """Return the user's default API key row, or any single key if none flagged."""
    keys = db.query(UserAPIKey).filter(UserAPIKey.user_id == user.id).all()
    if not keys:
        return None
    for k in keys:
        if k.is_default:
            return k
    return keys[0]


# ─── Endpoints ───

@router.post("/register", response_model=TokenResponse, status_code=201)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="该邮箱已注册")

    user = User(
        email=req.email,
        hashed_password=hash_password(req.password),
        nickname=req.nickname,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="邮箱或密码错误")

    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


@router.post("/forgot-password", status_code=200)
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Trigger a password reset email.

    Always returns 200 with the same message — never reveals whether the email
    is registered. Silently no-ops if Resend isn't configured or send fails;
    the user side cannot distinguish these from "email not registered".
    """
    user = db.query(User).filter(User.email == req.email).first()
    if user:
        try:
            token = create_password_reset_token(user.id, user.hashed_password)
            reset_url = f"{settings.APP_BASE_URL.rstrip('/')}/reset-password?token={token}"
            html, text = render_password_reset_email(reset_url, user.nickname or user.email)
            send_email(user.email, "重置 CodingBot 密码", html, text)
        except EmailSendError:
            # Swallowed deliberately — see docstring.
            pass
    return {"detail": "如果该邮箱已注册，我们已向其发送重置链接。请检查收件箱（包含垃圾邮件文件夹）。"}


@router.post("/reset-password", response_model=TokenResponse)
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Consume a reset token and set a new password. Auto-logs in on success."""
    # We need to load the user first to check token binding. The token's "sub"
    # gives us the user_id, but we must decode WITH the current hash. So:
    # 1. peek at sub (unverified) to find user
    # 2. fully verify token bound to that user's current hash
    try:
        from jose import jwt as _jwt
        peek = _jwt.get_unverified_claims(req.token)
        user_id = int(peek.get("sub") or 0)
    except Exception:
        raise HTTPException(status_code=400, detail="链接已过期或无效，请重新申请")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="链接已过期或无效，请重新申请")

    decode_password_reset_token(req.token, user.hashed_password)  # raises 400 on mismatch

    user.hashed_password = hash_password(req.new_password)
    db.commit()

    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh(req: RefreshRequest, db: Session = Depends(get_db)):
    user_id = _decode_token(req.refresh_token, "refresh")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="用户不存在")

    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


@router.get("/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Return the current user. ai_provider/ai_model/has_api_key reflect the
    user's default API key (or fall back to legacy single-key columns)."""
    default_key = _default_key_for(user, db)
    if default_key:
        return UserResponse(
            id=user.id,
            email=user.email,
            nickname=user.nickname,
            role=user.role,
            ai_provider=default_key.provider,
            ai_model=default_key.model or "",
            has_api_key=bool(default_key.api_key_encrypted),
        )
    return UserResponse(
        id=user.id,
        email=user.email,
        nickname=user.nickname,
        role=user.role,
        ai_provider=user.ai_provider or "anthropic",
        ai_model=user.ai_model or "",
        has_api_key=bool(user.ai_api_key_encrypted),
    )


# ─── Multi-provider API key endpoints (preferred) ───

@router.get("/api-keys", response_model=list[ApiKeyResponse])
def list_api_keys(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(UserAPIKey).filter(UserAPIKey.user_id == user.id).order_by(UserAPIKey.id).all()
    return [
        ApiKeyResponse(
            id=k.id, provider=k.provider, model=k.model or "",
            is_default=k.is_default, has_key=bool(k.api_key_encrypted),
        )
        for k in rows
    ]


@router.post("/api-keys", response_model=ApiKeyResponse, status_code=201)
def create_or_update_api_key(
    req: ApiKeyCreateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new key for `provider`, or update the existing one if present."""
    existing = db.query(UserAPIKey).filter(
        UserAPIKey.user_id == user.id,
        UserAPIKey.provider == req.provider,
    ).first()
    if existing:
        existing.api_key_encrypted = encrypt_api_key(req.api_key)
        existing.model = req.model
        if req.set_default:
            db.query(UserAPIKey).filter(
                UserAPIKey.user_id == user.id, UserAPIKey.id != existing.id,
            ).update({"is_default": False})
            existing.is_default = True
        row = existing
    else:
        # First key for this user is auto-default
        is_first = db.query(UserAPIKey).filter(UserAPIKey.user_id == user.id).count() == 0
        if req.set_default or is_first:
            db.query(UserAPIKey).filter(UserAPIKey.user_id == user.id).update({"is_default": False})
        row = UserAPIKey(
            user_id=user.id,
            provider=req.provider,
            api_key_encrypted=encrypt_api_key(req.api_key),
            model=req.model,
            is_default=req.set_default or is_first,
        )
        db.add(row)
    db.commit()
    db.refresh(row)
    return ApiKeyResponse(
        id=row.id, provider=row.provider, model=row.model or "",
        is_default=row.is_default, has_key=bool(row.api_key_encrypted),
    )


@router.delete("/api-keys/{key_id}", status_code=204)
def delete_api_key_by_id(
    key_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = db.query(UserAPIKey).filter(
        UserAPIKey.id == key_id, UserAPIKey.user_id == user.id,
    ).first()
    if not row:
        raise HTTPException(status_code=404, detail="未找到该 API Key")
    was_default = row.is_default
    db.delete(row)
    # Promote another key to default if we deleted the default one
    if was_default:
        next_key = db.query(UserAPIKey).filter(UserAPIKey.user_id == user.id).first()
        if next_key:
            next_key.is_default = True
    db.commit()


@router.put("/api-keys/{key_id}/default")
def set_default_api_key(
    key_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = db.query(UserAPIKey).filter(
        UserAPIKey.id == key_id, UserAPIKey.user_id == user.id,
    ).first()
    if not row:
        raise HTTPException(status_code=404, detail="未找到该 API Key")
    db.query(UserAPIKey).filter(UserAPIKey.user_id == user.id).update({"is_default": False})
    row.is_default = True
    db.commit()
    return {"success": True}


# ─── Legacy single-key endpoints (kept for old frontend compatibility) ───

@router.put("/api-key")
def save_api_key(req: ApiKeyRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Legacy single-key endpoint — internally upserts into user_api_keys."""
    create_or_update_api_key(
        ApiKeyCreateRequest(provider=req.provider, api_key=req.api_key, model=req.model, set_default=True),
        user=user, db=db,
    )
    return {"success": True, "message": "API Key 已保存"}


@router.delete("/api-key")
def delete_api_key(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Legacy delete — removes the current default key."""
    default_key = _default_key_for(user, db)
    if default_key:
        delete_api_key_by_id(default_key.id, user=user, db=db)
    return {"success": True, "message": "API Key 已删除"}
