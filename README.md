# IDBI-HACKTHON — WealthOrb

An AI wealth advisor embedded in a bank's app: a 3D voice **orb** that gives financial
guidance where **every number comes from a deterministic computation engine** — the AI
phrases answers, it never invents figures.

## Why it's safe for a bank
- Numbers and dates come only from the engine (96 deterministic tests, exact to 2 decimals).
- Recommendations pass a suitability gate; every shown rec is auditable.
- If the LLM is unavailable, the system falls back to deterministic phrasing.

## Stack
- **apps/computation-engine** — Python/FastAPI deterministic math (single source of truth)
- **apps/orchestrator** — Node/Fastify: intent routing, engine delegation, Gemini phrasing
- **apps/web-demo** — Vite + React + react-three-fiber: the 3D orb advisor UI

## Run locally
See [RUN.md](RUN.md). TL;DR: `powershell -ExecutionPolicy Bypass -File scripts\dev.ps1`

## Deploy
See [DEPLOY.md](DEPLOY.md) (Railway, three services).

## Demo script
See [DEMO.md](DEMO.md) — the 3-minute run-of-show.
