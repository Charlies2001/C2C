"""Monthly subscription state machine.

Plans:
- trial   — set on register, lasts settings.TRIAL_DAYS (default 7)
- active  — set after successful payment, lasts until subscription_ends_at
- expired — derived in code when both trial_ends_at and subscription_ends_at are past

A user is "entitled" (can call paid features) when EITHER the trial OR the
subscription has not expired yet. The DB-stored `plan` field is informational;
the source of truth is the timestamps.
"""
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException

from .auth import get_current_user
from .config import settings
from .models.user import User


def _now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def grant_trial(user: User, days: int | None = None) -> None:
    """Mutate user in place to start a fresh trial. Caller must commit."""
    user.plan = "trial"
    user.trial_ends_at = _now() + timedelta(days=days or settings.TRIAL_DAYS)


def grant_subscription(user: User, days: int = 30) -> None:
    """Mutate user in place to extend an active subscription. Caller must commit.

    If user already has an active subscription, the new period stacks on top of
    the remaining time so paying users never lose days mid-cycle.
    """
    base = user.subscription_ends_at if user.subscription_ends_at and user.subscription_ends_at > _now() else _now()
    user.plan = "active"
    user.subscription_ends_at = base + timedelta(days=days)


def is_entitled(user: User) -> bool:
    """True if the user can use paid features right now."""
    now = _now()
    if user.subscription_ends_at and user.subscription_ends_at > now:
        return True
    if user.trial_ends_at and user.trial_ends_at > now:
        return True
    return False


def entitlement_status(user: User) -> dict:
    """Snapshot for /api/billing/me."""
    now = _now()
    sub_active = user.subscription_ends_at and user.subscription_ends_at > now
    trial_active = user.trial_ends_at and user.trial_ends_at > now
    if sub_active:
        status = "active"
    elif trial_active:
        status = "trial"
    else:
        status = "expired"
    return {
        "status": status,
        "plan": user.plan,
        "trial_ends_at": user.trial_ends_at.isoformat() if user.trial_ends_at else None,
        "subscription_ends_at": user.subscription_ends_at.isoformat() if user.subscription_ends_at else None,
        "entitled": status != "expired",
    }


def require_entitlement(user: User = Depends(get_current_user)) -> User:
    """FastAPI dependency: 402 Payment Required if user's trial+subscription have expired."""
    if not is_entitled(user):
        raise HTTPException(
            status_code=402,
            detail="试用期已结束，请升级订阅以继续使用 AI 功能",
        )
    return user
