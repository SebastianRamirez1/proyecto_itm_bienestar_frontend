import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Calendar, MapPin, Users } from 'lucide-react';
import { apiClient } from '../../../api/client';
import { EP_EVENTS, EP_EVENT_REGISTER } from '../../../api/endpoints';
import { toast } from 'sonner';
import { useApiError } from '../../../hooks/useApiError';
import { SkeletonCard } from '../../../components/Skeleton';

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  location: string;
  maxCapacity: number | null;
  registeredCount: number;
  imageUrl?: string;
  active: boolean;
}
interface EventsResponse { success: boolean; events: Event[]; meta?: unknown }

export default function EventsPage() {
  const qc = useQueryClient();
  const { getErrorMessage } = useApiError();

  const { data, isLoading, isError, refetch } = useQuery<EventsResponse>({
    queryKey: ['events'],
    queryFn: () => apiClient.get(EP_EVENTS).then((r) => r.data),
    staleTime: 2 * 60_000,
  });

  const enroll = useMutation({
    mutationFn: (eventId: string) => apiClient.post(EP_EVENT_REGISTER(eventId)),
    onSuccess: () => {
      toast.success('¡Inscripción exitosa!');
      qc.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const events: Event[] = Array.isArray(data?.events) ? data.events : [];

  return (
    <div className="max-w-4xl space-y-6">
      {/* Principio 2.2: h1 con tamaño y tracking adecuados */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Eventos</h1>
        <p className="text-gray-500 text-sm mt-1">Talleres, charlas y actividades de bienestar</p>
      </div>

      {isLoading && (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-3">
          <p className="text-red-700 text-sm font-medium">No se pudieron cargar los eventos.</p>
          {/* Principio 7.2: min-h-[44px] en botón de reintentar */}
          <button
            onClick={() => refetch()}
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 text-sm text-red-600 underline hover:no-underline transition-colors duration-150"
          >
            <RefreshCw size={14} aria-hidden="true" /> Reintentar
          </button>
        </div>
      )}

      {!isLoading && !isError && events.length === 0 && (
        <p className="text-gray-500 text-sm">No hay eventos próximos.</p>
      )}

      {/* Principio 7.3: grid colapsa a 1 columna en mobile */}
      {!isLoading && !isError && events.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-4">
          {events.map((e) => {
            const dateStr = new Date(e.startDate).toLocaleDateString('es-CO', {
              weekday: 'short', month: 'short', day: 'numeric',
            });
            const spotsLeft = e.maxCapacity != null ? e.maxCapacity - e.registeredCount : null;
            const isFull = spotsLeft === 0;

            return (
              <article key={e.id} className="bg-white rounded-xl border p-5 flex flex-col gap-3">
                {/* Header: categoría + título */}
                <div>
                  <span className="inline-block text-xs font-semibold bg-primary/10 text-primary rounded-full px-2 py-0.5 mb-2 capitalize">
                    {e.category}
                  </span>
                  {/* Principio 2.2: h2 como cabecera de card */}
                  <h2 className="font-semibold text-gray-800 leading-snug">{e.title}</h2>
                  {/* Principio 4.1: descripción con line-clamp + overflow-wrap */}
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {e.description}
                  </p>
                </div>

                {/* Meta: Principio 1.2 — iconos en lugar de emojis para coherencia visual */}
                <div className="text-xs text-gray-500 space-y-1.5">
                  <p className="flex items-center gap-2">
                    <Calendar size={13} className="flex-shrink-0 text-gray-400" aria-hidden="true" />
                    {dateStr}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin size={13} className="flex-shrink-0 text-gray-400" aria-hidden="true" />
                    {e.location}
                  </p>
                  {spotsLeft != null && (
                    <p className={`flex items-center gap-2 ${isFull ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Users size={13} className="flex-shrink-0 text-gray-400" aria-hidden="true" />
                      {isFull ? 'Sin cupos disponibles' : `${spotsLeft} cupos disponibles`}
                    </p>
                  )}
                </div>

                {/* CTA — Principio 5.1: un solo botón primario por card */}
                {/* Principio 7.2: py-3 + text-sm = ~44px de altura */}
                <button
                  disabled={isFull || enroll.isPending}
                  onClick={() => enroll.mutate(e.id)}
                  className="mt-auto bg-accent text-white text-sm font-semibold py-3 rounded-lg
                             transition-all duration-150 ease-out
                             hover:-translate-y-0.5 hover:shadow-md
                             disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
                >
                  {isFull ? 'Sin cupos' : 'Inscribirme'}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
