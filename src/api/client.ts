import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/auth.store';

const BASE_URL = import.meta.env.VITE_API_URL as string;

// Auth routes that should never trigger the silent-refresh interceptor
const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: attach access token ─────────────────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: silent refresh on 401 ──────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const requestPath = originalRequest?.url ?? '';
    const isAuthRoute = AUTH_PATHS.some((p) => requestPath.includes(p));
    const storedRefreshToken = useAuthStore.getState().refreshToken;

    // Don't attempt refresh for auth routes, retried requests, or if no refresh token stored
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isAuthRoute ||
      !storedRefreshToken
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post<{ data: { accessToken: string } }>(
        `${BASE_URL}/api/v1/auth/refresh`,
        { refreshToken: storedRefreshToken },
        { withCredentials: true },
      );
      const newToken = data.data.accessToken;
      useAuthStore.getState().setAccessToken(newToken);
      processQueue(null, newToken);
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      useAuthStore.getState().logout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
