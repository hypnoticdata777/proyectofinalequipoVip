import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly apiService = inject(ApiService);

  usuario: User | null = null;
  metricas = { totalInscripciones: 0, adeudosPendientes: 0 };
  cargando = true;

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.usuario = user;
        this.cargarMetricas();
      },
      error: () => { this.cargando = false; }
    });
  }

  cargarMetricas(): void {
    forkJoin({
      inscripciones: this.apiService.get<any[]>('inscripciones'),
      adeudos: this.apiService.get<any[]>('adeudos', { estado: 'pendiente' }),
    }).subscribe({
      next: ({ inscripciones, adeudos }) => {
        this.metricas.totalInscripciones = inscripciones.length;
        this.metricas.adeudosPendientes = adeudos.length;
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  cerrarSesion(): void {
    this.authService.logout();
  }
}
