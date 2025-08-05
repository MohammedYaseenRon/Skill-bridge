from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List

class UserProfile(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    full_name: str
    email: str
    password: str
    phone_number: Optional[str]
    profile_picture_url: Optional[str]
    bio: Optional[str]
    location: Optional[str]
    is_mentor: bool = False

    # Relationship
    mentor_profile: Optional["MentorProfile"] = Relationship(back_populates="user")

class MentorProfile(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="userprofile.id")
    skills: str
    expertise: str
    experience_years: int
    languages_spoken: str  # comma-separated or JSON string
    availability: str
    hourly_rate: Optional[float]
    linkedin_url: Optional[str]
    is_active: bool = True

    # Relationship
    user: UserProfile = Relationship(back_populates="mentor_profile")
