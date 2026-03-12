import copy
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import engine, SessionLocal, Base
from .models.problem import Problem
from .routers import problems, ai
from .seed.problems import SEED_PROBLEMS


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


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Problem).count() == 0:
            seeds = _get_localized_seeds(settings.SEED_LANGUAGE)
            for p in seeds:
                db.add(Problem(**p))
            db.commit()
    finally:
        db.close()
    yield

app = FastAPI(title="CodingBot API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(problems.router)
app.include_router(ai.router)

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
