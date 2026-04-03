from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime
from app.models.log import LogType


# ── Chat ──────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    session_id: str = Field(description="Client-generated or returned session ID")
    user_id: str = Field(description="User identifier")
    message: str = Field(min_length=1, max_length=4000)


class ChatResponse(BaseModel):
    session_id: str
    reply: str
    timestamp: datetime


# ── History ───────────────────────────────────────────────────────────────

class MessageOut(BaseModel):
    role: str
    content: str
    timestamp: datetime


class HistoryResponse(BaseModel):
    session_id: str
    message_count: int
    summary: Optional[str]
    messages: list[MessageOut]


# ── Manual log (direct UI action, not via chat) ───────────────────────────

class LogRequest(BaseModel):
    user_id: str
    session_id: str
    log_type: LogType
    value: Any
    unit: Optional[str] = None
    notes: Optional[str] = None


class LogResponse(BaseModel):
    log_id: str
    log_type: str
    value: Any
    unit: Optional[str]
    logged_at: datetime


class LogsListResponse(BaseModel):
    count: int
    entries: list[LogResponse]


# ── Check-in ──────────────────────────────────────────────────────────────

class CheckInRequest(BaseModel):
    user_id: str
    session_id: str
    mood: int = Field(ge=1, le=10)
    energy: int = Field(ge=1, le=10)
    sleep_hours: float = Field(ge=0, le=24)
    stress: int = Field(ge=1, le=10)


class CheckInResponse(BaseModel):
    checkin_id: str
    agent_reply: str
    scores: dict
    derived: dict
    created_at: datetime


# ── Session ───────────────────────────────────────────────────────────────

class NewSessionResponse(BaseModel):
    session_id: str
    user_id: str
    created_at: datetime