"""Pure, deterministic financial math functions.

All functions are stateless: inputs in, result out.
Money is Decimal everywhere. No floats for money.
Same inputs → identical output (deterministic).
Time enters only via explicit asOf parameter.
"""

from decimal import Decimal, ROUND_HALF_UP
from datetime import date, datetime
from typing import Any


def _d(value: Any) -> Decimal:
    """Convert to Decimal, handling string/float/int."""
    if isinstance(value, Decimal):
        return value
    return Decimal(str(value))


def _round_money(value: Decimal) -> Decimal:
    """Round to 2 decimal places using banker's rounding."""
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def _round_pct(value: Decimal) -> Decimal:
    """Round percentage to 2 decimal places."""
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def _months_between(start: date, end: date) -> int:
    """Calculate months between two dates."""
    return (end.year - start.year) * 12 + (end.month - start.month)


# ─── SIP / Future Value ──────────────────────────────────────────────


def sip_future_value(
    monthly: Decimal, annual_return: Decimal, months: int
) -> Decimal:
    """Future value of a SIP (Systematic Investment Plan).

    FV = P × [((1+i)^n - 1)/i] × (1+i)
    where i = monthly rate, n = months, P = monthly investment.
    """
    monthly = _d(monthly)
    annual_return = _d(annual_return)
    if months <= 0:
        return Decimal("0.00")
    if annual_return == 0:
        return _round_money(monthly * months)
    i = annual_return / Decimal("100") / Decimal("12")
    n = Decimal(str(months))
    factor = ((1 + i) ** n - 1) / i * (1 + i)
    return _round_money(monthly * factor)


def lumpsum_future_value(
    principal: Decimal, annual_return: Decimal, years: Decimal
) -> Decimal:
    """Future value of a lumpsum investment.

    FV = P × (1 + r)^t
    """
    principal = _d(principal)
    annual_return = _d(annual_return)
    years = _d(years)
    if years <= 0:
        return _round_money(principal)
    r = annual_return / Decimal("100")
    return _round_money(principal * (1 + r) ** years)


def required_sip(
    target_corpus: Decimal, annual_return: Decimal, months: int
) -> Decimal:
    """Monthly SIP required to reach target corpus.

    P = FV × i / [((1+i)^n - 1) × (1+i)]
    """
    target_corpus = _d(target_corpus)
    annual_return = _d(annual_return)
    if months <= 0:
        return Decimal("0.00")
    if annual_return == 0:
        return _round_money(target_corpus / Decimal(str(months)))
    i = annual_return / Decimal("100") / Decimal("12")
    n = Decimal(str(months))
    factor = ((1 + i) ** n - 1) * (1 + i)
    return _round_money(target_corpus * i / factor)


# ─── Inflation / Goal Planning ───────────────────────────────────────


def inflate(
    present_amount: Decimal, inflation: Decimal, years: Decimal
) -> Decimal:
    """Inflate a present amount to future value.

    future = present × (1 + inflation/100)^years
    """
    present_amount = _d(present_amount)
    inflation = _d(inflation)
    years = _d(years)
    rate = inflation / Decimal("100")
    return _round_money(present_amount * (1 + rate) ** years)


def goal_plan(
    target_today: Decimal,
    target_date: str,
    expected_return: Decimal,
    inflation: Decimal,
    current_corpus: Decimal,
    monthly_contribution: Decimal,
    as_of: str,
) -> dict:
    """Compute goal plan with required corpus, projection, gap, and steps.

    Returns dict with required_corpus, projected_corpus, gap, on_track,
    assumptions, and steps (for explainer card).
    """
    target_today = _d(target_today)
    expected_return = _d(expected_return)
    inflation = _d(inflation)
    current_corpus = _d(current_corpus)
    monthly_contribution = _d(monthly_contribution)

    as_of_date = datetime.strptime(as_of, "%Y-%m-%d").date()
    target_date_obj = datetime.strptime(target_date, "%Y-%m-%d").date()

    months = _months_between(as_of_date, target_date_obj)
    years = Decimal(str(months)) / Decimal("12")

    # Required corpus (inflation-adjusted)
    required_corpus = inflate(target_today, inflation, years)

    # FV of current corpus (lumpsum)
    fv_corpus = lumpsum_future_value(current_corpus, expected_return, years)

    # FV of monthly contributions (SIP)
    fv_sip = sip_future_value(monthly_contribution, expected_return, months)

    projected_corpus = _round_money(fv_corpus + fv_sip)
    gap = _round_money(required_corpus - projected_corpus)
    on_track = gap <= 0

    steps = [
        {"label": "Inflated target", "value": str(required_corpus)},
        {"label": "FV of current corpus", "value": str(fv_corpus)},
        {"label": "FV of contributions", "value": str(fv_sip)},
    ]

    return {
        "requiredCorpus": str(required_corpus),
        "projectedCorpus": str(projected_corpus),
        "gap": str(max(gap, Decimal("0.00"))),
        "onTrack": on_track,
        "assumptions": {
            "inflation": str(inflation),
            "expectedReturn": str(expected_return),
        },
        "steps": steps,
    }


# ─── Asset Allocation ────────────────────────────────────────────────


ALLOCATION_MAP = {
    "conservative": {"equity": Decimal("20"), "debt": Decimal("60"), "cash": Decimal("20")},
    "moderate": {"equity": Decimal("50"), "debt": Decimal("35"), "cash": Decimal("15")},
    "aggressive": {"equity": Decimal("75"), "debt": Decimal("20"), "cash": Decimal("5")},
}


def target_allocation(risk_band: str) -> dict:
    """Return target allocation percentages for a risk band.

    Returns dict with equity, debt, cash percentages.
    """
    band = risk_band.lower().strip()
    if band not in ALLOCATION_MAP:
        raise ValueError(f"Unknown risk band: {risk_band}. Must be one of: {list(ALLOCATION_MAP.keys())}")
    alloc = ALLOCATION_MAP[band]
    return {k: str(v) for k, v in alloc.items()}


# ─── Rebalancing ─────────────────────────────────────────────────────


def rebalance_deltas(
    holdings: list[dict],
    target_allocation: dict,
    drift_threshold: Decimal = Decimal("5"),
) -> list[dict]:
    """Compute rebalancing deltas when drift exceeds threshold.

    holdings: [{"asset_class": "equity", "current_value": "500000.00"}, ...]
    target_allocation: {"equity": "60", "debt": "30", "cash": "10"}
    drift_threshold: percentage (default 5%)

    Returns list of {"asset_class", "action", "amount"}.
    """
    drift_threshold = _d(drift_threshold)
    total = sum(_d(h["current_value"]) for h in holdings)
    if total == 0:
        return []

    # Build current allocation
    current = {}
    for h in holdings:
        cls = h["asset_class"]
        current[cls] = current.get(cls, Decimal("0")) + _d(h["current_value"])

    deltas = []
    for asset_class, target_pct_str in target_allocation.items():
        target_pct = _d(target_pct_str)
        target_value = total * target_pct / Decimal("100")
        current_value = current.get(asset_class, Decimal("0"))
        diff = target_value - current_value
        diff_pct = abs(diff) / total * Decimal("100")

        if diff_pct > drift_threshold:
            action = "buy" if diff > 0 else "sell"
            deltas.append({
                "asset_class": asset_class,
                "action": action,
                "amount": str(_round_money(abs(diff))),
            })

    return deltas


# ─── Idle Cash ───────────────────────────────────────────────────────


def idle_cash(
    balance: Decimal,
    avg_monthly_outflow: Decimal,
    buffer_months: int = 3,
    idle_days: int = 30,
) -> dict:
    """Suggest sweep amount for idle cash above emergency buffer.

    Returns dict with balance, buffer, idle_amount, suggested_sweep.
    """
    balance = _d(balance)
    avg_monthly_outflow = _d(avg_monthly_outflow)
    buffer = avg_monthly_outflow * buffer_months
    idle_amount = balance - buffer
    suggested_sweep = max(idle_amount, Decimal("0.00"))

    return {
        "balance": str(balance),
        "buffer": str(_round_money(buffer)),
        "idleAmount": str(_round_money(max(idle_amount, Decimal("0.00")))),
        "suggestedSweep": str(_round_money(suggested_sweep)),
    }


# ─── Emergency Fund ──────────────────────────────────────────────────


def emergency_adequacy(
    liquid_assets: Decimal,
    monthly_essential_spend: Decimal,
    target_months: int = 6,
) -> dict:
    """Check if emergency fund is adequate.

    Returns dict with adequate, shortfall, months_covered.
    """
    liquid_assets = _d(liquid_assets)
    monthly_essential_spend = _d(monthly_essential_spend)
    if monthly_essential_spend <= 0:
        return {
            "adequate": True,
            "shortfall": "0.00",
            "monthsCovered": "999.00",
        }
    months_covered = liquid_assets / monthly_essential_spend
    required = monthly_essential_spend * target_months
    shortfall = max(required - liquid_assets, Decimal("0.00"))
    adequate = shortfall == 0

    return {
        "adequate": adequate,
        "shortfall": str(_round_money(shortfall)),
        "monthsCovered": str(_round_months(months_covered)),
    }


def _round_months(value: Decimal) -> Decimal:
    """Round months to 1 decimal place."""
    return value.quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)


# ─── Tax Optimization (India) ────────────────────────────────────────


def tax_80c_gap(invested_80c: Decimal, limit: Decimal = Decimal("150000")) -> dict:
    """Compute remaining 80C limit.

    Returns dict with invested, limit, remaining.
    """
    invested_80c = _d(invested_80c)
    limit = _d(limit)
    remaining = max(limit - invested_80c, Decimal("0.00"))
    return {
        "invested": str(invested_80c),
        "limit": str(limit),
        "remaining": str(_round_money(remaining)),
    }


def elss_suggestion(
    remaining_80c: Decimal, risk_band: str
) -> dict:
    """Suggest ELSS investment based on remaining 80C and risk band.

    Returns dict with suggestedAmount, riskBand, rationale.
    """
    remaining_80c = _d(remaining_80c)
    if remaining_80c <= 0:
        return {
            "suggestedAmount": "0.00",
            "riskBand": risk_band,
            "rationale": "80C limit already fully utilized.",
        }

    # Conservative: suggest 50% of remaining; Moderate: 75%; Aggressive: 100%
    band = risk_band.lower().strip()
    pct_map = {"conservative": Decimal("50"), "moderate": Decimal("75"), "aggressive": Decimal("100")}
    pct = pct_map.get(band, Decimal("75"))
    suggested = _round_money(remaining_80c * pct / Decimal("100"))

    return {
        "suggestedAmount": str(suggested),
        "riskBand": risk_band,
        "rationale": f"ELSS suggestion based on {pct}% of remaining ₹80C limit for {risk_band} risk profile.",
    }


# ─── Returns ─────────────────────────────────────────────────────────


def xirr(cashflows: list[dict]) -> Decimal:
    """Compute XIRR (annualized return) from irregular cashflows.

    cashflows: [{"date": "2024-01-15", "amount": "-50000.00"}, ...]
    Uses Newton-Raphson method.

    Returns annualized rate as percentage (e.g. 12.50 for 12.5%).
    """
    if len(cashflows) < 2:
        return Decimal("0.00")

    dates = [datetime.strptime(cf["date"], "%Y-%m-%d").date() for cf in cashflows]
    amounts = [_d(cf["amount"]) for cf in cashflows]

    base_date = dates[0]
    days = [(d - base_date).days for d in dates]

    def npv(rate: Decimal) -> Decimal:
        """Net present value at given rate."""
        total = Decimal("0")
        for day, amt in zip(days, amounts):
            years = Decimal(str(day)) / Decimal("365")
            total += amt / (1 + rate) ** years
        return total

    def npv_deriv(rate: Decimal) -> Decimal:
        """Derivative of NPV for Newton-Raphson."""
        total = Decimal("0")
        for day, amt in zip(days, amounts):
            years = Decimal(str(day)) / Decimal("365")
            total -= years * amt / (1 + rate) ** (years + 1)
        return total

    # Newton-Raphson iteration
    rate = Decimal("0.1")  # Initial guess: 10%
    for _ in range(100):
        f = npv(rate)
        fp = npv_deriv(rate)
        if abs(fp) < Decimal("1E-20"):
            break
        rate_new = rate - f / fp
        if abs(rate_new - rate) < Decimal("1E-12"):
            rate = rate_new
            break
        rate = rate_new

    return _round_pct(rate * Decimal("100"))


def cagr(start_value: Decimal, end_value: Decimal, years: Decimal) -> Decimal:
    """Compute CAGR (Compound Annual Growth Rate).

    CAGR = (end/start)^(1/years) - 1

    Returns as percentage (e.g. 12.50 for 12.5%).
    """
    start_value = _d(start_value)
    end_value = _d(end_value)
    years = _d(years)
    if start_value <= 0 or years <= 0:
        return Decimal("0.00")
    rate = (end_value / start_value) ** (1 / years) - 1
    return _round_pct(rate * Decimal("100"))


# ─── Savings Capacity ────────────────────────────────────────────────


def surplus(
    income: Decimal, recurring_outflow: Decimal, discretionary_outflow: Decimal
) -> dict:
    """Compute monthly surplus.

    Returns dict with income, recurringOutflow, discretionaryOutflow,
    surplus, savingsRate.
    """
    income = _d(income)
    recurring_outflow = _d(recurring_outflow)
    discretionary_outflow = _d(discretionary_outflow)
    total_outflow = recurring_outflow + discretionary_outflow
    monthly_surplus = income - total_outflow
    rate = (monthly_surplus / income * 100) if income > 0 else Decimal("0.00")

    return {
        "income": str(income),
        "recurringOutflow": str(recurring_outflow),
        "discretionaryOutflow": str(discretionary_outflow),
        "surplus": str(_round_money(max(monthly_surplus, Decimal("0.00")))),
        "savingsRate": str(_round_pct(max(rate, Decimal("0.00")))),
    }


def savings_rate(surplus_value: Decimal, income: Decimal) -> Decimal:
    """Compute savings rate as percentage.

    Returns percentage (e.g. 25.90 for 25.9%).
    """
    surplus_value = _d(surplus_value)
    income = _d(income)
    if income <= 0:
        return Decimal("0.00")
    return _round_pct(surplus_value / income * 100)
