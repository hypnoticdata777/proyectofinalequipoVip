import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
// No se manda alumnoId en la URL: el backend extrae el id del JWT.
// Así un alumno no puede ver las notas de otro cambiando la ruta.
@Component({
  selector: 'app-calificaciones-alumno',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './calificaciones-alumno.component.html',
  styleUrls: ['./calificaciones-alumno.component.scss'],
})
export class CalificacionesAlumnoComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly authService = inject(AuthService);

  calificaciones: any[] = [];
  cargando = true;
  error = '';

  ngOnInit(): void {
    this.cargarCalificaciones();
  }

  cargarCalificaciones(): void {
    this.apiService.get<any[]>('calificaciones/mis-calificaciones').subscribe({
      next: (cals) => {
        this.calificaciones = cals;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las calificaciones.';
        this.cargando = false;
      }
    });
  }

  cerrarSesion(): void {
    this.authService.logout();
  }
}
