from beanie import Document
from pydantic import Field
from datetime import datetime, timezone
from typing import Optional, Any
from enum import Enum
from pymongo import IndexModel, ASCENDING, DESCENDING


class LogType(str, Enum):
    SLEEP = "sleep"
    MEAL = "meal"
    HABIT = "habit"
    MOOD = "mood"
    EXERCISE = "exercise"
    WATER = "water"


class Log(Document):
    user_id: str
    session_id: str
    log_type: LogType
    value: Any
    unit: Optional[str] = None
    notes: Optional[str] = None
    logged_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    source: str = "agent"

    class Settings:
        name = "logs"
        indexes = [
            IndexModel([("user_id", ASCENDING)]),
            IndexModel([("log_type", ASCENDING)]),
            IndexModel([("user_id", ASCENDING), ("log_type", ASCENDING), ("logged_at", DESCENDING)]),
        ]