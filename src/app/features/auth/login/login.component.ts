import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  correo    = '';
  password  = '';
  showPass  = signal(false);
  error     = signal('');

  constructor(private auth: AuthService, private router: Router) {}

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
}
