// reset-password.component.ts — destino del enlace del correo de recuperación
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="login-screen fade-in">
      <div class="login-box">
        <div class="login-logo">
          <div class="logo-icon">🏀</div>
          <h1>BasketPose</h1>
          <p>Nueva contraseña</p>
        </div>
        <div class="login-form">
          @if (!token) {
            <div class="error-msg">El enlace no tiene token. Solicita uno nuevo.</div>
            <button class="btn btn-primary btn-full" routerLink="/auth/olvide-contrasena">Solicitar enlace</button>
          } @else {
            @if (error()) { <div class="error-msg">{{ error() }}</div> }
            <div class="field">
              <label>Nueva contraseña</label>
              <input type="password" placeholder="Mínimo 6 caracteres" [(ngModel)]="password"/>
            </div>
            <div class="field">
              <label>Confirmar contraseña</label>
              <input type="password" placeholder="Repite la contraseña" [(ngModel)]="confirm" (keyup.enter)="guardar()"/>
            </div>
            <button class="btn btn-primary btn-full" [disabled]="loading()" (click)="guardar()">
              {{ loading() ? 'Guardando…' : 'Guardar contraseña' }}
            </button>
          }
          <button class="btn btn-outline btn-full" routerLink="/auth/login">Volver al inicio de sesión</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../login/login.component.css']
})
export class ResetPasswordComponent {
  token: string | null;
  password = '';
  confirm = '';
  loading = signal(false);
  error = signal('');

  constructor(route: ActivatedRoute, private router: Router, private auth: AuthService) {
    this.token = route.snapshot.queryParamMap.get('token');
  }

  guardar() {
    if (this.password.length < 6) { this.error.set('La contraseña debe tener al menos 6 caracteres.'); return; }
    if (this.password !== this.confirm) { this.error.set('Las contraseñas no coinciden.'); return; }
    this.loading.set(true);
    this.error.set('');
    this.auth.resetPassword(this.token!, this.password).subscribe({
      next: () => this.router.navigate(['/auth/login'], { queryParams: { restablecida: 1 } }),
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.detail || 'No se pudo cambiar la contraseña. El enlace puede haber expirado.');
      }
    });
  }
}
