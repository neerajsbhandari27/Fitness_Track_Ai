"""
Memory tool functions — load and update conversation session memory.
"""
from datetime import datetime, timezone
from typing import Optional
from app.models.session import Session
import logging

logger = logging.getLogger(__name__)


async def get_memory(session_id: str, last_n_messages: int = 20) -> dict:
    """
    Load recent chat history and rolling summary for a session.
    Call this at the start of every turn to get conversation context.
    """
    session = await Session.get(session_id)
    if not session:
        return {"found": False, "messages": [], "summary": None}

    recent = session.messages[-last_n_messages:]
    return {
        "found": True,
        "summary": session.summary,
        "message_count": len(session.messages),
        "messages": [
            {
                "role": m.role,
                "content": m.content,
                "timestamp": m.timestamp.isoformat(),
            }
            for m in recent
        ],
    }


async def update_summary(session_id: str, summary: str) -> dict:
    """
    Persist a compressed summary of older conversation context.
    Call this when message history exceeds 30 messages to avoid losing context.
    """
    session = await Session.get(session_id)
    if not session:
        return {"success": False, "error": "Session not found"}

    session.summary = summary
    session.updated_at = datetime.now(timezone.utc)
    await session.save()
    logger.info(f"Updated summary for session {session_id}")
    return {"success": True}