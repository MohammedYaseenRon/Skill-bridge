"""
Sessions API for SkillBridge platform
Endpoints: book, list, cancel, confirm, complete, review sessions.
"""
from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Depends, status
from sqlmodel import Session, select

from database import engine
from models.session import MentorSession
from models.user import UserProfile
from core.security import get_current_user

router = APIRouter()


def get_session_db():
    with Session(engine) as session:
        yield session


# ─── helpers ─────────────────────────────────────────────────────────────────

def _session_to_dict(s: MentorSession, learner: UserProfile | None, mentor: UserProfile | None) -> dict:
    return {
        "id": s.id,
        "status": s.status,
        "session_type": s.session_type,
        "topic": s.topic,
        "notes": s.notes,
        "scheduled_date": s.scheduled_date.isoformat() if s.scheduled_date else None,
        "duration_minutes": s.duration_minutes,
        "learner_rating": s.learner_rating,
        "learner_review": s.learner_review,
        "mentor_notes": s.mentor_notes,
        "created_at": s.created_at.isoformat() if s.created_at else None,
        "learner": {
            "id": learner.id,
            "full_name": learner.full_name,
            "email": learner.email,
            "location": learner.location,
        } if learner else {"id": s.learner_id},
        "mentor": {
            "id": mentor.id,
            "full_name": mentor.full_name,
            "email": mentor.email,
            "job_title": mentor.job_title,
            "company": mentor.company,
            "hourly_rate": mentor.hourly_rate,
            "skills": mentor.skills,
            "location": mentor.location,
        } if mentor else {"id": s.mentor_id},
    }


def _load_parties(db: Session, s: MentorSession):
    learner = db.exec(select(UserProfile).where(UserProfile.id == s.learner_id)).first()
    mentor = db.exec(select(UserProfile).where(UserProfile.id == s.mentor_id)).first()
    return learner, mentor


# ─── endpoints ───────────────────────────────────────────────────────────────

@router.post("", status_code=status.HTTP_201_CREATED)
async def book_session(
    body: dict,
    current_user: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_session_db),
):
    """Learner books a session with a mentor."""
    if current_user.is_mentor:
        raise HTTPException(status_code=403, detail="Only learners can book sessions")

    mentor_id = body.get("mentor_id")
    if not mentor_id:
        raise HTTPException(status_code=400, detail="mentor_id is required")

    mentor = db.exec(select(UserProfile).where(
        UserProfile.id == mentor_id, UserProfile.is_mentor == True
    )).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")

    raw_date = body.get("scheduled_date")
    if not raw_date:
        raise HTTPException(status_code=400, detail="scheduled_date is required")
    try:
        scheduled_date = datetime.fromisoformat(raw_date.replace("Z", "+00:00"))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format (use ISO 8601)")

    new_session = MentorSession(
        learner_id=current_user.id,
        mentor_id=mentor_id,
        scheduled_date=scheduled_date,
        duration_minutes=int(body.get("duration_minutes", 60)),
        session_type=body.get("session_type", "video"),
        topic=body.get("topic", ""),
        notes=body.get("notes", ""),
        status="pending",
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return _session_to_dict(new_session, current_user, mentor)


@router.get("/my")
async def list_my_sessions(
    status_filter: Optional[str] = None,
    current_user: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_session_db),
):
    """Get all sessions for the current user (learner or mentor)."""
    if current_user.is_mentor:
        query = select(MentorSession).where(MentorSession.mentor_id == current_user.id)
    else:
        query = select(MentorSession).where(MentorSession.learner_id == current_user.id)

    if status_filter:
        query = query.where(MentorSession.status == status_filter)

    sessions = db.exec(query.order_by(MentorSession.scheduled_date.desc())).all()

    result = []
    for s in sessions:
        learner, mentor = _load_parties(db, s)
        result.append(_session_to_dict(s, learner, mentor))
    return result


@router.get("/upcoming")
async def upcoming_sessions(
    current_user: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_session_db),
):
    """Return confirmed/pending sessions scheduled in the future."""
    now = datetime.utcnow()
    if current_user.is_mentor:
        q = select(MentorSession).where(
            MentorSession.mentor_id == current_user.id,
            MentorSession.scheduled_date >= now,
            MentorSession.status.in_(["pending", "confirmed"]),
        )
    else:
        q = select(MentorSession).where(
            MentorSession.learner_id == current_user.id,
            MentorSession.scheduled_date >= now,
            MentorSession.status.in_(["pending", "confirmed"]),
        )

    sessions = db.exec(q.order_by(MentorSession.scheduled_date.asc())).all()
    result = []
    for s in sessions:
        learner, mentor = _load_parties(db, s)
        result.append(_session_to_dict(s, learner, mentor))
    return result


@router.patch("/{session_id}/confirm")
async def confirm_session(
    session_id: int,
    current_user: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_session_db),
):
    """Mentor confirms a pending session."""
    s = db.exec(select(MentorSession).where(MentorSession.id == session_id)).first()
    if not s:
        raise HTTPException(status_code=404, detail="Session not found")
    if s.mentor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the assigned mentor can confirm")
    if s.status != "pending":
        raise HTTPException(status_code=400, detail=f"Cannot confirm a '{s.status}' session")

    s.status = "confirmed"
    s.updated_at = datetime.utcnow()
    db.add(s)
    db.commit()
    db.refresh(s)
    learner, mentor = _load_parties(db, s)
    return _session_to_dict(s, learner, mentor)


@router.patch("/{session_id}/cancel")
async def cancel_session(
    session_id: int,
    body: dict = {},
    current_user: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_session_db),
):
    """Learner or mentor cancels a session."""
    s = db.exec(select(MentorSession).where(MentorSession.id == session_id)).first()
    if not s:
        raise HTTPException(status_code=404, detail="Session not found")
    if s.learner_id != current_user.id and s.mentor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorised to cancel this session")
    if s.status in ("completed", "cancelled"):
        raise HTTPException(status_code=400, detail=f"Session already {s.status}")

    s.status = "cancelled"
    s.updated_at = datetime.utcnow()
    if body.get("reason"):
        s.notes = (s.notes or "") + f"\n[Cancelled] {body['reason']}"
    db.add(s)
    db.commit()
    db.refresh(s)
    learner, mentor = _load_parties(db, s)
    return _session_to_dict(s, learner, mentor)


@router.patch("/{session_id}/complete")
async def complete_session(
    session_id: int,
    body: dict = {},
    current_user: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_session_db),
):
    """Mark a confirmed session as completed (mentor action)."""
    s = db.exec(select(MentorSession).where(MentorSession.id == session_id)).first()
    if not s:
        raise HTTPException(status_code=404, detail="Session not found")
    if s.mentor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the assigned mentor can complete")
    if s.status != "confirmed":
        raise HTTPException(status_code=400, detail=f"Cannot complete a '{s.status}' session")

    s.status = "completed"
    s.updated_at = datetime.utcnow()
    if body.get("mentor_notes"):
        s.mentor_notes = body["mentor_notes"]
    db.add(s)
    db.commit()
    db.refresh(s)
    learner, mentor = _load_parties(db, s)
    return _session_to_dict(s, learner, mentor)


@router.patch("/{session_id}/review")
async def review_session(
    session_id: int,
    body: dict,
    current_user: UserProfile = Depends(get_current_user),
    db: Session = Depends(get_session_db),
):
    """Learner submits a rating and review after session completion."""
    s = db.exec(select(MentorSession).where(MentorSession.id == session_id)).first()
    if not s:
        raise HTTPException(status_code=404, detail="Session not found")
    if s.learner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the learner can review")
    if s.status != "completed":
        raise HTTPException(status_code=400, detail="Can only review completed sessions")

    rating = body.get("rating")
    if rating is not None:
        if not (1 <= int(rating) <= 5):
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
        s.learner_rating = int(rating)
    if body.get("review"):
        s.learner_review = body["review"]

    s.updated_at = datetime.utcnow()
    db.add(s)
    db.commit()
    db.refresh(s)
    learner, mentor = _load_parties(db, s)
    return _session_to_dict(s, learner, mentor)
