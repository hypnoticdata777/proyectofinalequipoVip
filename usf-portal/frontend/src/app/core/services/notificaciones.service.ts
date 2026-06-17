import { Injectable, inject, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface Notificacion {
  _id: string;
  titulo: string;
  mensaje: string;
  tipo: string;
  leida: boolean;
  fecha: string;
}

@Injectable({ providedIn: 'root' })
export class NotificacionesService implements OnDestroy {
  private readonly auth = inject(AuthService);
  private eventSource: EventSource | null = null;

  private readonly _notificaciones$ = new BehaviorSubject<Notificacion[]>([]);
  readonly notificaciones$: Observable<Notificacion[]> = this._notificaciones$.asObservable();

  private readonly _noLeidas$ = new BehaviorSubject<number>(0);
  readonly noLeidas$: Observable<number> = this._noLeidas$.asObservable();

  conectar(): void {
    if (this.eventSource) return;
    const token = this.auth.getToken();
    if (!token) return;

    const url = `${environment.apiUrl}/notificaciones/stream?token=${encodeURIComponent(token)}`;
    this.eventSource = new EventSource(url);

    this.eventSource.addEventListener('nueva_notificacion', (e: MessageEvent) => {
      try {
        const notif: Notificacion = JSON.parse(e.data);
        const actuales = this._notificaciones$.getValue();
        this._notificaciones$.next([notif, ...actuales]);
        this._noLeidas$.next(this._noLeidas$.getValue() + 1);
      } catch { /* json parse error */ }
    });

    this.eventSource.onerror = () => {
      this.desconectar();
    };
  }

  desconectar(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  agregarNotificaciones(notifs: Notificacion[]): void {
    this._notificaciones$.next(notifs);
    this._noLeidas$.next(notifs.filter(n => !n.leida).length);
  }

  marcarLeida(id: string): void {
    const actuales = this._notificaciones$.getValue().map(n =>
      n._id === id ? { ...n, leida: true } : n
    );
    this._notificaciones$.next(actuales);
    this._noLeidas$.next(actuales.filter(n => !n.leida).length);
  }

  ngOnDestroy(): void {
    this.desconectar();
  }
}
