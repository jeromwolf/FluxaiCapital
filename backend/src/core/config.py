from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "FluxAI Capital"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    
    # API
    API_PREFIX: str = "/api/v1"
    API_KEY: Optional[str] = None
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost/fluxai"
    REDIS_URL: str = "redis://localhost:6379"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # External APIs
    ALPHA_VANTAGE_API_KEY: Optional[str] = None
    POLYGON_API_KEY: Optional[str] = None
    
    # Risk Parameters
    MAX_POSITION_SIZE: float = 0.1  # 10% max per position
    MAX_LEVERAGE: float = 1.0
    VAR_CONFIDENCE_LEVEL: float = 0.95
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()