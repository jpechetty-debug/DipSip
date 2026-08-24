from typing import Dict

TIER_LABELS = {
    "neutral": "On track",
    "watch": "Watch",
    "buy1": "Buy tier 1",
    "buy2": "Buy tier 2",
    "buy3": "Buy tier 3",
}

# Depth ordering, deepest last — used to tell whether a cycle has gotten worse.
TIER_ORDER = {"neutral": 0, "watch": 1, "buy1": 2, "buy2": 3, "buy3": 4}


def tier_for(drawdown_pct: float, thresholds: Dict[str, float]) -> str:
    """thresholds are negative numbers, e.g. {'watch': -5, 'buy1': -8, ...}."""
    if drawdown_pct <= thresholds["buy3"]:
        return "buy3"
    if drawdown_pct <= thresholds["buy2"]:
        return "buy2"
    if drawdown_pct <= thresholds["buy1"]:
        return "buy1"
    if drawdown_pct <= thresholds["watch"]:
        return "watch"
    return "neutral"


def compute_drawdown(current_nav: float, reference_high: float) -> float:
    if not reference_high:
        return 0.0
    return ((current_nav - reference_high) / reference_high) * 100
