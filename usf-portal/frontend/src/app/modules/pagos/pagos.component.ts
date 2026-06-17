import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

interface Pago {
  _id: string;
  alumno_id: string;
  concepto: string;
  monto: number;
  tipo: string;
  estado: string;
  metodo: string;
  referencia: string;
  fecha: string;
}

interface NuevoPago {
  alumno_id: string;
  concepto: string;
  monto: number | null;
  tipo: string;
  metodo: string;
}

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.scss'],
})
export class PagosComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly authService = inject(AuthService);

  rol = this.authService.getUserRole();
  pagos: Pago[] = [];
  cargando = true;
  mostrarFormulario = false;
  guardando = false;
  mensaje = '';

  nuevoPago: NuevoPago = { alumno_id: '', concepto: '', monto: null, tipo: 'colegiaturas', metodo: 'efectivo' };

  ngOnInit(): void {
    this.cargarPagos();
  }

  cargarPagos(): void {
    const endpoint = this.rol === 'alumno' ? 'pagos/mis-pagos' : 'pagos';
    this.apiService.get<Pago[]>(endpoint).subscribe({
      next: (p) => { this.pagos = p; this.cargando = false; },
      error: () => { this.cargando = false; }
    });
  }

  registrarPago(): void {
    if (!this.nuevoPago.alumno_id || !this.nuevoPago.concepto || !this.nuevoPago.monto) return;
    this.guardando = true;
    this.apiService.post<Pago>('pagos', this.nuevoPago).subscribe({
      next: (p) => {
        this.pagos = [p, ...this.pagos];
        this.nuevoPago = { alumno_id: '', concepto: '', monto: null, tipo: 'colegiaturas', metodo: 'efectivo' };
        this.mostrarFormulario = false;
        this.guardando = false;
        this.mensaje = 'Pago registrado correctamente.';
        setTimeout(() => { this.mensaje = ''; }, 3000);
      },
      error: () => { this.guardando = false; }
    });
  }

  confirmarPago(pago: Pago): void {
    this.apiService.put<Pago>(`pagos/${pago._id}/pagar`, {}).subscribe({
      next: (actualizado) => Object.assign(pago, actualizado)
    });
  }

  cerrarSesion(): void {
    this.authService.logout();
  }
}
