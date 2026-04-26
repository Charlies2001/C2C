import copy
import logging
import subprocess
import time
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from .config import settings
from .database import engine, SessionLocal, Base
from .logging_config import request_id_ctx, setup_logging
from .models.problem import Problem
from .models.user import User  # noqa: F401 — ensure table is created
from .routers import ai, auth, notebooks, notes, problems
from .seed.problems import SEED_PROBLEMS
from .services.ai_service import _anthropic_clients, _openai_clients

setup_logging()
logger = logging.getLogger("codingbot")


def _get_localized_seeds(language: str) -> list[dict]:
    """Return seed problems localized to the given language."""
    if language == "zh-CN":
        return SEED_PROBLEMS

    try:
        from .seed.problems_i18n import TRANSLATIONS
    except ImportError:
        return SEED_PROBLEMS

    localized = []
    for p in SEED_PROBLEMS:
        slug = p["slug"]
        trans = TRANSLATIONS.get(slug, {}).get(language)
        if trans:
            lp = copy.deepcopy(p)
            lp.update(trans)
            localized.append(lp)
        else:
            localized.append(p)
    return localized


def _run_alembic_upgrade():
    """Run alembic upgrade head on startup to ensure schema is up to date."""
    import os
    alembic_ini = os.path.join(os.path.dirname(os.path.dirname(__file__)), "alembic.ini")
    result = subprocess.run(
        ["alembic", "-c", alembic_ini, "upgrade", "head"],
        capture_output=True, text=True,
        cwd=os.path.dirname(os.path.dirname(__file__)),
    )
    if result.returncode != 0:
        logger.error(f"Alembic upgrade failed: {result.stderr}")
        raise RuntimeError(f"Database migration failed: {result.stderr}")
    logger.info("Database migrations applied successfully")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup — run alembic migrations
    _run_alembic_upgrade()
    db = SessionLocal()
    try:
        if db.query(Problem).count() == 0:
            seeds = _get_localized_seeds(settings.SEED_LANGUAGE)
            for p in seeds:
                db.add(Problem(**p))
            db.commit()
    finally:
        db.close()
    logger.info("CodingBot started")

    yield

    # Shutdown: close all cached LLM clients to release TCP connections
    for client in _anthropic_clients.values():
        await client.close()
    _anthropic_clients.clear()
    for client in _openai_clients.values():
        await client.close()
    _openai_clients.clear()
    engine.dispose()
    logger.info("CodingBot shutdown: cleaned up connections")

app = FastAPI(title="CodingBot API", lifespan=lifespan)

# ─── Concurrency limiter for AI endpoints ───
import asyncio

_ai_semaphore = asyncio.Semaphore(10)  # Max 10 concurrent AI requests


class AIConcurrencyMiddleware(BaseHTTPMiddleware):
    """Limit concurrent AI requests to prevent resource exhaustion."""

    async def dispatch(self, request: Request, call_next):
        if request.url.path.startswith("/api/ai/"):
            if _ai_semaphore.locked():
                logger.warning("ai_concurrency_limit_reached", extra={"path": request.url.path})
            try:
                async with _ai_semaphore:
                    return await call_next(request)
            except Exception:
                logger.exception("ai_request_error", extra={"path": request.url.path})
                return JSONResponse(
                    status_code=503,
                    content={"error": "服务暂时繁忙，请稍后重试"},
                )
        return await call_next(request)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Attach request_id, log method/path/status/duration for every request."""

    # Paths excluded from access logging to reduce noise.
    _SKIP_PATHS = {"/api/health"}

    async def dispatch(self, request: Request, call_next):
        rid = request.headers.get("x-request-id") or uuid.uuid4().hex[:12]
        rid_token = request_id_ctx.set(rid)
        start = time.perf_counter()
        status_code = 500
        try:
            response = await call_next(request)
            status_code = response.status_code
            response.headers["x-request-id"] = rid
            return response
        except Exception:
            duration_ms = round((time.perf_counter() - start) * 1000, 2)
            logger.exception(
                "request_error",
                extra={
                    "method": request.method,
                    "path": request.url.path,
                    "duration_ms": duration_ms,
                    "user_id": getattr(request.state, "user_id", None),
                },
            )
            raise
        finally:
            if request.url.path not in self._SKIP_PATHS:
                duration_ms = round((time.perf_counter() - start) * 1000, 2)
                logger.info(
                    "request",
                    extra={
                        "method": request.method,
                        "path": request.url.path,
                        "status": status_code,
                        "duration_ms": duration_ms,
                        "user_id": getattr(request.state, "user_id", None),
                    },
                )
            request_id_ctx.reset(rid_token)


app.add_middleware(AIConcurrencyMiddleware)
app.add_middleware(RequestLoggingMiddleware)

_origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth.router)
app.include_router(problems.router)
app.include_router(ai.router)
app.include_router(notes.router)
app.include_router(notebooks.router)

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
