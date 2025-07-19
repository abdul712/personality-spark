#!/bin/bash

# Deploy Frontend Script
# This script builds the frontend and copies it to the backend public directory

echo "🚀 Building frontend with production configuration..."
cd apps/web
npm run build

echo "📦 Copying built files to backend public directory..."
cd ../..
cp -r apps/web/dist/* personality-spark-api/public/

# Clean up old bundle files if they exist
if [ -f "personality-spark-api/public/bundle.js" ]; then
    echo "🧹 Cleaning up old bundle files..."
    rm -f personality-spark-api/public/bundle.js*
fi

echo "✅ Frontend deployment complete!"
echo "📋 Files deployed to personality-spark-api/public/:"
ls -la personality-spark-api/public/