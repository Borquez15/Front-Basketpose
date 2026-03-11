// progress-report.component.ts
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  data    = inject(DataService);
  reporte = this.data.reporteProgreso;
  periodo = signal<'7d' | '30d' | '3m'>('7d');

  get maxCount(): number {
    return Math.max(...this.reporte.erroresFrecuentes.map(e => e.count));
  }

  barWidth(count: number): number {
    return Math.round((count / this.maxCount) * 100);
  }

  // Generar polyline points para la gráfica SVG
  get chartPoints(): string {
    const w = 300, h = 100;
    const vals = this.reporte.evolucion.map(e => e.puntuacion);
    const minV = Math.min(...vals), maxV = Math.max(...vals);
    const range = maxV - minV || 1;
    return this.reporte.evolucion.map((e, i) => {
      const x = (i / (this.reporte.evolucion.length - 1)) * w;
      const y = h - ((e.puntuacion - minV) / range) * (h - 10) - 5;
      return `${x},${y}`;
    }).join(' ');
  }

  get areaPoints(): string {
    const w = 300, h = 100;
    const vals = this.reporte.evolucion.map(e => e.puntuacion);
    const minV = Math.min(...vals), maxV = Math.max(...vals);
    const range = maxV - minV || 1;
    const pts = this.reporte.evolucion.map((e, i) => {
      const x = (i / (this.reporte.evolucion.length - 1)) * w;
      const y = h - ((e.puntuacion - minV) / range) * (h - 10) - 5;
      return `${x},${y}`;
    });
    return `${pts.join(' ')} ${300},${h} 0,${h}`;
  }
}
