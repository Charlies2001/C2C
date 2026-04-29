"""Desktop launcher: start backend + open default browser + system tray icon.

PyInstaller entry point. When frozen, the bundled frontend/dist and backend
package are inside `sys._MEIPASS`. User data (DB + logs) lives in
`~/.codingbot/` so they survive app updates.

The system-tray icon is the user's "this app is running" cue and the way to
quit (closing the browser tab does NOT stop the backend).
"""
from __future__ import annotations

import logging
import os
import socket
import sys
import threading
import time
import webbrowser
from pathlib import Path

# ─── Constants ───
APP_NAME = "CodingBot"
HOST = "127.0.0.1"
# Fixed so localStorage origin stays consistent across launches (port = origin part).
PORT = 17234


# ─── Paths ───

def _resource_dir() -> Path:
    """Where the bundled frontend/ and backend/ live.

    PyInstaller-frozen: sys._MEIPASS (a temp dir extracted at runtime).
    Dev mode: this file's parent's parent (repo root).
    """
    if getattr(sys, "frozen", False):
        return Path(sys._MEIPASS)  # type: ignore[attr-defined]
    return Path(__file__).resolve().parent.parent


def _user_data_dir() -> Path:
    """Per-OS conventional user data location for the SQLite DB + logs."""
    if sys.platform == "darwin":
        base = Path.home() / "Library" / "Application Support" / APP_NAME
    elif sys.platform == "win32":
        base = Path(os.environ.get("APPDATA", str(Path.home()))) / APP_NAME
    else:
        base = Path(os.environ.get("XDG_DATA_HOME", str(Path.home() / ".local" / "share"))) / APP_NAME
    base.mkdir(parents=True, exist_ok=True)
    return base


# ─── Single-instance guard ───

def _port_in_use(host: str, port: int) -> bool:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(0.3)
    try:
        return s.connect_ex((host, port)) == 0
    finally:
        s.close()


# ─── Backend bootstrap ───

def _start_backend() -> threading.Thread:
    """Spawn uvicorn in a daemon thread so the tray icon can run on the main thread."""
    res = _resource_dir()
    data = _user_data_dir()

    # Frontend bundle path — backend's StaticFiles will mount this.
    frontend_dist = res / "frontend" / "dist"
    db_path = data / "coding_bot.db"
    log_dir = data / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)

    env_overrides = {
        "DATABASE_URL": f"sqlite:///{db_path}",
        "SERVE_STATIC_PATH": str(frontend_dist),
        "LOG_DIR": str(log_dir),
        "LOG_FORMAT": "json",
        "CORS_ORIGINS": f"http://{HOST}:{PORT}",
        # Stable secrets per user (so JWTs survive across restarts).
        # Generated once and stored in the data dir.
        "JWT_SECRET_KEY": _ensure_secret(data / "jwt.key"),
        "ENCRYPTION_KEY": _ensure_secret(data / "encryption.key"),
    }
    os.environ.update(env_overrides)

    # When frozen, alembic.ini is bundled at <_MEIPASS>/backend/alembic.ini.
    # _run_alembic_upgrade in app.main hard-codes that path relative to app/main.py,
    # which works because backend/ is shipped as-is.
    sys.path.insert(0, str(res / "backend"))

    import uvicorn
    config = uvicorn.Config(
        "app.main:app",
        host=HOST,
        port=PORT,
        log_level="info",
        access_log=False,
    )
    server = uvicorn.Server(config)

    def run():
        try:
            server.run()
        except Exception as e:
            logging.exception("backend crashed: %s", e)

    t = threading.Thread(target=run, name="backend", daemon=True)
    t.start()
    return t


def _ensure_secret(path: Path) -> str:
    if path.exists():
        return path.read_text(encoding="utf-8").strip()
    import secrets
    val = secrets.token_urlsafe(32)
    path.write_text(val, encoding="utf-8")
    try:
        path.chmod(0o600)
    except OSError:
        pass
    return val


def _wait_until_ready(timeout_sec: float = 30.0) -> bool:
    """Poll the backend until /api/health returns 200, or timeout."""
    import urllib.request
    deadline = time.time() + timeout_sec
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(f"http://{HOST}:{PORT}/api/health", timeout=1) as r:
                if r.status == 200:
                    return True
        except Exception:
            time.sleep(0.3)
    return False


# ─── System tray ───

def _tray_icon_image():
    """Construct a simple icon at runtime so we don't need to ship a .ico/.png."""
    from PIL import Image, ImageDraw
    img = Image.new("RGB", (64, 64), color=(30, 30, 40))
    d = ImageDraw.Draw(img)
    # Violet gradient-ish circle
    d.ellipse((6, 6, 58, 58), fill=(124, 58, 237))
    # White "C"
    d.ellipse((18, 18, 46, 46), fill=(30, 30, 40))
    d.rectangle((34, 26, 50, 38), fill=(30, 30, 40))
    return img


def _open_in_browser():
    webbrowser.open(f"http://{HOST}:{PORT}/")


def _run_tray():
    import pystray
    icon = pystray.Icon(
        APP_NAME,
        _tray_icon_image(),
        APP_NAME,
        menu=pystray.Menu(
            pystray.MenuItem("打开 CodingBot", lambda _: _open_in_browser(), default=True),
            pystray.MenuItem("退出", lambda icon, _: icon.stop()),
        ),
    )
    icon.run()


# ─── Main ───

def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

    if _port_in_use(HOST, PORT):
        # Already running — just open the browser and exit silently.
        print(f"{APP_NAME} 已在运行，正在打开浏览器…")
        _open_in_browser()
        return 0

    print(f"启动 {APP_NAME} 后端…")
    _start_backend()
    if not _wait_until_ready():
        print("后端启动超时。请检查 ~/Library/Application Support/CodingBot/logs/", file=sys.stderr)
        return 1

    print(f"已就绪 → http://{HOST}:{PORT}/")
    _open_in_browser()
    _run_tray()  # blocks; closing tray exits the process
    return 0


if __name__ == "__main__":
    sys.exit(main())
