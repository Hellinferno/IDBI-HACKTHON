"""API contract tests for the Computation Engine.

Tests verify HTTP surface matches file 06/08 contracts.
"""

import pytest
from fastapi.testclient import TestClient
from engine.app import app

client = TestClient(app)


class TestHealth:
    def test_health(self):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


class TestSipFV:
    def test_sip_fv(self):
        response = client.post(
            "/compute/sip-future-value",
            json={"monthly": "5000", "annual_return": "12", "months": 12},
        )
        assert response.status_code == 200
        assert response.json()["result"] == "64046.64"

    def test_sip_fv_invalid(self):
        response = client.post(
            "/compute/sip-future-value",
            json={"monthly": "abc", "annual_return": "12", "months": 12},
        )
        assert response.status_code == 422


class TestLumpsumFV:
    def test_lumpsum_fv(self):
        response = client.post(
            "/compute/lumpsum-future-value",
            json={"principal": "100000", "annual_return": "10", "years": "5"},
        )
        assert response.status_code == 200
        assert response.json()["result"] == "161051.00"


class TestRequiredSip:
    def test_required_sip(self):
        response = client.post(
            "/compute/required-sip",
            json={"target_corpus": "1000000", "annual_return": "12", "months": 60},
        )
        assert response.status_code == 200
        assert response.json()["result"] == "12123.22"


class TestInflate:
    def test_inflate(self):
        response = client.post(
            "/compute/inflate",
            json={"present_amount": "100000", "inflation": "6", "years": "10"},
        )
        assert response.status_code == 200
        assert response.json()["result"] == "179084.77"


class TestGoalPlan:
    def test_goal_plan(self):
        response = client.post(
            "/compute/goal-plan",
            json={
                "target_today": "2500000",
                "target_date": "2038-06-01",
                "expected_return": "11",
                "inflation": "6",
                "current_corpus": "150000",
                "monthly_contribution": "11800",
                "as_of": "2026-06-23",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "requiredCorpus" in data
        assert "projectedCorpus" in data
        assert "gap" in data
        assert "onTrack" in data
        assert "assumptions" in data
        assert "steps" in data


class TestAllocation:
    def test_allocation(self):
        response = client.post(
            "/compute/allocation", json={"risk_band": "moderate"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["equity"] == "50"
        assert data["debt"] == "35"
        assert data["cash"] == "15"

    def test_allocation_invalid(self):
        response = client.post(
            "/compute/allocation", json={"risk_band": "invalid"}
        )
        assert response.status_code == 422


class TestRebalance:
    def test_rebalance(self):
        response = client.post(
            "/compute/rebalance",
            json={
                "holdings": [
                    {"asset_class": "equity", "current_value": "800000"},
                    {"asset_class": "debt", "current_value": "150000"},
                    {"asset_class": "cash", "current_value": "50000"},
                ],
                "target_allocation": {"equity": "50", "debt": "35", "cash": "15"},
                "drift_threshold": "5",
            },
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)


class TestIdleCash:
    def test_idle_cash(self):
        response = client.post(
            "/compute/idle-cash",
            json={
                "balance": "200000",
                "avg_monthly_outflow": "50000",
                "buffer_months": 3,
                "idle_days": 30,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["suggestedSweep"] == "50000.00"


class TestEmergencyAdequacy:
    def test_emergency(self):
        response = client.post(
            "/compute/emergency-adequacy",
            json={
                "liquid_assets": "300000",
                "monthly_essential_spend": "50000",
                "target_months": 6,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["adequate"] is True


class TestTax80CGap:
    def test_tax_80c(self):
        response = client.post(
            "/compute/tax-80c-gap", json={"invested_80c": "100000"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["remaining"] == "50000.00"


class TestElssSuggestion:
    def test_elss(self):
        response = client.post(
            "/compute/elss-suggestion",
            json={"remaining_80c": "100000", "risk_band": "moderate"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["suggestedAmount"] == "75000.00"


class TestXirr:
    def test_xirr(self):
        response = client.post(
            "/compute/xirr",
            json={
                "cashflows": [
                    {"date": "2024-01-01", "amount": "-100000"},
                    {"date": "2025-01-01", "amount": "110000"},
                ]
            },
        )
        assert response.status_code == 200
        assert response.json()["result"] == "9.97"


class TestCagr:
    def test_cagr(self):
        response = client.post(
            "/compute/cagr",
            json={"start_value": "100000", "end_value": "161051", "years": "5"},
        )
        assert response.status_code == 200
        assert response.json()["result"] == "10.00"


class TestSurplus:
    def test_surplus(self):
        response = client.post(
            "/compute/surplus",
            json={
                "income": "85000",
                "recurring_outflow": "50000",
                "discretionary_outflow": "13000",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["surplus"] == "22000.00"
        assert data["savingsRate"] == "25.88"


class TestSavingsRate:
    def test_savings_rate(self):
        response = client.post(
            "/compute/savings-rate",
            json={"surplus": "22000", "income": "85000"},
        )
        assert response.status_code == 200
        assert response.json()["result"] == "25.88"
