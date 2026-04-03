"""
Check-in tool functions — submit wellness scores and retrieve trends.
"""
from datetime import datetime, timezone, timedelta
from typing import Optional
from app.models.checkin import CheckIn
import logging

logger = logging.getLogger(__name__)


async def submit_checkin(
    user_id: str,
    session_id: str,
    mood: int,
    energy: int,
    sleep_hours: float,
    stress: int,
) -> dict:
    """
    Save a wellness check-in (mood 1-10, energy 1-10, sleep_hours, stress 1-10).
    Returns a structured summary to use when composing a personalised response.
    """
    entry = CheckIn(
        user_id=user_id,
        session_id=session_id,
        mood=mood,
        energy=energy,
        sleep_hours=sleep_hours,
        stress=stress,
    )
    await entry.insert()

    overall = round((mood + energy + (10 - stress)) / 3, 1)
    sleep_status = (
        "optimal" if sleep_hours >= 7.5 else
        "acceptable" if sleep_hours >= 6 else
        "insufficient"
    )

    flags = []
    if mood <= 3:       flags.append("low_mood")
    if energy <= 3:     flags.append("low_energy")
    if stress >= 8:     flags.append("high_stress")
    if sleep_hours < 6: flags.append("sleep_deficit")

    logger.info(f"CheckIn saved for user {user_id}: overall={overall}")
    return {
        "checkin_id": str(entry.id),
        "scores": {"mood": mood, "energy": energy, "sleep_hours": sleep_hours, "stress": stress},
        "derived": {"overall_score": overall, "sleep_status": sleep_status, "flags": flags},
        "instruction": (
            "Use the scores and flags to write a warm, empathetic 3-4 sentence response. "
            "Acknowledge the specific scores, give one actionable tip tied to the lowest score, "
            "and close encouragingly."
        ),
    }


async def get_checkin_trend(user_id: str, days: int = 7) -> dict:
    """
    Return aggregated check-in trends for the last N days.
    Use this to reference patterns when responding to the user.
    """
    since = datetime.now(timezone.utc) - timedelta(days=days)
    entries = await CheckIn.find(
        CheckIn.user_id == user_id,
        CheckIn.created_at >= since,
    ).sort(-CheckIn.created_at).to_list()

    if not entries:
        return {"found": False, "message": "No check-ins in this period."}

    def avg(field):
        return round(sum(getattr(e, field) for e in entries) / len(entries), 1)

    return {
        "found": True,
        "count": len(entries),
        "averages": {
            "mood": avg("mood"),
            "energy": avg("energy"),
            "sleep_hours": avg("sleep_hours"),
            "stress": avg("stress"),
        },
        "latest": {
            "mood": entries[0].mood,
            "energy": entries[0].energy,
            "sleep_hours": entries[0].sleep_hours,
            "stress": entries[0].stress,
            "date": entries[0].created_at.isoformat(),
        },
    }