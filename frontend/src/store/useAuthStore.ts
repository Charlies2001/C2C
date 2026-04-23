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
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

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
