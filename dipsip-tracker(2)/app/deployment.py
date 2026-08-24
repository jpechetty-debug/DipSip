"""
Lumpsum split logic — a direct port of the JS in the original browser
artifact, so behavior stays identical between the two.

Rule of thumb: a fund only gets money if it's meaningfully underweight vs.
its target %. Among eligible funds, deeper dips get a bigger multiplier on
top of the underweight gap, so a fund that's both underweight *and* cheap
right now wins a larger share than one that's just underweight.
"""
from typing import Dict, List

from .scoring import tier_for

DIP_BONUS = {"neutral": 0.0, "watch": 0.10, "buy1": 0.25, "buy2": 0.50, "buy3": 1.00}


def total_portfolio_value(funds: List[dict]) -> float:
    return sum(f["current_value"] for f in funds)


def compute_split(amount: float, funds: List[dict], thresholds: Dict[str, float]) -> Dict:
    """
    funds: list of {id, name, current_value, target_weight, drawdown_pct}
    Returns {"allocations": {fund_id: rupee_amount}, "detail": [...]}
    """
    total = total_portfolio_value(funds)
    scored = []
    for f in funds:
        weight_pct = (f["current_value"] / total * 100) if total else 0.0
        gap = f["target_weight"] - weight_pct  # positive = underweight
        tier = tier_for(f["drawdown_pct"], thresholds)
        eligible = gap > 0.5
        score = gap * (1 + DIP_BONUS[tier]) if eligible else 0.0
        scored.append({
            "fund_id": f["id"],
            "name": f["name"],
            "tier": tier,
            "weight_pct": round(weight_pct, 2),
            "gap": round(gap, 2),
            "eligible": eligible,
            "score": score,
        })

    total_score = sum(s["score"] for s in scored)
    allocations: Dict[int, int] = {}

    if total_score <= 0:
        # Nothing is underweight — fall back to an even split across all funds.
        even = round(amount / len(funds)) if funds else 0
        for f in funds:
            allocations[f["id"]] = even
    else:
        for s in scored:
            if s["eligible"]:
                allocations[s["fund_id"]] = round(amount * (s["score"] / total_score))

    allocated = sum(allocations.values())
    remainder = round(amount - allocated)
    if remainder and allocations:
        biggest = max(allocations, key=allocations.get)
        allocations[biggest] += remainder

    return {"allocations": allocations, "detail": scored}


def compute_split_with_caps(
    amount: float, funds: List[dict], thresholds: Dict[str, float], caps: Dict[int, float]
) -> Dict:
    """Same as compute_split, then clips any fund's allocation to its ladder
    cap (if one applies — see ladder_cap_for_fund) and redistributes the
    excess proportionally among funds that still have room. `caps` maps
    fund_id -> max additional ₹ allowed right now; a fund absent from `caps`
    is uncapped.

    With a handful of funds this converges in one or two passes; the loop
    just guards against a fund's redistributed share pushing it over ITS cap
    too. Any amount that still can't be placed after that comes back as
    `leftover_unallocated` rather than silently vanishing.
    """
    result = compute_split(amount, funds, thresholds)
    allocations = dict(result["allocations"])

    for _ in range(4):
        overflow = 0.0
        room = {}  # fund_id -> ₹ still allocatable before hitting its cap
        for fid, amt in allocations.items():
            cap = caps.get(fid)
            if cap is not None and amt > cap:
                overflow += amt - cap
                allocations[fid] = cap
                room[fid] = 0.0
            elif cap is not None:
                room[fid] = cap - amt
            else:
                room[fid] = float("inf")

        if overflow <= 0:
            break  # nothing over cap — done

        redistributable_ids = [fid for fid, r in room.items() if r > 0]
        base_total = sum(allocations[fid] for fid in redistributable_ids)
        if not redistributable_ids or base_total <= 0:
            break  # no room anywhere else — remainder falls out as leftover below

        for fid in redistributable_ids:
            share = allocations[fid] / base_total
            give = overflow * share
            if room[fid] != float("inf"):
                give = min(give, room[fid])
            allocations[fid] += give

    allocations = {fid: int(round(amt)) for fid, amt in allocations.items()}
    result["allocations"] = allocations
    result["leftover_unallocated"] = max(0, round(amount - sum(allocations.values())))
    return result
