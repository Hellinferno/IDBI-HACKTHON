Status: 📋 PLANNED

# 04 â€” System Architecture

## Layered overview

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  CLIENT (embedded module in bank mobile app)             â”‚
â”‚  â€¢ UI shell  â€¢ 3D Orb renderer  â€¢ Audio I/O (STT/TTS)    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                â”‚ HTTPS / WSS (mTLS, JWT)
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  API GATEWAY  (auth, rate-limit, routing, audit hook)    â”‚
â””â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜
    â”‚           â”‚           â”‚           â”‚          â”‚
â”Œâ”€â”€â”€â–¼â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â–¼â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â” â”Œâ”€â”€â–¼â”€â”€â”€â”€â”€â”€â”
â”‚Profileâ”‚ â”‚Conversationâ”‚ â”‚Reco   â”‚ â”‚Computationâ”‚ â”‚Complianceâ”‚
â”‚Serviceâ”‚ â”‚Orchestratorâ”‚ â”‚Engine â”‚ â”‚ Engine    â”‚ â”‚ Service  â”‚
â””â”€â”€â”€â”¬â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”¬â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”˜
    â”‚           â”‚           â”‚           â”‚          â”‚
    â”‚      â”Œâ”€â”€â”€â”€â–¼â”€â”€â”€â”€â”      â”‚           â”‚          â”‚
    â”‚      â”‚   LLM   â”‚      â”‚           â”‚          â”‚
    â”‚      â”‚ + RAG   â”‚      â”‚           â”‚          â”‚
    â”‚      â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”˜      â”‚           â”‚          â”‚
â”Œâ”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”
â”‚  DATA LAYER                                               â”‚
â”‚  Postgres (profiles, goals, portfolio, audit)            â”‚
â”‚  Redis (session, cache)   Vector DB (RAG)                â”‚
â”‚  Object store (docs)                                     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                â”‚ secure feed
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  BANK CORE  (accounts, transactions, holdings)  read-only â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

## Services

### Profile Service
Owns transaction categorization, behavioral profiling, risk scoring, life-stage detection. Writes `financial_profiles`, `risk_assessments`.

### Conversation Orchestrator
Turn manager. Resolves intent, fetches user context + RAG, calls LLM, **delegates every numeric/recommendation request to the Computation Engine and Reco Engine** (LLM never computes). Streams response tokens + avatar state events over WSS.

### Recommendation Engine
Maps risk score â†’ target allocation. Matches bank catalog products to allocation. Generates idle-cash, tax, rebalance suggestions. All outputs pass through Compliance before reaching client.

### Computation Engine
Pure, deterministic financial math (see `08`). Stateless, cacheable, unit-tested to the rupee. **Single source of truth for all numbers.**

### Compliance Service
Suitability checks, disclaimer attachment, immutable audit logging, consent enforcement.

## Avatar pipeline (no lip-sync)

```
LLM token stream â”€â–º Orchestrator â”€â–º WSS events â”€â–º Client
                                     â”‚
        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
        â”‚ event: state=thinking      â”‚ event: state=speaking
        â–¼                            â–¼
   Orb renderer reacts          TTS audio plays â”€â–º amplitude analyser
   (particle orbit)                              â”‚
                                                 â–¼
                                        Orb scale/pulse driven by
                                        real-time audio amplitude
                                        (NO phoneme/viseme needed)
```

- Avatar **state** is sent as discrete events (`idle|listening|thinking|speaking|alert|celebrate`).
- During `speaking`, the client's audio analyser node drives orb pulse from the TTS waveform amplitude â€” purely client-side, zero lip-sync modeling.
- Color/mood is a separate channel set by financial-state metadata on the response.

## Data flow: an advisory turn

1. User speaks â†’ STT â†’ text to Orchestrator (Orb â†’ `listening`â†’`thinking`).
2. Orchestrator builds context (profile + RAG) and classifies intent.
3. If numeric/reco intent â†’ call Computation/Reco Engine â†’ Compliance gate.
4. LLM composes natural-language wrapper around verified numbers (no fabricated figures).
5. Response + avatar state streamed to client; TTS plays (Orb â†’ `speaking`).
6. Compliance writes audit record.

## Cross-cutting

- **Auth:** JWT from bank app session; mTLS service-to-service.
- **Caching:** Redis for session context + computation results (deterministic â‡’ safe).
- **Observability:** structured logs, traces per turn, metrics on latency/acceptance.
- **PII isolation:** tokenized customer IDs internally; raw PII only in Profile/Compliance.
