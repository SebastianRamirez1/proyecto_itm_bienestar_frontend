import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AuthLayout() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ITM logo / brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-lg mb-4">
            <span className="text-primary font-extrabold text-2xl leading-none">ITM</span>
          </div>
          {/* Principio 2.2: h1 con tamaño correcto en pantalla de login */}
          <h1 className="text-white text-3xl font-bold tracking-tight">
            Bienestar Universitario
          </h1>
          <p className="text-primary-50 text-sm mt-1">
            Instituto Tecnológico Metropolitano · Medellín
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
