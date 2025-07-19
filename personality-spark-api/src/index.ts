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
app.use('*', compress({
  encoding: 'gzip'
}));
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
    // Use the __STATIC_CONTENT binding that Cloudflare Workers provides
    const asset = await c.env.__STATIC_CONTENT.get(url.pathname.slice(1));
    
    if (asset === null) {
      // If asset not found, try serving index.html for client-side routing
      const indexAsset = await c.env.__STATIC_CONTENT.get('index.html');
      if (indexAsset !== null) {
        return new Response(indexAsset, {
          headers: {
            'content-type': 'text/html;charset=UTF-8',
          },
        });
      }
      return c.notFound();
    }
    
    // Determine content type based on file extension
    const contentType = url.pathname.endsWith('.js') ? 'application/javascript' :
                       url.pathname.endsWith('.css') ? 'text/css' :
                       url.pathname.endsWith('.html') ? 'text/html' :
                       url.pathname.endsWith('.json') ? 'application/json' :
                       url.pathname.endsWith('.png') ? 'image/png' :
                       url.pathname.endsWith('.jpg') || url.pathname.endsWith('.jpeg') ? 'image/jpeg' :
                       url.pathname.endsWith('.svg') ? 'image/svg+xml' :
                       'application/octet-stream';
    
    return new Response(asset, {
      headers: {
        'content-type': contentType,
        'cache-control': 'public, max-age=3600',
      },
    });
  } catch (e) {
    return c.json({
      error: 'Internal Server Error',
      message: e.message,
    }, 500);
  }
});

export default app;

// Export Durable Objects
export { RateLimiter } from './middleware/rateLimit';
