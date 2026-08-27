# DipSIP — Deployment Ladder

DipSIP is a personal wealth management application designed for a single investor to track mutual fund portfolios, analyze NAV history, compute drawdowns, and generate "deployment ladder" recommendations based on market regimes. 

It answers one core question:
> *"I have cash available. Should I deploy today? If yes, into which fund and how much?"*

## Architecture

The project is split into a decoupled frontend and backend:

* **Backend (`/backend`)**: A FastAPI + SQLite service that fetches daily NAV data from AMFI, computes drawdowns, tracks deployment cycles, calculates XIRR, and monitors the overall market regime.
* **Frontend (`/frontend`)**: A modern React application built with Vite, TypeScript, React Query, and Tailwind CSS + shadcn/ui. It provides an institutional-grade, Bloomberg-meets-Zerodha style dashboard.

## Features

- **Automated NAV Tracking**: Fetches daily NAV from AMFI automatically.
- **Drawdown & Regime Detection**: Tracks each fund's drawdown and classifies the market into regimes (`BULL`, `CORRECTION`, `BEAR`, `PANIC`).
- **Deployment Ladder**: Recommends capital allocation to underweight, dipping funds.
- **Cash Buckets**: Tracks deployable cash vs emergency reserves.
- **XIRR & Cycle Tracking**: Tracks returns and recovery cycles for investments over time.

## Setup Instructions

### 1. Backend Setup

Navigate to the `backend` directory and set up the Python environment:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env            # Edit to configure keys, timezone, and scheduler
uvicorn app.main:app --reload
```

The backend will run on `http://127.0.0.1:8000`. You can view the interactive API documentation at `http://127.0.0.1:8000/docs`.
*For detailed information on adding funds, cycle tracking, and deployment, see the [Backend README](./backend/README.md).*

### 2. Frontend Setup

Navigate to the `frontend` directory and install the Node dependencies:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173` by default. It is configured to communicate with the FastAPI backend.

## Daily Job

The backend includes a scheduler that runs daily (e.g., 6:30 PM IST) to fetch NAVs and generate alerts. Keep the backend process running to ensure daily updates are processed.
