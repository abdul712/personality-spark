"""
Pydantic models for API request/response schemas
"""
from datetime import datetime
from typing import Dict, List, Optional, Any
from uuid import UUID
from pydantic import BaseModel, Field, EmailStr
from enum import Enum


# Enums
class QuizType(str, Enum):
    BIG_FIVE = "big_five"
    DAILY_CHALLENGE = "daily_challenge"
    QUICK_ASSESSMENT = "quick_assessment"
    THIS_OR_THAT = "this_or_that"
    MOOD_BASED = "mood_based"


class QuizDifficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class QuizCategory(str, Enum):
    PERSONALITY = "personality"
    CAREER = "career"
    RELATIONSHIPS = "relationships"
    LIFESTYLE = "lifestyle"
    CREATIVITY = "creativity"


# Quiz Models
class QuizOption(BaseModel):
    text: str
    value: str
    trait_scores: Optional[Dict[str, float]] = None


class QuizQuestion(BaseModel):
    id: int
    text: str
    options: List[QuizOption]
    image_url: Optional[str] = None
    time_limit: Optional[int] = Field(None, description="Time limit in seconds")


class QuizGenerateRequest(BaseModel):
    quiz_type: QuizType
    num_questions: int = Field(10, ge=5, le=50)
    theme: Optional[str] = None
    difficulty: QuizDifficulty = QuizDifficulty.MEDIUM
    audience: Optional[str] = "general"


class QuizResponse(BaseModel):
    id: UUID
    title: str
    description: str
    quiz_type: QuizType
    questions: List[QuizQuestion]
    estimated_time: int = Field(..., description="Estimated completion time in minutes")
    created_at: datetime


class QuizAnswer(BaseModel):
    question_id: int
    selected_option: str
    time_taken: Optional[float] = Field(None, description="Time taken to answer in seconds")


class QuizSubmission(BaseModel):
    quiz_id: UUID
    answers: List[QuizAnswer]
    total_time: float = Field(..., description="Total time taken in seconds")
    user_id: Optional[UUID] = None


class PersonalityTrait(BaseModel):
    name: str
    score: float = Field(..., ge=0, le=100)
    description: str
    category: str


class QuizResult(BaseModel):
    id: UUID
    quiz_id: UUID
    user_id: Optional[UUID] = None
    personality_type: str
    traits: List[PersonalityTrait]
    summary: str
    strengths: List[str]
    areas_for_growth: List[str]
    compatibility_insights: Optional[str] = None
    career_suggestions: Optional[List[str]] = None
    surprising_insight: Optional[str] = None
    created_at: datetime
    share_url: Optional[str] = None


# AI Models
class AIQuizGenerateRequest(BaseModel):
    quiz_type: QuizType
    theme: str
    num_questions: int = Field(10, ge=5, le=30)
    difficulty: QuizDifficulty = QuizDifficulty.MEDIUM
    target_audience: Optional[str] = None
    custom_instructions: Optional[str] = None


class AIAnalysisRequest(BaseModel):
    quiz_responses: Dict[str, Any]
    quiz_type: QuizType
    additional_context: Optional[str] = None


class AIInsightsRequest(BaseModel):
    personality_traits: List[PersonalityTrait]
    user_context: Optional[str] = None
    insight_type: Optional[str] = "general"


class AIInsightsResponse(BaseModel):
    insights: List[str]
    recommendations: List[str]
    fun_fact: Optional[str] = None


# Share Models
class ShareCardRequest(BaseModel):
    result_id: UUID
    template: Optional[str] = "default"
    include_comparison: bool = False


class ShareCardResponse(BaseModel):
    share_id: str
    image_url: str
    share_url: str
    social_links: Dict[str, str]


class ChallengeRequest(BaseModel):
    quiz_id: UUID
    challenger_result_id: UUID
    message: Optional[str] = None


class ChallengeResponse(BaseModel):
    challenge_id: UUID
    challenge_url: str
    expires_at: datetime


# User Models
class UserRegisterRequest(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    username: str
    created_at: datetime
    last_login: Optional[datetime] = None


class UserPreferences(BaseModel):
    preferred_quiz_types: List[QuizType] = []
    notification_enabled: bool = True
    share_by_default: bool = False
    language: str = "en"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


# Analytics Models
class AnalyticsEvent(BaseModel):
    event_type: str
    event_data: Dict[str, Any]
    user_id: Optional[UUID] = None
    session_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class QuizStatistics(BaseModel):
    quiz_type: QuizType
    total_completed: int
    average_completion_time: float
    completion_rate: float
    share_rate: float
    average_score: Optional[float] = None


class AnalyticsStats(BaseModel):
    total_users: int
    total_quizzes_completed: int
    daily_active_users: int
    popular_quiz_types: List[Dict[str, Any]]
    engagement_metrics: Dict[str, float]
    date_range: Dict[str, datetime]


# Common Response Models
class SuccessResponse(BaseModel):
    success: bool = True
    message: str


class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    detail: Optional[str] = None


class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool