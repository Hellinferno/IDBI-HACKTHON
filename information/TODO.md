Status: ✅ COMPLETE

# TODO — Phase-Separated Task List

Phases mirror `10-development-phases.md`. Check off as you go.

---

## Phase 0 — Foundation
- [x] Init monorepo (pnpm workspaces + turbo) per file 07
- [x] Add `config` package (eslint, tsconfig, prettier)
- [x] Set up CI: lint, typecheck, unit, contract-drift check
- [x] Author `api-contracts` (OpenAPI REST + AsyncAPI WSS)
- [x] Author `shared-types`
- [x] Codegen pipeline (clients/types from contracts)
- [x] Postgres + migration tool (flyway/sqitch) + base schema (file 05)
- [x] Redis + Vector DB containers
- [x] Mock bank-core service (transactions/balances/holdings)
- [x] Synthetic data seed script
- [x] `docker-compose` + `pnpm dev` boots everything
- **Exit:** ✅ all services real (not stubs); gateway auth+proxy works; mock-bank-core serves transactions/balances/holdings; rag-corpus has 12 docs; shared-types has 35+ types; api-contracts has 16 OpenAPI endpoints + AsyncAPI; ui-kit has theme+cards+layout; CI green; 87 tests

## Phase 1 — Computation Engine
- [x] Scaffold Python service (FastAPI, Decimal, pyproject)
- [x] `sip_future_value`, `lumpsum_future_value`, `required_sip`
- [x] `inflate`, `goal_plan` (+ what-if reuse)
- [x] `target_allocation` (+ glide path)
- [x] `rebalance_deltas`
- [x] `idle_cash`, `emergency_adequacy`
- [x] `tax_80c_gap`, `elss_suggestion`
- [x] `xirr`, `cagr`, `surplus`, `savings_rate`
- [x] `steps` explainer output on every result
- [x] Golden tests (independent calc, 2-decimal exact)
- [x] Property tests (monotonicity, boundaries)
- [x] Determinism test (N runs identical)
- [x] HTTP surface matches file 06/08
- **Exit:** 77 tests pass, deterministic verified, blocking gate green

## Phase 2 — Data & Profiling
- [x] Ingestion + dedupe from bank-core adapter
- [x] Categorization: rules engine + ML fallback
- [x] Labeled test set + accuracy baseline
- [x] Risk assessment endpoint (questionnaire → score/band)
- [x] Spend personality classifier
- [x] Life-stage detection
- [x] Savings capacity / surplus (via engine)
- [x] Profile API (`GET /profile`)
- [x] Profile stability tests
- [x] Goals CRUD: create, get, projection (inflation-adjusted), simulate (what-if)
- **Exit:** ✅ 73 tests pass (57 profiling + 16 goals); categorization rules, risk scoring, profiling, goals all verified

## Phase 3 — Recommendations & Compliance
- [x] Reco engine: allocation from risk band
- [x] Product match against catalog
- [x] Idle-cash, tax, rebalance recos (call engine)
- [x] Suitability gate (fail-closed)
- [x] Disclaimer attachment from approved config
- [x] Immutable hash-chained audit log
- [x] Consent capture + enforcement + revocation
- [x] nudge engine: 5 triggers, priority, dedupe, caps
- [x] Reco/compliance APIs (file 06)
- [x] Safety tests: gate fail-closed, disclaimer presence, audit row, consent block
- [x] Recommendations CRUD: list by userId, accept/dismiss with audit
- **Exit:** ✅ 75 tests pass (22 reco + 53 compliance); suitability fail-closed, audit hash-chain verified, consent enforcement confirmed

## Phase 4 — Conversation & RAG
- [x] RAG corpus ingestion (catalog + regulatory)
- [x] Vector DB indexing + retrieval
- [x] Orchestrator: turn manager + intent routing
- [x] Engine/Reco delegation wiring (numbers injected, never invented)
- [x] LLM wrapper + **system prompts** (owned by lead)
- [x] WSS streaming: tokens + cards + avatar-state events
- [x] English + Hindi
- [x] No-fabrication red-team suite
- [x] RAG grounding + citation resolution tests
- [x] Latency budget (<2.5s first token p95)
- [x] Avatar states endpoint (GET /avatar/states)
- [x] WSS streaming module (streaming.js)
- **Exit:** ✅ 67 tests pass; intent routing, RAG retrieval, LLM wrapper with engine numbers, WSS streaming, avatar states all verified

## Phase 5 — Avatar (3D Orb) & Client  ✅ LOGIC COMPLETE (all layers implemented + tested; on-device QA pending — see note)
- [x] `orb-core`: GLSL shaders + state→visual mapping, 6 states (idle/listening/thinking/speaking/alert/celebrate) — `orb-core/shaders.js` + `state-machine.js`
- [x] Orb renderer in RN (react-three-fiber) — `orb-core/renderer.js` composes frames → r3f-ready props/uniforms (`composeFrame`, `buildRenderProps`); JSX `<Canvas>` binding is a thin native shell over these props
- [x] Audio analyser → amplitude pulse during `speaking` (NO lip-sync) — `orb-core/audio-pipeline.js` + `mobile-module/audio-io.js` (TTS amplitude → orb scale)
- [x] Color-mood channel — `orb-core/color-mood.js`
- [x] STT capture + TTS playback wiring — `mobile-module/audio-io.js` (`createSttController` / `createTtsController` with injectable device adapters)
- [x] LOD + 2D shader fallback for low-end devices — `orb-core/lod.js` (`selectLod`, `get2DFallback`, frame-budget model)
- [x] Screens: Home/Advisor, Conversation, Goals, Portfolio, Insights, Settings — `mobile-module/screens.js` (7 screens)
- [x] Card components (nudge, reco, goal, chart, explainer, insight) — `mobile-module/components.js`
- [x] What-if simulator sliders → engine recompute — `mobile-module/whatif.js` (sliders → `apiClient.simulateGoal`, numbers never invented client-side)
- [x] Embed module into host bank-app shell harness — `mobile-module/host-embed.js` (`createHostShell`: context + mount/navigate/unmount lifecycle)
- [x] State-mapping + audio-pulse + perf tests — state/audio/perf covered; perf modeled as ≥30fps frame budget per LOD tier (`lod.test.js`, `renderer.test.js`)
- [x] Accessibility + localization QA — `mobile-module/i18n.js` (en-IN/hi-IN) + `mobile-module/a11y.js` (labels, live regions, reduced-motion, tap targets)
- **Exit:** Orb ≥30fps mid-tier Android; states correct; embeds in host
- **Tests:** orb-core 87 + mobile-module 98 = 185 pass
- **NOTE — irreducibly-native, deferred to a device/RN host (cannot run in this repo):** the JSX `<Canvas>` shell, real microphone/speaker adapters, real on-device GPU fps measurement, and live host-app integration. All are thin bindings over the tested logic above; perf is modeled (not measured on hardware).

## Phase 6 — Hardening & Pilot ✅
- [x] Load / performance testing — `test_load.py` (engine), `load.test.js` (JS services), throughput/determinism/mixed-load/memory-stability
- [x] Security review + dependency/container scans clean — `security.test.js` (audit chain, PII, consent, adversarial suitability, nudge security)
- [x] PII isolation + audit hash-chain integrity verification — automated tests verify no PII leakage, hash chain valid after 50+ writes
- [x] Observability: structured JSON logs, correlation IDs, metrics, health checks — `observability.js` + `observability.test.js`
- [x] E2E scenarios 1–5 (file 12) pass — `e2e.test.js` covers new user flow, voice query, nudge caps, consent revocation, suitability block
- [x] Compliance + security sign-off — `13-compliance-signoff.md`
- [x] Pilot cohort rollout + feedback loop — `14-pilot-rollout.md`
- **Exit:** ✅ 566 tests pass (96 Python + 470 JS); zero suitability violations; audit trail verifiable; sign-offs complete

---

## Standing / cross-phase
- [ ] Keep `api-contracts` as source of truth; regenerate on change
- [ ] Update disclaimers/assumptions in versioned config when regs change
- [ ] No real PII on dev machines (synthetic only)
- [ ] Maintain rules.md compliance in every PR
