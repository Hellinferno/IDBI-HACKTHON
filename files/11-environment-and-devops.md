# 11 — Environment & DevOps

## Environments

| Env | Purpose | Data |
|---|---|---|
| local | dev on laptop | mock bank-core, seeded synthetic data |
| ci | automated tests | ephemeral, throwaway |
| staging | integration + UAT | masked/synthetic, real shapes |
| pilot | limited live cohort | real, full controls |
| prod | full | real |

## Local dev
- `docker-compose`: postgres, redis, vector-db, mock-bank-core, all services.
- `pnpm dev` (turbo) for JS services; `make dev` for computation-engine.
- Synthetic data seed script (no real PII ever on a laptop).

## CI/CD pipeline
```
push ─► lint ─► typecheck ─► unit tests (JS + Python) ─► contract codegen check
     ─► build images ─► integration tests (compose) ─► security scan
     ─► [main] deploy staging ─► smoke ─► manual gate ─► pilot/prod
```
- Contract drift check: regenerate clients from `api-contracts`; fail if committed output differs.
- Computation-engine golden tests are a **blocking** gate.

## Deployment
- Containerized services; orchestrated via k8s (or managed equivalent).
- Computation-engine deployed as its own service (Python), horizontally scalable, stateless.
- Blue/green or rolling; DB migrations gated and reversible (flyway/sqitch).
- Config via env + secret manager; no secrets in repo.

## Secrets & config
- Secret manager for DB creds, LLM/TTS/STT keys, bank-core credentials.
- Feature flags for phased rollout (e.g. enable Hindi, enable voice, enable a reco type).
- Regulatory disclaimers + assumption rates in versioned config (not code).

## Observability
- Structured JSON logs, correlation id per advisory turn.
- Distributed tracing across gateway → orchestrator → engine → compliance.
- Metrics: first-token latency, engine latency, reco acceptance, suitability blocks, fps reports from client, error rates.
- Dashboards + alerts on NFR breaches and any suitability-gate failure.

## Security baseline
- mTLS service-to-service; JWT from bank session at edge.
- AES-256 at rest, TLS 1.2+ in transit.
- Tokenized customer refs internally; raw PII isolated to Profile/Compliance.
- Audit log append-only with chained hashes.
- Regular dependency + container scanning in CI.
- Least-privilege IAM; PII access role-based and logged.

## Data & backups
- Postgres PITR backups; tested restore.
- Audit logs replicated, immutable storage class.
- Retention jobs honor consent + regulatory minimums.

## Cost / scaling notes
- Cache deterministic engine results in Redis (safe — same inputs, same output).
- LLM/TTS/STT behind a provider-abstraction; swappable to manage cost.
- Orb is client-rendered; no server GPU cost.
