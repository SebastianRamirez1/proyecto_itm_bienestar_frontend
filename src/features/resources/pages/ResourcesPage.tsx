import { useQuery } from '@tanstack/react-query';
import { RefreshCw, BookOpen } from 'lucide-react';
import { apiClient } from '../../../api/client';
import { EP_LIBRARY_BOOKS } from '../../../api/endpoints';
import { SkeletonCard } from '../../../components/Skeleton';

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
  const { data, isLoading, isError, refetch } = useQuery<ResourcesResponse>({
    queryKey: ['resources'],
    queryFn: () => apiClient.get(EP_LIBRARY_BOOKS).then((r) => r.data),
    staleTime: 5 * 60_000,
  });

  const resources = data?.data ?? [];

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Recursos</h1>
        <p className="text-gray-500 text-sm mt-1">Material de apoyo académico y emocional</p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-3">
          <p className="text-red-700 text-sm font-medium">No se pudieron cargar los recursos.</p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 text-sm text-red-600 underline hover:no-underline"
          >
            <RefreshCw size={14} /> Reintentar
          </button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && resources.length === 0 && (
        <div className="bg-white rounded-xl border p-8 text-center">
          <BookOpen size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500 text-sm">No hay recursos disponibles por el momento.</p>
        </div>
      )}

      {/* List */}
      {!isLoading && !isError && resources.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-4">
          {resources.map((r) => (
            <a
              key={r.id}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white rounded-xl border p-5 hover:shadow-md transition"
            >
              <span className="inline-block text-xs font-semibold bg-primary/10 text-primary rounded-full px-2 py-0.5 mb-2 capitalize">
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
