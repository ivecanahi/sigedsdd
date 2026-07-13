import { USUARIO_ROLES_ENDPOINT, USUARIOS_ENDPOINT } from '../../../config/endpoints';
import type { UsuarioRol, UsuarioRolFormData, Rol } from '../types/usuariorol';

function getHeaders(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Token ${token}`,
  };
}

function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
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

export const usuarioRolApi = {
  list: async (params?: { institucion?: number }): Promise<UsuarioRol[]> => {
    const query = buildQueryString(params || {});
    const response = await fetch(`${USUARIO_ROLES_ENDPOINT}${query}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<UsuarioRol[]>(response);
  },

  listRoles: async (): Promise<Rol[]> => {
    const response = await fetch(`${USUARIO_ROLES_ENDPOINT}roles/`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<Rol[]>(response);
  },

  create: async (data: UsuarioRolFormData): Promise<UsuarioRol> => {
    const response = await fetch(USUARIO_ROLES_ENDPOINT, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<UsuarioRol>(response);
  },

  update: async (id: number, data: Partial<UsuarioRolFormData>): Promise<UsuarioRol> => {
    const response = await fetch(`${USUARIO_ROLES_ENDPOINT}${id}/`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<UsuarioRol>(response);
  },

  toggle: async (id: number, es_activo: boolean): Promise<UsuarioRol> => {
    const response = await fetch(`${USUARIO_ROLES_ENDPOINT}${id}/estado/`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ es_activo }),
    });
    return handleResponse<UsuarioRol>(response);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${USUARIO_ROLES_ENDPOINT}${id}/`, {
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
};

export interface Usuario {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  numero_identificacion: string;
  is_active: boolean;
}

export const usuariosApi = {
  list: async (params?: { activo?: boolean }): Promise<Usuario[]> => {
    const query = buildQueryString(params || {});
    const response = await fetch(`${USUARIOS_ENDPOINT}${query}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<Usuario[]>(response);
  },
};
