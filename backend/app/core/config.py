from pydantic_settings import BaseSettings
from pydantic import Field
from functools import lru_cache


class Settings(BaseSettings):
    # Google ADK / Gemini — only required field
    google_api_key: str = Field(..., env="GOOGLE_API_KEY")
    gemini_model: str = "gemini-2.5-flash"

    # MongoDB
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db: str = "wellness_db"

    # External APIs — all optional, app works without them
    wger_base_url: str = "https://wger.de/api/v2"
    nutritionix_app_id: str = ""
    nutritionix_api_key: str = ""

    # App
    app_env: str = "development"
    app_secret_key: str = "dev-secret-key"
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"        # ignore unknown env vars like GOOGLE_GENAI_USE_VERTEXAI


@lru_cache()
def get_settings() -> Settings:
    return Settings()