const BASE_URL = '/api/auth';

export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

export interface UserInfo {
  id: number;
  email: string;
  nickname: string;
  role: string;
  ai_provider: string;
  ai_model: string;
  has_api_key: boolean;
}

// ─── Token storage ───

const ACCESS_KEY = 'auth_access_token';
const REFRESH_KEY = 'auth_refresh_token';

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

function saveTokens(tokens: TokenPair) {
  localStorage.setItem(ACCESS_KEY, tokens.access_token);
  localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

// ─── Authenticated fetch wrapper ───

let _refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  const rt = getRefreshToken();
  if (!rt) return false;
  try {
    const res = await fetch(`${BASE_URL}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: rt }),
    });
    if (!res.ok) return false;
    const data: TokenPair = await res.json();
    saveTokens(data);
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetch wrapper that adds Authorization header and auto-refreshes on 401.
 */
export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = getAccessToken();
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let res = await fetch(input, { ...init, headers });

  if (res.status === 401 && getRefreshToken()) {
    // Deduplicate concurrent refresh attempts
    if (!_refreshPromise) {
      _refreshPromise = tryRefresh().finally(() => { _refreshPromise = null; });
    }
    const ok = await _refreshPromise;
    if (ok) {
      const newToken = getAccessToken();
      headers.set('Authorization', `Bearer ${newToken}`);
      res = await fetch(input, { ...init, headers });
    }
  }

  return res;
}

// ─── Auth API ───

export async function register(email: string, password: string, nickname: string): Promise<TokenPair> {
  const res = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, nickname }),
  });
  if (res.status === 409) throw new Error('该邮箱已注册');
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || '注册失败');
  }
  const tokens: TokenPair = await res.json();
  saveTokens(tokens);
  return tokens;
}

export async function login(email: string, password: string): Promise<TokenPair> {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (res.status === 401) throw new Error('邮箱或密码错误');
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || '登录失败');
  }
  const tokens: TokenPair = await res.json();
  saveTokens(tokens);
  return tokens;
}

export async function fetchMe(): Promise<UserInfo> {
  const res = await authFetch(`${BASE_URL}/me`);
  if (!res.ok) throw new Error('未登录');
  return res.json();
}

export async function saveApiKey(provider: string, apiKey: string, model: string): Promise<void> {
  const res = await authFetch(`${BASE_URL}/api-key`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, api_key: apiKey, model }),
  });
  if (!res.ok) throw new Error('保存失败');
}

export async function deleteApiKey(): Promise<void> {
  const res = await authFetch(`${BASE_URL}/api-key`, { method: 'DELETE' });
  if (!res.ok) throw new Error('删除失败');
}
