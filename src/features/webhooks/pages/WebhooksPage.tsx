import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { apiClient } from '../../../api/client';
import { EP_WEBHOOKS, EP_WEBHOOK_BY_ID } from '../../../api/endpoints';
import { useApiError } from '../../../hooks/useApiError';

// Backend shape: { id, url, active, createdAt } — no 'events' field
interface Webhook {
  id: string;
  url: string;
  active: boolean;
  createdAt: string;
}
interface WebhooksResponse { data: Webhook[] }

const schema = z.object({
  url: z.string().url('Ingresa una URL válida (debe empezar con https://)'),
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
    mutationFn: (values: { url: string }) =>
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
    createWebhook.mutate({ url: values.url });
  };

  const webhooks = data?.data ?? [];

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Webhooks</h1>
        <p className="text-gray-500 text-sm mt-1">
          Recibe notificaciones en tu endpoint cuando ocurran alertas críticas en el ITM
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-primary-50 border border-primary/20 rounded-xl px-5 py-4 text-sm text-primary">
        <p className="font-medium mb-1">¿Cómo funciona?</p>
        <p className="text-primary/80">
          Cada vez que se crea una alerta <strong>crítica</strong>, el sistema hace un POST firmado
          con HMAC-SHA256 a tu URL. Para pruebas puedes usar{' '}
          <a href="https://webhook.site" target="_blank" rel="noopener noreferrer"
             className="underline font-medium">webhook.site</a>.
        </p>
      </div>

      {/* Create form */}
      <section className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Registrar webhook</h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex gap-3">
          <div className="flex-1">
            <input
              type="url"
              placeholder="https://tu-servidor.com/webhook"
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.url ? 'border-red-400' : 'border-gray-300'
              }`}
              {...register('url')}
            />
            {errors.url && (
              <p className="mt-1 text-xs text-red-500">{errors.url.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={createWebhook.isPending}
            className="bg-primary hover:bg-primary-light text-white font-semibold px-5 py-2 rounded-lg text-sm transition disabled:opacity-60 flex-shrink-0"
          >
            {createWebhook.isPending ? 'Registrando…' : 'Registrar'}
          </button>
        </form>
      </section>

      {/* List */}
      <section className="bg-white rounded-xl border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-800">
            Webhooks registrados
            {webhooks.length > 0 && (
              <span className="ml-2 text-xs font-normal text-gray-400">({webhooks.length})</span>
            )}
          </h2>
        </div>
        {isLoading ? (
          <p className="text-gray-500 text-sm p-6">Cargando…</p>
        ) : webhooks.length === 0 ? (
          <p className="text-gray-500 text-sm p-6">No tienes webhooks registrados.</p>
        ) : (
          <ul className="divide-y">
            {webhooks.map((wh) => (
              <li key={wh.id} className="px-6 py-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{wh.url}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      wh.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {wh.active ? 'Activo' : 'Inactivo'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(wh.createdAt).toLocaleDateString('es-CO')}
                    </span>
                  </div>
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
