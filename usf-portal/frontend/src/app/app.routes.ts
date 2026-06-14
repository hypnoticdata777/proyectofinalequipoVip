import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./modules/auth/login/login.component').then(m => m.LoginComponent),
      },
      {
        path: 'callback',
        loadComponent: () => import('./modules/auth/callback/callback.component').then(m => m.CallbackComponent),
      },
    ],
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    children: [
      {
        path: 'alumno',
        loadComponent: () => import('./modules/dashboard/alumno/alumno-dashboard.component').then(m => m.AlumnoDashboardComponent),
        canActivate: [roleGuard],
        data: { roles: ['alumno'] },
      },
      {
        path: 'profesor',
        loadComponent: () => import('./modules/dashboard/profesor/profesor-dashboard.component').then(m => m.ProfesorDashboardComponent),
        canActivate: [roleGuard],
        data: { roles: ['profesor'] },
      },
      {
        path: 'admin',
        loadComponent: () => import('./modules/dashboard/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        canActivate: [roleGuard],
        data: { roles: ['admin'] },
      },
    ],
  },
  {
    path: 'inscripcion',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['alumno'] },
    loadComponent: () => import('./modules/inscripcion/inscripcion.component').then(m => m.InscripcionComponent),
  },

  {
    path: 'calificaciones',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['profesor', 'admin'] },
    loadComponent: () => import('./modules/calificaciones/calificaciones.component').then(m => m.CalificacionesComponent),
  },

 {
  path: 'calificaciones/alumno',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['alumno'] },
  loadComponent: () => import('./modules/calificaciones/calificaciones-alumno/calificaciones-alumno.component').then(m => m.CalificacionesAlumnoComponent),
},
  {
    path: 'historial',
    canActivate: [authGuard],
    loadComponent: () => import('./modules/historial/historial.component').then(m => m.HistorialComponent),
  },
  { path: '**', redirectTo: 'auth/login' },
];
