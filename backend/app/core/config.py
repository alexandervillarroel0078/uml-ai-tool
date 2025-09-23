#app/core/config.py
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    DB_URL: str = "postgresql+psycopg2://uml:uml@localhost:5432/uml"
    JWT_SECRET: str = "change-me"
    JWT_ALG: str = "HS256"
    ACCESS_EXPIRE_MIN: int = 480
    REFRESH_EXPIRE_DAYS: int = 14
    CORS_ORIGINS: str = (
        "http://localhost:5173,"
        "http://127.0.0.1:5173,"
        "http://192.168.0.12:5173,"
        "http://192.168.0.12:4173"
    )
    DEBUG: bool = False

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

ALLOWED_ORIGINS: List[str] = [
    o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()
]
