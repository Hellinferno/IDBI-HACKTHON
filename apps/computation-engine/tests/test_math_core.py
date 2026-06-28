"""Golden + property tests for the computation engine.

Every function: golden-value tests checked against independent calculator.
Property tests: monotonicity, boundaries, determinism.
Tolerance: exact to 2 decimals.
"""

from decimal import Decimal
import pytest
from engine.math_core import (
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


# ─── SIP Future Value ────────────────────────────────────────────────


class TestSipFutureValue:
    """Golden tests for SIP future value."""

    def test_golden_basic(self):
        """₹5000/month, 12% annual, 12 months (annuity-due)."""
        result = sip_future_value("5000", "12", 12)
        assert result == Decimal("64046.64")

    def test_golden_large(self):
        """₹10000/month, 10% annual, 60 months (annuity-due)."""
        result = sip_future_value("10000", "10", 60)
        assert result == Decimal("780823.81")

    def test_zero_return(self):
        """Zero return = simple multiplication."""
        result = sip_future_value("5000", "0", 12)
        assert result == Decimal("60000.00")

    def test_zero_months(self):
        """Zero months = zero corpus."""
        result = sip_future_value("5000", "12", 0)
        assert result == Decimal("0.00")

    def test_property_monotonicity(self):
        """Higher contribution → higher corpus."""
        low = sip_future_value("5000", "12", 60)
        high = sip_future_value("10000", "12", 60)
        assert high > low

    def test_determinism(self):
        """Same inputs → identical output."""
        r1 = sip_future_value("7500", "11", 36)
        r2 = sip_future_value("7500", "11", 36)
        assert r1 == r2


# ─── Lumpsum Future Value ────────────────────────────────────────────


class TestLumpsumFV:
    """Golden tests for lumpsum future value."""

    def test_golden_basic(self):
        """₹100000, 10% annual, 5 years = ₹161051.00"""
        result = lumpsum_future_value("100000", "10", "5")
        assert result == Decimal("161051.00")

    def test_golden_large(self):
        """₹500000, 12% annual, 10 years"""
        result = lumpsum_future_value("500000", "12", "10")
        assert result == Decimal("1552924.10")

    def test_zero_years(self):
        """Zero years = same amount."""
        result = lumpsum_future_value("100000", "10", "0")
        assert result == Decimal("100000.00")

    def test_zero_return(self):
        """Zero return = same amount."""
        result = lumpsum_future_value("100000", "0", "5")
        assert result == Decimal("100000.00")


# ─── Required SIP ────────────────────────────────────────────────────


class TestRequiredSip:
    """Golden tests for required SIP."""

    def test_golden_basic(self):
        """Reach ₹1000000 in 60 months at 12%."""
        result = required_sip("1000000", "12", 60)
        assert result == Decimal("12123.22")

    def test_property_inverse(self):
        """required_sip(target, r, n) × months ≈ SIP FV check."""
        target = Decimal("1000000")
        monthly = required_sip(target, "12", 60)
        fv = sip_future_value(monthly, "12", 60)
        assert abs(fv - target) < Decimal("1.00")

    def test_zero_months(self):
        result = required_sip("1000000", "12", 0)
        assert result == Decimal("0.00")


# ─── Inflate ─────────────────────────────────────────────────────────


class TestInflate:
    """Golden tests for inflation."""

    def test_golden_basic(self):
        """₹100000, 6% inflation, 10 years."""
        result = inflate("100000", "6", "10")
        assert result == Decimal("179084.77")

    def test_golden_large(self):
        """₹2500000, 6% inflation, 12 years."""
        result = inflate("2500000", "6", "12")
        assert result == Decimal("5030491.18")

    def test_zero_inflation(self):
        result = inflate("100000", "0", "10")
        assert result == Decimal("100000.00")

    def test_zero_years(self):
        result = inflate("100000", "6", "0")
        assert result == Decimal("100000.00")


# ─── Goal Plan ───────────────────────────────────────────────────────


class TestGoalPlan:
    """Golden tests for goal planning."""

    def test_golden_basic(self):
        """Child education goal from spec."""
        result = goal_plan(
            target_today="2500000",
            target_date="2038-06-01",
            expected_return="11",
            inflation="6",
            current_corpus="150000",
            monthly_contribution="11800",
            as_of="2026-06-23",
        )
        assert "requiredCorpus" in result
        assert "projectedCorpus" in result
        assert "gap" in result
        assert "onTrack" in result
        assert "assumptions" in result
        assert "steps" in result
        assert len(result["steps"]) == 3

    def test_golden_values(self):
        """Verify specific computed values."""
        result = goal_plan(
            target_today="2500000",
            target_date="2038-06-01",
            expected_return="11",
            inflation="6",
            current_corpus="150000",
            monthly_contribution="11800",
            as_of="2026-06-23",
        )
        assert result["requiredCorpus"] == "5030491.18"
        assert result["onTrack"] is False

    def test_on_track_when_sufficient(self):
        """High contribution → on track."""
        result = goal_plan(
            target_today="100000",
            target_date="2027-06-01",
            expected_return="12",
            inflation="6",
            current_corpus="100000",
            monthly_contribution="50000",
            as_of="2026-06-23",
        )
        assert result["onTrack"] is True
        assert result["gap"] == "0.00"


# ─── Target Allocation ───────────────────────────────────────────────


class TestTargetAllocation:
    """Golden tests for asset allocation."""

    def test_conservative(self):
        result = target_allocation("conservative")
        assert result["equity"] == "20"
        assert result["debt"] == "60"
        assert result["cash"] == "20"

    def test_moderate(self):
        result = target_allocation("moderate")
        assert result["equity"] == "50"
        assert result["debt"] == "35"
        assert result["cash"] == "15"

    def test_aggressive(self):
        result = target_allocation("aggressive")
        assert result["equity"] == "75"
        assert result["debt"] == "20"
        assert result["cash"] == "5"

    def test_invalid_band(self):
        with pytest.raises(ValueError, match="Unknown risk band"):
            target_allocation("invalid")

    def test_allocations_sum_to_100(self):
        for band in ["conservative", "moderate", "aggressive"]:
            alloc = target_allocation(band)
            total = sum(Decimal(v) for v in alloc.values())
            assert total == Decimal("100")


# ─── Rebalance Deltas ────────────────────────────────────────────────


class TestRebalanceDeltas:
    """Golden tests for rebalancing."""

    def test_no_drift(self):
        """Within threshold → no action."""
        holdings = [
            {"asset_class": "equity", "current_value": "600000"},
            {"asset_class": "debt", "current_value": "300000"},
            {"asset_class": "cash", "current_value": "100000"},
        ]
        target = {"equity": "60", "debt": "30", "cash": "10"}
        deltas = rebalance_deltas(holdings, target, "5")
        assert len(deltas) == 0

    def test_with_drift(self):
        """Exceeds threshold → rebalance action."""
        holdings = [
            {"asset_class": "equity", "current_value": "800000"},
            {"asset_class": "debt", "current_value": "150000"},
            {"asset_class": "cash", "current_value": "50000"},
        ]
        target = {"equity": "50", "debt": "35", "cash": "15"}
        deltas = rebalance_deltas(holdings, target, "5")
        assert len(deltas) > 0
        equity_delta = [d for d in deltas if d["asset_class"] == "equity"][0]
        assert equity_delta["action"] == "sell"

    def test_empty_holdings(self):
        deltas = rebalance_deltas([], {"equity": "50"}, "5")
        assert deltas == []


# ─── Idle Cash ───────────────────────────────────────────────────────


class TestIdleCash:
    """Golden tests for idle cash detection."""

    def test_golden_basic(self):
        result = idle_cash("200000", "50000", 3, 30)
        assert result["balance"] == "200000"
        assert result["buffer"] == "150000.00"
        assert result["idleAmount"] == "50000.00"
        assert result["suggestedSweep"] == "50000.00"

    def test_below_buffer(self):
        result = idle_cash("100000", "50000", 3, 30)
        assert result["idleAmount"] == "0.00"
        assert result["suggestedSweep"] == "0.00"

    def test_exact_buffer(self):
        result = idle_cash("150000", "50000", 3, 30)
        assert result["idleAmount"] == "0.00"
        assert result["suggestedSweep"] == "0.00"


# ─── Emergency Adequacy ──────────────────────────────────────────────


class TestEmergencyAdequacy:
    """Golden tests for emergency fund adequacy."""

    def test_adequate(self):
        result = emergency_adequacy("300000", "50000", 6)
        assert result["adequate"] is True
        assert result["shortfall"] == "0.00"
        assert result["monthsCovered"] == "6.0"

    def test_inadequate(self):
        result = emergency_adequacy("100000", "50000", 6)
        assert result["adequate"] is False
        assert result["shortfall"] == "200000.00"
        assert result["monthsCovered"] == "2.0"

    def test_zero_spend(self):
        result = emergency_adequacy("100000", "0", 6)
        assert result["adequate"] is True
        assert result["monthsCovered"] == "999.00"


# ─── Tax 80C Gap ─────────────────────────────────────────────────────


class TestTax80CGap:
    """Golden tests for 80C gap."""

    def test_partial_investment(self):
        result = tax_80c_gap("100000")
        assert result["invested"] == "100000"
        assert result["limit"] == "150000"
        assert result["remaining"] == "50000.00"

    def test_full_investment(self):
        result = tax_80c_gap("150000")
        assert result["remaining"] == "0.00"

    def test_over_investment(self):
        result = tax_80c_gap("200000")
        assert result["remaining"] == "0.00"

    def test_custom_limit(self):
        result = tax_80c_gap("50000", "100000")
        assert result["remaining"] == "50000.00"


# ─── ELSS Suggestion ─────────────────────────────────────────────────


class TestElssSuggestion:
    """Golden tests for ELSS suggestion."""

    def test_conservative(self):
        result = elss_suggestion("100000", "conservative")
        assert result["suggestedAmount"] == "50000.00"

    def test_moderate(self):
        result = elss_suggestion("100000", "moderate")
        assert result["suggestedAmount"] == "75000.00"

    def test_aggressive(self):
        result = elss_suggestion("100000", "aggressive")
        assert result["suggestedAmount"] == "100000.00"

    def test_zero_remaining(self):
        result = elss_suggestion("0", "moderate")
        assert result["suggestedAmount"] == "0.00"


# ─── XIRR ────────────────────────────────────────────────────────────


class TestXirr:
    """Golden tests for XIRR."""

    def test_golden_basic(self):
        """Simple 1-year 10% return (365-day convention)."""
        cashflows = [
            {"date": "2024-01-01", "amount": "-100000"},
            {"date": "2025-01-01", "amount": "110000"},
        ]
        result = xirr(cashflows)
        assert result == Decimal("9.97")

    def test_golden_multiyear(self):
        """3-year investment."""
        cashflows = [
            {"date": "2022-01-01", "amount": "-100000"},
            {"date": "2025-01-01", "amount": "133100"},
        ]
        result = xirr(cashflows)
        assert result == Decimal("9.99")

    def test_single_cashflow(self):
        """Insufficient data."""
        cashflows = [{"date": "2024-01-01", "amount": "-100000"}]
        result = xirr(cashflows)
        assert result == Decimal("0.00")

    def test_negative_return(self):
        """Loss scenario."""
        cashflows = [
            {"date": "2024-01-01", "amount": "-100000"},
            {"date": "2025-01-01", "amount": "90000"},
        ]
        result = xirr(cashflows)
        assert result < 0


# ─── CAGR ────────────────────────────────────────────────────────────


class TestCagr:
    """Golden tests for CAGR."""

    def test_golden_basic(self):
        """₹100000 → ₹133100 in 3 years = 10% CAGR."""
        result = cagr("100000", "133100", "3")
        assert result == Decimal("10.00")

    def test_golden_5year(self):
        """₹100000 → ₹161051 in 5 years = 10% CAGR."""
        result = cagr("100000", "161051", "5")
        assert result == Decimal("10.00")

    def test_zero_start(self):
        result = cagr("0", "100000", "5")
        assert result == Decimal("0.00")

    def test_zero_years(self):
        result = cagr("100000", "200000", "0")
        assert result == Decimal("0.00")


# ─── Surplus ─────────────────────────────────────────────────────────


class TestSurplus:
    """Golden tests for surplus calculation."""

    def test_golden_basic(self):
        """₹85000 income, ₹50000 recurring, ₹13000 discretionary."""
        result = surplus("85000", "50000", "13000")
        assert result["surplus"] == "22000.00"
        assert result["savingsRate"] == "25.88"

    def test_zero_income(self):
        result = surplus("0", "50000", "13000")
        assert result["surplus"] == "0.00"
        assert result["savingsRate"] == "0.00"

    def test_negative_surplus(self):
        """Income less than expenses → surplus floored at 0."""
        result = surplus("50000", "40000", "20000")
        assert result["surplus"] == "0.00"
        assert result["savingsRate"] == "0.00"


# ─── Savings Rate ────────────────────────────────────────────────────


class TestSavingsRate:
    """Golden tests for savings rate."""

    def test_golden_basic(self):
        """₹22000 surplus / ₹85000 income = 25.88%"""
        result = savings_rate("22000", "85000")
        assert result == Decimal("25.88")

    def test_zero_income(self):
        result = savings_rate("22000", "0")
        assert result == Decimal("0.00")

    def test_zero_surplus(self):
        result = savings_rate("0", "85000")
        assert result == Decimal("0.00")


# ─── Determinism Tests ───────────────────────────────────────────────


class TestDeterminism:
    """Verify identical inputs → identical output across all functions."""

    def test_sip_determinism(self):
        for _ in range(10):
            r = sip_future_value("5000", "12", 60)
            assert r == Decimal("412431.83")

    def test_goal_plan_determinism(self):
        for _ in range(10):
            r = goal_plan(
                "2500000", "2038-06-01", "11", "6", "150000", "11800", "2026-06-23"
            )
            assert r["requiredCorpus"] == "5030491.18"

    def test_xirr_determinism(self):
        cashflows = [
            {"date": "2024-01-01", "amount": "-100000"},
            {"date": "2025-01-01", "amount": "110000"},
        ]
        for _ in range(10):
            r = xirr(cashflows)
            assert r == Decimal("9.97")
