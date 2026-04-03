"""
Log tool functions — save and retrieve wellness log entries.
Registered with the ADK agent as plain async functions.
"""
from datetime import datetime, timezone, timedelta
from typing import Optional, Any
from app.models.log import Log, LogType
import logging

logger = logging.getLogger(__name__)


async def save_log(
    user_id: str,
    session_id: str,
    log_type: str,
    value: Any,
    unit: Optional[str] = None,
    notes: Optional[str] = None,
) -> dict:
    """
    Save a wellness log entry to the database.
    log_type must be one of: sleep, meal, habit, mood, exercise, water.
    value is a float for sleep hours or water ml, string for meal/habit, int 1-10 for mood.
    """
    try:
        lt = LogType(log_type.lower())
    except ValueError:
        return {"success": False, "error": f"Unknown log_type '{log_type}'. Valid: {[t.value for t in LogType]}"}

    entry = Log(
        user_id=user_id,
        session_id=session_id,
        log_type=lt,
        value=value,
        unit=unit,
        notes=notes,
        source="agent",
    )
    await entry.insert()
    logger.info(f"Saved {lt.value} log for user {user_id}")
    return {
        "success": True,
        "log_id": str(entry.id),
        "log_type": lt.value,
        "value": value,
        "unit": unit,
    }


async def get_logs(
    user_id: str,
    log_type: Optional[str] = None,
    days: int = 7,
    limit: int = 20,
) -> dict:
    """
    Retrieve recent wellness log entries for a user.
    Optionally filter by log_type. Returns entries from the last N days.
    """
    since = datetime.now(timezone.utc) - timedelta(days=days)
    query = Log.find(Log.user_id == user_id, Log.logged_at >= since)

    if log_type:
        try:
            query = query.find(Log.log_type == LogType(log_type.lower()))
        except ValueError:
            pass

    entries = await query.sort(-Log.logged_at).limit(limit).to_list()
    return {
        "count": len(entries),
        "entries": [
            {
                "id": str(e.id),
                "type": e.log_type.value,
                "value": e.value,
                "unit": e.unit,
                "notes": e.notes,
                "logged_at": e.logged_at.isoformat(),
            }
            for e in entries
        ],
    }