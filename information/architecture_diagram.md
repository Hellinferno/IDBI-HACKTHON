Status: 📋 PLANNED

# Architecture Diagram

## System context

```mermaid
flowchart TB
    User([Bank Customer])
    subgraph Client["Bank Mobile App"]
        Module["WealthOrb Module"]
        Orb["3D Orb Renderer<br/>(no face, audio-reactive)"]
        Audio["Audio I/O<br/>STT capture / TTS playback"]
    end

    Gateway["API Gateway<br/>auth Â· rate-limit Â· audit hook"]

    subgraph Services["Backend Services"]
        Orchestrator["Conversation<br/>Orchestrator"]
        Profile["Profile Service"]
        Reco["Recommendation<br/>Engine"]
        Compute["Computation Engine<br/>(deterministic math)"]
        Compliance["Compliance Service<br/>suitability Â· audit"]
    end

    LLM["LLM + RAG"]

    subgraph Data["Data Layer"]
        PG[("Postgres")]
        Redis[("Redis")]
        Vec[("Vector DB")]
    end

    Core["Bank Core<br/>(read-only)"]

    User --> Module
    Module --> Orb
    Module --> Audio
    Module -->|HTTPS / WSS| Gateway
    Gateway --> Orchestrator & Profile & Reco & Compliance
    Orchestrator --> LLM
    Orchestrator --> Compute
    Reco --> Compute
    Reco --> Compliance
    Orchestrator --> Compliance
    LLM --> Vec
    Services --> PG
    Services --> Redis
    Profile -->|secure feed| Core
```

## Advisory turn (sequence)

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client (Orb)
    participant O as Orchestrator
    participant E as Computation Engine
    participant K as Compliance
    participant L as LLM

    U->>C: speaks question
    C->>C: STT â†’ text (Orb: listening)
    C->>O: user_message
    O->>C: avatar_state=thinking
    O->>O: resolve intent + context + RAG
    alt numeric / recommendation
        O->>E: compute(inputs)
        E-->>O: verified numbers + steps
        O->>K: suitability check
        K-->>O: passed + disclaimer
    end
    O->>L: phrase answer around verified numbers
    L-->>O: natural language (no invented figures)
    O->>C: tokens + cards + avatar_state=speaking
    C->>C: TTS plays â†’ amplitude drives Orb pulse
    O->>K: write audit record
    C-->>U: spoken + visual answer
```

## Avatar state machine

```mermaid
stateDiagram-v2
    [*] --> idle
    idle --> listening: mic active
    listening --> thinking: message sent
    thinking --> speaking: response streaming
    speaking --> idle: done
    idle --> alert: nudge / attention item
    alert --> idle: acknowledged
    speaking --> celebrate: goal met / reco accepted
    celebrate --> idle
```

> Note: every transition is a discrete event from the orchestrator. `speaking` visuals come from client-side TTS audio amplitude â€” **no lip-sync, no visemes**.

## Monorepo dependency direction

```mermaid
flowchart LR
    mobile["mobile-module"] --> contracts["api-contracts"]
    gateway --> contracts
    services["profile / reco / compliance / orchestrator"] --> types["shared-types"]
    orchestrator --> compute["computation-engine (http)"]
    reco --> compute
    reco --> compliance
    mobile --> orbcore["orb-core (shaders)"]
```
