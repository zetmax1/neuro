import { useCallback, useEffect } from "react";

import { authApi } from "@/api/auth.api";
import { useAuthStore, type User } from "@/store/authStore";

/**
 * The session lifecycle (D16).
 *
 * On start there is no token in memory — a reload loses it by design — so the
 * app asks the backend to refresh from the httpOnly cookie. A learner who
 * still has a valid cookie is signed in silently; anyone else lands on the
 * login page. Nothing is read from localStorage.
 */
export const useAuth = () => {
  const { user, isAuthenticated, isLoading, setSession, setUser, setLoading, clearSession } =
    useAuthStore();

  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      try {
        const { access } = await authApi.refresh();
        const profile = await authApi.getProfile();
        if (!cancelled) setSession(access, profile as User);
      } catch {
        if (!cancelled) clearSession();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void restore();
    return () => {
      cancelled = true;
    };
    // Runs once: the store is the source of truth from then on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { access } = await authApi.login({ email, password });
      // The token must be in the store before the profile call carries it.
      setSession(access, null);
      const profile = await authApi.getProfile();
      setUser(profile as User);
      return profile;
    },
    [setSession, setUser],
  );

  const signup = useCallback(
    async (userData: {
      email: string;
      password: string;
      password_confirm: string;
      first_name?: string;
      last_name?: string;
    }) => authApi.register(userData),
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      // Even if the server call fails the local session ends.
      clearSession();
    }
  }, [clearSession]);

  return { user, isAuthenticated, isLoading, login, signup, logout };
};
