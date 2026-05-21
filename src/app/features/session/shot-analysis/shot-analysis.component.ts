// shot-analysis.component.ts
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';
import { DataService } from '../../../core/services/data.service';

@Component({
  selector: 'app-shot-analysis',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './shot-analysis.component.html',
  styleUrls: ['./shot-analysis.component.css']
})
export class ShotAnalysisComponent {
  private route = inject(ActivatedRoute);
  data          = inject(DataService);
  errorMessage  = signal('');

  analisis = toSignal(
    this.route.paramMap.pipe(
      switchMap(p => {
        this.errorMessage.set('');
        return this.data.getAnalisisTiro(+p.get('id')!).pipe(
          catchError(err => {
            this.errorMessage.set(
              err?.status === 404
                ? 'Todavia no hay un tiro registrado para mostrar este analisis.'
                : 'No se pudo cargar el analisis de tiro.'
            );
            return of(null);
          })
        );
      })
    )
  );

  get gaugeOffset(): number {
    const pct  = (this.analisis()?.puntuacionGlobal ?? 0) / 100;
    const circ = 2 * Math.PI * 40;
    return circ * (1 - pct);
  }

  get gaugeColor(): string {
    const p = this.analisis()?.puntuacionGlobal ?? 0;
    if (p >= 80) return 'var(--green)';
    if (p >= 60) return 'var(--yellow)';
    return 'var(--red)';
  }

  estadoIcon(e: string): string {
    if (e === 'ok')   return '✅';
    if (e === 'warn') return '⚠️';
    return '❌';
  }

  estadoColor(e: string): string {
    if (e === 'ok')   return 'var(--green)';
    if (e === 'warn') return 'var(--yellow)';
    return 'var(--red)';
  }

  gravedadChip(g: string): string {
    if (g === 'Leve')     return 'chip chip-yellow';
    if (g === 'Moderado') return 'chip chip-orange';
    return 'chip chip-red';
  }
}
