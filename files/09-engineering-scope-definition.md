# 09 — Engineering Scope Definition

## In scope (v1)

| Area | Included |
|---|---|
| Client | Embeddable RN module, 5 screens, 3D Orb, audio I/O |
| Avatar | 3D object (orb), 6 states, audio-amplitude pulse, color mood. **No face, no lip-sync.** |
| Ingestion | Transaction pull (mock + bank-core adapter), categorization |
| Profiling | Risk score, spend personality, life stage, savings capacity |
| Goals | Create/edit, projection, what-if simulator |
| Reco | Allocation, product match, idle-cash, tax, rebalance |
| Computation | Full deterministic engine (file 08) |
| Conversation | Text + voice, RAG-grounded, streaming, explainers |
| Nudges | 5 trigger types, prioritization, caps |
| Compliance | Suitability gate, disclaimers, immutable audit, consent |
| Languages | English + Hindi |

## Out of scope (v1)

- Auto-execution of trades/purchases (consented manual action only).
- HNI/private-banking advisory tier.
- Tax filing / document generation.
- Credit / lending / insurance underwriting advice.
- Cross-bank account aggregation.
- Web/desktop client (mobile module only).
- Additional regional languages beyond Hindi (post-v1 backlog).

## Avatar scope detail (explicit, per request)
- Avatar is a **3D geometric object** rendered with a single mesh + shader.
- Expression channels: **color, motion, scale/pulse, particle density** — nothing facial.
- Speaking animation is driven by **client-side audio amplitude analysis** of the TTS stream. No phoneme detection, no viseme rig, no lip-sync pipeline anywhere in the system.
- This removes an entire engineering workstream (rigging, blendshapes, viseme timing).

## Ownership

| Component | Owner |
|---|---|
| Computation engine + tests | Backend / quant |
| Orchestrator + LLM + RAG + **system prompts** | (retained by lead — not delegated) |
| Profile/Reco/Compliance services | Backend |
| Mobile module + Orb renderer | Client |
| RAG corpus curation (catalog + regulatory) | Backend + compliance |
| Infra / CI-CD | Platform |

## Assumptions
- Bank exposes a read API or feed for transactions/balances/holdings.
- A regulatory disclaimer set is provided/approved by compliance.
- Product catalog is available as structured data.
- LLM + TTS + STT are external managed services behind an internal abstraction (swappable).

## Risks
| Risk | Mitigation |
|---|---|
| LLM fabricates a number | Hard rule: numbers only from engine; orchestrator injects |
| Suitability bug shows bad advice | Compliance gate is mandatory, fail-closed; audited |
| Mobile 3D perf on low-end | Orb LOD + fps cap fallback to 2D animated shader |
| Bank-core API latency | Cache + incremental sync; degrade gracefully |
| Regulatory change | Disclaimers + rules externalized in config/RAG |
