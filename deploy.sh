#!/bin/bash

# Deploy script for Cloudflare Workers with Node.js 18 compatibility

echo "Starting deployment process..."

# Install dependencies
cd personality-spark-api
npm install

# Run the deploy command using the locally installed wrangler
./node_modules/.bin/wrangler deploy

echo "Deployment complete!"