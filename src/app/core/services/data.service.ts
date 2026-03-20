import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Clase, Jugador, Sesion, AnalisisTiro, ReporteProgreso } from '../models/index';

@Injectable({ providedIn: 'root' })
export class DataService {

  constructor(private http: HttpClient) {}

  // ── CLASES ────────────────────────────────────────────────────────────────
  getClases(): Observable<Clase[]> {
    return this.http.get<Clase[]>(`${environment.apiUrl}/clases/mis-clases`);
  }

  getClase(id: number): Observable<Clase> {
    return this.http.get<Clase>(`${environment.apiUrl}/clases/${id}`);
  }

  createClase(clase: Partial<Clase>): Observable<Clase> {
    return this.http.post<Clase>(`${environment.apiUrl}/clases`, clase);
  }

  updateClase(id: number, clase: Partial<Clase>): Observable<Clase> {
    return this.http.put<Clase>(`${environment.apiUrl}/clases/${id}`, clase);
  }

  deleteClase(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/clases/${id}`);
  }

  // ── JUGADORES ─────────────────────────────────────────────────────────────
  getJugadores(claseId?: number): Observable<Jugador[]> {
    const params = claseId ? { id_clase: String(claseId) } : undefined;
    return this.http.get<Jugador[]>(`${environment.apiUrl}/jugadores`, { params });
  }

  getJugador(id: number): Observable<Jugador> {
    return this.http.get<Jugador>(`${environment.apiUrl}/jugadores/${id}`);
  }

  createJugador(jugador: Partial<Jugador>): Observable<Jugador> {
    return this.http.post<Jugador>(`${environment.apiUrl}/jugadores`, jugador);
  }

  updateJugador(id: number, jugador: Partial<Jugador>): Observable<Jugador> {
    return this.http.put<Jugador>(`${environment.apiUrl}/jugadores/${id}`, jugador);
  }

  // ── SESIONES ──────────────────────────────────────────────────────────────
  getSesiones(claseId?: number): Observable<Sesion[]> {
    const params = claseId ? { id_clase: String(claseId) } : undefined;
    return this.http.get<Sesion[]>(`${environment.apiUrl}/sesiones`, { params });
  }

  getSesion(id: number): Observable<Sesion> {
    return this.http.get<Sesion>(`${environment.apiUrl}/sesiones/${id}`);
  }

  createSesion(sesion: Partial<Sesion>): Observable<Sesion> {
    return this.http.post<Sesion>(`${environment.apiUrl}/sesiones`, sesion);
  }

  // ── ANÁLISIS TIRO ─────────────────────────────────────────────────────────
  getAnalisis(sesionId: number): Observable<AnalisisTiro[]> {
    return this.http.get<AnalisisTiro[]>(`${environment.apiUrl}/sesiones/${sesionId}/analisis`);
  }

  getAnalisisTiro(id: number): Observable<AnalisisTiro> {
    return this.http.get<AnalisisTiro>(`${environment.apiUrl}/analisis/${id}`);
  }

  // ── REPORTE PROGRESO ──────────────────────────────────────────────────────
  getReporteProgreso(jugadorId: number): Observable<ReporteProgreso> {
    return this.http.get<ReporteProgreso>(`${environment.apiUrl}/jugadores/${jugadorId}/reporte`);
  }
}

