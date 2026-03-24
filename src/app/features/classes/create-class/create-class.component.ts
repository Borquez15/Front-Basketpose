// create-class.component.ts
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DataService } from '../../../core/services/data.service';
import { Clase } from '../../../core/models/index';

@Component({
  selector: 'app-create-class',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './create-class.component.html',
  styleUrls: ['./create-class.component.css']
})
export class CreateClassComponent {
  data   = inject(DataService);
  router = inject(Router);

  nombre               = '';
  descripcion          = '';
  nivel: Clase['nivel']     = 'Avanzado';
  categoria: Clase['categoria'] = 'Adulto';
  lugar                = '';
  reconocimientoFacial = signal(true);
  analisisRealTime     = signal(true);
  reportesAutomaticos  = signal(false);
  error                = signal('');

  guardar() {
    if (!this.nombre.trim()) { this.error.set('El nombre es obligatorio.'); return; }
    this.data.createClase({
      nombre: this.nombre, descripcion: this.descripcion,
      nivel: this.nivel, categoria: this.categoria, lugar: this.lugar,
      reconocimientoFacial: this.reconocimientoFacial(),
      analisisRealTime: this.analisisRealTime(),
      reportesAutomaticos: this.reportesAutomaticos(),
    }).subscribe({
      next: () => this.router.navigate(['/app/clases']),
      error: () => this.error.set('Error al crear la clase. Intenta de nuevo.')
    });
  }
}
