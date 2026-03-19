// class-list.component.ts
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { TitleCasePipe } from '../../../shared/pipes/titlecase.pipe';

@Component({
  selector: 'app-class-list',
  standalone: true,
  imports: [RouterLink, FormsModule, NavbarComponent, TitleCasePipe],
  templateUrl: './class-list.component.html',
  styleUrls: ['./class-list.component.css']
})
export class ClassListComponent {
  data   = inject(DataService);
  clases = this.data.clases;
  search = signal('');

  // Método en lugar de getter para que el template pueda llamarlo con ()
  filtered() {
    const q = this.search().toLowerCase();
    return this.clases().filter(c => c.nombre.toLowerCase().includes(q));
  }

  rolChip(rol: string) {
    if (rol === 'propietario') return 'chip chip-gold';
    if (rol === 'auxiliar')   return 'chip chip-blue';
    return 'chip chip-green';
  }
}