#!/bin/bash

# Verify Deployment Script
# This script checks if the deployment is successful and the latest build is live

echo "🔍 Verifying deployment..."

# Check if the build directory exists
if [ ! -d "apps/web/react-app/dist" ]; then
    echo "❌ Build directory not found. Run 'npm run build' in apps/web/react-app first."
    exit 1
fi

# Check if files are copied to public directory
if [ ! -d "personality-spark-api/public" ] || [ -z "$(ls -A personality-spark-api/public)" ]; then
    echo "❌ Public directory is empty. Run deploy-frontend.sh first."
    exit 1
fi

# Get the build timestamp from the index.html
BUILD_HASH_LOCAL=$(grep -o 'index-[a-zA-Z0-9]*\.js' apps/web/react-app/dist/index.html | head -1)
BUILD_HASH_PUBLIC=$(grep -o 'index-[a-zA-Z0-9]*\.js' personality-spark-api/public/index.html | head -1)

echo "📊 Build comparison:"
echo "   Local build:  $BUILD_HASH_LOCAL"
echo "   Public build: $BUILD_HASH_PUBLIC"

if [ "$BUILD_HASH_LOCAL" != "$BUILD_HASH_PUBLIC" ]; then
    echo "⚠️  Build mismatch detected! The public directory has outdated files."
    echo "   Run ./deploy-frontend.sh to update."
else
    echo "✅ Build files are in sync!"
fi

# Check if the live site is accessible
echo ""
echo "🌐 Checking live site..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://personality-spark-api.mabdulrahim.workers.dev)

if [ "$RESPONSE" = "200" ]; then
    echo "✅ Site is live and responding (HTTP $RESPONSE)"
    
    # Check if the deployed version matches local build
    LIVE_CONTENT=$(curl -s https://personality-spark-api.mabdulrahim.workers.dev | head -100)
    if echo "$LIVE_CONTENT" | grep -q "$BUILD_HASH_PUBLIC"; then
        echo "✅ Live site is serving the latest build!"
    else
        echo "⚠️  Live site might be serving cached content."
        echo "   Clear Cloudflare cache or wait a few minutes for propagation."
    fi
else
    echo "❌ Site returned HTTP $RESPONSE"
fi

echo ""
echo "📝 Summary:"
echo "   - Local build exists: ✓"
echo "   - Files copied to public: ✓"
echo "   - Build versions match: $([ "$BUILD_HASH_LOCAL" = "$BUILD_HASH_PUBLIC" ] && echo "✓" || echo "✗")"
echo "   - Site is accessible: $([ "$RESPONSE" = "200" ] && echo "✓" || echo "✗")"