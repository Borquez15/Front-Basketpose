// add-player.component.ts
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DataService } from '../../../core/services/data.service';
import { Jugador } from '../../../core/models/index';

@Component({
  selector: 'app-add-player',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './add-player.component.html',
  styleUrls: ['./add-player.component.css']
})
export class AddPlayerComponent {
  data   = inject(DataService);
  router = inject(Router);
  clases = this.data.clases;

  nombre     = '';
  correo     = '';
  edad: number | null = null;
  posicion: Jugador['posicion'] = 'Base';
  estatura: number | null = null;
  peso: number | null = null;
  claseNombre = '';
  error       = signal('');
  faceCapture = signal(false);

  capturarRostro() { this.faceCapture.set(true); }

  guardar() {
    if (!this.nombre.trim()) { this.error.set('El nombre es obligatorio.'); return; }
    this.data.addJugador({
      nombre: this.nombre, correo: this.correo,
      edad: this.edad ?? undefined, posicion: this.posicion,
      estaturaCm: this.estatura ?? undefined, pesoKg: this.peso ?? undefined,
      claseNombre: this.claseNombre
    });
    this.router.navigate(['/app/jugadores']);
  }
}
