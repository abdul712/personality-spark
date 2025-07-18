#!/bin/bash

# Cloudflare Pages Deployment Script
# This script prepares the build for Cloudflare Pages

echo "🚀 Preparing Cloudflare Pages deployment..."

# Check if node_modules exists, install if not
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the application
echo "📦 Building application..."
npm run build:cloudflare

# Copy redirects and headers to dist
echo "📋 Copying configuration files..."
cp public/_redirects dist/_redirects 2>/dev/null || true
cp public/_headers dist/_headers 2>/dev/null || true

# Create a deployment info file
echo "📝 Creating deployment info..."
cat > dist/deployment-info.json <<EOF
{
  "buildTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "gitCommit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "gitBranch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')"
}
EOF

echo "✅ Build complete! Ready for Cloudflare Pages deployment."
echo ""
echo "📌 Next steps:"
echo "1. Push this code to your GitHub repository"
echo "2. In Cloudflare Dashboard, create a new Pages project"
echo "3. Connect your GitHub repository"
echo "4. Use these build settings:"
echo "   - Build command: cd apps/web && npm install && npm run build:cloudflare"
echo "   - Build output directory: apps/web/dist"
echo "   - Root directory: /"
echo ""
echo "5. Add these environment variables in Cloudflare Pages:"
echo "   - API_URL: https://personality-spark-api.workers.dev/api/v1"
echo "   - REACT_APP_API_URL: https://personality-spark-api.workers.dev/api/v1"