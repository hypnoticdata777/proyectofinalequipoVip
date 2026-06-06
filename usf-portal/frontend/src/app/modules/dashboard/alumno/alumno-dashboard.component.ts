import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-alumno-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './alumno-dashboard.component.html',
  styleUrls: ['./alumno-dashboard.component.scss'],
})
export class AlumnoDashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly apiService = inject(ApiService);

  usuario: User | null = null;
  inscripcion: any = null;
  cargando = true;

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.usuario = user;
        this.cargarInscripcion();
      },
      error: () => { this.cargando = false; }
    });
  }

  cargarInscripcion(): void {
    this.apiService.get<any>('inscripciones/mi-inscripcion').subscribe({
      next: (insc) => { this.inscripcion = insc; this.cargando = false; },
      error: () => { this.cargando = false; }
    });
  }

  cerrarSesion(): void {
    this.authService.logout();
  }
}
