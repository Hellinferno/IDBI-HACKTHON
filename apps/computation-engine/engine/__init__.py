"""WealthOrb Computation Engine - Deterministic financial math."""

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

__all__ = [
    "sip_future_value",
    "lumpsum_future_value",
    "required_sip",
    "inflate",
    "goal_plan",
    "target_allocation",
    "rebalance_deltas",
    "idle_cash",
    "emergency_adequacy",
    "tax_80c_gap",
    "elss_suggestion",
    "xirr",
    "cagr",
    "surplus",
    "savings_rate",
]
