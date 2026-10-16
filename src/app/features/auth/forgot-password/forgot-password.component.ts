// forgot-password.component.ts — solicita el correo para restablecer la contraseña
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="login-screen fade-in">
      <div class="login-box">
        <div class="login-logo">
          <div class="logo-icon">🏀</div>
          <h1>BasketPose</h1>
          <p>Recuperar contraseña</p>
        </div>
        <div class="login-form">
          @if (enviado()) {
            <div class="info-msg">Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada.</div>
          } @else {
            @if (error()) { <div class="error-msg">{{ error() }}</div> }
            <div class="field">
              <label>Correo electrónico</label>
              <input type="email" placeholder="correo@ejemplo.com" [(ngModel)]="email" (keyup.enter)="enviar()"/>
            </div>
            <button class="btn btn-primary btn-full" [disabled]="loading()" (click)="enviar()">
              {{ loading() ? 'Enviando…' : 'Enviar enlace' }}
            </button>
          }
          <button class="btn btn-outline btn-full" routerLink="/auth/login">Volver al inicio de sesión</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../login/login.component.css']
})
export class ForgotPasswordComponent {
  email = '';
  loading = signal(false);
  enviado = signal(false);
  error = signal('');

  constructor(private auth: AuthService) {}

  enviar() {
    if (!this.email.trim()) { this.error.set('Escribe tu correo.'); return; }
    this.loading.set(true);
    this.error.set('');
    this.auth.forgotPassword(this.email.trim()).subscribe({
      next: () => { this.loading.set(false); this.enviado.set(true); },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.detail || 'No se pudo enviar el correo. Intenta de nuevo.');
      }
    });
  }
}
