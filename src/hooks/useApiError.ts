import { AxiosError } from 'axios';

interface ApiErrorBody {
  message?: string;
  error?: string;
}

export function useApiError() {
  const getErrorMessage = (error: unknown, fallback = 'Ocurrió un error inesperado'): string => {
    if (error instanceof AxiosError) {
      const data = error.response?.data as ApiErrorBody | undefined;
      return data?.message ?? data?.error ?? fallback;
    }
    if (error instanceof Error) return error.message;
    return fallback;
  };

  return { getErrorMessage };
}
