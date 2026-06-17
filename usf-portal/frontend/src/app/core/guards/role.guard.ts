// Guard de autorización por rol — complementa authGuard.
// Cada ruta protegida declara data: { roles: ['alumno'] } y este guard
// verifica que el rol del usuario coincida; si no, redirige a su propio dashboard.
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const rolesPermitidos: string[] = route.data['roles'] || [];
  const rolUsuario = authService.getUserRole();

  if (rolesPermitidos.length === 0 || rolesPermitidos.includes(rolUsuario)) return true;

  // Redirige al dashboard propio en lugar de mostrar un 403
  router.navigate([`/dashboard/${rolUsuario}`]);
  return false;
};
