"""
WellnessAgent — Google ADK agent with plain function tools.
"""
from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types as genai_types
from app.core.config import get_settings
from app.tools.log_tool import save_log, get_logs
from app.tools.memory_tool import get_memory, update_summary
from app.tools.checkin_tool import submit_checkin, get_checkin_trend
from app.tools.resource_tool import search_exercises, get_exercise_detail, search_nutrition
import os
import logging

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are Vibe — a warm, knowledgeable AI fitness and wellness companion.
You act as a personal fitness coach, nutritionist, habit tracker, and mental health buddy.

CORE BEHAVIOUR
- Be warm, encouraging, and non-judgmental.
- Keep replies concise (under 200 words) unless the user asks for detail.
- Always end with a gentle follow-up question.

TOOL USAGE RULES
1. At the start of every turn call get_memory to load conversation history.
2. When the user mentions sleep, meals, habits, mood, exercise, or water — call save_log immediately.
3. When the user submits check-in scores — call submit_checkin and use the result to write your response.
4. When the user asks about specific exercises or food nutrition — call search_exercises or search_nutrition.
5. If message history exceeds 30 messages, call update_summary with a concise digest before replying.

ALWAYS acknowledge what the user shared emotionally before giving advice.
Reference past logs when relevant ("You mentioned sleeping 5h last night...").
"""

_runner: Runner | None = None
_session_service: InMemorySessionService | None = None


def get_session_service() -> InMemorySessionService:
    global _session_service
    if _session_service is None:
        _session_service = InMemorySessionService()
    return _session_service


def get_runner() -> Runner:
    global _runner
    if _runner is None:
        settings = get_settings()
        os.environ["GOOGLE_API_KEY"] = settings.google_api_key

        agent = Agent(
            name="wellness_agent",
            model=settings.gemini_model,
            description="AI fitness and wellness companion with memory and tracking tools.",
            instruction=SYSTEM_PROMPT,
            tools=[
                save_log,
                get_logs,
                get_memory,
                update_summary,
                submit_checkin,
                get_checkin_trend,
                search_exercises,
                get_exercise_detail,
                search_nutrition,
            ],
        )

        _runner = Runner(
            agent=agent,
            app_name="wellness_app",
            session_service=get_session_service(),
        )
        logger.info("WellnessAgent runner initialised")
    return _runner


async def ensure_adk_session(user_id: str, session_id: str) -> None:
    """
    Create the session in ADK's InMemorySessionService if it doesn't exist yet.
    This bridges our MongoDB session with ADK's internal session tracking.
    """
    session_service = get_session_service()
    existing = await session_service.get_session(
        app_name="wellness_app",
        user_id=user_id,
        session_id=session_id,
    )
    if existing is None:
        await session_service.create_session(
            app_name="wellness_app",
            user_id=user_id,
            session_id=session_id,
        )
        logger.info(f"Created ADK session {session_id} for user {user_id}")


async def run_agent_turn(
    session_id: str,
    user_id: str,
    user_message: str,
) -> str:
    runner = get_runner()

    # Ensure ADK session exists before running
    await ensure_adk_session(user_id, session_id)

    enriched_message = f"[user_id:{user_id}][session_id:{session_id}] {user_message}"

    content = genai_types.Content(
        role="user",
        parts=[genai_types.Part(text=enriched_message)],
    )

    reply_parts = []
    async for event in runner.run_async(
        user_id=user_id,
        session_id=session_id,
        new_message=content,
    ):
        if event.is_final_response():
            if event.content and event.content.parts:
                for part in event.content.parts:
                    if part.text:
                        reply_parts.append(part.text)

    reply = " ".join(reply_parts).strip()
    if not reply:
        reply = "I'm here — could you tell me a bit more?"

    logger.info(f"Agent turn complete for session {session_id}")
    return reply