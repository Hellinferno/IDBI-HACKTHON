# Deploying WealthOrb on Railway

Three services, one Railway project:

| Service | Root directory | Public? | Purpose |
|---|---|---|---|
| `engine` | `apps/computation-engine` | yes | Deterministic math (FastAPI) |
| `orchestrator` | `apps/orchestrator` | yes | Conversation + engine + Gemini |
| `web` | `apps/web-demo` | yes | 3D orb UI — **this is the link judges open** |

Each has a `Dockerfile` + `railway.json` already, so Railway builds them with no guesswork.

---

## 0. Prerequisites
- A [Railway](https://railway.app) account (Hobby plan is fine for a demo).
- A GitHub account (Railway deploys from a repo).
- Your Gemini API key (already in `apps/orchestrator/.env`, which is **gitignored** — it will NOT be pushed).

## 1. Push the code to GitHub
The repo isn't initialized yet. From the project root:

```bash
git init
git add .
git commit -m "WealthOrb demo"
git branch -M main
git remote add origin https://github.com/<you>/wealthorb.git
git push -u origin main
```

Double-check `apps/orchestrator/.env` is **not** in the commit (the root `.gitignore` excludes it):
```bash
git ls-files | grep ".env"   # should show only .env.example files
```

## 2. Create the project + 3 services
1. Railway → **New Project** → **Deploy from GitHub repo** → pick the repo.
2. That creates one service. Open it → **Settings → Root Directory** → set to `apps/computation-engine`. Rename the service to **engine**.
3. **Settings → Networking → Generate Domain** (gives a public `https://engine-xxxx.up.railway.app`).
4. **+ New** → **GitHub Repo** (same repo) → root directory `apps/orchestrator`, name **orchestrator**, Generate Domain.
5. **+ New** → same repo → root directory `apps/web-demo`, name **web**, Generate Domain.

## 3. Set environment variables
**engine** — none required (it just needs `$PORT`, which Railway provides).

**orchestrator** — Variables tab:
```
GEMINI_API_KEY        = <your key>
GEMINI_MODEL          = gemini-2.5-flash
COMPUTATION_ENGINE_URL= https://engine-xxxx.up.railway.app   ← engine's public URL (no trailing slash)
CORS_ORIGIN           = *
```

**web** — Variables tab (this is read at BUILD time):
```
VITE_API_BASE = https://orchestrator-xxxx.up.railway.app     ← orchestrator's public URL (no /api, no trailing slash)
```

## 4. Deploy order
Set the URLs above, then redeploy in this order so each has what it needs:
1. **engine** (deploys on its own)
2. **orchestrator** (needs `COMPUTATION_ENGINE_URL`)
3. **web** — **Redeploy after setting `VITE_API_BASE`** (it's baked into the build; a deploy from before the variable was set won't have it).

## 5. Verify
- `https://engine-xxxx.up.railway.app/health` → `{"status":"ok"}`
- `https://orchestrator-xxxx.up.railway.app/health` → `{"status":"ok","service":"orchestrator"}`
- Open the **web** domain → ask "Can I afford a ₹20 lakh car in 3 years?" → orb animates, engine-verified card appears.

**The web domain is the clickable link you give the judges.**

---

## Notes & gotchas
- **`VITE_API_BASE` is build-time.** If the deployed UI can't reach the backend, confirm the variable is set on the **web** service and **redeploy** it.
- **CORS**: handled by the orchestrator (`CORS_ORIGIN=*`). Tighten to the web domain after the demo if you like.
- **Gemini fallback**: if the key is missing or rate-limited, the orchestrator auto-falls back to deterministic phrasing — the demo still works.
- **Private networking (optional)**: instead of the engine's public URL you can use `COMPUTATION_ENGINE_URL=http://${{engine.RAILWAY_PRIVATE_DOMAIN}}:${{engine.PORT}}` and leave the engine private. Public is simpler for a demo.
- **CLI alternative**: `npm i -g @railway/cli`, `railway login`, then per service `railway up` from each app directory with the service linked. The GitHub flow above is easier for a monorepo.
