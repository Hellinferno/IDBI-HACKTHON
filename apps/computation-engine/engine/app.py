"""FastAPI application for the Computation Engine.

HTTP surface for deterministic financial math.
All endpoints match the API contracts (file 06/08).
"""

from fastapi import FastAPI, HTTPException
from decimal import Decimal, InvalidOperation

from .models import (
    SipFVRequest,
    LumpsumFVRequest,
    RequiredSipRequest,
    InflateRequest,
    GoalPlanRequest,
    AllocationRequest,
    RebalanceRequest,
    IdleCashRequest,
    EmergencyAdequacyRequest,
    Tax80CGapRequest,
    ElssSuggestionRequest,
    XirrRequest,
    CagrRequest,
    SurplusRequest,
    SavingsRateRequest,
)
from .math_core import (
    sip_future_value,
    lumpsum_future_value,
    required_sip,
    inflate,
    goal_plan,
    target_allocation,
    rebalance_deltas,
    idle_cash,
    emergency_adequacy,
    tax_80c_gap,
    elss_suggestion,
    xirr,
    cagr,
    surplus,
    savings_rate,
)

app = FastAPI(
    title="WealthOrb Computation Engine",
    description="Deterministic financial math - single source of truth for all numbers",
    version="0.1.0",
)


@app.get("/health")
def health():
    return {"status": "ok"}


# ─── SIP / Future Value ──────────────────────────────────────────────


@app.post("/compute/sip-future-value")
def compute_sip_fv(req: SipFVRequest):
    try:
        result = sip_future_value(req.monthly, req.annual_return, req.months)
        return {"result": str(result)}
    except (InvalidOperation, ValueError) as e:
        raise HTTPException(status_code=422, detail=str(e))


@app.post("/compute/lumpsum-future-value")
def compute_lumpsum_fv(req: LumpsumFVRequest):
    try:
        result = lumpsum_future_value(req.principal, req.annual_return, req.years)
        return {"result": str(result)}
    except (InvalidOperation, ValueError) as e:
        raise HTTPException(status_code=422, detail=str(e))


@app.post("/compute/required-sip")
def compute_required_sip(req: RequiredSipRequest):
    try:
        result = required_sip(req.target_corpus, req.annual_return, req.months)
        return {"result": str(result)}
    except (InvalidOperation, ValueError) as e:
        raise HTTPException(status_code=422, detail=str(e))


# ─── Inflation / Goal Planning ───────────────────────────────────────


@app.post("/compute/inflate")
def compute_inflate(req: InflateRequest):
    try:
        result = inflate(req.present_amount, req.inflation, req.years)
        return {"result": str(result)}
    except (InvalidOperation, ValueError) as e:
        raise HTTPException(status_code=422, detail=str(e))


@app.post("/compute/goal-plan")
def compute_goal_plan(req: GoalPlanRequest):
    try:
        result = goal_plan(
            req.target_today,
            req.target_date,
            req.expected_return,
            req.inflation,
            req.current_corpus,
            req.monthly_contribution,
            req.as_of,
        )
        return result
    except (InvalidOperation, ValueError) as e:
        raise HTTPException(status_code=422, detail=str(e))


# ─── Asset Allocation ────────────────────────────────────────────────


@app.post("/compute/allocation")
def compute_allocation(req: AllocationRequest):
    try:
        return target_allocation(req.risk_band)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))


# ─── Rebalancing ─────────────────────────────────────────────────────


@app.post("/compute/rebalance")
def compute_rebalance(req: RebalanceRequest):
    try:
        holdings = [h.model_dump() for h in req.holdings]
        return rebalance_deltas(holdings, req.target_allocation, req.drift_threshold)
    except (InvalidOperation, ValueError) as e:
        raise HTTPException(status_code=422, detail=str(e))


# ─── Idle Cash ───────────────────────────────────────────────────────


@app.post("/compute/idle-cash")
def compute_idle_cash(req: IdleCashRequest):
    try:
        return idle_cash(
            req.balance, req.avg_monthly_outflow, req.buffer_months, req.idle_days
        )
    except (InvalidOperation, ValueError) as e:
        raise HTTPException(status_code=422, detail=str(e))


# ─── Emergency Fund ──────────────────────────────────────────────────


@app.post("/compute/emergency-adequacy")
def compute_emergency(req: EmergencyAdequacyRequest):
    try:
        return emergency_adequacy(
            req.liquid_assets, req.monthly_essential_spend, req.target_months
        )
    except (InvalidOperation, ValueError) as e:
        raise HTTPException(status_code=422, detail=str(e))


# ─── Tax Optimization ────────────────────────────────────────────────


@app.post("/compute/tax-80c-gap")
def compute_tax_80c(req: Tax80CGapRequest):
    try:
        return tax_80c_gap(req.invested_80c, req.limit)
    except (InvalidOperation, ValueError) as e:
        raise HTTPException(status_code=422, detail=str(e))


@app.post("/compute/elss-suggestion")
def compute_elss(req: ElssSuggestionRequest):
    try:
        return elss_suggestion(req.remaining_80c, req.risk_band)
    except (InvalidOperation, ValueError) as e:
        raise HTTPException(status_code=422, detail=str(e))


# ─── Returns ─────────────────────────────────────────────────────────


@app.post("/compute/xirr")
def compute_xirr(req: XirrRequest):
    try:
        cashflows = [c.model_dump() for c in req.cashflows]
        result = xirr(cashflows)
        return {"result": str(result)}
    except (InvalidOperation, ValueError) as e:
        raise HTTPException(status_code=422, detail=str(e))


@app.post("/compute/cagr")
def compute_cagr(req: CagrRequest):
    try:
        result = cagr(req.start_value, req.end_value, req.years)
        return {"result": str(result)}
    except (InvalidOperation, ValueError) as e:
        raise HTTPException(status_code=422, detail=str(e))


# ─── Savings Capacity ────────────────────────────────────────────────


@app.post("/compute/surplus")
def compute_surplus(req: SurplusRequest):
    try:
        return surplus(req.income, req.recurring_outflow, req.discretionary_outflow)
    except (InvalidOperation, ValueError) as e:
        raise HTTPException(status_code=422, detail=str(e))


@app.post("/compute/savings-rate")
def compute_savings_rate(req: SavingsRateRequest):
    try:
        result = savings_rate(req.surplus, req.income)
        return {"result": str(result)}
    except (InvalidOperation, ValueError) as e:
        raise HTTPException(status_code=422, detail=str(e))
