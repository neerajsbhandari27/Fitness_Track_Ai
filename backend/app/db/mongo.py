from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import get_settings
import logging

logger = logging.getLogger(__name__)

_client: AsyncIOMotorClient | None = None


async def connect_db() -> None:
    global _client
    settings = get_settings()

    # Import models here to avoid circular imports at module load time
    from app.models.user import User
    from app.models.session import Session
    from app.models.log import Log
    from app.models.checkin import CheckIn

    _client = AsyncIOMotorClient(settings.mongodb_uri)
    await init_beanie(
        database=_client[settings.mongodb_db],
        document_models=[User, Session, Log, CheckIn],
    )
    logger.info(f"Connected to MongoDB: {settings.mongodb_db}")


async def close_db() -> None:
    global _client
    if _client:
        _client.close()
        logger.info("MongoDB connection closed")


def get_client() -> AsyncIOMotorClient:
    if not _client:
        raise RuntimeError("Database not connected. Call connect_db() first.")
    return _client