from datetime import date
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import require_api_key
from ..database import get_db
from ..market_data import search_schemes
from ..portfolio import fund_snapshot, thresholds_dict

router = APIRouter(prefix="/funds", tags=["funds"], dependencies=[Depends(require_api_key)])


def _fund_to_out(db: Session, fund: models.Fund, thresholds: dict) -> schemas.FundOut:
    snap = fund_snapshot(db, fund, thresholds)
    return schemas.FundOut(
        id=snap["id"],
        name=snap["name"],
        scheme_code=snap["scheme_code"],
        target_weight=snap["target_weight"],
        current_value=snap["current_value"],
        reference_high=snap["reference_high"],
        reference_high_is_placeholder=snap["reference_high_is_placeholder"],
        current_nav=snap["current_nav"],
        drawdown_pct=snap["drawdown_pct"],
        tier=snap["tier"],
        seed_value=fund.seed_value,
        seed_date=fund.seed_date,
        ladder_watch_budget=fund.ladder_watch_budget,
        ladder_buy1_budget=fund.ladder_buy1_budget,
        ladder_buy2_budget=fund.ladder_buy2_budget,
        ladder_buy3_budget=fund.ladder_buy3_budget,
    )


@router.get("", response_model=List[schemas.FundOut])
def list_funds(db: Session = Depends(get_db)):
    thresholds = thresholds_dict(db)
    return [_fund_to_out(db, f, thresholds) for f in db.query(models.Fund).all()]


@router.post("", response_model=schemas.FundOut)
def create_fund(payload: schemas.FundCreate, db: Session = Depends(get_db)):
    fund = models.Fund(
        name=payload.name,
        scheme_code=payload.scheme_code,
        target_weight=payload.target_weight,
        current_value=payload.current_value,
        reference_high=payload.reference_high,
        reference_high_is_placeholder=payload.reference_high is None,
        # Seed value/date for XIRR: whatever you're holding at creation time
        # counts as the first (outflow) cash flow.
        seed_value=payload.current_value,
        seed_date=str(date.today()),
        ladder_watch_budget=payload.ladder_watch_budget,
        ladder_buy1_budget=payload.ladder_buy1_budget,
        ladder_buy2_budget=payload.ladder_buy2_budget,
        ladder_buy3_budget=payload.ladder_buy3_budget,
    )
    db.add(fund)
    db.commit()
    db.refresh(fund)
    return _fund_to_out(db, fund, thresholds_dict(db))


@router.put("/{fund_id}", response_model=schemas.FundOut)
def update_fund(fund_id: int, payload: schemas.FundUpdate, db: Session = Depends(get_db)):
    fund = db.get(models.Fund, fund_id)
    if not fund:
        raise HTTPException(404, "Fund not found")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(fund, field, value)
        if field == "reference_high":
            fund.reference_high_is_placeholder = False
    db.commit()
    db.refresh(fund)
    return _fund_to_out(db, fund, thresholds_dict(db))


@router.delete("/{fund_id}")
def delete_fund(fund_id: int, db: Session = Depends(get_db)):
    fund = db.get(models.Fund, fund_id)
    if not fund:
        raise HTTPException(404, "Fund not found")
    db.delete(fund)
    db.commit()
    return {"ok": True}


@router.get("/search/schemes")
def search_fund_schemes(q: str = Query(..., min_length=2)):
    """Search AMFI's live scheme list by name so you can find the exact
    scheme_code for your fund (watch out — direct/regular and growth/IDCW
    variants of the same fund all show up separately; pick the direct growth
    one unless you specifically hold something else)."""
    try:
        results = search_schemes(q)
    except Exception as e:
        raise HTTPException(502, f"Could not reach AMFI: {e}")
    return results
