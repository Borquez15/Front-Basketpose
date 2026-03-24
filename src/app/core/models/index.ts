// src/app/core/models/index.ts

// ── USUARIO ─────────────────────────────────────────────────────────
export interface User {
  id: number;
  nombre: string;
  correo: string;
  telefono?: string;
  activo: boolean;
  fechaRegistro: Date;
}

// ── CLASE ───────────────────────────────────────────────────────────
export interface Clase {
  id: number;
  nombre: string;
  descripcion?: string;
  nivel: 'Principiante' | 'Intermedio' | 'Avanzado' | 'Élite';
  categoria: 'Infantil' | 'Juvenil' | 'Adulto' | 'Mixto';
  lugar?: string;
  activa: boolean;
  totalJugadores: number;
  promedioTecnico: number;
  rol: 'propietario' | 'auxiliar' | 'jugador';
  reconocimientoFacial: boolean;
  analisisRealTime: boolean;
  reportesAutomaticos: boolean;
}

// ── JUGADOR ─────────────────────────────────────────────────────────
// src/app/core/models/index.ts

export interface ClaseSimple {
  id: number;
  nombre: string;
}

export interface Jugador {
  id: number;
  nombre: string;
  idClase?: number;
  idUsuario?: number;
  curp?: string;
  apellidosJugador?: string;
  numeroCamiseta?: string; // <--- AGREGAR ESTA LÍNEA
  estaturaCm?: number;
  pesoKg?: number;
  posicion?: string;
  notas?: string;
  activo: boolean;
  puntuacionPromedio?: number;
  initials?: string;
  avatarColor?: string;
  clase?: ClaseSimple; 
}
// ── SESION ──────────────────────────────────────────────────────────
export interface Sesion {
  id: number;
  idClase: number;
  titulo: string;       
  descripcion?: string; 
  claseNombre?: string;
  fecha?: Date;
  lugar?: string;
  horaInicio?: string;
  horaFin?: string;
  totalTiros?: number;
  totalJugadores?: number;
  puntuacionPromedio?: number;
  errorMasFrecuente?: string;
  observaciones?: string;
}

// ── ANÁLISIS DE TIRO ────────────────────────────────────────────────
export interface AnguloDetectado {
  nombre: string;
  valor: number;
  rangoMin: number;
  rangoMax: number;
  estado: 'ok' | 'warn' | 'error';
}

export interface ErrorDetectado {
  nombre: string;
  descripcion: string;
  gravedad: 'Leve' | 'Moderado' | 'Grave';
}

export interface AnalisisTiro {
  id: number;
  jugadorNombre: string;
  jugadorInitials: string;
  jugadorAvatarColor: string;
  horaEvento: string;
  puntuacionGlobal: number;
  resultadoTiro: 'encestado' | 'fallado' | 'no_determinado';
  angulos: AnguloDetectado[];
  errores: ErrorDetectado[];
}

// ── REPORTE DE PROGRESO ─────────────────────────────────────────────
export interface PuntoEvolucion { 
  fecha: string; 
  puntuacion: number; 
}

export interface ErrorFrecuente { 
  nombre: string; 
  count: number; 
}

export interface Recomendacion { 
  icono: string; 
  titulo: string; 
  descripcion: string; 
}

export interface ReporteProgreso {
  jugadorNombre: string;
  jugadorInitials: string;
  jugadorPosicion: string;
  jugadorAvatarColor: string;
  totalTiros: number;
  totalSesiones: number;
  puntuacionPromedio: number;
  evolucion: PuntoEvolucion[];
  erroresFrecuentes: ErrorFrecuente[];
  recomendaciones: Recomendacion[];
}