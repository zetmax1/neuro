import { useState, useEffect, useCallback } from "react";

interface User {
  email: string;
  name: string;
  joinedAt: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("neurolearn_user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((email: string, _password: string) => {
    const name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    const newUser: User = { email, name, joinedAt: new Date().toISOString() };
    localStorage.setItem("neurolearn_user", JSON.stringify(newUser));
    setUser(newUser);
  }, []);

  const signup = useCallback((email: string, _password: string, displayName?: string) => {
    const name = displayName || email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    const newUser: User = { email, name, joinedAt: new Date().toISOString() };
    localStorage.setItem("neurolearn_user", JSON.stringify(newUser));
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("neurolearn_user");
    setUser(null);
  }, []);

  return { user, isLoading, login, signup, logout };
};
