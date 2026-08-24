from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import require_api_key
from ..cycles import ladder_cap_for_fund
from ..database import get_db
from ..deployment import compute_split_with_caps
from ..portfolio import all_fund_snapshots, thresholds_dict

router = APIRouter(prefix="/deployment", tags=["deployment"], dependencies=[Depends(require_api_key)])


def _get_cash(db: Session) -> models.CashReserve:
    row = db.query(models.CashReserve).first()
    if not row:
        row = models.CashReserve()
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


def _available_cash(cash: models.CashReserve) -> float:
    return max(0.0, cash.total_cash - cash.emergency_reserve)


def _caps_for_funds(db: Session, snapshots: list) -> dict:
    """Ladder-cycle caps per fund, using each fund's active DeploymentCycle
    (if any). Funds with no ladder budget configured, or currently neutral,
    are simply absent from the returned dict (uncapped)."""
    caps = {}
    for snap in snapshots:
        fund = db.get(models.Fund, snap["id"])
        cycle = db.query(models.DeploymentCycle).filter_by(fund_id=fund.id, status="active").first()
        cap = ladder_cap_for_fund(fund, snap["tier"], cycle)
        if cap is not None:
            caps[snap["id"]] = cap
    return caps


@router.post("/recommendation")
def recommendation(payload: schemas.DeploymentRequest, db: Session = Depends(get_db)):
    snapshots = all_fund_snapshots(db)
    if not snapshots:
        raise HTTPException(400, "No funds configured yet")

    thresholds = thresholds_dict(db)
    caps = _caps_for_funds(db, snapshots)
    result = compute_split_with_caps(payload.amount, snapshots, thresholds, caps)

    cash = _get_cash(db)
    available = _available_cash(cash)
    result["cash_check"] = {
        "available_cash": available,
        "amount_requested": payload.amount,
        "sufficient": available >= payload.amount,
    }
    return result


@router.post("/log")
def log_deployment(payload: schemas.DeploymentLogRequest, db: Session = Depends(get_db)):
    snapshots = all_fund_snapshots(db)
    if not snapshots:
        raise HTTPException(400, "No funds configured yet")

    cash = _get_cash(db)
    available = _available_cash(cash)
    if not payload.force and payload.amount > available:
        raise HTTPException(
            400,
            f"Amount (₹{payload.amount:,.0f}) exceeds available deployable cash "
            f"(₹{available:,.0f}, after emergency reserve). Pass force=true to override.",
        )

    thresholds = thresholds_dict(db)
    caps = _caps_for_funds(db, snapshots)
    result = compute_split_with_caps(payload.amount, snapshots, thresholds, caps)

    today = str(date.today())
    deployment = models.Deployment(date=today, amount=payload.amount, notes=payload.notes)
    db.add(deployment)
    db.flush()  # need deployment.id before creating items

    for fund_id, amt in result["allocations"].items():
        if amt <= 0:
            continue
        db.add(models.DeploymentItem(deployment_id=deployment.id, fund_id=fund_id, amount=amt))
        fund = db.get(models.Fund, fund_id)
        fund.current_value += amt

        # Credit this deployment against the fund's active cycle, if any.
        cycle = db.query(models.DeploymentCycle).filter_by(fund_id=fund_id, status="active").first()
        if cycle:
            cycle.deployed_amount += amt

    actually_deployed = sum(a for a in result["allocations"].values() if a > 0)
    cash.total_cash -= actually_deployed

    db.commit()
    return {
        "ok": True,
        "deployment_id": deployment.id,
        "allocations": result["allocations"],
        "leftover_unallocated": result["leftover_unallocated"],
        "remaining_available_cash": _available_cash(cash),
    }


@router.get("/history")
def deployment_history(db: Session = Depends(get_db)):
    deployments = db.query(models.Deployment).order_by(models.Deployment.date.desc()).all()
    return [
        {
            "id": d.id,
            "date": d.date,
            "amount": d.amount,
            "notes": d.notes,
            "items": [{"fund_id": i.fund_id, "amount": i.amount} for i in d.items],
        }
        for d in deployments
    ]
