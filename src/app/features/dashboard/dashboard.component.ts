import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, NavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  auth    = inject(AuthService);
  data    = inject(DataService);
  clases  = this.data.clases;
  sesion  = this.data.ultimaSesion;

  get initials() { return this.auth.getInitials(); }
  get nombreUsuario() { return this.auth.user()?.nombre ?? ''; }

  get gaugeOffset(): number {
    const pct = this.sesion.puntuacionPromedio / 100;
    const circunferencia = 2 * Math.PI * 40;
    return circunferencia * (1 - pct);
  }
}
