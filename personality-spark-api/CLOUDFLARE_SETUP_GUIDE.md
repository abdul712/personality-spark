# Complete Guide: Moving from Cloudways to Cloudflare Workers

## Current Status
- ✅ Worker deployed at: `https://personality-spark-api.mabdulrahim.workers.dev`
- ✅ Blog content updated (947 articles with proper formatting)
- ❌ Domain still pointing to Cloudways
- ❌ Need to configure custom domain

## Step-by-Step Instructions

### Step 1: Verify Domain is in Cloudflare
1. Go to https://dash.cloudflare.com
2. Check if `personalityspark.com` appears in your domains list
3. If not, you need to add it:
   - Click "Add a Site"
   - Enter `personalityspark.com`
   - Choose a plan (Free is fine)
   - Update nameservers at your registrar

### Step 2: Configure Custom Domain for Worker

#### Option A: Via Cloudflare Dashboard (Easiest)

1. **Navigate to Workers**
   - Go to https://dash.cloudflare.com
   - Click "Workers & Pages" in the left sidebar
   - Click on `personality-spark-api`

2. **Add Custom Domain**
   - Click on "Settings" tab
   - Scroll to "Custom Domains" section
   - Click "Add Custom Domain"
   - Enter `personalityspark.com` and click "Add"
   - Repeat for `www.personalityspark.com`

3. **Cloudflare will automatically:**
   - Remove conflicting DNS records
   - Set up proper routing
   - Configure SSL certificates

#### Option B: Via DNS + Routes (Manual)

1. **Remove Cloudways Records**
   - Go to DNS management for personalityspark.com
   - Delete any A records pointing to Cloudways IP
   - Delete any CNAME records pointing to Cloudways

2. **Add Worker Routes**
   - Go to Workers & Pages > personality-spark-api
   - Click "Triggers" tab
   - Add route: `personalityspark.com/*`
   - Add route: `www.personalityspark.com/*`

3. **Configure DNS (if needed)**
   - The routes should handle everything
   - No additional DNS records needed

### Step 3: Verify Setup

After configuration, test these URLs:

1. **Main site**: https://personalityspark.com
   - Should load your React app
   - Blog should show 947 articles

2. **Blog data**: https://personalityspark.com/blog-data.json
   - Should return JSON with all articles

3. **API endpoints**:
   - https://personalityspark.com/api/v1/health
   - https://personalityspark.com/api/v1/blog/posts

4. **Individual articles**: 
   - https://personalityspark.com/what-does-it-mean-when-a-guy-notices-your-hair
   - Should show formatted content with links

### Step 4: Clear Caches

1. **Cloudflare Cache**
   - Go to Caching > Configuration
   - Click "Purge Everything"

2. **Browser Cache**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

3. **KV Cache (if needed)**
   ```bash
   wrangler kv key delete --namespace-id c79fa3abb6d949d5aa540373fbb9fe4a "blog-data"
   ```

## Troubleshooting

### If site doesn't load:
1. Check DNS propagation: https://dnschecker.org
2. Verify routes in Workers dashboard
3. Check for SSL/TLS settings (should be "Flexible" or "Full")

### If old content shows:
1. Purge Cloudflare cache
2. Clear browser cache
3. Check deployment version

### If API doesn't work:
1. Verify routes include `/*` pattern
2. Check Worker logs: `wrangler tail`
3. Test Worker directly at workers.dev URL

## Rollback Plan

If you need to go back to Cloudways:
1. Remove custom domains from Worker
2. Add A record back:
   - Type: A
   - Name: @
   - Content: [Cloudways IP]
   - Proxy: OFF (gray cloud)

## Next Steps After Domain Setup

1. **Monitor Performance**
   - Check Workers Analytics
   - Monitor error rates

2. **Update Configuration**
   - Update CORS_ORIGIN in wrangler.toml if needed
   - Configure additional routes if required

3. **Set up Monitoring**
   - Enable Workers Analytics
   - Set up alerts for errors

## Contact Support

If you encounter issues:
1. Cloudflare Workers: https://community.cloudflare.com
2. Check Worker logs: `wrangler tail`
3. Review deployment: `wrangler deployments`