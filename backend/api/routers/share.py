"""
Social sharing router for creating share cards, previews, and challenges
"""
from datetime import datetime, timedelta
from typing import Dict, Optional, Any
from uuid import UUID, uuid4
from fastapi import APIRouter, HTTPException, status, BackgroundTasks, Query
from fastapi.responses import HTMLResponse, FileResponse
import random
import string

from ..models import (
    ShareCardRequest, ShareCardResponse,
    ChallengeRequest, ChallengeResponse,
    QuizResult, SuccessResponse, ErrorResponse
)

router = APIRouter(
    prefix="/share",
    tags=["share"],
    responses={404: {"description": "Not found"}},
)


def generate_share_id() -> str:
    """Generate a short, unique share ID"""
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))


def generate_share_image_url(result_id: UUID, template: str) -> str:
    """Generate URL for share card image"""
    # In production, this would generate actual image using a service
    return f"https://personalityspark.com/api/images/share/{result_id}_{template}.png"


def create_social_links(share_url: str, title: str) -> Dict[str, str]:
    """Create pre-filled social media share links"""
    encoded_url = share_url.replace(":", "%3A").replace("/", "%2F")
    encoded_title = title.replace(" ", "%20")
    
    return {
        "twitter": f"https://twitter.com/intent/tweet?text={encoded_title}&url={encoded_url}&hashtags=PersonalitySpark,PersonalityTest",
        "facebook": f"https://www.facebook.com/sharer/sharer.php?u={encoded_url}",
        "linkedin": f"https://www.linkedin.com/sharing/share-offsite/?url={encoded_url}",
        "whatsapp": f"https://wa.me/?text={encoded_title}%20{encoded_url}",
        "telegram": f"https://t.me/share/url?url={encoded_url}&text={encoded_title}",
        "reddit": f"https://reddit.com/submit?url={encoded_url}&title={encoded_title}"
    }


@router.post("/create-card", response_model=ShareCardResponse)
async def create_share_card(
    request: ShareCardRequest,
    background_tasks: BackgroundTasks
):
    """
    Create a shareable image card for quiz results
    
    - **result_id**: ID of the quiz result to create card for
    - **template**: Card template to use (default, minimal, colorful, dark)
    - **include_comparison**: Include comparison with average scores
    """
    try:
        # Validate result exists (mock validation)
        # In production, fetch actual result from database
        if not request.result_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quiz result not found"
            )
        
        # Generate share ID and URLs
        share_id = generate_share_id()
        base_url = "https://personalityspark.com"
        share_url = f"{base_url}/share/{share_id}"
        image_url = generate_share_image_url(request.result_id, request.template)
        
        # Create social media links
        social_links = create_social_links(
            share_url,
            "Check out my personality type: The Creative Harmonizer!"
        )
        
        # Queue image generation in background
        background_tasks.add_task(
            generate_share_image,
            result_id=request.result_id,
            template=request.template,
            include_comparison=request.include_comparison
        )
        
        # Save share mapping in cache/database
        # In production, save to Redis/database
        
        return ShareCardResponse(
            share_id=share_id,
            image_url=image_url,
            share_url=share_url,
            social_links=social_links
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create share card: {str(e)}"
        )


@router.get("/preview/{share_id}", response_class=HTMLResponse)
async def preview_shared_result(share_id: str):
    """
    Preview a shared quiz result
    
    Returns an HTML preview optimized for social media embeds
    """
    try:
        # In production, fetch actual shared result
        # For now, return mock preview HTML
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Personality Spark - The Creative Harmonizer</title>
            <meta property="og:title" content="I'm The Creative Harmonizer! - Personality Spark">
            <meta property="og:description" content="I just discovered my personality type! Take the quiz to find yours.">
            <meta property="og:image" content="https://personalityspark.com/api/images/share/{share_id}.png">
            <meta property="og:url" content="https://personalityspark.com/share/{share_id}">
            <meta property="og:type" content="website">
            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:title" content="I'm The Creative Harmonizer!">
            <meta name="twitter:description" content="Discover your personality type with Personality Spark">
            <meta name="twitter:image" content="https://personalityspark.com/api/images/share/{share_id}.png">
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }}
                .container {{
                    max-width: 600px;
                    text-align: center;
                }}
                h1 {{
                    font-size: 2.5em;
                    margin-bottom: 0.5em;
                }}
                .traits {{
                    background: rgba(255, 255, 255, 0.1);
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px 0;
                }}
                .cta-button {{
                    display: inline-block;
                    background: white;
                    color: #667eea;
                    padding: 15px 30px;
                    border-radius: 30px;
                    text-decoration: none;
                    font-weight: bold;
                    margin-top: 20px;
                    transition: transform 0.2s;
                }}
                .cta-button:hover {{
                    transform: scale(1.05);
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>I'm The Creative Harmonizer!</h1>
                <p>A unique blend of creativity and harmony</p>
                <div class="traits">
                    <h2>My Top Traits:</h2>
                    <p>✨ Openness: 85%</p>
                    <p>🤝 Agreeableness: 78%</p>
                    <p>📊 Conscientiousness: 72%</p>
                </div>
                <p>Want to discover your personality type?</p>
                <a href="https://personalityspark.com?ref=share_{share_id}" class="cta-button">
                    Take the Free Quiz
                </a>
            </div>
            <script>
                // Redirect to app after 3 seconds
                setTimeout(() => {{
                    window.location.href = 'https://personalityspark.com?ref=share_{share_id}';
                }}, 3000);
            </script>
        </body>
        </html>
        """
        
        return HTMLResponse(content=html_content)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Share not found: {str(e)}"
        )


@router.post("/challenge", response_model=ChallengeResponse)
async def create_challenge(request: ChallengeRequest):
    """
    Create a friend challenge based on quiz results
    
    - **quiz_id**: ID of the quiz to challenge friends with
    - **challenger_result_id**: Result ID of the challenger
    - **message**: Optional custom message for the challenge
    """
    try:
        # Validate inputs
        if not request.quiz_id or not request.challenger_result_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quiz ID and challenger result ID are required"
            )
        
        # Generate challenge ID and URL
        challenge_id = uuid4()
        challenge_url = f"https://personalityspark.com/challenge/{challenge_id}"
        
        # Set expiration (7 days)
        expires_at = datetime.utcnow() + timedelta(days=7)
        
        # In production, save challenge to database
        # Store: challenge_id, quiz_id, challenger_result_id, message, expires_at
        
        return ChallengeResponse(
            challenge_id=challenge_id,
            challenge_url=challenge_url,
            expires_at=expires_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create challenge: {str(e)}"
        )


@router.get("/challenge/{challenge_id}")
async def get_challenge_details(challenge_id: UUID):
    """
    Get details about a specific challenge
    
    - **challenge_id**: ID of the challenge
    """
    try:
        # In production, fetch from database
        # Mock challenge details
        return {
            "challenge_id": challenge_id,
            "quiz_title": "Big Five Personality Assessment",
            "challenger_name": "Alex",
            "challenger_type": "The Creative Harmonizer",
            "message": "Think you know yourself better than I know myself? Take this quiz and let's compare!",
            "expires_at": datetime.utcnow() + timedelta(days=5),
            "participants_count": 3,
            "quiz_id": uuid4()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Challenge not found: {str(e)}"
        )


@router.post("/compare/{challenge_id}")
async def compare_challenge_results(
    challenge_id: UUID,
    participant_result_id: UUID
):
    """
    Compare participant's results with challenger's results
    
    - **challenge_id**: ID of the challenge
    - **participant_result_id**: Result ID of the participant
    """
    try:
        # In production, fetch and compare actual results
        # Mock comparison
        comparison = {
            "challenge_id": challenge_id,
            "similarity_score": 78.5,
            "most_similar_traits": [
                {"trait": "Openness", "difference": 5.2},
                {"trait": "Agreeableness", "difference": 8.1}
            ],
            "most_different_traits": [
                {"trait": "Extraversion", "difference": 25.3},
                {"trait": "Neuroticism", "difference": 18.7}
            ],
            "summary": "You and Alex are quite similar! You both show high creativity and value harmony.",
            "fun_fact": "Only 23% of people are this similar in their personality profiles!"
        }
        
        return comparison
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compare results: {str(e)}"
        )


@router.get("/leaderboard/{challenge_id}")
async def get_challenge_leaderboard(
    challenge_id: UUID,
    limit: int = Query(10, ge=1, le=50)
):
    """
    Get leaderboard for a challenge showing similarity scores
    
    - **challenge_id**: ID of the challenge
    - **limit**: Number of entries to return
    """
    try:
        # Mock leaderboard data
        leaderboard = []
        names = ["Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason"]
        
        for i in range(min(limit, len(names))):
            leaderboard.append({
                "rank": i + 1,
                "name": names[i],
                "similarity_score": 95.0 - (i * 5),
                "personality_type": "The Creative Explorer" if i % 2 == 0 else "The Reliable Achiever",
                "completed_at": datetime.utcnow() - timedelta(hours=i)
            })
        
        return {
            "challenge_id": challenge_id,
            "leaderboard": leaderboard,
            "total_participants": len(names),
            "average_similarity": 75.3
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get leaderboard: {str(e)}"
        )


# Background task functions
async def generate_share_image(
    result_id: UUID,
    template: str,
    include_comparison: bool
):
    """Generate share card image in background"""
    # In production, this would use an image generation service
    print(f"Generating share image for {result_id} with template {template}")