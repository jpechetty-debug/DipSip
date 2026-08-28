from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..alerts import maybe_create_alert
from ..auth import require_api_key
from ..cycles import update_fund_cycle, update_regime_cycle
from ..database import get_db
from ..portfolio import all_fund_snapshots, effective_thresholds_for_fund, regime_thresholds_dict, thresholds_dict
from ..regime import blended_drawdown, regime_for
from ..scoring import compute_drawdown, tier_for

router = APIRouter(prefix="/nav", tags=["nav"], dependencies=[Depends(require_api_key)])


@router.post("")
def log_nav(payload: schemas.NavLogCreate, db: Session = Depends(get_db)):
    fund = db.get(models.Fund, payload.fund_id)
    if not fund:
        raise HTTPException(404, "Fund not found")

    log_date = payload.date or str(date.today())
    existing = db.query(models.NavLog).filter_by(fund_id=fund.id, date=log_date).first()
    if existing:
        existing.nav = payload.nav
    else:
        db.add(models.NavLog(fund_id=fund.id, date=log_date, nav=payload.nav, source="manual"))

    if not fund.reference_high or payload.nav > fund.reference_high:
        fund.reference_high = payload.nav
        fund.reference_high_is_placeholder = False
    db.commit()

    thresholds = effective_thresholds_for_fund(fund, thresholds_dict(db))
    drawdown = compute_drawdown(payload.nav, fund.reference_high)
    tier = tier_for(drawdown, thresholds)
    maybe_create_alert(db, fund, tier, drawdown)
    update_fund_cycle(db, fund, tier, drawdown, log_date)

    # Any single fund's NAV changing shifts the portfolio's blended drawdown,
    # so the regime cycle needs to be re-evaluated across ALL funds too.
    snapshots = all_fund_snapshots(db)
    blended_dd = blended_drawdown(snapshots)
    regime_thresholds = regime_thresholds_dict(db)
    regime = regime_for(blended_dd, regime_thresholds)
    update_regime_cycle(db, regime, blended_dd, log_date)

    return {"ok": True, "drawdown_pct": round(drawdown, 2), "tier": tier, "regime": regime}


@router.get("/{fund_id}/history")
def nav_history(fund_id: int, db: Session = Depends(get_db)):
    fund = db.get(models.Fund, fund_id)
    if not fund:
        raise HTTPException(404, "Fund not found")
    return (
        db.query(models.NavLog)
        .filter_by(fund_id=fund_id)
        .order_by(models.NavLog.date.desc())
        .all()
    )
