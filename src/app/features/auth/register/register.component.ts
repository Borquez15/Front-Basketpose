import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  nombre    = '';
  ap_p      = '';
  ap_m      = '';
  correo    = '';
  password  = '';
  confirm   = '';
  error     = signal('');
  loading   = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    if (!this.nombre || !this.ap_p || !this.correo || !this.password) {
      this.error.set('Todos los campos obligatorios deben estar completos.'); return;
    }
    if (this.password !== this.confirm) {
      this.error.set('Las contraseñas no coinciden.'); return;
    }
    this.loading.set(true);
    this.error.set('');
    this.auth.register(this.nombre, this.ap_p, this.ap_m, this.correo, this.password).subscribe({
      next: () => this.router.navigate(['/app/dashboard']),
      error: () => {
        this.error.set('Error al crear la cuenta. Intenta de nuevo.');
        this.loading.set(false);
      }
    });
  }
}
