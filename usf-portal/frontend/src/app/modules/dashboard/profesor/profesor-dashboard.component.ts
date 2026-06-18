import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-profesor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profesor-dashboard.component.html',
  styleUrls: ['./profesor-dashboard.component.scss'],
})
export class ProfesorDashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly apiService = inject(ApiService);

  usuario: User | null = null;
  materias: any[] = [];
  cargando = true;

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.usuario = user;
        this.cargarMaterias(user._id);
      },
      error: () => { this.cargando = false; }
    });
  }

  cargarMaterias(profesorId: string): void {
    this.apiService.get<any[]>('materias').subscribe({
      next: (mats) => {
        this.materias = mats.filter(
          m => m.profesor_id?._id === profesorId || m.profesor_id === profesorId
        );
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  cerrarSesion(): void {
    this.authService.logout();
  }
}
