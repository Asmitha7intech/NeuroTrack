from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    histories = relationship("SessionHistory", back_populates="user", cascade="all, delete-orphan")


class SessionHistory(Base):
    __tablename__ = "session_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    session_label = Column(String(255), nullable=True)

    overall_score = Column(Float, nullable=True)
    overall_risk = Column(String(100), nullable=True)
    dominant_concern_area = Column(String(100), nullable=True)

    typing_score = Column(Float, nullable=True)
    attention_score = Column(Float, nullable=True)
    reading_score = Column(Float, nullable=True)

    predicted_risk = Column(String(100), nullable=True)
    confidence = Column(Float, nullable=True)

    typing_result = Column(JSON, nullable=True)
    attention_result = Column(JSON, nullable=True)
    reading_result = Column(JSON, nullable=True)
    final_result = Column(JSON, nullable=True)
    prediction_result = Column(JSON, nullable=True)

    recommendation = Column(Text, nullable=True)
    final_summary = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="histories")
