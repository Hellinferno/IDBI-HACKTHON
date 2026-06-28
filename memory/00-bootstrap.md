# 00-Bootstrap

**30-second state:**
Status: ALL 6 PHASES COMPLETE. 566 tests pass.
- Phase 0 (Foundation): monorepo, turbo, CI, docker-compose, DB schema, gateway (auth+proxy), mock-bank-core (transactions/balances/holdings), rag-corpus (12 docs + retrieval), shared-types (35+ domain types), api-contracts (OpenAPI 16 endpoints + AsyncAPI), ui-kit (theme, 6 card renderers, layout, formatters).
- Phase 1 (Computation Engine): 15 Python functions, 96 tests, FastAPI surface
- Phase 2 (Data & Profiling): categorization, risk, profiling, goals CRUD (create/projection/simulation), 73 tests
- Phase 3 (Recommendations & Compliance): reco engine, suitability gate, audit, consent, nudge, recommendations CRUD (list/accept/dismiss), 53 tests
- Phase 4 (Conversation & RAG): orchestrator, intent routing, RAG, LLM wrapper, WSS streaming, avatar states endpoint, 67 tests
- Phase 5 (Avatar & Client) LOGIC COMPLETE, 185 tests: `orb-core` (87) + `mobile-module` (98). Native shell deferred.
- Phase 6 (Hardening & Pilot) COMPLETE, 96+ tests: load tests, security review, observability, E2E scenarios, compliance sign-off doc, pilot rollout plan.

**Next steps:**
- When a device/RN host is available: wire the deferred native shells and run on-device QA
- Production: real LLM API, real bank-core integration, k8s deployment, secret manager

## Where detail lives

| Subject | Source of Truth (Frozen) | Living Reference |
|---|---|---|
| Product Vision | files/01-product-vision.md | information/01-product-vision.md |
| Requirements | files/02-requirements.md | information/02-requirements.md |
| System Architecture | files/04-system-architecture.md | information/04-system-architecture.md |
| Monorepo Structure | files/07-monorepo-structure.md | information/07-monorepo-structure.md |
| Computation Engine | files/08-computation-engine-spec.md | information/08-computation-engine-spec.md |
| Development Phases | files/10-development-phases.md | information/10-development-phases.md |
| Master TODO list | files/TODO.md | information/TODO.md |
| Rules & Constraints | files/rules.md | information/rules.md |
