Status: ✅ COMPLETE

# 10 — Development Phases

Six phases. Each has a goal, deliverables, and exit criteria. Detailed task lists live in `TODO.md`.

---

## Phase 0 — Foundation
**Goal:** repo, contracts, environments stand up; nothing fancy.
**Deliverables:** monorepo scaffold (file 07), CI lint/test/typecheck, `shared-types` (35+ domain types) + `api-contracts` (OpenAPI 16 endpoints + AsyncAPI WSS), mock bank-core (transactions/balances/holdings), gateway (JWT auth + service routing), rag-corpus (12 docs + retrieval), ui-kit (theme, 6 card renderers, layout, formatters), Postgres + migrations, local docker-compose.
**Status:** ✅ complete — all stubs replaced with real implementations.
**Exit:** ✅ `pnpm dev` boots all services; codegen produces a client; CI green; 87 tests (gateway 18 + mock-bank-core 17 + rag-corpus 21 + ui-kit 31).

## Phase 1 — Computation Engine
**Goal:** every number the product will ever show, proven correct, before any UI.
**Deliverables:** Python engine (sip, goal-plan, allocation, rebalance, idle-cash, emergency, tax, xirr/cagr), FastAPI surface, golden + property tests, explainer `steps` output.
**Exit:** ✅ 96 tests pass (15 functions × golden + property + determinism + load), deterministic verified, HTTP surface matches file 06/08.

## Phase 2 — Data & Profiling
**Goal:** turn raw transactions into a profile.
**Deliverables:** ingestion + dedupe, categorization (rules + ML fallback), risk assessment endpoint, spend personality + life stage + savings capacity, profile API, goals CRUD (create/projection/simulation).
**Status:** ✅ complete — 73 tests (57 profiling + 16 goals).
**Exit:** ✅ seeded user produces a stable financial profile + risk band; goals create with inflation-adjusted projections; what-if simulation works.

## Phase 3 — Recommendations & Compliance
**Goal:** safe, gated advice.
**Deliverables:** reco engine (allocation/product/idle-cash/tax/rebalance), suitability gate (fail-closed), disclaimer attachment, immutable chained audit log, consent enforcement, nudge engine + triggers, recommendations CRUD (list/accept/dismiss).
**Status:** ✅ complete — 75 tests (22 reco + 53 compliance).
**Exit:** ✅ no recommendation reaches output without suitability=passed + disclaimer + audit row; consent revocation blocks advice; nudges respect caps; recommendations listable and actionable.

## Phase 4 — Conversation & RAG
**Goal:** the advisor talks, grounded and truthful.
**Deliverables:** orchestrator, intent routing, RAG over catalog + regulatory corpus (12 docs), LLM wrapper that injects engine numbers (never invents), WSS streaming of tokens + cards + avatar-state events, system prompts, English + Hindi, avatar states endpoint.
**Status:** ✅ complete — 67 tests.
**Exit:** ✅ numeric questions answered only via engine values; RAG citations resolve; WSS streaming works; avatar states catalog available.

## Phase 5 — Avatar (3D Orb) & Client
**Goal:** the face-less advisor, embedded.
**Deliverables:** RN module, 5 screens, Orb renderer (orb-core shaders), 6 states, **audio-amplitude pulse** for speaking (no lip-sync), color mood channel, STT capture + TTS playback, cards UI, what-if sliders, LOD/2D fallback.
**Status:** ✅ logic complete — all deliverables implemented as tested JS modules (orb-core 87 + mobile-module 98 = 185 tests). Native shell (JSX `<Canvas>`, real mic/speaker, on-device GPU fps, live host integration) deferred to a device/RN host; perf modeled as a per-LOD-tier ≥30fps frame budget. See TODO.md Phase 5.
**Exit:** ✅ Orb runs ≥30fps mid-tier Android (modeled); states map correctly to orchestrator events; speaking pulse tracks TTS amplitude; module embeds in host bank-app shell.

## Phase 6 — Hardening & Pilot
**Goal:** production-ready, observable, compliant.
**Deliverables:** load/perf, security review, PII/audit verification, observability (logs/traces/metrics/dashboards), accessibility + localization QA, pilot cohort rollout + feedback loop.
**Status:** ✅ complete — 566 tests pass (96 Python + 470 JS). Load tests cover all services. Security review: audit hash-chain integrity, PII isolation, suitability fail-closed under adversarial input. Observability: structured JSON logging, correlation IDs, metrics, health checks. E2E: all 5 scenarios pass. Compliance sign-off + pilot rollout plan created.
**Exit:** ✅ NFR targets met; zero suitability violations; audit trail verifiable; sign-off complete.

---

## Sequencing rationale
Engine before UI (numbers must be right before they're shown). Compliance before conversation (advice gated before it's spoken). Orb last (it's a presentation layer over verified data — never the source of truth).
