// progress-report.component.ts
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { DataService } from '../../../core/services/data.service';
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

  reporte = toSignal(
    this.route.paramMap.pipe(switchMap(p => this.data.getReporteProgreso(+p.get('id')!)))
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
