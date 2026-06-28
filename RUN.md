# Running the WealthOrb demo locally

Three processes power the demo. No Docker needed for the core flow (everything is in-memory).

## One command (Windows)

```powershell
powershell -ExecutionPolicy Bypass -File scripts\dev.ps1
```

Opens three windows: engine (:8001), orchestrator (:8005), web demo (:5173).
Then open the web demo URL printed in the Vite window.

## Manual (one terminal each)

```bash
# 1. Computation engine (Python) — the source of truth for every number
cd apps/computation-engine
python -m uvicorn engine.app:app --port 8001

# 2. Orchestrator (Node) — conversation + engine delegation + LLM phrasing
cd apps/orchestrator
node --env-file=.env src/index.js   # or: node src/index.js  (if no .env yet)

# 3. Web demo (Vite + React) — the 3D orb advisor UI
cd apps/web-demo
npm run dev
```

## LLM (Gemini)

The orchestrator phrases answers with Google Gemini when `GEMINI_API_KEY` is set,
and falls back to deterministic templates otherwise (so the demo never breaks).

1. `cp apps/orchestrator/.env.example apps/orchestrator/.env`
2. Put your key in `GEMINI_API_KEY=...`
3. Boot the orchestrator with `node --env-file=.env src/index.js`

Numbers always come from the computation engine — Gemini only phrases the verified figures.

## Health checks

- Engine: <http://localhost:8001/health>
- Orchestrator: <http://localhost:8005/health>
- Web demo: <http://localhost:5173> (or 5174 if 5173 is busy)
