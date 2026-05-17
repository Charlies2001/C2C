"""Unit tests for backend/app/logging_config.py — secret redaction.

These are belt-and-suspenders defenses: if a developer accidentally logs a key
or a provider error leaks a token, redaction must mask it before stdout/file.
"""
from app.logging_config import _redact


def test_anthropic_key_redacted_in_string():
    s = "calling provider with sk-ant-api03-AAAAABBBBBCCCCCDDDDDD12345"
    out = _redact(s)
    assert "AAAAABBBBBCCCCCDDDDDD12345" not in out
    assert "[REDACTED]" in out
    assert "sk-ant" in out  # first 6 chars are kept for debuggability


def test_openai_project_key_redacted():
    s = "key: sk-proj-XYZ123abcdef456789ghijklmnop"
    out = _redact(s)
    assert "XYZ123abcdef456789ghijklmnop" not in out
    assert "[REDACTED]" in out


def test_openrouter_key_redacted():
    s = "header: sk-or-v1-abcdefghijklmnopqrstuvwxyz0123456789"
    out = _redact(s)
    assert "abcdefghijklmnopqrstuvwxyz0123456789" not in out
    assert "[REDACTED]" in out


def test_fernet_token_redacted():
    # Fernet tokens begin with "gAAAAA" after base64 encoding
    s = "stored: gAAAAABoeXampleTokenContentVeryLongString12345678ABCDEF"
    out = _redact(s)
    assert "ABCDEF" not in out
    assert "[REDACTED]" in out


def test_non_secret_string_unchanged():
    s = "Hello world, no keys here. sk-short"  # too short to match
    assert _redact(s) == s


def test_dict_password_field_fully_redacted():
    d = {"username": "alice", "password": "hunter2", "api_key": "anything"}
    out = _redact(d)
    assert out["username"] == "alice"
    assert out["password"] == "[REDACTED]"
    assert out["api_key"] == "[REDACTED]"


def test_dict_jwt_secret_field_redacted():
    d = {"JWT_SECRET_KEY": "secret-value-here", "ENCRYPTION_KEY": "another-secret"}
    out = _redact(d)
    assert out["JWT_SECRET_KEY"] == "[REDACTED]"
    assert out["ENCRYPTION_KEY"] == "[REDACTED]"


def test_nested_dict_redacted_recursively():
    d = {"meta": {"trace": "sk-ant-api03-AAAAABBBBBCCCCC12345678"}}
    out = _redact(d)
    assert "[REDACTED]" in out["meta"]["trace"]


def test_list_of_strings_redacted():
    items = ["normal log line", "leaked sk-ant-api03-AAAAABBBBB1234567890XX"]
    out = _redact(items)
    assert out[0] == "normal log line"
    assert "[REDACTED]" in out[1]


def test_non_string_non_collection_passthrough():
    assert _redact(42) == 42
    assert _redact(None) is None
    assert _redact(3.14) == 3.14
