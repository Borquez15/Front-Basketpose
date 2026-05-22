import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, switchMap } from 'rxjs';
import { DataService } from '../../../core/services/data.service';
import { Jugador, MiembroClase, Sesion } from '../../../core/models/index';

@Component({
  selector: 'app-class-detail',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './class-detail.component.html',
  styleUrls: ['./class-detail.component.css']
})
export class ClassDetailComponent {
  private route = inject(ActivatedRoute);
  router = inject(Router);
  data = inject(DataService);

  activeTab = signal(0);
  codeCopied = signal(false);
  inviteEmail = '';
  inviteRole: 'jugador' | 'entrenador' = 'entrenador';
  inviteStatus = signal('');
  inviteError = signal('');
  inviteLink = signal('');

  constructor() {
    if (this.route.snapshot.queryParamMap.get('tab') === 'sesiones') {
      this.activeTab.set(1);
    }
  }

  private claseId$ = this.route.paramMap.pipe(
    map(p => Number(p.get('id'))),
    filter(id => !isNaN(id) && id > 0)
  );

  clase = toSignal(
    this.claseId$.pipe(switchMap(id => this.data.getClase(id)))
  );

  jugadores = toSignal(
    this.claseId$.pipe(
      switchMap(id => this.data.getJugadores().pipe(
        map(list => list.filter(j => j.idClase === id))
      ))
    ),
    { initialValue: [] as Jugador[] }
  );

  sesiones = toSignal(
    this.claseId$.pipe(switchMap(id => this.data.getSesiones(id))),
    { initialValue: [] as Sesion[] }
  );

  miembros = toSignal(
    this.claseId$.pipe(switchMap(id => this.data.getMiembrosClase(id))),
    { initialValue: [] as MiembroClase[] }
  );

  auxiliares = computed(() =>
    this.miembros().filter(m => m.rol === 'entrenador' || m.rol === 'auxiliar' || m.rol === 'administrador')
  );

  sessionStats = computed(() => {
    const sesiones = this.sesiones();
    const totalTiros = sesiones.reduce((sum, sesion) => sum + (sesion.totalTiros ?? 0), 0);
    const scores = sesiones
      .map(sesion => sesion.puntuacionPromedio ?? 0)
      .filter(score => score > 0);
    const promedio = scores.length
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : 0;

    return {
      total: sesiones.length,
      totalTiros,
      promedio,
      ultimaFecha: sesiones[0]?.fecha
    };
  });

  setTab(i: number) { this.activeTab.set(i); }

  codeClase(): string {
    return this.clase()?.codigoInvitacion || (this.clase()?.id ? `BK-${this.clase()!.id}` : 'BK-XXXX');
  }

  copyCode() {
    navigator.clipboard?.writeText(this.codeClase());
    this.codeCopied.set(true);
    setTimeout(() => this.codeCopied.set(false), 2000);
  }

  copyInviteLink() {
    const link = this.inviteLink();
    if (!link) return;
    navigator.clipboard?.writeText(link);
    this.codeCopied.set(true);
    setTimeout(() => this.codeCopied.set(false), 2000);
  }

  enviarInvitacion() {
    this.inviteStatus.set('');
    this.inviteError.set('');
    this.inviteLink.set('');
    const clase = this.clase();
    const email = this.inviteEmail.trim();
    if (!clase?.id) return;
    if (!email) {
      this.inviteError.set('Escribe el correo de la persona invitada.');
      return;
    }

    this.data.crearInvitacionClase(clase.id, email, this.inviteRole).subscribe({
      next: (inv) => {
        const rol = this.inviteRole === 'entrenador' ? 'auxiliar' : 'jugador';
        this.inviteStatus.set(`Invitacion enviada para unirse como ${rol}.`);
        if (inv.token) {
          const url = `${window.location.origin}/app/invitacion/${inv.token}`;
          this.inviteLink.set(url);
          navigator.clipboard?.writeText(url);
        }
        this.inviteEmail = '';
      },
      error: err => {
        this.inviteError.set(err?.error?.detail || 'No se pudo enviar la invitacion.');
      }
    });
  }

  scoreChip(pts: number): string {
    if (pts >= 85) return 'chip chip-green';
    if (pts >= 70) return 'chip chip-yellow';
    return 'chip chip-red';
  }

  private claseIdActual(): number | null {
    const claseId = this.clase()?.id;
    if (claseId) return claseId;

    const routeId = Number(this.route.snapshot.paramMap.get('id'));
    return routeId > 0 ? routeId : null;
  }

  iniciarNuevaSesion(claseId?: number) {
    const id = claseId ?? this.claseIdActual();
    if (!id) return;

    this.router.navigate(['/app/sesion'], {
      queryParams: {
        claseId: id,
        titulo: `Tiros libres ${new Date().toLocaleDateString('es-MX')}`,
        returnTo: `/app/clases/${id}`
      }
    });
  }

  agregarJugador(claseId?: number) {
    const id = claseId ?? this.clase()?.id;
    if (!id) return;

    this.router.navigate(['/app/jugadores/nuevo'], {
      queryParams: {
        claseId: id,
        returnTo: `/app/clases/${id}`
      }
    });
  }

  formatFecha(fecha?: Date): string {
    if (!fecha) return '--';
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  resumenSesion(sesion: Sesion): string {
    return sesion.descripcion?.trim() || 'Sin resumen capturado aun.';
  }

  duracionSesion(sesion: Sesion): string {
    return sesion.duracionMin ? `${sesion.duracionMin} min` : 'Sin duracion';
  }
}
