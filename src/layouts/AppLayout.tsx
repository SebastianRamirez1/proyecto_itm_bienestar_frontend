import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  HeartPulse,
  BookOpen,
  Calendar,
  Zap,
  UtensilsCrossed,
  Webhook,
  BarChart2,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/auth.store';
import { apiClient } from '../api/client';
import { EP_AUTH_LOGOUT } from '../api/endpoints';

const navItems = [
  { to: '/dashboard',  label: 'Inicio',        icon: Home },
  { to: '/health',     label: 'Salud',          icon: HeartPulse },
  { to: '/resources',  label: 'Recursos',       icon: BookOpen },
  { to: '/events',     label: 'Eventos',        icon: Calendar },
  { to: '/cafeteria',  label: 'Cafetería',      icon: UtensilsCrossed },
  { to: '/alerts',     label: 'Alertas',        icon: Zap },
];

const adminItems = [
  { to: '/webhooks', label: 'Webhooks', icon: Webhook },
  { to: '/metrics',  label: 'Métricas', icon: BarChart2 },
];

export default function AppLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    const refreshToken = useAuthStore.getState().refreshToken;
    try {
      await apiClient.post(EP_AUTH_LOGOUT, { refreshToken });
    } finally {
      logout();
      navigate('/login', { replace: true });
    }
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary text-white'
        : 'text-gray-600 hover:bg-primary-50 hover:text-primary'
    }`;

  const Sidebar = () => (
    <nav className="flex flex-col h-full py-4 px-3 gap-1">
      {/* Brand */}
      <div className="flex items-center gap-2 px-3 py-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-extrabold">ITM</span>
        </div>
        <span className="text-gray-900 font-bold text-sm leading-tight">
          Bienestar<br />
          <span className="text-gray-400 font-normal text-xs">ITM</span>
        </span>
      </div>

      {/* Main nav */}
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} className={linkClass} onClick={() => setSidebarOpen(false)}>
          <Icon size={18} />
          {label}
        </NavLink>
      ))}

      {/* Admin nav */}
      {isAdmin && (
        <>
          <div className="mt-4 mb-1 px-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin</span>
          </div>
          {adminItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClass} onClick={() => setSidebarOpen(false)}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </>
      )}

      {/* User + logout at the bottom */}
      <div className="mt-auto border-t pt-4">
        <div className="px-3 py-2 mb-2">
          <p className="text-sm font-medium text-gray-800 truncate">{user?.email}</p>
          <p className="text-xs text-gray-400 capitalize truncate">{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </nav>
  );

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 flex-shrink-0 border-r bg-white flex-col">
        <Sidebar />
      </aside>

      {/* Mobile overlay sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-50 w-56 bg-white flex flex-col shadow-xl">
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Abrir menú"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <span className="font-bold text-primary text-sm">Bienestar ITM</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
