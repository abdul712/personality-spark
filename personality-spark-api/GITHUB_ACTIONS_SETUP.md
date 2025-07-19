# GitHub Actions Setup for Cloudflare Deployment

## Prerequisites

1. **Cloudflare API Token**
   - Go to https://dash.cloudflare.com/profile/api-tokens
   - Click "Create Token"
   - Use "Edit Cloudflare Workers" template or create custom token with these permissions:
     - Account: Workers Scripts:Edit
     - Zone: Workers Routes:Edit (if using custom domain)
   - Copy the token

2. **Cloudflare Account ID**
   - Go to any domain in your Cloudflare dashboard
   - In the right sidebar, find "Account ID"
   - Copy this ID (it's already in your wrangler.toml: `79c03e5169d22c2c869d0d3c80932187`)

## Setting up GitHub Secrets

1. Go to your GitHub repository: https://github.com/abdul712/personality-spark
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add the following secrets:

   - **CLOUDFLARE_API_TOKEN**
     - Name: `CLOUDFLARE_API_TOKEN`
     - Value: Your API token from step 1

   - **CLOUDFLARE_ACCOUNT_ID**
     - Name: `CLOUDFLARE_ACCOUNT_ID`
     - Value: `79c03e5169d22c2c869d0d3c80932187`

## How it Works

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will:

1. Trigger on pushes to the `main` branch when files in `personality-spark-api/` or `apps/web/` change
2. Build the frontend application
3. Copy the bundle to the API's public directory
4. Deploy the entire application to Cloudflare Workers

## Testing the Deployment

1. Make a change to any file in `personality-spark-api/` or `apps/web/`
2. Commit and push to the `main` branch
3. Go to the Actions tab in your GitHub repository
4. Watch the deployment progress
5. Once complete, visit https://personality-spark-api.mabdulrahim.workers.dev

## Troubleshooting

- If the deployment fails with authentication errors, double-check your API token permissions
- If the deployment succeeds but changes aren't visible, clear your browser cache
- Check the Actions logs for detailed error messages

## Manual Deployment

If you need to deploy manually while troubleshooting:

```bash
cd personality-spark-api
npm run deploy
```