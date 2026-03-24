// live-session.component.ts
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { DataService } from '../../../core/services/data.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-live-session',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './live-session.component.html',
  styleUrls: ['./live-session.component.css']
})
export class LiveSessionComponent implements OnInit, OnDestroy {
  data   = inject(DataService);
  http   = inject(HttpClient);
  router = inject(Router);
  private route = inject(ActivatedRoute);
  clases = toSignal(this.data.getClases(), { initialValue: [] });

  // Setup form (shown before starting)
  sessionStarted = signal(false);
  setupError     = signal('');
  saving         = signal(false);

  // Setup fields
  titulo       = '';
  descripcion  = '';
  claseId: number | null = null;
  duracionMin: number | null = 90;

  // Live session state
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

  ngOnInit() {
    const params = this.route.snapshot.queryParamMap;
    const claseIdParam = params.get('claseId');
    const tituloParam  = params.get('titulo');
    if (claseIdParam) this.claseId = Number(claseIdParam);
    if (tituloParam)  this.titulo  = tituloParam;
  }

  ngOnDestroy() { this._stopTimer(); }

  private _stopTimer() {
    if (this.interval) { clearInterval(this.interval); this.interval = null; }
  }

  iniciarSesion() {
    if (!this.titulo.trim()) { this.setupError.set('El título es obligatorio.'); return; }
    if (!this.claseId)       { this.setupError.set('Selecciona una clase.'); return; }

    this.saving.set(true);
    this.setupError.set('');

    const payload = {
      id_clase:     this.claseId,
      titulo:       this.titulo.trim(),
      descripcion:  this.descripcion.trim() || null,
      fecha_sesion: new Date().toISOString().split('T')[0],
      duracion_min: this.duracionMin ?? 90,
    };

    this.http.post(`${environment.apiUrl}/sesiones`, payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.sessionStarted.set(true);
        this.seconds.set(0);
        this.interval = setInterval(() => this.seconds.update(s => s + 1), 1000);
      },
      error: (err) => {
        this.saving.set(false);
        const msg = err?.error?.detail || 'Error al crear la sesión. Intenta de nuevo.';
        this.setupError.set(msg);
      }
    });
  }

  finalizarSesion() {
    this._stopTimer();
    this.router.navigate(['/app/dashboard']);
  }

  get timerDisplay(): string {
    const s = this.seconds();
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  estadoColor(e: string): string {
    if (e === 'green')  return 'var(--green)';
    if (e === 'yellow') return 'var(--yellow)';
    return 'var(--red)';
  }
}