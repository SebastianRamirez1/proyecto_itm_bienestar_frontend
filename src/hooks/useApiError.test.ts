import { renderHook } from '@testing-library/react';
import { AxiosError, type AxiosResponse } from 'axios';
import { useApiError } from './useApiError';

function makeAxiosError(data: unknown, status = 400): AxiosError {
  const err = new AxiosError('Request failed');
  err.response = {
    data,
    status,
    statusText: 'Bad Request',
    headers: {},
    config: { headers: {} } as AxiosError['config'],
  } as AxiosResponse;
  return err;
}

describe('useApiError', () => {
  it('extracts message from Shape A (Fastify default — top-level message string)', () => {
    const { result } = renderHook(() => useApiError());
    const err = makeAxiosError({ statusCode: 409, error: 'Conflict', message: 'Email already in use' });
    expect(result.current.getErrorMessage(err)).toBe('Email already in use');
  });

  it('extracts message from Shape B (AppError — error object with message)', () => {
    const { result } = renderHook(() => useApiError());
    const err = makeAxiosError({ success: false, error: { code: 'CONFLICT', message: 'User already exists' } });
    expect(result.current.getErrorMessage(err)).toBe('User already exists');
  });

  it('extracts string from Shape A fallback (error is a plain string)', () => {
    const { result } = renderHook(() => useApiError());
    const err = makeAxiosError({ error: 'Bad Request' });
    expect(result.current.getErrorMessage(err)).toBe('Bad Request');
  });

  it('returns custom fallback when response data has no recognisable message', () => {
    const { result } = renderHook(() => useApiError());
    const err = makeAxiosError({});
    expect(result.current.getErrorMessage(err, 'Credenciales inválidas')).toBe('Credenciales inválidas');
  });

  it('returns default fallback when response data has no recognisable message and no custom fallback', () => {
    const { result } = renderHook(() => useApiError());
    const err = makeAxiosError({});
    expect(result.current.getErrorMessage(err)).toBe('Ocurrió un error inesperado');
  });

  it('returns error.message for plain Error instances', () => {
    const { result } = renderHook(() => useApiError());
    expect(result.current.getErrorMessage(new Error('network timeout'))).toBe('network timeout');
  });

  it('returns fallback for unknown error types (string, number, etc.)', () => {
    const { result } = renderHook(() => useApiError());
    expect(result.current.getErrorMessage('something went wrong')).toBe('Ocurrió un error inesperado');
    expect(result.current.getErrorMessage(null)).toBe('Ocurrió un error inesperado');
  });
});
