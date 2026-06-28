Status: ✅ BUILT

# 07 â€” Monorepo Structure

Tooling: **pnpm workspaces + Turborepo** (JS/TS). Python computation engine isolated as its own service with its own toolchain.

```
wealthorb/
â”œâ”€â”€ apps/
â”‚   â”œâ”€â”€ mobile-module/         # embeddable module for bank app (React Native)
â”‚   â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”‚   â”œâ”€â”€ screens/       # Home, Conversation, Goals, Portfolio, Insights
â”‚   â”‚   â”‚   â”œâ”€â”€ orb/           # 3D Orb renderer (react-three-fiber)
â”‚   â”‚   â”‚   â”œâ”€â”€ audio/         # STT capture, TTS playback, amplitude analyser
â”‚   â”‚   â”‚   â”œâ”€â”€ api/           # generated client from openapi
â”‚   â”‚   â”‚   â””â”€â”€ state/
â”‚   â”‚   â””â”€â”€ package.json
â”‚   â”‚
â”‚   â”œâ”€â”€ gateway/               # API gateway (Node/Fastify): auth, routing, audit hook
â”‚   â”œâ”€â”€ orchestrator/          # conversation orchestrator + LLM/RAG (Node/TS)
â”‚   â”œâ”€â”€ profile-service/       # categorization, profiling, risk (Node/TS)
â”‚   â”œâ”€â”€ reco-service/          # recommendation engine (Node/TS)
â”‚   â”œâ”€â”€ compliance-service/    # suitability, disclaimers, audit (Node/TS)
â”‚   â””â”€â”€ computation-engine/    # deterministic financial math (PYTHON, FastAPI)
â”‚       â”œâ”€â”€ engine/            # pure functions: sip, corpus, tax, rebalance
â”‚       â”œâ”€â”€ tests/             # rupee-exact unit tests
â”‚       â””â”€â”€ pyproject.toml
â”‚
â”œâ”€â”€ packages/
â”‚   â”œâ”€â”€ shared-types/          # TS types shared across apps (source of truth)
â”‚   â”œâ”€â”€ api-contracts/         # OpenAPI + asyncapi specs (codegen source)
â”‚   â”œâ”€â”€ ui-kit/                # shared RN components, cards
â”‚   â”œâ”€â”€ orb-core/              # shaders, stateâ†’visual mapping (framework-agnostic)
â”‚   â”œâ”€â”€ rag-corpus/            # ingestion scripts for catalog + regulatory docs
â”‚   â””â”€â”€ config/                # eslint, tsconfig, prettier presets
â”‚
â”œâ”€â”€ infra/
â”‚   â”œâ”€â”€ docker/                # per-service Dockerfiles
â”‚   â”œâ”€â”€ k8s/ or terraform/     # deployment manifests
â”‚   â””â”€â”€ db/                    # migrations (sqitch/flyway), seed
â”‚
â”œâ”€â”€ docs/                      # this folder (01â€“12, rules, TODO, diagrams)
â”œâ”€â”€ turbo.json
â”œâ”€â”€ pnpm-workspace.yaml
â””â”€â”€ package.json
```

## Boundaries / rules
- `shared-types` and `api-contracts` are the **only** cross-app coupling. No app imports another app's internals.
- `computation-engine` is language-isolated (Python) and reached only over HTTP â€” keeps math testable and swappable.
- `orb-core` holds zero business logic; only visual state mapping.
- Generated API clients are committed, regenerated in CI from `api-contracts`.

## Dependency direction
```
mobile-module â”€â–º api-contracts â—„â”€ gateway â”€â–º (services)
services â”€â–º shared-types
orchestrator â”€â–º computation-engine (http)
reco-service â”€â–º computation-engine (http) â”€â–º compliance-service
```

## Scripts (root)
- `pnpm dev` â€” turbo runs all services + mock bank-core.
- `pnpm test` â€” all JS tests; `make test` inside computation-engine for Python.
- `pnpm gen` â€” regenerate clients/types from contracts.
- `pnpm lint` / `pnpm typecheck`.
