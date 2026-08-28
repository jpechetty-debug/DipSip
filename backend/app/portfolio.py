"""
Shared read helpers. Pulled out because funds.py, deployment.py, and the new
analytics/scheduler code all need "current NAV / drawdown / tier per fund"
and "the current threshold row as a dict" — this was being computed three
separate times before this refactor.
"""
from typing import Dict, List

from sqlalchemy.orm import Session

from . import models
from .scoring import compute_drawdown, tier_for


def thresholds_dict(db: Session) -> Dict[str, float]:
    row = db.query(models.Threshold).first()
    if not row:
        return {"watch": -5.0, "buy1": -8.0, "buy2": -15.0, "buy3": -25.0}
    return {"watch": row.watch, "buy1": row.buy1, "buy2": row.buy2, "buy3": row.buy3}


def regime_thresholds_dict(db: Session) -> Dict[str, float]:
    row = db.query(models.Threshold).first()
    if not row:
        return {"correction": -5.0, "bear": -10.0, "panic": -20.0}
    return {"correction": row.regime_correction, "bear": row.regime_bear, "panic": row.regime_panic}


def effective_thresholds_for_fund(fund: models.Fund, global_thresholds: Dict[str, float]) -> Dict[str, float]:
    """Per-fund threshold overrides, falling back to the global Threshold row
    for any tier the fund hasn't overridden. A fund with no overrides at all
    behaves exactly as before."""
    return {
        "watch": fund.threshold_watch if fund.threshold_watch is not None else global_thresholds["watch"],
        "buy1": fund.threshold_buy1 if fund.threshold_buy1 is not None else global_thresholds["buy1"],
        "buy2": fund.threshold_buy2 if fund.threshold_buy2 is not None else global_thresholds["buy2"],
        "buy3": fund.threshold_buy3 if fund.threshold_buy3 is not None else global_thresholds["buy3"],
    }


def fund_snapshot(db: Session, fund: models.Fund, thresholds: Dict[str, float] = None) -> dict:
    """Current NAV, drawdown %, and tier for one fund, as a plain dict.
    `thresholds` here is the GLOBAL default; the fund's own overrides (if any)
    are applied on top before computing its tier."""
    if thresholds is None:
        thresholds = thresholds_dict(db)
    effective = effective_thresholds_for_fund(fund, thresholds)
    last_nav_row = (
        db.query(models.NavLog)
        .filter_by(fund_id=fund.id)
        .order_by(models.NavLog.date.desc())
        .first()
    )
    current_nav = last_nav_row.nav if last_nav_row else fund.reference_high
    drawdown = compute_drawdown(current_nav, fund.reference_high) if (fund.reference_high and current_nav) else 0.0
    tier = tier_for(drawdown, effective)
    return {
        "id": fund.id,
        "name": fund.name,
        "scheme_code": fund.scheme_code,
        "target_weight": fund.target_weight,
        "current_value": fund.current_value,
        "reference_high": fund.reference_high,
        "reference_high_is_placeholder": fund.reference_high_is_placeholder,
        "current_nav": current_nav,
        "drawdown_pct": round(drawdown, 2),
        "tier": tier,
        "effective_thresholds": effective,
    }


def all_fund_snapshots(db: Session) -> List[dict]:
    thresholds = thresholds_dict(db)
    return [fund_snapshot(db, f, thresholds) for f in db.query(models.Fund).all()]
