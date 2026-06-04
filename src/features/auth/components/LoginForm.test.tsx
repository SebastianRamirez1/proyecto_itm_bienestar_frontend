import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import LoginForm from './LoginForm';

vi.mock('../../../api/client', () => ({
  apiClient: { post: vi.fn() },
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderForm() {
  return render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>,
  );
}

beforeEach(() => vi.clearAllMocks());

describe('LoginForm — rendering', () => {
  it('shows email field, password field and submit button', () => {
    renderForm();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument();
  });

  it('has a link to the register page', () => {
    renderForm();
    expect(screen.getByRole('link', { name: /regístrate/i })).toBeInTheDocument();
  });
});

describe('LoginForm — validation', () => {
  it('shows error for invalid email format', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText(/correo electrónico/i), 'notanemail');
    await user.click(screen.getByRole('button', { name: /ingresar/i }));
    expect(await screen.findByText('Correo no válido')).toBeInTheDocument();
  });

  it('shows error when password is shorter than 6 characters', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText(/correo electrónico/i), 'user@itm.edu.co');
    await user.type(screen.getByLabelText(/contraseña/i), '123');
    await user.click(screen.getByRole('button', { name: /ingresar/i }));
    expect(await screen.findByText('Mínimo 6 caracteres')).toBeInTheDocument();
  });

  it('does not call the API when validation fails', async () => {
    const user = userEvent.setup();
    const { apiClient } = await import('../../../api/client');
    renderForm();
    await user.click(screen.getByRole('button', { name: /ingresar/i }));
    await screen.findByText('Correo no válido');
    expect(apiClient.post).not.toHaveBeenCalled();
  });
});

describe('LoginForm — submission', () => {
  it('calls POST /auth/login with email and password on valid submit', async () => {
    const user = userEvent.setup();
    const { apiClient } = await import('../../../api/client');
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: {
        data: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          user: { id: 'u1', email: 'user@itm.edu.co', role: 'student' },
        },
      },
    });

    renderForm();
    await user.type(screen.getByLabelText(/correo electrónico/i), 'user@itm.edu.co');
    await user.type(screen.getByLabelText(/contraseña/i), 'password123');
    await user.click(screen.getByRole('button', { name: /ingresar/i }));

    await vi.waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'user@itm.edu.co',
        password: 'password123',
      });
    });
  });

  it('shows toast error on failed login', async () => {
    const user = userEvent.setup();
    const { apiClient } = await import('../../../api/client');
    const { toast }     = await import('sonner');
    vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Network error'));

    renderForm();
    await user.type(screen.getByLabelText(/correo electrónico/i), 'user@itm.edu.co');
    await user.type(screen.getByLabelText(/contraseña/i), 'password123');
    await user.click(screen.getByRole('button', { name: /ingresar/i }));

    await vi.waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
