import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import RegisterForm from './RegisterForm';

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
      <RegisterForm />
    </MemoryRouter>,
  );
}

beforeEach(() => vi.clearAllMocks());

describe('RegisterForm — rendering', () => {
  it('shows email, password and confirm-password fields', () => {
    renderForm();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^contraseña/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
  });
});

describe('RegisterForm — validation', () => {
  it('rejects email from a non-institutional domain', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText(/correo electrónico/i), 'user@gmail.com');
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));
    expect(await screen.findByText(/usa tu correo institucional/i)).toBeInTheDocument();
  });

  it('rejects password shorter than 8 characters', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText(/^contraseña/i), 'short');
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));
    expect(await screen.findByText('Mínimo 8 caracteres')).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText(/correo electrónico/i), 'user@itm.edu.co');
    await user.type(screen.getByLabelText(/^contraseña/i), 'Password1!');
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'Different1!');
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));
    expect(await screen.findByText(/las contraseñas no coinciden/i)).toBeInTheDocument();
  });
});

describe('RegisterForm — submission', () => {
  it('accepts @correo.itm.edu.co domain and calls register + auto-login', async () => {
    const user = userEvent.setup();
    const { apiClient } = await import('../../../api/client');
    vi.mocked(apiClient.post)
      .mockResolvedValueOnce({ data: {} })
      .mockResolvedValueOnce({
        data: {
          data: {
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
            user: { id: 'u1', email: 'user@correo.itm.edu.co', role: 'student' },
          },
        },
      });

    renderForm();
    await user.type(screen.getByLabelText(/correo electrónico/i), 'user@correo.itm.edu.co');
    await user.type(screen.getByLabelText(/^contraseña/i), 'Password1!');
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'Password1!');
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    await vi.waitFor(() => {
      expect(apiClient.post).toHaveBeenNthCalledWith(1, '/auth/register', {
        email: 'user@correo.itm.edu.co',
        password: 'Password1!',
      });
      expect(apiClient.post).toHaveBeenNthCalledWith(2, '/auth/login', {
        email: 'user@correo.itm.edu.co',
        password: 'Password1!',
      });
    });
  });

  it('shows toast error when registration fails', async () => {
    const user = userEvent.setup();
    const { apiClient } = await import('../../../api/client');
    const { toast }     = await import('sonner');
    vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Conflict'));

    renderForm();
    await user.type(screen.getByLabelText(/correo electrónico/i), 'user@itm.edu.co');
    await user.type(screen.getByLabelText(/^contraseña/i), 'Password1!');
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'Password1!');
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    await vi.waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
