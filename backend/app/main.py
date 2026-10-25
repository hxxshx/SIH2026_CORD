from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .seed_data import seed_database
from .routers import institutions, cases, overlaps, codockets, analytics, reports

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    # Seed data
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="CORD: Cross-Bureau Overlap & Redressal Dashboard API",
    description="Integrated AICTE Multi-Bureau Grievance Monitoring & Co-Docket System",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(institutions.router)
app.include_router(cases.router)
app.include_router(overlaps.router)
app.include_router(codockets.router)
app.include_router(analytics.router)
app.include_router(reports.router)

@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "CORD (Cross-Bureau Overlap & Redressal Dashboard)",
        "agency": "AICTE - All India Council for Technical Education",
        "version": "1.0.0",
        "environment": "GovTech Demonstration Prototype"
    }
