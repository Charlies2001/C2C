import os
import secrets
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Database — for production set to PostgreSQL: postgresql://user:pass@host:5432/dbname
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./coding_bot.db")
    DB_POOL_SIZE: int = int(os.getenv("DB_POOL_SIZE", "5"))
    DB_MAX_OVERFLOW: int = int(os.getenv("DB_MAX_OVERFLOW", "10"))

    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    SEED_LANGUAGE: str = os.getenv("SEED_LANGUAGE", "zh-CN")

    # Auth
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", secrets.token_urlsafe(32))
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRE_DAYS", "7"))

    # Encryption key for API keys stored in DB
    ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", "")

    # CORS — comma-separated allowed origins (e.g. "https://c2c.example.com,http://localhost:3000")
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001,http://localhost:5173")

    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT: str = os.getenv("LOG_FORMAT", "json")  # json | text
    LOG_DIR: str = os.getenv("LOG_DIR", "")  # empty = stdout only; otherwise write rotating files to this dir
    LOG_FILE_MAX_BYTES: int = int(os.getenv("LOG_FILE_MAX_BYTES", str(10 * 1024 * 1024)))
    LOG_FILE_BACKUP_COUNT: int = int(os.getenv("LOG_FILE_BACKUP_COUNT", "5"))

settings = Settings()
