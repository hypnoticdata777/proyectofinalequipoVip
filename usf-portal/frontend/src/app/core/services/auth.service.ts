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

  // RF-01: Login con email/password + JWT
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap((res) => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        this.redirigirSegunRol(res.usuario.rol);
      })
    );
  }

  // RF-02: Registro de usuarios con roles
  register(datos: { nombre: string; apellido: string; email: string; password: string; rol?: string; matricula?: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, datos).pipe(
      tap((res) => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        this.redirigirSegunRol(res.usuario.rol);
      })
    );
  }

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

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/auth/me`);
  }

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

  getUserRole(): string {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return '';
    try {
      return this.decodeToken(token).rol || '';
    } catch {
      return '';
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private decodeToken(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  }
}
