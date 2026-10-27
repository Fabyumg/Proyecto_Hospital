import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el servidor retorna 401 (Token invalido o expirado tras reinicio de llaves RSA)
      // Se excluye /auth/login: ahi un 401 significa credenciales incorrectas y lo maneja el formulario
      if (error.status === 401 && !req.url.includes('/api/auth/login')) {
        console.warn('Sesión expirada o token RSA inválido. Redirigiendo a inicio de sesión...');
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
