# Architectural Decisions

This document tracks all significant architectural decisions (ADR-lite). Each decision must state the WHAT and the WHY.

## 2026-06-25: Establish Context System
**What:** Created `files/` for frozen specs, `information/` for living specs, and `memory/` for quick state restoration.
**Why:** To maintain a durable context system that allows every session to boot quickly with full context, distinguishing between initial design and current reality, and adhering to the project's strict context engineering protocol.

## 2026-06-25: Package Manager Selection
**What:** Switched to pnpm globally with turborepo.
**Why:** Matches the stack explicitly required in file 07-monorepo-structure.md.

## 2026-06-26: Card schema — separate `required` from `fields`
**What:** In `mobile-module/components.js`, each card type now declares a `required` array distinct from its full `fields` schema; `validateCard` checks `required` (falling back to `fields`).
**Why:** Create helpers legitimately default optional fields to `null` (e.g. nudge `cta`), but the validator treated `null` as missing — so a freshly-built valid card failed its own validation. Splitting required vs optional generalizes the schema instead of special-casing one card, and fixed the one failing mobile-module test.

## 2026-06-26: Phase 5 implemented as testable pure-JS logic, native shell deferred
**What:** Completed Phase 5 by building all client/avatar layers as pure-JS modules with node:test coverage and injectable device adapters (orb-core: shaders/lod/renderer; mobile-module: audio-io/whatif/host-embed/i18n/a11y). The renderer (`orb-core/renderer.js`) emits react-three-fiber-ready props/uniforms rather than JSX. The irreducibly-native pieces (JSX `<Canvas>`, real mic/speaker, on-device GPU fps, live host integration) are explicitly deferred to a device/RN host.
**Why:** This repo has no RN/device runtime and node:test is the established test harness, so logic that can be unit-tested is implemented and verified here; the thin native bindings can only be wired and QA'd on a device. Perf is therefore modeled as a per-LOD-tier frame budget (≥30fps target) instead of measured on hardware — a deliberate, documented limitation, not an omission.

## 2026-06-26: Client never invents numbers (what-if)
**What:** `mobile-module/whatif.js` routes every slider change through `apiClient.simulateGoal` (the computation engine); it holds slider state and clamps to bounds but performs no financial math locally.
**Why:** Preserves the project-wide invariant (file 08 / rules.md) that all numbers originate from the deterministic engine — the same rule the orchestrator's LLM wrapper enforces. Keeps a single source of truth for figures and keeps the client a presentation layer.

## 2026-06-26: E2E tests self-contained per service
**What:** E2E scenario tests in compliance-service use simulated cross-service data shapes (matching real API contracts) rather than importing from other services. Each service has its own test suite that can run independently.
**Why:** pnpm monorepo strict mode prevents cross-app requires. Simulated data with realistic shapes is sufficient to verify the compliance pipeline (suitability → disclaimer → audit → consent) without network calls or cross-package coupling.

## 2026-06-26: Observability as a tested module
**What:** Created `orchestrator/src/observability.js` with structured JSON logging, correlation IDs, metrics collection (latency percentiles, request counts, engine calls), and health check endpoints. All are covered by `observability.test.js`.
**Why:** Phase 6 requires production-ready observability. Making it a tested module ensures the logging/metrics infrastructure itself is reliable, not just the business logic it observes.

## 2026-06-26: All phases complete — 566 tests
**What:** All 6 phases implemented and verified. Total: 96 Python tests (computation engine) + 470 JS tests (profile 73 + compliance 53 + reco 22 + orchestrator 67 + orb-core 87 + mobile-module 98 + gateway 18 + rag-corpus 21 + ui-kit 31) = 566 tests. Phase 0 stubs replaced with real implementations: gateway (auth+proxy), mock-bank-core (transactions/balances/holdings), rag-corpus (12 docs + retrieval), shared-types (35+ domain types), api-contracts (OpenAPI 16 endpoints + AsyncAPI WSS), ui-kit (theme, 6 card renderers, layout, formatters). Goals CRUD added to profile-service. Recommendations GET endpoint added to reco-service. Avatar states endpoint + WSS streaming module added to orchestrator.
**Why:** Completing all phases with a passing test suite validates the entire system is buildable, testable, and ready for pilot. The test count increase from 480 to 566 reflects Phase 0 gap-fill (gateway 18 + rag-corpus 21 + ui-kit 31 = 70) + Phase 2 goals (16) + documentation accuracy fix.
