import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Info, Zap, RefreshCw } from 'lucide-react';
import { apiClient } from '../../../api/client';
import { EP_ALERTS } from '../../../api/endpoints';
import { SkeletonList } from '../../../components/Skeleton';

interface Alert {
  id: string;
  title: string;
  body: string;
  severity: 'info' | 'warning' | 'critical';
  active: boolean;
  createdAt: string;
}
interface AlertsResponse {
  success: boolean;
  data: Alert[];
}

type SeverityFilter = 'all' | 'info' | 'warning' | 'critical';

const SEVERITY_CONFIG = {
  info:     { label: 'Info',     icon: Info,          bg: 'bg-blue-50',   border: 'border-blue-200',  text: 'text-blue-700',  badge: 'bg-blue-100 text-blue-700' },
  warning:  { label: 'Aviso',   icon: AlertTriangle,  bg: 'bg-yellow-50', border: 'border-yellow-200',text: 'text-yellow-700',badge: 'bg-yellow-100 text-yellow-700' },
  critical: { label: 'Crítico', icon: Zap,            bg: 'bg-red-50',    border: 'border-red-200',   text: 'text-red-700',   badge: 'bg-red-100 text-red-700' },
};

export default function AlertsPage() {
  const [filter, setFilter] = useState<SeverityFilter>('all');

  const { data, isLoading, isError, refetch, isFetching } = useQuery<AlertsResponse>({
    queryKey: ['alerts'],
    queryFn: () => apiClient.get(EP_ALERTS).then((r) => r.data),
    staleTime: 60_000,
  });

  const allAlerts: Alert[] = Array.isArray(data?.data) ? data.data : [];
  const alerts = filter === 'all' ? allAlerts : allAlerts.filter((a) => a.severity === filter);

  const counts = {
    all:      allAlerts.length,
    info:     allAlerts.filter((a) => a.severity === 'info').length,
    warning:  allAlerts.filter((a) => a.severity === 'warning').length,
    critical: allAlerts.filter((a) => a.severity === 'critical').length,
  };


  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          {/* Principio 2.2: h1 más prominente */}
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Alertas</h1>
          <p className="text-gray-500 text-sm mt-1">Avisos y comunicados del campus</p>
        </div>
        {/* Principio 7.2: min-h-[44px] en el botón de actualizar */}
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 min-h-[44px] px-3 text-sm text-gray-500 hover:text-primary rounded-lg hover:bg-gray-50 transition-all duration-150 ease-out disabled:opacity-50"
          aria-label="Actualizar alertas"
        >
          <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} aria-hidden="true" />
          Actualizar
        </button>
      </div>

      {/* Severity filter pills */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'info', 'warning', 'critical'] as const).map((sev) => {
          const isActive = filter === sev;
          const label = sev === 'all' ? 'Todas' : SEVERITY_CONFIG[sev].label;
          const count = counts[sev];
          return (
            <button
              key={sev}
              onClick={() => setFilter(sev)}
              /* Principio 7.2: min-h-[44px] para touch target en mobile */
              className={`inline-flex items-center gap-1 px-3 min-h-[44px] rounded-full text-xs font-semibold border transition-all duration-150 ease-out ${
                isActive
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
              }`}
            >
              {label}
              <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${isActive ? 'bg-white/20' : 'bg-gray-100'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {isLoading && <SkeletonList rows={5} />}

      {/* Error */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-3">
          <p className="text-red-700 text-sm font-medium">No se pudieron cargar las alertas.</p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 text-sm text-red-600 underline hover:no-underline"
          >
            <RefreshCw size={14} />
            Reintentar
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && alerts.length === 0 && (
        <div className="bg-white rounded-xl border p-8 text-center">
          <Info size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500 text-sm">
            {filter === 'all' ? 'No hay alertas activas en este momento.' : `No hay alertas de tipo "${SEVERITY_CONFIG[filter].label}".`}
          </p>
        </div>
      )}

      {/* Alert list */}
      {!isLoading && !isError && alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const cfg = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.info;
            const IconComp = cfg.icon;
            const dateStr = new Date(alert.createdAt).toLocaleDateString('es-CO', {
              day: 'numeric', month: 'short', year: 'numeric',
            });
            return (
              <article
                key={alert.id}
                className={`rounded-xl border p-4 flex gap-4 ${cfg.bg} ${cfg.border}`}
              >
                <div className={`mt-0.5 flex-shrink-0 ${cfg.text}`} aria-hidden="true">
                  <IconComp size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    {/* h2 dentro de article — Principio 2.2 */}
                    <h2 className={`font-semibold text-sm ${cfg.text}`}>{alert.title}</h2>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{alert.body}</p>
                  <p className="text-xs text-gray-400 mt-2">{dateStr}</p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
