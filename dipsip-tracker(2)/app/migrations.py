"""
This is a single-file personal SQLite DB with no formal migration framework.
`Base.metadata.create_all()` only creates tables that don't exist yet — it
never adds columns to a table that's already there. So every time we add a
column to an existing table (funds, thresholds), it needs an explicit
ALTER TABLE here, wrapped in try/except so a fresh DB (where the column
already exists via create_all) and an upgraded DB (where it doesn't) both
work without branching on which case we're in.
"""
from sqlalchemy import text
from sqlalchemy.engine import Engine

# (table, column, SQL type + default)
_NEW_COLUMNS = [
    ("funds", "seed_value", "FLOAT DEFAULT 0.0"),
    ("funds", "seed_date", "VARCHAR"),
    ("funds", "ladder_watch_budget", "FLOAT"),
    ("funds", "ladder_buy1_budget", "FLOAT"),
    ("funds", "ladder_buy2_budget", "FLOAT"),
    ("funds", "ladder_buy3_budget", "FLOAT"),
    ("thresholds", "regime_correction", "FLOAT DEFAULT -5.0"),
    ("thresholds", "regime_bear", "FLOAT DEFAULT -10.0"),
    ("thresholds", "regime_panic", "FLOAT DEFAULT -20.0"),
]


def run_light_migrations(engine: Engine) -> None:
    with engine.connect() as conn:
        for table, column, coltype in _NEW_COLUMNS:
            try:
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {coltype}"))
                conn.commit()
            except Exception:
                conn.rollback()  # column already exists — nothing to do
