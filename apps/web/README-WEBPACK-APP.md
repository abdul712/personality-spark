# Webpack Test App (NOT THE MAIN FRONTEND)

⚠️ **Important**: This is a test/development webpack app, NOT the main Personality Spark frontend.

## Main Frontend Location

The actual Personality Spark frontend is located at:
- **Path**: `./react-app/`
- **Built with**: React + Vite
- **Contains**: Full blog system with 1,718 articles, quiz functionality, etc.

## This Directory (webpack app)

This directory contains a simple webpack-based test app with:
- Basic React counter component (PureReactApp.tsx)
- No blog functionality
- Used for testing webpack configuration

## For Development/Deployment

**Use the react-app instead**:
```bash
cd react-app/
npm install
npm run dev
```

## Deployment Configuration

The Cloudflare Pages deployment has been updated to use the react-app:
- **Build command**: `cd apps/web/react-app && npm install && npm run build:cloudflare`
- **Build output**: `apps/web/react-app/dist`

See `CLOUDFLARE_PAGES_SETUP.md` for full deployment instructions.