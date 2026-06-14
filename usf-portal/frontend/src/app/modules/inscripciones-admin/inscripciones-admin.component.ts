import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-inscripciones-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './inscripciones-admin.component.html',
  styleUrls: ['./inscripciones-admin.component.scss'],
})
export class InscripcionesAdminComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly authService = inject(AuthService);

  inscripciones: any[] = [];
  cargando = true;
  error = '';

  ngOnInit(): void {
    this.cargarInscripciones();
  }

  cargarInscripciones(): void {
    this.apiService.get<any[]>('inscripciones').subscribe({
      next: (data) => {
        this.inscripciones = data;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las inscripciones.';
        this.cargando = false;
      }
    });
  }

  cancelarInscripcion(id: string): void {
    if (!confirm('¿Cancelar esta inscripción?')) return;
    this.apiService.delete<any>(`inscripciones/${id}`).subscribe({
      next: () => {
        this.inscripciones = this.inscripciones.filter(i => i._id !== id);
      },
      error: () => alert('Error al cancelar la inscripción.')
    });
  }

  cerrarSesion(): void {
    this.authService.logout();
  }
}