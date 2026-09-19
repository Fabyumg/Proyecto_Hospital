export interface Paciente {
  id?: number;
  nombre: string;
  apellido: string;
  dpi: string;
  telefono?: string;
  correo?: string;
  fechaNacimiento?: string;
  edad?: number;
  activo: boolean;
  fechaCreacion?: string;
}

export interface PacienteFilter {
  nombre?: string;
  apellido?: string;
  dpi?: string;
  activo?: boolean | string;
  page?: number;
  size?: number;
}

export interface PaginationMetadata {
  totalRecords: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  metadata: PaginationMetadata;
}
