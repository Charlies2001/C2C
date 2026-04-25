"""In-memory fixed-window rate limiter.

Single-instance only — for multi-instance deployment, swap for Redis-backed
slowapi or similar. Suitable for protecting the platform from DoS, NOT for
billing/quota enforcement (that should live closer to the LLM call).
"""
import asyncio
import time

from .config import settings


class FixedWindowRateLimiter:
    """Per-key fixed-window counter. Coarse but cheap and stateless across restart.

    `max_per_minute` requests allowed in any rolling 60-second window
    (window resets atomically when the previous one expires).
    """

    def __init__(self, max_per_minute: int):
        self.max = max_per_minute
        self.window = 60.0
        self._counts: dict[str, tuple[float, int]] = {}
        self._lock = asyncio.Lock()

    async def try_acquire(self, key: str) -> bool:
        async with self._lock:
            now = time.monotonic()
            window_start, count = self._counts.get(key, (now, 0))
            if now - window_start >= self.window:
                window_start = now
                count = 0
            if count >= self.max:
                self._counts[key] = (window_start, count)
                return False
            self._counts[key] = (window_start, count + 1)
            # Periodic GC of stale entries
            if len(self._counts) > 10000:
                cutoff = now - self.window
                self._counts = {k: v for k, v in self._counts.items() if v[0] >= cutoff}
            return True


# AI endpoints: protect platform CPU + DB + each user's account from runaway scripts.
# Limits are intentionally generous — BYOK means each user spends their own LLM tokens,
# so this is DoS protection, not billing enforcement.
ai_user_limiter = FixedWindowRateLimiter(max_per_minute=settings.RATE_LIMIT_AI_PER_USER)
ai_global_limiter = FixedWindowRateLimiter(max_per_minute=settings.RATE_LIMIT_AI_GLOBAL)
