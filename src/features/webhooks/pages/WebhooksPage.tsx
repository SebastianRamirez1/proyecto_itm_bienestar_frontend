import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { toast } from 'sonner';
import { FlaskConical, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { apiClient } from '../../../api/client';
import { EP_WEBHOOKS, EP_WEBHOOK_BY_ID, EP_WEBHOOK_TEST } from '../../../api/endpoints';
import { useApiError } from '../../../hooks/useApiError';
import { SkeletonList } from '../../../components/Skeleton';

interface Webhook {
  id: string;
  url: string;
  active: boolean;
  createdAt: string;
}
interface WebhooksResponse { success: boolean; data: Webhook[] }
interface TestResult { delivered: boolean; statusCode?: number; error?: string }

const schema = z.object({
  url: z.string().url('Ingresa una URL válida (debe empezar con https://)'),
});
type FormValues = z.infer<typeof schema>;

export default function WebhooksPage() {
  const qc = useQueryClient();
  const { getErrorMessage } = useApiError();
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});

  const { data, isLoading } = useQuery<WebhooksResponse>({
    queryKey: ['webhooks'],
    queryFn: () => apiClient.get(EP_WEBHOOKS).then((r) => r.data),
    staleTime: 60_000,
  });

  const createWebhook = useMutation({
    mutationFn: (values: { url: string }) => apiClient.post(EP_WEBHOOKS, values),
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

  const testWebhook = useMutation({
    mutationFn: (id: string) =>
      apiClient.post(EP_WEBHOOK_TEST(id)).then((r) => ({ id, result: r.data.data as TestResult })),
    onSuccess: ({ id, result }) => {
      setTestResults((prev) => ({ ...prev, [id]: result }));
      if (result.delivered) {
        toast.success(`Test enviado correctamente (HTTP ${result.statusCode})`);
      } else {
        toast.error(`Test fallido: ${result.error ?? `HTTP ${result.statusCode}`}`);
      }
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const webhooks: Webhook[] = Array.isArray(data?.data) ? data.data : [];

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Webhooks</h1>
        <p className="text-gray-500 text-sm mt-1">
          Recibe notificaciones en tu endpoint cuando ocurran alertas críticas en el ITM
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl px-5 py-4 text-sm text-primary">
        <p className="font-medium mb-1">¿Cómo funciona?</p>
        <p className="text-primary/80">
          Cada vez que se crea una alerta <strong>crítica</strong>, el sistema hace un POST
          a tu URL con el payload del evento. Para pruebas puedes usar{' '}
          <a href="https://webhook.site" target="_blank" rel="noopener noreferrer"
            className="underline font-medium">webhook.site</a>.
        </p>
      </div>

      {/* Create form */}
      <section className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Registrar webhook</h2>
        <form onSubmit={handleSubmit((v) => createWebhook.mutate({ url: v.url }))} noValidate className="flex gap-3">
          <div className="flex-1">
            <input
              type="url"
              placeholder="https://tu-servidor.com/webhook"
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.url ? 'border-red-400' : 'border-gray-300'
              }`}
              {...register('url')}
            />
            {errors.url && <p className="mt-1 text-xs text-red-500">{errors.url.message}</p>}
          </div>
          {/* Principio 7.2: min-h-[44px] */}
          <button
            type="submit"
            disabled={createWebhook.isPending}
            className="bg-primary hover:bg-primary-light text-white font-semibold px-5 min-h-[44px] rounded-lg text-sm
                       transition-all duration-150 ease-out disabled:opacity-60 flex-shrink-0"
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

        {isLoading && <div className="p-6"><SkeletonList rows={2} /></div>}

        {!isLoading && webhooks.length === 0 && (
          <p className="text-gray-500 text-sm p-6">No tienes webhooks registrados.</p>
        )}

        {!isLoading && webhooks.length > 0 && (
          <ul className="divide-y">
            {webhooks.map((wh) => {
              const testResult = testResults[wh.id];
              const isTesting = testWebhook.isPending && testWebhook.variables === wh.id;

              return (
                <li key={wh.id} className="px-6 py-4 space-y-2">
                  <div className="flex items-start justify-between gap-4">
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

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <TestWebhookButton
                        loading={isTesting}
                        onClick={() => testWebhook.mutate(wh.id)}
                      />
                      {/* Principio 7.2: min-h/w 44px en icon button */}
                      <button
                        onClick={() => deleteWebhook.mutate(wh.id)}
                        disabled={deleteWebhook.isPending}
                        aria-label="Eliminar webhook"
                        className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-150 ease-out disabled:opacity-50"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {/* Test result */}
                  {testResult && (
                    <div className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 ${
                      testResult.delivered
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {testResult.delivered
                        ? <CheckCircle2 size={14} />
                        : <XCircle size={14} />}
                      {testResult.delivered
                        ? `Entregado correctamente (HTTP ${testResult.statusCode})`
                        : `Falló: ${testResult.error ?? `HTTP ${testResult.statusCode}`}`}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ── TestWebhookButton ───────────────────────────────────────────── */
function TestWebhookButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    /* Principio 7.2: min-h-[44px] en botón de prueba */
    <button
      onClick={onClick}
      disabled={loading}
      aria-label="Enviar payload de prueba al webhook"
      className="flex items-center gap-1.5 min-h-[44px] text-xs font-medium px-3 rounded-lg border border-gray-200 text-gray-600
                 hover:border-primary hover:text-primary transition-all duration-150 ease-out disabled:opacity-50"
    >
      <FlaskConical size={14} className={loading ? 'animate-pulse' : ''} aria-hidden="true" />
      {loading ? 'Enviando…' : 'Probar'}
    </button>
  );
}
