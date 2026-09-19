import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, UserInfo } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api/auth';
  private readonly TOKEN_KEY = 'hospital_jwt_token';
  private readonly USER_KEY = 'hospital_user_info';

  private currentUserSubject = new BehaviorSubject<UserInfo | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  public login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap((res) => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        const userInfo: UserInfo = {
          username: res.username,
          nombre: res.nombre,
          apellido: res.apellido,
          email: res.email,
          roles: res.roles || [],
          permisos: res.permisos || []
        };
        localStorage.setItem(this.USER_KEY, JSON.stringify(userInfo));
        this.currentUserSubject.next(userInfo);
      })
    );
  }

  public logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  public getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  public getStoredUser(): UserInfo | null {
    const data = localStorage.getItem(this.USER_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  public isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Validación 100% basada en Roles del JWT/Backend.
   * PROHIBIDO validar accesos quemando nombres de usuario (ej. if user === 'admin').
   */
  public hasRole(roleName: string): boolean {
    const user = this.currentUserSubject.value;
    if (!user || !user.roles) return false;
    return user.roles.includes(roleName) || user.roles.includes(`ROLE_${roleName}`);
  }

  /**
   * Validación basada en Permisos del JWT/Backend.
   */
  public hasPermission(permissionName: string): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    // Si es Administrador, posee todos los permisos por definición
    if (this.hasRole('ADMINISTRADOR')) return true;
    return user.permisos ? user.permisos.includes(permissionName) : false;
  }
}
