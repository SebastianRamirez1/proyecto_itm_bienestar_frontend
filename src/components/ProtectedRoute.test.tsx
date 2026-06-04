import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import ProtectedRoute from './ProtectedRoute';

const student = { id: 'u1', email: 'student@itm.edu.co', role: 'student' as const };
const admin   = { id: 'u2', email: 'admin@itm.edu.co',   role: 'admin'   as const };

function setup(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login"     element={<div>Login page</div>} />
        <Route path="/dashboard" element={<div>Dashboard page</div>} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <div>Protected content</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-only"
          element={
            <ProtectedRoute requiredRole="admin">
              <div>Admin content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  useAuthStore.setState({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
});

describe('ProtectedRoute', () => {
  it('redirects to /login when unauthenticated', () => {
    setup('/protected');
    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('renders children when user is authenticated', () => {
    useAuthStore.setState({ user: student, isAuthenticated: true, accessToken: 't', refreshToken: 'r' });
    setup('/protected');
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('redirects to /dashboard when authenticated user lacks required role', () => {
    useAuthStore.setState({ user: student, isAuthenticated: true, accessToken: 't', refreshToken: 'r' });
    setup('/admin-only');
    expect(screen.getByText('Dashboard page')).toBeInTheDocument();
    expect(screen.queryByText('Admin content')).not.toBeInTheDocument();
  });

  it('renders admin content when user has the admin role', () => {
    useAuthStore.setState({ user: admin, isAuthenticated: true, accessToken: 't', refreshToken: 'r' });
    setup('/admin-only');
    expect(screen.getByText('Admin content')).toBeInTheDocument();
  });
});
