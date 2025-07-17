"""
Analytics router for tracking events and retrieving statistics
"""
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from uuid import UUID
from fastapi import APIRouter, HTTPException, status, Query, BackgroundTasks
from pydantic import BaseModel
import random

from ..models import (
    AnalyticsEvent, QuizStatistics, AnalyticsStats,
    QuizType, SuccessResponse, ErrorResponse
)

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
    responses={404: {"description": "Not found"}},
)


# Event types
class EventType:
    QUIZ_STARTED = "quiz_started"
    QUIZ_COMPLETED = "quiz_completed"
    QUIZ_ABANDONED = "quiz_abandoned"
    RESULT_SHARED = "result_shared"
    CHALLENGE_CREATED = "challenge_created"
    CHALLENGE_ACCEPTED = "challenge_accepted"
    USER_REGISTERED = "user_registered"
    USER_LOGIN = "user_login"
    PAGE_VIEW = "page_view"
    BUTTON_CLICK = "button_click"
    AD_VIEW = "ad_view"
    AD_CLICK = "ad_click"
    ERROR_OCCURRED = "error_occurred"


def calculate_quiz_statistics(quiz_type: QuizType) -> QuizStatistics:
    """Calculate statistics for a specific quiz type"""
    # Mock statistics calculation
    base_completions = random.randint(1000, 5000)
    
    return QuizStatistics(
        quiz_type=quiz_type,
        total_completed=base_completions,
        average_completion_time=random.uniform(180, 600),  # 3-10 minutes
        completion_rate=random.uniform(0.65, 0.95),
        share_rate=random.uniform(0.20, 0.45),
        average_score=random.uniform(60, 85) if quiz_type != QuizType.THIS_OR_THAT else None
    )


@router.post("/track", response_model=SuccessResponse)
async def track_event(event: AnalyticsEvent, background_tasks: BackgroundTasks):
    """
    Track an analytics event
    
    - **event_type**: Type of event to track
    - **event_data**: Additional data for the event
    - **user_id**: Optional user ID if user is logged in
    - **session_id**: Session identifier
    - **timestamp**: Event timestamp (auto-generated if not provided)
    """
    try:
        # Validate event type
        valid_event_types = [
            EventType.QUIZ_STARTED, EventType.QUIZ_COMPLETED,
            EventType.QUIZ_ABANDONED, EventType.RESULT_SHARED,
            EventType.CHALLENGE_CREATED, EventType.CHALLENGE_ACCEPTED,
            EventType.USER_REGISTERED, EventType.USER_LOGIN,
            EventType.PAGE_VIEW, EventType.BUTTON_CLICK,
            EventType.AD_VIEW, EventType.AD_CLICK,
            EventType.ERROR_OCCURRED
        ]
        
        if event.event_type not in valid_event_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid event type. Must be one of: {', '.join(valid_event_types)}"
            )
        
        # Validate required data based on event type
        if event.event_type in [EventType.QUIZ_STARTED, EventType.QUIZ_COMPLETED]:
            if "quiz_id" not in event.event_data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="quiz_id is required for quiz events"
                )
        
        # Queue event processing in background
        background_tasks.add_task(
            process_analytics_event,
            event=event.dict()
        )
        
        # In production, send to analytics service (Google Analytics, Mixpanel, etc.)
        
        return SuccessResponse(
            success=True,
            message="Event tracked successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to track event: {str(e)}"
        )


@router.get("/stats", response_model=AnalyticsStats)
async def get_analytics_stats(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    include_revenue: bool = Query(False)
):
    """
    Get analytics statistics for the platform
    
    - **start_date**: Start date for statistics (default: 30 days ago)
    - **end_date**: End date for statistics (default: today)
    - **include_revenue**: Include revenue metrics (requires admin auth in production)
    """
    try:
        # Set default date range if not provided
        if not end_date:
            end_date = datetime.utcnow()
        if not start_date:
            start_date = end_date - timedelta(days=30)
        
        # Validate date range
        if start_date > end_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Start date must be before end date"
            )
        
        # Calculate mock statistics
        days_in_range = (end_date - start_date).days + 1
        
        # User metrics
        total_users = random.randint(10000, 50000)
        daily_active_users = random.randint(1000, 5000)
        
        # Quiz metrics
        total_quizzes = random.randint(50000, 200000)
        
        # Popular quiz types
        quiz_types = list(QuizType)
        popular_quizzes = []
        for i, quiz_type in enumerate(quiz_types[:3]):
            popular_quizzes.append({
                "quiz_type": quiz_type.value,
                "completions": random.randint(5000, 20000),
                "average_score": random.uniform(65, 85),
                "share_rate": random.uniform(0.25, 0.45)
            })
        
        # Engagement metrics
        engagement_metrics = {
            "average_session_duration": random.uniform(300, 900),  # 5-15 minutes
            "bounce_rate": random.uniform(0.20, 0.40),
            "pages_per_session": random.uniform(3, 7),
            "quiz_completion_rate": random.uniform(0.65, 0.85),
            "share_rate": random.uniform(0.25, 0.40),
            "return_user_rate": random.uniform(0.35, 0.55)
        }
        
        # Add revenue metrics if requested
        if include_revenue:
            engagement_metrics.update({
                "ad_revenue": random.uniform(5000, 20000),
                "revenue_per_user": random.uniform(0.30, 0.80),
                "ad_click_rate": random.uniform(0.02, 0.05),
                "ecpm": random.uniform(2.50, 5.00)  # Effective cost per mille
            })
        
        return AnalyticsStats(
            total_users=total_users,
            total_quizzes_completed=total_quizzes,
            daily_active_users=daily_active_users,
            popular_quiz_types=popular_quizzes,
            engagement_metrics=engagement_metrics,
            date_range={
                "start": start_date,
                "end": end_date
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get statistics: {str(e)}"
        )


@router.get("/quiz/{quiz_type}/stats", response_model=QuizStatistics)
async def get_quiz_type_statistics(quiz_type: QuizType):
    """
    Get detailed statistics for a specific quiz type
    
    - **quiz_type**: Type of quiz to get statistics for
    """
    try:
        stats = calculate_quiz_statistics(quiz_type)
        return stats
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get quiz statistics: {str(e)}"
        )


@router.get("/funnel", response_model=Dict[str, Any])
async def get_funnel_analytics(
    funnel_type: str = Query("quiz_completion", regex="^(quiz_completion|user_registration|share_flow)$")
):
    """
    Get funnel analytics for specific user flows
    
    - **funnel_type**: Type of funnel to analyze (quiz_completion, user_registration, share_flow)
    """
    try:
        funnels = {
            "quiz_completion": {
                "steps": [
                    {"name": "Landing Page", "users": 10000, "dropout_rate": 0.30},
                    {"name": "Quiz Selection", "users": 7000, "dropout_rate": 0.20},
                    {"name": "Quiz Started", "users": 5600, "dropout_rate": 0.25},
                    {"name": "Quiz Completed", "users": 4200, "dropout_rate": 0.10},
                    {"name": "Results Viewed", "users": 3780, "dropout_rate": 0.50},
                    {"name": "Results Shared", "users": 1890, "dropout_rate": 0}
                ],
                "overall_conversion": 0.189,
                "average_time": 425  # seconds
            },
            "user_registration": {
                "steps": [
                    {"name": "Results Page", "users": 5000, "dropout_rate": 0.70},
                    {"name": "Register CTA Clicked", "users": 1500, "dropout_rate": 0.40},
                    {"name": "Registration Form", "users": 900, "dropout_rate": 0.30},
                    {"name": "Email Verified", "users": 630, "dropout_rate": 0.10},
                    {"name": "Profile Completed", "users": 567, "dropout_rate": 0}
                ],
                "overall_conversion": 0.113,
                "average_time": 180  # seconds
            },
            "share_flow": {
                "steps": [
                    {"name": "Results Page", "users": 4000, "dropout_rate": 0.60},
                    {"name": "Share Button Clicked", "users": 1600, "dropout_rate": 0.25},
                    {"name": "Share Modal Opened", "users": 1200, "dropout_rate": 0.40},
                    {"name": "Platform Selected", "users": 720, "dropout_rate": 0.15},
                    {"name": "Share Completed", "users": 612, "dropout_rate": 0}
                ],
                "overall_conversion": 0.153,
                "average_time": 45  # seconds
            }
        }
        
        funnel_data = funnels.get(funnel_type, funnels["quiz_completion"])
        
        return {
            "funnel_type": funnel_type,
            "data": funnel_data,
            "recommendations": [
                "Optimize landing page to reduce initial dropout",
                "Add progress indicators during quiz",
                "Improve share incentives"
            ]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get funnel analytics: {str(e)}"
        )


@router.get("/realtime", response_model=Dict[str, Any])
async def get_realtime_analytics():
    """
    Get real-time analytics data
    
    Returns current active users, ongoing quizzes, and recent events
    """
    try:
        # Mock real-time data
        realtime_data = {
            "active_users": random.randint(50, 200),
            "ongoing_quizzes": random.randint(20, 100),
            "quizzes_last_hour": random.randint(200, 500),
            "shares_last_hour": random.randint(50, 150),
            "trending_quiz_type": random.choice(list(QuizType)).value,
            "recent_events": [
                {
                    "event": "quiz_completed",
                    "quiz_type": "big_five",
                    "timestamp": datetime.utcnow() - timedelta(seconds=30)
                },
                {
                    "event": "result_shared",
                    "platform": "twitter",
                    "timestamp": datetime.utcnow() - timedelta(seconds=45)
                },
                {
                    "event": "user_registered",
                    "source": "organic",
                    "timestamp": datetime.utcnow() - timedelta(seconds=60)
                }
            ],
            "current_load": {
                "api": random.uniform(0.3, 0.7),
                "database": random.uniform(0.2, 0.5),
                "ai_service": random.uniform(0.4, 0.8)
            }
        }
        
        return realtime_data
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get real-time analytics: {str(e)}"
        )


@router.get("/export", response_model=Dict[str, str])
async def export_analytics_data(
    export_type: str = Query("csv", regex="^(csv|json|excel)$"),
    data_type: str = Query("summary", regex="^(summary|detailed|raw)$"),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None)
):
    """
    Export analytics data in various formats
    
    - **export_type**: Format for export (csv, json, excel)
    - **data_type**: Level of detail (summary, detailed, raw)
    - **start_date**: Start date for export
    - **end_date**: End date for export
    
    Returns a download URL for the exported data
    """
    try:
        # In production, generate actual export file
        export_id = f"export_{random.randint(1000, 9999)}"
        
        # Mock export URL
        export_url = f"https://personalityspark.com/api/analytics/download/{export_id}.{export_type}"
        
        return {
            "export_id": export_id,
            "download_url": export_url,
            "expires_at": (datetime.utcnow() + timedelta(hours=24)).isoformat(),
            "file_size": f"{random.randint(100, 500)} KB",
            "status": "ready"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export data: {str(e)}"
        )


# Background task functions
async def process_analytics_event(event: Dict[str, Any]):
    """Process analytics event in background"""
    # In production, this would:
    # 1. Validate event data
    # 2. Send to analytics service (GA, Mixpanel, etc.)
    # 3. Store in database for custom analytics
    # 4. Update real-time dashboards
    print(f"Processing analytics event: {event['event_type']} at {event['timestamp']}")