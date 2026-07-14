import { GRADOS_ESCOLARES_ENDPOINT } from '../../../config/endpoints';
import { getAuthHeaders } from '../../../config/api';
import type { GradoEscolar, GradoEscolarFormData, GradoEscolarListResponse } from '../types/gradoEscolar';

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

export const gradoEscolarApi = {
  listByPlanEstudio: async (planEstudioId: number, params?: { page?: number; page_size?: number; ordering?: string; nombre?: string }): Promise<GradoEscolarListResponse> => {
    const query = buildQueryString(params || {});
    const response = await fetch(`${GRADOS_ESCOLARES_ENDPOINT}planes-estudio/${planEstudioId}/${query}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse<GradoEscolarListResponse>(response);
  },

  detail: async (id: number): Promise<GradoEscolar> => {
    const response = await fetch(`${GRADOS_ESCOLARES_ENDPOINT}${id}/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse<GradoEscolar>(response);
  },

  create: async (data: GradoEscolarFormData): Promise<GradoEscolar> => {
    const response = await fetch(GRADOS_ESCOLARES_ENDPOINT, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<GradoEscolar>(response);
  },

  update: async (id: number, data: Partial<GradoEscolarFormData>): Promise<GradoEscolar> => {
    const response = await fetch(`${GRADOS_ESCOLARES_ENDPOINT}${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<GradoEscolar>(response);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${GRADOS_ESCOLARES_ENDPOINT}${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const error = new Error(data.detail || data.error || 'Error al eliminar grado escolar') as Error & { data: unknown; status: number };
      error.data = data;
      error.status = response.status;
      throw error;
    }
  },
};
