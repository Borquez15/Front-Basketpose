import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { TitleCasePipe } from '../../shared/pipes/titlecase.pipe';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, FormsModule, NavbarComponent, TitleCasePipe],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  auth           = inject(AuthService);
  data           = inject(DataService);
  clases         = toSignal(this.data.getClases(), { initialValue: [] });
  notificaciones = signal(true);
  cambiandoPass  = signal(false);
  passLoading    = signal(false);
  passMsg        = signal('');
  passError      = signal('');
  passActual = '';
  passNueva = '';
  passConfirm = '';

  cambiarPassword() {
    this.passMsg.set('');
    this.passError.set('');
    if (!this.passActual || this.passNueva.length < 6) {
      this.passError.set('Escribe tu contraseña actual y una nueva de al menos 6 caracteres.');
      return;
    }
    if (this.passNueva !== this.passConfirm) {
      this.passError.set('Las contraseñas nuevas no coinciden.');
      return;
    }
    this.passLoading.set(true);
    this.auth.changePassword(this.passActual, this.passNueva).subscribe({
      next: () => {
        this.passLoading.set(false);
        this.passMsg.set('Contraseña actualizada.');
        this.passActual = this.passNueva = this.passConfirm = '';
      },
      error: (err) => {
        this.passLoading.set(false);
        const d = err?.error?.detail;
        this.passError.set(typeof d === 'string' ? d : 'No se pudo cambiar la contraseña.');
      }
    });
  }

  get initials()      { return this.auth.getInitials(); }
  get nombre()        { return this.auth.user()?.nombre ?? ''; }
  get correo()        { return this.auth.user()?.correo ?? ''; }

  rolChipClass(rol: string): string {
    if (rol === 'propietario') return 'chip chip-gold';
    if (rol === 'auxiliar')   return 'chip chip-blue';
    return 'chip chip-green';
  }

  logout() { this.auth.logout(); }
}
