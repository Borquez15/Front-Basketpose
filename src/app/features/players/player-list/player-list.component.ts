// player-list.component.ts
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-player-list',
  standalone: true,
  imports: [RouterLink, FormsModule, NavbarComponent],
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.css']
})
export class PlayerListComponent {
  data       = inject(DataService);
  jugadores  = this.data.jugadores;
  search     = signal('');
  posFilter  = signal('Todos');
  posiciones = ['Todos', 'Base', 'Escolta', 'Alero', 'Ala-Pivot', 'Pivot'];

  // Método en lugar de getter para que el template pueda llamarlo con ()
  filtered() {
    return this.jugadores().filter(j => {
      const matchSearch = j.nombre.toLowerCase().includes(this.search().toLowerCase());
      const matchPos    = this.posFilter() === 'Todos' || j.posicion === this.posFilter();
      return matchSearch && matchPos;
    });
  }

  scoreChip(pts: number): string {
    if (pts >= 85) return 'chip chip-green';
    if (pts >= 70) return 'chip chip-yellow';
    return 'chip chip-red';
  }
}