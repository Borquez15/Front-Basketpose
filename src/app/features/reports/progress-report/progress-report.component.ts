// progress-report.component.ts
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';
import { DataService } from '../../../core/services/data.service';
import { Jugador } from '../../../core/models';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-progress-report',
  standalone: true,
  imports: [RouterLink, NavbarComponent],
  templateUrl: './progress-report.component.html',
  styleUrls: ['./progress-report.component.css']
})
export class ProgressReportComponent {
  private route = inject(ActivatedRoute);
  data          = inject(DataService);
  periodo       = signal<'7d' | '30d' | '3m'>('7d');
  errorMessage  = signal('');

  jugadorId = toSignal(
    this.route.paramMap.pipe(
      map(p => {
        const id = Number(p.get('id'));
        return Number.isFinite(id) && id > 0 ? id : null;
      })
    ),
    { initialValue: null as number | null }
  );

  jugadores = toSignal(this.data.getJugadores(), { initialValue: [] as Jugador[] });

  reporte = toSignal(
    this.route.paramMap.pipe(
      switchMap(p => {
        const id = Number(p.get('id'));
        this.errorMessage.set('');
        if (!Number.isFinite(id) || id <= 0) return of(null);

        return this.data.getReporteProgreso(id).pipe(
          catchError(err => {
            this.errorMessage.set(
              err?.status === 404
                ? 'No se encontro reporte para este jugador. Selecciona otro jugador.'
                : 'No se pudo cargar el reporte de progreso.'
            );
            return of(null);
          })
        );
      })
    ),
    { initialValue: null }
  );

  get maxCount(): number {
    const errores = this.reporte()?.erroresFrecuentes ?? [];
    return errores.length > 0 ? Math.max(...errores.map(e => e.count)) : 1;
  }

  barWidth(count: number): number {
    return Math.round((count / this.maxCount) * 100);
  }

  get chartPoints(): string {
    const evolucion = this.reporte()?.evolucion ?? [];
    if (evolucion.length < 2) return '';
    const w = 300, h = 100;
    const vals = evolucion.map(e => e.puntuacion);
    const minV = Math.min(...vals), maxV = Math.max(...vals);
    const range = maxV - minV || 1;
    return evolucion.map((e, i) => {
      const x = (i / (evolucion.length - 1)) * w;
      const y = h - ((e.puntuacion - minV) / range) * (h - 10) - 5;
      return `${x},${y}`;
    }).join(' ');
  }

  get areaPoints(): string {
    const evolucion = this.reporte()?.evolucion ?? [];
    if (evolucion.length < 2) return '';
    const w = 300, h = 100;
    const vals = evolucion.map(e => e.puntuacion);
    const minV = Math.min(...vals), maxV = Math.max(...vals);
    const range = maxV - minV || 1;
    const pts = evolucion.map((e, i) => {
      const x = (i / (evolucion.length - 1)) * w;
      const y = h - ((e.puntuacion - minV) / range) * (h - 10) - 5;
      return `${x},${y}`;
    });
    return `${pts.join(' ')} ${300},${h} 0,${h}`;
  }
}
