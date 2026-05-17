"""Unit tests for backend/app/rate_limit.py — fixed window per-key limiter."""
import asyncio

import pytest

from app import rate_limit
from app.rate_limit import FixedWindowRateLimiter


async def test_allows_up_to_max_then_blocks():
    rl = FixedWindowRateLimiter(max_per_minute=3)
    assert await rl.try_acquire("user-a") is True
    assert await rl.try_acquire("user-a") is True
    assert await rl.try_acquire("user-a") is True
    assert await rl.try_acquire("user-a") is False
    assert await rl.try_acquire("user-a") is False


async def test_keys_are_independent():
    rl = FixedWindowRateLimiter(max_per_minute=1)
    assert await rl.try_acquire("user-a") is True
    assert await rl.try_acquire("user-a") is False
    # different key has its own bucket
    assert await rl.try_acquire("user-b") is True


async def test_window_resets_after_60_seconds(monkeypatch):
    """After the 60s window elapses, counter resets."""
    rl = FixedWindowRateLimiter(max_per_minute=2)

    fake_time = [1000.0]
    monkeypatch.setattr(rate_limit.time, "monotonic", lambda: fake_time[0])

    assert await rl.try_acquire("u") is True
    assert await rl.try_acquire("u") is True
    assert await rl.try_acquire("u") is False

    # advance past the window
    fake_time[0] += 61.0
    assert await rl.try_acquire("u") is True
    assert await rl.try_acquire("u") is True
    assert await rl.try_acquire("u") is False


async def test_within_window_does_not_reset(monkeypatch):
    rl = FixedWindowRateLimiter(max_per_minute=1)

    fake_time = [1000.0]
    monkeypatch.setattr(rate_limit.time, "monotonic", lambda: fake_time[0])

    assert await rl.try_acquire("u") is True
    fake_time[0] += 30.0  # halfway through window
    assert await rl.try_acquire("u") is False
    fake_time[0] += 29.0  # 59s elapsed
    assert await rl.try_acquire("u") is False


async def test_concurrent_acquires_respect_limit():
    """Lock prevents the limit being breached under concurrent acquire."""
    rl = FixedWindowRateLimiter(max_per_minute=10)

    results = await asyncio.gather(*[rl.try_acquire("k") for _ in range(50)])
    assert sum(1 for r in results if r) == 10
    assert sum(1 for r in results if not r) == 40
