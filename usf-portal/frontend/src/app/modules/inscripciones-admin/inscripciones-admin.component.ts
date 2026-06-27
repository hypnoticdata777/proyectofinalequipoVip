// Componente de gestión de inscripciones para el admin.
// Lista todas las inscripciones del sistema y permite cancelarlas.
// Usa DELETE /api/inscripciones/:id (alias de PUT /:id/cancelar en el backend).
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
// El frontend no valida cupo, seriación ni horario — esa lógica vive
// en inscripcion.service.js (backend) para que sea inviolable desde cualquier cliente.
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
// tipoError guarda el código máquina del backend (SIN_CUPO, ADEUDO_PENDIENTE…)
// separado del mensaje, para poder mostrar un ícono distinto por cada caso.
  cargarInscripciones(): void {
    this.apiService.get<any[]>('inscripciones').subscribe({
      next: (data) => { this.inscripciones = data; this.cargando = false; },
      error: () => { this.error = 'No se pudieron cargar las inscripciones.'; this.cargando = false; }
    });
  }
// enviando=true deshabilita el botón mientras espera al servidor,
// evitando doble-submit accidental del alumno.
  cancelarInscripcion(id: string): void {
    if (!confirm('¿Cancelar esta inscripción?')) return;
    this.apiService.delete<any>(`inscripciones/${id}`).subscribe({
      next: () => {
        // Elimina de la lista local para reflejar el cambio sin recargar
        this.inscripciones = this.inscripciones.filter(i => i._id !== id);
      },
      error: () => alert('Error al cancelar la inscripción.')
    });
  }

  cerrarSesion(): void {
    this.authService.logout();
  }
}
