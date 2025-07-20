#!/bin/bash

echo "=== Cloudflare Workers Deployment Verification ==="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Worker URL
WORKER_URL="https://personality-spark-api.mabdulrahim.workers.dev"

echo "1. Testing Worker deployment..."
if curl -s -o /dev/null -w "%{http_code}" "$WORKER_URL" | grep -q "200"; then
    echo -e "${GREEN}✓ Worker is accessible${NC}"
else
    echo -e "${RED}✗ Worker is not accessible${NC}"
fi

echo ""
echo "2. Testing blog data..."
POSTS=$(curl -s "$WORKER_URL/blog-data.json" | python3 -c "import sys, json; data = json.load(sys.stdin); print(len(data['posts']))" 2>/dev/null)
if [ "$POSTS" = "947" ]; then
    echo -e "${GREEN}✓ Blog data loaded correctly: $POSTS articles${NC}"
else
    echo -e "${RED}✗ Blog data issue: Found $POSTS articles (expected 947)${NC}"
fi

echo ""
echo "3. Checking content formatting..."
CONTENT=$(curl -s "$WORKER_URL/blog-data.json" | python3 -c "import sys, json; data = json.load(sys.stdin); print('<strong>' in data['posts'][0]['content'])" 2>/dev/null)
if [ "$CONTENT" = "True" ]; then
    echo -e "${GREEN}✓ Content has proper formatting (strong tags)${NC}"
else
    echo -e "${RED}✗ Content formatting issue${NC}"
fi

echo ""
echo "4. Checking for external links..."
LINKS=$(curl -s "$WORKER_URL/blog-data.json" | python3 -c "import sys, json; data = json.load(sys.stdin); print('wikipedia.org' in data['posts'][0]['content'])" 2>/dev/null)
if [ "$LINKS" = "True" ]; then
    echo -e "${GREEN}✓ External links present${NC}"
else
    echo -e "${RED}✗ External links missing${NC}"
fi

echo ""
echo "=== Custom Domain Status ==="
echo ""
echo "To complete setup, you need to:"
echo "1. Log in to https://dash.cloudflare.com"
echo "2. Go to Workers & Pages > personality-spark-api > Settings"
echo "3. Add custom domains:"
echo "   - personalityspark.com"
echo "   - www.personalityspark.com"
echo ""
echo "Current worker URL: $WORKER_URL"
echo ""

# Check if domain is responding (will fail until configured)
echo "5. Testing production domain (will fail until configured)..."
if curl -s -o /dev/null -w "%{http_code}" "https://personalityspark.com" --max-time 5 | grep -q "200"; then
    echo -e "${GREEN}✓ Production domain is working${NC}"
else
    echo -e "${RED}✗ Production domain not yet configured${NC}"
fi