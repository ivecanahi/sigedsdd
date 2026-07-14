export interface PlanEstudio {
  id: number;
  nombre: string;
  es_activo: boolean;
  institucion: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface PlanEstudioFormData {
  nombre: string;
  es_activo: boolean;
  institucion: number;
}

export interface PlanEstudioListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PlanEstudio[];
}
