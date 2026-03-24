import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { TitleCasePipe } from '../../shared/pipes/titlecase.pipe';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, NavbarComponent, TitleCasePipe],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  auth           = inject(AuthService);
  data           = inject(DataService);
  clases         = toSignal(this.data.getClases(), { initialValue: [] });
  notificaciones = signal(true);
  faceUpdated    = signal(false);

  get initials()      { return this.auth.getInitials(); }
  get nombre()        { return this.auth.user()?.nombre ?? ''; }
  get correo()        { return this.auth.user()?.correo ?? ''; }

  rolChipClass(rol: string): string {
    if (rol === 'propietario') return 'chip chip-gold';
    if (rol === 'auxiliar')   return 'chip chip-blue';
    return 'chip chip-green';
  }

  actualizarRostro() {
    this.faceUpdated.set(true);
    setTimeout(() => this.faceUpdated.set(false), 2500);
  }

  logout() { this.auth.logout(); }
}
