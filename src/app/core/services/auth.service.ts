import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/index';

interface AuthResponse {
  access_token: string;
  user: User;
}

const TOKEN_KEY = 'basketpose_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(null);
  readonly user = this._user.asReadonly();

  constructor(private http: HttpClient, private router: Router) {
    this._loadUserFromToken();
  }

  login(correo: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, { correo, password })
      .pipe(
        tap(res => {
          localStorage.setItem(TOKEN_KEY, res.access_token);
          this._user.set(res.user);
        })
      );
  }

  register(nombre: string, correo: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, { nombre, correo, password })
      .pipe(
        tap(res => {
          localStorage.setItem(TOKEN_KEY, res.access_token);
          this._user.set(res.user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this._user.set(null);
    this.router.navigate(['/auth/login']);
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
        this._user.set(payload.user ?? null);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
    }
  }
}

