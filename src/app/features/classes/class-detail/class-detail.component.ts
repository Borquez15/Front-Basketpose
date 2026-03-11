import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../../../core/services/data.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-class-detail',
  standalone: true,
  imports: [RouterLink, NavbarComponent],
  templateUrl: './class-detail.component.html',
  styleUrls: ['./class-detail.component.css']
})
export class ClassDetailComponent {
  data       = inject(DataService);
  clase      = this.data.clases()[0];
  jugadores  = this.data.jugadores;
  activeTab  = signal(0);
  codeCopied = signal(false);

  setTab(i: number) { this.activeTab.set(i); }

  copyCode() {
    navigator.clipboard?.writeText('BK-7X3P');
    this.codeCopied.set(true);
    setTimeout(() => this.codeCopied.set(false), 2000);
  }

  scoreChip(pts: number): string {
    if (pts >= 85) return 'chip chip-green';
    if (pts >= 70) return 'chip chip-yellow';
    return 'chip chip-red';
  }
}
