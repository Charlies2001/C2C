import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./coding_bot.db")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    SEED_LANGUAGE: str = os.getenv("SEED_LANGUAGE", "zh-CN")

settings = Settings()
