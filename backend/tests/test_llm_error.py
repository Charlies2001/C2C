"""Unit tests for _format_llm_error — user-facing provider error mapping.

The function must never return raw stack traces or leak API keys; users see
the result in chat UI.
"""
import pytest

from app.services.ai_service import _format_llm_error


class FakeAPIError(Exception):
    def __init__(self, status_code: int, message: str = ""):
        super().__init__(message)
        self.status_code = status_code
        self.message = message


@pytest.mark.parametrize("code,keyword", [
    (401, "API Key"),
    (402, "余额"),
    (403, "权限"),
    (404, "模型"),
    (429, "频率"),
    (500, "暂时不可用"),
    (502, "暂时不可用"),
    (503, "暂时不可用"),
    (504, "暂时不可用"),
])
def test_known_status_codes_get_friendly_message(code, keyword):
    msg = _format_llm_error(FakeAPIError(code, "raw provider blob"))
    assert keyword in msg
    assert "raw provider blob" not in msg  # raw upstream text not echoed


def test_400_includes_truncated_message():
    msg = _format_llm_error(FakeAPIError(400, "missing required field 'model'"))
    assert "请求参数有误" in msg
    assert "missing required field" in msg


def test_unknown_status_falls_back_to_generic():
    msg = _format_llm_error(FakeAPIError(418, "I'm a teapot"))
    assert "AI 服务错误" in msg


def test_no_status_code_uses_generic_path():
    msg = _format_llm_error(ValueError("network blew up"))
    assert "AI 服务错误" in msg
    assert "network blew up" in msg


def test_api_key_in_error_redacted():
    leaked = "auth failed for key sk-ant-api03-AAAAABBBBBCCCCC1234567890XYZ"
    msg = _format_llm_error(FakeAPIError(400, leaked))
    assert "AAAAABBBBBCCCCC1234567890XYZ" not in msg
    assert "[REDACTED]" in msg


def test_long_message_truncated():
    # Both 400 (120 chars) and generic (80 chars) paths cap raw upstream text.
    huge = "x" * 500
    msg = _format_llm_error(FakeAPIError(400, huge))
    # Original 500 chars not preserved
    assert len(msg) < 200
