# Orchestrator — conversation + engine delegation + Gemini phrasing (Fastify)
FROM node:20-alpine

WORKDIR /app

# Install prod deps only. Fall back to npm install if the lockfile is out of sync.
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm install --omit=dev

COPY src ./src

# Railway injects $PORT (index.js reads process.env.PORT) and the env vars
# GEMINI_API_KEY / GEMINI_MODEL / COMPUTATION_ENGINE_URL / CORS_ORIGIN.
ENV PORT=8005
EXPOSE 8005
CMD ["node", "src/index.js"]
