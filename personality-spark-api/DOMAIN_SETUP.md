# Setting up Custom Domain for Cloudflare Workers

## Current Situation
- Your domain `personalityspark.com` currently has an A record pointing to Cloudways
- Your Worker is deployed at: `https://personality-spark-api.mabdulrahim.workers.dev`
- You want to serve your Worker content on `personalityspark.com`

## Steps to Configure

### Option 1: Using Cloudflare Dashboard (Recommended)

1. **Log in to Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com
   - Select your account

2. **Navigate to Workers & Pages**
   - Click on "Workers & Pages" in the left sidebar
   - Find and click on `personality-spark-api`

3. **Add Custom Domain**
   - Go to the "Settings" tab
   - Find "Custom Domains" or "Triggers" section
   - Click "Add Custom Domain"
   - Add `personalityspark.com`
   - Add `www.personalityspark.com`

4. **DNS Records will be automatically updated**
   - Cloudflare will automatically remove conflicting A records
   - It will set up the proper routing for your Worker

### Option 2: Manual DNS Configuration

If the above doesn't work, manually update DNS:

1. **Go to DNS Management**
   - In Cloudflare Dashboard, go to your domain
   - Click on "DNS" tab

2. **Delete existing A records**
   - Find the A record pointing to Cloudways IP
   - Click "Edit" and then "Delete"

3. **Add Worker Route**
   - This is done in Workers & Pages > your worker > Triggers
   - Add route: `personalityspark.com/*`
   - Add route: `www.personalityspark.com/*`

### Option 3: Using CNAME (Not recommended for apex domain)

For subdomains only:
```
Type: CNAME
Name: www
Target: personality-spark-api.mabdulrahim.workers.dev
Proxy: ON (Orange cloud)
```

## Important Notes

1. **SSL/TLS**: Cloudflare automatically handles SSL certificates
2. **Propagation**: DNS changes can take up to 48 hours to propagate globally
3. **Caching**: Clear any browser cache after making changes
4. **API Routes**: Your API endpoints will be available at:
   - `https://personalityspark.com/api/v1/blog/posts`
   - `https://personalityspark.com/api/v1/quizzes`
   - etc.

## Verification

After setup, test these URLs:
- https://personalityspark.com (should show your site)
- https://personalityspark.com/blog-data.json (should show your blog data)
- https://personalityspark.com/api/v1/health (should return health check)

## Rollback

If you need to rollback to Cloudways:
1. Remove the custom domain from Workers
2. Add back the A record pointing to your Cloudways IP
3. Wait for DNS propagation