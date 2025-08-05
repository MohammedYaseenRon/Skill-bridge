from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from database import engine
from models import UserProfile, MentorProfile
from schemas import UserCreate, UserRead, UserLogin, MentorProfileCreate, MentorProfileRead
from typing import List
from utils import hash_password, verify_password, create_access_token

router = APIRouter()

def get_session():
    with Session(engine) as session:
        yield session

@router.post("/register/", response_model=UserRead)
def create_user(user: UserCreate, session: Session = Depends(get_session)):
    existing = session.exec(select(UserProfile).where(UserProfile.email == user.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = hash_password(user.password)
    user_data = user.dict()
    user_data["password"] = hashed_password

    mentor_fields = [
        "skills", "expertise", "experience_years", "languages_spoken",
        "availability", "hourly_rate", "linkedin_url"
    ]
    mentor_data = {k: user_data.pop(k) for k in mentor_fields if user_data.get(k) is not None}

    db_user = UserProfile(**user_data)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)

    if db_user.is_mentor and mentor_data:
        mentor_data["user_id"] = db_user.id
        db_mentor = MentorProfile(**mentor_data)
        session.add(db_mentor)
        session.commit()
        session.refresh(db_mentor)

    return db_user

@router.get("/users/", response_model=List[UserRead])
def get_users(session: Session = Depends(get_session)):
    users = session.exec(select(UserProfile)).all()
    return users

@router.get("/users/{user_id}", response_model=UserRead)
def get_user(user_id: int, session: Session = Depends(get_session)):
    user = session.get(UserProfile, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/mentors/", response_model=List[MentorProfileRead])
def get_mentors(session: Session = Depends(get_session)):
    mentors = session.exec(select(MentorProfile)).all()
    return mentors

@router.get("/mentors/{mentor_id}", response_model=MentorProfileRead)
def get_mentor(mentor_id: int, session: Session = Depends(get_session)):
    mentor = session.get(MentorProfile, mentor_id)
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor profile not found")
    return mentor

@router.put("/mentors/{mentor_id}", response_model=MentorProfileRead)
def update_mentor_profile(mentor_id: int, profile: MentorProfileCreate, session: Session = Depends(get_session)):
    db_profile = session.get(MentorProfile, mentor_id)
    if not db_profile:
        raise HTTPException(status_code=404, detail="Mentor profile not found")
    profile_data = profile.dict(exclude_unset=True)
    for key, value in profile_data.items():
        setattr(db_profile, key, value)
    session.add(db_profile)
    session.commit()
    session.refresh(db_profile)
    return db_profile

@router.delete("/mentors/{mentor_id}")
def delete_mentor_profile(mentor_id: int, session: Session = Depends(get_session)):
    mentor = session.get(MentorProfile, mentor_id)
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor profile not found")
    session.delete(mentor)
    session.commit()
    return {"ok": True}

@router.post("/login")
def login(user: UserLogin, session: Session = Depends(get_session)):
    db_user = session.exec(select(UserProfile).where(UserProfile.email == user.email)).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Incorrect password")
    access_token = create_access_token(data={"sub": db_user.email, "user_id": db_user.id})

    mentor_profile = None
    if db_user.is_mentor:
        mentor_profile = session.exec(
            select(MentorProfile).where(MentorProfile.user_id == db_user.id)
        ).first()

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "full_name": db_user.full_name,
            "email": db_user.email,
            "is_mentor": db_user.is_mentor,
            # add other user fields as needed
        },
        "mentor_profile": mentor_profile
    }