// live-session.component.ts
import {
  Component,
  ChangeDetectorRef,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { DataService } from '../../../core/services/data.service';
import { environment } from '../../../../environments/environment';

interface CameraOption {
  deviceId: string;
  label: string;
}

interface PoseLandmark {
  name: string;
  x: number;
  y: number;
  visibility: number;
}

interface LiveFrameResponse {
  pose_detected: boolean;
  landmarks: PoseLandmark[];
  angles: Record<string, number>;
  ball?: { x: number; y: number; radius: number } | null;
  shot_attempt?: boolean;
  shot_registered?: boolean;
  shot_score?: number;
  analisis_id?: number;
  jugador?: {
    id_jugador: number;
    nombre: string;
    confianza: number;
  } | null;
  mensaje: string;
}

@Component({
  selector: 'app-live-session',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './live-session.component.html',
  styleUrls: ['./live-session.component.css']
})
export class LiveSessionComponent implements OnInit, OnDestroy {
  data   = inject(DataService);
  http   = inject(HttpClient);
  router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  clases = toSignal(this.data.getClases(), { initialValue: [] });
  jugadores = toSignal(this.data.getJugadores(), { initialValue: [] });

  @ViewChild('analysisVideo') analysisVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('overlayCanvas') overlayCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('captureCanvas') captureCanvas!: ElementRef<HTMLCanvasElement>;

  sessionStarted = signal(false);
  setupError     = signal('');
  setupStatus    = signal('');
  saving         = signal(false);

  titulo       = '';
  descripcion  = '';
  claseId: number | null = null;
  jugadorManualId: number | null = null;
  duracionMin: number | null = 90;
  sessionId: number | null = null;

  seconds = signal(0);
  private interval: ReturnType<typeof setInterval> | null = null;
  private frameInterval: ReturnType<typeof setInterval> | null = null;
  private analysisBusy = false;
  private cameraStream: MediaStream | null = null;

  cameras = signal<CameraOption[]>([]);
  selectedCameraId = '';
  cameraError = signal('');
  bodyStatus = signal('Inicia la sesion para activar la camara.');
  poseDetected = signal(false);
  playerDetected = signal<{ id_jugador: number; nombre: string; confianza: number } | null>(null);
  angles = signal<Record<string, number>>({});
  ballDetected = signal(false);
  lastShotScore = signal<number | null>(null);
  manualShotSaving = signal(false);

  stats = { tiros: 0, jugadores: 0, promedio: 0 };
  private playerIds = new Set<number>();

  private readonly poseConnections = [
    [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
    [11, 23], [12, 24], [23, 24],
    [23, 25], [25, 27], [24, 26], [26, 28],
    [27, 31], [28, 32], [15, 19], [16, 20]
  ];

  jugadoresClase() {
    const id = this.claseId;
    return this.jugadores().filter(jugador => !id || jugador.idClase === id);
  }

  ngOnInit() {
    const params = this.route.snapshot.queryParamMap;
    const claseIdParam = params.get('claseId');
    const tituloParam  = params.get('titulo');
    if (claseIdParam) this.claseId = Number(claseIdParam);
    if (tituloParam)  this.titulo  = tituloParam;
  }

  ngOnDestroy() {
    this._stopTimer();
    this.detenerCamaraAnalisis();
  }

  private _stopTimer() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  iniciarSesion() {
    if (!this.titulo.trim()) { this.setupError.set('El titulo es obligatorio.'); return; }
    if (!this.claseId)       { this.setupError.set('Selecciona una clase.'); return; }

    this.saving.set(true);
    this.setupError.set('');
    this.setupStatus.set('Creando sesion...');

    const payload = {
      id_clase:     this.claseId,
      titulo:       this.titulo.trim(),
      descripcion:  this.descripcion.trim() || 'Entrenamiento de tiros libres',
      fecha_sesion: new Date().toISOString().split('T')[0],
      duracion_min: this.duracionMin ?? 90,
    };

    this.http.post<any>(`${environment.apiUrl}/sesiones`, payload).subscribe({
      next: (res) => {
        console.log('SESION CREADA:', res);
        this.saving.set(false);
        this.sessionId = res.id_sesion ?? res.id;
        if (!this.sessionId) {
          this.setupError.set('La sesion se creo, pero el backend no devolvio id_sesion.');
          this.setupStatus.set('');
          return;
        }
        this.setupStatus.set('Sesion creada. Activando camara...');
        this.sessionStarted.set(true);
        this.cdr.detectChanges();
        this.seconds.set(0);
        this.interval = setInterval(() => this.seconds.update(s => s + 1), 1000);
        setTimeout(() => void this.iniciarCamaraAnalisis(), 150);
      },
      error: (err) => {
        console.error('ERROR AL CREAR SESION:', err);
        this.saving.set(false);
        this.setupStatus.set('');
        const detail = err?.error?.detail;
        const msg = typeof detail === 'string'
          ? detail
          : detail
            ? JSON.stringify(detail)
            : 'Error al crear la sesion. Intenta de nuevo.';
        this.setupError.set(msg);
      }
    });
  }

  async cargarCamaras() {
    if (!navigator.mediaDevices?.enumerateDevices) return;

    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices
      .filter(device => device.kind === 'videoinput')
      .map((device, index) => ({
        deviceId: device.deviceId,
        label: device.label || `Camara ${index + 1}`
      }));

    this.cameras.set(cameras);
    if (!this.selectedCameraId && cameras.length > 0) {
      this.selectedCameraId = cameras[0].deviceId;
    }
  }

  async iniciarCamaraAnalisis() {
    this.cameraError.set('');

    if (!navigator.mediaDevices?.getUserMedia) {
      this.cameraError.set('Tu navegador no permite usar camara.');
      return;
    }

    try {
      this.detenerCamaraAnalisis();

      const video: MediaTrackConstraints = this.selectedCameraId
        ? { deviceId: { exact: this.selectedCameraId } }
        : { facingMode: 'environment' };

      this.cameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          ...video,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      const videoEl = this.analysisVideo.nativeElement;
      videoEl.srcObject = this.cameraStream;
      await videoEl.play();
      await this.cargarCamaras();

      this.bodyStatus.set('Camara activa. Coloca el cuerpo completo dentro del encuadre.');
      this.cameraError.set('');
      this.iniciarAnalisisFrames();
    } catch (err) {
      console.error(err);
      this.cameraError.set('No se pudo acceder a la camara. Revisa permisos o selecciona Camo Camera.');
    }
  }

  detenerCamaraAnalisis() {
    if (this.frameInterval) {
      clearInterval(this.frameInterval);
      this.frameInterval = null;
    }

    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => track.stop());
      this.cameraStream = null;
    }

    if (this.analysisVideo?.nativeElement) {
      this.analysisVideo.nativeElement.srcObject = null;
    }
  }

  async cambiarCamara() {
    if (this.sessionStarted()) {
      await this.iniciarCamaraAnalisis();
    }
  }

  private iniciarAnalisisFrames() {
    if (this.frameInterval) clearInterval(this.frameInterval);
    this.frameInterval = setInterval(() => this.enviarFrameAnalisis(), 900);
  }

  private enviarFrameAnalisis() {
    if (this.analysisBusy || !this.sessionId) return;

    const video = this.analysisVideo?.nativeElement;
    const canvas = this.captureCanvas?.nativeElement;
    if (!video || !canvas || !video.videoWidth || !video.videoHeight) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const image_base64 = canvas.toDataURL('image/jpeg', 0.72);

    this.analysisBusy = true;
    this.http.post<LiveFrameResponse>(`${environment.apiUrl}/analisis/frame`, {
      id_sesion: this.sessionId,
      image_base64,
      id_jugador_manual: this.jugadorManualId
    }).subscribe({
      next: (res) => {
        this.analysisBusy = false;
        this.poseDetected.set(res.pose_detected);
        this.angles.set(res.angles || {});
        this.playerDetected.set(res.jugador ?? null);
        this.ballDetected.set(!!res.ball);
        this.bodyStatus.set(res.mensaje);
        if (res.jugador?.id_jugador) {
          this.playerIds.add(res.jugador.id_jugador);
          this.stats.jugadores = this.playerIds.size;
        }
        if (res.shot_registered) {
          this.stats.tiros += 1;
          if (typeof res.shot_score === 'number') {
            const prevTotal = this.stats.promedio * (this.stats.tiros - 1);
            this.stats.promedio = Math.round((prevTotal + res.shot_score) / this.stats.tiros);
            this.lastShotScore.set(res.shot_score);
          }
        }
        this.dibujarPuntos(res.landmarks || []);
      },
      error: (err) => {
        this.analysisBusy = false;
        const msg = err?.error?.detail || 'No se pudo analizar el frame.';
        this.bodyStatus.set(msg);
      }
    });
  }

  registrarTiroLibreManual() {
    const jugadorId = this.playerDetected()?.id_jugador ?? this.jugadorManualId;
    if (!this.sessionId || !jugadorId) {
      this.bodyStatus.set('Selecciona o reconoce un jugador antes de guardar el tiro libre.');
      return;
    }

    const score = this.calcularScoreLocal();
    this.manualShotSaving.set(true);
    this.http.post<any>(`${environment.apiUrl}/analisis`, {
      id_sesion: this.sessionId,
      id_jugador: jugadorId,
      resultado: 'indeterminado',
      tipo_tiro: 'tiros_libres',
      distancia_tiro_metros: 4.57,
      puntuacion_tecnica: score,
      analisis_valido: true,
      notas: 'Tiro libre guardado por observacion del entrenador durante la sesion en vivo.'
    }).subscribe({
      next: () => {
        this.manualShotSaving.set(false);
        this.stats.tiros += 1;
        const prevTotal = this.stats.promedio * (this.stats.tiros - 1);
        this.stats.promedio = Math.round((prevTotal + score) / this.stats.tiros);
        this.lastShotScore.set(score);
        this.bodyStatus.set(`Tiro libre guardado con promedio tecnico ${score} pts.`);
      },
      error: err => {
        this.manualShotSaving.set(false);
        this.bodyStatus.set(err?.error?.detail || 'No se pudo guardar el tiro libre.');
      }
    });
  }

  private calcularScoreLocal(): number {
    const angles = this.angles();
    const targets: Record<string, number> = {
      codo_der: 165,
      codo_izq: 165,
      hombro_der: 110,
      hombro_izq: 110,
      rodilla_der: 165,
      rodilla_izq: 165,
      muneca_der: 170,
      muneca_izq: 170,
      tronco: 170
    };
    const scores = Object.entries(targets)
      .filter(([key]) => typeof angles[key] === 'number')
      .map(([key, target]) => Math.max(35, 100 - Math.abs(angles[key] - target) * 1.7));
    return scores.length ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length) : 70;
  }

  private dibujarPuntos(landmarks: PoseLandmark[]) {
    const canvas = this.overlayCanvas?.nativeElement;
    const video = this.analysisVideo?.nativeElement;
    if (!canvas || !video) return;

    const rect = video.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(rect.width));
    canvas.height = Math.max(1, Math.round(rect.height));

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!landmarks.length) return;

    const visible = (idx: number) => landmarks[idx] && landmarks[idx].visibility > 0.45;

    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ff6b35';
    for (const [a, b] of this.poseConnections) {
      if (!visible(a) || !visible(b)) continue;
      ctx.beginPath();
      ctx.moveTo(landmarks[a].x * canvas.width, landmarks[a].y * canvas.height);
      ctx.lineTo(landmarks[b].x * canvas.width, landmarks[b].y * canvas.height);
      ctx.stroke();
    }

    for (let i = 0; i < landmarks.length; i++) {
      if (!visible(i)) continue;
      const point = landmarks[i];
      ctx.beginPath();
      ctx.fillStyle = i <= 10 ? '#3b82f6' : '#10b981';
      ctx.arc(point.x * canvas.width, point.y * canvas.height, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    }
  }

  finalizarSesion() {
    this._stopTimer();
    this.detenerCamaraAnalisis();
    if (this.claseId) {
      this.router.navigate(['/app/clases', this.claseId], { queryParams: { tab: 'sesiones' } });
      return;
    }
    this.router.navigate(['/app/dashboard']);
  }

  get timerDisplay(): string {
    const s = this.seconds();
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  angleEntries() {
    const labels: Record<string, string> = {
      codo_der: 'Codo der',
      codo_izq: 'Codo izq',
      hombro_der: 'Hombro der',
      hombro_izq: 'Hombro izq',
      rodilla_der: 'Rodilla der',
      rodilla_izq: 'Rodilla izq',
      muneca_der: 'Muneca der',
      muneca_izq: 'Muneca izq',
      tronco: 'Tronco'
    };

    return Object.entries(this.angles()).map(([key, value]) => ({
      key,
      label: labels[key] ?? key,
      value: Math.round(value)
    }));
  }
}
