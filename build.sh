#!/bin/bash
set -e  # Exit on error

# Build script for Cloudflare deployment
echo "Starting Cloudflare build process..."
echo "Current directory: $(pwd)"

# Ensure we're in the project root
if [ ! -f "package.json" ] || [ ! -d "personality-spark-api" ]; then
    echo "Error: Not in project root directory"
    exit 1
fi

# Build React app
echo "Building React app..."
if [ ! -d "apps/web/react-app" ]; then
    echo "Error: React app directory not found"
    exit 1
fi

cd apps/web/react-app
echo "Installing React app dependencies..."
npm ci
echo "Building React app..."
npm run build

# Copy build to API public directory
echo "Copying build to API public directory..."
cd ../../../
echo "Current directory after build: $(pwd)"

# Ensure API public directory exists
mkdir -p personality-spark-api/public

# Remove old files and copy new ones
rm -rf personality-spark-api/public/*
cp -r apps/web/react-app/dist/* personality-spark-api/public/

# Verify files were copied
if [ ! -f "personality-spark-api/public/index.html" ]; then
    echo "Error: Build files were not copied successfully"
    exit 1
fi

# Install API dependencies
echo "Installing API dependencies..."
cd personality-spark-api
npm ci

echo "Build completed successfully!"
echo "Files in public directory:"
ls -la public/