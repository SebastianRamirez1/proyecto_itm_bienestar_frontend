import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { apiClient } from '../../../api/client';
import { EP_AUTH_LOGIN } from '../../../api/endpoints';
import { useAuth } from '../../../hooks/useAuth';
import { useApiError } from '../../../hooks/useApiError';
import type { AuthUser } from '../../../store/auth.store';

const schema = z.object({
  email:    z.string().email('Correo no válido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type FormValues = z.infer<typeof schema>;

interface LoginResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  };
}

export default function LoginForm() {
  const { login } = useAuth();
  const { getErrorMessage } = useApiError();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard';

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const { data } = await apiClient.post<LoginResponse>(EP_AUTH_LOGIN, values);
      login(data.data.user, data.data.accessToken, data.data.refreshToken);
      toast.success(`¡Bienvenido, ${data.data.user.email}!`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Credenciales inválidas'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Iniciar sesión</h2>
        <p className="text-sm text-gray-500 mt-1">Accede con tu correo institucional</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="usuario@itm.edu.co"
          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary focus:border-transparent ${
            errors.email ? 'border-red-400' : 'border-gray-300'
          }`}
          {...register('email')}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary focus:border-transparent ${
            errors.password ? 'border-red-400' : 'border-gray-300'
          }`}
          {...register('password')}
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-primary-light text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed text-sm"
      >
        {loading ? 'Ingresando…' : 'Ingresar'}
      </button>

      <p className="text-center text-sm text-gray-500">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="text-primary font-medium hover:underline">
          Regístrate
        </Link>
      </p>
    </form>
  );
}
