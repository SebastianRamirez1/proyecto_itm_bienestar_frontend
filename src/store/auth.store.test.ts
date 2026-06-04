import { act, renderHook } from '@testing-library/react';
import { useAuthStore, type AuthUser } from './auth.store';

const student: AuthUser = { id: 'u1', email: 'student@itm.edu.co', role: 'student' };
const admin: AuthUser   = { id: 'u2', email: 'admin@itm.edu.co',   role: 'admin'   };

beforeEach(() => {
  useAuthStore.setState({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
});

describe('useAuthStore — initial state', () => {
  it('starts unauthenticated with no tokens', () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.accessToken).toBeNull();
    expect(result.current.refreshToken).toBeNull();
  });
});

describe('useAuthStore — login()', () => {
  it('sets user, tokens, and isAuthenticated to true', () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => result.current.login(student, 'access-token', 'refresh-token'));
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(student);
    expect(result.current.accessToken).toBe('access-token');
    expect(result.current.refreshToken).toBe('refresh-token');
  });

  it('stores admin user correctly', () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => result.current.login(admin, 'a', 'r'));
    expect(result.current.user?.role).toBe('admin');
  });
});

describe('useAuthStore — logout()', () => {
  it('clears all state', () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => result.current.login(student, 'a', 'r'));
    act(() => result.current.logout());
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.accessToken).toBeNull();
    expect(result.current.refreshToken).toBeNull();
  });
});

describe('useAuthStore — setAccessToken()', () => {
  it('updates only the access token, keeps refresh token intact', () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => result.current.login(student, 'old-access', 'refresh-token'));
    act(() => result.current.setAccessToken('new-access'));
    expect(result.current.accessToken).toBe('new-access');
    expect(result.current.refreshToken).toBe('refresh-token');
    expect(result.current.isAuthenticated).toBe(true);
  });
});
