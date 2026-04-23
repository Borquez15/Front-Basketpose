// src/app/core/services/api.service.ts
// Servicio para la comunicación con el backend Python (OpenCV / MediaPipe)
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, switchMap } from 'rxjs';

/** URL base del servidor Python (Flask / FastAPI) */
const VISION_URL = 'http://127.0.0.1:5000/api';

/** URL del stream MJPEG de OpenCV */
export const VIDEO_FEED_URL = 'http://127.0.0.1:5000/video_feed';

// ── Interfaces de respuesta ──────────────────────────────────────────────────

export interface RegistrarJugadorPayload {
  nombre_jugador: string;
  apellidos_jugador: string;
  id_clase: number;
  numero_camiseta?: string;
  posicion?: string;
  altura_cm?: number;
  peso_kg?: number;
  curp?: string;
}

export interface AnguloEnVivo {
  nombre: string; // 'Codo derecho', 'Rodilla derecha', etc.
  valor: number;  // grados (0–180)
}

export interface ErrorEnVivo {
  nombre: string;      // texto del catálogo_error
  gravedad: 'Leve' | 'Moderado' | 'Grave';
}

export interface EstadoEnVivo {
  jugador: {
    id_jugador: number;
    nombre_jugador: string;
    apellidos_jugador: string;
    numero_camiseta?: string;
  } | null;
  angulos: AnguloEnVivo[];
  errores: ErrorEnVivo[];
  timestamp: string;
}

export interface ReporteJugador {
  jugadorNombre: string;
  jugadorInitials: string;
  jugadorPosicion: string;
  jugadorAvatarColor: string;
  totalTiros: number;
  tirosEncestados: number;
  totalSesiones: number;
  puntuacionPromedio: number;
  evolucion: Array<{ fecha: string; puntuacion: number }>;
  erroresFrecuentes: Array<{ nombre: string; count: number }>;
  recomendaciones: Array<{ icono: string; titulo: string; descripcion: string }>;
}

// ────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  /**
   * Registra un jugador nuevo en el backend Python.
   * CU-C01
   */
  registrarJugador(datos: RegistrarJugadorPayload): Observable<any> {
    return this.http.post(`${VISION_URL}/jugadores/registrar`, datos);
  }

  /**
   * Ordena al backend que encienda la cámara y capture el encoding
   * facial del jugador indicado. CU-C02
   */
  registrarRostro(idJugador: number): Observable<{ mensaje: string; id_jugador: number }> {
    return this.http.post<{ mensaje: string; id_jugador: number }>(
      `${VISION_URL}/jugadores/${idJugador}/registrar-rostro`,
      {}
    );
  }

  /**
   * Inicia una sesión de entrenamiento en vivo en el backend.
   * CU-C03
   */
  iniciarSesion(datos: { id_clase: number; titulo: string }): Observable<any> {
    return this.http.post(`${VISION_URL}/sesiones/iniciar`, datos);
  }

  /**
   * Devuelve un Observable que hace polling al endpoint de estado en
   * vivo cada `ms` milisegundos.  El backend responde con el jugador
   * detectado por FaceRecognition y los ángulos calculados por MediaPipe.
   * CU-C10, CU-C11, CU-C12
   */
  getEstadoEnVivo(ms = 1000): Observable<EstadoEnVivo> {
    return interval(ms).pipe(
      switchMap(() => this.http.get<EstadoEnVivo>(`${VISION_URL}/estado-en-vivo`))
    );
  }

  /**
   * Obtiene el reporte de progreso de un jugador.
   * CU-C05, CU-C06, CU-C13
   */
  getReportesJugador(idJugador: number): Observable<ReporteJugador> {
    return this.http.get<ReporteJugador>(`${VISION_URL}/jugadores/${idJugador}/reporte`);
  }
}
