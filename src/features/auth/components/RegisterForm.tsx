import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { apiClient } from '../../../api/client';
import { EP_AUTH_REGISTER, EP_AUTH_LOGIN } from '../../../api/endpoints';
import { useAuth } from '../../../hooks/useAuth';
import { useApiError } from '../../../hooks/useApiError';
import type { AuthUser } from '../../../store/auth.store';

const schema = z
  .object({
    email:           z.string().email('Correo no válido')
      .refine((e) => e.endsWith('@itm.edu.co') || e.endsWith('@correo.itm.edu.co'), {
        message: 'Usa tu correo institucional (@itm.edu.co o @correo.itm.edu.co)',
      }),
    password:        z.string().min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

interface LoginResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  };
}

export default function RegisterForm() {
  const { login } = useAuth();
  const { getErrorMessage } = useApiError();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      // Backend only accepts email + password (no name field in schema)
      await apiClient.post(EP_AUTH_REGISTER, {
        email:    values.email,
        password: values.password,
      });

      // auto-login after registration
      const { data } = await apiClient.post<LoginResponse>(EP_AUTH_LOGIN, {
        email:    values.email,
        password: values.password,
      });
      login(data.data.user, data.data.accessToken, data.data.refreshToken);
      toast.success('¡Cuenta creada! Bienvenido a Bienestar ITM');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, 'No se pudo crear la cuenta'));
    } finally {
      setLoading(false);
    }
  };

  const Field = ({
    id,
    label,
    type = 'text',
    placeholder,
    autoComplete,
    error,
    reg,
  }: {
    id: keyof FormValues;
    label: string;
    type?: string;
    placeholder?: string;
    autoComplete?: string;
    error?: string;
    reg: ReturnType<typeof register>;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary focus:border-transparent ${
          error ? 'border-red-400' : 'border-gray-300'
        }`}
        {...reg}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Crear cuenta</h2>
        <p className="text-sm text-gray-500 mt-1">Regístrate con tu correo institucional</p>
      </div>

      <Field
        id="email"
        label="Correo electrónico"
        type="email"
        placeholder="usuario@itm.edu.co"
        autoComplete="email"
        error={errors.email?.message}
        reg={register('email')}
      />
      <Field
        id="password"
        label="Contraseña"
        type="password"
        placeholder="••••••••"
        autoComplete="new-password"
        error={errors.password?.message}
        reg={register('password')}
      />
      <Field
        id="confirmPassword"
        label="Confirmar contraseña"
        type="password"
        placeholder="••••••••"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        reg={register('confirmPassword')}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-primary-light text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed text-sm"
      >
        {loading ? 'Creando cuenta…' : 'Crear cuenta'}
      </button>

      <p className="text-center text-sm text-gray-500">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-primary font-medium hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
