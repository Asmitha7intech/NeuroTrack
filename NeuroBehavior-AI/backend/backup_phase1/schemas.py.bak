from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, EmailStr, Field


class UserSignupRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class HistorySaveRequest(BaseModel):
    session_label: Optional[str] = None
    typing_result: Optional[Dict[str, Any]] = None
    attention_result: Optional[Dict[str, Any]] = None
    reading_result: Optional[Dict[str, Any]] = None
    final_result: Optional[Dict[str, Any]] = None
    prediction_result: Optional[Dict[str, Any]] = None


class HistoryItemResponse(BaseModel):
    id: int
    session_label: Optional[str] = None
    overall_score: Optional[float] = None
    overall_risk: Optional[str] = None
    dominant_concern_area: Optional[str] = None
    typing_score: Optional[float] = None
    attention_score: Optional[float] = None
    reading_score: Optional[float] = None
    predicted_risk: Optional[str] = None
    confidence: Optional[float] = None
    typing_result: Optional[Dict[str, Any]] = None
    attention_result: Optional[Dict[str, Any]] = None
    reading_result: Optional[Dict[str, Any]] = None
    final_result: Optional[Dict[str, Any]] = None
    prediction_result: Optional[Dict[str, Any]] = None
    recommendation: Optional[str] = None
    final_summary: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class HistoryListResponse(BaseModel):
    items: List[HistoryItemResponse]
