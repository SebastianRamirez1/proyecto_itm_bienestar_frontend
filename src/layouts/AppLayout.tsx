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
  { to: '/dashboard',  label: 'Inicio',     icon: Home },
  { to: '/health',     label: 'Salud',       icon: HeartPulse },
  { to: '/resources',  label: 'Recursos',    icon: BookOpen },
  { to: '/events',     label: 'Eventos',     icon: Calendar },
  { to: '/cafeteria',  label: 'Cafetería',   icon: UtensilsCrossed },
  { to: '/alerts',     label: 'Alertas',     icon: Zap },
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

  /* Principio 7.2: min-h-[44px] garantiza target táctil de 44px en mobile */
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 min-h-[44px] rounded-lg text-sm font-medium transition-all duration-150 ease-out ${
      isActive
        ? 'bg-primary text-white'
        : 'text-gray-600 hover:bg-primary-50 hover:text-primary'
    }`;

  const Sidebar = () => (
    /* Principio 9.1: aria-label en <nav> */
    <nav aria-label="Navegación principal" className="flex flex-col h-full py-4 px-3 gap-1">
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
          <Icon size={18} aria-hidden="true" />
          {label}
        </NavLink>
      ))}

      {/* Admin nav — Principio 1.1: chunk separado con label */}
      {isAdmin && (
        <>
          <div className="mt-4 mb-1 px-3" role="separator" aria-label="Sección de administración">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin</span>
          </div>
          {adminItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClass} onClick={() => setSidebarOpen(false)}>
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </>
      )}

      {/* User + logout */}
      <div className="mt-auto border-t pt-4">
        <div className="px-3 py-2 mb-1">
          <p className="text-sm font-medium text-gray-800 truncate">{user?.email}</p>
          <p className="text-xs text-gray-400 capitalize truncate">{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          /* Principio 7.2: min-h-[44px] */
          className="flex items-center gap-3 w-full px-3 min-h-[44px] rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-150 ease-out"
        >
          <LogOut size={18} aria-hidden="true" />
          Cerrar sesión
        </button>
      </div>
    </nav>
  );

  return (
    <>
      {/* Principio 3.4: Skip link — visible solo con foco de teclado */}
      <a className="skip-link" href="#main-content">
        Saltar al contenido
      </a>

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
              aria-hidden="true"
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
            {/* Principio 7.2: min-h-[44px] min-w-[44px] en el botón hamburger */}
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={sidebarOpen}
              aria-controls="mobile-sidebar"
              className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-150"
            >
              {sidebarOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
            <span className="font-bold text-primary text-sm">Bienestar ITM</span>
          </header>

          {/* Page content — id para el skip link */}
          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 overflow-y-auto p-4 md:p-8 focus:outline-none"
          >
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}
