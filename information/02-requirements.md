Status: 📋 PLANNED

# 02 â€” Requirements

## Functional requirements

### FR-1 Data ingestion
- FR-1.1 Pull transactions, balances, holdings from bank core via secured API / data feed.
- FR-1.2 Categorize each transaction (rules + ML fallback).
- FR-1.3 Derive monthly cashflow, surplus, recurring outflows.
- FR-1.4 Re-sync incrementally on schedule + on app open.

### FR-2 Profiling
- FR-2.1 Compute risk score from questionnaire + behavioral signals.
- FR-2.2 Classify spend personality (e.g. Saver / Balanced / Spender / Drifter).
- FR-2.3 Detect life stage (student, early career, family, pre-retirement, retired).
- FR-2.4 Maintain savings capacity estimate.

### FR-3 Goals
- FR-3.1 Create/edit goals (target amount, horizon, priority).
- FR-3.2 Compute required corpus with inflation; compute monthly contribution gap.
- FR-3.3 What-if simulation (change horizon/amount/contribution â†’ live recompute).

### FR-4 Recommendations
- FR-4.1 Suggest asset allocation from risk score.
- FR-4.2 Suggest products from bank catalog matching allocation + suitability.
- FR-4.3 Idle-cash detection + sweep suggestion.
- FR-4.4 Tax optimization (80C/ELSS gap, deadline-aware).
- FR-4.5 Portfolio rebalance deltas when drift exceeds threshold.

### FR-5 Conversational advisor
- FR-5.1 Accept typed and voice input (STT).
- FR-5.2 Respond via TTS + text, grounded in user data + RAG catalog/regulatory.
- FR-5.3 Explain any number on demand ("why this amount?").
- FR-5.4 Vernacular language support (English + Hindi at minimum).

### FR-6 Avatar (3D Orb)
- FR-6.1 Render a 3D object (no face), audio-reactive while speaking.
- FR-6.2 Map advisor states â†’ visual states (idle, listening, thinking, speaking, alert, celebrate).
- FR-6.3 Color encodes financial mood; never blocks content.

### FR-7 Nudges
- FR-7.1 Generate proactive nudges from engine triggers.
- FR-7.2 Prioritize, dedupe, respect frequency caps.

### FR-8 Compliance
- FR-8.1 Suitability check gates every recommendation.
- FR-8.2 Mandatory disclaimers attached to advice.
- FR-8.3 Immutable audit log of recommendation + inputs.
- FR-8.4 Consent capture + revocation.

## Non-functional requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-1 | First-token latency (advisory) | < 2.5s p95 |
| NFR-2 | Computation engine response | < 150ms p95 |
| NFR-3 | Avatar render | â‰¥ 30 fps mid-tier Android |
| NFR-4 | Availability | 99.9% |
| NFR-5 | Data at rest | encrypted (AES-256) |
| NFR-6 | Data in transit | TLS 1.2+ |
| NFR-7 | PII access | role-based, audited |
| NFR-8 | Audit retention | per regulator (â‰¥ 7 yrs) |
| NFR-9 | Determinism | identical inputs â†’ identical engine output |
| NFR-10 | Localization | string-externalized, RTL-ready |

## Constraints

- Must embed inside existing bank mobile app (SDK/module, not separate app).
- Must operate read-only on bank data except consented actions.
- Must comply with local regulator (e.g. SEBI/RBI investment-advisory norms).
- LLM output must never be the source of a financial figure.
