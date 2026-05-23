import { create } from 'zustand';

export type UserRole = 'student' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;

  // actions
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  setAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  login: (user, token) =>
    set({ user, accessToken: token, isAuthenticated: true }),

  logout: () =>
    set({ user: null, accessToken: null, isAuthenticated: false }),

  setAccessToken: (token) => set({ accessToken: token }),
}));
