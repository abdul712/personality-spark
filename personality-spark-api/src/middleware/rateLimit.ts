import { MiddlewareHandler } from 'hono';
import type { Context } from '../types/env';

// Rate limiter Durable Object
export class RateLimiter {
  private state: DurableObjectState;
  private requests: Map<string, number[]> = new Map();

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const { key, limit = 60, window = 60000 } = await request.json<{
      key: string;
      limit?: number;
      window?: number;
    }>();

    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    
    // Remove old timestamps outside the window
    const validTimestamps = timestamps.filter(ts => now - ts < window);
    
    // Check if limit exceeded
    if (validTimestamps.length >= limit) {
      const oldestTimestamp = validTimestamps[0];
      const resetTime = oldestTimestamp + window;
      
      return new Response(JSON.stringify({
        allowed: false,
        remaining: 0,
        resetTime,
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Add current timestamp
    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);
    
    // Clean up old entries periodically
    if (this.requests.size > 10000) {
      for (const [k, v] of this.requests.entries()) {
        if (v.every(ts => now - ts > window)) {
          this.requests.delete(k);
        }
      }
    }
    
    return new Response(JSON.stringify({
      allowed: true,
      remaining: limit - validTimestamps.length,
      resetTime: now + window,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Rate limit tiers configuration
export interface RateLimitTier {
  limit: number;
  window: number;
  pathPattern?: RegExp;
}

// Default rate limit tiers
export const DEFAULT_RATE_LIMIT_TIERS: RateLimitTier[] = [
  // Expensive AI operations: 10 requests per minute
  { pathPattern: /^\/api\/v1\/ai\/generate/, limit: 10, window: 60000 },
  { pathPattern: /^\/api\/v1\/quizzes\/generate/, limit: 15, window: 60000 },
  
  // Moderate operations: 30 requests per minute
  { pathPattern: /^\/api\/v1\/quizzes\/submit/, limit: 30, window: 60000 },
  { pathPattern: /^\/api\/v1\/share\//, limit: 30, window: 60000 },
  { pathPattern: /^\/api\/v1\/user\//, limit: 30, window: 60000 },
  
  // Light operations: 60 requests per minute
  { pathPattern: /^\/api\/v1\/quizzes\/(categories|daily|result)/, limit: 60, window: 60000 },
  { pathPattern: /^\/api\/v1\/analytics\//, limit: 60, window: 60000 },
  
  // Static content: 120 requests per minute
  { pathPattern: /^\/api\/v1\/blog\//, limit: 120, window: 60000 },
  { pathPattern: /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i, limit: 200, window: 60000 },
];

// Get rate limit tier for a given path
export const getRateLimitTier = (path: string, tiers: RateLimitTier[] = DEFAULT_RATE_LIMIT_TIERS): RateLimitTier => {
  for (const tier of tiers) {
    if (tier.pathPattern && tier.pathPattern.test(path)) {
      return tier;
    }
  }
  // Default tier
  return { limit: 60, window: 60000 };
};

// Middleware function
export const rateLimiter = (options?: {
  keyGenerator?: (c: any) => string;
  limit?: number;
  window?: number;
  tiers?: RateLimitTier[];
}): MiddlewareHandler<Context> => {
  const {
    keyGenerator = (c) => c.req.header('CF-Connecting-IP') || 'anonymous',
    limit: defaultLimit = 60,
    window: defaultWindow = 60000, // 1 minute
    tiers = DEFAULT_RATE_LIMIT_TIERS,
  } = options || {};

  return async (c, next) => {
    const path = new URL(c.req.url).pathname;
    const tier = getRateLimitTier(path, tiers);
    const limit = tier.limit || defaultLimit;
    const window = tier.window || defaultWindow;
    
    const key = `${keyGenerator(c)}:${path}`;
    const rateLimiterId = c.env.RATE_LIMITER.idFromName(key);
    const rateLimiterStub = c.env.RATE_LIMITER.get(rateLimiterId);
    
    const response = await rateLimiterStub.fetch(
      new Request('http://rate-limiter', {
        method: 'POST',
        body: JSON.stringify({ key, limit, window }),
      })
    );
    
    const result = await response.json<{
      allowed: boolean;
      remaining: number;
      resetTime: number;
    }>();
    
    // Set rate limit headers
    c.header('X-RateLimit-Limit', limit.toString());
    c.header('X-RateLimit-Remaining', result.remaining.toString());
    c.header('X-RateLimit-Reset', result.resetTime.toString());
    
    if (!result.allowed) {
      return c.json({
        error: 'Rate Limit Exceeded',
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      }, 429);
    }
    
    await next();
  };
};