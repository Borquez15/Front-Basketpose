import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { DataService } from '../../../core/services/data.service';
import { Jugador } from '../../../core/models';

// 1. IMPORTA EL COMPONENTE AQUÍ
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-player-list',
  standalone: true,
  // 2. AGREGALO A ESTA LISTA DE IMPORTS
  imports: [RouterLink, FormsModule, CommonModule, NavbarComponent], 
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.css']
})
export class PlayerListComponent {
  private dataService = inject(DataService);
  
  jugadores = toSignal(this.dataService.getJugadores(), { 
    initialValue: [] as Jugador[] 
  });
  
  search = signal('');
  posFilter = signal('Todos');
  posiciones = ['Todos', 'Base', 'Escolta', 'Alero', 'Ala-Pivot', 'Pivot'];
  selectedPlayer = signal<Jugador | null>(null);

  filtered() {
    const lista = this.jugadores() || [];
    return lista.filter(j => {
      const nombreCompleto = `${j.nombre} ${j.apellidosJugador || ''}`.toLowerCase();
      const matchSearch = nombreCompleto.includes(this.search().toLowerCase());
      const matchPos = this.posFilter() === 'Todos' || j.posicion === this.posFilter();
      return matchSearch && matchPos;
    });
  }

  verDetalles(j: Jugador) {
    this.selectedPlayer.set(j);
  }

  scoreChip(pts: number): string {
    if (pts >= 85) return 'chip-green';
    if (pts >= 70) return 'chip-orange';
    return 'chip-red';
  }
}