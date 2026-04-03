from beanie import Document
from pydantic import Field
from datetime import datetime, timezone
from typing import Optional
from pymongo import IndexModel, ASCENDING


class User(Document):
    name: str
    email: str
    timezone: str = "UTC"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"
        indexes = [
            IndexModel([("email", ASCENDING)], unique=True),
        ]