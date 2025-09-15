from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    DB_URL: str = "postgresql+psycopg2://uml:uml@localhost:5432/uml"
    JWT_SECRET: str = "change-me"
    JWT_ALG: str = "HS256"
    ACCESS_EXPIRE_MIN: int = 15
    REFRESH_EXPIRE_DAYS: int = 14
    CORS_ORIGINS: str = "http://localhost:5173"

    class Config:
        env_file = ".env"

settings = Settings()
ALLOWED_ORIGINS: List[str] = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
