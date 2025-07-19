# Cloudflare Workers Deployment Configuration

## Current Working Configuration

### Deployment Method
- Using Cloudflare Workers (not Pages)
- Auto-deployment from GitHub integration
- Deployment triggered by `git push` to main branch

### Build Environment
- Node.js version: 18.17.0 (Cloudflare's default)
- Wrangler version: 3.57.0 (compatible with Node 18)

### Key Configuration Files

#### wrangler.toml
- Main entry: `personality-spark-api/src/index.ts`
- Compatibility date: `2024-05-01`
- Static site bucket: `./personality-spark-api/public`
- All required bindings configured (D1, KV, R2, AI)

#### package.json (root level)
- Added wrangler 3.57.0 as devDependency
- postinstall script ensures dependencies are installed

#### .npmrc
- Prevents npx from auto-installing latest packages
- Forces use of local dependencies

### Static File Serving
- Using Cloudflare Workers Sites feature
- Static files served from `personality-spark-api/public` directory
- Frontend build output copied to public directory
- Using `__STATIC_CONTENT` binding in Worker code

### Important Notes
1. DO NOT upgrade Wrangler beyond v3.x - it requires Node.js 20+
2. DO NOT modify the deployment command - Cloudflare uses `npx wrangler deploy`
3. DO NOT remove the wrangler wrapper script or .npmrc file
4. Always ensure frontend is built before deployment

### Deployment Process
1. Make code changes
2. Run locally: `npm run dev` (in personality-spark-api directory)
3. Build frontend: `cd apps/web && npm run build`
4. Copy build files: Already handled by build scripts
5. Commit and push: `git push origin main`
6. Monitor deployment in Cloudflare dashboard

### Troubleshooting
- If deployment fails, check Node.js version compatibility
- Ensure all dependencies are listed in package.json
- Check that static files are in the public directory
- Verify wrangler.toml configuration is correct

Last successful deployment: 2025-07-18