import logging
from typing import Literal

from fastapi import APIRouter, Request
from pydantic import BaseModel, field_validator

from app.metrics import RATING_TOTAL, RATING_HELPFUL_RATIO

logger = logging.getLogger(__name__)
router = APIRouter()

POSITIVE_RATINGS = {"very_helpful", "helpful"}
ALL_RATING_VALUES = ("very_helpful", "helpful", "not_helpful", "very_not_helpful")

# Running totals untuk kalkulasi helpful ratio tanpa query ke Supabase
_rating_counts: dict[str, int] = {v: 0 for v in ALL_RATING_VALUES}


class RatingRequest(BaseModel):
    question: str
    answer: str
    rating: Literal["very_helpful", "helpful", "not_helpful", "very_not_helpful"]

    @field_validator("answer")
    @classmethod
    def truncate_answer(cls, v: str) -> str:
        return v[:1000] if len(v) > 1000 else v

    @field_validator("question")
    @classmethod
    def truncate_question(cls, v: str) -> str:
        return v[:500] if len(v) > 500 else v


class RatingResponse(BaseModel):
    status: str
    rating: str


@router.post("/api/rating", response_model=RatingResponse, status_code=201)
async def submit_rating(body: RatingRequest, request: Request):
    # Catat ke Prometheus (selalu, bahkan jika Supabase gagal)
    RATING_TOTAL.labels(rating=body.rating).inc()
    _rating_counts[body.rating] += 1

    total = sum(_rating_counts.values())
    positive = sum(_rating_counts[r] for r in POSITIVE_RATINGS)
    RATING_HELPFUL_RATIO.set(positive / total if total > 0 else 0.0)

    # Simpan ke Supabase (graceful fallback jika tidak tersedia)
    supabase_client = getattr(request.app.state, "supabase", None)
    if supabase_client is None:
        live_ctx = getattr(request.app.state, "live_context", None)
        if live_ctx is not None:
            supabase_client = getattr(live_ctx, "_client", None)

    if supabase_client is not None:
        try:
            supabase_client.table("chat_ratings").insert({
                "question": body.question,
                "answer": body.answer,
                "rating": body.rating,
            }).execute()
        except Exception as e:
            logger.warning(f"Supabase insert rating failed (metric still recorded): {e}")
    else:
        logger.info("Supabase not available — rating recorded in Prometheus only")

    return RatingResponse(status="ok", rating=body.rating)
