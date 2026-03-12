from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from ..services.ai_service import (
    stream_ai_response,
    stream_hint_response,
    stream_teaching_content,
    stream_teaching_section,
    get_teaching_sections,
    get_teaching_sections_for_difficulty,
    generate_problem_from_description,
)

router = APIRouter(prefix="/api/ai", tags=["ai"])


class ProviderConfig(BaseModel):
    provider: str = "anthropic"
    api_key: str = ""
    model: str = ""


class ProblemContext(BaseModel):
    title: str = ""
    description: str = ""
    code: str = ""
    output: str = ""
    testResults: str = ""
    difficulty: str = "Medium"
    starterCode: str = ""


class UserProfile(BaseModel):
    experience: str
    goal: str
    style: str
    tone: str


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    problem_context: ProblemContext = ProblemContext()
    user_profile: UserProfile | None = None
    provider_config: ProviderConfig | None = None


class PreviousHint(BaseModel):
    level: int
    content: str


class HintRequest(BaseModel):
    problem_context: ProblemContext = ProblemContext()
    previous_hints: list[PreviousHint] = []
    user_profile: UserProfile | None = None
    provider_config: ProviderConfig | None = None


class TeachingRequest(BaseModel):
    problem_context: ProblemContext = ProblemContext()
    provider_config: ProviderConfig | None = None


class PreviousSection(BaseModel):
    title: str = ""
    content: str = ""


class TeachingSectionRequest(BaseModel):
    problem_context: ProblemContext = ProblemContext()
    section_index: int
    previous_sections: list[PreviousSection] = []
    user_profile: UserProfile | None = None
    provider_config: ProviderConfig | None = None


class GenerateProblemRequest(BaseModel):
    description: str
    provider_config: ProviderConfig | None = None
    language: str = "zh-CN"


@router.post("/hint")
async def hint(request: HintRequest):
    problem_context = request.problem_context.model_dump()
    previous_hints = [h.model_dump() for h in request.previous_hints]
    user_profile = request.user_profile.model_dump() if request.user_profile else None
    provider_config = request.provider_config.model_dump() if request.provider_config else None
    return StreamingResponse(
        stream_hint_response(problem_context, previous_hints, user_profile=user_profile, provider_config=provider_config),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/teaching-sections")
async def teaching_sections():
    return get_teaching_sections()


@router.get("/teaching-sections/{difficulty}")
async def teaching_sections_by_difficulty(difficulty: str):
    return get_teaching_sections_for_difficulty(difficulty)


@router.post("/teaching-section")
async def teaching_section(request: TeachingSectionRequest):
    problem_context = request.problem_context.model_dump()
    previous_sections = [s.model_dump() for s in request.previous_sections]
    difficulty = problem_context.get("difficulty", "Medium")
    user_profile = request.user_profile.model_dump() if request.user_profile else None
    provider_config = request.provider_config.model_dump() if request.provider_config else None
    return StreamingResponse(
        stream_teaching_section(
            problem_context,
            request.section_index,
            previous_sections=previous_sections,
            difficulty=difficulty,
            user_profile=user_profile,
            provider_config=provider_config,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/teaching")
async def teaching(request: TeachingRequest):
    problem_context = request.problem_context.model_dump()
    provider_config = request.provider_config.model_dump() if request.provider_config else None
    return StreamingResponse(
        stream_teaching_content(problem_context, provider_config=provider_config),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/generate-problem")
async def generate_problem(request: GenerateProblemRequest):
    provider_config = request.provider_config.model_dump() if request.provider_config else None
    result = await generate_problem_from_description(request.description, provider_config=provider_config, language=request.language)
    return result


@router.post("/chat")
async def chat(request: ChatRequest):
    messages = [{"role": m.role, "content": m.content} for m in request.messages]
    problem_context = request.problem_context.model_dump()
    user_profile = request.user_profile.model_dump() if request.user_profile else None
    provider_config = request.provider_config.model_dump() if request.provider_config else None

    return StreamingResponse(
        stream_ai_response(messages, problem_context, user_profile=user_profile, provider_config=provider_config),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
