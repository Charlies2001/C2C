# CodingBot Production Optimization Milestones

> Created: 2026-04-23
> Status: Planning
> Target: Production-ready deployment

---

## Overview

| Phase | Name | Timeline | Goal |
|-------|------|----------|------|
| Phase 0 | Stability Hotfix (Done) | - | Memory leak, timeout, connection pool |
| Phase 1 | Security Foundation | Week 1-2 | Authentication, HTTPS, Key management |
| Phase 2 | Reliability & Observability | Week 3-4 | Database, error handling, logging |
| Phase 3 | Performance & UX | Week 5-6 | Bundle optimization, Pyodide safety |
| Phase 4 | Polish & Compliance | Week 7-8 | A11y, SEO, API versioning |

---

## Phase 0: Stability Hotfix (DONE)

> Goal: Fix long-running session crashes

| # | Task | File(s) | Status |
|---|------|---------|--------|
| 0.1 | LLM client singleton pool, avoid TCP leak | `backend/app/services/ai_service.py` | Done |
| 0.2 | LLM request timeout (stream 120s / call 60s) | `backend/app/services/ai_service.py` | Done |
| 0.3 | SQLite connection pool + WAL mode | `backend/app/database.py` | Done |
| 0.4 | AI concurrency limiter middleware (max 10) | `backend/app/main.py` | Done |
| 0.5 | Lifespan shutdown cleanup | `backend/app/main.py` | Done |
| 0.6 | Stream buffer size safety limit | `backend/app/services/ai_service.py` | Done |
| 0.7 | Frontend stream reader cleanup (readStream helper) | `frontend/src/api/ai.ts` | Done |
| 0.8 | AbortController for chat/hint requests | `AIChatPanel.tsx`, `ai.ts` | Done |
| 0.9 | Chat message limit (100) + localStorage cleanup | `frontend/src/store/useStore.ts` | Done |
| 0.10 | Reduce localStorage write frequency during streaming | `frontend/src/store/useStore.ts` | Done |
| 0.11 | CodeBlock setTimeout cleanup | `CodeBlock.tsx` | Done |

---

## Phase 1: Security Foundation

> Goal: Eliminate critical security vulnerabilities
> Priority: **BLOCKING** - must complete before any public deployment

### Milestone 1.1 - User Authentication System

| # | Task | Description | Effort | Dep |
|---|------|-------------|--------|-----|
| 1.1.1 | Choose auth strategy | JWT + refresh token vs OAuth 2.0 (Google/GitHub login) | Decision | - |
| 1.1.2 | Add `users` table | id, email, hashed_password, role, created_at, api_key_encrypted | S | - |
| 1.1.3 | Add auth dependencies | `python-jose[cryptography]`, `passlib[bcrypt]` to requirements.txt | XS | - |
| 1.1.4 | Implement auth module | `backend/app/auth.py`: JWT create/verify, password hash, `get_current_user` dependency | M | 1.1.2 |
| 1.1.5 | Add auth router | `backend/app/routers/auth.py`: POST /register, POST /login, POST /refresh, GET /me | M | 1.1.4 |
| 1.1.6 | Protect destructive endpoints | Add `Depends(get_current_user)` to DELETE/PUT in problems router | S | 1.1.4 |
| 1.1.7 | Protect AI endpoints | Add user dependency to all `/api/ai/*` routes | S | 1.1.4 |
| 1.1.8 | Frontend login page | Login/Register UI, token storage (httpOnly cookie preferred) | M | 1.1.5 |
| 1.1.9 | Frontend auth guard | ProtectedRoute component, auto-redirect to login | S | 1.1.8 |
| 1.1.10 | Logout + token refresh | Auto refresh before expiry, clear on logout | S | 1.1.8 |

**Acceptance Criteria:**
- [ ] Unauthenticated requests to protected endpoints return 401
- [ ] User can register, login, and access their own data
- [ ] JWT tokens expire and refresh correctly
- [ ] Passwords are bcrypt-hashed, never stored in plaintext

---

### Milestone 1.2 - API Key Server-Side Management

| # | Task | Description | Effort | Dep |
|---|------|-------------|--------|-----|
| 1.2.1 | Add encrypted key storage | `users.api_key_encrypted` field, use Fernet symmetric encryption | S | 1.1.2 |
| 1.2.2 | Key management endpoints | POST /api/user/api-key (save), DELETE /api/user/api-key (remove) | S | 1.2.1 |
| 1.2.3 | Refactor AI service config | `_resolve_provider_config` reads key from DB user record, not request body | M | 1.2.2 |
| 1.2.4 | Remove key from request payloads | Remove `provider_config.api_key` from all frontend API calls | S | 1.2.3 |
| 1.2.5 | Frontend settings page update | Settings page saves key via API, not localStorage | S | 1.2.4 |
| 1.2.6 | Cleanup migration | Remove `getProviderConfig()` from `frontend/src/api/ai.ts` | XS | 1.2.5 |

**Acceptance Criteria:**
- [ ] API keys never appear in frontend code, localStorage, or network requests
- [ ] Keys are encrypted at rest in database
- [ ] Users can update/delete their key through settings
- [ ] Backend resolves key from authenticated user context

---

### Milestone 1.3 - HTTPS + CORS + Security Headers

| # | Task | Description | Effort | Dep |
|---|------|-------------|--------|-----|
| 1.3.1 | TLS certificate | Obtain cert (Let's Encrypt / cloud provider managed) | S | - |
| 1.3.2 | nginx HTTPS config | Add SSL listener (443), HTTP->HTTPS redirect, TLS 1.2+ | M | 1.3.1 |
| 1.3.3 | Security headers in nginx | X-Frame-Options, X-Content-Type-Options, HSTS, CSP, Referrer-Policy, Permissions-Policy | S | 1.3.2 |
| 1.3.4 | CORS restrict to domain | Replace `allow_origins=["*"]` with actual frontend domain(s) | XS | 1.3.2 |
| 1.3.5 | Restrict CORS methods/headers | Only allow `["GET","POST","PUT","DELETE"]` and specific headers | XS | 1.3.4 |

**Acceptance Criteria:**
- [ ] All HTTP traffic redirects to HTTPS
- [ ] Browser shows padlock icon on all pages
- [ ] CORS rejects requests from unknown origins
- [ ] `curl -I` shows all 6 security headers
- [ ] SSL Labs test grades A or A+

---

### Milestone 1.4 - Docker Security Hardening

| # | Task | Description | Effort | Dep |
|---|------|-------------|--------|-----|
| 1.4.1 | Backend non-root user | Add `RUN useradd`, `USER appuser` to backend Dockerfile | XS | - |
| 1.4.2 | Frontend non-root user | Verify nginx runs as non-root in alpine image | XS | - |
| 1.4.3 | Pin base image digests | Use `python:3.12-slim@sha256:xxx` instead of tag-only | XS | - |
| 1.4.4 | .dockerignore | Exclude .env, .git, __pycache__, node_modules | XS | - |
| 1.4.5 | Read-only filesystem | Add `read_only: true` + tmpfs for /tmp in docker-compose | S | - |

**Acceptance Criteria:**
- [ ] `docker exec backend whoami` returns non-root user
- [ ] `.env` file not present inside built image
- [ ] Container cannot write to filesystem except designated volumes

---

## Phase 2: Reliability & Observability

> Goal: Production-grade database, logging, error handling
> Priority: HIGH - needed for stable operation

### Milestone 2.1 - PostgreSQL Migration

| # | Task | Description | Effort | Dep |
|---|------|-------------|--------|-----|
| 2.1.1 | Add PostgreSQL to docker-compose | `postgres:16-alpine` service with volume, healthcheck | S | - |
| 2.1.2 | Update requirements.txt | Add `psycopg2-binary>=2.9.0` or `asyncpg` | XS | - |
| 2.1.3 | Update database.py | Switch engine from SQLite to PostgreSQL connection string | S | 2.1.1 |
| 2.1.4 | Add Alembic migrations | `alembic init`, create initial migration from existing models | M | 2.1.3 |
| 2.1.5 | Data migration script | Export SQLite seed data -> PostgreSQL initial load | S | 2.1.4 |
| 2.1.6 | Remove SQLite-specific code | Remove `check_same_thread`, SQLite PRAGMA events | XS | 2.1.3 |
| 2.1.7 | Backup strategy | pg_dump cron job, retention policy (30 days) | S | 2.1.1 |

**Acceptance Criteria:**
- [ ] All CRUD operations work against PostgreSQL
- [ ] `alembic upgrade head` creates schema from scratch
- [ ] Automated daily backups with verified restore process
- [ ] 50 concurrent read requests complete in < 200ms

---

### Milestone 2.2 - Structured Logging

| # | Task | Description | Effort | Dep |
|---|------|-------------|--------|-----|
| 2.2.1 | Logging config module | `backend/app/logging_config.py`: JSON formatter, rotation (10MB x 10 files) | S | - |
| 2.2.2 | Request logging middleware | Log method, path, status, duration, user_id for every request | S | 2.2.1 |
| 2.2.3 | AI request logging | Log provider, model, token count, latency (mask API key) | S | 2.2.1 |
| 2.2.4 | Error logging | Capture full traceback on 500s, send to error tracker | S | 2.2.1 |
| 2.2.5 | Docker log driver | Configure `json-file` driver with max-size/max-file limits | XS | - |
| 2.2.6 | (Optional) Sentry integration | `sentry-sdk[fastapi]` for error tracking with alerting | M | - |

**Acceptance Criteria:**
- [ ] Every request produces a structured JSON log line
- [ ] Logs rotate automatically, no disk exhaustion
- [ ] API keys are masked in all log output (show last 4 chars only)
- [ ] 5xx errors trigger alert (if Sentry integrated)

---

### Milestone 2.3 - Error Handling & Resilience

| # | Task | Description | Effort | Dep |
|---|------|-------------|--------|-----|
| 2.3.1 | Global exception handler | FastAPI exception handler for unhandled errors -> 500 JSON response | S | - |
| 2.3.2 | Standardized error format | `{"success": false, "error": {"code": "...", "message": "..."}}` for all endpoints | M | - |
| 2.3.3 | Input validation hardening | Add `Field(max_length=...)` to all Pydantic models, enum for difficulty | S | - |
| 2.3.4 | React Error Boundary | `ErrorBoundary.tsx` wrapping App + ProblemPage + TeachingMode | M | - |
| 2.3.5 | Frontend error reporting | Catch unhandled rejections, report to backend `/api/client-errors` | S | 2.3.4 |
| 2.3.6 | Retry logic for transient failures | Frontend: retry AI requests once on network error (with backoff) | S | - |

**Acceptance Criteria:**
- [ ] No endpoint returns raw Python traceback to client
- [ ] All error responses follow standardized JSON format
- [ ] Frontend never shows white screen - always shows fallback UI
- [ ] Transient network errors are retried once before showing error

---

### Milestone 2.4 - Docker Infrastructure

| # | Task | Description | Effort | Dep |
|---|------|-------------|--------|-----|
| 2.4.1 | Health checks | Backend: curl `/api/health`, Frontend: curl `/`, DB: `pg_isready` | S | - |
| 2.4.2 | Restart policies | `restart: unless-stopped` for all services | XS | - |
| 2.4.3 | Resource limits | Backend: 1 CPU / 1GB RAM, Frontend: 0.5 CPU / 256MB RAM | XS | - |
| 2.4.4 | Environment file | `.env.production.example` with all required vars documented | S | - |
| 2.4.5 | Multi-stage build optimization | Minimize final image size (remove build tools, cache pip) | S | - |

**Acceptance Criteria:**
- [ ] `docker compose ps` shows health status for all services
- [ ] Killed container auto-restarts within 30s
- [ ] Container cannot exceed memory limit (OOM-killed instead)

---

## Phase 3: Performance & UX

> Goal: Fast load times, safe code execution
> Priority: MEDIUM - improves user experience significantly

### Milestone 3.1 - Frontend Bundle Optimization

| # | Task | Description | Effort | Dep |
|---|------|-------------|--------|-----|
| 3.1.1 | Route-level code splitting | `React.lazy` for ProblemPage, LandingPage, TeachingMode | M | - |
| 3.1.2 | Lazy load Monaco Editor | Dynamic import for `@monaco-editor/react` (only on problem page) | S | 3.1.1 |
| 3.1.3 | Lazy load Mermaid | Dynamic import in CodeBlock.tsx (only when mermaid block encountered) | S | - |
| 3.1.4 | Disable production sourcemaps | `build.sourcemap: false` in vite.config.ts | XS | - |
| 3.1.5 | Bundle analyzer | Add `rollup-plugin-visualizer`, audit chunks > 200KB | S | - |
| 3.1.6 | Loading skeleton | Suspense fallback with skeleton UI for lazy-loaded routes | S | 3.1.1 |

**Target Metrics:**
- [ ] Initial JS bundle < 500KB (gzipped)
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] TTI (Time to Interactive) < 3.5s

---

### Milestone 3.2 - Pyodide Web Worker Isolation

| # | Task | Description | Effort | Dep |
|---|------|-------------|--------|-----|
| 3.2.1 | Create Pyodide Worker | `frontend/src/workers/pyodide.worker.ts`: load + execute in isolated thread | L | - |
| 3.2.2 | Worker communication API | postMessage protocol: `{type: "run", code, timeout}` -> `{type: "result", output}` | M | 3.2.1 |
| 3.2.3 | Hard timeout enforcement | `worker.terminate()` after timeout, create new worker | S | 3.2.2 |
| 3.2.4 | Memory limit | Monitor worker memory, terminate if > 256MB | S | 3.2.2 |
| 3.2.5 | Update usePyodide hook | Replace direct Pyodide calls with Worker message passing | M | 3.2.2 |
| 3.2.6 | User feedback | Show "code execution timed out" / "memory limit exceeded" messages | S | 3.2.5 |

**Acceptance Criteria:**
- [ ] `while True: pass` does NOT freeze the browser tab
- [ ] `[0]*10**9` is terminated before browser OOM
- [ ] Code execution timeout shows user-friendly message
- [ ] Worker auto-recovers after termination (new worker created)

---

### Milestone 3.3 - Rate Limiting

| # | Task | Description | Effort | Dep |
|---|------|-------------|--------|-----|
| 3.3.1 | Add slowapi dependency | `slowapi>=0.1.9` in requirements.txt | XS | - |
| 3.3.2 | Per-user rate limits | AI endpoints: 20 req/min per user, problem CRUD: 60 req/min | S | 1.1.4 |
| 3.3.3 | Global rate limit | 200 req/min total across all users for AI endpoints | S | 3.3.2 |
| 3.3.4 | Cost tracking | Log estimated token usage per user per day | M | 2.2.3 |
| 3.3.5 | Frontend rate limit feedback | Show "too many requests, please wait" on 429 response | S | 3.3.2 |

**Acceptance Criteria:**
- [ ] Exceeding rate limit returns 429 with `Retry-After` header
- [ ] Rate limits are per-authenticated-user, not per-IP
- [ ] Daily cost per user is trackable from logs

---

## Phase 4: Polish & Compliance

> Goal: Accessibility, SEO, API maturity
> Priority: LOW - quality-of-life improvements

### Milestone 4.1 - Accessibility (a11y)

| # | Task | Description | Effort | Dep |
|---|------|-------------|--------|-----|
| 4.1.1 | Semantic HTML | Replace `<div>` with `<nav>`, `<main>`, `<article>`, `<aside>` where appropriate | M | - |
| 4.1.2 | ARIA labels | Add `aria-label` to all icon buttons, interactive elements | M | - |
| 4.1.3 | Keyboard navigation | Ensure Tab order is logical, Escape closes modals, Enter submits forms | M | - |
| 4.1.4 | Color-independent indicators | Add icons/text to test results (not just green/red) | S | - |
| 4.1.5 | Focus management | Auto-focus on modal open, return focus on close, focus trap in modals | S | - |
| 4.1.6 | Screen reader testing | Test with VoiceOver (macOS), document findings | M | 4.1.1-5 |

**Acceptance Criteria:**
- [ ] Lighthouse Accessibility score >= 90
- [ ] All interactive elements reachable via keyboard
- [ ] Screen reader can navigate all major features

---

### Milestone 4.2 - SEO & Meta

| # | Task | Description | Effort | Dep |
|---|------|-------------|--------|-----|
| 4.2.1 | Meta tags | Add description, keywords, og:title, og:description, og:image, theme-color | S | - |
| 4.2.2 | Dynamic page titles | Update `document.title` on route change (problem name, page name) | S | - |
| 4.2.3 | Favicon & manifest | Proper favicon set (16/32/192/512), PWA manifest.json | S | - |
| 4.2.4 | Robots.txt + sitemap | Static sitemap for public pages | XS | - |

---

### Milestone 4.3 - API Versioning & Documentation

| # | Task | Description | Effort | Dep |
|---|------|-------------|--------|-----|
| 4.3.1 | API version prefix | Migrate all routes from `/api/` to `/api/v1/` | S | - |
| 4.3.2 | nginx backwards compat | Proxy `/api/` -> `/api/v1/` for transition period | XS | 4.3.1 |
| 4.3.3 | OpenAPI documentation | Review auto-generated FastAPI docs, add descriptions, examples | M | - |
| 4.3.4 | Environment variable docs | Document all env vars with defaults and descriptions | S | - |

---

## Effort Legend

| Label | Meaning | Estimated Time |
|-------|---------|----------------|
| XS | Trivial | < 1 hour |
| S | Small | 1-4 hours |
| M | Medium | 4-12 hours |
| L | Large | 1-3 days |

---

## Dependency Graph (Critical Path)

```
Phase 1 (Security) ─────────────────────────────────────────────────
  1.1 Auth ──┬── 1.2 Key Management ──── Phase 2/3 features need auth
             ├── 1.3 HTTPS + CORS
             └── 1.4 Docker Security

Phase 2 (Reliability) ──────────────────────────────────────────────
  2.1 PostgreSQL ────── 2.4 Docker Infra
  2.2 Logging ─────┬── 2.3 Error Handling
                   └── 3.3 Rate Limiting (needs user identity from 1.1)

Phase 3 (Performance) ──────────────────────────────────────────────
  3.1 Bundle Optimization ───── independent
  3.2 Pyodide Worker ────────── independent
  3.3 Rate Limiting ─────────── depends on 1.1 (auth)

Phase 4 (Polish) ───────────────────────────────────────────────────
  4.1-4.3 ───── all independent, can parallelize
```

---

## Progress Tracker

| Phase | Total Tasks | Done | In Progress | Remaining | % Complete |
|-------|-------------|------|-------------|-----------|------------|
| Phase 0 | 11 | 11 | 0 | 0 | 100% |
| Phase 1 | 21 | 0 | 0 | 21 | 0% |
| Phase 2 | 18 | 0 | 0 | 18 | 0% |
| Phase 3 | 14 | 0 | 0 | 14 | 0% |
| Phase 4 | 14 | 0 | 0 | 14 | 0% |
| **Total** | **78** | **11** | **0** | **67** | **14%** |
