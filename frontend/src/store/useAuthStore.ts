import { create } from 'zustand';
import {
  login as apiLogin,
  register as apiRegister,
  fetchMe,
  clearTokens,
  getAccessToken,
  type UserInfo,
} from '../api/auth';

interface AuthState {
  user: UserInfo | null;
  loading: boolean;
  /** Try to restore session from stored token on app boot */
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nickname: string) => Promise<void>;
  logout: () => void;
  /** Refresh user info from server (e.g. after saving API key) */
  refreshUser: () => Promise<void>;

  // ─── Login gate (for guest-mode UX) ───
  showLoginGate: boolean;
  loginGateMessage: string;
  /** Returns true if the user is already logged in. Otherwise opens the login
   *  gate modal with the given message and returns false. Use at the entrance
   *  to any feature that requires server-side auth (AI calls, notebooks, etc.). */
  requireLogin: (message: string) => boolean;
  closeLoginGate: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  showLoginGate: false,
  loginGateMessage: '',
  requireLogin: (message) => {
    if (get().user) return true;
    set({ showLoginGate: true, loginGateMessage: message });
    return false;
  },
  closeLoginGate: () => set({ showLoginGate: false }),

  init: async () => {
    if (!getAccessToken()) {
      set({ user: null, loading: false });
      return;
    }
    try {
      const user = await fetchMe();
      set({ user, loading: false });
    } catch {
      clearTokens();
      set({ user: null, loading: false });
    }
  },

  login: async (email, password) => {
    await apiLogin(email, password);
    const user = await fetchMe();
    set({ user });
  },

  register: async (email, password, nickname) => {
    await apiRegister(email, password, nickname);
    const user = await fetchMe();
    set({ user });
  },

  logout: () => {
    clearTokens();
    set({ user: null });
    // Hard navigation so all in-memory state (useStore: chat / teaching /
    // hints / collections / etc.) is wiped — switching accounts in the same
    // tab otherwise leaves the previous user's chat panel etc. visible
    // until the next problemId change re-triggers a load.
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  },

  refreshUser: async () => {
    try {
      const user = await fetchMe();
      set({ user });
    } catch {
      // ignore
    }
  },
}));
