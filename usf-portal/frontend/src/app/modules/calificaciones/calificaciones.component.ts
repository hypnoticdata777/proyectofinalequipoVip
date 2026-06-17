import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

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

  rolUsuario = this.authService.getUserRole();
  materias: any[] = [];
  materiaSeleccionada: string = '';
  calificaciones: any[] = [];
  cargandoMaterias = true;
  cargandoCalificaciones = false;
  guardando: Record<string, boolean> = {};
  mensajes: Record<string, string> = {};

  ngOnInit(): void {
    this.cargarMaterias();
    const materiaId = this.route.snapshot.queryParamMap.get('materiaId');
    if (materiaId) {
      this.materiaSeleccionada = materiaId;
      this.cargarCalificaciones(materiaId);
    }
  }

  cargarMaterias(): void {
    this.apiService.get<any[]>('materias').subscribe({
      next: (mats) => { this.materias = mats; this.cargandoMaterias = false; },
      error: () => { this.cargandoMaterias = false; }
    });
  }

  cargarCalificaciones(materiaId: string): void {
    this.cargandoCalificaciones = true;
    this.apiService.get<any[]>(`calificaciones/mi-grupo/${materiaId}`).subscribe({
      next: (cals) => { this.calificaciones = cals; this.cargandoCalificaciones = false; },
      error: () => { this.cargandoCalificaciones = false; }
    });
  }

  onMateriaChange(): void {
    if (this.materiaSeleccionada) {
      this.cargarCalificaciones(this.materiaSeleccionada);
    }
  }

  guardarCalificacion(cal: any): void {
    this.guardando[cal._id] = true;
    this.mensajes[cal._id] = '';

    const payload = { parcial1: cal.parcial1, parcial2: cal.parcial2, parcial3: cal.parcial3, final: cal.final };

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
