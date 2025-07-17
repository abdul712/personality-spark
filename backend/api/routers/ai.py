"""
AI integration router for quiz generation, personality analysis, and insights
"""
from datetime import datetime
from typing import Dict, Any, List
from uuid import uuid4
from fastapi import APIRouter, HTTPException, status, BackgroundTasks
from fastapi.responses import JSONResponse
import random

from ..models import (
    AIQuizGenerateRequest, QuizResponse, QuizQuestion, QuizOption,
    AIAnalysisRequest, QuizResult, PersonalityTrait,
    AIInsightsRequest, AIInsightsResponse,
    ErrorResponse, SuccessResponse
)

router = APIRouter(
    prefix="/ai",
    tags=["ai"],
    responses={404: {"description": "Not found"}},
)


# Mock AI response generators
def generate_ai_quiz_questions(request: AIQuizGenerateRequest) -> List[QuizQuestion]:
    """Generate AI-powered quiz questions based on request parameters"""
    questions = []
    
    # Define question templates based on quiz type
    question_templates = {
        "big_five": [
            "In social situations, do you prefer to:",
            "When making decisions, you tend to:",
            "Your ideal weekend involves:",
            "When faced with a challenge, you:",
            "In group projects, you usually:"
        ],
        "daily_challenge": [
            "Today's mood best describes you as:",
            "If today was a color, it would be:",
            "Your energy level right now is:",
            "Today's biggest priority is:",
            "Right now, you feel most like:"
        ],
        "quick_assessment": [
            "Quick! Pick your preference:",
            "First instinct - choose one:",
            "Without thinking, select:",
            "Immediate choice:",
            "Go with your gut:"
        ]
    }
    
    # Get appropriate templates
    templates = question_templates.get(
        request.quiz_type.value,
        question_templates["big_five"]
    )
    
    # Generate questions based on theme and difficulty
    for i in range(request.num_questions):
        template = templates[i % len(templates)]
        
        # Create options based on difficulty
        if request.difficulty == "easy":
            options = [
                QuizOption(
                    text=f"Option that clearly indicates trait A",
                    value="a",
                    trait_scores={"trait_a": 1.0, "trait_b": 0.0}
                ),
                QuizOption(
                    text=f"Option that clearly indicates trait B",
                    value="b",
                    trait_scores={"trait_a": 0.0, "trait_b": 1.0}
                )
            ]
        else:
            options = [
                QuizOption(
                    text=f"Nuanced option {j+1} for {request.theme or 'personality'}",
                    value=chr(97 + j),  # a, b, c, d
                    trait_scores={
                        "openness": random.uniform(0.2, 0.8),
                        "conscientiousness": random.uniform(0.2, 0.8),
                        "extraversion": random.uniform(0.2, 0.8),
                        "agreeableness": random.uniform(0.2, 0.8),
                        "neuroticism": random.uniform(0.2, 0.8)
                    }
                )
                for j in range(4)
            ]
        
        question = QuizQuestion(
            id=i + 1,
            text=f"{template} ({request.theme or 'general personality'})",
            options=options,
            time_limit=30 if request.difficulty == "hard" else None
        )
        questions.append(question)
    
    return questions


def analyze_personality_from_responses(responses: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze personality based on quiz responses"""
    # Mock personality analysis
    traits = [
        {
            "name": "Openness",
            "score": random.uniform(60, 90),
            "description": "Your curiosity and creativity level"
        },
        {
            "name": "Conscientiousness",
            "score": random.uniform(50, 85),
            "description": "Your organization and dependability"
        },
        {
            "name": "Extraversion",
            "score": random.uniform(40, 80),
            "description": "Your social energy and assertiveness"
        },
        {
            "name": "Agreeableness",
            "score": random.uniform(55, 90),
            "description": "Your cooperation and trust in others"
        },
        {
            "name": "Neuroticism",
            "score": random.uniform(20, 60),
            "description": "Your emotional stability and stress response"
        }
    ]
    
    # Determine personality type based on highest traits
    sorted_traits = sorted(traits, key=lambda x: x["score"], reverse=True)
    top_traits = sorted_traits[:2]
    
    personality_types = {
        ("Openness", "Conscientiousness"): "The Innovative Achiever",
        ("Openness", "Extraversion"): "The Creative Explorer",
        ("Openness", "Agreeableness"): "The Harmonious Innovator",
        ("Conscientiousness", "Extraversion"): "The Dynamic Leader",
        ("Conscientiousness", "Agreeableness"): "The Reliable Supporter",
        ("Extraversion", "Agreeableness"): "The Social Connector"
    }
    
    personality_type = personality_types.get(
        (top_traits[0]["name"], top_traits[1]["name"]),
        "The Balanced Individual"
    )
    
    return {
        "personality_type": personality_type,
        "traits": traits,
        "summary": f"You exhibit strong {top_traits[0]['name'].lower()} and {top_traits[1]['name'].lower()}, making you a natural {personality_type.lower()}.",
        "strengths": [
            f"High {top_traits[0]['name'].lower()}",
            f"Strong {top_traits[1]['name'].lower()}",
            "Balanced approach to challenges",
            "Adaptable mindset"
        ],
        "areas_for_growth": [
            f"Developing {sorted_traits[-1]['name'].lower()}",
            "Balancing competing priorities",
            "Expanding comfort zone"
        ]
    }


@router.post("/generate-quiz", response_model=QuizResponse)
async def generate_ai_quiz(request: AIQuizGenerateRequest, background_tasks: BackgroundTasks):
    """
    Generate a custom AI-powered quiz based on specific parameters
    
    - **quiz_type**: Type of quiz to generate
    - **theme**: Theme for the quiz questions
    - **num_questions**: Number of questions (5-30)
    - **difficulty**: Difficulty level
    - **target_audience**: Optional target audience
    - **custom_instructions**: Optional custom instructions for AI
    """
    try:
        # Validate parameters
        if request.num_questions < 5 or request.num_questions > 30:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Number of questions must be between 5 and 30"
            )
        
        # In production, this would call DeepSeek API
        # For now, generate mock AI questions
        questions = generate_ai_quiz_questions(request)
        
        # Create quiz response
        quiz = QuizResponse(
            id=uuid4(),
            title=f"AI-Generated {request.theme or request.quiz_type.value.replace('_', ' ').title()} Quiz",
            description=f"A personalized {request.difficulty.value} quiz about {request.theme or 'personality'} created just for you",
            quiz_type=request.quiz_type,
            questions=questions,
            estimated_time=max(1, request.num_questions // 2),
            created_at=datetime.utcnow()
        )
        
        # Log AI generation in background
        background_tasks.add_task(
            log_ai_generation,
            quiz_id=quiz.id,
            request_params=request.dict()
        )
        
        return quiz
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI quiz generation failed: {str(e)}"
        )


@router.post("/analyze-personality", response_model=Dict[str, Any])
async def analyze_personality(request: AIAnalysisRequest):
    """
    Analyze personality based on quiz responses using AI
    
    - **quiz_responses**: Dictionary of quiz responses
    - **quiz_type**: Type of quiz taken
    - **additional_context**: Optional additional context for analysis
    """
    try:
        # Validate responses
        if not request.quiz_responses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quiz responses cannot be empty"
            )
        
        # In production, this would call AI service for analysis
        analysis = analyze_personality_from_responses(request.quiz_responses)
        
        # Add quiz type specific insights
        if request.quiz_type == "career":
            analysis["career_matches"] = [
                "Software Engineer",
                "Product Manager",
                "UX Designer",
                "Data Scientist"
            ]
        elif request.quiz_type == "relationships":
            analysis["relationship_style"] = "Secure and communicative"
            analysis["compatibility_types"] = ["The Supporter", "The Explorer"]
        
        return {
            "analysis": analysis,
            "confidence_score": random.uniform(0.85, 0.95),
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Personality analysis failed: {str(e)}"
        )


@router.post("/generate-insights", response_model=AIInsightsResponse)
async def generate_insights(request: AIInsightsRequest):
    """
    Generate personalized insights based on personality traits
    
    - **personality_traits**: List of personality traits with scores
    - **user_context**: Optional context about the user
    - **insight_type**: Type of insights to generate (general, career, relationship, etc.)
    """
    try:
        # Validate traits
        if not request.personality_traits:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Personality traits cannot be empty"
            )
        
        # Sort traits by score
        sorted_traits = sorted(
            request.personality_traits,
            key=lambda x: x.score,
            reverse=True
        )
        
        # Generate insights based on top traits
        top_trait = sorted_traits[0]
        insights = []
        recommendations = []
        
        # Generate trait-specific insights
        trait_insights = {
            "Openness": {
                "insights": [
                    "Your high openness makes you naturally curious and creative",
                    "You thrive in environments that offer variety and innovation",
                    "Your imagination is one of your greatest assets"
                ],
                "recommendations": [
                    "Explore creative hobbies or side projects",
                    "Seek roles that allow for innovation and experimentation",
                    "Connect with other creative individuals"
                ]
            },
            "Conscientiousness": {
                "insights": [
                    "Your strong conscientiousness makes you reliable and organized",
                    "You excel at planning and following through on commitments",
                    "Your attention to detail sets you apart"
                ],
                "recommendations": [
                    "Take on leadership roles in project management",
                    "Use your organizational skills to help others",
                    "Set ambitious but achievable goals"
                ]
            },
            "Extraversion": {
                "insights": [
                    "Your extraversion energizes those around you",
                    "You naturally build connections and networks",
                    "Your enthusiasm is contagious"
                ],
                "recommendations": [
                    "Seek collaborative work environments",
                    "Take on roles that involve public speaking or presentation",
                    "Join social groups aligned with your interests"
                ]
            }
        }
        
        # Get insights for top trait
        trait_data = trait_insights.get(
            top_trait.name,
            {
                "insights": [
                    f"Your strong {top_trait.name.lower()} is a defining characteristic",
                    f"You demonstrate exceptional {top_trait.name.lower()} in your approach",
                    f"This trait influences many aspects of your personality"
                ],
                "recommendations": [
                    f"Leverage your {top_trait.name.lower()} in your career",
                    f"Find activities that align with your {top_trait.name.lower()}",
                    f"Connect with others who share similar traits"
                ]
            }
        )
        
        insights = trait_data["insights"]
        recommendations = trait_data["recommendations"]
        
        # Add context-specific insights
        if request.insight_type == "career":
            insights.append("Your personality profile suggests strong leadership potential")
            recommendations.append("Consider roles that allow autonomy and creativity")
        elif request.insight_type == "relationship":
            insights.append("Your traits suggest you value deep, meaningful connections")
            recommendations.append("Seek partners who appreciate your unique qualities")
        
        # Generate fun fact
        fun_facts = [
            f"People with high {top_trait.name.lower()} like you make up only 15% of the population",
            f"Your personality type is often found among successful entrepreneurs",
            f"Historical figures with similar traits include innovative leaders and creators",
            f"Your combination of traits is particularly rare and valuable"
        ]
        
        return AIInsightsResponse(
            insights=insights[:3],  # Limit to top 3
            recommendations=recommendations[:3],  # Limit to top 3
            fun_fact=random.choice(fun_facts)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Insight generation failed: {str(e)}"
        )


@router.post("/validate-prompt", response_model=SuccessResponse)
async def validate_ai_prompt(prompt: str):
    """
    Validate and sanitize AI prompts before sending to AI service
    
    - **prompt**: The prompt to validate
    """
    try:
        # Check prompt length
        if len(prompt) > 1000:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Prompt too long (max 1000 characters)"
            )
        
        # Check for prohibited content
        prohibited_keywords = ["hack", "exploit", "bypass", "ignore instructions"]
        if any(keyword in prompt.lower() for keyword in prohibited_keywords):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Prompt contains prohibited content"
            )
        
        return SuccessResponse(
            success=True,
            message="Prompt validated successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prompt validation failed: {str(e)}"
        )


# Background task functions
async def log_ai_generation(quiz_id: str, request_params: Dict[str, Any]):
    """Log AI generation for analytics"""
    # In production, this would log to database or analytics service
    print(f"AI Quiz Generated: {quiz_id} with params: {request_params}")