import { act, renderHook } from '@testing-library/react';
import { useAuth } from './useAuth';
import { useAuthStore } from '../store/auth.store';

const student = { id: 'u1', email: 'student@itm.edu.co', role: 'student' as const };
const admin   = { id: 'u2', email: 'admin@itm.edu.co',   role: 'admin'   as const };

beforeEach(() => {
  useAuthStore.setState({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
});

describe('useAuth', () => {
  it('returns unauthenticated state by default', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.isAdmin).toBe(false);
  });

  it('isAdmin is false for student role', () => {
    useAuthStore.setState({ user: student, isAuthenticated: true, accessToken: 't', refreshToken: 'r' });
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAdmin).toBe(false);
  });

  it('isAdmin is true for admin role', () => {
    useAuthStore.setState({ user: admin, isAuthenticated: true, accessToken: 't', refreshToken: 'r' });
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAdmin).toBe(true);
  });

  it('exposes accessToken from the store', () => {
    useAuthStore.setState({ user: student, isAuthenticated: true, accessToken: 'my-token', refreshToken: 'r' });
    const { result } = renderHook(() => useAuth());
    expect(result.current.accessToken).toBe('my-token');
  });

  it('login action authenticates the user', () => {
    const { result } = renderHook(() => useAuth());
    act(() => result.current.login(admin, 'access', 'refresh'));
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isAdmin).toBe(true);
  });

  it('logout action clears the session', () => {
    useAuthStore.setState({ user: admin, isAuthenticated: true, accessToken: 't', refreshToken: 'r' });
    const { result } = renderHook(() => useAuth());
    act(() => result.current.logout());
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
