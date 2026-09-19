import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as Array<string>;
  const requiredPermission = route.data['permission'] as string;

  // 1. Si no está autenticado
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // 2. Validación de permiso específico si está definido en la ruta
  if (requiredPermission && authService.hasPermission(requiredPermission)) {
    return true;
  }

  // 3. Validación por roles
  if (requiredRoles && requiredRoles.length > 0) {
    const hasAnyRole = requiredRoles.some((role) => authService.hasRole(role));
    if (hasAnyRole) {
      return true;
    }
  }

  // Si no se definieron requisitos específicos pero el usuario está autenticado
  if (!requiredRoles && !requiredPermission) {
    return true;
  }

  // Redireccionar si no posee permisos/roles
  alert('Acceso denegado: No tienes permisos suficientes para acceder a esta vista.');
  router.navigate(['/dashboard']);
  return false;
};
