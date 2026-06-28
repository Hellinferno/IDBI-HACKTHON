# 07 — Monorepo Structure

Tooling: **pnpm workspaces + Turborepo** (JS/TS). Python computation engine isolated as its own service with its own toolchain.

```
wealthorb/
├── apps/
│   ├── mobile-module/         # embeddable module for bank app (React Native)
│   │   ├── src/
│   │   │   ├── screens/       # Home, Conversation, Goals, Portfolio, Insights
│   │   │   ├── orb/           # 3D Orb renderer (react-three-fiber)
│   │   │   ├── audio/         # STT capture, TTS playback, amplitude analyser
│   │   │   ├── api/           # generated client from openapi
│   │   │   └── state/
│   │   └── package.json
│   │
│   ├── gateway/               # API gateway (Node/Fastify): auth, routing, audit hook
│   ├── orchestrator/          # conversation orchestrator + LLM/RAG (Node/TS)
│   ├── profile-service/       # categorization, profiling, risk (Node/TS)
│   ├── reco-service/          # recommendation engine (Node/TS)
│   ├── compliance-service/    # suitability, disclaimers, audit (Node/TS)
│   └── computation-engine/    # deterministic financial math (PYTHON, FastAPI)
│       ├── engine/            # pure functions: sip, corpus, tax, rebalance
│       ├── tests/             # rupee-exact unit tests
│       └── pyproject.toml
│
├── packages/
│   ├── shared-types/          # TS types shared across apps (source of truth)
│   ├── api-contracts/         # OpenAPI + asyncapi specs (codegen source)
│   ├── ui-kit/                # shared RN components, cards
│   ├── orb-core/              # shaders, state→visual mapping (framework-agnostic)
│   ├── rag-corpus/            # ingestion scripts for catalog + regulatory docs
│   └── config/                # eslint, tsconfig, prettier presets
│
├── infra/
│   ├── docker/                # per-service Dockerfiles
│   ├── k8s/ or terraform/     # deployment manifests
│   └── db/                    # migrations (sqitch/flyway), seed
│
├── docs/                      # this folder (01–12, rules, TODO, diagrams)
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Boundaries / rules
- `shared-types` and `api-contracts` are the **only** cross-app coupling. No app imports another app's internals.
- `computation-engine` is language-isolated (Python) and reached only over HTTP — keeps math testable and swappable.
- `orb-core` holds zero business logic; only visual state mapping.
- Generated API clients are committed, regenerated in CI from `api-contracts`.

## Dependency direction
```
mobile-module ─► api-contracts ◄─ gateway ─► (services)
services ─► shared-types
orchestrator ─► computation-engine (http)
reco-service ─► computation-engine (http) ─► compliance-service
```

## Scripts (root)
- `pnpm dev` — turbo runs all services + mock bank-core.
- `pnpm test` — all JS tests; `make test` inside computation-engine for Python.
- `pnpm gen` — regenerate clients/types from contracts.
- `pnpm lint` / `pnpm typecheck`.
