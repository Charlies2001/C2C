from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from sqlalchemy.orm import Session

from ..database import get_db
from ..models.api_key import UserAPIKey
from ..models.user import User
from ..auth import get_current_user, decrypt_api_key
from ..rate_limit import ai_global_limiter, ai_user_limiter
from ..services.ai_service import (
    MissingAPIKeyError,
    _resolve_provider_config,
    stream_ai_response,
    stream_hint_response,
    stream_teaching_content,
    stream_teaching_section,
    get_teaching_sections,
    get_teaching_sections_for_difficulty,
    generate_problem_from_description,
)

router = APIRouter(prefix="/api/ai", tags=["ai"])

_SSE_HEADERS = {
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
}


# ─── Schemas (provider_config removed from request bodies) ───

class ProblemContext(BaseModel):
    title: str = Field(default="", max_length=200)
    description: str = Field(default="", max_length=50000)
    code: str = Field(default="", max_length=20000)
    output: str = Field(default="", max_length=10000)
    testResults: str = Field(default="", max_length=10000)
    difficulty: str = Field(default="Medium", max_length=20)
    starterCode: str = Field(default="", max_length=10000)


class UserProfile(BaseModel):
    experience: str
    goal: str
    style: str
    tone: str


class ChatMessage(BaseModel):
    role: str
    content: str = Field(max_length=10000)


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    problem_context: ProblemContext = ProblemContext()
    user_profile: UserProfile | None = None


class PreviousHint(BaseModel):
    level: int
    content: str = Field(max_length=10000)


class HintRequest(BaseModel):
    problem_context: ProblemContext = ProblemContext()
    previous_hints: list[PreviousHint] = []
    user_profile: UserProfile | None = None


class TeachingRequest(BaseModel):
    problem_context: ProblemContext = ProblemContext()


class PreviousSection(BaseModel):
    title: str = Field(default="", max_length=200)
    content: str = Field(default="", max_length=20000)


class TeachingSectionRequest(BaseModel):
    problem_context: ProblemContext = ProblemContext()
    section_index: int
    previous_sections: list[PreviousSection] = []
    user_profile: UserProfile | None = None


class GenerateProblemRequest(BaseModel):
    description: str = Field(max_length=5000)
    language: str = Field(default="zh-CN", max_length=10)


# ─── Helper: build provider_config from authenticated user's DB record ───

def _provider_config_from_user(user: User, db: Session) -> dict | None:
    """Build provider_config from the user's default API key.

    Reads from the new user_api_keys table; falls back to the legacy
    single-key columns on the User row for users created before the
    multi-key migration.
    """
    default_key = (
        db.query(UserAPIKey)
        .filter(UserAPIKey.user_id == user.id, UserAPIKey.is_default == True)  # noqa: E712
        .first()
    )
    if default_key is None:
        # Fallback to any key the user has (no default flagged for some reason)
        default_key = db.query(UserAPIKey).filter(UserAPIKey.user_id == user.id).first()
    if default_key and default_key.api_key_encrypted:
        plain = decrypt_api_key(default_key.api_key_encrypted)
        if plain:
            return {"provider": default_key.provider, "api_key": plain, "model": default_key.model or ""}
    # Legacy fallback (pre-migration data may live on User row)
    api_key = decrypt_api_key(user.ai_api_key_encrypted)
    if not api_key:
        return None
    return {
        "provider": user.ai_provider or "anthropic",
        "api_key": api_key,
        "model": user.ai_model or "",
    }


def _require_provider_config(user: User, db: Session) -> dict | None:
    """Validate the user can call AI endpoints; raise HTTP 400 with friendly
    Chinese message if no key is configured (and dev fallback is off).
    """
    provider_config = _provider_config_from_user(user, db)
    try:
        _resolve_provider_config(provider_config)
    except MissingAPIKeyError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return provider_config


async def rate_limit_ai(user: User = Depends(get_current_user)) -> User:
    """DoS protection for AI endpoints (per-user + global rolling-minute window)."""
    if not await ai_user_limiter.try_acquire(f"user:{user.id}"):
        raise HTTPException(
            status_code=429,
            detail="请求过于频繁，请稍后再试",
            headers={"Retry-After": "60"},
        )
    if not await ai_global_limiter.try_acquire("global"):
        raise HTTPException(
            status_code=503,
            detail="服务繁忙，请稍后再试",
            headers={"Retry-After": "60"},
        )
    return user


# ─── Endpoints ───

@router.post("/hint")
async def hint(request: HintRequest, user: User = Depends(rate_limit_ai), db: Session = Depends(get_db)):
    provider_config = _require_provider_config(user, db)
    return StreamingResponse(
        stream_hint_response(
            request.problem_context.model_dump(),
            [h.model_dump() for h in request.previous_hints],
            user_profile=request.user_profile.model_dump() if request.user_profile else None,
            provider_config=provider_config,
        ),
        media_type="text/event-stream",
        headers=_SSE_HEADERS,
    )


@router.get("/teaching-sections")
async def teaching_sections():
    return get_teaching_sections()


@router.get("/teaching-sections/{difficulty}")
async def teaching_sections_by_difficulty(difficulty: str):
    return get_teaching_sections_for_difficulty(difficulty)


@router.post("/teaching-section")
async def teaching_section(request: TeachingSectionRequest, user: User = Depends(rate_limit_ai), db: Session = Depends(get_db)):
    provider_config = _require_provider_config(user, db)
    problem_context = request.problem_context.model_dump()
    return StreamingResponse(
        stream_teaching_section(
            problem_context,
            request.section_index,
            previous_sections=[s.model_dump() for s in request.previous_sections],
            difficulty=problem_context.get("difficulty", "Medium"),
            user_profile=request.user_profile.model_dump() if request.user_profile else None,
            provider_config=provider_config,
        ),
        media_type="text/event-stream",
        headers=_SSE_HEADERS,
    )


@router.post("/teaching")
async def teaching(request: TeachingRequest, user: User = Depends(rate_limit_ai), db: Session = Depends(get_db)):
    provider_config = _require_provider_config(user, db)
    return StreamingResponse(
        stream_teaching_content(request.problem_context.model_dump(), provider_config=provider_config),
        media_type="text/event-stream",
        headers=_SSE_HEADERS,
    )


@router.post("/generate-problem")
async def generate_problem(request: GenerateProblemRequest, user: User = Depends(rate_limit_ai), db: Session = Depends(get_db)):
    provider_config = _require_provider_config(user, db)
    return await generate_problem_from_description(
        request.description, provider_config=provider_config, language=request.language,
    )


@router.post("/chat")
async def chat(request: ChatRequest, user: User = Depends(rate_limit_ai), db: Session = Depends(get_db)):
    provider_config = _require_provider_config(user, db)
    messages = [{"role": m.role, "content": m.content} for m in request.messages]
    return StreamingResponse(
        stream_ai_response(
            messages,
            request.problem_context.model_dump(),
            user_profile=request.user_profile.model_dump() if request.user_profile else None,
            provider_config=provider_config,
        ),
        media_type="text/event-stream",
        headers=_SSE_HEADERS,
    )
