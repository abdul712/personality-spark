# Personality Spark API

A production-ready Cloudflare Workers API for the Personality Spark application, built with Hono framework and TypeScript.

## Features

- 🚀 **High Performance**: Built on Cloudflare Workers for edge computing
- 🔒 **Secure**: JWT authentication, rate limiting, and security headers
- 🤖 **AI-Powered**: Integrated with Workers AI for quiz generation
- 💾 **Multiple Storage**: D1 for SQL, KV for caching, R2 for files
- 📊 **Analytics**: Built-in event tracking and metrics
- 🎯 **Type-Safe**: Full TypeScript support with Zod validation

## API Endpoints

### Quizzes
- `GET /api/v1/quizzes/generate/:quiz_type` - Generate AI quiz
- `GET /api/v1/quizzes/daily` - Get daily challenge
- `POST /api/v1/quizzes/submit` - Submit quiz answers
- `GET /api/v1/quizzes/result/:result_id` - Get quiz results
- `GET /api/v1/quizzes/categories` - List quiz categories

### AI
- `POST /api/v1/ai/generate-quiz` - Generate custom quiz
- `POST /api/v1/ai/analyze-personality` - Analyze personality
- `POST /api/v1/ai/generate-insights` - Generate insights
- `GET /api/v1/ai/models` - List available AI models

### Share
- `POST /api/v1/share/create-card` - Generate share card
- `GET /api/v1/share/preview/:share_id` - Preview shared result
- `POST /api/v1/share/challenge` - Create friend challenge
- `GET /api/v1/share/challenge/:challenge_id` - Get challenge details

### User (Optional)
- `POST /api/v1/user/register` - Create account
- `POST /api/v1/user/login` - Login
- `GET /api/v1/user/profile` - Get user profile
- `PUT /api/v1/user/preferences` - Update preferences
- `GET /api/v1/user/history` - Quiz history
- `POST /api/v1/user/logout` - Logout
- `DELETE /api/v1/user/account` - Delete account

### Analytics
- `POST /api/v1/analytics/track` - Track events
- `GET /api/v1/analytics/stats` - Get statistics
- `GET /api/v1/analytics/dashboard` - Admin dashboard
- `POST /api/v1/analytics/batch` - Batch track events

## Development

### Prerequisites
- Node.js 18+
- Cloudflare account
- Wrangler CLI

### Setup

1. Install dependencies:
```bash
npm install
```

2. Create D1 database:
```bash
wrangler d1 create personality-spark
```

3. Create KV namespaces:
```bash
wrangler kv:namespace create CACHE
wrangler kv:namespace create SESSIONS
```

4. Create R2 bucket:
```bash
wrangler r2 bucket create personality-spark-storage
```

5. Update `wrangler.jsonc` with your IDs

6. Run migrations:
```bash
wrangler d1 execute personality-spark --local --file=./migrations/0001_initial_schema.sql
```

7. Start development server:
```bash
npm run dev
```

## Testing

Run tests:
```bash
npm test
```

## Deployment

Deploy to Cloudflare:
```bash
npm run deploy
```

## Environment Variables

Set these secrets in Cloudflare:
```bash
wrangler secret put JWT_SECRET
wrangler secret put DEEPSEEK_API_KEY
wrangler secret put OPENROUTER_API_KEY
```

## Architecture

- **Framework**: Hono - Fast, lightweight web framework
- **Runtime**: Cloudflare Workers - Edge computing platform
- **Database**: D1 - Serverless SQL database
- **Cache**: KV - Key-value storage
- **Files**: R2 - Object storage
- **AI**: Workers AI - Built-in AI models
- **Rate Limiting**: Durable Objects

## Security

- JWT authentication for protected routes
- Rate limiting on all endpoints
- CORS configuration
- Security headers (CSP, HSTS, etc.)
- Input validation with Zod
- SQL injection protection with prepared statements

## Performance

- Edge caching with KV
- Optimized AI model selection
- Batch operations for analytics
- Efficient database queries
- Response compression

## License

MIT