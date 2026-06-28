# 04 — System Architecture

## Layered overview

```
┌─────────────────────────────────────────────────────────┐
│  CLIENT (embedded module in bank mobile app)             │
│  • UI shell  • 3D Orb renderer  • Audio I/O (STT/TTS)    │
└───────────────┬─────────────────────────────────────────┘
                │ HTTPS / WSS (mTLS, JWT)
┌───────────────▼─────────────────────────────────────────┐
│  API GATEWAY  (auth, rate-limit, routing, audit hook)    │
└───┬───────────┬───────────┬───────────┬──────────┬───────┘
    │           │           │           │          │
┌───▼───┐ ┌─────▼─────┐ ┌───▼────┐ ┌────▼─────┐ ┌──▼──────┐
│Profile│ │Conversation│ │Reco   │ │Computation│ │Compliance│
│Service│ │Orchestrator│ │Engine │ │ Engine    │ │ Service  │
└───┬───┘ └─────┬─────┘ └───┬────┘ └────┬─────┘ └──┬──────┘
    │           │           │           │          │
    │      ┌────▼────┐      │           │          │
    │      │   LLM   │      │           │          │
    │      │ + RAG   │      │           │          │
    │      └────┬────┘      │           │          │
┌───▼───────────▼───────────▼───────────▼──────────▼───────┐
│  DATA LAYER                                               │
│  Postgres (profiles, goals, portfolio, audit)            │
│  Redis (session, cache)   Vector DB (RAG)                │
│  Object store (docs)                                     │
└───────────────┬──────────────────────────────────────────┘
                │ secure feed
┌───────────────▼──────────────────────────────────────────┐
│  BANK CORE  (accounts, transactions, holdings)  read-only │
└───────────────────────────────────────────────────────────┘
```

## Services

### Profile Service
Owns transaction categorization, behavioral profiling, risk scoring, life-stage detection. Writes `financial_profiles`, `risk_assessments`.

### Conversation Orchestrator
Turn manager. Resolves intent, fetches user context + RAG, calls LLM, **delegates every numeric/recommendation request to the Computation Engine and Reco Engine** (LLM never computes). Streams response tokens + avatar state events over WSS.

### Recommendation Engine
Maps risk score → target allocation. Matches bank catalog products to allocation. Generates idle-cash, tax, rebalance suggestions. All outputs pass through Compliance before reaching client.

### Computation Engine
Pure, deterministic financial math (see `08`). Stateless, cacheable, unit-tested to the rupee. **Single source of truth for all numbers.**

### Compliance Service
Suitability checks, disclaimer attachment, immutable audit logging, consent enforcement.

## Avatar pipeline (no lip-sync)

```
LLM token stream ─► Orchestrator ─► WSS events ─► Client
                                     │
        ┌────────────────────────────┼───────────────────┐
        │ event: state=thinking      │ event: state=speaking
        ▼                            ▼
   Orb renderer reacts          TTS audio plays ─► amplitude analyser
   (particle orbit)                              │
                                                 ▼
                                        Orb scale/pulse driven by
                                        real-time audio amplitude
                                        (NO phoneme/viseme needed)
```

- Avatar **state** is sent as discrete events (`idle|listening|thinking|speaking|alert|celebrate`).
- During `speaking`, the client's audio analyser node drives orb pulse from the TTS waveform amplitude — purely client-side, zero lip-sync modeling.
- Color/mood is a separate channel set by financial-state metadata on the response.

## Data flow: an advisory turn

1. User speaks → STT → text to Orchestrator (Orb → `listening`→`thinking`).
2. Orchestrator builds context (profile + RAG) and classifies intent.
3. If numeric/reco intent → call Computation/Reco Engine → Compliance gate.
4. LLM composes natural-language wrapper around verified numbers (no fabricated figures).
5. Response + avatar state streamed to client; TTS plays (Orb → `speaking`).
6. Compliance writes audit record.

## Cross-cutting

- **Auth:** JWT from bank app session; mTLS service-to-service.
- **Caching:** Redis for session context + computation results (deterministic ⇒ safe).
- **Observability:** structured logs, traces per turn, metrics on latency/acceptance.
- **PII isolation:** tokenized customer IDs internally; raw PII only in Profile/Compliance.
