Status: 📋 PLANNED

# 06 â€” API Contracts

Base: `/api/v1`. Auth: `Authorization: Bearer <jwt>` (from bank app session). All responses JSON. Errors use RFC-7807 problem+json.

## Conventions
- Money fields: string decimal (e.g. `"12500.00"`) to avoid float drift.
- Timestamps: ISO-8601 UTC.
- Idempotency: mutating calls accept `Idempotency-Key` header.

---

## Profile

### GET /profile
```json
{
  "userId": "u_123",
  "financialProfile": {
    "monthlyIncome": "85000.00",
    "monthlySurplus": "22000.00",
    "savingsRate": "25.9",
    "spendPersonality": "balanced",
    "lifeStage": "early_family"
  },
  "risk": { "score": 62, "band": "moderate", "validUntil": "2026-03-01" }
}
```

### POST /profile/risk-assessment
Req:
```json
{ "answers": [{ "qid": "q1", "value": 3 }, { "qid": "q2", "value": 5 }] }
```
Res: `{ "score": 62, "band": "moderate", "validUntil": "2026-03-01" }`

---

## Insights

### GET /insights/spending?period=last_3m
```json
{
  "period": "last_3m",
  "categories": [
    { "category": "rent", "amount": "60000.00", "discretionary": false },
    { "category": "dining", "amount": "9800.00", "discretionary": true }
  ],
  "idleCash": { "amount": "40000.00", "suggestedAction": "liquid_fund" }
}
```

---

## Goals

### POST /goals
Req:
```json
{ "name": "Child Education", "goalType": "education",
  "targetAmount": "2500000.00", "targetDate": "2038-06-01", "priority": 1 }
```
Res: goal object + first projection.

### GET /goals/{id}/projection
```json
{
  "goalId": "g_1",
  "requiredCorpus": "5120000.00",
  "monthlyContribution": "11800.00",
  "projectedCorpus": "4300000.00",
  "gap": "820000.00",
  "assumptions": { "inflation": "6.0", "expectedReturn": "11.0" }
}
```

### POST /goals/{id}/simulate  (what-if; no persistence)
Req: `{ "targetDate": "2040-06-01", "monthlyContribution": "15000.00" }`
Res: recomputed projection object.

---

## Recommendations

### GET /recommendations
```json
{
  "items": [
    {
      "id": "r_9",
      "type": "idle_cash",
      "payload": { "amount": "40000.00", "product": "Liquid Fund X" },
      "rationale": "Surplus idle in savings for 60+ days.",
      "suitability": "passed",
      "disclaimer": "Mutual funds are subject to market risk...",
      "computationInputs": { "idleDays": 63, "rate": "6.8" }
    }
  ]
}
```

### POST /recommendations/{id}/action
Req: `{ "action": "accept" | "dismiss" }`
Res: `{ "status": "accepted", "auditId": "a_55" }`

---

## Conversation (REST init + WSS stream)

### POST /conversations
Res: `{ "conversationId": "c_1", "wsUrl": "wss://.../stream?token=..." }`

### WSS /stream  (bidirectional)

Client â†’ server:
```json
{ "type": "user_message", "text": "Can I afford a 30L home in 5 years?" }
```
or `{ "type": "user_audio", "chunk": "<base64 pcm>", "final": false }`

Server â†’ client events (streamed):
```json
{ "type": "avatar_state", "state": "thinking" }
{ "type": "token", "text": "Based on your surplus, " }
{ "type": "card", "card": { "kind": "goal", "data": { /* projection */ } } }
{ "type": "avatar_state", "state": "speaking", "mood": "neutral" }
{ "type": "tts_audio", "chunk": "<base64>", "final": false }
{ "type": "done", "messageId": "m_1" }
```

> Numbers inside `token`/`card` always originate from the Computation Engine. The orchestrator injects verified values; the LLM only phrases them.

---

## Nudges

### GET /nudges  â†’ list of pending nudge cards (priority-sorted, capped).
### POST /nudges/{id}/dismiss

---

## Consent

### GET /consents
### PUT /consents  `{ "scope": "advisory", "granted": true }`

---

## Avatar metadata

### GET /avatar/states  â†’ static catalog of states + color/motion hints (client may cache).

---

## Error shape
```json
{ "type": "https://errors/validation", "title": "Invalid goal date",
  "status": 422, "detail": "targetDate must be in the future" }
```
