"""
Direct message model for SkillBridge platform
"""
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class DirectMessage(SQLModel, table=True):
    """Database model for direct messages between users."""
    __tablename__ = "direct_messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    sender_id: int = Field(foreign_key="users.id", index=True)
    receiver_id: int = Field(foreign_key="users.id", index=True)
    content: str
    is_read: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
