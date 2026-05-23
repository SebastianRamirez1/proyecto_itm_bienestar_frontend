import { useQuery } from '@tanstack/react-query';
import { Clock, UtensilsCrossed, DollarSign, RefreshCw } from 'lucide-react';
import { apiClient } from '../../../api/client';
import { EP_CAFETERIA_MENU, EP_CAFETERIA_SCHEDULE, EP_CAFETERIA_PRICES } from '../../../api/endpoints';
import { SkeletonCard } from '../../../components/Skeleton';

/* ─── Types ─────────────────────────────────────────── */

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category: string;
  available: boolean;
}

interface ScheduleEntry {
  day: string;
  open: string;
  close: string;
}

interface PriceItem {
  id: string;
  name: string;
  price: number;
  category?: string;
}

interface MenuResponse     { data: MenuItem[] }
interface ScheduleResponse { data: ScheduleEntry[] }
interface PricesResponse   { data: PriceItem[] }

/* ─── Helpers ────────────────────────────────────────── */

function formatCOP(amount: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
}

function ErrorCard({ label, onRetry }: { label: string; onRetry: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center space-y-2">
      <p className="text-sm text-red-700">No se pudo cargar {label}.</p>
      <button onClick={onRetry} className="inline-flex items-center gap-1 text-xs text-red-600 underline hover:no-underline">
        <RefreshCw size={12} /> Reintentar
      </button>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────── */

export default function CafeteriaPage() {
  const menu = useQuery<MenuResponse>({
    queryKey: ['cafeteria-menu'],
    queryFn: () => apiClient.get(EP_CAFETERIA_MENU).then((r) => {
      const freshness = r.headers['x-data-freshness'] as string | undefined;
      return { ...r.data, _freshness: freshness };
    }),
    staleTime: 5 * 60_000,
  });

  const schedule = useQuery<ScheduleResponse>({
    queryKey: ['cafeteria-schedule'],
    queryFn: () => apiClient.get(EP_CAFETERIA_SCHEDULE).then((r) => r.data),
    staleTime: 30 * 60_000,
  });

  const prices = useQuery<PricesResponse>({
    queryKey: ['cafeteria-prices'],
    queryFn: () => apiClient.get(EP_CAFETERIA_PRICES).then((r) => r.data),
    staleTime: 30 * 60_000,
  });

  const menuItems: MenuItem[]       = Array.isArray(menu.data?.data)     ? menu.data.data     : [];
  const scheduleEntries: ScheduleEntry[] = Array.isArray(schedule.data?.data) ? schedule.data.data : [];
  const priceItems: PriceItem[]     = Array.isArray(prices.data?.data)   ? prices.data.data   : [];

  // Group menu by category
  const menuByCategory = menuItems.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const cat = item.category ?? 'General';
    (acc[cat] ??= []).push(item);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cafetería</h1>
        <p className="text-gray-500 text-sm mt-1">Menú del día, horarios y precios</p>
      </div>

      {/* ── Menú del día ─────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <UtensilsCrossed size={20} className="text-accent" />
          <h2 className="text-lg font-semibold text-gray-800">Menú del día</h2>
        </div>

        {menu.isLoading && (
          <div className="grid sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {menu.isError && <ErrorCard label="el menú" onRetry={() => menu.refetch()} />}

        {!menu.isLoading && !menu.isError && menuItems.length === 0 && (
          <div className="bg-white rounded-xl border p-6 text-center">
            <UtensilsCrossed size={28} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">No hay menú disponible por el momento.</p>
          </div>
        )}

        {!menu.isLoading && !menu.isError && menuItems.length > 0 && (
          <div className="space-y-4">
            {Object.entries(menuByCategory).map(([category, items]) => (
              <div key={category}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                  {category}
                </p>
                <div className="bg-white rounded-xl border divide-y overflow-hidden">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-4 py-3 gap-3">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${item.available ? 'text-gray-800' : 'text-gray-400 line-through'}`}>
                          {item.name}
                        </p>
                        {item.description && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {item.price != null && (
                          <span className="text-sm font-semibold text-accent">{formatCOP(item.price)}</span>
                        )}
                        {!item.available && (
                          <span className="text-xs bg-gray-100 text-gray-400 rounded-full px-2 py-0.5">Agotado</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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

          {schedule.isLoading && <SkeletonCard />}
          {schedule.isError && <ErrorCard label="horarios" onRetry={() => schedule.refetch()} />}

          {!schedule.isLoading && !schedule.isError && scheduleEntries.length === 0 && (
            <p className="text-gray-500 text-sm">Horarios no disponibles.</p>
          )}

          {!schedule.isLoading && !schedule.isError && scheduleEntries.length > 0 && (
            <div className="bg-white rounded-xl border divide-y overflow-hidden">
              {scheduleEntries.map((entry, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm font-medium text-gray-700">{entry.day}</span>
                  <span className="text-sm text-gray-500">{entry.open} – {entry.close}</span>
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

          {prices.isLoading && <SkeletonCard />}
          {prices.isError && <ErrorCard label="precios" onRetry={() => prices.refetch()} />}

          {!prices.isLoading && !prices.isError && priceItems.length === 0 && (
            <p className="text-gray-500 text-sm">Lista de precios no disponible.</p>
          )}

          {!prices.isLoading && !prices.isError && priceItems.length > 0 && (
            <div className="bg-white rounded-xl border divide-y overflow-hidden">
              {priceItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-4 py-3 gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                    {item.category && (
                      <p className="text-xs text-gray-400">{item.category}</p>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-accent flex-shrink-0">{formatCOP(item.price)}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
