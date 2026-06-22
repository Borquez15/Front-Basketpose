// src/app/features/players/player-registration/player-registration.component.ts
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { DataService } from '../../../core/services/data.service';
import { ApiService } from '../../../core/services/api.service';
import { environment } from '../../../../environments/environment';

type FaceStatus = 'idle' | 'capturing' | 'success' | 'error';

@Component({
  selector: 'app-player-registration',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './player-registration.component.html',
  styleUrls: ['./player-registration.component.css'],
})
export class PlayerRegistrationComponent {
  private data   = inject(DataService);
  private api    = inject(ApiService);
  private router = inject(Router);
  private http   = inject(HttpClient);

  clases = toSignal(this.data.getClases(), { initialValue: [] });

  // ── Campos del formulario ──────────────────────────────────────────────────
  nombre        = '';
  apellidos     = '';
  claseId: number | null = null;
  numeroCamiseta = '';
  posicion      = 'Base';
  estatura: number | null = null;
  peso: number | null = null;
  curp          = '';

  // ── Estado de UI ──────────────────────────────────────────────────────────
  formError    = signal('');
  saving       = signal(false);
  savedId      = signal<number | null>(null);     // ID del jugador recién guardado
  faceStatus   = signal<FaceStatus>('idle');
  faceMsg      = signal('');

  // ── Guardar jugador ────────────────────────────────────────────────────────
  guardar(): void {
    if (!this.nombre.trim())   { this.formError.set('El nombre es obligatorio.'); return; }
    if (!this.apellidos.trim()) { this.formError.set('Los apellidos son obligatorios.'); return; }
    if (!this.claseId)          { this.formError.set('Selecciona una clase.'); return; }

    this.formError.set('');
    this.saving.set(true);

    const payload = {
      nombre_jugador:    this.nombre.trim(),
      apellidos_jugador: this.apellidos.trim(),
      id_clase:          this.claseId,
      numero_camiseta:   this.numeroCamiseta || null,
      posicion:          this.posicion,
      altura_cm:         this.estatura   ?? null,
      peso_kg:           this.peso       ?? null,
      curp:              this.curp.trim().toUpperCase() || null,
    };

    this.http.post<any>(`${environment.apiUrl}/jugadores`, payload).subscribe({
      next: (res) => {
        this.saving.set(false);
        // El backend puede devolver id_jugador o id
        const id = res?.id_jugador ?? res?.id;
        if (id) {
          this.savedId.set(id);
        } else {
          // Jugador creado pero sin ID retornado → navegar a lista
          this.router.navigate(['/app/jugadores']);
        }
      },
      error: (err) => {
        this.saving.set(false);
        const msg = err?.error?.detail || 'Error al guardar el jugador.';
        this.formError.set(msg);
      },
    });
  }

  // ── Capturar rostro (CU-C02) ──────────────────────────────────────────────
  capturarRostro(): void {
    const id = this.savedId();
    if (!id) {
      this.faceMsg.set('Primero guarda el jugador antes de registrar el rostro.');
      return;
    }
    this.faceStatus.set('capturing');
    this.faceMsg.set('');

    this.api.registrarRostro(id).subscribe({
      next: () => {
        this.faceStatus.set('success');
        this.faceMsg.set('✅ Rostro registrado correctamente en la base de datos.');
      },
      error: (err) => {
        this.faceStatus.set('error');
        const msg = err?.error?.detail || 'Error al registrar el rostro.';
        this.faceMsg.set(msg);
      },
    });
  }
}
