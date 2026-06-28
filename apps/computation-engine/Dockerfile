# Computation engine — deterministic financial math (FastAPI)
FROM python:3.12-slim

WORKDIR /app

# Install runtime deps directly (fastapi pulls in pydantic; uvicorn is the server).
RUN pip install --no-cache-dir "fastapi>=0.100.0" "uvicorn>=0.23.0"

# App code — engine.app:app resolves because /app is on the path.
COPY engine ./engine

# Railway injects $PORT; default to 8001 locally.
ENV PORT=8001
EXPOSE 8001
CMD ["sh", "-c", "uvicorn engine.app:app --host 0.0.0.0 --port ${PORT:-8001}"]
