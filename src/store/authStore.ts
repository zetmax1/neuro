import { create } from 'zustand';

export interface User {
  id?: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active?: boolean;
  is_staff?: boolean;
  date_joined?: string;
  role?: 'admin' | 'instructor' | 'student';
  is_deleted?: boolean;
  deleted_at?: string;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setCredentials: (token: string, user?: User | null) => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

const initialToken = localStorage.getItem('accessToken');

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: initialToken,
  user: null,
  isAuthenticated: !!initialToken,
  isLoading: true,

  setCredentials: (token, user = null) => {
    localStorage.setItem('accessToken', token);
    set({
      accessToken: token,
      user,
      isAuthenticated: true,
    });
  },

  setUser: (user) => {
    set({ user });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
    });
  },
}));
