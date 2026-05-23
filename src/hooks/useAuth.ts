import { useAuthStore } from '../store/auth.store';

export function useAuth() {
  const user            = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken     = useAuthStore((s) => s.accessToken);
  const login           = useAuthStore((s) => s.login);
  const logout          = useAuthStore((s) => s.logout);

  const isAdmin = user?.role === 'admin';

  return { user, isAuthenticated, accessToken, isAdmin, login, logout };
}
