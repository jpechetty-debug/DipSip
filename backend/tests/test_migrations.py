"""
Confirms the v1 -> v2 schema migration (cash buckets, cycles, XIRR seed
fields, regime thresholds) is safe against a database created with the
OLD schema, and safe to run twice — it runs on every app startup.
Run with: python tests/test_migrations.py
"""
import os
import sqlite3
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy import create_engine  # noqa: E402

from app.migrations import run_light_migrations  # noqa: E402

TEST_DB = os.path.join(os.path.dirname(__file__), "_old_schema_test.db")


def run():
    if os.path.exists(TEST_DB):
        os.remove(TEST_DB)

    conn = sqlite3.connect(TEST_DB)
    conn.execute("""CREATE TABLE funds (
        id INTEGER PRIMARY KEY, name TEXT, scheme_code TEXT,
        target_weight FLOAT, current_value FLOAT,
        reference_high FLOAT, reference_high_is_placeholder BOOLEAN, created_at DATETIME
    )""")
    conn.execute("""CREATE TABLE thresholds (
        id INTEGER PRIMARY KEY, watch FLOAT, buy1 FLOAT, buy2 FLOAT, buy3 FLOAT
    )""")
    conn.execute("INSERT INTO funds (id, name, target_weight, current_value) VALUES (1, 'Old Fund', 40, 99999)")
    conn.execute("INSERT INTO thresholds (id, watch, buy1, buy2, buy3) VALUES (1, -5, -8, -15, -25)")
    conn.commit()
    conn.close()

    engine = create_engine(f"sqlite:///{TEST_DB}")
    run_light_migrations(engine)
    run_light_migrations(engine)  # must be safe to run twice — happens every startup

    conn = sqlite3.connect(TEST_DB)
    cols_funds = [r[1] for r in conn.execute("PRAGMA table_info(funds)")]
    cols_thresh = [r[1] for r in conn.execute("PRAGMA table_info(thresholds)")]
    assert "seed_value" in cols_funds and "ladder_buy1_budget" in cols_funds
    assert "regime_correction" in cols_thresh

    row = conn.execute(
        "SELECT name, current_value, seed_value, ladder_buy1_budget FROM funds WHERE id=1"
    ).fetchone()
    assert row[0] == "Old Fund" and row[1] == 99999  # pre-existing data untouched
    assert row[2] == 0.0     # new column got its default
    assert row[3] is None    # nullable new column stayed null
    conn.close()
    os.remove(TEST_DB)
    print("Migration test passed.")


if __name__ == "__main__":
    run()
