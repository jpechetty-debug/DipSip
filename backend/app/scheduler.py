from datetime import date
from zoneinfo import ZoneInfo

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from . import models
from .alerts import maybe_create_alert
from .config import SCHEDULER_HOUR, SCHEDULER_MINUTE, TIMEZONE
from .cycles import update_fund_cycle, update_regime_cycle
from .database import SessionLocal
from .market_data import fetch_navall_raw, get_nav_for_scheme, parse_navall
from .portfolio import all_fund_snapshots, regime_thresholds_dict, thresholds_dict
from .regime import blended_drawdown, regime_for
from .scoring import compute_drawdown, tier_for


def run_daily_refresh() -> None:
    """Pulls today's AMFI NAV dump once, then updates every fund that has a
    scheme_code linked, logs a NavLog row if one doesn't exist for today yet,
    rolls the reference high forward on new highs, and raises an alert on any
    tier change."""
    db = SessionLocal()
    try:
        try:
            records = parse_navall(fetch_navall_raw())
        except Exception as e:
            print(f"[scheduler] failed to fetch AMFI NAV data: {e}")
            return

        thresholds = thresholds_dict(db)
        today = str(date.today())
        funds = db.query(models.Fund).filter(models.Fund.scheme_code.isnot(None)).all()

        for fund in funds:
            rec = get_nav_for_scheme(fund.scheme_code, records)
            if not rec:
                print(f"[scheduler] scheme_code {fund.scheme_code} ({fund.name}) not found in today's feed")
                continue

            exists = db.query(models.NavLog).filter_by(fund_id=fund.id, date=today).first()
            if not exists:
                db.add(models.NavLog(fund_id=fund.id, date=today, nav=rec["nav"], source="auto"))

            if not fund.reference_high or rec["nav"] > fund.reference_high:
                fund.reference_high = rec["nav"]
                fund.reference_high_is_placeholder = False
            db.commit()

            drawdown = compute_drawdown(rec["nav"], fund.reference_high)
            tier = tier_for(drawdown, thresholds)
            maybe_create_alert(db, fund, tier, drawdown)
            update_fund_cycle(db, fund, tier, drawdown, today)

        # Once per run, not once per fund — re-evaluate the portfolio-wide
        # regime after every fund's NAV for the day is in.
        snapshots = all_fund_snapshots(db)
        if snapshots:
            blended_dd = blended_drawdown(snapshots)
            regime_thresholds = regime_thresholds_dict(db)
            regime = regime_for(blended_dd, regime_thresholds)
            update_regime_cycle(db, regime, blended_dd, today)
    finally:
        db.close()


def start_scheduler() -> BackgroundScheduler:
    scheduler = BackgroundScheduler(timezone=ZoneInfo(TIMEZONE))
    scheduler.add_job(
        run_daily_refresh,
        CronTrigger(hour=SCHEDULER_HOUR, minute=SCHEDULER_MINUTE),
        id="daily_nav_refresh",
        replace_existing=True,
    )
    scheduler.start()
    return scheduler
