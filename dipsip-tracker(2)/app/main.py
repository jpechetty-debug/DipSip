from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import Base, SessionLocal, engine
from .migrations import run_light_migrations
from .routers import alerts, analytics, cash, deployment, funds, nav, settings
from .scheduler import start_scheduler

Base.metadata.create_all(bind=engine)
run_light_migrations(engine)

app = FastAPI(
    title="Deploy Ladder API",
    description="Backend for the lumpsum dip-tracking / deploy-ladder tool.",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(funds.router)
app.include_router(nav.router)
app.include_router(deployment.router)
app.include_router(alerts.router)
app.include_router(settings.router)
app.include_router(cash.router)
app.include_router(analytics.router)

_scheduler = None


@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        if not db.query(models.Threshold).first():
            db.add(models.Threshold())
            db.commit()
        if not db.query(models.CashReserve).first():
            db.add(models.CashReserve())
            db.commit()
    finally:
        db.close()

    global _scheduler
    _scheduler = start_scheduler()


@app.on_event("shutdown")
def on_shutdown():
    if _scheduler:
        _scheduler.shutdown(wait=False)


@app.get("/")
def root():
    return {"status": "ok", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
