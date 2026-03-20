import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, AuthResponse } from '../models/index';

const TOKEN_KEY = 'basketpose_token';
const ROL_CLASES_KEY = 'basketpose_rol_clases';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(null);
  readonly user = this._user.asReadonly();

  constructor(private http: HttpClient, private router: Router) {
    this._loadUserFromToken();
  }

  login(correo: string, contrasena: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, { correo, contrasena })
      .pipe(
        tap(res => {
          localStorage.setItem(TOKEN_KEY, res.jwt_token);
          localStorage.setItem(ROL_CLASES_KEY, JSON.stringify(res.rol_clases));
          this._user.set(res.usuario);
        })
      );
  }

  register(nombre: string, correo: string, contrasena: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/registro`, { nombre, correo, contrasena })
      .pipe(
        tap(res => {
          localStorage.setItem(TOKEN_KEY, res.jwt_token);
          localStorage.setItem(ROL_CLASES_KEY, JSON.stringify(res.rol_clases));
          this._user.set(res.usuario);
        })
      );
  }

  logout(): void {
    // Fire-and-forget: always clear local session regardless of backend response
    this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe({ error: () => {} });
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROL_CLASES_KEY);
    this._user.set(null);
    this.router.navigate(['/auth/login']);
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/auth/profile`).pipe(
      tap(usuario => this._user.set(usuario))
    );
  }

  isLoggedIn(): boolean { return this._user() !== null; }

  getToken(): string | null { return localStorage.getItem(TOKEN_KEY); }

  getInitials(): string {
    const name = this._user()?.nombre ?? '';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  private _loadUserFromToken(): void {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) { localStorage.removeItem(TOKEN_KEY); return; }
      const payload = JSON.parse(atob(parts[1]));
      if (payload?.exp && payload.exp * 1000 > Date.now()) {
        this._user.set(payload.user ?? payload.usuario ?? null);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
    }
  }
}

