export const APP_NAME = 'SIGED';
export const APP_FULL_NAME = 'Sistema de Información y Gestión Educativa';

export const ROLES = {
  ADMINISTRADOR: 'ADMINISTRADOR',
  AUTORIDAD_ACADEMICA: 'AUTORIDAD_ACADEMICA',
  DOCENTE: 'DOCENTE',
  SECRETARIA: 'SECRETARIA',
  ESTUDIANTE: 'ESTUDIANTE',
  DECE: 'DECE',
} as const;

export const ROLE_LABELS: Record<string, string> = {
  [ROLES.ADMINISTRADOR]: 'Administrador',
  [ROLES.AUTORIDAD_ACADEMICA]: 'Autoridad Académica',
  [ROLES.DOCENTE]: 'Docente',
  [ROLES.SECRETARIA]: 'Secretaría',
  [ROLES.ESTUDIANTE]: 'Estudiante',
  [ROLES.DECE]: 'DECE',
};
