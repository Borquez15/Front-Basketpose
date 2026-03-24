import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, filter, map } from 'rxjs';
import { DataService } from '../../../core/services/data.service';
import { Jugador, Sesion } from '../../../core/models/index';

@Component({
  selector: 'app-class-detail',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './class-detail.component.html',
  styleUrls: ['./class-detail.component.css']
})
export class ClassDetailComponent {
  private route = inject(ActivatedRoute);
  router        = inject(Router);
  data          = inject(DataService);

  activeTab     = signal(0);
  codeCopied    = signal(false);

  // Estado para el Modal flotante
  mostrarFormSesion = signal(false);
  tituloSesion      = '';

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

  setTab(i: number) { this.activeTab.set(i); }

  copyCode() {
    const clase = this.clase();
    const code = clase?.id ? `BK-${clase.id}` : 'BK-XXXX';
    navigator.clipboard?.writeText(code);
    this.codeCopied.set(true);
    setTimeout(() => this.codeCopied.set(false), 2000);
  }

  scoreChip(pts: number): string {
    if (pts >= 85) return 'chip chip-green';
    if (pts >= 70) return 'chip chip-yellow';
    return 'chip chip-red';
  }

  iniciarNuevaSesion() {
    if (!this.tituloSesion.trim()) return;
    const claseActual = this.clase();
    if (!claseActual?.id) return;

    this.mostrarFormSesion.set(false);
    this.router.navigate(['/app/sesion'], {
      queryParams: { claseId: claseActual.id, titulo: this.tituloSesion.trim() }
    });
    this.tituloSesion = '';
  }

  formatFecha(fecha?: Date): string {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }
}