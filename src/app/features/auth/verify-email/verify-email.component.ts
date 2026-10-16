// verify-email.component.ts — destino del enlace del correo de verificación
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="login-screen fade-in">
      <div class="login-box">
        <div class="login-logo">
          <div class="logo-icon">🏀</div>
          <h1>BasketPose</h1>
          <p>Verificación de correo</p>
        </div>
        <div class="login-form">
          @if (estado() === 'cargando') {
            <div class="info-msg">Verificando tu correo...</div>
          } @else if (estado() === 'ok') {
            <div class="info-msg">Tu correo quedó verificado. Te llevamos al inicio de sesión...</div>
            <button class="btn btn-primary btn-full" routerLink="/auth/login">Iniciar sesión</button>
          } @else {
            <div class="error-msg">{{ error() }}</div>
            <button class="btn btn-outline btn-full" routerLink="/auth/login">Volver al inicio de sesión</button>
          }
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../login/login.component.css']
})
export class VerifyEmailComponent implements OnInit {
  estado = signal<'cargando' | 'ok' | 'error'>('cargando');
  error = signal('');

  constructor(private route: ActivatedRoute, private router: Router, private auth: AuthService) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.estado.set('error');
      this.error.set('El enlace no tiene token de verificación.');
      return;
    }
    this.auth.verifyEmail(token).subscribe({
      next: () => {
        this.estado.set('ok');
        setTimeout(() => this.router.navigate(['/auth/login'], { queryParams: { verificado: 1 } }), 1500);
      },
      error: (err) => {
        this.estado.set('error');
        this.error.set(err?.error?.detail || 'No se pudo verificar el correo. El enlace puede haber expirado.');
      }
    });
  }
}
