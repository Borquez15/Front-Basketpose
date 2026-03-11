import { Injectable, signal } from '@angular/core';
import { User } from '../models/index';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(null);
  readonly user = this._user.asReadonly();

  login(correo: string, _password: string): boolean {
    // Mock — reemplazar con HTTP call
    this._user.set({
      id: 1,
      nombre: 'Carlos Mendoza',
      correo,
      activo: true,
      fechaRegistro: new Date()
    });
    return true;
  }

  register(nombre: string, correo: string, _password: string): boolean {
    this._user.set({ id: 2, nombre, correo, activo: true, fechaRegistro: new Date() });
    return true;
  }

  logout(): void { this._user.set(null); }

  isLoggedIn(): boolean { return this._user() !== null; }

  getInitials(): string {
    const name = this._user()?.nombre ?? '';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }
}
