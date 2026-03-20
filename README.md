# BasketPose Frontend

Frontend Angular para la plataforma de análisis de poses en baloncesto **BasketPose**.

## 🚀 Inicio Rápido

### Requisitos
- Node.js 20+
- Angular CLI 20+
- Backend BasketPose corriendo en `http://localhost:8000`

### Desarrollo local

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm start
```

Abrir en el navegador: `http://localhost:4200`

---

## 🐳 Docker Compose (Recomendado)

Ejecuta el frontend + backend + base de datos con un solo comando.

### Prerrequisitos
- Docker y Docker Compose instalados
- Repositorio `basketpose-back` clonado al lado de este proyecto:
  ```
  tu-carpeta/
  ├── Front-Basketpose/   ← este repo
  └── basketpose-back/    ← repo del backend
  ```

### Pasos

```bash
# 1. Copia el archivo de ejemplo de variables de entorno
cp .env.example .env

# 2. Edita .env con tus valores (especialmente JWT_SECRET y credenciales Google OAuth)
nano .env

# 3. Ejecuta todo junto
docker-compose up
```

La aplicación estará disponible en:
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:8000
- **Documentación API**: http://localhost:8000/docs

---

## ⚙️ Configuración

### Variables de entorno frontend

El frontend usa la variable de entorno `environment.ts` para la URL del backend:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};
```

Para cambiar la URL del backend en desarrollo, edita `src/environments/environment.ts`.

### Variables de entorno del backend (.env)

Crea un archivo `.env` basado en `.env.example`:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DB_USER` | Usuario MySQL | `root` |
| `DB_PASSWORD` | Contraseña MySQL | `mi_contraseña` |
| `DB_HOST` | Host de MySQL | `localhost` |
| `DB_NAME` | Nombre de la base de datos | `basketpose` |
| `JWT_SECRET` | Clave secreta JWT | `una_clave_muy_segura_123` |
| `GOOGLE_CLIENT_ID` | ID de cliente Google OAuth | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Secreto de cliente Google OAuth | `GOCSPX-xxx` |

---

## 🏗️ Arquitectura del Frontend

```
src/app/
├── core/
│   ├── guards/
│   │   └── auth.guard.ts          ← Protege rutas autenticadas
│   ├── interceptors/
│   │   └── auth.interceptor.ts    ← Agrega JWT a cada petición
│   ├── models/
│   │   └── index.ts               ← Interfaces TypeScript
│   └── services/
│       ├── auth.service.ts        ← Login, Registro, Logout
│       └── data.service.ts        ← Clases, Jugadores, Sesiones, Análisis
├── features/
│   ├── auth/
│   │   ├── login/                 ← Página de login
│   │   └── register/              ← Página de registro
│   ├── dashboard/                 ← Dashboard principal
│   ├── classes/                   ← Gestión de clases
│   ├── players/                   ← Gestión de jugadores
│   ├── session/                   ← Sesiones en vivo + análisis
│   └── reports/                   ← Reportes de progreso
└── shared/
    └── components/
        └── navbar/                ← Barra de navegación
```

## 🔌 Endpoints del Backend Conectados

| Servicio | Método | Endpoint | Descripción |
|---|---|---|---|
| **AuthService** | POST | `/api/auth/login` | Iniciar sesión |
| | POST | `/api/auth/registro` | Crear cuenta |
| | POST | `/api/auth/logout` | Cerrar sesión |
| | GET | `/api/auth/profile` | Obtener perfil |
| **DataService** | GET | `/api/clases/mis-clases` | Mis clases |
| | POST | `/api/clases` | Crear clase |
| | GET | `/api/clases/:id` | Detalle de clase |
| | GET | `/api/jugadores` | Listar jugadores |
| | POST | `/api/jugadores` | Registrar jugador |
| | GET | `/api/sesiones` | Listar sesiones |
| | POST | `/api/sesiones` | Crear sesión |
| | GET | `/api/sesiones/:id/analisis` | Análisis de sesión |
| | GET | `/api/jugadores/:id/reporte` | Reporte de progreso |

---

## 🧪 Testing

```bash
npm test
```

## 🏭 Build de producción

```bash
npm run build
```

Los archivos compilados quedan en `dist/tesis-front/browser/`.

