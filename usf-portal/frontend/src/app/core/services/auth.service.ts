import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
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

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly TOKEN_KEY = 'usf_token';

  loginWithGoogle(): void {
    window.location.href = `${environment.apiUrl}/auth/google`;
  }

  handleCallback(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    const rol = this.getUserRole();
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
