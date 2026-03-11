// live-session.component.ts
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../../../core/services/data.service';

@Component({
  selector: 'app-live-session',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './live-session.component.html',
  styleUrls: ['./live-session.component.css']
})
export class LiveSessionComponent implements OnInit, OnDestroy {
  data    = inject(DataService);
  seconds = signal(0);
  private interval: ReturnType<typeof setInterval> | null = null;

  jugadoresDetectados = [
    { initials: 'JP', nombre: 'Juan',  color: '#ff6b35', estado: 'green' },
    { initials: 'MG', nombre: 'María', color: '#8b5cf6', estado: 'green' },
    { initials: 'CL', nombre: 'Carlos',color: '#0ea5e9', estado: 'yellow'},
  ];

  ultimoTiro = {
    nombre: 'María González',
    hora: '10:34:12',
    angulos: ['Codo 94°', 'Hombro 128°', 'Rodilla 112°']
  };

  stats = { tiros: 18, jugadores: 3, promedio: 82 };

  ngOnInit()    { this.interval = setInterval(() => this.seconds.update(s => s + 1), 1000); }
  ngOnDestroy() { if (this.interval) clearInterval(this.interval); }

  get timerDisplay(): string {
    const s = this.seconds();
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }

  estadoColor(e: string): string {
    if (e === 'green')  return 'var(--green)';
    if (e === 'yellow') return 'var(--yellow)';
    return 'var(--red)';
  }
}
