from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    phone_number: Optional[str] = None
    profile_picture_url: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    is_mentor: bool = False

class UserRead(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone_number: Optional[str] = None
    profile_picture_url: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    is_mentor: bool

    class Config:
        orm_mode = True

class MentorProfileCreate(BaseModel):
    user_id: int
    skills: str
    expertise: str
    experience_years: int
    languages_spoken: str
    availability: str
    hourly_rate: Optional[float] = None
    linkedin_url: Optional[str] = None
    is_active: bool = True


class UserLogin(BaseModel):
    email: str
    password: str


class MentorProfileRead(MentorProfileCreate):
    id: int

    class Config:
        orm_mode = True