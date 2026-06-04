# ITM Bienestar — Frontend

**🚀 Live:** https://proyecto-itm-bienestar-frontend.vercel.app  
**🔗 API:** https://proyectoitmbienestar-production.up.railway.app/docs  
**📦 Backend:** https://github.com/SebastianRamirez1/proyecto_itm_bienestar

SPA del portal de **Bienestar Universitario del ITM** — Medellín, Colombia. Centraliza en una sola interfaz los servicios de salud mental, cafetería, biblioteca, eventos y alertas institucionales que antes estaban dispersos entre WhatsApp, Instagram y distintas páginas del sitio oficial.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | React 18 + TypeScript 5 |
| Build | Vite 5 |
| Estilos | Tailwind CSS v3 (colores ITM) |
| Routing | React Router v6 |
| Server state | TanStack Query v5 |
| Client state | Zustand |
| HTTP | Axios con interceptores JWT |
| Validación | Zod + React Hook Form |
| Notificaciones | Sonner |
| Iconos | Lucide React |
| Deploy | Vercel |

---

## Páginas

| Ruta | Página | Descripción |
|---|---|---|
| `/login` | LoginPage | Autenticación con correo institucional |
| `/register` | RegisterPage | Registro (`@itm.edu.co` · `@correo.itm.edu.co`) |
| `/dashboard` | DashboardPage | Alertas activas, próximos eventos, menú del día, tip de bienestar |
| `/health` | HealthPage | Solicitar cita psicológica · mis citas · contactos de emergencia |
| `/resources` | ResourcesPage | Catálogo de libros de biblioteca agrupado por categoría |
| `/events` | EventsPage | Eventos ITM con inscripción en un clic |
| `/cafeteria` | CafeteriaPage | Menú del día · horarios · lista de precios |
| `/alerts` | AlertsPage | Alertas institucionales con filtro por severidad |
| `/metrics` | MetricsPage | Dashboard de métricas del sistema _(solo admin)_ |
| `/webhooks` | WebhooksPage | Gestión de webhooks con botón de prueba _(solo admin)_ |

---

## Highlights técnicos

### Autenticación con refresh silencioso
Zustand almacena `{ user, accessToken, refreshToken }` en memoria (no localStorage). El interceptor de Axios detecta respuestas `401`, hace `POST /auth/refresh` con el refresh token en el body, reintenta la request original y encola las requests paralelas que lleguen durante el refresh. Las rutas `/auth/*` están excluidas del interceptor para evitar bucles.

### Protección de rutas por rol
`<ProtectedRoute requiredRole="admin">` lee el store de Zustand. Si el usuario no está autenticado redirige a `/login`; si está autenticado pero no tiene el rol requerido redirige a `/dashboard`.

### Guards `Array.isArray` en todas las queries
El backend usa nombres de campo distintos según el módulo (`events`, `books`, `data`). Todas las páginas usan `Array.isArray(data?.field) ? data.field : []` para evitar crashes cuando la respuesta no es un array iterable.

### Skeletons en lugar de spinners
Componentes `<Skeleton>`, `<SkeletonCard>` y `<SkeletonList>` con `animate-pulse` reemplazan los estados de carga. Cada página tiene su propio estado de error con botón "Reintentar" que llama a `refetch()`.

### Error boundary global
`<ErrorBoundary>` (class component) envuelve toda la app en `main.tsx`. Captura errores de render e impide la pantalla en blanco, mostrando un mensaje de recuperación con botón de recarga.

---

## Variables de entorno

Crea un archivo `.env.local` en la raíz:

```env
VITE_API_BASE_URL=https://proyectoitmbienestar-production.up.railway.app/api/v1
```

Para desarrollo local apuntando al backend local:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

---

## Instalación y desarrollo

```bash
# Clonar el repositorio
git clone https://github.com/SebastianRamirez1/proyecto_itm_bienestar_frontend.git
cd proyecto_itm_bienestar_frontend

# Instalar dependencias
npm install

# Iniciar en desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview
```

---

## Estructura del proyecto

```
src/
├── api/
│   ├── client.ts          # Axios instance + interceptores JWT + refresh
│   └── endpoints.ts       # Constantes de todos los endpoints del backend
├── components/
│   ├── ErrorBoundary.tsx  # Captura errores globales de render
│   ├── ProtectedRoute.tsx # Guard de autenticación y rol
│   └── Skeleton.tsx       # Skeleton, SkeletonCard, SkeletonList
├── features/
│   ├── auth/              # LoginPage, RegisterPage, LoginForm, RegisterForm
│   ├── alerts/            # AlertsPage — filtro por severidad
│   ├── cafeteria/         # CafeteriaPage — menú, horarios, precios
│   ├── dashboard/         # DashboardPage — vista general con datos reales
│   ├── events/            # EventsPage — listado e inscripción
│   ├── health/            # HealthPage — citas, emergencias
│   ├── metrics/           # MetricsPage — admin only
│   ├── resources/         # ResourcesPage — catálogo biblioteca
│   └── webhooks/          # WebhooksPage — admin only, con test button
├── hooks/
│   ├── useApiError.ts     # Extrae string legible de errores Axios
│   └── useAuth.ts         # Wrapper de Zustand auth store
├── layouts/
│   ├── AppLayout.tsx      # Sidebar + outlet para rutas protegidas
│   └── AuthLayout.tsx     # Layout centrado para login/registro
├── store/
│   └── auth.store.ts      # Zustand: user, accessToken, refreshToken
└── App.tsx                # Router con rutas públicas y protegidas
```

---

## Deploy

El proyecto se despliega automáticamente en **Vercel** en cada push a `main`.

El archivo `vercel.json` configura el rewrite necesario para el routing del lado del cliente:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Colores ITM (Tailwind)

| Token | Valor | Uso |
|---|---|---|
| `primary` | `#003087` | Azul institucional — navbar, botones principales |
| `accent` | `#00843D` | Verde ITM — botones secundarios, precios |
| `surface` | `#F8FAFC` | Fondo de la app |
