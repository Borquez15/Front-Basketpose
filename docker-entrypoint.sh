#!/bin/sh
# Escribe la URL del backend a partir de la variable API_URL de Railway
set -e
printf "window.__BASKETPOSE_API__ = '%s';\n" "${API_URL:-}" > /srv/config.js
exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
