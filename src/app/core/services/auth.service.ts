import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { User } from '../models/index';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'access_token';

interface AuthResponse {
  access_token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(null);
  readonly user = this._user.asReadonly();

  constructor(private http: HttpClient, private router: Router) {}

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

  register(nombre: string, ap_p: string, ap_m: string, correo: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, { nombre, ap_p, ap_m, correo, password })
      .pipe(
        tap(res => {
          localStorage.setItem(TOKEN_KEY, res.access_token);
          this._user.set(res.user);
        })
      );
  }

  loginWithGoogle(idToken: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/firebase`, { idToken })
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
}