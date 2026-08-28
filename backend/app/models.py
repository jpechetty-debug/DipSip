from datetime import datetime

from sqlalchemy import (
    Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from .database import Base


class Fund(Base):
    __tablename__ = "funds"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    # AMFI scheme code, once you've picked the right one via /funds/search/schemes.
    # Null until linked — the fund still works with manual NAV logging until then.
    scheme_code = Column(String, nullable=True, index=True)
    target_weight = Column(Float, default=0.0)      # target portfolio %
    current_value = Column(Float, default=0.0)      # latest known holding value, ₹
    reference_high = Column(Float, nullable=True)   # NAV drawdown is measured against
    reference_high_is_placeholder = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # XIRR inputs: the value/date this fund started being tracked at, treated
    # as the first (outflow) cash flow. Set once at creation.
    seed_value = Column(Float, default=0.0)
    seed_date = Column(String, nullable=True)  # YYYY-MM-DD

    # Deployment-ladder budgets: cumulative ₹ you intend to have deployed into
    # THIS fund by the time it reaches each tier, for one correction cycle.
    # All optional — leave unset (None) to keep the old unbounded
    # underweight+dip-bonus split with no cap.
    ladder_watch_budget = Column(Float, nullable=True)
    ladder_buy1_budget = Column(Float, nullable=True)
    ladder_buy2_budget = Column(Float, nullable=True)
    ladder_buy3_budget = Column(Float, nullable=True)

    # Per-fund drawdown thresholds — override the global Threshold row for
    # THIS fund only. All optional; any left unset fall back to the global
    # value. Use this because a -15% drawdown means something very different
    # for a largecap vs a smallcap fund — one global threshold set doesn't
    # fit a portfolio spanning multiple fund categories.
    threshold_watch = Column(Float, nullable=True)
    threshold_buy1 = Column(Float, nullable=True)
    threshold_buy2 = Column(Float, nullable=True)
    threshold_buy3 = Column(Float, nullable=True)

    navs = relationship("NavLog", back_populates="fund", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="fund", cascade="all, delete-orphan")
    cycles = relationship("DeploymentCycle", back_populates="fund", cascade="all, delete-orphan")


class NavLog(Base):
    __tablename__ = "nav_logs"
    __table_args__ = (UniqueConstraint("fund_id", "date", name="uq_fund_date"),)

    id = Column(Integer, primary_key=True)
    fund_id = Column(Integer, ForeignKey("funds.id"), nullable=False)
    date = Column(String, nullable=False)  # YYYY-MM-DD
    nav = Column(Float, nullable=False)
    source = Column(String, default="manual")  # "manual" | "auto"
    created_at = Column(DateTime, default=datetime.utcnow)

    fund = relationship("Fund", back_populates="navs")


class Threshold(Base):
    """Single-row table: the drawdown %% that triggers each tier."""
    __tablename__ = "thresholds"

    id = Column(Integer, primary_key=True)
    watch = Column(Float, default=-5.0)
    buy1 = Column(Float, default=-8.0)
    buy2 = Column(Float, default=-15.0)
    buy3 = Column(Float, default=-25.0)

    # Regime bands, applied to the portfolio's value-weighted blended
    # drawdown (see app/regime.py). Anything above `regime_correction`
    # (i.e. closer to 0) is "bull".
    regime_correction = Column(Float, default=-5.0)
    regime_bear = Column(Float, default=-10.0)
    regime_panic = Column(Float, default=-20.0)


class Deployment(Base):
    __tablename__ = "deployments"

    id = Column(Integer, primary_key=True)
    date = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    items = relationship("DeploymentItem", back_populates="deployment", cascade="all, delete-orphan")


class DeploymentItem(Base):
    __tablename__ = "deployment_items"

    id = Column(Integer, primary_key=True)
    deployment_id = Column(Integer, ForeignKey("deployments.id"), nullable=False)
    fund_id = Column(Integer, ForeignKey("funds.id"), nullable=False)
    amount = Column(Float, nullable=False)

    deployment = relationship("Deployment", back_populates="items")


class CashReserve(Base):
    """Single-row table. `emergency_reserve` is a protected floor that never
    counts as deployable — deployment logging can only spend from
    total_cash - emergency_reserve."""
    __tablename__ = "cash_reserve"

    id = Column(Integer, primary_key=True)
    total_cash = Column(Float, default=0.0)
    emergency_reserve = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class DeploymentCycle(Base):
    """One correction cycle for a single fund: opens the first time it drops
    below 'neutral', closes when it recovers back to neutral (or a new high).
    `lowest_drawdown` is the deepest point reached so far in the cycle — the
    tier label for that point, and hence 'peak tier', is derived on demand via
    scoring.tier_for() rather than stored twice."""
    __tablename__ = "deployment_cycles"

    id = Column(Integer, primary_key=True)
    fund_id = Column(Integer, ForeignKey("funds.id"), nullable=False)
    started_date = Column(String, nullable=False)
    started_tier = Column(String, nullable=False)
    lowest_drawdown = Column(Float, nullable=False)
    deployed_amount = Column(Float, default=0.0)  # ₹ deployed into this fund during the cycle
    status = Column(String, default="active")     # "active" | "closed"
    closed_date = Column(String, nullable=True)

    fund = relationship("Fund", back_populates="cycles")


class RegimeCycle(Base):
    """Portfolio-wide analogue of DeploymentCycle, driven by the value-weighted
    blended drawdown across all funds rather than any single fund's NAV."""
    __tablename__ = "regime_cycles"

    id = Column(Integer, primary_key=True)
    started_date = Column(String, nullable=False)
    started_regime = Column(String, nullable=False)
    lowest_blended_drawdown = Column(Float, nullable=False)
    status = Column(String, default="active")  # "active" | "closed"
    closed_date = Column(String, nullable=True)


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True)
    fund_id = Column(Integer, ForeignKey("funds.id"), nullable=True)
    tier = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    acknowledged = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    fund = relationship("Fund", back_populates="alerts")
