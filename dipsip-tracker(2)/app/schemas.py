from typing import Optional

from pydantic import BaseModel


class FundCreate(BaseModel):
    name: str
    scheme_code: Optional[str] = None
    target_weight: float = 0.0
    current_value: float = 0.0
    reference_high: Optional[float] = None
    # Cumulative ₹ ladder budgets per tier, for deployment-cycle capping.
    # All optional — leave unset for the old unbounded split behavior.
    ladder_watch_budget: Optional[float] = None
    ladder_buy1_budget: Optional[float] = None
    ladder_buy2_budget: Optional[float] = None
    ladder_buy3_budget: Optional[float] = None


class FundUpdate(BaseModel):
    name: Optional[str] = None
    scheme_code: Optional[str] = None
    target_weight: Optional[float] = None
    current_value: Optional[float] = None
    reference_high: Optional[float] = None
    # Only needed if you're correcting these — e.g. a fund created before
    # XIRR support existed, where seed_value defaulted to 0 on migration.
    seed_value: Optional[float] = None
    seed_date: Optional[str] = None
    ladder_watch_budget: Optional[float] = None
    ladder_buy1_budget: Optional[float] = None
    ladder_buy2_budget: Optional[float] = None
    ladder_buy3_budget: Optional[float] = None


class FundOut(BaseModel):
    id: int
    name: str
    scheme_code: Optional[str] = None
    target_weight: float
    current_value: float
    reference_high: Optional[float] = None
    reference_high_is_placeholder: bool
    current_nav: Optional[float] = None
    drawdown_pct: Optional[float] = None
    tier: Optional[str] = None
    seed_value: Optional[float] = None
    seed_date: Optional[str] = None
    ladder_watch_budget: Optional[float] = None
    ladder_buy1_budget: Optional[float] = None
    ladder_buy2_budget: Optional[float] = None
    ladder_buy3_budget: Optional[float] = None

    class Config:
        from_attributes = True


class NavLogCreate(BaseModel):
    fund_id: int
    date: Optional[str] = None  # defaults to today if omitted
    nav: float


class ThresholdUpdate(BaseModel):
    watch: Optional[float] = None
    buy1: Optional[float] = None
    buy2: Optional[float] = None
    buy3: Optional[float] = None
    regime_correction: Optional[float] = None
    regime_bear: Optional[float] = None
    regime_panic: Optional[float] = None


class DeploymentRequest(BaseModel):
    amount: float


class DeploymentLogRequest(BaseModel):
    amount: float
    notes: Optional[str] = None
    # Skip the available-cash check (e.g. cash not logged yet). Off by default
    # so a deployment can never silently outrun what you've told the tool you have.
    force: bool = False


class CashUpdate(BaseModel):
    total_cash: Optional[float] = None
    emergency_reserve: Optional[float] = None


class CashAddRequest(BaseModel):
    amount: float
