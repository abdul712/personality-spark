import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { compress } from 'hono/compress';
import { etag } from 'hono/etag';
import { secureHeaders } from 'hono/secure-headers';
import { timing } from 'hono/timing';

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

const app = new Hono<Context>();

// Global middleware
app.use('*', logger());
app.use('*', timing());
// Temporarily disable compression to debug issue
// app.use('*', compress({
//   encoding: 'gzip'
// }));
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
  return new Response('OK', {
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

// Serve static files for non-API routes
app.get('*', async (c) => {
  const url = new URL(c.req.url);
  
  // Skip API routes
  if (url.pathname.startsWith('/api/')) {
    return c.json({
      error: 'Not Found',
      message: 'The requested endpoint does not exist',
    }, 404);
  }
  
  // For the root path, serve index.html
  if (url.pathname === '/') {
    url.pathname = '/index.html';
  }
  
  try {
    // Check if ASSETS binding exists
    if (!c.env.ASSETS) {
      console.error('ASSETS binding not found');
      return c.text('ASSETS binding not configured', 500);
    }
    
    // Create a new request for the asset
    const assetRequest = new Request(url.toString(), c.req.raw);
    
    // Use the ASSETS binding from Workers Sites
    const response = await c.env.ASSETS.fetch(assetRequest);
    
    // If not found, try serving index.html for client-side routing
    if (response.status === 404) {
      const indexUrl = new URL(url);
      indexUrl.pathname = '/index.html';
      const indexRequest = new Request(indexUrl.toString(), c.req.raw);
      const indexResponse = await c.env.ASSETS.fetch(indexRequest);
      
      if (indexResponse.status === 200) {
        return new Response(indexResponse.body, {
          headers: {
            'content-type': 'text/html;charset=UTF-8',
            'cache-control': 'no-cache',
          },
        });
      }
    }
    
    return response;
  } catch (e) {
    // Fallback error handling
    return c.json({
      error: 'Internal Server Error',
      message: e.message || 'Failed to serve static assets',
    }, 500);
  }
});

export default app;

// Export Durable Objects
export { RateLimiter } from './middleware/rateLimit';
