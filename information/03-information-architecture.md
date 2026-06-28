Status: 📋 PLANNED

# 03 â€” Information Architecture

## Entry point

Embedded as a module in the bank app. Launched from a "Wealth Advisor" tile or floating Orb on the home screen.

## Screen map

```
Wealth Advisor (root)
â”œâ”€â”€ Home / Advisor
â”‚   â”œâ”€â”€ Orb (always present)
â”‚   â”œâ”€â”€ Health summary line
â”‚   â”œâ”€â”€ Top nudge cards (max 3)
â”‚   â””â”€â”€ Ask bar (text + mic)
â”œâ”€â”€ Conversation
â”‚   â”œâ”€â”€ Message thread (user â†” Orb)
â”‚   â”œâ”€â”€ Inline cards (recommendation, chart, goal)
â”‚   â””â”€â”€ "Why?" expanders
â”œâ”€â”€ Goals
â”‚   â”œâ”€â”€ Goal list
â”‚   â”œâ”€â”€ Goal detail (corpus, gap, progress)
â”‚   â””â”€â”€ What-if simulator (sliders)
â”œâ”€â”€ Portfolio
â”‚   â”œâ”€â”€ Holdings + allocation donut
â”‚   â”œâ”€â”€ Drift / rebalance suggestion
â”‚   â””â”€â”€ Performance (XIRR)
â”œâ”€â”€ Insights / Spending
â”‚   â”œâ”€â”€ Categorized spend
â”‚   â”œâ”€â”€ Spend personality card
â”‚   â””â”€â”€ Cashflow + idle cash
â”œâ”€â”€ Recommendations
â”‚   â”œâ”€â”€ Active suggestions
â”‚   â””â”€â”€ History (accepted/dismissed)
â””â”€â”€ Settings
    â”œâ”€â”€ Consent & data
    â”œâ”€â”€ Language
    â”œâ”€â”€ Risk profile (retake)
    â””â”€â”€ Notifications
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

## Orb state â†” screen behavior

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
3. Every number is tappable â†’ opens explainer.
4. Disclaimer always visible on recommendation cards, never hidden behind a tap.
