from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import require_api_key
from ..database import get_db

router = APIRouter(prefix="/cash", tags=["cash"], dependencies=[Depends(require_api_key)])


def _get_or_create(db: Session) -> models.CashReserve:
    row = db.query(models.CashReserve).first()
    if not row:
        row = models.CashReserve()
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


def _serialize(row: models.CashReserve) -> dict:
    available = max(0.0, row.total_cash - row.emergency_reserve)
    return {
        "total_cash": row.total_cash,
        "emergency_reserve": row.emergency_reserve,
        "available_cash": available,
    }


@router.get("")
def get_cash(db: Session = Depends(get_db)):
    return _serialize(_get_or_create(db))


@router.put("")
def update_cash(payload: schemas.CashUpdate, db: Session = Depends(get_db)):
    """Directly set total_cash and/or emergency_reserve — for correcting the
    numbers to match reality (e.g. after checking your actual bank/broker
    balance)."""
    row = _get_or_create(db)
    if payload.total_cash is not None:
        row.total_cash = payload.total_cash
    if payload.emergency_reserve is not None:
        row.emergency_reserve = payload.emergency_reserve
    db.commit()
    db.refresh(row)
    return _serialize(row)


@router.post("/add")
def add_cash(payload: schemas.CashAddRequest, db: Session = Depends(get_db)):
    """Adds to total_cash — for logging a new inflow (salary, SIP leftover,
    a transfer in) without having to know the running total yourself."""
    row = _get_or_create(db)
    row.total_cash += payload.amount
    db.commit()
    db.refresh(row)
    return _serialize(row)
