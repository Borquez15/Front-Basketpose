// class-list.component.ts
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
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
  router = inject(Router);
  clases = toSignal(this.data.getClases(), { initialValue: [] });
  search = signal('');
  joinCode = '';
  joinLoading = signal(false);
  joinStatus = signal('');
  joinError = signal('');

  filtered() {
    const q = this.search().toLowerCase();
    return this.clases().filter(c => c.nombre.toLowerCase().includes(q));
  }

  rolChip(rol: string) {
    if (rol === 'propietario') return 'chip chip-gold';
    if (rol === 'auxiliar' || rol === 'entrenador') return 'chip chip-blue';
    if (rol === 'administrador') return 'chip chip-orange';
    return 'chip chip-green';
  }

  unirsePorCodigo() {
    const codigo = this.joinCode.trim();
    this.joinStatus.set('');
    this.joinError.set('');
    if (!codigo) {
      this.joinError.set('Escribe el codigo de la clase.');
      return;
    }

    this.joinLoading.set(true);
    this.data.unirseAClasePorCodigo(codigo).subscribe({
      next: miembro => {
        this.joinLoading.set(false);
        this.joinStatus.set('Te uniste a la clase.');
        this.joinCode = '';
        setTimeout(() => this.router.navigate(['/app/clases', miembro.id_clase]), 450);
      },
      error: err => {
        this.joinLoading.set(false);
        this.joinError.set(err?.error?.detail || 'No se pudo unir a la clase con ese codigo.');
      }
    });
  }
}
