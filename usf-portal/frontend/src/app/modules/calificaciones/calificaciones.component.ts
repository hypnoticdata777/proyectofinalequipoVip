// createObjectURL crea una URL temporal en memoria para el blob del PDF.
// revokeObjectURL la libera inmediatamente después del click para no acumular memoria.

// El botón de descarga queda activo en la UI (RF-31 frontend listo)
// pero el endpoint /historial/:id/pdf aún está pendiente en el backend.
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
// guardando y mensajes son Records keyed por cal._id para que cada fila
// tenga su propio estado de carga — el profesor puede editar varias a la vez.
@Component({
  selector: 'app-calificaciones',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './calificaciones.component.html',
  styleUrls: ['./calificaciones.component.scss'],
})
export class CalificacionesComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
// El frontend solo manda parcial1, parcial2, parcial3.
// El backend calcula 'final' para que la fórmula sea consistente en todos los clientes.

  rolUsuario = this.authService.getUserRole();
  materias: any[] = [];
  materiaSeleccionada: string = '';
  calificaciones: any[] = [];
  cargandoMaterias = true;
  cargandoCalificaciones = false;
  guardando: Record<string, boolean> = {};  // Estado de carga por calificación individual
  mensajes: Record<string, string> = {};    // Feedback visual por fila

  ngOnInit(): void {
    this.cargarMaterias();
    // Permite abrir directamente en una materia via ?materiaId=...
    const materiaId = this.route.snapshot.queryParamMap.get('materiaId');
    if (materiaId) {
      this.materiaSeleccionada = materiaId;
      this.cargarCalificaciones(materiaId);
    }
  }

  cargarMaterias(): void {
    this.authService.getCurrentUser().subscribe({
      next: (usuario) => {
        this.apiService.get<any[]>('materias').subscribe({
          next: (mats) => {
            this.materias = this.rolUsuario === 'profesor'
              ? mats.filter(m => m.profesor_id?._id === usuario._id || m.profesor_id === usuario._id)
              : mats;
            this.cargandoMaterias = false;
          },
          error: () => { this.cargandoMaterias = false; }
        });
      },
      error: () => { this.cargandoMaterias = false; }
    });
  }

  // El endpoint /mi-grupo/:id devuelve solo los alumnos asignados al profesor autenticado
  cargarCalificaciones(materiaId: string): void {
    this.cargandoCalificaciones = true;
    this.apiService.get<any[]>(`calificaciones/mi-grupo/${materiaId}`).subscribe({
      next: (cals) => { this.calificaciones = cals; this.cargandoCalificaciones = false; },
      error: () => { this.cargandoCalificaciones = false; }
    });
  }
// Soporte de ?materiaId= en la URL permite que el dashboard del profesor
// enlace directo a una materia sin que el usuario tenga que seleccionarla.

  onMateriaChange(): void {
    if (this.materiaSeleccionada) this.cargarCalificaciones(this.materiaSeleccionada);
  }

  guardarCalificacion(cal: any): void {
    this.guardando[cal._id] = true;
    this.mensajes[cal._id] = '';

    // El backend recalcula 'final' automáticamente a partir de los parciales
    const payload = { parcial1: cal.parcial1, parcial2: cal.parcial2, parcial3: cal.parcial3 };

    this.apiService.put<any>(`calificaciones/${cal._id}`, payload).subscribe({
      next: (calActualizada) => {
        Object.assign(cal, calActualizada);
        this.guardando[cal._id] = false;
        this.mensajes[cal._id] = '✓ Guardado';
        setTimeout(() => { this.mensajes[cal._id] = ''; }, 2000);
      },
      error: (err) => {
        this.guardando[cal._id] = false;
        this.mensajes[cal._id] = err.error?.error || 'Error al guardar';
      }
    });
  }
// El profesor ve solo sus materias (filtro por profesor_id === usuario._id);
// el admin ve todas. El filtro es en cliente porque la lista ya viene del API con populate.
  cerrarActa(cal: any): void {
    if (!confirm('¿Cerrar el acta? Esta acción no se puede deshacer.')) return;
    this.apiService.put<any>(`calificaciones/${cal._id}/cerrar`, {}).subscribe({
      next: () => { cal.cerrada = true; }
    });
  }

  cerrarSesion(): void {
    this.authService.logout();
  }
}
