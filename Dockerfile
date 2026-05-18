# ─────────────────────────────────────────────────────────────────────
# Single-image build for Fly.io / any single-container PaaS.
#
# Stage 1: build the React/Vite frontend (uses CDN Pyodide — smaller image).
# Stage 2: Python 3.12 runtime with FastAPI; serves the frontend dist
#          via the existing SERVE_STATIC_PATH branch in app/main.py.
#
# Local equivalent of `docker compose up` (dev) but condensed into ONE container
# suitable for Fly's single-process model.
# ─────────────────────────────────────────────────────────────────────

# ─── Stage 1: frontend builder ───
FROM node:20-alpine AS frontend-build
WORKDIR /build

# Build-time public values (Sentry DSN, Cloudflare beacon token).
# Both are "public secrets" — they end up in the browser bundle anyway, but
# we still pass them via build args so forks don't accidentally inherit
# coding-coach.org's Sentry/CF analytics. Forks get empty defaults → no
# telemetry. The owner sets them in GitHub repo secrets, CI passes via
# --build-arg.
ARG VITE_SENTRY_DSN=""
ARG VITE_CF_BEACON=""
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN \
    VITE_CF_BEACON=$VITE_CF_BEACON

# Cache deps layer
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund

# Build
COPY frontend/ ./
# We intentionally do NOT set VITE_PYODIDE_URL — let the bundle pull Pyodide
# from the public CDN at runtime, keeping the container image small.
RUN npm run build

# ─── Stage 2: Python backend + static frontend ───
FROM python:3.12-slim AS runtime

RUN useradd -m -u 1000 appuser

WORKDIR /app

# Backend deps
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Backend source
COPY backend/ ./

# Frontend dist baked in; backend will serve it via SERVE_STATIC_PATH.
COPY --from=frontend-build /build/dist /app/frontend_dist

RUN chown -R appuser:appuser /app
USER appuser

# Fly listens on internal_port set in fly.toml (we default to 8080).
ENV PORT=8080 \
    HOST=0.0.0.0 \
    SERVE_STATIC_PATH=/app/frontend_dist \
    LOG_FORMAT=json

EXPOSE 8080

# Single worker — Fly handles horizontal scaling via machines, not gunicorn workers.
# Adjust to gunicorn if you ever need request-level concurrency on one machine.
CMD ["sh", "-c", "uvicorn app.main:app --host ${HOST} --port ${PORT}"]
