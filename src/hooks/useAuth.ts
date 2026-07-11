import { useEffect, useCallback } from "react";
import { useAuthStore, User } from "@/store/authStore";
import { authApi } from "@/api/auth.api";

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    setCredentials,
    setUser,
    setLoading,
    logout: storeLogout,
  } = useAuthStore();

  // On mount: if we have a token, try to fetch the user profile
  useEffect(() => {
    const hydrate = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profile = await authApi.getProfile();
        setUser(profile as User);
      } catch {
        // Token is invalid / expired and refresh also failed → clear
        storeLogout();
      } finally {
        setLoading(false);
      }
    };

    hydrate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(
    async (email: string, password: string) => {
      // Call backend JWT endpoint
      const data = await authApi.login({ email, password });

      // Fetch user profile so we have full user data
      let profile: User | null = null;
      try {
        profile = (await authApi.getProfile()) as User;
      } catch {
        // If profile fetch fails, proceed with partial data
      }

      setCredentials(data.access, profile);
      return data;
    },
    [setCredentials],
  );

  const signup = useCallback(
    async (userData: {
      email: string;
      password: string;
      password_confirm: string;
      first_name?: string;
      last_name?: string;
    }) => {
      const data = await authApi.register(userData);
      return data;
    },
    [],
  );

  const logout = useCallback(() => {
    storeLogout();
  }, [storeLogout]);

  return { user, isAuthenticated, isLoading, login, signup, logout };
};
