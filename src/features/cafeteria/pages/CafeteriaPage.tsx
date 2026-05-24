import { useQuery } from '@tanstack/react-query';
import { Clock, UtensilsCrossed, DollarSign, RefreshCw } from 'lucide-react';
import { apiClient } from '../../../api/client';
import { EP_CAFETERIA_MENU, EP_CAFETERIA_SCHEDULE, EP_CAFETERIA_PRICES } from '../../../api/endpoints';
import { SkeletonCard } from '../../../components/Skeleton';

/* ─── Types ─────────────────────────────────────────── */

interface MenuItem {
  name: string;
  category: string;
}

interface MenuData {
  id: string;
  date: string;
  items: MenuItem[];
  prices: Record<string, number>;
  scrapedAt: string;
}

interface ScheduleData {
  weekdays: string;
  saturday: string;
  sunday: string;
}

/* ─── Helpers ────────────────────────────────────────── */

function formatCOP(amount: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
  }).format(amount);
}

const CATEGORY_LABELS: Record<string, string> = {
  entrada:          'Entrada',
  plato_principal:  'Plato principal',
  bebida:           'Bebida',
  postre:           'Postre',
  acompañamiento:   'Acompañamiento',
};

function ErrorCard({ label, onRetry }: { label: string; onRetry: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center space-y-2">
      <p className="text-sm text-red-700">No se pudo cargar {label}.</p>
      {/* Principio 7.2: min-h-[44px] para touch target */}
      <button
        onClick={onRetry}
        className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 text-xs text-red-600 underline hover:no-underline transition-colors duration-150"
      >
        <RefreshCw size={12} aria-hidden="true" /> Reintentar
      </button>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────── */

export default function CafeteriaPage() {
  const menuQ = useQuery<{ success: boolean; data: MenuData }>({
    queryKey: ['cafeteria-menu'],
    queryFn: () => apiClient.get(EP_CAFETERIA_MENU).then((r) => r.data),
    staleTime: 5 * 60_000,
  });

  const scheduleQ = useQuery<{ success: boolean; data: ScheduleData }>({
    queryKey: ['cafeteria-schedule'],
    queryFn: () => apiClient.get(EP_CAFETERIA_SCHEDULE).then((r) => r.data),
    staleTime: 30 * 60_000,
  });

  const pricesQ = useQuery<{ success: boolean; data: Record<string, number> }>({
    queryKey: ['cafeteria-prices'],
    queryFn: () => apiClient.get(EP_CAFETERIA_PRICES).then((r) => r.data),
    staleTime: 30 * 60_000,
  });

  const menuData  = menuQ.data?.data;
  const menuItems: MenuItem[] = Array.isArray(menuData?.items) ? menuData!.items : [];
  const schedule  = scheduleQ.data?.data;
  const prices    = pricesQ.data?.data;

  // Group menu items by category
  const byCategory = menuItems.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const cat = item.category ?? 'otros';
    (acc[cat] ??= []).push(item);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        {/* Principio 2.2: h1 más prominente */}
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Cafetería</h1>
        <p className="text-gray-500 text-sm mt-1">Menú del día, horarios y precios</p>
      </div>

      {/* ── Menú del día ─────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <UtensilsCrossed size={20} className="text-accent" />
          <h2 className="text-lg font-semibold text-gray-800">Menú del día</h2>
          {menuData?.date && (
            <span className="text-xs text-gray-400 ml-1">
              {new Date(menuData.date).toLocaleDateString('es-CO', {
                weekday: 'long', day: 'numeric', month: 'long',
              })}
            </span>
          )}
        </div>

        {menuQ.isLoading && <SkeletonCard />}
        {menuQ.isError && <ErrorCard label="el menú" onRetry={() => menuQ.refetch()} />}

        {!menuQ.isLoading && !menuQ.isError && menuItems.length === 0 && (
          <div className="bg-white rounded-xl border p-6 text-center">
            <UtensilsCrossed size={28} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">No hay menú disponible por el momento.</p>
          </div>
        )}

        {!menuQ.isLoading && !menuQ.isError && menuItems.length > 0 && (
          <div className="bg-white rounded-xl border divide-y overflow-hidden">
            {Object.entries(byCategory).map(([cat, items]) => (
              <div key={cat}>
                <div className="px-4 py-2 bg-gray-50">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    {CATEGORY_LABELS[cat] ?? cat}
                  </span>
                </div>
                {items.map((item, i) => (
                  <div key={i} className="px-4 py-3 flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-800">{item.name}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Grid: Horarios + Precios ──────────────────── */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Horarios */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-gray-800">Horarios</h2>
          </div>

          {scheduleQ.isLoading && <SkeletonCard />}
          {scheduleQ.isError && <ErrorCard label="los horarios" onRetry={() => scheduleQ.refetch()} />}

          {!scheduleQ.isLoading && !scheduleQ.isError && !schedule && (
            <p className="text-gray-500 text-sm">Horarios no disponibles.</p>
          )}

          {schedule && (
            <div className="bg-white rounded-xl border divide-y overflow-hidden">
              {[
                { label: 'Lunes a viernes', value: schedule.weekdays },
                { label: 'Sábados',          value: schedule.saturday },
                { label: 'Domingos',          value: schedule.sunday   },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                  <span className="text-sm text-gray-500">{value}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Precios */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-gray-800">Lista de precios</h2>
          </div>

          {pricesQ.isLoading && <SkeletonCard />}
          {pricesQ.isError && <ErrorCard label="los precios" onRetry={() => pricesQ.refetch()} />}

          {!pricesQ.isLoading && !pricesQ.isError && !prices && (
            <p className="text-gray-500 text-sm">Precios no disponibles.</p>
          )}

          {prices && (
            <div className="bg-white rounded-xl border divide-y overflow-hidden">
              {Object.entries(prices).map(([name, price]) => (
                <div key={name} className="flex items-center justify-between px-4 py-3 gap-3">
                  <p className="text-sm font-medium text-gray-800">{name}</p>
                  <span className="text-sm font-semibold text-accent flex-shrink-0">
                    {formatCOP(price)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
