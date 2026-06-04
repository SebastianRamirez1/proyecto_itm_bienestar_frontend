import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AuthLayout      from './layouts/AuthLayout';
import AppLayout       from './layouts/AppLayout';
import ProtectedRoute  from './components/ProtectedRoute';

import LoginPage     from './features/auth/pages/LoginPage';
import RegisterPage  from './features/auth/pages/RegisterPage';

import DashboardPage  from './features/dashboard/pages/DashboardPage';
import HealthPage     from './features/health/pages/HealthPage';
import ResourcesPage  from './features/resources/pages/ResourcesPage';
import EventsPage     from './features/events/pages/EventsPage';
import AlertsPage     from './features/alerts/pages/AlertsPage';
import CafeteriaPage  from './features/cafeteria/pages/CafeteriaPage';
import MetricsPage    from './features/metrics/pages/MetricsPage';
import WebhooksPage   from './features/webhooks/pages/WebhooksPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public — redirect to /dashboard if already authenticated */}
        <Route element={<AuthLayout />}>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected — require authentication */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard"  element={<DashboardPage />} />
          <Route path="/health"     element={<HealthPage />} />
          <Route path="/resources"  element={<ResourcesPage />} />
          <Route path="/events"     element={<EventsPage />} />
          <Route path="/alerts"     element={<AlertsPage />} />
          <Route path="/cafeteria"  element={<CafeteriaPage />} />

          {/* Admin-only routes */}
          <Route
            path="/metrics"
            element={
              <ProtectedRoute requiredRole="admin">
                <MetricsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/webhooks"
            element={
              <ProtectedRoute requiredRole="admin">
                <WebhooksPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
