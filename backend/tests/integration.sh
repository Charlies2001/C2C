#!/usr/bin/env bash
# End-to-end integration smoke test for CodingBot backend.
# Starts a fresh backend against an isolated SQLite DB, runs auth + problems
# + logging assertions, tears down. Exits non-zero on any failure.
#
# Run from repo root OR from backend/:
#   bash backend/tests/integration.sh
#
# Requires: python3 (with project deps installed), sqlite3, curl, jq
set -euo pipefail

# ─── Setup ───
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TMP=$(mktemp -d -t codingbot-int-XXXXXX)
PORT=8789
DB="$TMP/test.db"
LOG_DIR="$TMP/logs"
PIDFILE="$TMP/backend.pid"
BASE="http://127.0.0.1:$PORT"
PASS=0
FAIL=0

cleanup() {
    if [[ -f "$PIDFILE" ]]; then
        kill "$(cat "$PIDFILE")" 2>/dev/null || true
        wait "$(cat "$PIDFILE")" 2>/dev/null || true
    fi
    rm -rf "$TMP"
}
trap cleanup EXIT

check() {
    local name="$1"; shift
    if "$@"; then
        echo "  ✓ $name"
        PASS=$((PASS+1))
    else
        echo "  ✗ $name"
        FAIL=$((FAIL+1))
    fi
}

http_status() {
    local method="$1" url="$2"; shift 2
    curl -sS -o /dev/null -w "%{http_code}" -X "$method" "$url" "$@"
}

# ─── Start backend ───
echo "▶ Starting backend on :$PORT with SQLite at $DB"
cd "$BACKEND_DIR"
mkdir -p "$LOG_DIR"

DATABASE_URL="sqlite:///$DB" \
JWT_SECRET_KEY="int-test-secret-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" \
ENCRYPTION_KEY="int-test-enc-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" \
ANTHROPIC_API_KEY="" \
ALLOW_ENV_KEY_FALLBACK="false" \
RATE_LIMIT_AI_PER_USER="3" \
RATE_LIMIT_AI_GLOBAL="100" \
LOG_FORMAT="json" LOG_LEVEL="INFO" LOG_DIR="$LOG_DIR" \
python3 -m uvicorn app.main:app --host 127.0.0.1 --port "$PORT" \
    > "$TMP/backend.log" 2>&1 &
echo $! > "$PIDFILE"

# Wait for readiness (suppress connection-refused noise while booting)
for i in {1..20}; do
    if curl -sS -o /dev/null "$BASE/api/health" 2>/dev/null; then break; fi
    sleep 0.3
done

# ─── 1. Health ───
echo "▶ health"
check "GET /api/health returns 200" \
    bash -c "[[ \$(curl -sS -o /dev/null -w '%{http_code}' '$BASE/api/health') == '200' ]]"

# ─── 2. Schema + seed ───
echo "▶ schema & seed"
check "alembic_version row present" \
    bash -c "sqlite3 '$DB' 'SELECT COUNT(*) FROM alembic_version' | grep -q '^1$'"
check "10 seed problems loaded" \
    bash -c "sqlite3 '$DB' 'SELECT COUNT(*) FROM problems' | grep -q '^10$'"

# ─── 3. Auth ───
echo "▶ auth"
REG=$(curl -sS -X POST "$BASE/api/auth/register" \
    -H "Content-Type: application/json" \
    -d '{"email":"int@test.com","password":"pass1234","nickname":"Int"}')
check "register returns access_token" \
    bash -c "echo '$REG' | jq -e '.access_token' > /dev/null"
ACCESS=$(echo "$REG" | jq -r '.access_token')
REFRESH=$(echo "$REG" | jq -r '.refresh_token')

check "duplicate register returns 409" \
    bash -c "[[ \$(curl -sS -o /dev/null -w '%{http_code}' -X POST '$BASE/api/auth/register' -H 'Content-Type: application/json' -d '{\"email\":\"int@test.com\",\"password\":\"pass1234\",\"nickname\":\"Dup\"}') == '409' ]]"
check "wrong password returns 401" \
    bash -c "[[ \$(curl -sS -o /dev/null -w '%{http_code}' -X POST '$BASE/api/auth/login' -H 'Content-Type: application/json' -d '{\"email\":\"int@test.com\",\"password\":\"wrong\"}') == '401' ]]"
check "login returns access_token" \
    bash -c "curl -sS -X POST '$BASE/api/auth/login' -H 'Content-Type: application/json' -d '{\"email\":\"int@test.com\",\"password\":\"pass1234\"}' | jq -e '.access_token' > /dev/null"
check "/me with token returns user" \
    bash -c "[[ \$(curl -sS '$BASE/api/auth/me' -H 'Authorization: Bearer $ACCESS' | jq -r '.email') == 'int@test.com' ]]"
check "/me without token returns 401" \
    bash -c "[[ \$(curl -sS -o /dev/null -w '%{http_code}' '$BASE/api/auth/me') == '401' ]]"
check "refresh returns new access_token" \
    bash -c "curl -sS -X POST '$BASE/api/auth/refresh' -H 'Content-Type: application/json' -d '{\"refresh_token\":\"$REFRESH\"}' | jq -e '.access_token' > /dev/null"
check "access token used as refresh returns 401" \
    bash -c "[[ \$(curl -sS -o /dev/null -w '%{http_code}' -X POST '$BASE/api/auth/refresh' -H 'Content-Type: application/json' -d '{\"refresh_token\":\"$ACCESS\"}') == '401' ]]"

# ─── 4. API Key encryption ───
echo "▶ api key (Fernet encryption)"
curl -sS -X PUT "$BASE/api/auth/api-key" \
    -H "Authorization: Bearer $ACCESS" -H "Content-Type: application/json" \
    -d '{"provider":"anthropic","api_key":"sk-test-secret-12345","model":"claude"}' > /dev/null
check "API key saved (has_api_key=true)" \
    bash -c "[[ \$(curl -sS '$BASE/api/auth/me' -H 'Authorization: Bearer $ACCESS' | jq -r '.has_api_key') == 'true' ]]"
check "DB stores ciphertext (Fernet prefix gAAAAA...)" \
    bash -c "sqlite3 '$DB' \"SELECT substr(api_key_encrypted,1,7) FROM user_api_keys\" | grep -q '^gAAAAA'"
check "DB does NOT contain plaintext key" \
    bash -c "! sqlite3 '$DB' 'SELECT api_key_encrypted FROM user_api_keys' | grep -q 'sk-test-secret'"
curl -sS -X DELETE "$BASE/api/auth/api-key" -H "Authorization: Bearer $ACCESS" > /dev/null
check "API key deleted (has_api_key=false)" \
    bash -c "[[ \$(curl -sS '$BASE/api/auth/me' -H 'Authorization: Bearer $ACCESS' | jq -r '.has_api_key') == 'false' ]]"

# ─── 4b. Multi-provider keys (Day 5 — #7) ───
echo "▶ multi-provider keys"
# Create key for anthropic via new endpoint
KID1=$(curl -sS -X POST "$BASE/api/auth/api-keys" \
    -H "Authorization: Bearer $ACCESS" -H "Content-Type: application/json" \
    -d '{"provider":"anthropic","api_key":"sk-ant-key1","model":"claude-sonnet-4-6","set_default":true}' | jq -r '.id')
check "POST /api/auth/api-keys creates key (returns id)" bash -c "[[ '$KID1' =~ ^[0-9]+$ ]]"
KID2=$(curl -sS -X POST "$BASE/api/auth/api-keys" \
    -H "Authorization: Bearer $ACCESS" -H "Content-Type: application/json" \
    -d '{"provider":"openai","api_key":"sk-oai-key2","model":"gpt-4o","set_default":false}' | jq -r '.id')
check "second POST for different provider creates separate key" bash -c "[[ '$KID2' =~ ^[0-9]+$ ]] && [[ '$KID1' != '$KID2' ]]"
check "GET /api/auth/api-keys returns both" \
    bash -c "[[ \$(curl -sS '$BASE/api/auth/api-keys' -H 'Authorization: Bearer $ACCESS' | jq 'length') == '2' ]]"
check "default flag survives round-trip" \
    bash -c "[[ \$(curl -sS '$BASE/api/auth/api-keys' -H 'Authorization: Bearer $ACCESS' | jq \".[] | select(.provider==\\\"anthropic\\\") | .is_default\") == 'true' ]]"
check "PUT default switches default to other key" \
    bash -c "curl -sS -o /dev/null -X PUT '$BASE/api/auth/api-keys/$KID2/default' -H 'Authorization: Bearer $ACCESS' && [[ \$(curl -sS '$BASE/api/auth/api-keys' -H 'Authorization: Bearer $ACCESS' | jq \".[] | select(.id==$KID2) | .is_default\") == 'true' ]] && [[ \$(curl -sS '$BASE/api/auth/api-keys' -H 'Authorization: Bearer $ACCESS' | jq \".[] | select(.id==$KID1) | .is_default\") == 'false' ]]"
check "DELETE removes one key" \
    bash -c "[[ \$(curl -sS -o /dev/null -w '%{http_code}' -X DELETE '$BASE/api/auth/api-keys/$KID1' -H 'Authorization: Bearer $ACCESS') == '204' ]] && [[ \$(curl -sS '$BASE/api/auth/api-keys' -H 'Authorization: Bearer $ACCESS' | jq 'length') == '1' ]]"
# Cleanup remaining key
curl -sS -X DELETE "$BASE/api/auth/api-keys/$KID2" -H "Authorization: Bearer $ACCESS" > /dev/null

# ─── 5. Problems CRUD ───
echo "▶ problems CRUD"
check "GET /api/problems/ returns 10 seed items" \
    bash -c "[[ \$(curl -sS '$BASE/api/problems/' | jq 'length') == '10' ]]"
check "GET /api/problems/1 returns title" \
    bash -c "curl -sS '$BASE/api/problems/1' | jq -e '.title' > /dev/null"
check "GET /api/problems/9999 returns 404" \
    bash -c "[[ \$(curl -sS -o /dev/null -w '%{http_code}' '$BASE/api/problems/9999') == '404' ]]"
check "POST /api/problems/ without auth returns 401" \
    bash -c "[[ \$(curl -sS -o /dev/null -w '%{http_code}' -X POST '$BASE/api/problems/' -H 'Content-Type: application/json' -d '{\"title\":\"x\",\"slug\":\"x\",\"difficulty\":\"Easy\",\"category\":\"array\",\"description\":\"d\",\"starter_code\":\"c\",\"test_cases\":[]}') == '401' ]]"
CREATED=$(curl -sS -X POST "$BASE/api/problems/" \
    -H "Authorization: Bearer $ACCESS" -H "Content-Type: application/json" \
    -d '{"title":"Int Test","slug":"int-test","difficulty":"Easy","category":"array","description":"d","starter_code":"c","test_cases":[{"input":"[1]","expected":"1"}]}')
NEW_ID=$(echo "$CREATED" | jq -r '.id')
check "POST /api/problems/ with auth returns id" \
    bash -c "[[ '$NEW_ID' =~ ^[0-9]+$ ]]"
check "POST duplicate slug returns 409" \
    bash -c "[[ \$(curl -sS -o /dev/null -w '%{http_code}' -X POST '$BASE/api/problems/' -H 'Authorization: Bearer $ACCESS' -H 'Content-Type: application/json' -d '{\"title\":\"D\",\"slug\":\"int-test\",\"difficulty\":\"Easy\",\"category\":\"array\",\"description\":\"d\",\"starter_code\":\"c\",\"test_cases\":[]}') == '409' ]]"
check "PUT rename persists" \
    bash -c "[[ \$(curl -sS -X PUT '$BASE/api/problems/$NEW_ID' -H 'Authorization: Bearer $ACCESS' -H 'Content-Type: application/json' -d '{\"title\":\"Int Renamed\"}' | jq -r '.title') == 'Int Renamed' ]]"
check "DELETE returns 204" \
    bash -c "[[ \$(curl -sS -o /dev/null -w '%{http_code}' -X DELETE '$BASE/api/problems/$NEW_ID' -H 'Authorization: Bearer $ACCESS') == '204' ]]"
check "GET deleted id returns 404" \
    bash -c "[[ \$(curl -sS -o /dev/null -w '%{http_code}' '$BASE/api/problems/$NEW_ID') == '404' ]]"

# ─── 6. Structured logging ───
echo "▶ logging"
LOG_FILE="$LOG_DIR/codingbot.log"
# Wait up to 5s for the log file to contain the request lines we expect.
# RotatingFileHandler is line-buffered, but on slower CI runners it can take
# a beat for the OS to actually flush (sleep 0.5 was enough on macOS, not Linux).
for _ in $(seq 1 25); do
    if [[ -f "$LOG_FILE" ]] && grep -q '"msg": "request"' "$LOG_FILE" \
        && grep -q '"path": "/api/auth/me"' "$LOG_FILE"; then
        break
    fi
    sleep 0.2
done

check "log file exists" \
    bash -c "[[ -f '$LOG_FILE' ]]"
check "log file contains JSON lines" \
    bash -c "head -1 '$LOG_FILE' | jq -e . > /dev/null"
check "request log has method/path/status/duration_ms" \
    bash -c "grep '\"msg\": \"request\"' '$LOG_FILE' | head -1 | jq -e '.method and .path and .status and .duration_ms' > /dev/null"
check "/api/health not logged as request (reduces noise)" \
    bash -c "! grep -q '\"path\": \"/api/health\"' '$LOG_FILE'"
check "authenticated request has user_id" \
    bash -c "grep '\"path\": \"/api/auth/me\"' '$LOG_FILE' | head -1 | jq -e '.user_id == 1' > /dev/null"
check "x-request-id header in response" \
    bash -c "curl -sS -D- '$BASE/api/problems/' -o /dev/null | grep -qi '^x-request-id:'"

# ─── 7. BYOK guards (Day 5 — #1, #3) ───
echo "▶ BYOK guards"
HINT_BODY='{"problem_context":{"title":"t","description":"d","code":"","output":"","testResults":"","difficulty":"Easy","starterCode":""},"previous_hints":[]}'
# #1: no key → 400 with Chinese message
RESP=$(curl -sS -o /dev/null -w "%{http_code}" -X POST "$BASE/api/ai/hint" \
    -H "Authorization: Bearer $ACCESS" -H "Content-Type: application/json" -d "$HINT_BODY")
check "no-key AI request returns 400" bash -c "[[ '$RESP' == '400' ]]"
DETAIL=$(curl -sS -X POST "$BASE/api/ai/hint" \
    -H "Authorization: Bearer $ACCESS" -H "Content-Type: application/json" -d "$HINT_BODY" | jq -r '.detail')
check "no-key error message is Chinese guidance" \
    bash -c "echo '$DETAIL' | grep -q '设置.*API Key'"

# #3: rate limit (RATE_LIMIT_AI_PER_USER=3 → 4th call should be 429).
# We've already made 2 hint calls above; do 2 more then expect 429.
curl -sS -o /dev/null -X POST "$BASE/api/ai/hint" \
    -H "Authorization: Bearer $ACCESS" -H "Content-Type: application/json" -d "$HINT_BODY"
LIMITED=$(curl -sS -o /dev/null -w "%{http_code}" -X POST "$BASE/api/ai/hint" \
    -H "Authorization: Bearer $ACCESS" -H "Content-Type: application/json" -d "$HINT_BODY")
check "exceeding per-user AI rate limit returns 429" bash -c "[[ '$LIMITED' == '429' ]]"
RA=$(curl -sS -D- -o /dev/null -X POST "$BASE/api/ai/hint" \
    -H "Authorization: Bearer $ACCESS" -H "Content-Type: application/json" -d "$HINT_BODY" \
    | tr -d '\r' | grep -i '^retry-after:' | awk '{print $2}')
check "429 response includes Retry-After header" bash -c "[[ '$RA' == '60' ]]"
# Sanity: non-AI endpoint not rate-limited
NON_AI=$(curl -sS -o /dev/null -w "%{http_code}" "$BASE/api/auth/me" -H "Authorization: Bearer $ACCESS")
check "non-AI endpoint not affected by AI rate limit" bash -c "[[ '$NON_AI' == '200' ]]"

# ─── 8. Notes + Notebooks ───
echo "▶ notes & notebooks"
check "GET note for un-noted problem returns empty content" \
    bash -c "[[ \$(curl -sS '$BASE/api/notes/1' -H 'Authorization: Bearer $ACCESS' | jq -r '.content') == '' ]]"
check "PUT note persists" \
    bash -c "curl -sS -o /dev/null -X PUT '$BASE/api/notes/1' -H 'Authorization: Bearer $ACCESS' -H 'Content-Type: application/json' -d '{\"content\":\"hash map\"}' && [[ \$(curl -sS '$BASE/api/notes/1' -H 'Authorization: Bearer $ACCESS' | jq -r '.content') == 'hash map' ]]"
NB_ID=$(curl -sS -X POST "$BASE/api/notebooks/" -H "Authorization: Bearer $ACCESS" -H "Content-Type: application/json" -d '{"name":"Test NB"}' | jq -r '.id')
check "POST /api/notebooks creates notebook" bash -c "[[ '$NB_ID' =~ ^[0-9]+$ ]]"
check "list notebooks returns at least 1" \
    bash -c "[[ \$(curl -sS '$BASE/api/notebooks/' -H 'Authorization: Bearer $ACCESS' | jq 'length') -ge 1 ]]"
ITEM_ID=$(curl -sS -X POST "$BASE/api/notebooks/$NB_ID/items" -H "Authorization: Bearer $ACCESS" -H "Content-Type: application/json" -d '{"problem_id":1,"include_answer":true,"answer_code":"pass","note":"easy"}' | jq -r '.id')
check "add problem to notebook returns item id" bash -c "[[ '$ITEM_ID' =~ ^[0-9]+$ ]]"
check "duplicate add returns 409" \
    bash -c "[[ \$(curl -sS -o /dev/null -w '%{http_code}' -X POST '$BASE/api/notebooks/'$NB_ID'/items' -H 'Authorization: Bearer $ACCESS' -H 'Content-Type: application/json' -d '{\"problem_id\":1,\"include_answer\":true}') == '409' ]]"
check "GET notebook detail includes joined problem title" \
    bash -c "[[ \$(curl -sS '$BASE/api/notebooks/'$NB_ID -H 'Authorization: Bearer $ACCESS' | jq -r '.items[0].problem_title') != '' ]]"
check "PUT item updates note + answer_code" \
    bash -c "curl -sS -o /dev/null -X PUT '$BASE/api/notebooks/'$NB_ID'/items/'$ITEM_ID -H 'Authorization: Bearer $ACCESS' -H 'Content-Type: application/json' -d '{\"note\":\"NEW\",\"answer_code\":\"def f(): pass\"}' && [[ \$(curl -sS '$BASE/api/notebooks/'$NB_ID -H 'Authorization: Bearer $ACCESS' | jq -r '.items[0].note') == 'NEW' ]]"
check "DELETE item removes it" \
    bash -c "curl -sS -o /dev/null -X DELETE '$BASE/api/notebooks/'$NB_ID'/items/'$ITEM_ID -H 'Authorization: Bearer $ACCESS' && [[ \$(curl -sS '$BASE/api/notebooks/'$NB_ID -H 'Authorization: Bearer $ACCESS' | jq '.items | length') == '0' ]]"
check "DELETE notebook returns 204" \
    bash -c "[[ \$(curl -sS -o /dev/null -w '%{http_code}' -X DELETE '$BASE/api/notebooks/'$NB_ID -H 'Authorization: Bearer $ACCESS') == '204' ]]"
check "GET deleted notebook returns 404" \
    bash -c "[[ \$(curl -sS -o /dev/null -w '%{http_code}' '$BASE/api/notebooks/'$NB_ID -H 'Authorization: Bearer $ACCESS') == '404' ]]"

# ─── Summary ───
echo
echo "────────────────────────────────────────"
echo "  PASS: $PASS    FAIL: $FAIL"
echo "────────────────────────────────────────"
if [[ $FAIL -gt 0 ]]; then
    echo "Integration tests failed. Backend log tail:"
    tail -40 "$TMP/backend.log"
    exit 1
fi
exit 0
