"""
One-shot setup for a 3-fund portfolio: Parag Parikh Flexi Cap, Edelweiss Mid
Cap, Bandhan Small Cap — each with its own drawdown thresholds instead of the
app's global defaults, since a flexicap, a midcap, and a smallcap fund don't
dip the same amount during a "normal" correction.

Run this AFTER the backend is up (uvicorn app.main:app), so it can hit the
real API and pick up the light-migration columns automatically:

    python seed_my_funds.py
    python seed_my_funds.py --base-url http://localhost:8000 --api-key mykey

What it does:
  1. Creates the 3 funds if they don't already exist (matched by name).
  2. Sets per-fund thresholds (watch/buy1/buy2/buy3, % drawdown from high).
  3. Leaves scheme_code UNSET — you still need to link each fund to its AMFI
     scheme code so the daily scheduler can actually pull its NAV. Use the
     app's "search schemes" feature (Funds page) or the AMFI website to find
     the exact code, then PATCH /funds/{id} with {"scheme_code": "..."}.
     Scheme codes aren't guessed here on purpose — a wrong code would track
     the wrong fund's NAV silently.

Threshold rationale (feel free to tune after you've watched it for a cycle
or two — these are a reasonable starting point, not gospel):
  - Flexicap funds (diversified across caps, PPFAS also holds some
    international equity) historically see shallower, slower drawdowns than
    pure mid/smallcap funds.
  - Midcap sits between flexicap and smallcap in typical drawdown depth.
  - Smallcap is the most volatile of the three — needs the deepest
    thresholds or you'll get a "buy" alert almost every month.
"""
import argparse
import sys

import requests

FUNDS = [
    {
        "name": "Parag Parikh Flexi Cap Fund",
        "target_weight": 40.0,  # edit to your actual target allocation %
        "threshold_watch": -7.0,
        "threshold_buy1": -10.0,
        "threshold_buy2": -15.0,
        "threshold_buy3": -20.0,
    },
    {
        "name": "Edelweiss Mid Cap Fund",
        "target_weight": 30.0,
        "threshold_watch": -9.0,
        "threshold_buy1": -13.0,
        "threshold_buy2": -18.0,
        "threshold_buy3": -25.0,
    },
    {
        "name": "Bandhan Small Cap Fund",
        "target_weight": 30.0,
        "threshold_watch": -11.0,
        "threshold_buy1": -16.0,
        "threshold_buy2": -22.0,
        "threshold_buy3": -30.0,
    },
]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://localhost:8000")
    parser.add_argument("--api-key", default=None, help="only needed if API_KEY is set in your .env")
    args = parser.parse_args()

    headers = {"X-API-Key": args.api_key} if args.api_key else {}

    existing = requests.get(f"{args.base_url}/funds", headers=headers, timeout=10).json()
    existing_by_name = {f["name"]: f for f in existing}

    for fund in FUNDS:
        if fund["name"] in existing_by_name:
            fund_id = existing_by_name[fund["name"]]["id"]
            patch = {k: v for k, v in fund.items() if k != "name"}
            r = requests.put(f"{args.base_url}/funds/{fund_id}", json=patch, headers=headers, timeout=10)
            r.raise_for_status()
            print(f"Updated thresholds for existing fund: {fund['name']} (id={fund_id})")
        else:
            r = requests.post(f"{args.base_url}/funds", json=fund, headers=headers, timeout=10)
            r.raise_for_status()
            new_id = r.json()["id"]
            print(f"Created fund: {fund['name']} (id={new_id})")

    print(
        "\nDone. Next: link each fund's AMFI scheme_code via the app's "
        "Funds page search, then confirm TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID "
        "are set in backend/.env so alerts actually push to your phone."
    )


if __name__ == "__main__":
    try:
        main()
    except requests.exceptions.ConnectionError:
        print("Could not reach the backend — is uvicorn running? (uvicorn app.main:app --reload)", file=sys.stderr)
        sys.exit(1)
