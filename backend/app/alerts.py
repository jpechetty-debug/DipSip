from typing import Optional

import requests
from sqlalchemy.orm import Session

from . import models
from .config import TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
from .scoring import TIER_LABELS


def last_tier_for_fund(db: Session, fund_id: int) -> str:
    last = (
        db.query(models.Alert)
        .filter(models.Alert.fund_id == fund_id)
        .order_by(models.Alert.created_at.desc())
        .first()
    )
    return last.tier if last else "neutral"


def maybe_create_alert(
    db: Session, fund: models.Fund, tier: str, drawdown: float
) -> Optional[models.Alert]:
    """Only fires when the tier actually changed since the last alert for this
    fund — crossing deeper into a dip, or recovering back out of one. Prevents
    a daily flood of "still in buy tier 2" repeats."""
    prev_tier = last_tier_for_fund(db, fund.id)
    if tier == prev_tier:
        return None

    if tier == "neutral":
        message = f"{fund.name} has recovered back to its reference high — dip cycle over."
    else:
        message = f"{fund.name} is now {abs(drawdown):.1f}% off its reference high — {TIER_LABELS[tier]}."

    alert = models.Alert(fund_id=fund.id, tier=tier, message=message)
    db.add(alert)
    db.commit()
    db.refresh(alert)

    # Notify on every tier change, including recovery back to neutral — you
    # want to know both when a dip opens (buy signal) and when it closes
    # (stop expecting to deploy into that fund at a discount anymore).
    send_telegram(message)
    return alert


def send_telegram(message: str) -> None:
    if not (TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID):
        return
    try:
        requests.post(
            f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
            json={"chat_id": TELEGRAM_CHAT_ID, "text": message},
            timeout=10,
        )
    except requests.RequestException:
        pass  # alert is already saved in the DB either way
