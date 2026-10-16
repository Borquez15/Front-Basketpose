# Frontend BasketPose (Angular 20) para Railway
# 1) Compilar
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npx ng build --configuration production

# 2) Servir con Caddy (rutas de Angular redirigidas a index.html)
FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist/tesis-front/browser /srv
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["/docker-entrypoint.sh"]
