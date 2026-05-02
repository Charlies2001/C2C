"""Centralized logging setup: JSON formatter, rotating files, contextvar request_id."""
import json
import logging
import os
import re
import sys
from contextvars import ContextVar
from datetime import datetime, timezone
from logging.handlers import RotatingFileHandler

from .config import settings


# ─── Sensitive value redaction ───
# Belt-and-suspenders: even if a contributor accidentally passes an API key into
# `logger.extra=...` or it shows up in a serialized exception, we mask it before
# it reaches stdout / the log file.
_SECRET_PATTERN = re.compile(
    r'\b(?:sk-(?:ant|proj|or)-[A-Za-z0-9_-]{10,}|sk-[A-Za-z0-9_-]{20,}|gAAAAA[A-Za-z0-9_=-]{40,})',
)


def _redact(value):
    """Recursively mask anything that looks like an API key or Fernet token."""
    if isinstance(value, str):
        return _SECRET_PATTERN.sub(lambda m: m.group(0)[:6] + '…[REDACTED]', value)
    if isinstance(value, dict):
        return {k: ('[REDACTED]' if k in {'api_key', 'api_key_encrypted', 'password', 'JWT_SECRET_KEY', 'ENCRYPTION_KEY'} else _redact(v)) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return type(value)(_redact(v) for v in value)
    return value

# Contextvar populated by RequestLoggingMiddleware; JsonFormatter pulls it into every record.
request_id_ctx: ContextVar[str] = ContextVar("request_id", default="")


_STANDARD_ATTRS = frozenset({
    "name", "msg", "args", "levelname", "levelno", "pathname", "filename",
    "module", "exc_info", "exc_text", "stack_info", "lineno", "funcName",
    "created", "msecs", "relativeCreated", "thread", "threadName",
    "processName", "process", "message", "asctime", "taskName",
    "color_message",  # uvicorn decorative duplicate of msg
})


class JsonFormatter(logging.Formatter):
    """Format log records as a single JSON line with contextvars and `extra` fields."""

    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "ts": datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "msg": _redact(record.getMessage()),
        }
        rid = request_id_ctx.get()
        if rid:
            payload["request_id"] = rid
        for key, value in record.__dict__.items():
            if key not in _STANDARD_ATTRS and not key.startswith("_"):
                payload[key] = _redact(value)
        if record.exc_info:
            payload["exc"] = _redact(self.formatException(record.exc_info))
        return json.dumps(payload, ensure_ascii=False, default=str)


class TextFormatter(logging.Formatter):
    """Human-readable formatter for dev — includes request_id if present."""

    def format(self, record: logging.LogRecord) -> str:
        base = super().format(record)
        rid = request_id_ctx.get()
        return f"[{rid}] {base}" if rid else base


def setup_logging() -> None:
    """Configure root logger per settings. Safe to call multiple times."""
    level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    formatter: logging.Formatter
    if settings.LOG_FORMAT == "json":
        formatter = JsonFormatter()
    else:
        formatter = TextFormatter(
            fmt="%(asctime)s %(levelname)s %(name)s %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )

    root = logging.getLogger()
    # Clear prior handlers (uvicorn installs its own; we take over).
    root.handlers.clear()
    root.setLevel(level)

    stdout_handler = logging.StreamHandler(sys.stdout)
    stdout_handler.setFormatter(formatter)
    root.addHandler(stdout_handler)

    if settings.LOG_DIR:
        os.makedirs(settings.LOG_DIR, exist_ok=True)
        file_handler = RotatingFileHandler(
            os.path.join(settings.LOG_DIR, "codingbot.log"),
            maxBytes=settings.LOG_FILE_MAX_BYTES,
            backupCount=settings.LOG_FILE_BACKUP_COUNT,
            encoding="utf-8",
        )
        file_handler.setFormatter(formatter)
        root.addHandler(file_handler)

    # Align uvicorn loggers with our formatter — propagate up to root.
    for name in ("uvicorn", "uvicorn.error", "uvicorn.access"):
        lg = logging.getLogger(name)
        lg.handlers.clear()
        lg.propagate = True
        lg.setLevel(level)

    # Silence access log — our RequestLoggingMiddleware emits structured request logs.
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
