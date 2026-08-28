from datetime import date
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models
from ..auth import require_api_key
from ..cycles import fund_cycle_out, regime_cycle_out
from ..database import get_db
from ..portfolio import (
    all_fund_snapshots,
    effective_thresholds_for_fund,
    fund_snapshot,
    regime_thresholds_dict,
    thresholds_dict,
)
from ..regime import REGIME_LABELS, blended_drawdown, regime_for
from ..xirr import xirr

router = APIRouter(tags=["analytics"], dependencies=[Depends(require_api_key)])


def _fund_cashflows(db: Session, fund: models.Fund) -> List[tuple]:
    flows = []
    if fund.seed_value:
        flows.append((fund.seed_date or str(fund.created_at.date()), -fund.seed_value))
    items = (
        db.query(models.DeploymentItem)
        .join(models.Deployment)
        .filter(models.DeploymentItem.fund_id == fund.id)
        .all()
    )
    for item in items:
        flows.append((item.deployment.date, -item.amount))
    return flows


@router.get("/funds/{fund_id}/xirr")
def fund_xirr(fund_id: int, db: Session = Depends(get_db)):
    fund = db.get(models.Fund, fund_id)
    if not fund:
        raise HTTPException(404, "Fund not found")

    flows = _fund_cashflows(db, fund)
    today = str(date.today())
    flows.append((today, fund.current_value))

    try:
        rate = xirr(flows)
    except ValueError as e:
        return {"fund_id": fund.id, "xirr": None, "as_of": today, "note": str(e)}
    return {"fund_id": fund.id, "xirr_pct": round(rate * 100, 2), "as_of": today, "cashflow_count": len(flows)}


@router.get("/portfolio/xirr")
def portfolio_xirr(db: Session = Depends(get_db)):
    funds = db.query(models.Fund).all()
    if not funds:
        raise HTTPException(400, "No funds configured yet")

    flows = []
    total_current_value = 0.0
    for fund in funds:
        flows.extend(_fund_cashflows(db, fund))
        total_current_value += fund.current_value

    today = str(date.today())
    flows.append((today, total_current_value))

    try:
        rate = xirr(flows)
    except ValueError as e:
        return {"xirr": None, "as_of": today, "note": str(e)}
    return {"xirr_pct": round(rate * 100, 2), "as_of": today, "cashflow_count": len(flows)}


@router.get("/portfolio/regime")
def portfolio_regime(db: Session = Depends(get_db)):
    snapshots = all_fund_snapshots(db)
    if not snapshots:
        raise HTTPException(400, "No funds configured yet")

    blended_dd = round(blended_drawdown(snapshots), 2)
    regime_thresholds = regime_thresholds_dict(db)
    regime = regime_for(blended_dd, regime_thresholds)

    cycle = db.query(models.RegimeCycle).filter_by(status="active").first()
    out = {
        "regime": regime,
        "regime_label": REGIME_LABELS[regime],
        "blended_drawdown_pct": blended_dd,
    }
    if cycle:
        out["cycle"] = regime_cycle_out(cycle, blended_dd, regime_thresholds)
    return out


@router.get("/opportunity-score")
def opportunity_score(db: Session = Depends(get_db)):
    snapshots = all_fund_snapshots(db)
    if not snapshots:
        return {"score": 0}

    blended_dd = blended_drawdown(snapshots)
    regime_thresholds = regime_thresholds_dict(db)
    panic = regime_thresholds["panic"]  # negative number
    
    # panic is e.g. -20, blended_dd is e.g. -10
    # ratio = -10 / -20 = 0.5 -> 50 score
    if panic >= 0 or blended_dd >= 0:
        score = 0
    else:
        score = min(100, max(0, int((blended_dd / panic) * 100)))

    return {"score": score}


@router.get("/funds/{fund_id}/cycle")
def fund_cycle(fund_id: int, db: Session = Depends(get_db)):
    fund = db.get(models.Fund, fund_id)
    if not fund:
        raise HTTPException(404, "Fund not found")

    cycle = db.query(models.DeploymentCycle).filter_by(fund_id=fund_id, status="active").first()
    if not cycle:
        return {"fund_id": fund_id, "active_cycle": None}

    thresholds = effective_thresholds_for_fund(fund, thresholds_dict(db))
    snap = fund_snapshot(db, fund, thresholds_dict(db))
    return {"fund_id": fund_id, "active_cycle": fund_cycle_out(cycle, snap["drawdown_pct"], thresholds)}


@router.get("/funds/{fund_id}/cycles")
def fund_cycle_history(fund_id: int, db: Session = Depends(get_db)):
    fund = db.get(models.Fund, fund_id)
    if not fund:
        raise HTTPException(404, "Fund not found")

    thresholds = effective_thresholds_for_fund(fund, thresholds_dict(db))
    snap = fund_snapshot(db, fund, thresholds_dict(db))
    cycles = (
        db.query(models.DeploymentCycle)
        .filter_by(fund_id=fund_id)
        .order_by(models.DeploymentCycle.started_date.desc())
        .all()
    )
    # A closed cycle exited because the fund reached "neutral" — we didn't
    # snapshot the exact drawdown at that moment, but neutral means it's
    # recovered, so treat it as 0% drawdown (100% recovered) for display.
    return [
        fund_cycle_out(c, snap["drawdown_pct"] if c.status == "active" else 0.0, thresholds)
        for c in cycles
    ]
