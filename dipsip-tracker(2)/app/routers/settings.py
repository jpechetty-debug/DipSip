from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import require_api_key
from ..database import get_db

router = APIRouter(prefix="/settings", tags=["settings"], dependencies=[Depends(require_api_key)])


def _serialize(row: models.Threshold) -> dict:
    return {
        "watch": row.watch,
        "buy1": row.buy1,
        "buy2": row.buy2,
        "buy3": row.buy3,
        "regime_correction": row.regime_correction,
        "regime_bear": row.regime_bear,
        "regime_panic": row.regime_panic,
    }


@router.get("/thresholds")
def get_thresholds(db: Session = Depends(get_db)):
    row = db.query(models.Threshold).first()
    if not row:
        row = models.Threshold()
        db.add(row)
        db.commit()
        db.refresh(row)
    return _serialize(row)


@router.put("/thresholds")
def update_thresholds(payload: schemas.ThresholdUpdate, db: Session = Depends(get_db)):
    row = db.query(models.Threshold).first()
    if not row:
        row = models.Threshold()
        db.add(row)
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(row, field, value)
    db.commit()
    db.refresh(row)
    return _serialize(row)
