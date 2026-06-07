import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-inscripcion',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './inscripcion.component.html',
  styleUrls: ['./inscripcion.component.scss'],
})
export class InscripcionComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly authService = inject(AuthService);

  materias: any[] = [];
  materiasSeleccionadas: any[] = [];
  cargando = true;
  enviando = false;
  error: string | null = null;
  tipoError: string = '';
  exito: string | null = null;
  periodoActual = '2026-1';

  ngOnInit(): void {
    this.cargarMaterias();
  }

  cargarMaterias(): void {
    this.apiService.get<any[]>('materias', { periodo: this.periodoActual }).subscribe({
      next: (mats) => { this.materias = mats; this.cargando = false; },
      error: () => { this.cargando = false; }
    });
  }

  estaSeleccionada(materiaId: string): boolean {
    return this.materiasSeleccionadas.some(m => m._id === materiaId);
  }

  toggleMateria(materia: any): void {
    if (this.estaSeleccionada(materia._id)) {
      this.materiasSeleccionadas = this.materiasSeleccionadas.filter(m => m._id !== materia._id);
    } else {
      this.materiasSeleccionadas.push(materia);
    }
    this.error = null;
  }

  confirmarInscripcion(): void {
    if (this.materiasSeleccionadas.length === 0) {
      this.error = 'Selecciona al menos una materia para inscribirte.';
      return;
    }
    this.enviando = true;
    this.error = null;

    const payload = {
      materias: this.materiasSeleccionadas.map(m => m._id),
      periodo: this.periodoActual,
    };

    this.apiService.post<any>('inscripciones', payload).subscribe({
      next: () => {
        this.exito = '¡Inscripción realizada exitosamente!';
        this.enviando = false;
      },
      error: (err) => {
        this.enviando = false;
        const msg = err.error?.error || 'Error al procesar la inscripción.';
        this.error = msg;
        this.tipoError = err.error?.codigo || 'ERROR';
      }
    });
  }

  getIconoError(): string {
    const iconos: Record<string, string> = {
      ADEUDO_PENDIENTE: '💳',
      SIN_CUPO: '🚫',
      SERIACION_INCOMPLETA: '📚',
      CRUCE_HORARIO: '⏰',
    };
    return iconos[this.tipoError] || '⚠️';
  }

  getTotalCreditos(): number {
    return this.materiasSeleccionadas.reduce((acc, m) => acc + m.creditos, 0);
  }

  cerrarSesion(): void {
    this.authService.logout();
  }
}
