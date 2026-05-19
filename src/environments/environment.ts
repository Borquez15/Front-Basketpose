const apiHost =
  typeof location !== 'undefined' &&
  location.hostname !== 'localhost' &&
  location.hostname !== '127.0.0.1'
    ? location.hostname
    : '127.0.0.1';

export const environment = {
  production: false,
  apiUrl: `http://${apiHost}:8000/api`,
  googleClientId: ''
};
