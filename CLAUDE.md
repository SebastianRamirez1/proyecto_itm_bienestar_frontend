# CLAUDE.md — Frontend ITM Bienestar

Guía para Claude Code en el repo frontend del proyecto ITM Bienestar.

---

## Comandos

```bash
npm run dev            # Vite dev server — http://localhost:5173
npm run build          # tsc -b && vite build (producción)
npm run type-check     # tsc --noEmit
npm run lint           # eslint . --ext .ts,.tsx
npm run lint:fix       # eslint con auto-fix
npm run format         # prettier sobre src/**

# Tests
npm test               # vitest run (una pasada)
npm run test:watch     # vitest en modo watch
npm run test:coverage  # vitest run --coverage
```

**Variables de entorno:** copiar `.env.example` → `.env.local`. La variable crítica es `VITE_API_URL` (URL del backend).

**Node:** `>=20.19.0` — igual que el backend. Usar `nvm use` para activar la versión de `.nvmrc`.

---

## Arquitectura

```
src/
├── api/
│   ├── client.ts        ← instancia de axios + interceptores (auth + silent refresh)
│   └── endpoints.ts     ← constantes de rutas (EP_AUTH_LOGIN, EP_HEALTH_SCHEDULE…)
│
├── store/
│   └── auth.store.ts    ← Zustand: { user, accessToken, refreshToken, isAuthenticated }
│                           NO persiste en localStorage (seguridad)
│
├── hooks/
│   ├── useAuth.ts       ← lee el store + deriva isAdmin
│   └── useApiError.ts   ← extrae mensaje legible de errores Axios (2 shapes del backend)
│
├── components/
│   ├── ProtectedRoute.tsx  ← redirige a /login si no autenticado; a /dashboard si rol incorrecto
│   ├── ErrorBoundary.tsx
│   └── Skeleton.tsx
│
├── layouts/
│   ├── AppLayout.tsx    ← sidebar + header (requiere auth)
│   └── AuthLayout.tsx   ← card centrado (login/register)
│
└── features/<nombre>/
    ├── pages/<NombrePage>.tsx      ← componente de página — fetch + render
    └── components/                 ← sub-componentes del feature
```

### Flujo de autenticación

```
LoginForm → POST /auth/login → useAuthStore.login(user, accessToken, refreshToken)
                                        ↓
                           apiClient.interceptors.request → adjunta Bearer token
                                        ↓
                           401 en cualquier endpoint → silent refresh via /auth/refresh
                                        ↓
                           Si refresh falla → useAuthStore.logout() → /login
```

---

## Patrones de código

### TanStack Query (datos del servidor)

```tsx
// Stale times configurados en main.tsx (1–10 min según módulo)
const { data, isLoading, isError } = useQuery({
  queryKey: ['cafeteria', 'menu'],
  queryFn: () => apiClient.get(EP_CAFETERIA_MENU).then(r => r.data.data),
});

// Guard obligatorio — el backend puede devolver null o array vacío
const items = Array.isArray(data?.items) ? data.items : [];
```

### Zustand (estado de auth)

```tsx
// Leer desde el hook, no directamente del store en componentes
const { isAuthenticated, isAdmin, user, login, logout } = useAuth();

// Acceso directo al store solo en interceptores o utilidades fuera de React
useAuthStore.getState().setAccessToken(newToken);
```

### Manejo de errores de API

```tsx
const { getErrorMessage } = useApiError();

try {
  await apiClient.post(EP_AUTH_LOGIN, values);
} catch (err) {
  toast.error(getErrorMessage(err, 'Credenciales inválidas'));
}
```

### Formularios (React Hook Form + Zod)

```tsx
const schema = z.object({ email: z.string().email() });
type FormValues = z.infer<typeof schema>;

const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
  resolver: zodResolver(schema),
});
```

### Accesibilidad (reglas no negociables)

```tsx
// Touch target mínimo 44px
<button className="min-h-[44px] ...">

// Iconos decorativos
<Icon aria-hidden="true" />

// Transición estándar
className="transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-md"
```

---

## Patrones de tests

Tests con Vitest + React Testing Library. No hay tests E2E.

```tsx
// Setup global: src/tests/setup.ts → import '@testing-library/jest-dom'
// Config:        vitest.config.ts  → globals: true, environment: jsdom

// Hooks (sin DOM)
const { result } = renderHook(() => useAuth());
expect(result.current.isAdmin).toBe(false);

// Componentes
render(<MemoryRouter><ProtectedRoute>...</ProtectedRoute></MemoryRouter>);
expect(screen.getByText('...')).toBeInTheDocument();

// Interacción con formularios
const user = userEvent.setup();
await user.type(screen.getByLabelText(/email/i), 'user@itm.edu.co');
await user.click(screen.getByRole('button', { name: /enviar/i }));
expect(await screen.findByText('...')).toBeInTheDocument();

// Mocks de API (siempre mockear apiClient, no axios directamente)
vi.mock('../../../api/client', () => ({ apiClient: { post: vi.fn() } }));
vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { data: { ... } } });

// Reset del store Zustand entre tests
beforeEach(() => {
  useAuthStore.setState({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
});
```

**Qué testear:**
- Hooks y store: lógica pura sin DOM
- `ProtectedRoute`: redirecciones según estado de auth
- Formularios: validación (errores visibles), submit correcto, errores de API

---

## Estructura de módulo frontend (patrón obligatorio)

```
src/features/<nombre>/
  ├── pages/<NombrePage>.tsx     ← página completa: fetch + layout + lógica
  └── components/                ← sub-componentes presentacionales del feature
```

- Un módulo no importa componentes de otro módulo directamente.
- Si se necesita estado compartido entre features, usar el store o React Context.

---

## Git workflow

Igual que el backend — ver STANDARDS.md en la memoria del proyecto.

```
feature/* o fix/*  →  PR → develop  →  CI verde  →  merge (squash)
                                              ↓
                                   develop → main  (sync PR)
```

### Checklist antes de abrir PR

- [ ] `npm run type-check` sin errores
- [ ] `npm run lint` sin errores
- [ ] `npm test` pasa
- [ ] Sin `console.log` de debug
- [ ] PR apunta a `develop`

---

## CI (GitHub Actions)

`.github/workflows/ci.yml` — job `Lint & Build`: lint + `tsc -b && vite build`.

No hay job de tests en CI todavía — al añadir tests considerarlo para el pipeline.

---

## Deploy

- **Vercel** — deploy automático en push a `main`.
- `vercel.json` contiene el rewrite SPA: todas las rutas apuntan a `index.html`.
- Variable de entorno `VITE_API_URL` configurada en el dashboard de Vercel.
