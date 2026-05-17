"""Unit tests for backend/app/auth.py — password hashing, JWT, Fernet API key encryption."""
import time
from datetime import datetime, timedelta, timezone

import pytest
from fastapi import HTTPException
from jose import jwt

from app.auth import (
    _decode_token,
    create_access_token,
    create_password_reset_token,
    create_refresh_token,
    decode_password_reset_token,
    decrypt_api_key,
    encrypt_api_key,
    hash_password,
    verify_password,
)
from app.config import settings


# ─── Password hashing ───

def test_password_roundtrip():
    hashed = hash_password("hunter2")
    assert verify_password("hunter2", hashed) is True
    assert verify_password("wrong", hashed) is False


def test_password_bcrypt_72_byte_truncation():
    # bcrypt only considers the first 72 bytes — passwords that share the
    # first 72 bytes must match. Our _to_bytes truncates explicitly so this
    # is the documented behavior.
    base = "a" * 72
    hashed = hash_password(base)
    assert verify_password(base, hashed) is True
    assert verify_password(base + "extra", hashed) is True
    assert verify_password(base[:-1] + "b", hashed) is False


def test_verify_password_returns_false_on_garbage():
    # Must NOT raise — verify_password is on the auth hot path.
    assert verify_password("anything", "not-a-bcrypt-hash") is False
    assert verify_password("anything", "") is False


def test_password_hashes_are_unique_per_call():
    a = hash_password("same-input")
    b = hash_password("same-input")
    assert a != b  # different salt each time
    assert verify_password("same-input", a)
    assert verify_password("same-input", b)


# ─── JWT tokens ───

def test_access_token_roundtrip():
    token = create_access_token(42)
    assert _decode_token(token, "access") == 42


def test_refresh_token_roundtrip():
    token = create_refresh_token(99)
    assert _decode_token(token, "refresh") == 99


def test_access_token_rejected_as_refresh():
    token = create_access_token(1)
    with pytest.raises(HTTPException) as e:
        _decode_token(token, "refresh")
    assert e.value.status_code == 401
    assert "类型" in e.value.detail


def test_refresh_token_rejected_as_access():
    token = create_refresh_token(1)
    with pytest.raises(HTTPException) as e:
        _decode_token(token, "access")
    assert e.value.status_code == 401


def test_tampered_token_rejected():
    token = create_access_token(7)
    tampered = token[:-4] + "XXXX"
    with pytest.raises(HTTPException) as e:
        _decode_token(tampered, "access")
    assert e.value.status_code == 401


def test_token_signed_with_wrong_secret_rejected():
    expire = datetime.now(timezone.utc) + timedelta(minutes=5)
    bad = jwt.encode(
        {"sub": "1", "exp": expire, "type": "access"},
        "wrong-secret-key",
        algorithm=settings.JWT_ALGORITHM,
    )
    with pytest.raises(HTTPException) as e:
        _decode_token(bad, "access")
    assert e.value.status_code == 401


def test_expired_token_rejected():
    expired = datetime.now(timezone.utc) - timedelta(minutes=1)
    token = jwt.encode(
        {"sub": "1", "exp": expired, "type": "access"},
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
    with pytest.raises(HTTPException) as e:
        _decode_token(token, "access")
    assert e.value.status_code == 401


def test_token_missing_sub_rejected():
    expire = datetime.now(timezone.utc) + timedelta(minutes=5)
    token = jwt.encode(
        {"exp": expire, "type": "access"},
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
    with pytest.raises(HTTPException) as e:
        _decode_token(token, "access")
    assert e.value.status_code == 401


# ─── Fernet API key encryption ───

def test_encrypt_decrypt_roundtrip():
    plain = "sk-ant-api03-AAAAABBBBBCCCCC"
    enc = encrypt_api_key(plain)
    assert enc != plain
    assert enc.startswith("gAAAA")  # Fernet token marker
    assert decrypt_api_key(enc) == plain


def test_encrypt_empty_returns_empty():
    assert encrypt_api_key("") == ""
    assert decrypt_api_key("") == ""


def test_encrypt_produces_different_ciphertexts():
    # Fernet uses a random IV; same plaintext → different ciphertext each call.
    plain = "sk-test-key"
    assert encrypt_api_key(plain) != encrypt_api_key(plain)


def test_decrypt_garbage_returns_empty():
    # Must NOT raise — settings page calls decrypt on every load.
    assert decrypt_api_key("not-a-fernet-token") == ""
    assert decrypt_api_key("gAAAAA-but-still-invalid") == ""


# ─── Password reset tokens ───

def test_reset_token_roundtrip():
    pw_hash = hash_password("original-pw")
    token = create_password_reset_token(42, pw_hash)
    assert decode_password_reset_token(token, pw_hash) == 42


def test_reset_token_invalidated_after_password_change():
    """Single-use semantics: after the password hash changes, the old token
    can't decode — even within the 15min window."""
    old_hash = hash_password("old-pw")
    token = create_password_reset_token(7, old_hash)

    # Simulate the reset endpoint committing a new hash.
    new_hash = hash_password("new-pw")
    assert new_hash != old_hash

    with pytest.raises(HTTPException) as e:
        decode_password_reset_token(token, new_hash)
    assert e.value.status_code == 400


def test_reset_token_wrong_type_rejected():
    """An access token must NOT be accepted as a reset token even if signed
    with the same secret."""
    pw_hash = hash_password("pw")
    access = create_access_token(1)
    with pytest.raises(HTTPException) as e:
        decode_password_reset_token(access, pw_hash)
    assert e.value.status_code == 400


def test_reset_token_tampered_rejected():
    pw_hash = hash_password("pw")
    token = create_password_reset_token(1, pw_hash)
    tampered = token[:-4] + "XXXX"
    with pytest.raises(HTTPException) as e:
        decode_password_reset_token(tampered, pw_hash)
    assert e.value.status_code == 400


def test_reset_token_expired_rejected(monkeypatch):
    from app import auth as auth_mod

    pw_hash = hash_password("pw")
    # Issue a token "16 minutes ago" by patching datetime.now during creation.
    real_dt = auth_mod.datetime

    class FakeDT:
        @staticmethod
        def now(tz=None):
            return real_dt.now(tz) - real_dt.now(tz).replace(tzinfo=tz) + real_dt.now(tz)  # noop

    # Easier: directly build an expired payload.
    from datetime import datetime, timedelta, timezone
    from jose import jwt
    expired = jwt.encode(
        {
            "sub": "1",
            "exp": datetime.now(timezone.utc) - timedelta(minutes=1),
            "type": "password_reset",
            "ph": pw_hash[-16:],
        },
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
    with pytest.raises(HTTPException) as e:
        decode_password_reset_token(expired, pw_hash)
    assert e.value.status_code == 400
