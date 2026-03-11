"""
Session models for SkillBridge platform
Handles mentoring session bookings between learners and mentors.
"""
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class MentorSession(SQLModel, table=True):
    """Database model for a mentoring session booking."""
    __tablename__ = "sessions"

    id: Optional[int] = Field(default=None, primary_key=True)
    learner_id: int = Field(foreign_key="users.id", index=True)
    mentor_id: int = Field(foreign_key="users.id", index=True)

    # Scheduling
    scheduled_date: datetime
    duration_minutes: int = Field(default=60)

    # Session details
    session_type: str = Field(default="video")  # video | chat | phone
    topic: Optional[str] = None
    notes: Optional[str] = None  # learner notes / agenda

    # Status lifecycle: pending → confirmed → completed | cancelled
    status: str = Field(default="pending")

    # Feedback (filled after completion)
    learner_rating: Optional[int] = None   # 1-5
    learner_review: Optional[str] = None
    mentor_notes: Optional[str] = None    # private mentor notes

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
