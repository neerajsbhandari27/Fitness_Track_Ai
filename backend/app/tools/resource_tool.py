"""
Resource tool functions — fetch data from external wellness APIs.
Wger (exercise DB, no key needed) and Nutritionix (nutrition, optional key).
"""
from typing import Optional
import httpx
from app.core.config import get_settings
import logging

logger = logging.getLogger(__name__)


async def search_exercises(query: str, limit: int = 5) -> dict:
    """
    Search the Wger exercise database by name or muscle group.
    Returns exercise names, categories, and muscle groups.
    Always call this instead of guessing when the user asks about specific exercises.
    """
    settings = get_settings()
    url = f"{settings.wger_base_url}/exercise/search/"
    params = {"term": query, "language": "english", "format": "json"}

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()

        suggestions = data.get("suggestions", [])[:limit]
        results = [
            {
                "name": s.get("value"),
                "exercise_id": s.get("data", {}).get("id"),
                "category": s.get("data", {}).get("category"),
                "muscles": s.get("data", {}).get("muscles", []),
            }
            for s in suggestions
        ]
        logger.info(f"Wger search '{query}': {len(results)} results")
        return {"source": "wger", "query": query, "results": results}

    except httpx.HTTPError as e:
        logger.error(f"Wger API error: {e}")
        return {"source": "wger", "error": str(e), "results": []}


async def get_exercise_detail(exercise_id: int) -> dict:
    """
    Fetch full detail for a single Wger exercise by its ID.
    Returns muscles worked, equipment needed, and instructions.
    """
    settings = get_settings()
    url = f"{settings.wger_base_url}/exerciseinfo/{exercise_id}/"

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url, params={"format": "json"})
            resp.raise_for_status()
            data = resp.json()

        description = ""
        for trans in data.get("translations", []):
            if trans.get("language") == 2:
                description = trans.get("description", "")
                break

        return {
            "source": "wger",
            "name": data.get("name", ""),
            "category": data.get("category", {}).get("name", ""),
            "muscles_primary": [m.get("name_en") for m in data.get("muscles", [])],
            "muscles_secondary": [m.get("name_en") for m in data.get("muscles_secondary", [])],
            "equipment": [e.get("name") for e in data.get("equipment", [])],
            "description": description,
        }
    except httpx.HTTPError as e:
        logger.error(f"Wger detail error: {e}")
        return {"source": "wger", "error": str(e)}


async def search_nutrition(query: str) -> dict:
    """
    Look up calorie and macro data for foods using natural language.
    Example query: '1 cup oatmeal with banana'.
    Always call this instead of guessing when the user asks about food nutrition.
    """
    settings = get_settings()

    if not settings.nutritionix_app_id or not settings.nutritionix_api_key:
        return {
            "source": "nutritionix",
            "error": "Nutritionix API keys not configured.",
            "results": [],
        }

    url = "https://trackapi.nutritionix.com/v2/natural/nutrients"
    headers = {
        "x-app-id": settings.nutritionix_app_id,
        "x-app-key": settings.nutritionix_api_key,
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json={"query": query}, headers=headers)
            resp.raise_for_status()
            data = resp.json()

        results = [
            {
                "food_name": f.get("food_name"),
                "serving_qty": f.get("serving_qty"),
                "serving_unit": f.get("serving_unit"),
                "calories": f.get("nf_calories"),
                "protein_g": f.get("nf_protein"),
                "carbs_g": f.get("nf_total_carbohydrate"),
                "fat_g": f.get("nf_total_fat"),
                "fiber_g": f.get("nf_dietary_fiber"),
            }
            for f in data.get("foods", [])
        ]
        logger.info(f"Nutritionix '{query}': {len(results)} foods")
        return {"source": "nutritionix", "query": query, "results": results}

    except httpx.HTTPError as e:
        logger.error(f"Nutritionix error: {e}")
        return {"source": "nutritionix", "error": str(e), "results": []}