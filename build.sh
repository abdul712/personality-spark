#!/bin/bash

# Build script for Cloudflare deployment
echo "Starting Cloudflare build process..."

# Build React app
echo "Building React app..."
cd apps/web/react-app
npm ci
npm run build

# Copy build to API public directory
echo "Copying build to API public directory..."
cd ../../../
rm -rf personality-spark-api/public/*
cp -r apps/web/react-app/dist/* personality-spark-api/public/

# Install API dependencies
echo "Installing API dependencies..."
cd personality-spark-api
npm ci

echo "Build completed successfully!"