# DipSIP AI Frontend Build Specification

## Project Context

You are building the frontend for an existing FastAPI backend.

The backend already exists and provides APIs for:

* Mutual fund portfolio tracking
* NAV history
* Drawdown calculations
* Deployment ladder recommendations
* Cash reserve tracking
* XIRR calculations
* Market regime detection
* Alerts
* Deployment cycles

This is NOT a multi-user SaaS.

This is a personal wealth management application used by a single investor.

Do not build:

* Authentication
* Registration
* Login
* Subscription billing
* Team management
* Multi-user support
* RBAC

Assume the application runs locally.

---

# Product Vision

DipSIP AI helps answer one question:

> "I have cash available. Should I deploy today? If yes, into which fund and how much?"

The application should feel like:

* Zerodha Console
* INDmoney
* Tickertape
* Apple-level simplicity

Focus on clarity and actionability.

Avoid clutter.

---

# Technology Stack

Frontend:

* React
* Vite
* TypeScript
* React Query
* Axios
* Recharts
* Zustand
* React Router

UI:

* shadcn/ui
* Tailwind CSS

Theme:

* Premium dark mode
* Deep navy background
* Emerald gains
* Red losses
* Indigo highlights

Responsive:

* Desktop first
* Tablet support
* Mobile friendly

---

# Application Layout

Create a professional dashboard layout.

Layout:

Sidebar

* Dashboard
* Portfolio
* Deployment Center
* Funds
* History
* Analytics
* Settings

Top Bar

* Current Portfolio Value
* Cash Available
* Current Regime
* Last NAV Sync

Main Content Area

Dynamic page content

---

# Dashboard Page

This is the home screen.

Show KPI cards.

Card 1

Portfolio Value

Example:

₹4,82,340

Daily Change

+₹2,184

Card 2

XIRR

18.7%

Card 3

Available Cash

₹72,000

Card 4

Current Market Regime

BULL
CORRECTION
BEAR
PANIC

Display as colored badge.

---

# Opportunity Score Widget

Create a hero widget.

Large circular gauge.

Opportunity Score

0–100

Rules:

0–30
Hold

31–60
Watch

61–80
Deploy

81–100
Aggressive Deploy

Display recommendation below score.

Example:

Opportunity Score: 78

Recommended Action:
Deploy Selectively

This should be the visual centerpiece of the dashboard.

---

# Deployment Center

This is the core screen.

Display all funds.

Each fund card shows:

Fund Name

Current NAV

ATH NAV

Current Drawdown

Current Ladder Stage

Remaining Ladder Stages

Recommended Deployment Amount

Example:

Bandhan Small Cap

Drawdown:
-18%

Current Stage:
BUY2

Recommended:
₹8,000

---

# Ladder Visualization

Show a visual deployment ladder.

Example:

BUY1  ✓

BUY2  ✓

BUY3  ○

RECOVERY ○

Use progress indicators.

This must be extremely visual.

---

# Fund Detail Page

Show:

Fund Name

Current NAV

ATH NAV

Drawdown %

Target Allocation %

Current Allocation %

Suggested Allocation %

Charts:

NAV History

Drawdown History

Deployment Events

---

# Portfolio Allocation Page

Create allocation charts.

Charts:

Pie Chart

Current Allocation

Target Allocation

Allocation Gap

Example:

Bandhan
Current 28%
Target 40%

Edelweiss
Current 22%
Target 30%

PPFAS
Current 50%
Target 30%

Highlight underweight funds.

---

# Cash Reserve Center

Show:

Total Cash

Allocated Cash

Reserved Cash

Available Cash

Deployment Capacity

Visual meter:

Cash Runway

Example:

Available for
3 major corrections

---

# Analytics Page

Charts:

Portfolio Value Over Time

XIRR Over Time

Cash Deployment History

Fund Drawdown History

Market Regime History

Use beautiful interactive charts.

---

# Deployment History

Timeline view.

Example:

14 Jun 2026

Bandhan Small Cap

BUY1

₹5,000

Drawdown -10%

---

02 Jul 2026

Bandhan Small Cap

BUY2

₹10,000

Drawdown -18%

Display chronologically.

---

# Regime Monitor

Create a dedicated widget.

Possible states:

BULL

CORRECTION

BEAR

PANIC

Each state has:

Color

Description

Recommended Action

Example:

CORRECTION

Description:
Moderate market weakness.

Suggested Action:
Begin staged deployment.

---

# Notifications Center

Display alerts from backend.

Example:

Bandhan Small Cap crossed BUY2 threshold.

Recommended deployment:
₹8,000

Show unread count.

---

# Settings Page

Manage:

Fund Targets

Deployment Ladder Rules

Cash Reserve Rules

Alert Thresholds

API Configuration

---

# Design Language

Create an institutional-grade investing interface.

Visual style:

Premium
Minimal
Modern
Data-focused

Avoid:

Large gradients
Glassmorphism overload
Crypto-style gimmicks
Fancy animations

Use:

Clean cards
Subtle shadows
Professional spacing

Think:

Bloomberg meets Zerodha.

---

# Backend Integration

Generate a centralized API layer.

Create:

services/api.ts

Create React Query hooks:

usePortfolio()

useFunds()

useDeployments()

useAnalytics()

useCashReserve()

useRegime()

Never hardcode data.

All UI must consume backend APIs.

Use loading states.

Use error states.

Use empty states.

---

# Deliverables

Generate:

* Complete React application
* TypeScript types
* API client layer
* React Query hooks
* Zustand stores
* Routing
* Dashboard pages
* Reusable components
* Charts
* Production folder structure

Output production-ready code.

No placeholders.

No mock business logic.

Assume backend already exists and wire everything through API services.
