import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse

from app.core.config import settings
from app.db.mongo import connect_to_db, close_db_connection, get_database
from app.services.seed import seed_database
from app.routers import auth, costumes, bookings, payments, admin

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn.error")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Yakshagana Costume Platform API...")
    await connect_to_db()
    db = get_database()
    if db is not None:
        try:
            await seed_database(db)
        except Exception as e:
            logger.error(f"Error during initial seed: {e}")
    yield
    # Shutdown
    await close_db_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Full-stack Yakshagana Traditional Costume Rental Platform API with date/slot availability tracking, double-booking prevention, Razorpay & Mock payments, and Admin Inventory & Booking Management.",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(costumes.router, prefix=settings.API_V1_STR)
app.include_router(bookings.router, prefix=settings.API_V1_STR)
app.include_router(payments.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Health"])
async def health_check():
    db = get_database()
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": "connected" if db is not None else "disconnected",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/", include_in_schema=False)
async def root():
    return {
        "message": "Welcome to Yakshagana Costume Rental API",
        "docs": "/docs",
        "health": "/health",
        "api_version": settings.API_V1_STR
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
