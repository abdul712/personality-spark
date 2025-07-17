"""
User management router for registration, authentication, and profile management
"""
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from uuid import UUID, uuid4
from fastapi import APIRouter, HTTPException, status, Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import EmailStr
import hashlib
import secrets

from ..models import (
    UserRegisterRequest, UserLoginRequest, UserResponse,
    UserPreferences, TokenResponse, QuizResult,
    SuccessResponse, ErrorResponse, PaginatedResponse
)

router = APIRouter(
    prefix="/user",
    tags=["user"],
    responses={404: {"description": "Not found"}},
)

# Security
security = HTTPBearer()


def hash_password(password: str) -> str:
    """Hash password using SHA256 (use bcrypt in production)"""
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return hash_password(password) == hashed


def create_access_token(user_id: UUID) -> str:
    """Create JWT access token (mock implementation)"""
    # In production, use proper JWT library
    return f"mock_token_{user_id}_{secrets.token_urlsafe(32)}"


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UUID:
    """Get current user from token (mock implementation)"""
    # In production, decode and validate JWT
    if not credentials.credentials.startswith("mock_token_"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Extract user_id from mock token
    try:
        parts = credentials.credentials.split("_")
        user_id = UUID(parts[2])
        return user_id
    except:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format",
            headers={"WWW-Authenticate": "Bearer"},
        )


# Mock user storage (in production, use database)
mock_users = {}


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(request: UserRegisterRequest):
    """
    Register a new user account
    
    - **email**: Valid email address
    - **username**: Unique username (3-50 characters)
    - **password**: Secure password (min 8 characters)
    """
    try:
        # Check if email already exists
        if any(u.get("email") == request.email for u in mock_users.values()):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Check if username already exists
        if any(u.get("username") == request.username for u in mock_users.values()):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        
        # Validate password strength
        if len(request.password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long"
            )
        
        # Create user
        user_id = uuid4()
        user_data = {
            "id": user_id,
            "email": request.email,
            "username": request.username,
            "password_hash": hash_password(request.password),
            "created_at": datetime.utcnow(),
            "last_login": None,
            "preferences": UserPreferences().dict()
        }
        
        # Store user (in production, save to database)
        mock_users[str(user_id)] = user_data
        
        return UserResponse(
            id=user_id,
            email=request.email,
            username=request.username,
            created_at=user_data["created_at"],
            last_login=None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=TokenResponse)
async def login_user(request: UserLoginRequest):
    """
    Login with email and password
    
    - **email**: Registered email address
    - **password**: User password
    
    Returns access token for authenticated requests
    """
    try:
        # Find user by email
        user_data = None
        for user in mock_users.values():
            if user["email"] == request.email:
                user_data = user
                break
        
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verify password
        if not verify_password(request.password, user_data["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Update last login
        user_data["last_login"] = datetime.utcnow()
        
        # Create access token
        access_token = create_access_token(user_data["id"])
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=86400  # 24 hours
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )


@router.get("/profile", response_model=UserResponse)
async def get_user_profile(current_user: UUID = Depends(get_current_user)):
    """
    Get current user's profile
    
    Requires authentication
    """
    try:
        # Get user data
        user_data = mock_users.get(str(current_user))
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse(
            id=user_data["id"],
            email=user_data["email"],
            username=user_data["username"],
            created_at=user_data["created_at"],
            last_login=user_data["last_login"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get profile: {str(e)}"
        )


@router.put("/profile", response_model=UserResponse)
async def update_user_profile(
    username: Optional[str] = None,
    current_user: UUID = Depends(get_current_user)
):
    """
    Update user profile
    
    - **username**: New username (optional)
    
    Requires authentication
    """
    try:
        # Get user data
        user_data = mock_users.get(str(current_user))
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update username if provided
        if username:
            # Check if username already taken
            if any(u.get("username") == username and u["id"] != current_user 
                   for u in mock_users.values()):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken"
                )
            user_data["username"] = username
        
        return UserResponse(
            id=user_data["id"],
            email=user_data["email"],
            username=user_data["username"],
            created_at=user_data["created_at"],
            last_login=user_data["last_login"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )


@router.get("/history", response_model=PaginatedResponse)
async def get_quiz_history(
    page: int = 1,
    per_page: int = 10,
    current_user: UUID = Depends(get_current_user)
):
    """
    Get user's quiz history
    
    - **page**: Page number for pagination
    - **per_page**: Items per page (max 50)
    
    Requires authentication
    """
    try:
        # Mock quiz history
        history_items = []
        for i in range(25):  # Generate 25 mock history items
            result = {
                "id": uuid4(),
                "quiz_title": f"Quiz {i+1}",
                "quiz_type": "big_five" if i % 2 == 0 else "daily_challenge",
                "personality_type": "The Creative Explorer" if i % 3 == 0 else "The Reliable Achiever",
                "completion_date": datetime.utcnow() - timedelta(days=i),
                "score": 75 + (i % 20),
                "time_taken": 300 + (i * 10)  # seconds
            }
            history_items.append(result)
        
        # Paginate
        total = len(history_items)
        start = (page - 1) * per_page
        end = start + per_page
        
        return PaginatedResponse(
            items=history_items[start:end],
            total=total,
            page=page,
            per_page=per_page,
            has_next=end < total,
            has_prev=page > 1
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get history: {str(e)}"
        )


@router.get("/preferences", response_model=UserPreferences)
async def get_user_preferences(current_user: UUID = Depends(get_current_user)):
    """
    Get user preferences
    
    Requires authentication
    """
    try:
        # Get user data
        user_data = mock_users.get(str(current_user))
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserPreferences(**user_data.get("preferences", {}))
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get preferences: {str(e)}"
        )


@router.put("/preferences", response_model=UserPreferences)
async def update_user_preferences(
    preferences: UserPreferences,
    current_user: UUID = Depends(get_current_user)
):
    """
    Update user preferences
    
    - **preferred_quiz_types**: List of preferred quiz types
    - **notification_enabled**: Enable/disable notifications
    - **share_by_default**: Auto-share results
    - **language**: Preferred language
    
    Requires authentication
    """
    try:
        # Get user data
        user_data = mock_users.get(str(current_user))
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update preferences
        user_data["preferences"] = preferences.dict()
        
        return preferences
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update preferences: {str(e)}"
        )


@router.post("/delete", response_model=SuccessResponse)
async def delete_user_account(
    password: str,
    current_user: UUID = Depends(get_current_user)
):
    """
    Delete user account (requires password confirmation)
    
    - **password**: Current password for confirmation
    
    Requires authentication
    """
    try:
        # Get user data
        user_data = mock_users.get(str(current_user))
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Verify password
        if not verify_password(password, user_data["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid password"
            )
        
        # Delete user
        del mock_users[str(current_user)]
        
        return SuccessResponse(
            success=True,
            message="Account deleted successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete account: {str(e)}"
        )


@router.get("/stats", response_model=Dict[str, Any])
async def get_user_statistics(current_user: UUID = Depends(get_current_user)):
    """
    Get user's personality statistics and insights
    
    Requires authentication
    """
    try:
        # Mock statistics
        stats = {
            "total_quizzes_taken": 15,
            "favorite_quiz_type": "big_five",
            "average_completion_time": 425,  # seconds
            "personality_consistency": 0.82,
            "most_dominant_trait": {
                "name": "Openness",
                "average_score": 85.3
            },
            "trait_evolution": [
                {"month": "January", "openness": 82, "conscientiousness": 75},
                {"month": "February", "openness": 84, "conscientiousness": 77},
                {"month": "March", "openness": 85, "conscientiousness": 78}
            ],
            "achievements": [
                {"name": "Early Bird", "description": "Completed morning quiz 5 days in a row"},
                {"name": "Explorer", "description": "Tried all quiz types"},
                {"name": "Consistent", "description": "Maintained similar personality profile"}
            ],
            "member_since_days": 90
        }
        
        return stats
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get statistics: {str(e)}"
        )