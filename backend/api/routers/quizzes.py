"""
Quiz management router for generating, submitting, and retrieving quiz results
"""
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from uuid import UUID, uuid4
from fastapi import APIRouter, HTTPException, Query, Depends, status
from fastapi.responses import JSONResponse

from ..models import (
    QuizType, QuizCategory, QuizResponse, QuizSubmission,
    QuizResult, PersonalityTrait, QuizQuestion, QuizOption,
    SuccessResponse, ErrorResponse, PaginatedResponse,
    QuizDifficulty
)

router = APIRouter(
    prefix="/quizzes",
    tags=["quizzes"],
    responses={404: {"description": "Not found"}},
)


# Mock data generators
def generate_mock_quiz(quiz_type: QuizType) -> QuizResponse:
    """Generate a mock quiz based on type"""
    quiz_templates = {
        QuizType.BIG_FIVE: {
            "title": "Big Five Personality Assessment",
            "description": "Discover your personality across five major dimensions",
            "estimated_time": 10
        },
        QuizType.DAILY_CHALLENGE: {
            "title": "Daily Personality Challenge",
            "description": "Today's challenge: Discover your creative style!",
            "estimated_time": 5
        },
        QuizType.QUICK_ASSESSMENT: {
            "title": "Quick Personality Snapshot",
            "description": "Get insights in just 5 questions",
            "estimated_time": 2
        },
        QuizType.THIS_OR_THAT: {
            "title": "This or That: Rapid Fire",
            "description": "Quick choices reveal deep insights",
            "estimated_time": 3
        },
        QuizType.MOOD_BASED: {
            "title": "Mood-Based Personality Test",
            "description": "How your current mood reflects your personality",
            "estimated_time": 7
        }
    }
    
    template = quiz_templates.get(quiz_type, quiz_templates[QuizType.BIG_FIVE])
    
    # Generate sample questions
    questions = []
    for i in range(10):
        question = QuizQuestion(
            id=i + 1,
            text=f"Sample question {i + 1} for {quiz_type.value}",
            options=[
                QuizOption(
                    text=f"Option A",
                    value="a",
                    trait_scores={"openness": 0.8, "conscientiousness": 0.2}
                ),
                QuizOption(
                    text=f"Option B",
                    value="b",
                    trait_scores={"openness": 0.2, "conscientiousness": 0.8}
                ),
                QuizOption(
                    text=f"Option C",
                    value="c",
                    trait_scores={"openness": 0.5, "conscientiousness": 0.5}
                ),
                QuizOption(
                    text=f"Option D",
                    value="d",
                    trait_scores={"openness": 0.3, "conscientiousness": 0.7}
                ),
            ]
        )
        questions.append(question)
    
    return QuizResponse(
        id=uuid4(),
        title=template["title"],
        description=template["description"],
        quiz_type=quiz_type,
        questions=questions[:5] if quiz_type == QuizType.QUICK_ASSESSMENT else questions,
        estimated_time=template["estimated_time"],
        created_at=datetime.utcnow()
    )


def generate_mock_result(quiz_id: UUID, user_id: Optional[UUID] = None) -> QuizResult:
    """Generate a mock quiz result"""
    traits = [
        PersonalityTrait(
            name="Openness",
            score=85.5,
            description="You're highly creative and open to new experiences",
            category="big_five"
        ),
        PersonalityTrait(
            name="Conscientiousness",
            score=72.3,
            description="You're organized and dependable",
            category="big_five"
        ),
        PersonalityTrait(
            name="Extraversion",
            score=65.8,
            description="You enjoy social interactions and draw energy from others",
            category="big_five"
        ),
        PersonalityTrait(
            name="Agreeableness",
            score=78.9,
            description="You're cooperative and value harmony",
            category="big_five"
        ),
        PersonalityTrait(
            name="Neuroticism",
            score=42.1,
            description="You're emotionally stable and handle stress well",
            category="big_five"
        )
    ]
    
    return QuizResult(
        id=uuid4(),
        quiz_id=quiz_id,
        user_id=user_id,
        personality_type="The Creative Harmonizer",
        traits=traits,
        summary="You're a creative individual who values both innovation and harmony. Your high openness combined with agreeableness makes you a natural bridge-builder in teams.",
        strengths=[
            "Creative problem-solving",
            "Strong interpersonal skills",
            "Adaptability to change",
            "Emotional intelligence"
        ],
        areas_for_growth=[
            "Setting stricter boundaries",
            "Being more assertive when needed",
            "Focusing on task completion"
        ],
        compatibility_insights="You work best with people who appreciate creativity and collaboration",
        career_suggestions=[
            "Creative Director",
            "UX Designer",
            "Team Facilitator",
            "Innovation Consultant"
        ],
        surprising_insight="Your combination of traits suggests you might excel in roles that others find contradictory - like being both a visionary and a peacemaker",
        created_at=datetime.utcnow(),
        share_url=f"https://personalityspark.com/share/{uuid4()}"
    )


@router.get("/generate/{quiz_type}", response_model=QuizResponse)
async def generate_quiz(
    quiz_type: QuizType,
    difficulty: Optional[QuizDifficulty] = Query(QuizDifficulty.MEDIUM),
    theme: Optional[str] = Query(None)
):
    """
    Generate a new AI-powered quiz of the specified type
    
    - **quiz_type**: Type of quiz to generate
    - **difficulty**: Difficulty level (easy, medium, hard)
    - **theme**: Optional theme for the quiz
    """
    try:
        # In production, this would call the AI service
        quiz = generate_mock_quiz(quiz_type)
        return quiz
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate quiz: {str(e)}"
        )


@router.get("/daily", response_model=QuizResponse)
async def get_daily_challenge():
    """
    Get today's daily personality challenge
    
    Returns a unique daily quiz that changes every 24 hours
    """
    try:
        # In production, this would check cache for today's quiz
        daily_quiz = generate_mock_quiz(QuizType.DAILY_CHALLENGE)
        daily_quiz.title = f"Daily Challenge: {datetime.now().strftime('%B %d')}"
        return daily_quiz
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get daily challenge: {str(e)}"
        )


@router.post("/submit", response_model=QuizResult)
async def submit_quiz(submission: QuizSubmission):
    """
    Submit quiz answers and get personality analysis
    
    - **quiz_id**: ID of the quiz being submitted
    - **answers**: List of answers with question IDs and selected options
    - **total_time**: Total time taken to complete the quiz
    - **user_id**: Optional user ID if logged in
    """
    try:
        # Validate quiz exists (mock validation)
        if not submission.quiz_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quiz not found"
            )
        
        # Validate all questions answered
        if len(submission.answers) < 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please answer all questions"
            )
        
        # In production, this would calculate actual results
        result = generate_mock_result(submission.quiz_id, submission.user_id)
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process quiz submission: {str(e)}"
        )


@router.get("/result/{result_id}", response_model=QuizResult)
async def get_quiz_result(result_id: UUID):
    """
    Get quiz results by result ID
    
    - **result_id**: UUID of the quiz result
    """
    try:
        # In production, fetch from database
        result = generate_mock_result(uuid4())
        result.id = result_id
        
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Result not found: {str(e)}"
        )


@router.get("/categories", response_model=List[Dict[str, Any]])
async def get_quiz_categories():
    """
    Get all available quiz categories with descriptions
    """
    categories = [
        {
            "id": QuizCategory.PERSONALITY.value,
            "name": "Personality",
            "description": "Explore your core personality traits",
            "icon": "user",
            "quiz_count": 15,
            "popular": True
        },
        {
            "id": QuizCategory.CAREER.value,
            "name": "Career",
            "description": "Discover your ideal career path",
            "icon": "briefcase",
            "quiz_count": 10,
            "popular": True
        },
        {
            "id": QuizCategory.RELATIONSHIPS.value,
            "name": "Relationships",
            "description": "Understand your relationship style",
            "icon": "heart",
            "quiz_count": 12,
            "popular": False
        },
        {
            "id": QuizCategory.LIFESTYLE.value,
            "name": "Lifestyle",
            "description": "Find your perfect lifestyle match",
            "icon": "home",
            "quiz_count": 8,
            "popular": False
        },
        {
            "id": QuizCategory.CREATIVITY.value,
            "name": "Creativity",
            "description": "Unlock your creative potential",
            "icon": "palette",
            "quiz_count": 6,
            "popular": False
        }
    ]
    
    return categories


@router.get("/history", response_model=PaginatedResponse)
async def get_quiz_history(
    user_id: Optional[UUID] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50)
):
    """
    Get quiz history for a user (requires authentication in production)
    
    - **user_id**: User ID to get history for
    - **page**: Page number for pagination
    - **per_page**: Number of items per page
    """
    # Mock quiz history
    mock_results = []
    for i in range(5):
        result = generate_mock_result(uuid4(), user_id)
        result.created_at = datetime.utcnow() - timedelta(days=i)
        mock_results.append(result.dict())
    
    total = len(mock_results)
    start = (page - 1) * per_page
    end = start + per_page
    
    return PaginatedResponse(
        items=mock_results[start:end],
        total=total,
        page=page,
        per_page=per_page,
        has_next=end < total,
        has_prev=page > 1
    )


@router.get("/trending", response_model=List[Dict[str, Any]])
async def get_trending_quizzes(limit: int = Query(5, ge=1, le=20)):
    """
    Get currently trending quizzes based on completion rate and shares
    
    - **limit**: Number of trending quizzes to return
    """
    trending = []
    quiz_types = list(QuizType)
    
    for i in range(min(limit, len(quiz_types))):
        quiz = generate_mock_quiz(quiz_types[i])
        trending.append({
            "quiz": quiz.dict(),
            "completions_today": 1500 - (i * 200),
            "share_rate": 0.35 - (i * 0.05),
            "trending_score": 95 - (i * 10)
        })
    
    return trending