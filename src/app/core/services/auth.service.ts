// auth.service.ts — corregido para coincidir con el backend real
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { User } from '../models/index';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'basketpose_token';

interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    id_usuario?: number;
    nombre: string;
    ap_p?: string;
    ap_m?: string;
    email: string;
    activo?: boolean;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(null);
  readonly user = this._user.asReadonly();

  constructor(private http: HttpClient, private router: Router) {
    this._loadUserFromToken();
  }

  /** El backend espera { email, password } */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(tap(res => this._handleAuthResponse(res)));
  }

  register(nombre: string, ap_p: string, ap_m: string, email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, { nombre, ap_p, ap_m, email, password })
      .pipe(tap(res => this._handleAuthResponse(res)));
  }

  loginWithGoogle(idToken: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/firebase`, { idToken })
      .pipe(tap(res => this._handleAuthResponse(res)));
  }

  private _handleAuthResponse(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.access_token);
    // Normalizar el objeto de usuario (el backend devuelve id o id_usuario)
    const raw = res.user as any;
    const user: User = {
      id:             raw.id ?? raw.id_usuario ?? 0,
      nombre:         raw.nombre ?? '',
      correo:         raw.email ?? '',
      activo:         raw.activo ?? true,
      fechaRegistro:  new Date(),
    };
    this._user.set(user);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this._user.set(null);
    this.router.navigate(['/auth/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

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
        // Solo guardamos el sub (id), el nombre se recuperará al navegar
        if (payload.user) {
          this._handleAuthResponse({ access_token: token, user: payload.user });
        }
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
    }
  }
}