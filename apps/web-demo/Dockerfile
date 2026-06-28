# Web demo — 3D orb advisor UI (Vite + React), served as static files.

# ── Build stage ──
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
# VITE_API_BASE is inlined at BUILD time. Set it (in Railway service variables) to
# the orchestrator's public URL, e.g. https://orchestrator-production.up.railway.app
ARG VITE_API_BASE
ENV VITE_API_BASE=$VITE_API_BASE
RUN npm run build

# ── Serve stage ──
FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist
ENV PORT=8080
EXPOSE 8080
CMD ["sh", "-c", "serve -s dist -l ${PORT:-8080}"]
