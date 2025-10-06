"""
Models package for SkillBridge platform

This package contains all data models used throughout the application,
including database models, API request/response models, and authentication models.

The models are organized by domain:
- user: User profiles, authentication, and account management
- recommendation: Mentor recommendation system models
"""

# Import user models
from .user import (
    UserProfile,
    MentorProfile, 
    UserCreate,
    UserUpdate,
    UserResponse,
    Token,
    TokenData,
    UserInDB
)

# Import recommendation models with error handling for optional functionality
try:
    from .recommendation import (
        MatchType,
        RecommendationScore,
        MentorRecommendation,
        RecommendationFilters,
        RecommendationResponse,
        UserLearningProfile
    )
    RECOMMENDATIONS_AVAILABLE = True
except ImportError:
    # Recommendation models not available - this is acceptable
    # for basic functionality without recommendation system
    RECOMMENDATIONS_AVAILABLE = False

# Export user models (always available)
__all__ = [
    # User models
    "UserProfile",
    "MentorProfile",
    "UserCreate", 
    "UserUpdate",
    "UserResponse",
    "Token",
    "TokenData",
    "UserInDB",
]

# Export recommendation models if available
if RECOMMENDATIONS_AVAILABLE:
    __all__.extend([
        "MatchType",
        "RecommendationScore", 
        "MentorRecommendation",
        "RecommendationFilters",
        "RecommendationResponse",
        "UserLearningProfile"
    ])