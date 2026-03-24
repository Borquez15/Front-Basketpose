// data.service.ts — corregido para la estructura real de la BD
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Clase, Jugador, Sesion, AnalisisTiro, ReporteProgreso } from '../models/index';

@Injectable({ providedIn: 'root' })
export class DataService {

  constructor(private http: HttpClient) {}

  // ── CLASES ────────────────────────────────────────────────────────────────
  getClases(): Observable<Clase[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/clases/mis-clases`).pipe(
      map(list => list.map(c => ({
        id:                    c.id_clase,
        nombre:                c.nombre,
        descripcion:           c.descripcion ?? '',
        nivel:                 'Avanzado' as Clase['nivel'],
        categoria:             'Adulto'   as Clase['categoria'],
        lugar:                 '',
        activa:                c.activo,
        totalJugadores:        c.total_miembros ?? 0,
        promedioTecnico:       0,
        rol:                   (c.mi_rol ?? 'jugador') as Clase['rol'],
        reconocimientoFacial:  false,
        analisisRealTime:      false,
        reportesAutomaticos:   false,
      }))
    ));
  }

  getClase(id: number): Observable<Clase> {
    return this.http.get<any>(`${environment.apiUrl}/clases/${id}`).pipe(
      map(c => ({
        id:                    c.id_clase,
        nombre:                c.nombre,
        descripcion:           c.descripcion ?? '',
        nivel:                 'Avanzado' as Clase['nivel'],
        categoria:             'Adulto'   as Clase['categoria'],
        lugar:                 '',
        activa:                c.activo,
        totalJugadores:        c.total_miembros ?? 0,
        promedioTecnico:       0,
        rol:                   (c.mi_rol ?? 'jugador') as Clase['rol'],
        reconocimientoFacial:  false,
        analisisRealTime:      false,
        reportesAutomaticos:   false,
      }))
    );
  }

  createClase(clase: Partial<Clase>): Observable<Clase> {
    const payload = { nombre: clase.nombre, descripcion: clase.descripcion };
    return this.http.post<any>(`${environment.apiUrl}/clases`, payload).pipe(
      map(c => ({ ...clase, id: c.id_clase } as Clase))
    );
  }

  updateClase(id: number, clase: Partial<Clase>): Observable<Clase> {
    return this.http.put<Clase>(`${environment.apiUrl}/clases/${id}`, clase);
  }

  deleteClase(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/clases/${id}`);
  }

  // ── JUGADORES ─────────────────────────────────────────────────────────────
  // La BD real tiene jugador con id_clase directo
  getJugadores(claseId?: number): Observable<Jugador[]> {
    const url = claseId
      ? `${environment.apiUrl}/jugadores/clase/${claseId}`
      : `${environment.apiUrl}/jugadores`;
    return this.http.get<any[]>(url).pipe(
      map(list => {
        // El endpoint /jugadores/clase/:id devuelve objetos con { jugador, nombre_usuario, ... }
        // El endpoint /jugadores devuelve directamente
        return list.map(item => {
          const j = item.jugador ?? item;
          return {
            id:               j.id_jugador ?? item.id_miembro,
            nombre:           j.nombre_jugador ?? item.nombre_usuario ?? '—',
            correo:           item.email_usuario ?? '',
            posicion:         (j.posicion ?? 'Base') as Jugador['posicion'],
            puntuacionPromedio: 0,
            activo:           j.activo ?? true,
            claseNombre:      '',
            initials:         this._initials(j.nombre_jugador ?? item.nombre_usuario ?? ''),
            avatarColor:      this._color(j.id_jugador ?? 0),
          } as Jugador;
        });
      })
    );
  }

  getJugador(id: number): Observable<Jugador> {
    return this.http.get<any>(`${environment.apiUrl}/jugadores/${id}`).pipe(
      map(j => ({
        id:               j.id_jugador,
        nombre:           j.nombre_jugador ?? '—',
        posicion:         (j.posicion ?? 'Base') as Jugador['posicion'],
        puntuacionPromedio: 0,
        activo:           j.activo ?? true,
        initials:         this._initials(j.nombre_jugador ?? ''),
        avatarColor:      this._color(j.id_jugador),
      } as Jugador))
    );
  }

  createJugador(jugador: Partial<Jugador>): Observable<Jugador> {
    return this.http.post<Jugador>(`${environment.apiUrl}/jugadores`, jugador);
  }

  updateJugador(id: number, jugador: Partial<Jugador>): Observable<Jugador> {
    return this.http.put<Jugador>(`${environment.apiUrl}/jugadores/${id}`, jugador);
  }

  // ── SESIONES ──────────────────────────────────────────────────────────────
  getSesiones(claseId?: number): Observable<Sesion[]> {
    const url = claseId
      ? `${environment.apiUrl}/sesiones/clase/${claseId}`
      : `${environment.apiUrl}/sesiones/clase/0`; // fallback vacío
    return this.http.get<any[]>(url).pipe(
      map(list => list.map(s => ({
        id:                  s.id_sesion,
        idClase:             s.id_clase,
        claseNombre:         '',
        fecha:               new Date(s.fecha_sesion),
        horaInicio:          '',
        totalTiros:          0,
        totalJugadores:      0,
        puntuacionPromedio:  0,
        errorMasFrecuente:   '',
      } as Sesion)))
    );
  }

  getSesion(id: number): Observable<Sesion> {
    return this.http.get<any>(`${environment.apiUrl}/sesiones/${id}`).pipe(
      map(s => ({
        id: s.id_sesion, idClase: s.id_clase, claseNombre: '',
        fecha: new Date(s.fecha_sesion), horaInicio: '',
        totalTiros: 0, totalJugadores: 0, puntuacionPromedio: 0,
      } as Sesion))
    );
  }

  createSesion(sesion: Partial<Sesion>): Observable<Sesion> {
    return this.http.post<Sesion>(`${environment.apiUrl}/sesiones`, sesion);
  }

  // ── ANÁLISIS TIRO ─────────────────────────────────────────────────────────
  getAnalisis(sesionId: number): Observable<AnalisisTiro[]> {
    return this.http.get<AnalisisTiro[]>(`${environment.apiUrl}/analisis/sesion/${sesionId}`);
  }

  getAnalisisTiro(id: number): Observable<AnalisisTiro> {
    return this.http.get<AnalisisTiro>(`${environment.apiUrl}/analisis/${id}`);
  }

  // ── REPORTE PROGRESO ──────────────────────────────────────────────────────
  getReporteProgreso(jugadorId: number): Observable<ReporteProgreso> {
    return this.http.get<ReporteProgreso>(`${environment.apiUrl}/jugadores/${jugadorId}/reporte`);
  }

  // ── HELPERS ───────────────────────────────────────────────────────────────
  private _initials(name: string): string {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  private readonly _colors = [
    '#ff6b35','#8b5cf6','#0ea5e9','#10b981','#f59e0b','#ef4444','#3b82f6','#ec4899'
  ];
  private _color(id: number): string {
    return this._colors[id % this._colors.length];
  }
}