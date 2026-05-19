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
  nombre: string;
  apellidos: string;
  edad: number;
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

  private faceStream: MediaStream | null = null;
  rostroBase64: string | null = null;

  async iniciarCamaraRostro() {
    this.error.set('');

    if (!navigator.mediaDevices?.getUserMedia) {
      this.error.set('Tu navegador no permite usar cámara. Abre la app en Safari/Chrome con HTTPS.');
      return;
    }

    try {
      this.detenerCamaraRostro();

      this.faceStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
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
      this.rostroBase64 = null;
    } catch (err) {
      console.error(err);
      this.error.set(
        'No se pudo acceder a la cámara. Da permisos al navegador y usa HTTPS o localhost.'
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

  capturarRostro() {
    this.error.set('');

    const video = this.videoFace?.nativeElement;
    const canvas = this.canvasFace?.nativeElement;

    if (!video || !canvas || !this.cameraOn()) {
      this.error.set('Primero inicia la cámara.');
      return;
    }

    if (!video.videoWidth || !video.videoHeight) {
      this.error.set('La cámara aún no está lista. Espera un segundo e intenta de nuevo.');
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
    this.faceCapture.set(true);
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

    this.http.get<CurpResult>(`${environment.apiUrl}/curp/${curp}`).subscribe({
      next: (res) => {
        this.nombre = `${res.nombre} ${res.apellidos}`.trim();
        this.edad = res.edad ?? this.edad;
        this.curpFound.set(true);
        this.curpMsg.set('Datos encontrados y cargados en el formulario.');
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

    if (!this.rostroBase64) {
      this.error.set('Captura el rostro del jugador antes de guardar.');
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
