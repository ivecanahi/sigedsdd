import { ASIGNATURAS_ENDPOINT } from '../../../config/endpoints';
import { getAuthHeaders } from '../../../config/api';
import type { Asignatura, AsignaturaFormData } from '../types/asignatura';

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

export const asignaturaApi = {
  listByGradoEscolar: async (gradoEscolarId: number): Promise<Asignatura[]> => {
    const response = await fetch(`${ASIGNATURAS_ENDPOINT}grados-escolares/${gradoEscolarId}/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse<Asignatura[]>(response);
  },

  detail: async (id: number): Promise<Asignatura> => {
    const response = await fetch(`${ASIGNATURAS_ENDPOINT}${id}/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse<Asignatura>(response);
  },

  create: async (data: AsignaturaFormData): Promise<Asignatura> => {
    const response = await fetch(ASIGNATURAS_ENDPOINT, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Asignatura>(response);
  },

  update: async (id: number, data: Partial<AsignaturaFormData>): Promise<Asignatura> => {
    const response = await fetch(`${ASIGNATURAS_ENDPOINT}${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Asignatura>(response);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${ASIGNATURAS_ENDPOINT}${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const error = new Error(data.detail || data.error || 'Error al eliminar asignatura') as Error & { data: unknown; status: number };
      error.data = data;
      error.status = response.status;
      throw error;
    }
  },
};
