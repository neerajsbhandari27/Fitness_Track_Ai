from beanie import Document
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import Optional
from pymongo import IndexModel, ASCENDING


class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Session(Document):
    user_id: str
    messages: list[ChatMessage] = Field(default_factory=list)
    summary: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "sessions"
        indexes = [
            IndexModel([("user_id", ASCENDING)]),
        ]

    async def append_message(self, role: str, content: str) -> None:
        self.messages.append(ChatMessage(role=role, content=content))
        self.updated_at = datetime.now(timezone.utc)
        if len(self.messages) > 50:
            self.messages = self.messages[-50:]
        await self.save()