from fastapi import APIRouter, HTTPException, Query
from datetime import datetime, timezone, timedelta
from typing import Optional
import re

from app.api.schemas import (
    ChatRequest, ChatResponse,
    HistoryResponse, MessageOut,
    LogRequest, LogResponse, LogsListResponse,
    CheckInRequest, CheckInResponse,
    NewSessionResponse,
)
from app.models.session import Session
from app.models.log import Log, LogType
from app.models.checkin import CheckIn
from app.agent.wellness_agent import run_agent_turn
from app.tools.checkin_tool import submit_checkin as checkin_tool
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

OBJECT_ID_RE = re.compile(r'^[a-f\d]{24}$', re.IGNORECASE)


def validate_object_id(value: str, field: str = "session_id") -> None:
    """Raise a clean 400 if value is not a valid MongoDB ObjectId."""
    if not OBJECT_ID_RE.match(value):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid {field}: must be a 24-character hex string. Got: {value[:80]!r}"
        )


# ── Sessions ──────────────────────────────────────────────────────────────

@router.post("/sessions", response_model=NewSessionResponse, tags=["sessions"])
async def create_session(user_id: str):
    """Create a new chat session for a user."""
    session = Session(user_id=user_id, messages=[])
    await session.insert()
    return NewSessionResponse(
        session_id=str(session.id),
        user_id=user_id,
        created_at=session.created_at,
    )


# ── Chat ──────────────────────────────────────────────────────────────────

@router.post("/chat", response_model=ChatResponse, tags=["chat"])
async def chat(req: ChatRequest):
    """Main agentic chat endpoint."""
    validate_object_id(req.session_id, "session_id")

    session = await Session.get(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session {req.session_id} not found. Call POST /sessions first.")

    await session.append_message(role="user", content=req.message)

    try:
        reply = await run_agent_turn(
            session_id=req.session_id,
            user_id=req.user_id,
            user_message=req.message,
        )
    except Exception as e:
        logger.error(f"Agent error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")

    await session.append_message(role="model", content=reply)

    return ChatResponse(
        session_id=req.session_id,
        reply=reply,
        timestamp=datetime.now(timezone.utc),
    )


# ── History ───────────────────────────────────────────────────────────────

@router.get("/sessions/{session_id}/history", response_model=HistoryResponse, tags=["chat"])
async def get_history(session_id: str, last_n: int = Query(20, ge=1, le=100)):
    """Fetch recent message history and rolling summary for a session."""
    validate_object_id(session_id, "session_id")

    session = await Session.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = [
        MessageOut(role=m.role, content=m.content, timestamp=m.timestamp)
        for m in session.messages[-last_n:]
    ]
    return HistoryResponse(
        session_id=session_id,
        message_count=len(session.messages),
        summary=session.summary,
        messages=messages,
    )


# ── Logs ──────────────────────────────────────────────────────────────────

@router.post("/logs", response_model=LogResponse, tags=["logs"])
async def create_log(req: LogRequest):
    """Manually log a wellness entry."""
    validate_object_id(req.session_id, "session_id")

    entry = Log(
        user_id=req.user_id,
        session_id=req.session_id,
        log_type=req.log_type,
        value=req.value,
        unit=req.unit,
        notes=req.notes,
        source="manual",
    )
    await entry.insert()
    return LogResponse(
        log_id=str(entry.id),
        log_type=entry.log_type.value,
        value=entry.value,
        unit=entry.unit,
        logged_at=entry.logged_at,
    )


@router.get("/logs", response_model=LogsListResponse, tags=["logs"])
async def get_logs(
    user_id: str,
    log_type: Optional[LogType] = None,
    days: int = Query(7, ge=1, le=90),
    limit: int = Query(50, ge=1, le=200),
):
    """Retrieve wellness logs for a user."""
    since = datetime.now(timezone.utc) - timedelta(days=days)

    query = Log.find(Log.user_id == user_id, Log.logged_at >= since)
    if log_type:
        query = query.find(Log.log_type == log_type)

    entries = await query.sort(-Log.logged_at).limit(limit).to_list()
    return LogsListResponse(
        count=len(entries),
        entries=[
            LogResponse(
                log_id=str(e.id),
                log_type=e.log_type.value,
                value=e.value,
                unit=e.unit,
                logged_at=e.logged_at,
            )
            for e in entries
        ],
    )


# ── Check-in ──────────────────────────────────────────────────────────────

@router.post("/checkin", response_model=CheckInResponse, tags=["checkin"])
async def submit_checkin_route(req: CheckInRequest):
    """Submit a wellness check-in and get an agent-generated personalised reply."""
    validate_object_id(req.session_id, "session_id")

    summary = await checkin_tool(
        user_id=req.user_id,
        session_id=req.session_id,
        mood=req.mood,
        energy=req.energy,
        sleep_hours=req.sleep_hours,
        stress=req.stress,
    )

    prompt = (
        f"The user submitted a wellness check-in: {summary}. "
        "Generate a warm personalised response following the instruction in the summary."
    )
    reply = await run_agent_turn(
        session_id=req.session_id,
        user_id=req.user_id,
        user_message=prompt,
    )

    checkin_doc = await CheckIn.get(summary["checkin_id"])
    if checkin_doc:
        checkin_doc.agent_response = reply
        await checkin_doc.save()

    return CheckInResponse(
        checkin_id=summary["checkin_id"],
        agent_reply=reply,
        scores=summary["scores"],
        derived=summary["derived"],
        created_at=datetime.now(timezone.utc),
    )