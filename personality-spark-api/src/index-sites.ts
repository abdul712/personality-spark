import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { etag } from 'hono/etag';
import { secureHeaders } from 'hono/secure-headers';
import { timing } from 'hono/timing';
import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

// Import routes
import { quizRouter } from './routes/quizzes';
import { aiRouter } from './routes/ai';
import { shareRouter } from './routes/share';
import { userRouter } from './routes/user';
import { analyticsRouter } from './routes/analytics';

// Import middleware
import { errorHandler } from './middleware/error';
import { rateLimiter } from './middleware/rateLimit';

// Import types
import type { Context } from './types/env';

// @ts-ignore
import manifestJSON from '__STATIC_CONTENT_MANIFEST';
const assetManifest = JSON.parse(manifestJSON);

const app = new Hono<Context>();

// Global middleware - NO COMPRESSION
app.use('*', logger());
app.use('*', timing());
app.use('*', etag());
app.use('*', secureHeaders());

// CORS configuration
app.use('*', cors({
  origin: (origin) => {
    // Allow localhost in development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return origin;
    }
    // Allow production domains
    if (origin.includes('personalityspark.com')) {
      return origin;
    }
    return null;
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Apply rate limiting to all routes
app.use('*', rateLimiter());

// Error handling
app.onError(errorHandler);

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT,
  });
});

// Debug endpoint - minimal response
app.get('/debug', (c) => {
  return new Response('OK - Sites Worker', {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
});

// API routes
app.route('/api/v1/quizzes', quizRouter);
app.route('/api/v1/ai', aiRouter);
app.route('/api/v1/share', shareRouter);
app.route('/api/v1/user', userRouter);
app.route('/api/v1/analytics', analyticsRouter);

// Serve static files for non-API routes using Workers Sites
app.get('*', async (c) => {
  const url = new URL(c.req.url);
  
  // Skip API routes
  if (url.pathname.startsWith('/api/')) {
    return c.json({
      error: 'Not Found',
      message: 'The requested endpoint does not exist',
    }, 404);
  }
  
  try {
    // Use Workers Sites KV asset handler
    const response = await getAssetFromKV(
      {
        request: c.req.raw,
        waitUntil: (promise: Promise<any>) => c.executionCtx.waitUntil(promise),
      },
      {
        ASSET_NAMESPACE: c.env.__STATIC_CONTENT,
        ASSET_MANIFEST: assetManifest,
      }
    );
    
    return response;
  } catch (e) {
    // If it's a 404, try serving index.html for SPA routing
    if (e.status === 404) {
      try {
        const indexResponse = await getAssetFromKV(
          {
            request: new Request(new URL('/index.html', c.req.url).toString()),
            waitUntil: (promise: Promise<any>) => c.executionCtx.waitUntil(promise),
          },
          {
            ASSET_NAMESPACE: c.env.__STATIC_CONTENT,
            ASSET_MANIFEST: assetManifest,
          }
        );
        
        return new Response(indexResponse.body, {
          status: 200,
          headers: indexResponse.headers,
        });
      } catch (indexError) {
        // If index.html also not found, return 404
        return c.json({
          error: 'Not Found',
          message: 'Page not found',
        }, 404);
      }
    }
    
    // For other errors, return 500
    console.error('Error serving static assets:', e);
    return c.json({
      error: 'Internal Server Error',
      message: 'Failed to serve static assets',
    }, 500);
  }
});

export default app;

// Export Durable Objects
export { RateLimiter } from './middleware/rateLimit';