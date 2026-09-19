export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  username: string;
  nombre: string;
  apellido: string;
  email: string;
  roles: string[];
  permisos: string[];
}

export interface UserInfo {
  username: string;
  nombre: string;
  apellido: string;
  email: string;
  roles: string[];
  permisos: string[];
}
