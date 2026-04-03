from datetime import datetime
from typing import Any, Dict

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..dependencies import get_current_user, get_db
from ..models import SessionHistory, User
from ..schemas import HistoryItemResponse, HistoryListResponse, HistorySaveRequest

router = APIRouter(prefix="/history", tags=["history"])


def _extract_number(data: Dict[str, Any] | None, *keys: str):
    if not isinstance(data, dict):
        return None
    for key in keys:
        value = data.get(key)
        if isinstance(value, (int, float)):
            return float(value)
        if isinstance(value, str):
            try:
                return float(value)
            except ValueError:
                continue
    return None


def _extract_text(data: Dict[str, Any] | None, *keys: str):
    if not isinstance(data, dict):
        return None
    for key in keys:
        value = data.get(key)
        if value is not None:
            return str(value)
    return None


@router.post("/save", response_model=HistoryItemResponse)
def save_history(
    payload: HistorySaveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    final_result = payload.final_result or {}
    prediction_result = payload.prediction_result or {}

    history = SessionHistory(
        user_id=current_user.id,
        session_label=payload.session_label or f"Session {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}",
        overall_score=_extract_number(final_result, "overallScore", "overall_score"),
        overall_risk=_extract_text(final_result, "overallRisk", "overall_risk"),
        dominant_concern_area=_extract_text(final_result, "dominantConcernArea", "dominant_concern_area"),
        typing_score=_extract_number(final_result, "typingScore", "typing_score"),
        attention_score=_extract_number(final_result, "attentionScore", "attention_score"),
        reading_score=_extract_number(final_result, "readingScore", "reading_score"),
        predicted_risk=_extract_text(prediction_result, "predictedRisk", "predicted_risk"),
        confidence=_extract_number(prediction_result, "confidence"),
        typing_result=payload.typing_result,
        attention_result=payload.attention_result,
        reading_result=payload.reading_result,
        final_result=payload.final_result,
        prediction_result=payload.prediction_result,
        recommendation=_extract_text(final_result, "recommendation"),
        final_summary=_extract_text(final_result, "finalSummary", "final_summary"),
    )

    db.add(history)
    db.commit()
    db.refresh(history)

    return HistoryItemResponse.model_validate(history)


@router.get("/me", response_model=HistoryListResponse)
def get_my_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    records = (
        db.query(SessionHistory)
        .filter(SessionHistory.user_id == current_user.id)
        .order_by(SessionHistory.created_at.desc(), SessionHistory.id.desc())
        .all()
    )

    return HistoryListResponse(items=[HistoryItemResponse.model_validate(item) for item in records])
