export interface UsuarioRol {
  id: number;
  usuario: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  rol: {
    id: number;
    nombre: string;
    nombre_display: string;
  };
  institucion: {
    id: number;
    nombre: string;
  } | null;
  es_activo: boolean;
  fecha_desde: string | null;
  fecha_hasta: string | null;
}

export interface UsuarioRolFormData {
  usuario: number;
  rol: number;
  institucion: number | null;
}

export interface Rol {
  id: number;
  nombre: string;
  nombre_display: string;
}
