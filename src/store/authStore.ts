import { create } from "zustand";

import type { Role } from "@/api/types";

/**
 * The session, in memory only (D16).
 *
 * Audit 7.3 found both JWTs in localStorage. The access token now lives here
 * and nowhere else: a reload loses it and the client silently refreshes from
 * the httpOnly cookie, which no script can read. Nothing in this store is
 * persisted.
 */

export interface User {
  id?: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active?: boolean;
  is_staff?: boolean;
  date_joined?: string;
  role?: Role;
  is_deleted?: boolean;
  is_simulated?: boolean;
  deleted_at?: string;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  /** True once a token is held; the profile may still be loading. */
  isAuthenticated: boolean;
  /** True while the first silent refresh is in flight. */
  isLoading: boolean;
  setSession: (token: string, user?: User | null) => void;
  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setSession: (token, user = null) =>
    set({ accessToken: token, user, isAuthenticated: true, isLoading: false }),

  setAccessToken: (token) => set({ accessToken: token, isAuthenticated: true }),

  setUser: (user) => set({ user }),

  setLoading: (loading) => set({ isLoading: loading }),

  clearSession: () =>
    set({ accessToken: null, user: null, isAuthenticated: false, isLoading: false }),
}));
