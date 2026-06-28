"""Pydantic models for API request/response validation."""

from pydantic import BaseModel, Field
from typing import Optional


# ─── SIP / Future Value ──────────────────────────────────────────────


class SipFVRequest(BaseModel):
    monthly: str = Field(..., description="Monthly SIP amount")
    annual_return: str = Field(..., description="Expected annual return %")
    months: int = Field(..., ge=0, description="Number of months")


class LumpsumFVRequest(BaseModel):
    principal: str = Field(..., description="Lumpsum investment amount")
    annual_return: str = Field(..., description="Expected annual return %")
    years: str = Field(..., description="Investment horizon in years")


class RequiredSipRequest(BaseModel):
    target_corpus: str = Field(..., description="Target corpus amount")
    annual_return: str = Field(..., description="Expected annual return %")
    months: int = Field(..., ge=0, description="Number of months")


# ─── Inflation / Goal Planning ───────────────────────────────────────


class InflateRequest(BaseModel):
    present_amount: str = Field(..., description="Present value")
    inflation: str = Field(..., description="Inflation rate %")
    years: str = Field(..., description="Years to inflate")


class GoalPlanRequest(BaseModel):
    target_today: str = Field(..., description="Target amount in today's value")
    target_date: str = Field(..., description="Target date YYYY-MM-DD")
    expected_return: str = Field(..., description="Expected return %")
    inflation: str = Field(..., description="Inflation rate %")
    current_corpus: str = Field(..., description="Current corpus")
    monthly_contribution: str = Field(..., description="Monthly contribution")
    as_of: str = Field(..., description="As of date YYYY-MM-DD")


# ─── Asset Allocation ────────────────────────────────────────────────


class AllocationRequest(BaseModel):
    risk_band: str = Field(..., description="conservative/moderate/aggressive")


# ─── Rebalancing ─────────────────────────────────────────────────────


class HoldingItem(BaseModel):
    asset_class: str
    current_value: str


class RebalanceRequest(BaseModel):
    holdings: list[HoldingItem]
    target_allocation: dict[str, str]
    drift_threshold: str = Field(default="5", description="Drift threshold %")


# ─── Idle Cash ───────────────────────────────────────────────────────


class IdleCashRequest(BaseModel):
    balance: str
    avg_monthly_outflow: str
    buffer_months: int = Field(default=3, ge=1)
    idle_days: int = Field(default=30, ge=1)


# ─── Emergency Fund ──────────────────────────────────────────────────


class EmergencyAdequacyRequest(BaseModel):
    liquid_assets: str
    monthly_essential_spend: str
    target_months: int = Field(default=6, ge=1)


# ─── Tax Optimization ────────────────────────────────────────────────


class Tax80CGapRequest(BaseModel):
    invested_80c: str
    limit: str = Field(default="150000.00")


class ElssSuggestionRequest(BaseModel):
    remaining_80c: str
    risk_band: str


# ─── Returns ─────────────────────────────────────────────────────────


class CashflowItem(BaseModel):
    date: str
    amount: str


class XirrRequest(BaseModel):
    cashflows: list[CashflowItem]


class CagrRequest(BaseModel):
    start_value: str
    end_value: str
    years: str


# ─── Savings Capacity ────────────────────────────────────────────────


class SurplusRequest(BaseModel):
    income: str
    recurring_outflow: str
    discretionary_outflow: str


class SavingsRateRequest(BaseModel):
    surplus: str
    income: str
