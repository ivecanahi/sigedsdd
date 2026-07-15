import type { Nivel } from './nivel';

export interface GradoEscolar {
  id: number;
  nombre: string;
  orden: number;
  nivel: Nivel;
  subnivel: {
    id: number;
    nombre: string;
    orden: number;
  } | null;
  carga_pedagogica_actual: number;
  carga_pedagogica_minima: number;
  alerta_carga_pedagogica: boolean;
  plan_estudio: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface GradoEscolarFormData {
  nombre: string;
  orden: number;
  nivel: number;
  subnivel: number | null;
  plan_estudio: number;
}

export interface GradoEscolarListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GradoEscolar[];
}
