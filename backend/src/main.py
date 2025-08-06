from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.core.config import settings
from src.api import portfolios, positions, risk, market

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API 라우터 등록
app.include_router(portfolios.router, prefix=f"{settings.API_PREFIX}/portfolios", tags=["portfolios"])
app.include_router(positions.router, prefix=f"{settings.API_PREFIX}/positions", tags=["positions"])
app.include_router(risk.router, prefix=f"{settings.API_PREFIX}/risk", tags=["risk"])
app.include_router(market.router, prefix=f"{settings.API_PREFIX}/market", tags=["market"])

@app.get("/")
async def root():
    return {"message": "FluxAI Capital API", "version": settings.APP_VERSION}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}