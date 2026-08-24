"""
Sanity tests for the pure logic (scoring + split). No network, no DB — safe
to run anywhere. Run with: python tests/test_logic.py
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.cycles import recovery_pct
from app.deployment import compute_split, compute_split_with_caps
from app.market_data import parse_navall
from app.regime import blended_drawdown, regime_for
from app.scoring import compute_drawdown, tier_for
from app.xirr import xirr

THRESHOLDS = {"watch": -5, "buy1": -8, "buy2": -15, "buy3": -25}
REGIME_THRESHOLDS = {"correction": -5, "bear": -10, "panic": -20}


def test_tier_for():
    assert tier_for(-2, THRESHOLDS) == "neutral"
    assert tier_for(-5, THRESHOLDS) == "watch"
    assert tier_for(-6, THRESHOLDS) == "watch"
    assert tier_for(-8, THRESHOLDS) == "buy1"
    assert tier_for(-10, THRESHOLDS) == "buy1"
    assert tier_for(-15, THRESHOLDS) == "buy2"
    assert tier_for(-20, THRESHOLDS) == "buy2"
    assert tier_for(-25, THRESHOLDS) == "buy3"
    assert tier_for(-30, THRESHOLDS) == "buy3"


def test_compute_drawdown():
    assert round(compute_drawdown(90, 100), 2) == -10.0
    assert compute_drawdown(100, 0) == 0.0  # guards against div-by-zero


def test_compute_split_favors_underweight_and_dipping():
    funds = [
        {"id": 1, "name": "A (overweight, flat)", "current_value": 150000, "target_weight": 40, "drawdown_pct": -2},
        {"id": 2, "name": "B (underweight, deep dip)", "current_value": 24000, "target_weight": 30, "drawdown_pct": -18},
        {"id": 3, "name": "C (underweight, flat)", "current_value": 28000, "target_weight": 30, "drawdown_pct": 0},
    ]
    result = compute_split(10000, funds, THRESHOLDS)
    allocations = result["allocations"]

    assert sum(allocations.values()) == 10000
    assert allocations.get(1, 0) == 0  # overweight fund excluded
    assert allocations[2] > allocations[3]  # deeper dip wins a bigger share
    assert allocations[2] == 6274 and allocations[3] == 3726


def test_compute_split_even_fallback_when_nothing_underweight():
    funds = [
        {"id": 1, "name": "A", "current_value": 100, "target_weight": 30, "drawdown_pct": 0},
        {"id": 2, "name": "B", "current_value": 100, "target_weight": 30, "drawdown_pct": -20},
        {"id": 3, "name": "C", "current_value": 100, "target_weight": 30, "drawdown_pct": 0},
    ]
    result = compute_split(9000, funds, THRESHOLDS)
    assert sum(result["allocations"].values()) == 9000
    assert result["allocations"] == {1: 3000, 2: 3000, 3: 3000}


def test_parse_navall_sample():
    sample = (
        "Open Ended Schemes(Equity)\n"
        "\n"
        "Scheme Code;ISIN Div Payout/ISIN Growth;ISIN Div Reinvestment;Scheme Name;Net Asset Value;Date\n"
        "119598;INF090I01239;-;Some AMC - Direct Growth Plan;123.4567;20-Aug-2026\n"
        "not_a_code;;;Header junk;;\n"
        "\n"
        "120468;INF090I01247;-;Some AMC - Regular Growth Plan;110.1234;20-Aug-2026\n"
    )
    records = parse_navall(sample)
    assert len(records) == 2
    assert records[0]["scheme_code"] == "119598"
    assert records[0]["nav"] == 123.4567
    assert records[1]["scheme_name"] == "Some AMC - Regular Growth Plan"


def test_compute_split_with_caps_redistributes_and_reports_leftover():
    funds = [
        {"id": 1, "name": "A", "current_value": 150000, "target_weight": 40, "drawdown_pct": -2},
        {"id": 2, "name": "B", "current_value": 24000, "target_weight": 30, "drawdown_pct": -18},
        {"id": 3, "name": "C", "current_value": 28000, "target_weight": 30, "drawdown_pct": 0},
    ]
    uncapped = compute_split_with_caps(10000, funds, THRESHOLDS, {})
    assert uncapped["allocations"] == compute_split(10000, funds, THRESHOLDS)["allocations"]
    assert uncapped["leftover_unallocated"] == 0

    capped = compute_split_with_caps(10000, funds, THRESHOLDS, {2: 2000})
    assert capped["allocations"][2] == 2000
    assert sum(capped["allocations"].values()) == 10000  # fully redistributed to C

    tight = compute_split_with_caps(10000, funds, THRESHOLDS, {2: 500, 3: 500})
    assert tight["allocations"] == {2: 500, 3: 500}
    assert tight["leftover_unallocated"] == 9000  # nowhere left to put it — reported, not lost


def test_xirr_simple_known_rate():
    # ₹100 invested, worth ₹110 exactly 365 days later == 10% annualized
    rate = xirr([("2025-01-01", -100.0), ("2026-01-01", 110.0)])
    assert abs(rate - 0.10) < 0.001


def test_xirr_requires_both_signs():
    try:
        xirr([("2025-01-01", 100.0), ("2026-01-01", 110.0)])
        assert False, "should have raised"
    except ValueError:
        pass


def test_regime_for_bands():
    assert regime_for(-2, REGIME_THRESHOLDS) == "bull"
    assert regime_for(-5, REGIME_THRESHOLDS) == "correction"
    assert regime_for(-10, REGIME_THRESHOLDS) == "bear"
    assert regime_for(-20, REGIME_THRESHOLDS) == "panic"


def test_blended_drawdown_is_value_weighted():
    funds = [
        {"current_value": 90, "drawdown_pct": 0},
        {"current_value": 10, "drawdown_pct": -50},
    ]
    # 90% of the money at 0% dd, 10% at -50% dd -> -5% blended
    assert abs(blended_drawdown(funds) - (-5.0)) < 0.001


def test_recovery_pct_bounds_and_midpoint():
    assert recovery_pct(-18, -18) == 0.0     # at the cycle low
    assert recovery_pct(0, -18) == 100.0     # fully back to the high
    assert abs(recovery_pct(-9, -18) - 50.0) < 0.001
    assert recovery_pct(5, -18) == 100.0     # clamps, doesn't go past 100


if __name__ == "__main__":
    test_tier_for()
    test_compute_drawdown()
    test_compute_split_favors_underweight_and_dipping()
    test_compute_split_even_fallback_when_nothing_underweight()
    test_parse_navall_sample()
    test_compute_split_with_caps_redistributes_and_reports_leftover()
    test_xirr_simple_known_rate()
    test_xirr_requires_both_signs()
    test_regime_for_bands()
    test_blended_drawdown_is_value_weighted()
    test_recovery_pct_bounds_and_midpoint()
    print("All tests passed.")
