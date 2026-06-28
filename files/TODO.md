# TODO — Phase-Separated Task List

Phases mirror `10-development-phases.md`. Check off as you go.

---

## Phase 0 — Foundation
- [ ] Init monorepo (pnpm workspaces + turbo) per file 07
- [ ] Add `config` package (eslint, tsconfig, prettier)
- [ ] Set up CI: lint, typecheck, unit, contract-drift check
- [ ] Author `api-contracts` (OpenAPI REST + AsyncAPI WSS)
- [ ] Author `shared-types`
- [ ] Codegen pipeline (clients/types from contracts)
- [ ] Postgres + migration tool (flyway/sqitch) + base schema (file 05)
- [ ] Redis + Vector DB containers
- [ ] Mock bank-core service (transactions/balances/holdings)
- [ ] Synthetic data seed script
- [ ] `docker-compose` + `pnpm dev` boots everything
- **Exit:** all stubs boot, client codegen works, CI green

## Phase 1 — Computation Engine
- [ ] Scaffold Python service (FastAPI, Decimal, pyproject)
- [ ] `sip_future_value`, `lumpsum_future_value`, `required_sip`
- [ ] `inflate`, `goal_plan` (+ what-if reuse)
- [ ] `target_allocation` (+ glide path)
- [ ] `rebalance_deltas`
- [ ] `idle_cash`, `emergency_adequacy`
- [ ] `tax_80c_gap`, `elss_suggestion`
- [ ] `xirr`, `cagr`, `surplus`, `savings_rate`
- [ ] `steps` explainer output on every result
- [ ] Golden tests (independent calc, 2-decimal exact)
- [ ] Property tests (monotonicity, boundaries)
- [ ] Determinism test (N runs identical)
- [ ] HTTP surface matches file 06/08
- **Exit:** 100% golden pass, deterministic, blocking gate green

## Phase 2 — Data & Profiling
- [ ] Ingestion + dedupe from bank-core adapter
- [ ] Categorization: rules engine + ML fallback
- [ ] Labeled test set + accuracy baseline
- [ ] Risk assessment endpoint (questionnaire → score/band)
- [ ] Spend personality classifier
- [ ] Life-stage detection
- [ ] Savings capacity / surplus (via engine)
- [ ] Profile API (`GET /profile`)
- [ ] Profile stability tests
- **Exit:** seeded user → stable profile + risk band; categorization meets baseline

## Phase 3 — Recommendations & Compliance
- [ ] Reco engine: allocation from risk band
- [ ] Product match against catalog
- [ ] Idle-cash, tax, rebalance recos (call engine)
- [ ] Suitability gate (fail-closed)
- [ ] Disclaimer attachment from approved config
- [ ] Immutable hash-chained audit log
- [ ] Consent capture + enforcement + revocation
- [ ] Nudge engine: 5 triggers, priority, dedupe, caps
- [ ] Reco/compliance APIs (file 06)
- [ ] Safety tests: gate fail-closed, disclaimer presence, audit row, consent block
- **Exit:** nothing reaches output without passed+disclaimer+audit; consent blocks advice

## Phase 4 — Conversation & RAG
- [ ] RAG corpus ingestion (catalog + regulatory)
- [ ] Vector DB indexing + retrieval
- [ ] Orchestrator: turn manager + intent routing
- [ ] Engine/Reco delegation wiring (numbers injected, never invented)
- [ ] LLM wrapper + **system prompts** (owned by lead)
- [ ] WSS streaming: tokens + cards + avatar-state events
- [ ] English + Hindi
- [ ] No-fabrication red-team suite
- [ ] RAG grounding + citation resolution tests
- [ ] Latency budget (<2.5s first token p95)
- **Exit:** numeric answers only from engine; no fabricated figures; latency met

## Phase 5 — Avatar (3D Orb) & Client
- [ ] `orb-core`: shaders + state→visual mapping (6 states)
- [ ] Orb renderer in RN (react-three-fiber)
- [ ] Audio analyser → amplitude pulse during `speaking` (NO lip-sync)
- [ ] Color-mood channel
- [ ] STT capture + TTS playback wiring
- [ ] LOD + 2D shader fallback for low-end devices
- [ ] Screens: Home/Advisor, Conversation, Goals, Portfolio, Insights, Settings
- [ ] Card components (nudge, reco, goal, chart, explainer, insight)
- [ ] What-if simulator sliders → engine recompute
- [ ] Embed module into host bank-app shell harness
- [ ] State-mapping + audio-pulse + perf (≥30fps) tests
- [ ] Accessibility + localization QA
- **Exit:** Orb ≥30fps mid-tier Android; states correct; embeds in host

## Phase 6 — Hardening & Pilot
- [ ] Load / performance testing
- [ ] Security review + dependency/container scans clean
- [ ] PII isolation + audit hash-chain integrity verification
- [ ] Observability: logs, traces, metrics, dashboards, alerts
- [ ] E2E scenarios 1–5 (file 12) pass
- [ ] Compliance + security sign-off
- [ ] Pilot cohort rollout + feedback loop
- **Exit:** NFRs met; zero suitability violations in pilot; sign-offs obtained

---

## Standing / cross-phase
- [ ] Keep `api-contracts` as source of truth; regenerate on change
- [ ] Update disclaimers/assumptions in versioned config when regs change
- [ ] No real PII on dev machines (synthetic only)
- [ ] Maintain rules.md compliance in every PR
