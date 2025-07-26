# Personality Spark Frontend

This is the main frontend application for PersonalitySpark.com, built with React + TypeScript + Vite.

## Features

- **Blog System**: Displays 1,718+ personality articles with chunked data loading
- **Quiz System**: Interactive personality quizzes and assessments  
- **Responsive Design**: Works on mobile and desktop
- **Performance Optimized**: Uses chunked JSON loading to handle large datasets

## Key Files

- **Blog Components**: `src/pages/BlogList.tsx`, `src/pages/BlogPost.tsx`
- **Chunked Data**: `public/blog-data-1.json` through `public/blog-data-4.json`
- **Data Index**: `public/blog-index.json` - Contains metadata for all chunks
- **Routing Config**: `public/_routes.json` - Cloudflare Pages routing configuration

## Development

```bash
npm install
npm run dev
# Opens at http://localhost:3000
```

## Deployment

This app is deployed to Cloudflare Pages. See `../CLOUDFLARE_PAGES_SETUP.md` for deployment configuration.

**Build command**: `cd apps/web/react-app && npm install && npm run build:cloudflare`
**Build output**: `apps/web/react-app/dist`

## Blog Data Architecture

The blog system handles 1,718 articles by splitting them into chunks:

1. **blog-index.json** - Contains metadata about chunks (4 chunks, 500 posts each)
2. **blog-data-1.json** through **blog-data-4.json** - Contains the actual article data
3. **_routes.json** - Ensures JSON files are served as static assets, not caught by React router

The BlogList component automatically loads all chunks in parallel for optimal performance.

## Technical Setup

Built with:
- React 19 + TypeScript
- Vite for build tooling
- React Router for navigation
- Tailwind CSS for styling
- Framer Motion for animations
- Lucide React for icons

## Previous Template Info

This was originally based on a React + TypeScript + Vite template. For ESLint configuration details, see the git history of this file.