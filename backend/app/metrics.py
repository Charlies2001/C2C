"""In-memory metrics counters. Plain Python dict — single-process, async-safe enough.

Exported as JSON via /api/metrics. Designed so an external monitor (Uptime Kuma,
Grafana, etc.) can either:
- Keyword-match the response body for thresholds (Kuma's "Keyword" monitor)
- Poll periodically and chart the deltas (Prometheus, Grafana Cloud)

Counters reset on process restart by design — for long-term retention point a
real time-series store at this endpoint and scrape on a schedule.
"""
from __future__ import annotations

import threading
import time

_lock = threading.Lock()
_started_at = time.time()

# Monotonic counters since process start.
_counters: dict[str, int] = {
    "requests_total": 0,
    "responses_5xx": 0,
    "responses_4xx": 0,
    "ai_calls_total": 0,
    "ai_calls_failed": 0,
    "ai_cache_read_tokens": 0,
    "ai_cache_write_tokens": 0,
}


def inc(key: str, by: int = 1) -> None:
    """Increment a counter. Creates the key if absent."""
    with _lock:
        _counters[key] = _counters.get(key, 0) + by


def snapshot() -> dict:
    """Return a copy of all counters plus uptime + cache-hit ratio."""
    with _lock:
        c = dict(_counters)
    uptime = time.time() - _started_at
    cache_total = c.get("ai_cache_read_tokens", 0) + c.get("ai_cache_write_tokens", 0)
    cache_hit_ratio = (
        c.get("ai_cache_read_tokens", 0) / cache_total if cache_total > 0 else 0.0
    )
    ai_total = c.get("ai_calls_total", 0)
    ai_failure_ratio = (
        c.get("ai_calls_failed", 0) / ai_total if ai_total > 0 else 0.0
    )
    return {
        **c,
        "uptime_seconds": round(uptime, 1),
        "ai_cache_hit_ratio": round(cache_hit_ratio, 4),
        "ai_failure_ratio": round(ai_failure_ratio, 4),
        # `status` is a stable keyword Kuma's keyword monitor can match on:
        # `"status":"ok"` = healthy; anything else = the monitor fires.
        "status": "ok",
    }
