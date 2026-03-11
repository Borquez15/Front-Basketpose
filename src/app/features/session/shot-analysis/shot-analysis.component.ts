// shot-analysis.component.ts
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../../../core/services/data.service';

@Component({
  selector: 'app-shot-analysis',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './shot-analysis.component.html',
  styleUrls: ['./shot-analysis.component.css']
})
export class ShotAnalysisComponent {
  data     = inject(DataService);
  analisis = this.data.analisisTiro;

  get gaugeOffset(): number {
    const pct  = this.analisis.puntuacionGlobal / 100;
    const circ = 2 * Math.PI * 40;
    return circ * (1 - pct);
  }

  get gaugeColor(): string {
    const p = this.analisis.puntuacionGlobal;
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
