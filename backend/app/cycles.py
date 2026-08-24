"""
Cycle lifecycle for both levels this tool tracks a "correction" at:
  - per-fund (DeploymentCycle): opens when a fund first drops below neutral,
    tracks the deepest drawdown reached and how much you've deployed into
    it during the cycle, closes when it's back to neutral.
  - portfolio-wide (RegimeCycle): same idea, driven by blended_drawdown()
    instead of any one fund's NAV.

Deliberately not storing "peak tier" / "peak regime" as columns — both are
fully derived from lowest_drawdown via tier_for()/regime_for(), so there's
nothing to keep in sync.
"""
from typing import Optional

from sqlalchemy.orm import Session

from . import models
from .regime import regime_for
from .scoring import tier_for


def ladder_cap_for_fund(fund: models.Fund, tier: str, cycle: Optional[models.DeploymentCycle]) -> Optional[float]:
    """Max additional ₹ this fund should receive right now, per its ladder
    budgets — or None (uncapped) if it's not currently in a dip, or no budget
    is configured for its current tier."""
    if tier == "neutral":
        return None
    budget = {
        "watch": fund.ladder_watch_budget,
        "buy1": fund.ladder_buy1_budget,
        "buy2": fund.ladder_buy2_budget,
        "buy3": fund.ladder_buy3_budget,
    }.get(tier)
    if budget is None:
        return None
    already_deployed = cycle.deployed_amount if cycle else 0.0
    return max(0.0, budget - already_deployed)


def recovery_pct(current_drawdown: float, lowest_drawdown: float) -> float:
    """0% at the cycle low, 100% back at the reference high. Clamped to
    [0, 100] since a new low pushes lowest_drawdown down too (see callers)."""
    if lowest_drawdown >= 0:
        return 100.0
    pct = (current_drawdown - lowest_drawdown) / (0 - lowest_drawdown) * 100
    return max(0.0, min(100.0, pct))


def update_fund_cycle(
    db: Session, fund: models.Fund, tier: str, drawdown: float, today: str
) -> Optional[models.DeploymentCycle]:
    cycle = (
        db.query(models.DeploymentCycle)
        .filter_by(fund_id=fund.id, status="active")
        .first()
    )
    if tier == "neutral":
        if cycle:
            cycle.status = "closed"
            cycle.closed_date = today
            db.commit()
        return None

    if not cycle:
        cycle = models.DeploymentCycle(
            fund_id=fund.id,
            started_date=today,
            started_tier=tier,
            lowest_drawdown=drawdown,
            deployed_amount=0.0,
            status="active",
        )
        db.add(cycle)
    elif drawdown < cycle.lowest_drawdown:
        cycle.lowest_drawdown = drawdown

    db.commit()
    db.refresh(cycle)
    return cycle


def update_regime_cycle(
    db: Session, regime: str, blended_dd: float, today: str
) -> Optional[models.RegimeCycle]:
    cycle = db.query(models.RegimeCycle).filter_by(status="active").first()
    if regime == "bull":
        if cycle:
            cycle.status = "closed"
            cycle.closed_date = today
            db.commit()
        return None

    if not cycle:
        cycle = models.RegimeCycle(
            started_date=today,
            started_regime=regime,
            lowest_blended_drawdown=blended_dd,
            status="active",
        )
        db.add(cycle)
    elif blended_dd < cycle.lowest_blended_drawdown:
        cycle.lowest_blended_drawdown = blended_dd

    db.commit()
    db.refresh(cycle)
    return cycle


def fund_cycle_out(cycle: models.DeploymentCycle, current_drawdown: float, thresholds: dict) -> dict:
    return {
        "id": cycle.id,
        "fund_id": cycle.fund_id,
        "started_date": cycle.started_date,
        "started_tier": cycle.started_tier,
        "peak_tier": tier_for(cycle.lowest_drawdown, thresholds),
        "lowest_drawdown": round(cycle.lowest_drawdown, 2),
        "deployed_amount": cycle.deployed_amount,
        "status": cycle.status,
        "closed_date": cycle.closed_date,
        "recovery_pct": round(recovery_pct(current_drawdown, cycle.lowest_drawdown), 1),
    }


def regime_cycle_out(cycle: models.RegimeCycle, current_blended_dd: float, regime_thresholds: dict) -> dict:
    return {
        "id": cycle.id,
        "started_date": cycle.started_date,
        "started_regime": cycle.started_regime,
        "peak_regime": regime_for(cycle.lowest_blended_drawdown, regime_thresholds),
        "lowest_blended_drawdown": round(cycle.lowest_blended_drawdown, 2),
        "status": cycle.status,
        "closed_date": cycle.closed_date,
        "recovery_pct": round(recovery_pct(current_blended_dd, cycle.lowest_blended_drawdown), 1),
    }
