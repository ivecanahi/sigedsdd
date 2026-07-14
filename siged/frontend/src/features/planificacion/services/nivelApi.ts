import { EDUCACION_NIVELES_ENDPOINT } from '../../../config/endpoints';
import { getAuthHeaders } from '../../../config/api';
import type { Nivel } from '../types/nivel';

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.detail || data.error || 'Request error') as Error & { data: unknown; status: number };
    error.data = data;
    error.status = response.status;
    throw error;
  }
  return data as T;
}

export const nivelApi = {
  list: async (): Promise<Nivel[]> => {
    const response = await fetch(EDUCACION_NIVELES_ENDPOINT, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse<Nivel[]>(response);
  },
};
