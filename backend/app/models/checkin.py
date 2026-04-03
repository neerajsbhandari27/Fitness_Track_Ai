from beanie import Document
from pydantic import Field
from datetime import datetime, timezone
from typing import Optional
from pymongo import IndexModel, ASCENDING, DESCENDING


class CheckIn(Document):
    user_id: str
    session_id: str
    mood: int
    energy: int
    sleep_hours: float
    stress: int
    agent_response: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "checkins"
        indexes = [
            IndexModel([("user_id", ASCENDING)]),
            IndexModel([("user_id", ASCENDING), ("created_at", DESCENDING)]),
        ]