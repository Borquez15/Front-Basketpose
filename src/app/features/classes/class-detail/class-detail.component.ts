import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, filter, map } from 'rxjs'; // <-- Importa filter y map
import { DataService } from '../../../core/services/data.service';
import { Jugador } from '../../../core/models/index';

@Component({
  selector: 'app-class-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './class-detail.component.html',
  styleUrls: ['./class-detail.component.css']
})
export class ClassDetailComponent {
  private route = inject(ActivatedRoute);
  data          = inject(DataService);
  activeTab     = signal(0);
  codeCopied    = signal(false);

  // Solución para evitar enviar NaN al backend
  clase = toSignal(
    this.route.paramMap.pipe(
      map(p => Number(p.get('id'))),
      filter(id => !isNaN(id) && id > 0), // Filtra si no es un número válido
      switchMap(id => this.data.getClase(id))
    )
  );

  // Lo mismo para los jugadores
  jugadores = toSignal(
    this.route.paramMap.pipe(
      map(p => Number(p.get('id'))),
      filter(id => !isNaN(id) && id > 0),
      switchMap(id => this.data.getJugadores(id))
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
}