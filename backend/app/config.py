from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./udyamsathi.db"
    
    # JWT
    SECRET_KEY: str = "your-super-secret-key-change-in-production-sih26092"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # CORS
    FRONTEND_URL: str = "http://localhost:3000"
    
    # Gemini
    GEMINI_API_KEY: str = ""
    # Gemini 2.0 Flash has been retired; use the currently available Flash model.
    GEMINI_MODEL: str = "gemini-3.8-flash"
    
    # App
    APP_NAME: str = "UdyamSathi"
    APP_VERSION: str = "1.0.0"
    # Accept existing deployment-style values such as "release" as well as booleans.
    DEBUG: str = "true"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
