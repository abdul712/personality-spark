#!/bin/bash

# Build script for Cloudflare deployment
echo "Starting Personality Spark build process..."

# Install Workers dependencies
echo "Installing Workers dependencies..."
cd personality-spark-api && npm install && cd ..

# Build the frontend
echo "Building frontend..."
cd apps/web && npm install && npm run build && cd ../..

# Copy frontend build to Workers public directory
echo "Copying frontend to Workers..."
rm -rf personality-spark-api/public/*
cp -r apps/web/dist/* personality-spark-api/public/

echo "Build complete!"