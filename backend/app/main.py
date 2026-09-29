from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routers import auth, schemes, assistant, eligibility, calculator, partners, applications, ai_training

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Driven Scheme Matching for Marginalized Entrepreneurs — SIH 2026",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers under /api/v1
app.include_router(auth.router, prefix="/api/v1")
app.include_router(schemes.router, prefix="/api/v1")
app.include_router(assistant.router, prefix="/api/v1")
app.include_router(eligibility.router, prefix="/api/v1")
app.include_router(calculator.router, prefix="/api/v1")
app.include_router(partners.router, prefix="/api/v1")
app.include_router(applications.router, prefix="/api/v1")
app.include_router(ai_training.router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "status": "running",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
