# Cloudflare Pages Setup Guide

## Overview
This guide explains how to deploy the Personality Spark frontend to Cloudflare Pages.

## Prerequisites
- GitHub repository connected to Cloudflare
- Cloudflare account with Pages enabled
- Workers API deployed (see personality-spark-api)

## Build Configuration

### Build Settings
- **Framework preset**: None
- **Build command**: `cd apps/web && npm install && npm run build:cloudflare`
- **Build output directory**: `apps/web/dist`
- **Root directory**: `/` (repository root)
- **Node version**: 18 or higher

### Environment Variables
Add these in Cloudflare Pages dashboard:

```env
# Required
API_URL=https://personality-spark-api.workers.dev/api/v1
REACT_APP_API_URL=https://personality-spark-api.workers.dev/api/v1

# Optional (for future use)
REACT_APP_GA_TRACKING_ID=UA-XXXXXXXXX-X
REACT_APP_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
```

## Local Development

### Setup
```bash
cd apps/web
npm install
cp .env.example .env.local
# Edit .env.local with your local API URL
```

### Run Development Server
```bash
npm start
# Opens at http://localhost:3000
```

### Build for Production
```bash
npm run build:cloudflare
# Output in dist/ directory
```

## Deployment Process

### Automatic Deployment (Recommended)
1. Push code to GitHub
2. Cloudflare Pages automatically builds and deploys
3. Preview deployments created for pull requests

### Manual Deployment
```bash
# Run the deployment script
./deploy-cloudflare.sh

# Or manually:
npm run build:cloudflare
# Then use Cloudflare Pages Direct Upload
```

## Features Configured

### Routing
- Single Page Application routing via `_redirects`
- All routes redirect to index.html with 200 status

### Security Headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict Referrer Policy
- Restrictive Permissions Policy

### Caching
- Static assets: 1 year cache
- JavaScript/CSS: 1 year cache with immutable
- HTML: No cache for fresh content

### Performance Optimizations
- Code splitting for vendors and React
- Content hash in filenames
- Minified HTML/JS/CSS
- Optimized images

## API Integration

The frontend connects to the Workers API at:
- Production: `https://personality-spark-api.workers.dev/api/v1`
- Local development: `http://localhost:8787/api/v1`

Configure via environment variables.

## Troubleshooting

### Build Failures
1. Check Node version (must be 18+)
2. Clear cache in Cloudflare Pages settings
3. Verify all dependencies in package.json

### API Connection Issues
1. Verify API_URL environment variable
2. Check Workers API is deployed
3. Test API endpoints directly

### Routing Issues
1. Ensure `_redirects` file is in public directory
2. Check build output includes the file
3. Verify Pages deployment settings

## Monitoring

### Analytics
- Cloudflare Web Analytics (free tier)
- Pages deployment metrics
- Build time tracking

### Error Tracking
- Browser console for client errors
- Cloudflare Pages functions logs
- Network tab for API issues

## Next Steps

1. Configure custom domain in Cloudflare Pages
2. Set up preview deployments for branches
3. Enable Cloudflare Web Analytics
4. Configure build notifications
5. Set up deployment webhooks

## Support

For issues:
1. Check Cloudflare Pages build logs
2. Review browser console errors
3. Verify environment variables
4. Test API endpoints independently