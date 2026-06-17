import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private readonly authService = inject(AuthService);

  modoRegistro = false;
  cargando = false;
  error: string | null = null;

  // Login
  emailLogin = '';
  passwordLogin = '';

  // Registro
  nombre = '';
  apellido = '';
  emailReg = '';
  passwordReg = '';
  rolReg = 'alumno';
  matricula = '';

  iniciarSesion(): void {
    if (!this.emailLogin || !this.passwordLogin) {
      this.error = 'Ingresa tu email y contraseña.';
      return;
    }
    this.cargando = true;
    this.error = null;
    this.authService.login(this.emailLogin, this.passwordLogin).subscribe({
      next: () => { this.cargando = false; },
      error: (err) => {
        this.cargando = false;
        this.error = err.error?.message || err.error?.error || 'Credenciales inválidas.';
      },
    });
  }

  registrarse(): void {
    if (!this.nombre || !this.apellido || !this.emailReg || !this.passwordReg) {
      this.error = 'Todos los campos son obligatorios.';
      return;
    }
    this.cargando = true;
    this.error = null;
    this.authService.register({
      nombre: this.nombre,
      apellido: this.apellido,
      email: this.emailReg,
      password: this.passwordReg,
      rol: this.rolReg,
      matricula: this.matricula || undefined,
    }).subscribe({
      next: () => { this.cargando = false; },
      error: (err) => {
        this.cargando = false;
        this.error = err.error?.message || err.error?.error || `Error al registrar la cuenta (${err.status}).`;
      },
    });
  }

  cambiarModo(): void {
    this.modoRegistro = !this.modoRegistro;
    this.error = null;
  }
}
