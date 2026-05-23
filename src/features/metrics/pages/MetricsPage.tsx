import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../api/client';
import { EP_METRICS } from '../../../api/endpoints';

interface ModuleMetric {
  count: number;
  avgMs: number;
}
interface MetricsData {
  data: {
    totalRequests: number;
    byModule: Record<string, ModuleMetric>;
  };
}

export default function MetricsPage() {
  const { data, isLoading, isError } = useQuery<MetricsData>({
    queryKey: ['metrics'],
    queryFn: () => apiClient.get(EP_METRICS).then((r) => r.data),
    refetchInterval: 30_000, // auto-refresh every 30s
  });

  const metrics = data?.data;
  const modules = Object.entries(metrics?.byModule ?? {});

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Métricas de la API</h1>
        <p className="text-gray-500 text-sm mt-1">Actualización automática cada 30 segundos</p>
      </div>

      {isLoading && <p className="text-gray-500 text-sm">Cargando métricas…</p>}
      {isError   && <p className="text-red-500 text-sm">No se pudieron cargar las métricas.</p>}

      {metrics && (
        <>
          <div className="bg-primary rounded-xl p-6 text-white">
            <p className="text-sm text-primary-50">Total de requests</p>
            <p className="text-5xl font-bold mt-1">{metrics.totalRequests.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Módulo</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600">Requests</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600">Avg ms</th>
                </tr>
              </thead>
              <tbody>
                {modules.map(([name, { count, avgMs }]) => (
                  <tr key={name} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-800 capitalize">{name}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{count.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{avgMs.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
