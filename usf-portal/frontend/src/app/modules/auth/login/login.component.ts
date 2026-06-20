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
  modoOlvide = false;
  cargando = false;
  error: string | null = null;
  exito: string | null = null;

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

  // Recuperar contraseña
  emailReset = '';
  newPassword = '';
  confirmPassword = '';

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
    this.modoOlvide = false;
    this.error = null;
    this.exito = null;
  }

  irAOlvide(): void {
    this.modoOlvide = true;
    this.modoRegistro = false;
    this.error = null;
    this.exito = null;
  }

  volverALogin(): void {
    this.modoOlvide = false;
    this.modoRegistro = false;
    this.error = null;
    this.exito = null;
  }

  recuperarContrasena(): void {
    if (!this.emailReset || !this.newPassword || !this.confirmPassword) {
      this.error = 'Todos los campos son obligatorios.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }
    if (this.newPassword.length < 8) {
      this.error = 'La contraseña debe tener al menos 8 caracteres.';
      return;
    }
    this.cargando = true;
    this.error = null;
    this.authService.resetPassword(this.emailReset, this.newPassword).subscribe({
      next: () => {
        this.cargando = false;
        this.exito = 'Contraseña actualizada. Ya puedes iniciar sesión.';
        this.emailReset = '';
        this.newPassword = '';
        this.confirmPassword = '';
        setTimeout(() => this.volverALogin(), 2500);
      },
      error: (err) => {
        this.cargando = false;
        this.error = err.error?.message || 'No se encontró una cuenta con ese email.';
      },
    });
  }
}
