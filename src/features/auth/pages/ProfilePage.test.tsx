import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import ProfilePage from './ProfilePage';

vi.mock('../../../api/client', () => ({
  apiClient: { get: vi.fn() },
}));

function makeClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function renderPage() {
  return render(
    <QueryClientProvider client={makeClient()}>
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => vi.clearAllMocks());

describe('ProfilePage — rendering', () => {
  it('shows page title', async () => {
    const { apiClient } = await import('../../../api/client');
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { success: true, data: { id: 'u1', email: 'test@itm.edu.co', role: 'student' } },
    });

    renderPage();
    expect(screen.getByRole('heading', { name: /mi perfil/i })).toBeInTheDocument();
  });

  it('displays email and role after data loads', async () => {
    const { apiClient } = await import('../../../api/client');
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { success: true, data: { id: 'u1', email: 'juan@itm.edu.co', role: 'student' } },
    });

    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('juan@itm.edu.co').length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText(/estudiante/i).length).toBeGreaterThan(0);
  });

  it('shows admin role label for admin users', async () => {
    const { apiClient } = await import('../../../api/client');
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { success: true, data: { id: 'a1', email: 'admin@itm.edu.co', role: 'admin' } },
    });

    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText(/administrador/i).length).toBeGreaterThan(0);
    });
  });

  it('shows user id in detail row', async () => {
    const { apiClient } = await import('../../../api/client');
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { success: true, data: { id: 'abc-123', email: 'user@itm.edu.co', role: 'student' } },
    });

    renderPage();
    await waitFor(() => {
      expect(screen.getByText('abc-123')).toBeInTheDocument();
    });
  });

  it('shows error banner when the request fails', async () => {
    const { apiClient } = await import('../../../api/client');
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('calls GET /auth/profile', async () => {
    const { apiClient } = await import('../../../api/client');
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { success: true, data: { id: 'u2', email: 'me@itm.edu.co', role: 'student' } },
    });

    renderPage();
    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/auth/profile');
    });
  });
});
