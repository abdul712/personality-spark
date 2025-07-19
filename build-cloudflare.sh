#!/bin/bash
set -e

echo "=== Cloudflare Build Script ==="
echo "Current directory: $(pwd)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Ensure we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: Not in project root directory"
    exit 1
fi

# Clean install in root
echo "Installing root dependencies..."
npm ci || npm install

# Force install Wrangler 4 globally for this build
echo "Installing Wrangler 4..."
npm install -g wrangler@4

# Build frontend
echo "Building frontend..."
cd apps/web
npm ci || npm install
npm run build
cd ../..

# Copy built files to API public directory
echo "Copying frontend build to API..."
rm -rf personality-spark-api/public/*
cp -r apps/web/dist/* personality-spark-api/public/

# Install API dependencies
echo "Installing API dependencies..."
cd personality-spark-api
npm ci || npm install

# Check Wrangler version
echo "Checking Wrangler version..."
wrangler --version

# Verify wrangler.toml exists
if [ ! -f "wrangler.toml" ]; then
    echo "Error: wrangler.toml not found in personality-spark-api directory"
    exit 1
fi

# Deploy using Wrangler 4
echo "Deploying with Wrangler 4..."
wrangler deploy

echo "=== Build Complete ==="