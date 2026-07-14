import { PLANES_ESTUDIO_ENDPOINT } from '../../../config/endpoints';
import { getAuthHeaders } from '../../../config/api';
import type { PlanEstudio, PlanEstudioFormData, PlanEstudioListResponse } from '../types/planEstudio';

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

export const planEstudioApi = {
  list: async (params?: { page?: number; page_size?: number; ordering?: string; nombre?: string; institucion?: number }): Promise<PlanEstudioListResponse> => {
    const query = buildQueryString(params || {});
    const response = await fetch(`${PLANES_ESTUDIO_ENDPOINT}${query}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse<PlanEstudioListResponse>(response);
  },

  listByInstitucion: async (institucionId: number, params?: { page?: number; page_size?: number; ordering?: string; nombre?: string }): Promise<PlanEstudioListResponse> => {
    const query = buildQueryString(params || {});
    const response = await fetch(`${PLANES_ESTUDIO_ENDPOINT}instituciones/${institucionId}/${query}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse<PlanEstudioListResponse>(response);
  },

  detail: async (id: number): Promise<PlanEstudio> => {
    const response = await fetch(`${PLANES_ESTUDIO_ENDPOINT}${id}/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse<PlanEstudio>(response);
  },

  create: async (data: PlanEstudioFormData): Promise<PlanEstudio> => {
    const response = await fetch(PLANES_ESTUDIO_ENDPOINT, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<PlanEstudio>(response);
  },

  update: async (id: number, data: Partial<PlanEstudioFormData>): Promise<PlanEstudio> => {
    const response = await fetch(`${PLANES_ESTUDIO_ENDPOINT}${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<PlanEstudio>(response);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${PLANES_ESTUDIO_ENDPOINT}${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const error = new Error(data.detail || data.error || 'Error al eliminar plan de estudio') as Error & { data: unknown; status: number };
      error.data = data;
      error.status = response.status;
      throw error;
    }
  },
};
