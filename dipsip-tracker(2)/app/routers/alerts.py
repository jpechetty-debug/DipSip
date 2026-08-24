from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models
from ..auth import require_api_key
from ..database import get_db

router = APIRouter(prefix="/alerts", tags=["alerts"], dependencies=[Depends(require_api_key)])


@router.get("")
def list_alerts(unacknowledged_only: bool = False, db: Session = Depends(get_db)):
    q = db.query(models.Alert).order_by(models.Alert.created_at.desc())
    if unacknowledged_only:
        q = q.filter_by(acknowledged=False)
    return q.all()


@router.post("/{alert_id}/ack")
def ack_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.get(models.Alert, alert_id)
    if not alert:
        raise HTTPException(404, "Alert not found")
    alert.acknowledged = True
    db.commit()
    return {"ok": True}
