# Boots the WealthOrb demo stack in three separate PowerShell windows.
# Usage:  powershell -ExecutionPolicy Bypass -File scripts\dev.ps1
$root = Split-Path -Parent $PSScriptRoot

Write-Host "Starting WealthOrb demo stack..." -ForegroundColor Cyan

# 1) Computation engine (Python / FastAPI) on :8001
Start-Process powershell -ArgumentList "-NoExit", "-Command",
  "cd '$root\apps\computation-engine'; python -m uvicorn engine.app:app --port 8001"

# 2) Orchestrator (Node / Fastify) on :8005 — loads .env if present (for GEMINI_API_KEY)
Start-Process powershell -ArgumentList "-NoExit", "-Command",
  "cd '$root\apps\orchestrator'; if (Test-Path .env) { node --env-file=.env src/index.js } else { node src/index.js }"

# 3) Web demo (Vite + React) on :5173 (or next free port)
Start-Process powershell -ArgumentList "-NoExit", "-Command",
  "cd '$root\apps\web-demo'; npm run dev"

Write-Host "Engine -> http://localhost:8001/health" -ForegroundColor Green
Write-Host "Orchestrator -> http://localhost:8005/health" -ForegroundColor Green
Write-Host "Web demo -> http://localhost:5173  (check the Vite window for the exact port)" -ForegroundColor Green
