#!/bin/bash

echo "Testing Personality Spark Application"
echo "======================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

echo "✅ Docker is installed"

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install docker-compose first."
    exit 1
fi

echo "✅ docker-compose is installed"

# Build the frontend
echo ""
echo "Building frontend..."
cd apps/web
npm install
npm run build
cd ../..

echo "✅ Frontend built successfully"

# Start the services
echo ""
echo "Starting services with docker-compose..."
docker-compose up -d

echo ""
echo "Waiting for services to start..."
sleep 10

# Check if services are running
echo ""
echo "Checking service status..."

# Check frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is running on http://localhost:3000"
else
    echo "❌ Frontend is not accessible"
fi

# Check backend
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend is running on http://localhost:8000"
else
    echo "❌ Backend is not accessible"
fi

# Check main app through nginx
if curl -s http://localhost/health > /dev/null; then
    echo "✅ Main application is running on http://localhost"
else
    echo "❌ Main application is not accessible"
fi

echo ""
echo "======================================"
echo "Application is ready!"
echo "Visit http://localhost to see the app"
echo ""
echo "To stop the services, run: docker-compose down"