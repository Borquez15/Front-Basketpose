import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { DataService } from '../../../core/services/data.service';

@Component({
  selector: 'app-accept-invitation',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './accept-invitation.component.html',
  styleUrls: ['./accept-invitation.component.css']
})
export class AcceptInvitationComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  data = inject(DataService);

  loading = signal(false);
  error = signal('');
  status = signal('');

  token = this.route.snapshot.paramMap.get('token') || '';
  invitacion = toSignal(
    this.route.paramMap.pipe(switchMap(params => this.data.getInvitacion(params.get('token') || '')))
  );

  aceptar() {
    this.loading.set(true);
    this.error.set('');
    this.data.aceptarInvitacion(this.token).subscribe({
      next: () => {
        this.status.set('Te uniste a la clase. Ya puedes crear sesiones si fuiste invitado como auxiliar.');
        this.loading.set(false);
        setTimeout(() => this.router.navigate(['/app/clases']), 1000);
      },
      error: err => {
        this.error.set(err?.error?.detail || 'No se pudo aceptar la invitacion.');
        this.loading.set(false);
      }
    });
  }

  rechazar() {
    this.loading.set(true);
    this.error.set('');
    this.data.rechazarInvitacion(this.token).subscribe({
      next: () => {
        this.status.set('Invitacion rechazada.');
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err?.error?.detail || 'No se pudo rechazar la invitacion.');
        this.loading.set(false);
      }
    });
  }
}
