import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Clase, Jugador, Sesion, AnalisisTiro, ReporteProgreso } from '../models/index';

@Injectable({ providedIn: 'root' })
export class DataService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  constructor() {}

  // ── CLASES ────────────────────────────────────────────────────────────────
  getClases(): Observable<Clase[]> {
    // El backend ya devuelve totalJugadores calculado desde la tabla jugador
    // No necesitamos forkJoin ni calcular aquí
    return this.http.get<any[]>(`${this.baseUrl}/clases/mis-clases`).pipe(
      map(clases => {
        console.log('CLASES RECIBIDAS DEL BACKEND:', clases);
        return clases.map(c => ({
          id: c.id_clase ?? c.id,
          nombre: c.nombre,
          descripcion: c.descripcion ?? '',
          nivel: 'Avanzado' as Clase['nivel'],
          categoria: 'Adulto' as Clase['categoria'],
          lugar: c.lugar ?? '',
          activa: c.activa ?? c.activo ?? true,
          // Backend devuelve totalJugadores (camelCase) directamente en el dict
          totalJugadores: c.totalJugadores ?? c.total_jugadores ?? c.total_miembros ?? 0,
          promedioTecnico: c.promedioTecnico ?? c.promedio_tecnico ?? 0,
          rol: (c.rol ?? c.mi_rol ?? 'jugador') as Clase['rol'],
          reconocimientoFacial: false,
          analisisRealTime: false,
          reportesAutomaticos: false,
        }));
      })
    );
  }

  getClase(id: number): Observable<Clase> {
    return this.http.get<any>(`${this.baseUrl}/clases/${id}`).pipe(
      map(c => ({
        id: c.id_clase,
        nombre: c.nombre,
        descripcion: c.descripcion ?? '',
        nivel: 'Avanzado' as Clase['nivel'],
        categoria: 'Adulto' as Clase['categoria'],
        lugar: c.lugar ?? '',
        activa: c.activo,
        totalJugadores: c.total_jugadores ?? c.total_miembros ?? 0,
        promedioTecnico: c.promedio_tecnico ?? 0,
        rol: (c.mi_rol ?? 'jugador') as Clase['rol'],
        reconocimientoFacial: false,
        analisisRealTime: false,
        reportesAutomaticos: false,
      }))
    );
  }

  createClase(clase: Partial<Clase>): Observable<Clase> {
    const payload = { nombre: clase.nombre, descripcion: clase.descripcion };
    return this.http.post<any>(`${this.baseUrl}/clases`, payload).pipe(
      map(c => ({ ...clase, id: c.id_clase } as Clase))
    );
  }

  updateClase(id: number, clase: Partial<Clase>): Observable<Clase> {
    return this.http.put<Clase>(`${this.baseUrl}/clases/${id}`, clase);
  }

  deleteClase(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/clases/${id}`);
  }

  // ── JUGADORES ─────────────────────────────────────────────────────────────

  lookupJugadorPorCurp(curp: string): Observable<Jugador> {
    return this.http.get<Jugador>(`${this.baseUrl}/jugadores/lookup/curp`, {
      params: { curp }
    });
  }

  getJugadores(): Observable<Jugador[]> {
    return this.http.get<any[]>(`${this.baseUrl}/jugadores/mis-jugadores`).pipe(
      map(list => {
        console.log('JUGADORES RECIBIDOS:', list);
        return (list || []).map(item => ({
          id: item.id ?? item.id_jugador,
          nombre: item.nombre ?? item.nombre_jugador ?? 'Sin nombre',
          apellidosJugador: item.apellidosJugador ?? item.apellidos_jugador ?? '',
          idClase: item.idClase ?? item.id_clase,
          curp: item.curp,
          numeroCamiseta: item.numeroCamiseta ?? item.numero_camiseta ?? 'S/N',
          posicion: item.posicion ?? 'Base',
          estaturaCm: item.estaturaCm ?? item.altura_cm ?? 0,
          pesoKg: item.pesoKg ?? item.peso_kg ?? 0,
          activo: item.activo ?? true,
          notas: item.notas ?? '',
          puntuacionPromedio: item.puntuacionPromedio ?? 0,
          initials: item.initials ?? this._initials(item.nombre ?? item.nombre_jugador ?? ''),
          avatarColor: item.avatarColor ?? this._color(item.id ?? item.id_jugador),
          clase: item.clase
        } as Jugador));
      })
    );
  }

  getJugador(id: number): Observable<Jugador> {
    return this.http.get<any>(`${this.baseUrl}/jugadores/${id}`).pipe(
      map(j => {
        console.log('DATOS DE UN JUGADOR:', j);
        return {
          id: j.id ?? j.id_jugador,
          idUsuario: j.idUsuario ?? j.id_usuario,
          idClase: j.idClase ?? j.id_clase,
          curp: j.curp,
          nombre: j.nombre ?? j.nombre_jugador ?? '—',
          apellidosJugador: j.apellidosJugador ?? j.apellidos_jugador ?? '',
          numeroCamiseta: j.numeroCamiseta ?? j.numero_camiseta ?? 'S/N',
          posicion: (j.posicion ?? 'Base') as Jugador['posicion'],
          estaturaCm: j.estaturaCm ?? j.altura_cm ?? 0,
          pesoKg: j.pesoKg ?? j.peso_kg ?? 0,
          puntuacionPromedio: j.puntuacionPromedio ?? 0,
          activo: j.activo ?? true,
          notas: j.notas ?? '',
          initials: j.initials ?? this._initials(j.nombre ?? j.nombre_jugador ?? ''),
          avatarColor: j.avatarColor ?? this._color(j.id ?? j.id_jugador),
          clase: j.clase
        } as Jugador;
      })
    );
  }

  createJugador(jugador: Partial<Jugador>): Observable<Jugador> {
    return this.http.post<Jugador>(`${this.baseUrl}/jugadores`, jugador);
  }

  updateJugador(id: number, jugador: Partial<Jugador>): Observable<Jugador> {
    return this.http.put<Jugador>(`${this.baseUrl}/jugadores/${id}`, jugador);
  }

  // ── SESIONES ──────────────────────────────────────────────────────────────
  getSesiones(claseId?: number): Observable<Sesion[]> {
    const url = claseId
      ? `${this.baseUrl}/sesiones/clase/${claseId}`
      : `${this.baseUrl}/sesiones/mis-sesiones`;

    return this.http.get<any>(url).pipe(
      map(res => {
        const list = Array.isArray(res) ? res : [];
        return list.map(s => ({
          id: s.id_sesion || s.id,
          idClase: s.id_clase || s.idClase,
          claseNombre: '',
          titulo: s.titulo || 'Sesión en Vivo',
          fecha: s.fecha_sesion
            ? new Date(s.fecha_sesion)
            : s.creado_en
              ? new Date(s.creado_en)
              : new Date(),
          horaInicio: '',
          totalTiros: 0,
          totalJugadores: 0,
          puntuacionPromedio: 0,
          errorMasFrecuente: '',
        } as Sesion));
      })
    );
  }

  getSesion(id: number): Observable<Sesion> {
    return this.http.get<any>(`${this.baseUrl}/sesiones/${id}`).pipe(
      map(s => ({
        id: s.id_sesion, idClase: s.id_clase, claseNombre: '',
        titulo: s.titulo || 'Sesión',
        fecha: new Date(s.fecha_sesion || s.creado_en), horaInicio: '',
        totalTiros: 0, totalJugadores: 0, puntuacionPromedio: 0,
      } as Sesion))
    );
  }

  createSesion(sesion: Partial<Sesion>): Observable<Sesion> {
    const payload = {
      id_clase: sesion.idClase,
      titulo: sesion.titulo,
      descripcion: sesion.descripcion ?? '',
    };
    console.log('CREAR SESIÓN payload:', payload);

    return this.http.post<any>(`${this.baseUrl}/sesiones`, payload).pipe(
      map(s => ({
        id: s.id_sesion || s.id,
        idClase: s.id_clase || sesion.idClase!,
        titulo: sesion.titulo || 'Sesión',
        fecha: s.fecha_sesion
          ? new Date(s.fecha_sesion)
          : s.creado_en
            ? new Date(s.creado_en)
            : new Date()
      } as Sesion))
    );
  }

  // ── ANÁLISIS TIRO ─────────────────────────────────────────────────────────
  getAnalisis(sesionId: number): Observable<AnalisisTiro[]> {
    return this.http.get<AnalisisTiro[]>(`${this.baseUrl}/analisis/sesion/${sesionId}`);
  }

  getAnalisisTiro(id: number): Observable<AnalisisTiro> {
    return this.http.get<AnalisisTiro>(`${this.baseUrl}/analisis/${id}`);
  }

  // ── REPORTE PROGRESO ──────────────────────────────────────────────────────
  getReporteProgreso(jugadorId: number): Observable<ReporteProgreso> {
    return this.http.get<ReporteProgreso>(`${this.baseUrl}/jugadores/${jugadorId}/reporte`);
  }

  // ── HELPERS ───────────────────────────────────────────────────────────────
  private _initials(name: string): string {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  private readonly _colors = [
    '#ff6b35', '#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'
  ];
  private _color(id: number): string {
    return this._colors[(id || 0) % this._colors.length];
  }
}