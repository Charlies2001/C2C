import copy
import logging
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
from . import metrics
from .models.problem import Problem
from .models.user import User  # noqa: F401 — ensure table is created
from .routers import ai, auth, notebooks, notes, problems, submissions
from .seed.problems import SEED_PROBLEMS
from .services.ai_service import _anthropic_clients, _openai_clients

setup_logging()
logger = logging.getLogger("codingbot")

# Sentry must init BEFORE the FastAPI app is constructed so its
# auto-instrumentation hooks the routing layer. Skipped entirely when
# SENTRY_DSN is empty (dev / self-host without Sentry).
if settings.SENTRY_DSN:
    import sentry_sdk
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.SENTRY_ENVIRONMENT,
        # Free plan covers errors only; skip perf + profiling tracing to stay
        # well under the 5k events/month limit.
        traces_sample_rate=0.0,
        profiles_sample_rate=0.0,
        # Don't auto-attach request bodies / cookies / headers — too easy to
        # leak api keys or auth tokens that way. Errors only.
        send_default_pii=False,
    )
    sentry_sdk.set_tag("component", "backend")
    logger.info("sentry initialized")


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
    """Run alembic upgrade head on startup. Uses the in-process API (works in
    PyInstaller-frozen apps where the `alembic` CLI isn't present)."""
    import os
    from alembic import command
    from alembic.config import Config

    backend_dir = os.path.dirname(os.path.dirname(__file__))
    alembic_ini = os.path.join(backend_dir, "alembic.ini")
    cfg = Config(alembic_ini)
    # Force script_location to an absolute path (the .ini default is relative).
    cfg.set_main_option("script_location", os.path.join(backend_dir, "alembic"))
    cfg.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
    try:
        command.upgrade(cfg, "head")
    except Exception as e:
        logger.error(f"Alembic upgrade failed: {e}")
        raise
    logger.info("Database migrations applied successfully")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup — run alembic migrations
    _run_alembic_upgrade()
    db = SessionLocal()
    try:
        # Incremental seeding: add any seeds whose slug isn't already in the DB.
        # The previous "if count == 0: seed all" branch silently dropped new
        # seeds added by later releases because count > 0 after first deploy.
        seeds = _get_localized_seeds(settings.SEED_LANGUAGE)
        existing_slugs = {row[0] for row in db.query(Problem.slug).all()}
        added = 0
        for p in seeds:
            if p["slug"] not in existing_slugs:
                # Seed problems are official content, no owner, public to everyone.
                db.add(Problem(**p, owner_id=None, is_public=True))
                added += 1
        if added:
            db.commit()
            logger.info(f"Seeded {added} new problem(s)")
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
        path = request.url.path
        # Don't pollute metrics with the health/metrics scrapers themselves.
        counted = path not in ("/api/health", "/api/metrics")
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
                    "path": path,
                    "duration_ms": duration_ms,
                    "user_id": getattr(request.state, "user_id", None),
                },
            )
            raise
        finally:
            if counted:
                metrics.inc("requests_total")
                if status_code >= 500:
                    metrics.inc("responses_5xx")
                elif status_code >= 400:
                    metrics.inc("responses_4xx")
            if path not in self._SKIP_PATHS:
                duration_ms = round((time.perf_counter() - start) * 1000, 2)
                logger.info(
                    "request",
                    extra={
                        "method": request.method,
                        "path": path,
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
app.include_router(submissions.router)

@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.get("/api/metrics")
def metrics_endpoint():
    """Aggregate counters since process start. Designed for Uptime Kuma keyword monitors:
    expect `"status":"ok"` in the body; fire alert if absent. See docs/DEPLOYMENT.md."""
    return metrics.snapshot()


# ─── Optional: serve a built React frontend (desktop / single-process mode) ───
# Mounted last so /api/* and /api/health win over SPA's catch-all.
if settings.SERVE_STATIC_PATH:
    import os
    from fastapi import HTTPException
    from fastapi.responses import FileResponse
    from fastapi.staticfiles import StaticFiles

    _static_dir = settings.SERVE_STATIC_PATH
    if not os.path.isdir(_static_dir):
        logger.warning(f"SERVE_STATIC_PATH set but not a directory: {_static_dir}")
    else:
        # Mount static assets (Vite hashed bundles, /pyodide/*, /assets/*, etc.)
        app.mount("/assets", StaticFiles(directory=os.path.join(_static_dir, "assets")), name="assets")
        if os.path.isdir(os.path.join(_static_dir, "pyodide")):
            app.mount("/pyodide", StaticFiles(directory=os.path.join(_static_dir, "pyodide")), name="pyodide")

        # SPA catch-all: any non-/api path returns index.html so React Router can handle it.
        @app.get("/{full_path:path}", include_in_schema=False)
        async def spa_fallback(full_path: str):
            if full_path.startswith("api/"):
                raise HTTPException(status_code=404)
            # Try a real file first (favicon, robots.txt, etc.)
            candidate = os.path.join(_static_dir, full_path)
            if full_path and os.path.isfile(candidate):
                return FileResponse(candidate)
            return FileResponse(os.path.join(_static_dir, "index.html"))

        logger.info(f"Serving frontend from {_static_dir}")
