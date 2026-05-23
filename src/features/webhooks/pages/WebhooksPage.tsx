import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { apiClient } from '../../../api/client';
import { EP_WEBHOOKS, EP_WEBHOOK_BY_ID } from '../../../api/endpoints';
import { useApiError } from '../../../hooks/useApiError';

interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
}
interface WebhooksResponse { data: Webhook[] }

const schema = z.object({
  url:    z.string().url('URL no válida'),
  events: z.string().min(1, 'Ingresa al menos un evento'),
});
type FormValues = z.infer<typeof schema>;

export default function WebhooksPage() {
  const qc = useQueryClient();
  const { getErrorMessage } = useApiError();

  const { data, isLoading } = useQuery<WebhooksResponse>({
    queryKey: ['webhooks'],
    queryFn: () => apiClient.get(EP_WEBHOOKS).then((r) => r.data),
  });

  const createWebhook = useMutation({
    mutationFn: (values: { url: string; events: string[] }) =>
      apiClient.post(EP_WEBHOOKS, values),
    onSuccess: () => {
      toast.success('Webhook registrado');
      qc.invalidateQueries({ queryKey: ['webhooks'] });
      reset();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteWebhook = useMutation({
    mutationFn: (id: string) => apiClient.delete(EP_WEBHOOK_BY_ID(id)),
    onSuccess: () => {
      toast.success('Webhook eliminado');
      qc.invalidateQueries({ queryKey: ['webhooks'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (values: FormValues) => {
    const events = values.events.split(',').map((e) => e.trim()).filter(Boolean);
    createWebhook.mutate({ url: values.url, events });
  };

  const webhooks = data?.data ?? [];

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Webhooks</h1>
        <p className="text-gray-500 text-sm mt-1">Recibe notificaciones en tu endpoint cuando ocurran eventos</p>
      </div>

      {/* Create form */}
      <section className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Registrar webhook</h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL de destino</label>
            <input
              type="url"
              placeholder="https://tu-servidor.com/webhook"
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${errors.url ? 'border-red-400' : 'border-gray-300'}`}
              {...register('url')}
            />
            {errors.url && <p className="mt-1 text-xs text-red-500">{errors.url.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Eventos <span className="text-gray-400 font-normal">(separados por coma)</span>
            </label>
            <input
              type="text"
              placeholder="event.created, event.enrolled"
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${errors.events ? 'border-red-400' : 'border-gray-300'}`}
              {...register('events')}
            />
            {errors.events && <p className="mt-1 text-xs text-red-500">{errors.events.message}</p>}
          </div>
          <button
            type="submit"
            disabled={createWebhook.isPending}
            className="bg-primary hover:bg-primary-light text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition disabled:opacity-60"
          >
            {createWebhook.isPending ? 'Registrando…' : 'Registrar'}
          </button>
        </form>
      </section>

      {/* List */}
      <section className="bg-white rounded-xl border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-800">Webhooks registrados</h2>
        </div>
        {isLoading ? (
          <p className="text-gray-500 text-sm p-6">Cargando…</p>
        ) : webhooks.length === 0 ? (
          <p className="text-gray-500 text-sm p-6">No hay webhooks registrados.</p>
        ) : (
          <ul className="divide-y">
            {webhooks.map((wh) => (
              <li key={wh.id} className="px-6 py-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{wh.url}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {wh.events.join(', ')}
                  </p>
                  <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${wh.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {wh.active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <button
                  onClick={() => deleteWebhook.mutate(wh.id)}
                  disabled={deleteWebhook.isPending}
                  className="text-xs text-red-500 hover:text-red-700 font-medium flex-shrink-0 disabled:opacity-50"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
