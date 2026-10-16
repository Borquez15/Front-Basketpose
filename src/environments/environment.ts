// URL del backend:
// - En Railway/producción: public/config.js define window.__BASKETPOSE_API__ con la
//   variable API_URL del servicio (por ejemplo https://basketpose-back.up.railway.app).
// - En local: el mismo equipo (o la IP de la red) en el puerto 8000.
const runtimeApi =
  typeof window !== 'undefined' ? ((window as any).__BASKETPOSE_API__ as string | undefined) : undefined;

const apiHost =
  typeof location !== 'undefined' &&
  location.hostname !== 'localhost' &&
  location.hostname !== '127.0.0.1'
    ? location.hostname
    : '127.0.0.1';

const base = runtimeApi ? runtimeApi.replace(/\/+$/, '') : `http://${apiHost}:8000`;

export const environment = {
  production: false,
  apiUrl: base.endsWith('/api') ? base : `${base}/api`,
  googleClientId: ''
};
