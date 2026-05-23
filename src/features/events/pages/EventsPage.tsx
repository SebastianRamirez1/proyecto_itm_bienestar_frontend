import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/client';
import { EP_EVENTS, EP_EVENT_ENROLL } from '../../../api/endpoints';
import { toast } from 'sonner';
import { useApiError } from '../../../hooks/useApiError';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  enrolledCount: number;
  isEnrolled?: boolean;
}
interface EventsResponse { data: Event[] }

export default function EventsPage() {
  const qc = useQueryClient();
  const { getErrorMessage } = useApiError();

  const { data, isLoading } = useQuery<EventsResponse>({
    queryKey: ['events'],
    queryFn: () => apiClient.get(EP_EVENTS).then((r) => r.data),
  });

  const enroll = useMutation({
    mutationFn: (eventId: string) => apiClient.post(EP_EVENT_ENROLL(eventId)),
    onSuccess: () => {
      toast.success('¡Inscripción exitosa!');
      qc.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const events = data?.data ?? [];

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
        <p className="text-gray-500 text-sm mt-1">Talleres, charlas y actividades de bienestar</p>
      </div>

      {isLoading && <p className="text-gray-500 text-sm">Cargando eventos…</p>}

      {!isLoading && events.length === 0 && (
        <p className="text-gray-500 text-sm">No hay eventos próximos.</p>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {events.map((e) => {
          const dateStr = new Date(e.date).toLocaleDateString('es-CO', {
            weekday: 'short', month: 'short', day: 'numeric',
          });
          const spotsLeft = e.capacity - e.enrolledCount;

          return (
            <div key={e.id} className="bg-white rounded-xl border p-5 flex flex-col gap-3">
              <div>
                <h2 className="font-semibold text-gray-800">{e.title}</h2>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{e.description}</p>
              </div>
              <div className="text-xs text-gray-500 space-y-0.5">
                <p>📅 {dateStr}</p>
                <p>📍 {e.location}</p>
                <p>🪑 {spotsLeft > 0 ? `${spotsLeft} cupos disponibles` : 'Sin cupos'}</p>
              </div>
              <button
                disabled={e.isEnrolled || spotsLeft <= 0 || enroll.isPending}
                onClick={() => enroll.mutate(e.id)}
                className="mt-auto bg-accent hover:opacity-90 text-white text-sm font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {e.isEnrolled ? '✓ Inscrito' : 'Inscribirme'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
