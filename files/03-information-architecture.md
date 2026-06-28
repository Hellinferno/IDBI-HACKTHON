# 03 — Information Architecture

## Entry point

Embedded as a module in the bank app. Launched from a "Wealth Advisor" tile or floating Orb on the home screen.

## Screen map

```
Wealth Advisor (root)
├── Home / Advisor
│   ├── Orb (always present)
│   ├── Health summary line
│   ├── Top nudge cards (max 3)
│   └── Ask bar (text + mic)
├── Conversation
│   ├── Message thread (user ↔ Orb)
│   ├── Inline cards (recommendation, chart, goal)
│   └── "Why?" expanders
├── Goals
│   ├── Goal list
│   ├── Goal detail (corpus, gap, progress)
│   └── What-if simulator (sliders)
├── Portfolio
│   ├── Holdings + allocation donut
│   ├── Drift / rebalance suggestion
│   └── Performance (XIRR)
├── Insights / Spending
│   ├── Categorized spend
│   ├── Spend personality card
│   └── Cashflow + idle cash
├── Recommendations
│   ├── Active suggestions
│   └── History (accepted/dismissed)
└── Settings
    ├── Consent & data
    ├── Language
    ├── Risk profile (retake)
    └── Notifications
```

## Navigation model

- Orb is the persistent anchor; tapping it always returns to Home/Advisor.
- Conversation is reachable from any screen via the Ask bar.
- Cards are the primary content unit; they appear in conversation and on Home.

## Content model (card types)

| Card | Contents | Source |
|---|---|---|
| `nudge` | title, body, CTA, urgency | nudge engine |
| `recommendation` | product, rationale, suitability badge, disclaimer | reco + compliance |
| `goal` | name, target, corpus, gap, progress | computation engine |
| `chart` | series, type, caption | computation engine |
| `explainer` | "why" breakdown of a number | computation engine |
| `insight` | spend pattern / personality | analytics |

## Orb state ↔ screen behavior

| Context | Orb state |
|---|---|
| App idle on Home | idle (slow drift, neutral blue) |
| Mic active | listening (inward pull, ring) |
| Awaiting LLM | thinking (orbiting particles) |
| TTS playing | speaking (amplitude pulse) |
| Attention item present | alert (amber edge) |
| Goal reached / accepted reco | celebrate (warm bloom) |

## Information hierarchy rules

1. Health summary and top nudge above the fold.
2. Never more than 3 nudge cards on Home.
3. Every number is tappable → opens explainer.
4. Disclaimer always visible on recommendation cards, never hidden behind a tap.
