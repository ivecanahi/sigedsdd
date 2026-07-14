import { LOGIN_ENDPOINT, LOGOUT_ENDPOINT } from '../../../config/endpoints';
import { getAuthHeaders } from '../../../config/api';

export interface LoginResponse {
  token: string;
  usuario: {
    id: number;
    numero_identificacion: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
  };
}

export interface ApiError {
  error?: string;
  [key: string]: string[] | string | undefined;
}

export async function login(
  numero_identificacion: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch(LOGIN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ numero_identificacion, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || 'Error de autenticación') as Error & { data: ApiError; status: number };
    error.data = data;
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function logout(_token: string): Promise<{ mensaje: string }> {
  const response = await fetch(LOGOUT_ENDPOINT, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || 'Error al cerrar sesión') as Error & { data: ApiError; status: number };
    error.data = data;
    error.status = response.status;
    throw error;
  }

  return data;
}
