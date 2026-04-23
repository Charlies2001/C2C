from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..auth import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, _decode_token,
    get_current_user, encrypt_api_key, decrypt_api_key,
)

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
def get_me(user: User = Depends(get_current_user)):
    return UserResponse(
        id=user.id,
        email=user.email,
        nickname=user.nickname,
        role=user.role,
        ai_provider=user.ai_provider or "anthropic",
        ai_model=user.ai_model or "",
        has_api_key=bool(user.ai_api_key_encrypted),
    )


@router.put("/api-key")
def save_api_key(req: ApiKeyRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user.ai_provider = req.provider
    user.ai_api_key_encrypted = encrypt_api_key(req.api_key)
    user.ai_model = req.model
    db.commit()
    return {"success": True, "message": "API Key 已保存"}


@router.delete("/api-key")
def delete_api_key(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user.ai_api_key_encrypted = ""
    user.ai_provider = "anthropic"
    user.ai_model = ""
    db.commit()
    return {"success": True, "message": "API Key 已删除"}
