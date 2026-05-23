import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { AlertTriangle, UtensilsCrossed, Calendar, HeartPulse, Zap, BookOpen } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { apiClient } from '../../../api/client';
import { EP_ALERTS, EP_EVENTS, EP_CAFETERIA_MENU, EP_HEALTH_TIPS } from '../../../api/endpoints';
import { SkeletonCard } from '../../../components/Skeleton';

/* ─── Types ─────────────────────────────────────────── */

interface Alert {
  id: string; title: string; message: string;
  severity: 'info' | 'warning' | 'critical'; isActive: boolean;
}
interface Event {
  id: string; title: string; date: string; location: string;
  capacity: number; enrolledCount: number; isEnrolled?: boolean;
}
interface MenuItem {
  id: string; name: string; price?: number; available: boolean; category: string;
}
interface Tip {
  id: string; content: string; category?: string;
}
interface AlertsResponse  { data: Alert[] }
interface EventsResponse  { data: Event[] }
interface MenuResponse    { data: MenuItem[] }
interface TipsResponse    { data: Tip[] }

/* ─── Helpers ────────────────────────────────────────── */

function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}

/* ─── Page ───────────────────────────────────────────── */

export default function DashboardPage() {
  const { user } = useAuth();

  const alertsQ = useQuery<AlertsResponse>({
    queryKey: ['alerts'],
    queryFn: () => apiClient.get(EP_ALERTS).then((r) => r.data),
    staleTime: 60_000,
  });

  const eventsQ = useQuery<EventsResponse>({
    queryKey: ['events'],
    queryFn: () => apiClient.get(EP_EVENTS).then((r) => r.data),
    staleTime: 2 * 60_000,
  });

  const menuQ = useQuery<MenuResponse>({
    queryKey: ['cafeteria-menu'],
    queryFn: () => apiClient.get(EP_CAFETERIA_MENU).then((r) => r.data),
    staleTime: 5 * 60_000,
  });

  const tipsQ = useQuery<TipsResponse>({
    queryKey: ['health-tips'],
    queryFn: () => apiClient.get(EP_HEALTH_TIPS).then((r) => r.data),
    staleTime: 10 * 60_000,
  });

  // Derived data
  const criticalAlerts = (alertsQ.data?.data ?? []).filter(
    (a) => a.isActive && (a.severity === 'critical' || a.severity === 'warning'),
  );
  const upcomingEvents = (eventsQ.data?.data ?? []).slice(0, 3);
  const menuItems = (menuQ.data?.data ?? []).filter((m) => m.available).slice(0, 5);
  const tip = (tipsQ.data?.data ?? [])[0];

  const username = user?.email?.split('@')[0] ?? 'estudiante';

  return (
    <div className="max-w-4xl space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hola, {username} 👋</h1>
        <p className="text-gray-500 text-sm mt-1">Bienvenido al portal de Bienestar Universitario ITM</p>
      </div>

      {/* ── Active alerts banner ─────────────────────── */}
      {criticalAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-700">
              {criticalAlerts.length === 1 ? 'Hay 1 alerta activa' : `Hay ${criticalAlerts.length} alertas activas`}
            </p>
            <p className="text-sm text-red-600 mt-0.5 line-clamp-1">{criticalAlerts[0].title}</p>
          </div>
          <Link
            to="/alerts"
            className="text-xs font-semibold text-red-700 underline hover:no-underline flex-shrink-0"
          >
            Ver todas
          </Link>
        </div>
      )}

      {/* ── Quick nav cards ──────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: '/health',    label: 'Salud',      icon: HeartPulse,     color: 'bg-blue-50   text-blue-700  border-blue-200' },
          { to: '/resources', label: 'Recursos',   icon: BookOpen,        color: 'bg-green-50  text-green-700 border-green-200' },
          { to: '/events',    label: 'Eventos',    icon: Calendar,        color: 'bg-purple-50 text-purple-700 border-purple-200' },
          { to: '/alerts',    label: 'Alertas',    icon: Zap,             color: 'bg-orange-50 text-orange-700 border-orange-200' },
        ].map(({ to, label, icon: Icon, color }) => (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition hover:shadow-md ${color}`}
          >
            <Icon size={22} />
            <span className="text-xs font-semibold">{label}</span>
          </Link>
        ))}
      </div>

      {/* ── Two-column content ───────────────────────── */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Upcoming events */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Calendar size={18} className="text-accent" />
              Próximos eventos
            </h2>
            <Link to="/events" className="text-xs text-primary hover:underline font-medium">Ver todos</Link>
          </div>

          {eventsQ.isLoading && <SkeletonCard />}

          {eventsQ.isError && (
            <p className="text-sm text-gray-400">No se pudieron cargar los eventos.</p>
          )}

          {!eventsQ.isLoading && !eventsQ.isError && upcomingEvents.length === 0 && (
            <div className="bg-white rounded-xl border p-4 text-center">
              <p className="text-sm text-gray-400">No hay eventos próximos.</p>
            </div>
          )}

          {!eventsQ.isLoading && !eventsQ.isError && upcomingEvents.length > 0 && (
            <div className="bg-white rounded-xl border divide-y overflow-hidden">
              {upcomingEvents.map((e) => {
                const dateStr = new Date(e.date).toLocaleDateString('es-CO', {
                  weekday: 'short', month: 'short', day: 'numeric',
                });
                const spotsLeft = e.capacity - e.enrolledCount;
                return (
                  <div key={e.id} className="px-4 py-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{e.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{dateStr} · {e.location}</p>
                    </div>
                    <span className={`text-xs font-medium flex-shrink-0 ${spotsLeft > 0 ? 'text-accent' : 'text-gray-400'}`}>
                      {spotsLeft > 0 ? `${spotsLeft} cupos` : 'Sin cupos'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Today's menu preview */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <UtensilsCrossed size={18} className="text-accent" />
              Menú de hoy
            </h2>
            <Link to="/cafeteria" className="text-xs text-primary hover:underline font-medium">Ver completo</Link>
          </div>

          {menuQ.isLoading && <SkeletonCard />}

          {menuQ.isError && (
            <p className="text-sm text-gray-400">No se pudo cargar el menú.</p>
          )}

          {!menuQ.isLoading && !menuQ.isError && menuItems.length === 0 && (
            <div className="bg-white rounded-xl border p-4 text-center">
              <p className="text-sm text-gray-400">No hay menú disponible.</p>
            </div>
          )}

          {!menuQ.isLoading && !menuQ.isError && menuItems.length > 0 && (
            <div className="bg-white rounded-xl border divide-y overflow-hidden">
              {menuItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-4 py-3 gap-3">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                  {item.price != null && (
                    <span className="text-xs font-semibold text-accent flex-shrink-0">{formatCOP(item.price)}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── Health tip ───────────────────────────────── */}
      {tip && (
        <section className="bg-accent/5 border border-accent/20 rounded-xl p-4 flex gap-3">
          <HeartPulse size={20} className="text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-1">Tip de bienestar</p>
            <p className="text-sm text-gray-700">{tip.content}</p>
          </div>
        </section>
      )}
    </div>
  );
}
