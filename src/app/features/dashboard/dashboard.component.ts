// dashboard.component.ts
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, NavbarComponent, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  auth     = inject(AuthService);
  data     = inject(DataService);
  clases   = toSignal(this.data.getClases(),   { initialValue: [] });
  sesiones = toSignal(this.data.getSesiones(), { initialValue: [] });

  get sesion() {
    const list = this.sesiones();
    return list.length > 0 ? list[list.length - 1] : null;
  }

  get initials()      { return this.auth.getInitials(); }
  get nombreUsuario() { return this.auth.user()?.nombre ?? ''; }

  get gaugeOffset(): number {
    if (!this.sesion) return 251.2;
    const pct  = (this.sesion.puntuacionPromedio ?? 0) / 100;
    const circ = 2 * Math.PI * 40;
    return circ * (1 - pct);
  }
}