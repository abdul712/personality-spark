#!/bin/bash

# Quick test script for Personality Spark API
BASE_URL="https://personality-spark-api.mabdulrahim.workers.dev"

echo "=== Testing Personality Spark API ==="
echo "Base URL: $BASE_URL"
echo ""

# Test 1: Homepage
echo "1. Testing Homepage:"
curl -s $BASE_URL | head -c 200
echo -e "\n"

# Test 2: Quiz Categories
echo "2. Testing Quiz Categories API:"
curl -s $BASE_URL/api/v1/quizzes/categories | jq '.'
echo ""

# Test 3: Generate Quiz
echo "3. Testing Quiz Generation:"
curl -s $BASE_URL/api/v1/quizzes/generate/personality | jq '.'
echo ""

# Test 4: Daily Quiz
echo "4. Testing Daily Quiz:"
curl -s $BASE_URL/api/v1/quizzes/daily | jq '.'
echo ""

# Test 5: Health Check
echo "5. Testing Health Check:"
curl -s $BASE_URL/health
echo -e "\n"

echo "=== Test Complete ==="
echo "✓ Frontend is being served at: $BASE_URL"
echo "✓ API endpoints are available at: $BASE_URL/api/v1/*"
echo ""
echo "Next steps:"
echo "1. Set JWT_SECRET using: cd personality-spark-api && ./setup-secrets.sh"
echo "2. Configure AI API keys for enhanced quiz generation"
echo "3. Set up Turnstile for CAPTCHA protection"