import { useAuthStore } from '../store/useAuthStore';

/**
 * localStorage key scoping helper.
 *
 * We previously stored user-private data under un-prefixed keys
 * (e.g. `chat_5`, `teaching_5`, `collections`, `user_profile`). When two
 * different users logged in on the same browser, the second user could see
 * the first user's chat history, teaching notes, collections, etc. This
 * helper namespaces those keys per logged-in user so they're properly
 * isolated.
 *
 * Use ONLY for user-private data. Do NOT use for:
 *   - Global UI prefs (`app_language`, `panel_width`)
 *   - Auth tokens (`auth_access_token`, `auth_refresh_token`)
 *
 * Includes a one-time migration: the first user to log in after this
 * helper ships claims all pre-existing un-prefixed keys. That preserves
 * data on personal devices (overwhelmingly common case) while still
 * making subsequent logins isolated.
 */

const GUEST_PREFIX = '_pre_';

const LEGACY_KEYS_SINGLE = ['collections', 'tree_progress', 'user_profile'];
const LEGACY_KEY_PATTERNS = [/^chat_/, /^teaching_/, /^hints_/];

let migrationDone = false;

function _migrateOne(key: string, userId: number) {
  const namespaced = `u${userId}_${key}`;
  if (localStorage.getItem(namespaced) !== null) return;
  const legacy = localStorage.getItem(key);
  if (legacy === null) return;
  try {
    localStorage.setItem(namespaced, legacy);
    localStorage.removeItem(key);
  } catch {
    // localStorage quota — skip, the legacy key stays. We'll just lose this
    // entry on the next read since callers go through userKey().
  }
}

function maybeMigrate(userId: number) {
  if (migrationDone) return;
  migrationDone = true;
  for (const key of LEGACY_KEYS_SINGLE) {
    _migrateOne(key, userId);
  }
  // Per-problem keys: collect first, then mutate (avoid iterating-while-modifying).
  const matches: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && LEGACY_KEY_PATTERNS.some((re) => re.test(k))) matches.push(k);
  }
  for (const k of matches) _migrateOne(k, userId);
}

export function userKey(key: string): string {
  const userId = useAuthStore.getState().user?.id;
  if (!userId) return `${GUEST_PREFIX}${key}`;
  maybeMigrate(userId);
  return `u${userId}_${key}`;
}

/**
 * Iterate localStorage keys matching a user-scoped prefix (without the
 * "u<userId>_" prefix). Used by cleanup routines.
 *
 * Returns the FULL keys (with the user prefix), suitable for direct
 * `localStorage.removeItem(...)` calls.
 */
export function listUserKeysWithPrefix(prefix: string): string[] {
  const userId = useAuthStore.getState().user?.id;
  const fullPrefix = userId ? `u${userId}_${prefix}` : `${GUEST_PREFIX}${prefix}`;
  const out: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(fullPrefix)) out.push(k);
  }
  return out;
}
