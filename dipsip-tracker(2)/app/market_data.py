"""
Talks to AMFI's public daily NAV feed.

AMFI publishes one giant semicolon-delimited text file with every scheme's
latest NAV, refreshed once a day after markets close:
https://www.amfiindia.com/spages/NAVAll.txt

Row shape (when it *is* a data row):
    Scheme Code;ISIN Div Payout/ISIN Growth;ISIN Div Reinvestment;Scheme Name;Net Asset Value;Date

The file also contains AMC name headers, category headers, and blank lines
mixed in, which we skip by requiring the first field to be a numeric scheme
code.
"""
from typing import Dict, List, Optional

import requests

from .config import AMFI_NAV_URL


def fetch_navall_raw() -> str:
    resp = requests.get(AMFI_NAV_URL, timeout=20, headers={"User-Agent": "dipsip-tracker/1.0"})
    resp.raise_for_status()
    return resp.text


def parse_navall(raw_text: str) -> List[Dict]:
    records = []
    for line in raw_text.splitlines():
        line = line.strip()
        if not line or ";" not in line:
            continue
        parts = line.split(";")
        if len(parts) < 6:
            continue
        scheme_code = parts[0].strip()
        if not scheme_code.isdigit():
            continue  # header / category row, not a scheme
        try:
            nav = float(parts[4].strip())
        except ValueError:
            continue
        records.append({
            "scheme_code": scheme_code,
            "isin_growth": parts[1].strip(),
            "isin_reinvest": parts[2].strip(),
            "scheme_name": parts[3].strip(),
            "nav": nav,
            "date": parts[5].strip(),
        })
    return records


def search_schemes(query: str, records: Optional[List[Dict]] = None, limit: int = 20) -> List[Dict]:
    """Case-insensitive substring search over scheme names. Fetches live if
    `records` isn't passed in — expect this to be slow-ish (the file is large)."""
    if records is None:
        records = parse_navall(fetch_navall_raw())
    q = query.lower()
    return [r for r in records if q in r["scheme_name"].lower()][:limit]


def get_nav_for_scheme(scheme_code: str, records: Optional[List[Dict]] = None) -> Optional[Dict]:
    if records is None:
        records = parse_navall(fetch_navall_raw())
    for r in records:
        if r["scheme_code"] == scheme_code:
            return r
    return None
