// login.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  // The backend uses 'email' not 'correo'
  email    = '';
  password = '';
  showPass  = signal(false);
  error     = signal('');
  loading   = signal(false);
  googleReady = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Retry Google init until the script loads
    this._initGoogle();
  }

  private _initGoogle(retries = 10): void {
    if (typeof google !== 'undefined' && environment.googleClientId) {
      try {
        google.accounts.id.initialize({
          client_id: environment.googleClientId,
          callback: (response: { credential: string }) => this._handleGoogleCredential(response)
        });
        google.accounts.id.renderButton(
          document.getElementById('google-signin-btn'),
          { theme: 'filled_black', size: 'large', width: 340, text: 'signin_with', shape: 'rectangular' }
        );
        this.googleReady.set(true);
      } catch (e) {
        console.warn('Google Sign-In init failed', e);
      }
    } else if (retries > 0) {
      setTimeout(() => this._initGoogle(retries - 1), 500);
    }
  }

  togglePass() { this.showPass.update(v => !v); }

  submit() {
    if (!this.email || !this.password) {
      this.error.set('Por favor completa todos los campos.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    // AuthService.login() sends { correo, password } — we map here
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/app/dashboard']),
      error: (err) => {
        const msg = err?.error?.detail || 'Correo o contraseña incorrectos.';
        this.error.set(msg);
        this.loading.set(false);
      }
    });
  }

  private _handleGoogleCredential(response: { credential: string }): void {
    this.loading.set(true);
    this.error.set('');
    this.auth.loginWithGoogle(response.credential).subscribe({
      next: () => this.router.navigate(['/app/dashboard']),
      error: () => {
        this.error.set('No se pudo iniciar sesión con Google. Intenta de nuevo.');
        this.loading.set(false);
      }
    });
  }
}