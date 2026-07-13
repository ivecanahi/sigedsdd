import type { UsuarioRol } from './usuariorol';

export interface Institucion {
  id: number;
  nombre: string;
  codigo: string;
  ruc: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  autoridades_academicas?: UsuarioRol[];
}

export interface InstitucionFormData {
  nombre: string;
  codigo: string;
  ruc: string;
}

export interface InstitucionListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Institucion[];
}
