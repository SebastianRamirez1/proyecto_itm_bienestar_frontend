import { useQuery } from '@tanstack/react-query';
import { User, Mail, ShieldCheck, ShieldAlert } from 'lucide-react';
import { apiClient } from '../../../api/client';
import { EP_AUTH_PROFILE } from '../../../api/endpoints';

interface ProfileData {
  id: string;
  email: string;
  role: 'student' | 'admin';
}

interface ProfileResponse {
  success: boolean;
  data: ProfileData;
}

const ROLE_LABELS: Record<ProfileData['role'], string> = {
  student: 'Estudiante',
  admin: 'Administrador',
};

export default function ProfilePage() {
  const { data, isLoading, isError } = useQuery<ProfileResponse>({
    queryKey: ['auth-profile'],
    queryFn: () => apiClient.get(EP_AUTH_PROFILE).then((r) => r.data),
    staleTime: 5 * 60_000,
  });

  const profile = data?.data;

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mi perfil</h1>
        <p className="text-gray-500 text-sm mt-1">Información de tu cuenta institucional</p>
      </div>

      {isLoading && (
        <div className="bg-white rounded-xl border p-6 space-y-4 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gray-200" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-40" />
              <div className="h-3 bg-gray-100 rounded w-24" />
            </div>
          </div>
          <div className="h-px bg-gray-100" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-3/4" />
          </div>
        </div>
      )}

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700" role="alert">
          No se pudo cargar el perfil. Intenta recargar la página.
        </div>
      )}

      {!isLoading && !isError && profile && (
        <div className="bg-white rounded-xl border overflow-hidden">
          {/* Avatar header */}
          <div className="bg-primary/5 px-6 py-5 flex items-center gap-4 border-b">
            <div
              aria-hidden="true"
              className="w-14 h-14 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
            >
              <User size={26} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">{profile.email}</p>
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium mt-0.5 ${
                  profile.role === 'admin' ? 'text-purple-700' : 'text-primary'
                }`}
              >
                {profile.role === 'admin' ? (
                  <ShieldCheck size={13} aria-hidden="true" />
                ) : (
                  <ShieldAlert size={13} aria-hidden="true" />
                )}
                {ROLE_LABELS[profile.role]}
              </span>
            </div>
          </div>

          {/* Detail rows */}
          <dl className="divide-y">
            <div className="flex items-center gap-3 px-6 py-4">
              <Mail size={16} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
              <dt className="text-sm text-gray-500 w-28 flex-shrink-0">Correo</dt>
              <dd className="text-sm text-gray-800 font-medium truncate">{profile.email}</dd>
            </div>

            <div className="flex items-center gap-3 px-6 py-4">
              <ShieldCheck size={16} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
              <dt className="text-sm text-gray-500 w-28 flex-shrink-0">Rol</dt>
              <dd className="text-sm text-gray-800 font-medium capitalize">
                {ROLE_LABELS[profile.role]}
              </dd>
            </div>

            <div className="flex items-center gap-3 px-6 py-4">
              <User size={16} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
              <dt className="text-sm text-gray-500 w-28 flex-shrink-0">ID de usuario</dt>
              <dd className="text-sm text-gray-400 font-mono truncate">{profile.id}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
