"""
Test script to verify all API endpoints are working
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api/v1"

def test_endpoint(method, path, data=None, headers=None):
    """Test an API endpoint and print results"""
    url = f"{BASE_URL}{path}"
    print(f"\n{'='*60}")
    print(f"Testing: {method} {path}")
    print(f"{'='*60}")
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers)
        elif method == "PUT":
            response = requests.put(url, json=data, headers=headers)
        else:
            print(f"Unsupported method: {method}")
            return
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)[:500]}...")
        
        if response.status_code >= 400:
            print(f"ERROR: {response.text}")
    except Exception as e:
        print(f"ERROR: {str(e)}")

def main():
    """Run all endpoint tests"""
    print("Starting API endpoint tests...")
    
    # Test root and health endpoints
    test_endpoint("GET", "/../")
    test_endpoint("GET", "/../health")
    
    # Test quiz endpoints
    test_endpoint("GET", "/quizzes/generate/big_five")
    test_endpoint("GET", "/quizzes/daily")
    test_endpoint("GET", "/quizzes/categories")
    test_endpoint("GET", "/quizzes/trending?limit=3")
    
    # Test quiz submission
    submission_data = {
        "quiz_id": "123e4567-e89b-12d3-a456-426614174000",
        "answers": [
            {"question_id": 1, "selected_option": "a", "time_taken": 5.2},
            {"question_id": 2, "selected_option": "b", "time_taken": 3.8},
            {"question_id": 3, "selected_option": "c", "time_taken": 4.1},
            {"question_id": 4, "selected_option": "a", "time_taken": 6.0},
            {"question_id": 5, "selected_option": "d", "time_taken": 2.9}
        ],
        "total_time": 22.0
    }
    test_endpoint("POST", "/quizzes/submit", submission_data)
    
    # Test AI endpoints
    ai_quiz_data = {
        "quiz_type": "big_five",
        "theme": "workplace personality",
        "num_questions": 10,
        "difficulty": "medium"
    }
    test_endpoint("POST", "/ai/generate-quiz", ai_quiz_data)
    
    ai_analysis_data = {
        "quiz_responses": {"q1": "a", "q2": "b", "q3": "c"},
        "quiz_type": "big_five"
    }
    test_endpoint("POST", "/ai/analyze-personality", ai_analysis_data)
    
    # Test share endpoints
    share_data = {
        "result_id": "123e4567-e89b-12d3-a456-426614174000",
        "template": "colorful",
        "include_comparison": True
    }
    test_endpoint("POST", "/share/create-card", share_data)
    test_endpoint("GET", "/share/preview/abc123")
    
    # Test user endpoints (without auth)
    register_data = {
        "email": "test@example.com",
        "username": "testuser",
        "password": "securepass123"
    }
    test_endpoint("POST", "/user/register", register_data)
    
    login_data = {
        "email": "test@example.com",
        "password": "securepass123"
    }
    test_endpoint("POST", "/user/login", login_data)
    
    # Test analytics endpoints
    analytics_event = {
        "event_type": "quiz_completed",
        "event_data": {"quiz_id": "123", "score": 85},
        "session_id": "session_123"
    }
    test_endpoint("POST", "/analytics/track", analytics_event)
    test_endpoint("GET", "/analytics/stats")
    test_endpoint("GET", "/analytics/realtime")
    test_endpoint("GET", "/analytics/funnel?funnel_type=quiz_completion")
    
    print("\n\nAll tests completed!")

if __name__ == "__main__":
    main()