import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../api/client';
import { EP_LIBRARY_BOOKS } from '../../../api/endpoints';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: string;
  url: string;
  createdAt: string;
}
interface ResourcesResponse {
  data: Resource[];
}

export default function ResourcesPage() {
  const { data, isLoading, isError } = useQuery<ResourcesResponse>({
    queryKey: ['resources'],
    queryFn: () => apiClient.get(EP_LIBRARY_BOOKS).then((r) => r.data),
  });

  if (isLoading) return <PageShell>Cargando recursos…</PageShell>;
  if (isError)   return <PageShell>No se pudieron cargar los recursos.</PageShell>;

  const resources = data?.data ?? [];

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Recursos</h1>
        <p className="text-gray-500 text-sm mt-1">Material de apoyo académico y emocional</p>
      </div>

      {resources.length === 0 ? (
        <p className="text-gray-500 text-sm">No hay recursos disponibles por el momento.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {resources.map((r) => (
            <a
              key={r.id}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white rounded-xl border p-5 hover:shadow-md transition"
            >
              <span className="inline-block text-xs font-semibold bg-primary-50 text-primary rounded-full px-2 py-0.5 mb-2 capitalize">
                {r.type}
              </span>
              <h2 className="font-semibold text-gray-800 text-sm">{r.title}</h2>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.description}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Recursos</h1>
      <p className="text-gray-500 text-sm">{children}</p>
    </div>
  );
}
