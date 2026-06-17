// Componente de historial académico / kardex (RF-38).
// Muestra las calificaciones del alumno agrupadas por periodo con resumen estadístico.
// También ofrece descarga del kardex en PDF si el backend lo implementa.
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.scss'],
})
export class HistorialComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly authService = inject(AuthService);

  historial: any = null;
  cargando = true;
  descargando = false;
  alumnoId: string = '';
  rolUsuario = this.authService.getUserRole();

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.alumnoId = user._id;
        this.cargarHistorial(user._id);
      },
    });
  }

  cargarHistorial(alumnoId: string): void {
    // El backend devuelve { alumno, resumen, historialPorPeriodo }
    this.apiService.get<any>(`historial/${alumnoId}`).subscribe({
      next: (data) => { this.historial = data; this.cargando = false; },
      error: () => { this.cargando = false; }
    });
  }

  // Descarga el kardex como PDF usando el blob del servidor
  descargarPDF(): void {
    this.descargando = true;
    this.apiService.getBlob(`historial/${this.alumnoId}/pdf`).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kardex_${this.historial?.alumno?.matricula || this.alumnoId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.descargando = false;
      },
      error: () => { this.descargando = false; }
    });
  }

  cerrarSesion(): void {
    this.authService.logout();
  }
}
