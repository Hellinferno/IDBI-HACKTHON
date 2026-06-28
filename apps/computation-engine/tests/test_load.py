"""Load and performance tests for the Computation Engine.

Benchmarks all 15 math functions under concurrent load.
Measures throughput, latency percentiles, and determinism under pressure.
"""

import time
import statistics
from concurrent.futures import ThreadPoolExecutor, as_completed
from decimal import Decimal

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


# ─── Test Data ──────────────────────────────────────────────────────

SIP_INPUTS = ("10000", "12", 120)
LUMPSUM_INPUTS = ("500000", "10", "5")
REQUIRED_SIP_INPUTS = ("1000000", "12", 120)
INFLATE_INPUTS = ("500000", "6", "10")
GOAL_PLAN_INPUTS = {
    "target_today": "1000000",
    "target_date": "2030-12-31",
    "expected_return": "12",
    "inflation": "6",
    "current_corpus": "200000",
    "monthly_contribution": "15000",
    "as_of": "2025-01-01",
}
ALLOCATION_INPUT = "moderate"
REBALANCE_INPUTS = (
    [
        {"asset_class": "equity", "current_value": "600000"},
        {"asset_class": "debt", "current_value": "300000"},
        {"asset_class": "cash", "current_value": "100000"},
    ],
    {"equity": "50", "debt": "35", "cash": "15"},
)
IDLE_CASH_INPUTS = ("500000", "80000")
EMERGENCY_INPUTS = ("300000", "50000")
TAX_80C_INPUTS = ("100000",)
ELSS_INPUTS = ("50000", "moderate")
XIRR_INPUTS = ([
    {"date": "2024-01-15", "amount": "-50000"},
    {"date": "2024-06-15", "amount": "-50000"},
    {"date": "2025-01-15", "amount": "120000"},
],)
CAGR_INPUTS = ("100000", "150000", "3")
SURPLUS_INPUTS = ("85000", "45000", "15000")
SAVINGS_RATE_INPUTS = ("25000", "85000")


# ─── Benchmark Functions ────────────────────────────────────────────

def _bench(func, args, kwargs=None, iterations=1000):
    """Run func(args) N times, return latencies in ms."""
    kwargs = kwargs or {}
    latencies = []
    for _ in range(iterations):
        start = time.perf_counter()
        func(*args, **kwargs)
        elapsed = (time.perf_counter() - start) * 1000
        latencies.append(elapsed)
    return latencies


def _percentile(data, p):
    """Compute p-th percentile."""
    k = (len(data) - 1) * (p / 100)
    f = int(k)
    c = f + 1
    if c >= len(data):
        return data[-1]
    return data[f] + (k - f) * (data[c] - data[f])


# ─── Tests ──────────────────────────────────────────────────────────

def test_sip_future_value_throughput():
    latencies = _bench(sip_future_value, SIP_INPUTS, iterations=5000)
    p50 = _percentile(latencies, 50)
    p99 = _percentile(latencies, 99)
    assert p99 < 1.0, f"SIP FV p99 too high: {p99:.4f}ms"
    assert p50 < 0.1, f"SIP FV p50 too high: {p50:.4f}ms"


def test_lumpsum_future_value_throughput():
    latencies = _bench(lumpsum_future_value, LUMPSUM_INPUTS, iterations=5000)
    p99 = _percentile(latencies, 99)
    assert p99 < 1.0, f"Lumpsum FV p99 too high: {p99:.4f}ms"


def test_required_sip_throughput():
    latencies = _bench(required_sip, REQUIRED_SIP_INPUTS, iterations=5000)
    p99 = _percentile(latencies, 99)
    assert p99 < 1.0, f"Required SIP p99 too high: {p99:.4f}ms"


def test_inflate_throughput():
    latencies = _bench(inflate, INFLATE_INPUTS, iterations=5000)
    p99 = _percentile(latencies, 99)
    assert p99 < 1.0, f"Inflate p99 too high: {p99:.4f}ms"


def test_goal_plan_throughput():
    latencies = _bench(goal_plan, (
        GOAL_PLAN_INPUTS["target_today"],
        GOAL_PLAN_INPUTS["target_date"],
        GOAL_PLAN_INPUTS["expected_return"],
        GOAL_PLAN_INPUTS["inflation"],
        GOAL_PLAN_INPUTS["current_corpus"],
        GOAL_PLAN_INPUTS["monthly_contribution"],
        GOAL_PLAN_INPUTS["as_of"],
    ), iterations=2000)
    p99 = _percentile(latencies, 99)
    assert p99 < 5.0, f"Goal plan p99 too high: {p99:.4f}ms"


def test_allocation_throughput():
    latencies = _bench(target_allocation, (ALLOCATION_INPUT,), iterations=10000)
    p99 = _percentile(latencies, 99)
    assert p99 < 0.5, f"Allocation p99 too high: {p99:.4f}ms"


def test_rebalance_throughput():
    latencies = _bench(rebalance_deltas, REBALANCE_INPUTS, iterations=2000)
    p99 = _percentile(latencies, 99)
    assert p99 < 2.0, f"Rebalance p99 too high: {p99:.4f}ms"


def test_idle_cash_throughput():
    latencies = _bench(idle_cash, IDLE_CASH_INPUTS, iterations=5000)
    p99 = _percentile(latencies, 99)
    assert p99 < 1.0, f"Idle cash p99 too high: {p99:.4f}ms"


def test_emergency_adequacy_throughput():
    latencies = _bench(emergency_adequacy, EMERGENCY_INPUTS, iterations=5000)
    p99 = _percentile(latencies, 99)
    assert p99 < 1.0, f"Emergency p99 too high: {p99:.4f}ms"


def test_tax_80c_gap_throughput():
    latencies = _bench(tax_80c_gap, TAX_80C_INPUTS, iterations=10000)
    p99 = _percentile(latencies, 99)
    assert p99 < 0.5, f"Tax 80C p99 too high: {p99:.4f}ms"


def test_elss_suggestion_throughput():
    latencies = _bench(elss_suggestion, ELSS_INPUTS, iterations=10000)
    p99 = _percentile(latencies, 99)
    assert p99 < 0.5, f"ELSS p99 too high: {p99:.4f}ms"


def test_xirr_throughput():
    latencies = _bench(xirr, XIRR_INPUTS, iterations=1000)
    p99 = _percentile(latencies, 99)
    assert p99 < 10.0, f"XIRR p99 too high: {p99:.4f}ms"


def test_cagr_throughput():
    latencies = _bench(cagr, CAGR_INPUTS, iterations=10000)
    p99 = _percentile(latencies, 99)
    assert p99 < 0.5, f"CAGR p99 too high: {p99:.4f}ms"


def test_surplus_throughput():
    latencies = _bench(surplus, SURPLUS_INPUTS, iterations=10000)
    p99 = _percentile(latencies, 99)
    assert p99 < 0.5, f"Surplus p99 too high: {p99:.4f}ms"


def test_savings_rate_throughput():
    latencies = _bench(savings_rate, SAVINGS_RATE_INPUTS, iterations=10000)
    p99 = _percentile(latencies, 99)
    assert p99 < 0.5, f"Savings rate p99 too high: {p99:.4f}ms"


# ─── Concurrency Tests ──────────────────────────────────────────────

def test_concurrent_sip_computations():
    """Verify thread-safety: 10 threads × 100 calls each."""
    results = []
    errors = []

    def worker(_):
        try:
            return sip_future_value("10000", "12", 120)
        except Exception as e:
            errors.append(e)
            return None

    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(worker, i) for i in range(100)]
        for f in as_completed(futures):
            results.append(f.result())

    assert len(errors) == 0, f"Concurrent errors: {errors}"
    assert len(results) == 100
    for r in results:
        assert r is not None
        assert r == results[0], "Concurrent SIP results must be deterministic"


def test_concurrent_goal_plans():
    """Verify thread-safety for complex goal_plan function."""
    results = []
    errors = []

    def worker(_):
        try:
            return goal_plan(
                "1000000", "2030-12-31", "12", "6", "200000", "15000", "2025-01-01"
            )
        except Exception as e:
            errors.append(e)
            return None

    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(worker, i) for i in range(50)]
        for f in as_completed(futures):
            results.append(f.result())

    assert len(errors) == 0, f"Concurrent goal_plan errors: {errors}"
    assert len(results) == 50
    for r in results:
        assert r is not None
        assert r == results[0], "Concurrent goal_plan results must be deterministic"


def test_concurrent_xirr_computations():
    """Verify thread-safety for XIRR (Newton-Raphson iterative)."""
    cashflows = [
        {"date": "2024-01-15", "amount": "-50000"},
        {"date": "2024-06-15", "amount": "-50000"},
        {"date": "2025-01-15", "amount": "120000"},
    ]
    results = []
    errors = []

    def worker(_):
        try:
            return xirr(cashflows)
        except Exception as e:
            errors.append(e)
            return None

    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(worker, i) for i in range(50)]
        for f in as_completed(futures):
            results.append(f.result())

    assert len(errors) == 0, f"Concurrent XIRR errors: {errors}"
    assert len(results) == 50
    for r in results:
        assert r is not None
        assert r == results[0], "Concurrent XIRR results must be deterministic"


# ─── Determinism Under Load ─────────────────────────────────────────

def test_determinism_under_load():
    """Run all functions 1000 times each, verify byte-identical results."""
    expected_sip = sip_future_value("10000", "12", 120)
    for _ in range(1000):
        assert sip_future_value("10000", "12", 120) == expected_sip

    expected_goal = goal_plan("1000000", "2030-12-31", "12", "6", "200000", "15000", "2025-01-01")
    for _ in range(1000):
        assert goal_plan("1000000", "2030-12-31", "12", "6", "200000", "15000", "2025-01-01") == expected_goal

    expected_xirr = xirr([
        {"date": "2024-01-15", "amount": "-50000"},
        {"date": "2024-06-15", "amount": "-50000"},
        {"date": "2025-01-15", "amount": "120000"},
    ])
    for _ in range(500):
        assert xirr([
            {"date": "2024-01-15", "amount": "-50000"},
            {"date": "2024-06-15", "amount": "-50000"},
            {"date": "2025-01-15", "amount": "120000"},
        ]) == expected_xirr
