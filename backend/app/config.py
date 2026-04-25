import os
import secrets
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Database — for production set to PostgreSQL: postgresql://user:pass@host:5432/dbname
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./coding_bot.db")
    DB_POOL_SIZE: int = int(os.getenv("DB_POOL_SIZE", "5"))
    DB_MAX_OVERFLOW: int = int(os.getenv("DB_MAX_OVERFLOW", "10"))

    # BYOK model — users supply their own API keys via Settings.
    # ANTHROPIC_API_KEY is honored ONLY when ALLOW_ENV_KEY_FALLBACK=true.
    # Production MUST set ALLOW_ENV_KEY_FALLBACK=false (default) so the
    # platform never spends its own LLM tokens on user requests.
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    ALLOW_ENV_KEY_FALLBACK: bool = os.getenv("ALLOW_ENV_KEY_FALLBACK", "false").lower() == "true"
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

    # Rate limiting (DoS protection — BYOK means platform doesn't pay LLM tokens,
    # but still needs to protect own CPU/DB from runaway scripts).
    RATE_LIMIT_AI_PER_USER: int = int(os.getenv("RATE_LIMIT_AI_PER_USER", "60"))
    RATE_LIMIT_AI_GLOBAL: int = int(os.getenv("RATE_LIMIT_AI_GLOBAL", "500"))

    # Subscription
    TRIAL_DAYS: int = int(os.getenv("TRIAL_DAYS", "7"))
    SUBSCRIPTION_DAYS: int = int(os.getenv("SUBSCRIPTION_DAYS", "30"))
    # Mock /api/billing/upgrade endpoint — set true ONLY in dev/staging until a
    # real payment provider (Stripe / WeChat / Alipay) is wired up.
    ENABLE_MOCK_BILLING: bool = os.getenv("ENABLE_MOCK_BILLING", "false").lower() == "true"

    # Pricing — keep canonical price in cents to avoid float drift
    PLAN_MONTHLY_PRICE_CENTS: int = int(os.getenv("PLAN_MONTHLY_PRICE_CENTS", "2900"))  # ¥29.00

    # ─── Alipay ───
    # Empty values = provider disabled. /checkout returns 503 when called for it.
    ALIPAY_APP_ID: str = os.getenv("ALIPAY_APP_ID", "")
    ALIPAY_APP_PRIVATE_KEY: str = os.getenv("ALIPAY_APP_PRIVATE_KEY", "")  # PEM contents
    ALIPAY_PUBLIC_KEY: str = os.getenv("ALIPAY_PUBLIC_KEY", "")            # Alipay's pubkey for webhook verify
    ALIPAY_NOTIFY_URL: str = os.getenv("ALIPAY_NOTIFY_URL", "")             # https://your-domain/api/billing/alipay/notify
    ALIPAY_RETURN_URL: str = os.getenv("ALIPAY_RETURN_URL", "")             # browser redirect after pay (optional)
    ALIPAY_SANDBOX: bool = os.getenv("ALIPAY_SANDBOX", "false").lower() == "true"

    # ─── WeChat Pay v3 ───
    WECHAT_APP_ID: str = os.getenv("WECHAT_APP_ID", "")
    WECHAT_MCH_ID: str = os.getenv("WECHAT_MCH_ID", "")
    WECHAT_API_V3_KEY: str = os.getenv("WECHAT_API_V3_KEY", "")
    WECHAT_PRIVATE_KEY: str = os.getenv("WECHAT_PRIVATE_KEY", "")           # merchant PEM
    WECHAT_CERT_SERIAL_NO: str = os.getenv("WECHAT_CERT_SERIAL_NO", "")
    WECHAT_NOTIFY_URL: str = os.getenv("WECHAT_NOTIFY_URL", "")             # https://your-domain/api/billing/wechat/notify
    WECHAT_CERT_DIR: str = os.getenv("WECHAT_CERT_DIR", "")                 # cache dir for downloaded platform certs

    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT: str = os.getenv("LOG_FORMAT", "json")  # json | text
    LOG_DIR: str = os.getenv("LOG_DIR", "")  # empty = stdout only; otherwise write rotating files to this dir
    LOG_FILE_MAX_BYTES: int = int(os.getenv("LOG_FILE_MAX_BYTES", str(10 * 1024 * 1024)))
    LOG_FILE_BACKUP_COUNT: int = int(os.getenv("LOG_FILE_BACKUP_COUNT", "5"))

settings = Settings()
