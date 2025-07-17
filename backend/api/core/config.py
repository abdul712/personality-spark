from typing import List
from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Personality Spark"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # API Keys (will be loaded from environment)
    DEEPSEEK_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost/personality_spark"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "https://personalityspark.com"
    ]
    
    # Analytics
    GA_TRACKING_ID: str = ""
    ADSENSE_CLIENT_ID: str = ""
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()