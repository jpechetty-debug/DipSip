"""
XIRR for irregular cash flows, using bisection (no numpy/scipy dependency).

Convention: cash flows you paid out (money invested) are negative; the final
value of the holding today is positive. Given at least one of each, XIRR is
the annualized rate that makes the sum of discounted cash flows zero.
"""
from datetime import date, datetime
from typing import List, Tuple

CashFlow = Tuple[str, float]  # (date "YYYY-MM-DD", amount)


def _to_date(d) -> date:
    if isinstance(d, str):
        return datetime.strptime(d, "%Y-%m-%d").date()
    return d


def xnpv(rate: float, cashflows: List[CashFlow]) -> float:
    d0 = _to_date(cashflows[0][0])
    return sum(
        cf / (1 + rate) ** ((_to_date(d) - d0).days / 365.0)
        for d, cf in cashflows
    )


def xirr(cashflows: List[CashFlow]) -> float:
    """Returns the annualized rate as a decimal (0.12 = 12%).
    Raises ValueError if there aren't at least one inflow and one outflow, or
    if bisection can't bracket a root (e.g. all cash flows the same sign)."""
    if len(cashflows) < 2:
        raise ValueError("Need at least 2 cash flows to compute XIRR")
    if not any(cf > 0 for _, cf in cashflows) or not any(cf < 0 for _, cf in cashflows):
        raise ValueError("XIRR needs at least one negative (invested) and one positive (current value) cash flow")

    cashflows = sorted(cashflows, key=lambda x: _to_date(x[0]))

    low, high = -0.9999, 10.0
    f_low, f_high = xnpv(low, cashflows), xnpv(high, cashflows)

    tries = 0
    while f_low * f_high > 0 and tries < 50:
        high *= 2
        f_high = xnpv(high, cashflows)
        tries += 1
    if f_low * f_high > 0:
        raise ValueError("XIRR did not converge — check cash flow dates/amounts")

    for _ in range(200):
        mid = (low + high) / 2
        f_mid = xnpv(mid, cashflows)
        if abs(f_mid) < 1e-6:
            return mid
        if f_low * f_mid < 0:
            high, f_high = mid, f_mid
        else:
            low, f_low = mid, f_mid
    return (low + high) / 2
