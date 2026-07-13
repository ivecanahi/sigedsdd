import { INSTITUCIONES_ENDPOINT } from '../../../config/endpoints';
import type { Institucion, InstitucionFormData, InstitucionListResponse } from '../types/institucion';

function getHeaders(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Token ${token}`,
  };
}

function buildQueryString(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.append(key, String(value));
    }
  });
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.detail || data.error || 'Error en la solicitud') as Error & { data: unknown; status: number };
    error.data = data;
    error.status = response.status;
    throw error;
  }
  return data as T;
}

export const institucionApi = {
  list: async (params?: { page?: number; page_size?: number; ordering?: string; nombre?: string }): Promise<InstitucionListResponse> => {
    const query = buildQueryString(params || {});
    const response = await fetch(`${INSTITUCIONES_ENDPOINT}${query}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<InstitucionListResponse>(response);
  },

  detail: async (id: number): Promise<Institucion> => {
    const response = await fetch(`${INSTITUCIONES_ENDPOINT}${id}/`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<Institucion>(response);
  },

  create: async (data: InstitucionFormData): Promise<Institucion> => {
    const response = await fetch(INSTITUCIONES_ENDPOINT, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Institucion>(response);
  },

  update: async (id: number, data: Partial<InstitucionFormData>): Promise<Institucion> => {
    const response = await fetch(`${INSTITUCIONES_ENDPOINT}${id}/`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Institucion>(response);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${INSTITUCIONES_ENDPOINT}${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const error = new Error(data.detail || data.error || 'Error al eliminar') as Error & { data: unknown; status: number };
      error.data = data;
      error.status = response.status;
      throw error;
    }
  },

  listByUser: async (): Promise<Institucion[]> => {
    const response = await fetch(`${INSTITUCIONES_ENDPOINT}usuario/`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<Institucion[]>(response);
  },
};
