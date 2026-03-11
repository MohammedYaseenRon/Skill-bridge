"""
User management API endpoints for SkillBridge platform
Handles user registration, authentication, profile management, and mentor operations
"""
from __future__ import annotations
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, status
from sqlmodel import Session, select
from database import engine
from models import UserProfile
from core.security import hash_password, verify_password, create_access_token, get_current_user
from core.dependencies import get_db
import logging

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()  # Remove prefix here - it will be added in main.py


def get_session():
    """Database session dependency"""
    with Session(engine) as session:
        yield session


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: dict, session: Session = Depends(get_session)):
    """
    Register a new user account (learner or mentor)
    Creates user profile based on provided data
    """
    try:
        # Check if email already exists
        existing_user = session.exec(
            select(UserProfile).where(UserProfile.email == user_data.get("email"))
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Hash password
        hashed_password = hash_password(user_data.get("password"))
        
        # Create user profile
        db_user = UserProfile(
            email=user_data.get("email"),
            hashed_password=hashed_password,
            full_name=user_data.get("full_name"),
            phone_number=user_data.get("phone_number"),
            bio=user_data.get("bio"),
            location=user_data.get("location"),
            is_mentor=user_data.get("is_mentor", False),
            
            # Learner fields
            learning_goal=user_data.get("learning_goal"),
            preferred_language=user_data.get("preferred_language", "English"),
            learning_style=user_data.get("learning_style"),
            experience_level=user_data.get("experience_level"),
            availability=user_data.get("availability"),
            skills_interested=user_data.get("skills_interested"),
            current_skills=user_data.get("current_skills"),
            
            # Mentor fields (if applicable)
            skills=user_data.get("skills"),
            expertise=user_data.get("expertise"),
            experience_years=user_data.get("experience_years"),
            languages_spoken=user_data.get("languages_spoken", "English"),
            mentor_availability=user_data.get("mentor_availability"),
            hourly_rate=user_data.get("hourly_rate", 0.0),
            linkedin_url=user_data.get("linkedin_url"),
            company=user_data.get("company"),
            job_title=user_data.get("job_title"),
        )
        
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        
        # Create access token
        access_token = create_access_token(
            data={"sub": db_user.email, "user_id": db_user.id}
        )
        
        logger.info(f"User registered successfully: {db_user.email}")
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": db_user.id,
                "email": db_user.email,
                "full_name": db_user.full_name,
                "is_mentor": db_user.is_mentor,
                "role": "mentor" if db_user.is_mentor else "learner",
                "bio": db_user.bio,
                "location": db_user.location,
                "phone_number": db_user.phone_number,
                "skills": db_user.skills,
                "expertise": db_user.expertise,
                "experience_years": db_user.experience_years,
                "hourly_rate": db_user.hourly_rate,
                "company": db_user.company,
                "job_title": db_user.job_title,
                "skills_interested": db_user.skills_interested,
                "current_skills": db_user.current_skills,
                "learning_goal": db_user.learning_goal,
                "experience_level": db_user.experience_level,
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=dict)
async def login_user(login_data: dict, session: Session = Depends(get_session)):
    """
    Authenticate user and return access token
    """
    try:
        # Find user by email
        db_user = session.exec(
            select(UserProfile).where(UserProfile.email == login_data.get("email"))
        ).first()
        
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verify password
        if not verify_password(login_data.get("password"), db_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Create access token
        access_token = create_access_token(
            data={"sub": db_user.email, "user_id": db_user.id}
        )
        
        logger.info(f"User logged in successfully: {db_user.email}")
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": db_user.id,
                "email": db_user.email,
                "full_name": db_user.full_name,
                "is_mentor": db_user.is_mentor,
                "role": "mentor" if db_user.is_mentor else "learner",
                "bio": db_user.bio,
                "location": db_user.location,
                "phone_number": db_user.phone_number,
                "skills": db_user.skills,
                "expertise": db_user.expertise,
                "experience_years": db_user.experience_years,
                "hourly_rate": db_user.hourly_rate,
                "company": db_user.company,
                "job_title": db_user.job_title,
                "skills_interested": db_user.skills_interested,
                "current_skills": db_user.current_skills,
                "learning_goal": db_user.learning_goal,
                "experience_level": db_user.experience_level,
                "languages_spoken": db_user.languages_spoken,
                "mentor_availability": db_user.mentor_availability,
                "linkedin_url": db_user.linkedin_url,
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )


@router.get("/me", response_model=dict)
async def get_current_user_profile(
    current_user: UserProfile = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get current user's profile"""
    try:
        return {
            "id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "phone_number": current_user.phone_number,
            "bio": current_user.bio,
            "location": current_user.location,
            "is_mentor": current_user.is_mentor,
            "role": "mentor" if current_user.is_mentor else "learner",
            "learning_goal": current_user.learning_goal,
            "preferred_language": current_user.preferred_language,
            "skills_interested": current_user.skills_interested,
            "current_skills": current_user.current_skills,
            "experience_level": current_user.experience_level,
            "learning_style": current_user.learning_style,
            "availability": current_user.availability,
            "skills": current_user.skills,
            "expertise": current_user.expertise,
            "experience_years": current_user.experience_years,
            "hourly_rate": current_user.hourly_rate,
            "company": current_user.company,
            "job_title": current_user.job_title,
            "linkedin_url": current_user.linkedin_url,
            "languages_spoken": current_user.languages_spoken,
            "mentor_availability": current_user.mentor_availability,
            "profile_picture_url": current_user.profile_picture_url,
        }
        
    except Exception as e:
        logger.error(f"Get current user error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user profile"
        )


@router.put("/me", response_model=dict)
async def update_current_user_profile(
    update_data: dict,
    current_user: UserProfile = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update current user's profile"""
    try:
        # Get the user from the session-bound DB
        db_user = session.exec(
            select(UserProfile).where(UserProfile.id == current_user.id)
        ).first()

        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")

        # Allowed fields to update
        updatable_fields = [
            "full_name", "phone_number", "bio", "location",
            "learning_goal", "preferred_language", "learning_style",
            "experience_level", "availability", "skills_interested", "current_skills",
            "skills", "expertise", "experience_years", "hourly_rate",
            "company", "job_title", "linkedin_url", "languages_spoken",
            "mentor_availability", "profile_picture_url"
        ]

        for field in updatable_fields:
            if field in update_data and update_data[field] is not None:
                setattr(db_user, field, update_data[field])

        session.add(db_user)
        session.commit()
        session.refresh(db_user)

        logger.info(f"Profile updated for user: {db_user.email}")

        return {
            "id": db_user.id,
            "email": db_user.email,
            "full_name": db_user.full_name,
            "phone_number": db_user.phone_number,
            "bio": db_user.bio,
            "location": db_user.location,
            "is_mentor": db_user.is_mentor,
            "role": "mentor" if db_user.is_mentor else "learner",
            "learning_goal": db_user.learning_goal,
            "preferred_language": db_user.preferred_language,
            "skills_interested": db_user.skills_interested,
            "current_skills": db_user.current_skills,
            "experience_level": db_user.experience_level,
            "learning_style": db_user.learning_style,
            "availability": db_user.availability,
            "skills": db_user.skills,
            "expertise": db_user.expertise,
            "experience_years": db_user.experience_years,
            "hourly_rate": db_user.hourly_rate,
            "company": db_user.company,
            "job_title": db_user.job_title,
            "linkedin_url": db_user.linkedin_url,
            "languages_spoken": db_user.languages_spoken,
            "mentor_availability": db_user.mentor_availability,
            "profile_picture_url": db_user.profile_picture_url,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update profile error: {str(e)}")
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Profile update failed: {str(e)}"
        )


@router.get("/mentors", response_model=List[dict])
async def get_all_mentors(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    session: Session = Depends(get_session)
):
    """Get all mentors with optional search"""
    try:
        query = select(UserProfile).where(UserProfile.is_mentor == True)
        mentors = session.exec(query.offset(skip).limit(limit)).all()
        
        # Apply search filter in Python for simplicity
        if search:
            search_lower = search.lower()
            mentors = [
                m for m in mentors
                if (search_lower in (m.full_name or "").lower() or
                    search_lower in (m.skills or "").lower() or
                    search_lower in (m.expertise or "").lower() or
                    search_lower in (m.location or "").lower() or
                    search_lower in (m.job_title or "").lower() or
                    search_lower in (m.company or "").lower())
            ]
        
        return [
            {
                "id": mentor.id,
                "full_name": mentor.full_name,
                "email": mentor.email,
                "bio": mentor.bio,
                "skills": mentor.skills,
                "expertise": mentor.expertise,
                "experience_years": mentor.experience_years,
                "hourly_rate": mentor.hourly_rate,
                "location": mentor.location,
                "company": mentor.company,
                "job_title": mentor.job_title,
                "linkedin_url": mentor.linkedin_url,
                "languages_spoken": mentor.languages_spoken,
                "mentor_availability": mentor.mentor_availability,
                "profile_picture_url": mentor.profile_picture_url,
            }
            for mentor in mentors
        ]
        
    except Exception as e:
        logger.error(f"Get mentors error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch mentors: {str(e)}"
        )


@router.get("/stats", response_model=dict)
async def get_platform_stats(session: Session = Depends(get_session)):
    """Get overall platform stats (public)"""
    try:
        all_users = session.exec(select(UserProfile)).all()
        mentors = [u for u in all_users if u.is_mentor]
        learners = [u for u in all_users if not u.is_mentor]

        return {
            "total_mentors": len(mentors),
            "total_learners": len(learners),
            "total_users": len(all_users),
        }
    except Exception as e:
        logger.error(f"Stats error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch stats: {str(e)}"
        )


@router.get("/mentor/dashboard", response_model=dict)
async def get_mentor_dashboard(
    current_user: UserProfile = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get dashboard data for mentor"""
    if not current_user.is_mentor:
        raise HTTPException(status_code=403, detail="Not a mentor account")
    
    try:
        # Get all learners as potential mentees (in a real app, this would be connections)
        all_learners = session.exec(
            select(UserProfile).where(UserProfile.is_mentor == False).limit(20)
        ).all()

        # Build mentee list with simulated data
        mentees = [
            {
                "id": l.id,
                "name": l.full_name,
                "email": l.email,
                "field": l.skills_interested or l.learning_goal or "General Learning",
                "progress": min(100, max(30, (l.id * 17) % 100)),  # Deterministic pseudo-random
                "experience_level": l.experience_level or "beginner",
                "location": l.location,
            }
            for l in all_learners[:5]
        ]

        # Platform stats
        all_mentors = session.exec(select(UserProfile).where(UserProfile.is_mentor == True)).all()

        return {
            "mentor": {
                "id": current_user.id,
                "full_name": current_user.full_name,
                "email": current_user.email,
                "bio": current_user.bio,
                "skills": current_user.skills,
                "expertise": current_user.expertise,
                "experience_years": current_user.experience_years,
                "hourly_rate": current_user.hourly_rate,
                "company": current_user.company,
                "job_title": current_user.job_title,
                "location": current_user.location,
                "linkedin_url": current_user.linkedin_url,
                "languages_spoken": current_user.languages_spoken,
                "mentor_availability": current_user.mentor_availability,
            },
            "stats": {
                "total_mentees": len(all_learners),
                "total_mentors": len(all_mentors),
                "sessions_this_month": max(5, (current_user.id * 3) % 20),
                "average_rating": round(4.5 + (current_user.id % 5) * 0.1, 1),
                "earnings_this_month": (current_user.hourly_rate or 50) * max(5, (current_user.id * 3) % 20),
            },
            "recent_mentees": mentees,
        }
    except Exception as e:
        logger.error(f"Mentor dashboard error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch mentor dashboard: {str(e)}"
        )


@router.get("/learner/dashboard", response_model=dict)
async def get_learner_dashboard(
    current_user: UserProfile = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get dashboard data for learner"""
    if current_user.is_mentor:
        raise HTTPException(status_code=403, detail="Not a learner account")

    try:
        # Get featured mentors (top 3 by experience)
        all_mentors = session.exec(
            select(UserProfile).where(UserProfile.is_mentor == True).limit(50)
        ).all()
        
        # Sort by experience years
        sorted_mentors = sorted(
            all_mentors,
            key=lambda m: m.experience_years or 0,
            reverse=True
        )

        featured_mentors = [
            {
                "id": m.id,
                "full_name": m.full_name,
                "email": m.email,
                "bio": m.bio,
                "skills": m.skills,
                "expertise": m.expertise,
                "experience_years": m.experience_years,
                "hourly_rate": m.hourly_rate,
                "location": m.location,
                "company": m.company,
                "job_title": m.job_title,
                "rating": round(4.5 + (m.id % 5) * 0.1, 1),
            }
            for m in sorted_mentors[:3]
        ]

        return {
            "learner": {
                "id": current_user.id,
                "full_name": current_user.full_name,
                "email": current_user.email,
                "bio": current_user.bio,
                "learning_goal": current_user.learning_goal,
                "skills_interested": current_user.skills_interested,
                "current_skills": current_user.current_skills,
                "experience_level": current_user.experience_level,
                "learning_style": current_user.learning_style,
                "location": current_user.location,
            },
            "stats": {
                "total_mentors_available": len(all_mentors),
                "sessions_completed": max(2, (current_user.id * 2) % 15),
                "skills_learning": len((current_user.skills_interested or "").split(",")) if current_user.skills_interested else 0,
            },
            "featured_mentors": featured_mentors,
        }
    except Exception as e:
        logger.error(f"Learner dashboard error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch learner dashboard: {str(e)}"
        )


@router.get("/debug", response_model=dict)
async def debug_users(session: Session = Depends(get_session)):
    """Debug endpoint to check users"""
    try:
        users = session.exec(select(UserProfile)).all()
        mentors = [u for u in users if u.is_mentor]
        learners = [u for u in users if not u.is_mentor]
        
        return {
            "total_users": len(users),
            "mentors": len(mentors),
            "learners": len(learners),
            "sample_users": [
                {
                    "id": u.id,
                    "name": u.full_name,
                    "email": u.email,
                    "is_mentor": u.is_mentor
                }
                for u in users[:5]
            ]
        }
    except Exception as e:
        logger.error(f"Debug failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Debug failed: {str(e)}"
        )