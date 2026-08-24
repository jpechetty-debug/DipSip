# Deploy Ladder — backend

FastAPI + SQLite backend for the lumpsum dip-tracking tool. Same drawdown/tier
logic and the same lumpsum-split algorithm as the original browser artifact,
now backed by a real database and a daily job that fetches NAVs automatically
from AMFI instead of you typing them in by hand every day.

**v0.2.0** adds cash buckets, deployment-cycle tracking with ladder budgets,
XIRR, and a regime/recovery meter on top of the v0.1.0 base described below.
If you're upgrading from v0.1.0, just drop these files in over the old ones —
migrations run automatically on startup and your existing `dipsip.db` is
preserved (see "XIRR caveats" below for one thing worth doing manually after
upgrading).

## What it does

- Tracks each fund's NAV against a reference high and classifies the current
  drawdown into a tier: `neutral → watch → buy1 → buy2 → buy3`.
- Once a day, pulls the official AMFI NAV feed, updates every fund you've
  linked to a scheme code, and raises an alert **only when a fund's tier
  changes** (so you're not re-notified every day it sits in the same tier).
- Given a lumpsum amount, splits it across whichever funds are underweight vs.
  their target %, weighting more heavily toward funds that are *also*
  currently dipping. Overweight funds are excluded even if they're dipping.
- Optional push to Telegram on tier-change alerts; alerts are always readable
  via the API either way.
- **Cash buckets** — an emergency reserve that's never counted as deployable,
  so a lumpsum can't accidentally eat into it.
- **Deployment-cycle tracking** — each fund's current correction is tracked
  as a cycle from the first tier crossing to full recovery. If you set ladder
  budgets per tier, the split only recommends the *incremental* amount needed
  to reach the current tier's cumulative budget — not the full dose again.
- **XIRR** — per-fund and portfolio-wide, computed from actual deployment
  dates/amounts plus current holding value.
- **Regime + recovery meter** — a value-weighted blended drawdown across your
  whole portfolio, classified into `bull → correction → bear → panic`, with
  a 0–100% recovery reading against the current cycle's low.

## Setup

```bash
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env            # edit if you want auth / Telegram / a different schedule

uvicorn app.main:app --reload
```

Open `http://127.0.0.1:8000/docs` — that's a full interactive UI for every
endpoint below, generated automatically by FastAPI. You can do everything
described here from that page without writing a single request by hand.

## First-time setup: add your funds

1. **Create each fund** — `POST /funds`
   ```json
   {"name": "Bandhan Small Cap", "target_weight": 40, "current_value": 150000}
   ```
   `reference_high` is optional at creation — if you don't set it, the first
   NAV you log becomes it, and it's flagged as a placeholder until you correct
   it to the fund's real 52-week/all-time high.

2. **Link it to AMFI's scheme code** so NAVs fetch automatically —
   `GET /funds/search/schemes?q=bandhan small cap`. This hits AMFI's live feed
   and returns every matching scheme (there are usually 3–4: direct/regular ×
   growth/IDCW). Pick the right one — almost always the **Direct Growth**
   variant — and copy its `scheme_code`.

3. **Attach the code** — `PUT /funds/{id}` with `{"scheme_code": "119598"}`.

Funds without a `scheme_code` still work fine — you just log NAVs manually via
`POST /nav` instead of relying on the daily auto-fetch.

**Optional: set ladder budgets.** If you want deployments capped per
correction cycle instead of the old unbounded split, set cumulative ₹ targets
per tier when creating or updating a fund:
```json
{"ladder_buy1_budget": 5000, "ladder_buy2_budget": 12000, "ladder_buy3_budget": 20000}
```
This means: by the time this fund is at buy tier 2, you intend to have put in
₹12,000 total *for this correction* — if you already put in ₹5,000 at buy
tier 1, the next recommendation tops up by at most ₹7,000, not another full
dose. Leave a tier's budget unset to fall back to the old unbounded
underweight+dip-bonus split for that tier. Budgets should generally increase
with tier depth (`buy1 < buy2 < buy3`) — this isn't enforced, but an
inverted budget will just mean the cap never binds.

**Optional: set cash buckets.** `PUT /cash` with
`{"total_cash": 50000, "emergency_reserve": 20000}` — deployments can only
spend from the ₹30,000 difference. `POST /cash/add` to log a new inflow
without recalculating the running total yourself.

## Day to day

- `GET /funds` — current NAV, drawdown %, and tier for every fund.
- `POST /nav` — log a NAV by hand (`{"fund_id": 1, "nav": 88.40}`); only
  needed for funds without a scheme_code, or to backfill a date. Also updates
  that fund's cycle and re-evaluates the portfolio regime.
- `POST /deployment/recommendation` — preview how a lumpsum would split,
  without committing it (`{"amount": 10000}`). Includes `cash_check` (whether
  you actually have this much available) and `leftover_unallocated` (money
  that hit a ladder cap with nowhere else to go).
- `POST /deployment/log` — same as above, but actually records the
  deployment, updates each fund's `current_value` and active cycle, and
  debits `/cash`. Blocks if the amount exceeds available cash — pass
  `"force": true` to override (e.g. cash you haven't logged yet).
- `GET /alerts` — history of tier-change alerts.
- `GET/PUT /settings/thresholds` — adjust the drawdown %% that trigger each
  tier, and the regime bands (`regime_correction`, `regime_bear`,
  `regime_panic`).
- `GET /cash` / `PUT /cash` / `POST /cash/add` — the emergency/deployable
  split described above.
- `GET /funds/{id}/cycle` — the fund's active correction cycle, if any:
  when it started, the deepest tier/drawdown reached, how much you've
  deployed into it so far, and a 0–100% recovery reading.
- `GET /funds/{id}/cycles` — full history of past cycles for a fund.
- `GET /portfolio/regime` — current regime (bull/correction/bear/panic),
  the blended drawdown behind it, and the active regime cycle if any.
- `GET /funds/{id}/xirr` / `GET /portfolio/xirr` — annualized return from
  actual deployment dates + amounts, plus current holding value. Returns
  `null` with a `note` if there isn't yet at least one investment and one
  current-value data point to compute against.

## The daily job

Runs at `SCHEDULER_HOUR:SCHEDULER_MINUTE` in `TIMEZONE` (defaults to 6:30 PM
IST, after AMFI has usually published the day's NAVs). It fetches
`https://www.amfiindia.com/spages/NAVAll.txt`, updates every fund with a
linked `scheme_code`, and fires an alert on any tier change. It only runs
while the process is up — see deployment notes below for keeping it running.

## XIRR caveats

XIRR is computed from: a "seed" cash flow (whatever a fund's `current_value`
was when you created it, dated to that creation date) + every deployment
logged since, all as outflows, against today's `current_value` as the final
inflow. Two things worth knowing:

- **If you're upgrading from before this update**, your existing funds got
  `seed_value = 0` by the migration (it has no way to know what you actually
  held before). Their XIRR will be based only on flows going forward until
  you correct it: `PUT /funds/{id}` with `{"seed_value": ..., "seed_date": "YYYY-MM-DD"}`
  set to your real original investment and roughly when you made it.
- **Don't backdate a deployment to before a fund's `seed_date`** — XIRR
  doesn't care about chronological sanity, it'll just annualize over a
  distorted (or negative) time window and hand back a meaningless number.

**A note on this build:** I wrote and tested all the logic (scoring, the
lumpsum split, AMFI file parsing, every endpoint) in an offline sandbox that
can't reach amfiindia.com, so I verified parsing against a realistic sample of
the real file format rather than a live pull. Do one real end-to-end check —
run `GET /funds/search/schemes?q=<a fund you hold>` locally — before you trust
the daily job unattended.

## Deploying somewhere it'll actually run unattended

This needs a process that stays alive — an artifact or a laptop that sleeps
won't do the 6:30 PM job reliably. Cheapest solid options for one person:

- **Fly.io / Render free tier** — push this repo, set `SCHEDULER_HOUR` etc.
  as environment variables in their dashboard, done. Both give you a
  persistent disk, which SQLite needs.
- **A small VPS** (e.g. an Indian provider, or Oracle's free tier) — run with
  `uvicorn app.main:app --host 0.0.0.0 --port 8000` behind `systemd` or `pm2`
  so it restarts on crash/reboot.

Whichever you pick, **set `API_KEY` in `.env`** once this is reachable from
the open internet — otherwise anyone with the URL can read or edit your
portfolio data.

## Migrating off SQLite later

If this ever needs to serve more than one person, `DATABASE_URL` is the only
thing that changes (SQLAlchemy handles the rest):
```
DATABASE_URL=postgresql://user:pass@host/dbname
```
At personal-portfolio scale, though, SQLite is the right call — it's one
file, needs no separate service, and comfortably handles years of daily NAV
history.

## Tests

```bash
python tests/test_logic.py         # pure logic: tiers, split, XIRR, regime, recovery %, AMFI parsing
python tests/test_migrations.py    # confirms upgrading an old-schema DB is safe, incl. running twice
python tests/test_integration.py   # full API flow: cash, ladder-capped cycles, XIRR, regime, over-spend guard
```
None need network access or a real AMFI connection.
