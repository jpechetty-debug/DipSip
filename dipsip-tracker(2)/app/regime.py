"""
Portfolio-wide regime, derived from the SAME fund-level drawdowns you're
already tracking — weighted by current_value (i.e. your actual exposure),
not by any external benchmark index. This tool doesn't ingest Nifty/index
data, so "regime" here means "how deep is your own portfolio underwater",
not a market-wide call.
"""
from typing import Dict, List

REGIME_LABELS = {
    "bull": "Bull",
    "correction": "Correction",
    "bear": "Bear",
    "panic": "Panic",
}

REGIME_ORDER = {"bull": 0, "correction": 1, "bear": 2, "panic": 3}


def blended_drawdown(funds: List[dict]) -> float:
    """Value-weighted average drawdown %% across funds. `funds` need
    `current_value` and `drawdown_pct` keys (fits portfolio.fund_snapshot)."""
    total = sum(f["current_value"] for f in funds)
    if not total:
        return 0.0
    return sum(f["current_value"] * f["drawdown_pct"] for f in funds) / total


def regime_for(drawdown_pct: float, thresholds: Dict[str, float]) -> str:
    """thresholds: {'correction': -5, 'bear': -10, 'panic': -20} (negative numbers)."""
    if drawdown_pct <= thresholds["panic"]:
        return "panic"
    if drawdown_pct <= thresholds["bear"]:
        return "bear"
    if drawdown_pct <= thresholds["correction"]:
        return "correction"
    return "bull"
