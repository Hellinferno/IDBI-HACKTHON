# 08 — Computation Engine Spec

**The single source of truth for every number in the product.** Pure, deterministic, stateless, exhaustively unit-tested. The LLM never computes; it phrases what this engine returns.

## Principles
1. **Deterministic** — same inputs → byte-identical output. No randomness, no time-of-day drift (time passed explicitly).
2. **Pure functions** — no DB, no network inside math; inputs in, result out.
3. **Decimal-safe** — use `Decimal`; never float for money.
4. **Explainable** — every result carries the inputs and intermediate steps for the "why" card.
5. **Versioned assumptions** — return assumptions used (inflation, return rates) with every result.

## Module list

### sip / future value
- `sip_future_value(monthly, annual_return, months) -> corpus`
- `lumpsum_future_value(principal, annual_return, years) -> corpus`
- `required_sip(target_corpus, annual_return, months) -> monthly`
- formula: FV = P × [((1+i)^n − 1)/i] × (1+i), i = monthly rate.

### goal planning
- `inflate(present_amount, inflation, years) -> future_amount`
- `goal_plan(target_today, target_date, expected_return, inflation, current_corpus, monthly) -> { required_corpus, projected_corpus, gap, on_track }`
- what-if = same function, different params, no persistence.

### asset allocation
- `target_allocation(risk_band) -> { equity, debt, cash }`
- glide-path adjust by life_stage / horizon (reduce equity as goal nears).

### rebalancing
- `rebalance_deltas(holdings, target_allocation, drift_threshold) -> [{ asset_class, action, amount }]`
- triggers only when |actual − target| > threshold (default 5%).

### idle cash
- `idle_cash(balance, avg_monthly_outflow, buffer_months, idle_days) -> suggested_sweep_amount`
- keeps emergency buffer; suggests sweep of excess.

### emergency fund
- `emergency_adequacy(liquid_assets, monthly_essential_spend, target_months) -> { adequate, shortfall, months_covered }`

### tax optimization (India example, configurable per jurisdiction)
- `tax_80c_gap(invested_80c, limit) -> remaining`
- `elss_suggestion(remaining_80c, risk_band) -> amount`
- deadline-aware flag from fiscal calendar.

### returns
- `xirr(cashflows[{date, amount}]) -> annualized_rate`
- `cagr(start_value, end_value, years) -> rate`

### savings capacity
- `surplus(income, recurring_outflow, discretionary_outflow) -> monthly_surplus`
- `savings_rate(surplus, income) -> percent`

## Interface

HTTP (FastAPI), JSON in/out. Example:

`POST /compute/goal-plan`
```json
{
  "targetToday": "2500000.00",
  "targetDate": "2038-06-01",
  "expectedReturn": "11.0",
  "inflation": "6.0",
  "currentCorpus": "150000.00",
  "monthlyContribution": "11800.00",
  "asOf": "2026-06-23"
}
```
→
```json
{
  "requiredCorpus": "5120000.00",
  "projectedCorpus": "4300000.00",
  "gap": "820000.00",
  "onTrack": false,
  "assumptions": { "inflation": "6.0", "expectedReturn": "11.0" },
  "steps": [
    { "label": "Inflated target", "value": "5120000.00" },
    { "label": "FV of current corpus", "value": "640000.00" },
    { "label": "FV of contributions", "value": "3660000.00" }
  ]
}
```

`steps` feeds the explainer card directly.

## Testing requirement
- Every function: golden-value tests checked against an independent calculator/spreadsheet.
- Property tests: monotonicity (more contribution ⇒ ≥ corpus), boundary (zero return, zero months).
- Tolerance: exact to 2 decimals; no function may depend on wall-clock except via `asOf`.

## What this engine is NOT
- Not a forecaster of markets (returns are assumptions, surfaced as such).
- Not a place for business rules about which product to show (that's reco-service).
- Not allowed to call the LLM.
