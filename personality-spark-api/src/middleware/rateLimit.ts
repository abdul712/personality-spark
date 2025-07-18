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

// Middleware function
export const rateLimiter = (options?: {
  keyGenerator?: (c: any) => string;
  limit?: number;
  window?: number;
}): MiddlewareHandler<Context> => {
  const {
    keyGenerator = (c) => c.req.header('CF-Connecting-IP') || 'anonymous',
    limit = 60,
    window = 60000, // 1 minute
  } = options || {};

  return async (c, next) => {
    const key = keyGenerator(c);
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