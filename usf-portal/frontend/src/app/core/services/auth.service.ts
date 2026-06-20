// Servicio de autenticación (RF-01, RF-02, RF-05).
// Gestiona login, registro, logout y decodificación del JWT almacenado en localStorage.
// Todos los componentes que necesitan saber el rol o identidad del usuario lo inyectan.
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  _id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: 'alumno' | 'profesor' | 'admin';
  matricula?: string;
  foto?: string;
}

export interface AuthResponse {
  token: string;
  usuario: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly TOKEN_KEY = 'usf_token';

  // RF-01: Login con email/password — guarda el JWT y redirige según rol
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap((res) => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        this.redirigirSegunRol(res.usuario.rol);
      })
    );
  }

  // RF-02: Registro de usuarios — igual que login, guarda token y redirige
  register(datos: { nombre: string; apellido: string; email: string; password: string; rol?: string; matricula?: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, datos).pipe(
      tap((res) => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        this.redirigirSegunRol(res.usuario.rol);
      })
    );
  }

  // Cada rol tiene su propio dashboard; si el rol es desconocido va al login
  private redirigirSegunRol(rol: string): void {
    const rutas: Record<string, string> = {
      alumno: '/dashboard/alumno',
      profesor: '/dashboard/profesor',
      admin: '/dashboard/admin',
    };
    this.router.navigate([rutas[rol] || '/auth/login']);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.router.navigate(['/auth/login']);
  }

  // GET /api/auth/me — obtiene el perfil completo del servidor (útil para datos actualizados)
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/auth/me`);
  }

  // Verifica localmente si el token existe y no está expirado (sin llamar al servidor)
  isAuthenticated(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return false;
    try {
      const payload = this.decodeToken(token);
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  // Extrae el rol del payload del JWT sin llamar al servidor
  getUserRole(): string {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return '';
    try {
      return this.decodeToken(token).rol || '';
    } catch {
      return '';
    }
  }

  resetPassword(email: string, newPassword: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/reset-password`, { email, newPassword });
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Decodifica la parte payload del JWT (base64url) — no verifica la firma
  private decodeToken(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  }
}
