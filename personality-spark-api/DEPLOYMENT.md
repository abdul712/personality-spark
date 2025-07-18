# Deployment Guide for Personality Spark API

This guide walks you through deploying the Personality Spark API to Cloudflare Workers.

## Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://dash.cloudflare.com/sign-up)
2. **Node.js**: Version 18 or higher
3. **Wrangler CLI**: Installed globally (`npm install -g wrangler`)

## Step 1: Authentication

Login to Cloudflare via Wrangler:
```bash
wrangler login
```

## Step 2: Create Resources

### Create D1 Database
```bash
wrangler d1 create personality-spark
```
Copy the database ID from the output.

### Create KV Namespaces
```bash
# Cache namespace
wrangler kv:namespace create CACHE
wrangler kv:namespace create CACHE --preview

# Sessions namespace
wrangler kv:namespace create SESSIONS
wrangler kv:namespace create SESSIONS --preview
```
Copy the namespace IDs from the output.

### Create R2 Bucket
```bash
wrangler r2 bucket create personality-spark-storage
```

## Step 3: Update Configuration

Edit `wrangler.jsonc` and replace the placeholder IDs:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "personality-spark",
      "database_id": "YOUR_D1_DATABASE_ID_HERE"
    }
  ],
  
  "kv_namespaces": [
    {
      "binding": "CACHE",
      "id": "YOUR_CACHE_KV_ID_HERE",
      "preview_id": "YOUR_CACHE_PREVIEW_ID_HERE"
    },
    {
      "binding": "SESSIONS",
      "id": "YOUR_SESSIONS_KV_ID_HERE",
      "preview_id": "YOUR_SESSIONS_PREVIEW_ID_HERE"
    }
  ]
}
```

## Step 4: Set Environment Secrets

```bash
# Generate a secure JWT secret
wrangler secret put JWT_SECRET
# Enter a random string (e.g., use: openssl rand -base64 32)

# Add API keys if using external AI services
wrangler secret put DEEPSEEK_API_KEY
# Enter your DeepSeek API key

wrangler secret put OPENROUTER_API_KEY
# Enter your OpenRouter API key
```

## Step 5: Run Database Migrations

### Local Development
```bash
npm run db:migrate
```

### Production
```bash
npm run db:migrate:prod
```

## Step 6: Deploy

### Development Deployment
```bash
wrangler deploy --env development
```

### Production Deployment
```bash
wrangler deploy --env production
```

## Step 7: Create Durable Objects

After first deployment, create the Durable Object namespaces:
```bash
wrangler deploy
```

The rate limiter Durable Object will be automatically created.

## Step 8: Verify Deployment

Test the health endpoint:
```bash
curl https://your-worker-subdomain.workers.dev/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-07-18T12:00:00.000Z",
  "environment": "production"
}
```

## Custom Domain Setup (Optional)

1. Go to Cloudflare Dashboard > Workers & Pages
2. Select your worker
3. Click "Custom Domains" tab
4. Add your domain (e.g., `api.personalityspark.com`)
5. Follow the DNS configuration instructions

## Monitoring

### View Logs
```bash
wrangler tail
```

### View Metrics
- Go to Cloudflare Dashboard > Workers & Pages
- Select your worker
- View Analytics tab

## Troubleshooting

### Common Issues

1. **D1 Database Errors**
   - Ensure migrations have run successfully
   - Check database bindings in wrangler.jsonc

2. **KV Namespace Errors**
   - Verify namespace IDs are correct
   - Ensure both production and preview IDs are set

3. **Authentication Errors**
   - Verify JWT_SECRET is set
   - Check token expiration logic

4. **Rate Limiting Issues**
   - Ensure Durable Objects are enabled
   - Check rate limit configuration

### Debug Commands

```bash
# Check worker status
wrangler deployments list

# View real-time logs
wrangler tail --format pretty

# Test locally
npm run dev
```

## Environment-Specific Configuration

### Development
- Use `--env development` flag
- Lower rate limits for testing
- Verbose logging enabled

### Staging
- Use `--env staging` flag
- Production-like settings
- Test integrations

### Production
- Default deployment
- Optimized settings
- Minimal logging

## Rollback

To rollback to a previous version:
```bash
wrangler rollback [deployment-id]
```

View deployment history:
```bash
wrangler deployments list
```

## Maintenance

### Update Dependencies
```bash
npm update
npm audit fix
```

### Database Migrations
Place new migration files in `migrations/` directory:
```bash
wrangler d1 execute personality-spark --file=./migrations/0002_new_migration.sql
```

### Backup Data
```bash
# Export D1 data
wrangler d1 export personality-spark --output backup.sql

# Download KV data
wrangler kv:key list --namespace-id=YOUR_KV_ID
```

## Security Checklist

- [x] JWT_SECRET is strong and unique
- [x] API keys are stored as secrets
- [x] CORS is properly configured
- [x] Rate limiting is enabled
- [x] Input validation is active
- [x] SQL injection protection via prepared statements
- [x] Security headers are set

## Performance Optimization

1. **Caching Strategy**
   - Quiz results cached for 24 hours
   - Daily challenges cached until midnight
   - User sessions cached for 30 days

2. **Database Optimization**
   - Indexes on frequently queried columns
   - Prepared statements for all queries
   - Connection pooling handled by D1

3. **AI Model Selection**
   - Use Workers AI for low latency
   - Fall back to external APIs for complex tasks
   - Cache AI responses when appropriate

## Support

For issues or questions:
1. Check the [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/)
2. Review the [Hono documentation](https://hono.dev/)
3. Open an issue in the repository