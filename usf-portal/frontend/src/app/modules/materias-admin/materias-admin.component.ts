import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

interface HorarioForm {
  dia: string;
  horaInicio: string;
  horaFin: string;
  salon: string;
}

@Component({
  selector: 'app-materias-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './materias-admin.component.html',
  styleUrls: ['./materias-admin.component.scss'],
})
export class MateriasAdminComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly authService = inject(AuthService);

  materias: any[] = [];
  profesores: any[] = [];
  cargando = true;
  guardando = false;
  editandoId: string | null = null;
  mensaje = '';
  error = '';
  form = this.formVacio();

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    forkJoin({
      materias: this.apiService.get<any[]>('materias'),
      profesores: this.apiService.get<any[]>('auth/profesores'),
    }).subscribe({
      next: ({ materias, profesores }) => {
        this.materias = materias;
        this.profesores = profesores;
        this.cargando = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'No se pudo cargar el catálogo.';
        this.cargando = false;
      }
    });
  }

  guardar(): void {
    this.error = '';
    this.mensaje = '';

    if (!this.form.clave || !this.form.nombre || !this.form.profesor_id) {
      this.error = 'Clave, nombre y profesor son obligatorios.';
      return;
    }
    if (this.form.horario.some(h => !h.dia || !h.horaInicio || !h.horaFin)) {
      this.error = 'Completa día, hora inicial y hora final de cada horario.';
      return;
    }

    const payload = {
      ...this.form,
      creditos: Number(this.form.creditos),
      cupoMaximo: Number(this.form.cupoMaximo),
      cupoDisponible: Number(this.form.cupoDisponible),
    };

    this.guardando = true;
    const solicitud = this.editandoId
      ? this.apiService.put<any>(`materias/${this.editandoId}`, payload)
      : this.apiService.post<any>('materias', payload);

    solicitud.subscribe({
      next: () => {
        this.mensaje = this.editandoId ? 'Materia actualizada.' : 'Materia creada.';
        this.cancelarEdicion();
        this.cargarDatos();
        this.guardando = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'No se pudo guardar la materia.';
        this.guardando = false;
      }
    });
  }

  editar(materia: any): void {
    this.editandoId = materia._id;
    this.form = {
      clave: materia.clave,
      nombre: materia.nombre,
      creditos: materia.creditos,
      cupoMaximo: materia.cupoMaximo,
      cupoDisponible: materia.cupoDisponible,
      profesor_id: materia.profesor_id?._id || materia.profesor_id || '',
      periodo: materia.periodo,
      horario: materia.horario?.length
        ? materia.horario.map((h: any) => ({ ...h }))
        : [this.horarioVacio()],
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  desactivar(materia: any): void {
    if (!confirm(`¿Desactivar ${materia.clave} - ${materia.nombre}?`)) return;
    this.apiService.delete<any>(`materias/${materia._id}`).subscribe({
      next: () => {
        this.mensaje = 'Materia desactivada.';
        this.cargarDatos();
      },
      error: (err) => { this.error = err.error?.message || 'No se pudo desactivar.'; }
    });
  }

  agregarHorario(): void {
    this.form.horario.push(this.horarioVacio());
  }

  quitarHorario(indice: number): void {
    if (this.form.horario.length > 1) this.form.horario.splice(indice, 1);
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.form = this.formVacio();
  }

  cerrarSesion(): void {
    this.authService.logout();
  }

  private formVacio() {
    return {
      clave: '',
      nombre: '',
      creditos: 6,
      cupoMaximo: 30,
      cupoDisponible: 30,
      profesor_id: '',
      periodo: '2026-1',
      horario: [this.horarioVacio()] as HorarioForm[],
    };
  }

  private horarioVacio(): HorarioForm {
    return { dia: 'lunes', horaInicio: '08:00', horaFin: '10:00', salon: '' };
  }
}
