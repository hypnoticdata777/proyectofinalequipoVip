import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificacionesService, Notificacion } from '../../core/services/notificaciones.service';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.scss'],
})
export class NotificacionesComponent implements OnInit, OnDestroy {
  private readonly apiService = inject(ApiService);
  private readonly authService = inject(AuthService);
  readonly notifService = inject(NotificacionesService);

  cargando = true;

  ngOnInit(): void {
    this.apiService.get<Notificacion[]>('notificaciones').subscribe({
      next: (notifs) => {
        this.notifService.agregarNotificaciones(notifs);
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
    this.notifService.conectar();
  }

  marcarLeida(notif: Notificacion): void {
    if (notif.leida) return;
    this.apiService.put<Notificacion>(`notificaciones/${notif._id}/leer`, {}).subscribe({
      next: () => this.notifService.marcarLeida(notif._id)
    });
  }

  ngOnDestroy(): void {
    this.notifService.desconectar();
  }

  cerrarSesion(): void {
    this.authService.logout();
  }
}
