# PyInstaller spec for the CodingBot desktop launcher.
# Build with:   pyinstaller desktop/launcher.spec --noconfirm --clean
# Output:       dist/CodingBot/  (folder bundle) + dist/CodingBot.app (macOS only)
import sys
from pathlib import Path

REPO = Path(SPECPATH).resolve().parent

# ─── Files we ship inside the bundle ───
datas = [
    # React build output (must run `npm run build:desktop` first)
    (str(REPO / 'frontend' / 'dist'), 'frontend/dist'),
    # Backend package (Python source — uvicorn imports it via app.main:app)
    (str(REPO / 'backend' / 'app'), 'backend/app'),
    # Alembic migrations + config
    (str(REPO / 'backend' / 'alembic'), 'backend/alembic'),
    (str(REPO / 'backend' / 'alembic.ini'), 'backend'),
]

# Modules that PyInstaller's static analysis tends to miss.
hiddenimports = [
    # FastAPI / Starlette
    'fastapi',
    'fastapi.middleware',
    'fastapi.middleware.cors',
    'fastapi.staticfiles',
    'fastapi.responses',
    'starlette',
    'starlette.middleware',
    'starlette.middleware.cors',
    'starlette.middleware.base',
    'starlette.staticfiles',
    'starlette.responses',
    'email_validator',
    # uvicorn startup
    'uvicorn.logging',
    'uvicorn.loops',
    'uvicorn.loops.auto',
    'uvicorn.protocols',
    'uvicorn.protocols.http',
    'uvicorn.protocols.http.auto',
    'uvicorn.protocols.websockets',
    'uvicorn.protocols.websockets.auto',
    'uvicorn.lifespan',
    'uvicorn.lifespan.on',
    # Auth / crypto
    'bcrypt',
    'jose.backends.cryptography_backend',
    'cryptography',
    # SQLAlchemy dialects
    'sqlalchemy.dialects.sqlite',
    'sqlalchemy.dialects.postgresql',
    # Alembic
    'alembic.runtime.migration',
    'alembic.ddl.sqlite',
    'alembic.ddl.postgresql',
    # Routers / models loaded by name
    'app.routers.ai',
    'app.routers.auth',
    'app.routers.notebooks',
    'app.routers.notes',
    'app.routers.problems',
    'app.models.user',
    'app.models.problem',
    'app.models.api_key',
    'app.models.note',
    'app.models.notebook',
    # AI providers
    'anthropic',
    'openai',
]

block_cipher = None

a = Analysis(
    [str(REPO / 'desktop' / 'launcher.py')],
    pathex=[str(REPO / 'backend')],
    binaries=[],
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        # Heavy deps we don't use in the desktop bundle
        'matplotlib',
        'IPython',
        'jupyter',
        'tkinter',
        'pytest',
        'psycopg2',  # users will only use sqlite from desktop
    ],
    noarchive=False,
)
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='CodingBot',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    # Keep console attached during initial bring-up so we can see startup errors.
    # Flip to False once stable; macOS .app bundle doesn't show a console regardless.
    console=True,
    disable_windowed_traceback=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=False,
    upx_exclude=[],
    name='CodingBot',
)

# macOS: also produce a proper .app bundle
if sys.platform == 'darwin':
    app = BUNDLE(
        coll,
        name='CodingBot.app',
        icon=None,  # TODO: add a real icon (.icns)
        bundle_identifier='com.codingbot.app',
        info_plist={
            'CFBundleShortVersionString': '0.1.0',
            'CFBundleVersion': '0.1.0',
            'NSHighResolutionCapable': True,
            # Keep menu bar / Dock icon hidden — we use a system tray icon instead.
            'LSUIElement': True,
        },
    )
