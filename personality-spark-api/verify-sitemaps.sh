#!/bin/bash

# Script to verify sitemap deployment on Cloudflare Workers

echo "🔍 Verifying sitemap deployment..."
echo ""

DOMAIN="https://personalityspark.com"

# Array of sitemap files to check
sitemaps=(
    "sitemap-index.xml"
    "sitemap.xml"
    "sitemap-1.xml"
    "sitemap-2.xml"
    "sitemap-3.xml"
    "sitemap-4.xml"
    "sitemap-5.xml"
    "sitemap-6.xml"
    "sitemap-7.xml"
    "sitemap-8.xml"
    "sitemap-9.xml"
)

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "Checking sitemap files..."
echo "========================="

for sitemap in "${sitemaps[@]}"; do
    url="$DOMAIN/$sitemap"
    echo -n "Checking $url ... "
    
    # Make HEAD request to check if file exists and get headers
    response=$(curl -s -I "$url")
    status_code=$(echo "$response" | grep -E "^HTTP" | awk '{print $2}')
    content_type=$(echo "$response" | grep -i "content-type:" | cut -d' ' -f2- | tr -d '\r\n')
    
    if [ "$status_code" = "200" ]; then
        if [[ "$content_type" == *"application/xml"* ]]; then
            echo -e "${GREEN}✓ OK${NC} (Status: $status_code, Content-Type: $content_type)"
        else
            echo -e "${YELLOW}⚠ WARNING${NC} (Status: $status_code, Content-Type: $content_type - should be application/xml)"
        fi
    else
        echo -e "${RED}✗ FAILED${NC} (Status: $status_code)"
    fi
done

echo ""
echo "========================="
echo "Checking robots.txt sitemap reference..."
robots_url="$DOMAIN/robots.txt"
robots_content=$(curl -s "$robots_url")
if echo "$robots_content" | grep -q "Sitemap: https://personalityspark.com/sitemap-index.xml"; then
    echo -e "${GREEN}✓ robots.txt correctly references sitemap-index.xml${NC}"
else
    echo -e "${RED}✗ robots.txt does not correctly reference sitemap-index.xml${NC}"
fi

echo ""
echo "🎯 Verification complete!"