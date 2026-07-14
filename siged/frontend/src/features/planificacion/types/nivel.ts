export interface Subnivel {
  id: number;
  nombre: string;
  orden: number;
}

export interface Nivel {
  id: number;
  nombre: string;
  orden: number;
  subniveles: Subnivel[];
}
