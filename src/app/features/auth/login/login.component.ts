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
  correo    = '';
  password  = '';
  showPass  = signal(false);
  error     = signal('');

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: { credential: string }) => this._handleGoogleCredential(response)
      });
      google.accounts.id.renderButton(
        document.getElementById('google-signin-btn'),
        { theme: 'filled_black', size: 'large', width: 340, text: 'signin_with', shape: 'rectangular' }
      );
    }
  }

  togglePass() { this.showPass.update(v => !v); }

  submit() {
    if (!this.correo || !this.password) {
      this.error.set('Por favor completa todos los campos.');
      return;
    }
    if (this.auth.login(this.correo, this.password)) {
      this.router.navigate(['/app/dashboard']);
    } else {
      this.error.set('Correo o contraseña incorrectos.');
    }
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
