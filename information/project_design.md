Status: 📋 PLANNED

# Project Design â€” WealthOrb

> AI-powered Digital Wealth Management application (avatar-based) that embeds into a bank's mobile app and delivers personalized, scalable, data-driven wealth advisory through a 3D animated advisor.

---

## 1. Problem

Wealth advisory is fragmented and inaccessible to most retail customers. Banks hold rich data â€” transactions, balances, income flow, holdings â€” but rarely turn it into timely, personalized guidance. Human advisors do not scale to millions of customers and ignore the long tail (mass-affluent and below).

## 2. Solution

A digital wealth advisor embedded inside the existing bank mobile app:

- Ingests the customer's transactions, balances, and holdings.
- Builds a continuously-updated behavioral and financial profile (spend personality, risk appetite, savings capacity, life stage).
- Surfaces guidance through a **3D avatar** â€” a geometric/orb object, not a human face â€” that speaks via TTS and reacts visually to its own audio and the user's financial state.
- Backs every number with a **deterministic computation engine** (not the LLM), and every product suggestion with a **suitability + compliance layer**.

## 3. Why a 3D object instead of a human face

| Concern | Human face avatar | 3D object (Orb) |
|---|---|---|
| Lip-sync | Required, hard, expensive | **Not needed** â€” orb pulses to audio amplitude |
| Uncanny valley | High risk | None |
| Render cost on mobile | Heavy (rigged mesh, blendshapes) | Light (single mesh + shader) |
| Emotional range | Facial expressions | Color, motion, shape morph, particle density |
| Trust in finance context | Can feel gimmicky | Calm, neutral, "intelligent presence" |
| Localization | Face must suit region | Culture-neutral |

**The Orb expresses state through 4 channels:** color (mood/market), motion (calm â†” agitated), scale/pulse (audio-reactive while speaking), and form/particles (idle, listening, thinking, alerting, celebrating).

## 4. Core capabilities

1. **Behavioral profiling** â€” auto-categorize transactions; derive spend personality, risk score, savings rate, life stage.
2. **Goal planning** â€” retirement, home, education, emergency fund; corpus + gap computed deterministically.
3. **Recommendation** â€” products, SIP amounts, asset allocation, idle-cash sweep, tax optimization (80C/ELSS).
4. **Conversational advisor** â€” RAG-grounded chat/voice, plain-language explanations, vernacular support.
5. **Proactive nudges** â€” idle cash, missed SIP, overspend, goal drift, tax-deadline.
6. **Compliance** â€” suitability checks, mandatory disclaimers, full audit trail of every recommendation.

## 5. Guardrails (non-negotiable)

- LLM **never** produces a financial number. All math comes from the computation engine.
- Every recommendation passes the suitability layer before display.
- No advice without a current risk assessment on file.
- Every shown recommendation is logged immutably with the inputs that produced it.
- Read-only on bank data unless an explicit, consented action is taken.

## 6. Document map

| File | Purpose |
|---|---|
| `01-product-vision.md` | Vision, users, success metrics |
| `02-requirements.md` | Functional + non-functional requirements |
| `03-information-architecture.md` | Screens, navigation, content model |
| `04-system-architecture.md` | Services, data flow, avatar pipeline |
| `05-database-schema.md` | Tables, relations, retention |
| `06-api-contracts.md` | REST + WebSocket contracts |
| `07-monorepo-structure.md` | Repo layout, packages, tooling |
| `08-computation-engine-spec.md` | Deterministic financial math |
| `09-engineering-scope-definition.md` | In/out of scope, ownership |
| `10-development-phases.md` | Phase plan + exit criteria |
| `11-environment-and-devops.md` | Environments, CI/CD, infra |
| `12-testing-strategy.md` | Test pyramid, coverage, compliance tests |
| `architecture_diagram.md` | Mermaid diagrams |
| `rules.md` | Engineering + product rules |
| `TODO.md` | Phase-separated task lists |
