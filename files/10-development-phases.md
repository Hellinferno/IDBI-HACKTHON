# 10 — Development Phases

Six phases. Each has a goal, deliverables, and exit criteria. Detailed task lists live in `TODO.md`.

---

## Phase 0 — Foundation
**Goal:** repo, contracts, environments stand up; nothing fancy.
**Deliverables:** monorepo scaffold (file 07), CI lint/test/typecheck, `shared-types` + `api-contracts` (OpenAPI/AsyncAPI), mock bank-core, Postgres + migrations, local docker-compose.
**Exit:** `pnpm dev` boots all stubs; codegen produces a client; CI green.

## Phase 1 — Computation Engine
**Goal:** every number the product will ever show, proven correct, before any UI.
**Deliverables:** Python engine (sip, goal-plan, allocation, rebalance, idle-cash, emergency, tax, xirr/cagr), FastAPI surface, golden + property tests, explainer `steps` output.
**Exit:** 100% of engine functions pass golden tests to 2 decimals; deterministic verified; HTTP contract matches file 06/08.

## Phase 2 — Data & Profiling
**Goal:** turn raw transactions into a profile.
**Deliverables:** ingestion + dedupe, categorization (rules + ML fallback), risk assessment endpoint, spend personality + life stage + savings capacity, profile API.
**Exit:** seeded user produces a stable financial profile + risk band; categorization accuracy meets baseline on test set.

## Phase 3 — Recommendations & Compliance
**Goal:** safe, gated advice.
**Deliverables:** reco engine (allocation/product/idle-cash/tax/rebalance), suitability gate (fail-closed), disclaimer attachment, immutable chained audit log, consent enforcement, nudge engine + triggers.
**Exit:** no recommendation reaches output without suitability=passed + disclaimer + audit row; consent revocation blocks advice; nudges respect caps.

## Phase 4 — Conversation & RAG
**Goal:** the advisor talks, grounded and truthful.
**Deliverables:** orchestrator, intent routing, RAG over catalog + regulatory corpus, LLM wrapper that injects engine numbers (never invents), WSS streaming of tokens + cards + avatar-state events, system prompts, English + Hindi.
**Exit:** numeric questions answered only via engine values; RAG citations resolve; latency < 2.5s first token p95; red-team shows no fabricated figures.

## Phase 5 — Avatar (3D Orb) & Client
**Goal:** the face-less advisor, embedded.
**Deliverables:** RN module, 5 screens, Orb renderer (orb-core shaders), 6 states, **audio-amplitude pulse** for speaking (no lip-sync), color mood channel, STT capture + TTS playback, cards UI, what-if sliders, LOD/2D fallback.
**Exit:** Orb runs ≥ 30fps mid-tier Android; states map correctly to orchestrator events; speaking pulse tracks TTS amplitude; module embeds in host bank-app shell.

## Phase 6 — Hardening & Pilot
**Goal:** production-ready, observable, compliant.
**Deliverables:** load/perf, security review, PII/audit verification, observability (logs/traces/metrics/dashboards), accessibility + localization QA, pilot cohort rollout + feedback loop.
**Exit:** NFR targets met; zero suitability violations in pilot; audit trail verifiable; sign-off from compliance + security.

---

## Sequencing rationale
Engine before UI (numbers must be right before they're shown). Compliance before conversation (advice gated before it's spoken). Orb last (it's a presentation layer over verified data — never the source of truth).
