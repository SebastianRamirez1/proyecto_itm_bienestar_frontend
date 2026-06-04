import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../api/client';
import { EP_METRICS } from '../../../api/endpoints';

// Real backend shape:
// { data: { uptime: { seconds, human }, requests: { total, byModule }, latency: { avgMs } } }
interface MetricsData {
  data: {
    uptime: { seconds: number; human: string };
    requests: { total: number; byModule: Record<string, number> };
    latency: { avgMs: Record<string, number> };
  };
}

function latencyColor(ms: number): string {
  if (ms === 0) return 'text-gray-400';
  if (ms < 100) return 'text-green-600';
  if (ms < 300) return 'text-yellow-600';
  return 'text-red-600';
}

export default function MetricsPage() {
  const { data, isLoading, isError } = useQuery<MetricsData>({
    queryKey: ['metrics'],
    queryFn: () => apiClient.get(EP_METRICS).then((r) => r.data),
    refetchInterval: import.meta.env.DEV ? false : 30_000,
  });

  const metrics = data?.data;
  const modules = Object.entries(metrics?.requests?.byModule ?? {});

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Métricas de la API</h1>
        <p className="text-gray-500 text-sm mt-1">
          {import.meta.env.DEV ? 'Actualización manual' : 'Actualización automática cada 30 segundos'}
        </p>
      </div>

      {isLoading && <p className="text-gray-500 text-sm">Cargando métricas…</p>}
      {isError   && <p className="text-red-500 text-sm">No se pudieron cargar las métricas.</p>}

      {metrics && (
        <>
          {/* Summary cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-primary rounded-xl p-6 text-white">
              <p className="text-sm text-primary-50">Total de requests</p>
              <p className="text-4xl font-bold mt-1">
                {metrics.requests.total.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-xl border p-6">
              <p className="text-sm text-gray-500">Tiempo activo</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.uptime.human}</p>
            </div>
          </div>

          {/* Module table */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-5 py-4 border-b">
              <h2 className="font-semibold text-gray-800">Por módulo</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Módulo</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600">Requests</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600">Avg ms</th>
                </tr>
              </thead>
              <tbody>
                {modules.map(([name, count]) => {
                  const avgMs = metrics.latency.avgMs[name] ?? 0;
                  return (
                    <tr key={name} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-800 capitalize">{name}</td>
                      <td className="px-5 py-3 text-right text-gray-600">
                        {count.toLocaleString()}
                      </td>
                      <td className={`px-5 py-3 text-right font-medium ${latencyColor(avgMs)}`}>
                        {avgMs === 0 ? 'Sin datos' : `${avgMs.toFixed(1)} ms`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
