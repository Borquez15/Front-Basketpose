import { Injectable, signal } from '@angular/core';
import { Clase, Jugador, Sesion, AnalisisTiro, ReporteProgreso } from '../models/index';

@Injectable({ providedIn: 'root' })
export class DataService {

  // ── CLASES ────────────────────────────────────────────────────────────────
  private _clases = signal<Clase[]>([]);
  readonly clases = this._clases.asReadonly();

  addClass(clase: Partial<Clase>): void {
    const newClase: Clase = {
      id: Date.now(), nombre: clase.nombre!, descripcion: clase.descripcion,
      nivel: clase.nivel ?? 'Intermedio', categoria: clase.categoria ?? 'Adulto',
      lugar: clase.lugar, activa: true, totalJugadores: 0, promedioTecnico: 0,
      rol: 'propietario', reconocimientoFacial: clase.reconocimientoFacial ?? true,
      analisisRealTime: clase.analisisRealTime ?? true,
      reportesAutomaticos: clase.reportesAutomaticos ?? false,
    };
    this._clases.update(list => [...list, newClase]);
  }

  // ── JUGADORES ─────────────────────────────────────────────────────────────
  private _jugadores = signal<Jugador[]>([]);
  readonly jugadores = this._jugadores.asReadonly();

  addJugador(j: Partial<Jugador>): void {
    const initials = (j.nombre ?? '').split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase();
    const colors = ['#ff6b35','#8b5cf6','#0ea5e9','#f59e0b','#22c55e','#ec4899'];
    this._jugadores.update(list => [...list, {
      id: Date.now(), nombre: j.nombre!, correo: j.correo,
      edad: j.edad, estaturaCm: j.estaturaCm, pesoKg: j.pesoKg,
      posicion: j.posicion ?? 'Base', claseNombre: j.claseNombre,
      puntuacionPromedio: 0, activo: true, initials,
      avatarColor: colors[Math.floor(Math.random() * colors.length)]
    }]);
  }

  // ── ÚLTIMA SESIÓN ─────────────────────────────────────────────────────────
  readonly ultimaSesion: Sesion | null = null;

  // ── ANÁLISIS TIRO ─────────────────────────────────────────────────────────
  readonly analisisTiro: AnalisisTiro = {
    id: 1, jugadorNombre: 'María González', jugadorInitials: 'MG',
    jugadorAvatarColor: '#8b5cf6', horaEvento: '10:34:12',
    puntuacionGlobal: 92, resultadoTiro: 'encestado',
    angulos: [
      { nombre: 'Codo',           valor: 94,  rangoMin: 90,  rangoMax: 95,  estado: 'ok' },
      { nombre: 'Hombro',         valor: 128, rangoMin: 120, rangoMax: 130, estado: 'ok' },
      { nombre: 'Muñeca',         valor: 82,  rangoMin: 85,  rangoMax: 95,  estado: 'warn' },
      { nombre: 'Rodilla',        valor: 112, rangoMin: 110, rangoMax: 120, estado: 'ok' },
      { nombre: 'Tronco',         valor: 5,   rangoMin: 0,   rangoMax: 10,  estado: 'ok' },
      { nombre: 'Alineación brazo', valor: 15, rangoMin: 0,  rangoMax: 10,  estado: 'error' },
    ],
    errores: [
      { nombre: 'Muñeca ligeramente baja', descripcion: 'Elevar la muñeca unos grados al momento del disparo', gravedad: 'Leve' },
      { nombre: 'Desalineación del brazo', descripcion: 'Mantener el codo alineado con la rodilla y el pie', gravedad: 'Moderado' },
    ]
  };

  // ── REPORTE PROGRESO ──────────────────────────────────────────────────────
  readonly reporteProgreso: ReporteProgreso = {
    jugadorNombre: 'María González', jugadorInitials: 'MG',
    jugadorPosicion: 'Alero', jugadorAvatarColor: '#8b5cf6',
    totalTiros: 248, totalSesiones: 12, puntuacionPromedio: 88,
    evolucion: [
      { fecha: '05/03', puntuacion: 75 }, { fecha: '06/03', puntuacion: 76 },
      { fecha: '07/03', puntuacion: 79 }, { fecha: '08/03', puntuacion: 77 },
      { fecha: '09/03', puntuacion: 82 }, { fecha: '10/03', puntuacion: 84 },
      { fecha: '11/03', puntuacion: 88 },
    ],
    erroresFrecuentes: [
      { nombre: 'Codo bajo',    count: 32 },
      { nombre: 'Muñeca rígida', count: 24 },
      { nombre: 'Desalineación', count: 18 },
      { nombre: 'Balance',       count: 15 },
      { nombre: 'Seguimiento',   count: 9  },
    ],
    recomendaciones: [
      { icono: '🎯', titulo: 'Mantén el codo elevado',    descripcion: 'Enfócate en formar un ángulo de 90° con el codo antes del lanzamiento' },
      { icono: '💪', titulo: 'Fortalece la muñeca',       descripcion: 'Ejercicios de flexión de muñeca pueden mejorar tu flick final' },
      { icono: '⚖️', titulo: 'Trabaja el balance',        descripcion: 'Practica tiros desde posición estática antes de añadir movimiento' },
    ]
  };
}
