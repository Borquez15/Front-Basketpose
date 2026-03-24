import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, filter, map } from 'rxjs';
import { DataService } from '../../../core/services/data.service';
import { Jugador } from '../../../core/models/index';

@Component({
  selector: 'app-class-detail',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './class-detail.component.html',
  styleUrls: ['./class-detail.component.css']
})
export class ClassDetailComponent {
  private route = inject(ActivatedRoute);
  router        = inject(Router);
  data          = inject(DataService);

  activeTab     = signal(0);
  codeCopied    = signal(false);

  // Estado para el Modal flotante
  mostrarFormSesion = signal(false);
  tituloSesion      = '';

  clase = toSignal(
    this.route.paramMap.pipe(
      map(p => Number(p.get('id'))),
      filter(id => !isNaN(id) && id > 0),
      switchMap(id => this.data.getClase(id))
    )
  );

  jugadores = toSignal(
    this.route.paramMap.pipe(
      map(p => Number(p.get('id'))),
      filter(id => !isNaN(id) && id > 0),
      switchMap(id => this.data.getJugadores())
    ),
    { initialValue: [] as Jugador[] }
  );

  setTab(i: number) { this.activeTab.set(i); }

  copyCode() {
    const clase = this.clase();
    const code = clase?.id ? `BK-${clase.id}` : 'BK-XXXX';
    navigator.clipboard?.writeText(code);
    this.codeCopied.set(true);
    setTimeout(() => this.codeCopied.set(false), 2000);
  }

  scoreChip(pts: number): string {
    if (pts >= 85) return 'chip chip-green';
    if (pts >= 70) return 'chip chip-yellow';
    return 'chip chip-red';
  }

  iniciarNuevaSesion() {
    if (!this.tituloSesion.trim()) return; 
    const claseActual = this.clase();
    if (!claseActual) return;

    this.data.createSesion({
      idClase: claseActual.id,
      titulo: this.tituloSesion
    }).subscribe({
      next: (sesionCreada) => {
        this.mostrarFormSesion.set(false); // Cerramos el modal
        this.router.navigate(['/app/sesion']); // Navegamos a la cámara
      },
      error: () => alert('Error al crear la sesión en el servidor.')
    });
  }
}