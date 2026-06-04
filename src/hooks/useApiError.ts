import { AxiosError } from 'axios';

// Backend returns two possible shapes:
// Shape A (Fastify default): { statusCode, error: string, message: string }
// Shape B (custom AppError): { success: false, error: { code: string, message: string } }
interface ApiErrorBody {
  message?: string;
  error?: string | { code?: string; message?: string };
}

export function useApiError() {
  const getErrorMessage = (error: unknown, fallback = 'Ocurrió un error inesperado'): string => {
    if (error instanceof AxiosError) {
      const data = error.response?.data as ApiErrorBody | undefined;

      // Shape A: top-level message string
      if (typeof data?.message === 'string' && data.message) return data.message;

      // Shape B: error is an object with a message field
      if (typeof data?.error === 'object' && data.error !== null) {
        const msg = (data.error as { message?: string }).message;
        if (typeof msg === 'string' && msg) return msg;
      }

      // Shape A fallback: error is a plain string
      if (typeof data?.error === 'string' && data.error) return data.error;

      return fallback;
    }
    if (error instanceof Error) return error.message;
    return fallback;
  };

  return { getErrorMessage };
}
