import { useQuery } from '@tanstack/react-query';
import { RefreshCw, BookOpen } from 'lucide-react';
import { apiClient } from '../../../api/client';
import { EP_LIBRARY_BOOKS } from '../../../api/endpoints';
import { SkeletonCard } from '../../../components/Skeleton';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  category: string;
  availableCopies: number;
  totalCopies: number;
  publishedYear?: number;
}
interface BooksResponse {
  success: boolean;
  books: Book[];
  meta?: unknown;
}

export default function ResourcesPage() {
  const { data, isLoading, isError, refetch } = useQuery<BooksResponse>({
    queryKey: ['resources'],
    queryFn: () => apiClient.get(EP_LIBRARY_BOOKS).then((r) => r.data),
    staleTime: 5 * 60_000,
  });

  const books: Book[] = Array.isArray(data?.books) ? data.books : [];

  // Group by category
  const byCategory = books.reduce<Record<string, Book[]>>((acc, b) => {
    (acc[b.category] ??= []).push(b);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Recursos</h1>
        <p className="text-gray-500 text-sm mt-1">Catálogo de libros de la Biblioteca ITM</p>
      </div>

      {isLoading && (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

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

      {!isLoading && !isError && books.length === 0 && (
        <div className="bg-white rounded-xl border p-8 text-center">
          <BookOpen size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500 text-sm">No hay libros disponibles por el momento.</p>
        </div>
      )}

      {!isLoading && !isError && books.length > 0 && (
        <div className="space-y-6">
          {Object.entries(byCategory).map(([category, items]) => (
            <div key={category}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                {category}
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {items.map((b) => (
                  <div key={b.id} className="bg-white rounded-xl border p-4 flex flex-col gap-1">
                    <h2 className="font-semibold text-gray-800 text-sm leading-tight">{b.title}</h2>
                    <p className="text-xs text-gray-500">{b.author}</p>
                    {b.publishedYear && (
                      <p className="text-xs text-gray-400">{b.publishedYear}</p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        b.availableCopies > 0
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {b.availableCopies > 0
                          ? `${b.availableCopies}/${b.totalCopies} disponibles`
                          : 'Sin ejemplares'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
