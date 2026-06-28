# Deploying WealthOrb (Vercel + Render)

- **Frontend (the clickable judge link)** → **Vercel** — fast, never sleeps.
- **Engine + Orchestrator (backends)** → **Render** free tier — Docker, from your repo.

Repo: <https://github.com/Hellinferno/IDBI-HACKTHON>. Your Gemini key is in
`apps/orchestrator/.env`, which is gitignored — it is NOT on GitHub. You'll paste it into
the Render dashboard instead.

---

## Part 1 — Backends on Render

### Option A (fastest): Blueprint
1. [Render](https://render.com) → **New → Blueprint** → connect the repo → it reads
   `render.yaml` and creates **wealthorb-engine** and **wealthorb-orchestrator**.
2. Deploy the **engine** first. Copy its URL, e.g. `https://wealthorb-engine.onrender.com`.
3. On **wealthorb-orchestrator** → Environment, set:
   - `GEMINI_API_KEY` = your key
   - `COMPUTATION_ENGINE_URL` = the engine URL from step 2 (no trailing slash)
   - (`GEMINI_MODEL` and `CORS_ORIGIN` are already set by the blueprint)
4. **Manual Deploy → Deploy latest commit** on the orchestrator so it picks up the URL.

### Option B (manual, if the blueprint hiccups)
Create two services by hand: **New → Web Service** → connect repo → for each set:
| Field | engine | orchestrator |
|---|---|---|
| Root Directory | `apps/computation-engine` | `apps/orchestrator` |
| Runtime | Docker (auto-detected) | Docker (auto-detected) |
| Instance Type | Free | Free |
| Health Check Path | `/health` | `/health` |

Then on the orchestrator add env vars: `GEMINI_API_KEY`, `GEMINI_MODEL=gemini-2.5-flash`,
`COMPUTATION_ENGINE_URL=<engine url>`, `CORS_ORIGIN=*`.

### Verify backends
- `https://wealthorb-engine.onrender.com/health` → `{"status":"ok"}`
- `https://wealthorb-orchestrator.onrender.com/health` → `{"status":"ok","service":"orchestrator"}`

---

## Part 2 — Frontend on Vercel
1. [Vercel](https://vercel.com) → **Add New → Project** → import the repo.
2. **Root Directory → `apps/web-demo`** (click Edit, pick the folder). Framework auto-detects
   as **Vite** (the included `vercel.json` forces an `npm` build).
3. **Environment Variables** → add:
   - `VITE_API_BASE` = your orchestrator URL, e.g. `https://wealthorb-orchestrator.onrender.com`
     (no `/api`, no trailing slash)
4. **Deploy.** Your Vercel URL (e.g. `https://idbi-hackthon.vercel.app`) is the **link you
   give the judges**.

> `VITE_API_BASE` is baked in at build time. If you change it later, **redeploy** on Vercel.

---

## Order of operations
1. Render: deploy **engine** → get its URL.
2. Render: set the orchestrator's `COMPUTATION_ENGINE_URL` + `GEMINI_API_KEY` → deploy it → get its URL.
3. Vercel: set `VITE_API_BASE` to the orchestrator URL → deploy.
4. Open the Vercel link → ask "Can I afford a ₹20 lakh car in 3 years?".

## Demo-day gotcha: cold starts
Render free services **sleep after ~15 min idle** (~50s first wake). Before you present,
open the two `/health` URLs once to warm them. The orchestrator also falls back to
deterministic phrasing if Gemini is slow, so the demo still works either way.

## CORS
Handled by the orchestrator (`CORS_ORIGIN=*`). After the demo you can tighten it to your
Vercel domain.
