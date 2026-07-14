export interface Asignatura {
  id: number;
  nombre: string;
  pp_semana_minimo: number;
  pp_semana_maximo: number | null;
  carga_pedagogica_total: number;
  alerta_carga_pedagogica: boolean;
  grado_escolar: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface AsignaturaFormData {
  nombre: string;
  pp_semana_minimo: number;
  pp_semana_maximo: number | null;
  grado_escolar: number;
}
