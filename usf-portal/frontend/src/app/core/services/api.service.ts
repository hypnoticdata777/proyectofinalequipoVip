// Servicio HTTP genérico — wrapper sobre HttpClient de Angular.
// Todos los componentes hacen sus llamadas a la API a través de este servicio
// para centralizar la URL base y el tipo de respuesta.
// El JWT se agrega automáticamente por el JwtInterceptor, no aquí.
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  // GET con query params opcionales: get('materias', { periodo: '2026-1' })
  get<T>(endpoint: string, params?: Record<string, string>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => { httpParams = httpParams.set(k, v); });
    }
    return this.http.get<T>(`${this.base}/${endpoint}`, { params: httpParams });
  }

  post<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.base}/${endpoint}`, body);
  }

  put<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.base}/${endpoint}`, body);
  }

  // getBlob para descarga de archivos binarios (PDF del kardex)
  getBlob(endpoint: string): Observable<Blob> {
    return this.http.get(`${this.base}/${endpoint}`, { responseType: 'blob' });
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.base}/${endpoint}`);
  }
}
