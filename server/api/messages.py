"""
Messages API for SkillBridge platform
Endpoints: list conversations, get thread, send message, mark read.
"""
from __future__ import annotations

from datetime import datetime
from typing import List

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlmodel import Session, select, or_, and_

from database import engine
from models.message import DirectMessage
from models.user import UserProfile
from core.security import get_current_user

router = APIRouter()


def get_db():
    with Session(engine) as session:
        yield session


# ─── Schemas ─────────────────────────────────────────────────────────────────

class SendMessageRequest(BaseModel):
    content: str


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _user_summary(u: UserProfile) -> dict:
    return {
        "id": u.id,
        "full_name": u.full_name,
        "email": u.email,
        "is_mentor": u.is_mentor,
        "profile_picture_url": u.profile_picture_url,
        "job_title": u.job_title,
        "company": u.company,
    }


# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.get("/conversations")
def list_conversations(
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user),
):
    """Return all unique conversations for the current user, with the last message."""
    messages = db.exec(
        select(DirectMessage).where(
            or_(
                DirectMessage.sender_id == current_user.id,
                DirectMessage.receiver_id == current_user.id,
            )
        ).order_by(DirectMessage.created_at)
    ).all()

    # Group by partner user_id
    conversations: dict[int, dict] = {}
    for msg in messages:
        partner_id = msg.receiver_id if msg.sender_id == current_user.id else msg.sender_id
        conversations[partner_id] = {
            "partner_id": partner_id,
            "last_message": msg.content,
            "last_message_at": msg.created_at.isoformat(),
            "is_mine": msg.sender_id == current_user.id,
        }

    # Attach partner user info & unread counts
    result = []
    for partner_id, conv in conversations.items():
        partner = db.get(UserProfile, partner_id)
        if not partner:
            continue
        unread = db.exec(
            select(DirectMessage).where(
                and_(
                    DirectMessage.sender_id == partner_id,
                    DirectMessage.receiver_id == current_user.id,
                    DirectMessage.is_read == False,  # noqa: E712
                )
            )
        ).all()
        result.append({
            **conv,
            "partner": _user_summary(partner),
            "unread_count": len(unread),
        })

    result.sort(key=lambda x: x["last_message_at"], reverse=True)
    return result


@router.get("/{partner_id}")
def get_thread(
    partner_id: int,
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user),
):
    """Return all messages between current user and partner."""
    partner = db.get(UserProfile, partner_id)
    if not partner:
        raise HTTPException(status_code=404, detail="User not found")

    messages = db.exec(
        select(DirectMessage).where(
            or_(
                and_(
                    DirectMessage.sender_id == current_user.id,
                    DirectMessage.receiver_id == partner_id,
                ),
                and_(
                    DirectMessage.sender_id == partner_id,
                    DirectMessage.receiver_id == current_user.id,
                ),
            )
        ).order_by(DirectMessage.created_at)
    ).all()

    # Mark incoming messages as read
    for msg in messages:
        if msg.receiver_id == current_user.id and not msg.is_read:
            msg.is_read = True
    db.commit()

    return {
        "partner": _user_summary(partner),
        "messages": [
            {
                "id": m.id,
                "content": m.content,
                "sender_id": m.sender_id,
                "is_mine": m.sender_id == current_user.id,
                "is_read": m.is_read,
                "created_at": m.created_at.isoformat(),
            }
            for m in messages
        ],
    }


@router.post("/{partner_id}")
def send_message(
    partner_id: int,
    body: SendMessageRequest,
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user),
):
    """Send a message to another user."""
    if not body.content.strip():
        raise HTTPException(status_code=400, detail="Message content cannot be empty")

    partner = db.get(UserProfile, partner_id)
    if not partner:
        raise HTTPException(status_code=404, detail="Recipient not found")

    if partner_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot send a message to yourself")

    msg = DirectMessage(
        sender_id=current_user.id,
        receiver_id=partner_id,
        content=body.content.strip(),
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    return {
        "id": msg.id,
        "content": msg.content,
        "sender_id": msg.sender_id,
        "is_mine": True,
        "is_read": msg.is_read,
        "created_at": msg.created_at.isoformat(),
    }


@router.patch("/{partner_id}/read")
def mark_read(
    partner_id: int,
    db: Session = Depends(get_db),
    current_user: UserProfile = Depends(get_current_user),
):
    """Mark all messages from partner as read."""
    messages = db.exec(
        select(DirectMessage).where(
            and_(
                DirectMessage.sender_id == partner_id,
                DirectMessage.receiver_id == current_user.id,
                DirectMessage.is_read == False,  # noqa: E712
            )
        )
    ).all()
    for msg in messages:
        msg.is_read = True
    db.commit()
    return {"marked_read": len(messages)}
