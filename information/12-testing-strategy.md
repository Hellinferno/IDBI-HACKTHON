Status: 📋 PLANNED

# 12 â€” Testing Strategy

## Test pyramid

```
        â–²  E2E (few): full advisory turn, embed-in-host, pilot smoke
       â”€â”€â”€
      â–²â–²â–²  Integration: serviceâ†”service, engine HTTP, WSS streaming, RAG
     â”€â”€â”€â”€â”€â”€â”€
    â–²â–²â–²â–²â–²â–²â–²  Unit (many): computation engine, categorization, reco rules,
   â”€â”€â”€â”€â”€â”€â”€â”€â”€  orb state mapping, compliance gate
```

## By layer

### Computation engine (highest rigor)
- **Golden tests** against an independent calculator/spreadsheet, exact to 2 decimals.
- **Property tests**: monotonicity (â†‘contribution â‡’ â‰¥corpus), boundaries (0 return, 0 months, 0 corpus), symmetry where applicable.
- **Determinism test**: run N times â†’ identical bytes; no wall-clock dependence (time only via `asOf`).
- Blocking CI gate.

### Profiling
- Categorization accuracy on a labeled test set (precision/recall baseline).
- Risk scoring: snapshot tests on questionnaire â†’ band.
- Profile stability: same inputs â†’ same profile.

### Recommendation + Compliance (safety-critical)
- **Suitability gate fail-closed test**: malformed/over-risk reco â†’ blocked, never shown.
- Disclaimer presence test: every reco card carries an approved disclaimer.
- Audit test: every shown reco writes an immutable, hash-chained audit row with its inputs.
- Consent test: revoked consent blocks advice end-to-end.
- Nudge caps + dedupe tests.

### Conversation + RAG
- **No-fabrication red-team**: numeric prompts must resolve to engine values; assert LLM never emits an unverified figure. Adversarial prompt suite.
- RAG grounding: citations resolve to corpus; out-of-corpus â†’ "I don't have that" not a guess.
- Streaming: token/card/avatar-state event ordering correct over WSS.
- Latency budget tests (first token < 2.5s p95).
- Multilingual: parity checks English â†” Hindi.

### Avatar (3D Orb)
- State-mapping unit tests: orchestrator event â†’ correct orb state.
- **Audio-pulse test**: speaking pulse tracks TTS amplitude envelope (no lip-sync logic to test â€” by design).
- Performance: â‰¥30fps on mid-tier Android reference device; 2D fallback triggers below threshold.
- Color-mood mapping snapshot.

### Client / module
- Screen component tests, card rendering, what-if slider recompute calls.
- Embed test: module mounts in a host bank-app shell harness.
- Accessibility: labels, contrast, screen-reader for cards and disclaimers.

## E2E scenarios (must pass before pilot)
1. New user â†’ risk assessment â†’ goal create â†’ projection â†’ reco â†’ accept â†’ audit row exists.
2. Voice: ask "can I afford X" â†’ STT â†’ engine â†’ grounded spoken answer â†’ orb speaking pulse.
3. Idle cash nudge â†’ user dismisses â†’ cap respected next cycle.
4. Consent revoked mid-session â†’ advice stops, data read blocked.
5. Over-risk product â†’ suitability blocks â†’ user never sees it.

## Coverage & gates
- Engine: 100% function golden coverage (blocking).
- Compliance paths: 100% branch coverage (blocking).
- Overall services: â‰¥ 80% line coverage.
- Security scan + dependency audit: no high/critical to merge.

## Compliance-specific verification
- Periodic audit-log integrity check (hash chain unbroken).
- Disclaimer set matches the compliance-approved version in config.
- PII access logs reviewed; no raw PII outside Profile/Compliance services.
