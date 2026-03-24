// add-player.component.ts
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { DataService } from '../../../core/services/data.service';
import { environment } from '../../../../environments/environment';

interface CurpResult {
  nombre: string;
  apellidos: string;
  edad: number;
}

@Component({
  selector: 'app-add-player',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './add-player.component.html',
  styleUrls: ['./add-player.component.css']
})
export class AddPlayerComponent {
  data    = inject(DataService);
  router  = inject(Router);
  http    = inject(HttpClient);
  clases  = toSignal(this.data.getClases(), { initialValue: [] });

  // Form fields
  curp          = '';
  nombre        = '';
  correo        = '';
  edad: number | null = null;
  posicion      = 'Base';
  estatura: number | null = null;
  peso: number | null = null;
  claseId: number | null = null;
  numeroCamiseta = '';

  // UI state
  error        = signal('');
  faceCapture  = signal(false);
  curpLoading  = signal(false);
  curpMsg      = signal('');
  curpFound    = signal(false);

  capturarRostro() { this.faceCapture.set(true); }

  buscarCurp() {
    const curpVal = this.curp.trim().toUpperCase();
    if (curpVal.length !== 18) {
      this.curpMsg.set('La CURP debe tener 18 caracteres.');
      this.curpFound.set(false);
      return;
    }
    this.curpLoading.set(true);
    this.curpMsg.set('');

    // Buscar en la BD local si el jugador ya existe con esa CURP
    this.http.get<any>(`${environment.apiUrl}/jugadores/buscar-curp/${curpVal}`)
      .subscribe({
        next: (res) => {
          this.curpLoading.set(false);
          if (res) {
            this.nombre    = res.nombre_jugador + (res.apellidos_jugador ? ' ' + res.apellidos_jugador : '');
            this.posicion  = res.posicion || 'Base';
            this.estatura  = res.altura_cm ? +res.altura_cm : null;
            this.peso      = res.peso_kg   ? +res.peso_kg   : null;
            this.curpMsg.set('✅ Jugador encontrado. Revisa los datos.');
            this.curpFound.set(true);
          } else {
            this.curpMsg.set('No se encontró un jugador con esa CURP. Llena los datos manualmente.');
            this.curpFound.set(false);
          }
        },
        error: () => {
          this.curpLoading.set(false);
          this.curpMsg.set('No se encontró un jugador con esa CURP. Llena los datos manualmente.');
          this.curpFound.set(false);
        }
      });
  }

  guardar() {
    if (!this.nombre.trim()) { this.error.set('El nombre completo es obligatorio.'); return; }
    if (!this.claseId)       { this.error.set('Selecciona una clase.'); return; }

    // Separar nombre y apellidos
    const partes = this.nombre.trim().split(' ');
    const nombre_jugador    = partes[0] || '';
    const apellidos_jugador = partes.slice(1).join(' ') || '';

    const payload = {
      id_clase:          this.claseId,
      nombre_jugador,
      apellidos_jugador,
      numero_camiseta:   this.numeroCamiseta || null,
      posicion:          this.posicion,
      altura_cm:         this.estatura   ?? null,
      peso_kg:           this.peso       ?? null,
      curp:              this.curp.trim().toUpperCase() || null,
      notas:             this.correo ? `correo: ${this.correo}` : null,
    };

    this.http.post(`${environment.apiUrl}/jugadores`, payload).subscribe({
      next: () => this.router.navigate(['/app/jugadores']),
      error: (err) => {
        const msg = err?.error?.detail || 'Error al guardar el jugador. Intenta de nuevo.';
        this.error.set(msg);
      }
    });
  }
}