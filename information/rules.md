Status: 📋 PLANNED

# rules.md â€” Engineering & Product Rules

Hard rules. Violations block merge / release.

## Money & numbers
1. **The LLM never produces a financial number.** Every figure shown comes from the Computation Engine. The orchestrator injects verified values; the model only phrases them.
2. Money is `Decimal` end-to-end. **No floats for money, ever.** API transports money as string decimals.
3. Engine functions are pure and deterministic. Same inputs â†’ identical output. Time enters only via an explicit `asOf` parameter.
4. Every number shown must be explainable â€” the engine returns `steps`; the UI exposes a "why".

## Advice & compliance
5. **No advice without a current, valid risk assessment** on file.
6. **Suitability gate is mandatory and fail-closed.** If the check errors or is unavailable, the recommendation is blocked, not shown.
7. Every recommendation card carries an approved disclaimer, always visible (never behind a tap).
8. Every shown recommendation writes an immutable, hash-chained audit row containing the inputs that produced it.
9. No advice when consent is absent or revoked. Revocation takes effect immediately, end-to-end.
10. Read-only on bank data. Any action requires explicit, logged user consent.

## Avatar
11. The avatar is a **3D object, not a face.** No facial features, no lip-sync, no visemes â€” anywhere in the system.
12. Speaking animation is driven only by client-side TTS audio amplitude.
13. Avatar visuals never block or obscure content or disclaimers.
14. Avatar state changes only via discrete orchestrator events.

## Architecture
15. Cross-app coupling only through `shared-types` and `api-contracts`. No app imports another app's internals.
16. The Computation Engine has no DB, no network, no LLM access inside math.
17. `orb-core` holds zero business logic.
18. Generated API clients are committed and regenerated in CI; drift fails the build.

## Data & security
19. No real PII on developer machines. Local/dev use synthetic data only.
20. Raw PII lives only in Profile and Compliance services; everything else uses tokenized customer refs.
21. Secrets via secret manager only. Nothing secret in the repo.
22. AES-256 at rest, TLS 1.2+ in transit, mTLS service-to-service.
23. Audit logs are append-only and never deleted.

## Process
24. Engine golden tests and compliance-path coverage are blocking CI gates.
25. No high/critical vulnerability merges.
26. System prompts are owned by the lead and are not delegated.
27. Regulatory assumptions (inflation, return rates) and disclaimers live in versioned config, not code.
28. Phases are sequential where dependency demands: engine before UI, compliance before conversation, orb last.

## Conversation
29. If information is outside the RAG corpus or user data, the advisor says so â€” it does not guess.
30. Vernacular responses must preserve identical numeric and compliance content as English.
