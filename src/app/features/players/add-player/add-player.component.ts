// add-player.component.ts
import {
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { DataService } from '../../../core/services/data.service';
import { environment } from '../../../../environments/environment';

interface CurpResult {
  encontrado?: boolean;
  datos?: {
    nombre_jugador?: string;
    apellidos_jugador?: string;
    altura_cm?: number;
    peso_kg?: number;
  };
}

interface CameraOption {
  deviceId: string;
  label: string;
}

interface FaceValidationResponse {
  valid: boolean;
  mensaje: string;
}

@Component({
  selector: 'app-add-player',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './add-player.component.html',
  styleUrl: './add-player.component.css'
})
export class AddPlayerComponent implements OnDestroy {
  private http = inject(HttpClient);
  private router = inject(Router);
  private data = inject(DataService);

  @ViewChild('videoFace') videoFace!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasFace') canvasFace!: ElementRef<HTMLCanvasElement>;

  clases = toSignal(this.data.getClases(), { initialValue: [] as any[] });

  nombre = '';
  correo = '';
  edad: number | null = null;
  numeroCamiseta = '';
  posicion = 'Base';
  estatura: number | null = null;
  peso: number | null = null;
  claseId: number | null = null;

  curp = '';
  curpLoading = signal(false);
  curpMsg = signal('');
  curpFound = signal(false);

  error = signal('');
  faceCapture = signal(false);
  cameraOn = signal(false);
  faceLoading = signal(false);
  faceChecking = signal(false);
  faceValidated = signal(false);
  faceStatus = signal('Inicia la camara y captura el rostro del jugador.');
  cameras = signal<CameraOption[]>([]);
  selectedCameraId = '';

  private faceStream: MediaStream | null = null;
  rostroBase64: string | null = null;

  async cargarCamaras() {
    if (!navigator.mediaDevices?.enumerateDevices) {
      return;
    }

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

  async iniciarCamaraRostro() {
    this.error.set('');

    if (!navigator.mediaDevices?.getUserMedia) {
      this.error.set('Tu navegador no permite usar camara. Abre la app en Safari/Chrome con HTTPS.');
      return;
    }

    try {
      this.detenerCamaraRostro();

      const selectedVideo: MediaTrackConstraints = this.selectedCameraId
        ? { deviceId: { exact: this.selectedCameraId } }
        : { facingMode: 'user' };

      this.faceStream = await navigator.mediaDevices.getUserMedia({
        video: {
          ...selectedVideo,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      const video = this.videoFace.nativeElement;
      video.srcObject = this.faceStream;
      await video.play();

      this.cameraOn.set(true);
      this.faceCapture.set(false);
      this.faceValidated.set(false);
      this.faceStatus.set('Camara activa. Coloca un solo rostro al centro y captura.');
      this.rostroBase64 = null;
      await this.cargarCamaras();
    } catch (err) {
      console.error(err);
      this.error.set(
        'No se pudo acceder a la camara. Da permisos al navegador y usa HTTPS o localhost.'
      );
    }
  }

  detenerCamaraRostro() {
    if (this.faceStream) {
      this.faceStream.getTracks().forEach(track => track.stop());
      this.faceStream = null;
    }

    if (this.videoFace?.nativeElement) {
      this.videoFace.nativeElement.srcObject = null;
    }

    this.cameraOn.set(false);
  }

  repetirCaptura() {
    this.faceCapture.set(false);
    this.faceValidated.set(false);
    this.faceChecking.set(false);
    this.faceStatus.set('Captura nuevamente el rostro del jugador.');
    this.rostroBase64 = null;
    void this.iniciarCamaraRostro();
  }

  async cambiarCamara() {
    if (this.cameraOn()) {
      await this.iniciarCamaraRostro();
    }
  }

  capturarRostro() {
    this.error.set('');
    this.faceStatus.set('');
    this.faceValidated.set(false);

    const video = this.videoFace?.nativeElement;
    const canvas = this.canvasFace?.nativeElement;

    if (!video || !canvas || !this.cameraOn()) {
      this.error.set('Primero inicia la camara.');
      return;
    }

    if (!video.videoWidth || !video.videoHeight) {
      this.error.set('La camara aun no esta lista. Espera un segundo e intenta de nuevo.');
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      this.error.set('No se pudo preparar la captura del rostro.');
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    this.rostroBase64 = canvas.toDataURL('image/jpeg', 0.92);
    this.faceChecking.set(true);
    this.faceStatus.set('Validando rostro...');

    this.http.post<FaceValidationResponse>(`${environment.apiUrl}/reconocimiento/validar`, {
      image_base64: this.rostroBase64
    }).subscribe({
      next: (res) => {
        this.faceChecking.set(false);
        this.faceValidated.set(true);
        this.faceCapture.set(true);
        this.faceStatus.set(res.mensaje || 'Rostro validado correctamente. Ya puedes guardar.');
        this.detenerCamaraRostro();
      },
      error: (err) => {
        this.faceChecking.set(false);
        this.faceValidated.set(false);
        this.faceCapture.set(false);
        this.rostroBase64 = null;
        const msg = err?.error?.detail || 'No se pudo validar el rostro. Intenta otra captura.';
        this.faceStatus.set(msg);
      }
    });
  }

  buscarCurp() {
    const curp = this.curp.trim().toUpperCase();

    this.curpMsg.set('');
    this.curpFound.set(false);

    if (!curp) {
      this.curpMsg.set('Escribe una CURP para buscar.');
      return;
    }

    if (curp.length !== 18) {
      this.curpMsg.set('La CURP debe tener 18 caracteres.');
      return;
    }

    this.curpLoading.set(true);

    this.http.get<CurpResult>(`${environment.apiUrl}/jugadores/lookup/curp`, {
      params: { curp }
    }).subscribe({
      next: (res) => {
        if (res.encontrado && res.datos) {
          this.nombre = `${res.datos.nombre_jugador ?? ''} ${res.datos.apellidos_jugador ?? ''}`.trim();
          this.estatura = res.datos.altura_cm ?? this.estatura;
          this.peso = res.datos.peso_kg ?? this.peso;
          this.curpFound.set(true);
          this.curpMsg.set('Datos encontrados y cargados en el formulario.');
        } else {
          this.curpFound.set(false);
          this.curpMsg.set('No se encontraron datos para esa CURP. Puedes llenar el formulario manualmente.');
        }
        this.curpLoading.set(false);
      },
      error: () => {
        this.curpFound.set(false);
        this.curpMsg.set('No se encontraron datos para esa CURP. Puedes llenar el formulario manualmente.');
        this.curpLoading.set(false);
      }
    });
  }

  guardar() {
    this.error.set('');

    const nombreCompleto = this.nombre.trim();

    if (!nombreCompleto) {
      this.error.set('El nombre completo es obligatorio.');
      return;
    }

    if (!this.claseId) {
      this.error.set('Selecciona una clase.');
      return;
    }

    if (!this.rostroBase64 || !this.faceValidated()) {
      this.error.set('Captura y valida el rostro del jugador antes de guardar.');
      return;
    }

    const partes = nombreCompleto.split(/\s+/);
    const nombre_jugador = partes.slice(0, 2).join(' ');
    const apellidos_jugador = partes.slice(2).join(' ') || 'Sin apellidos';

    const payload = {
      id_clase: this.claseId,
      nombre_jugador,
      apellidos_jugador,
      numero_camiseta: this.numeroCamiseta.trim() || null,
      posicion: this.posicion,
      altura_cm: this.estatura ?? null,
      peso_kg: this.peso ?? null,
      curp: this.curp.trim().toUpperCase() || null,
      notas: this.correo.trim() ? `correo: ${this.correo.trim()}` : null,
      rostro_base64: this.rostroBase64
    };

    this.faceLoading.set(true);

    this.http.post(`${environment.apiUrl}/jugadores`, payload).subscribe({
      next: () => {
        this.faceLoading.set(false);
        this.detenerCamaraRostro();
        this.router.navigate(['/app/jugadores']);
      },
      error: (err) => {
        console.error(err);
        const msg = err?.error?.detail || 'Error al guardar el jugador. Intenta de nuevo.';
        this.error.set(msg);
        this.faceLoading.set(false);
      }
    });
  }

  ngOnDestroy() {
    this.detenerCamaraRostro();
  }
}
