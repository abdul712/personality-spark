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
import { blogRouter } from './routes/blog';

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
app.route('/api/v1/blog', blogRouter);

// Explicit sitemap handling
app.get('/sitemap*.xml', async (c) => {
  const url = new URL(c.req.url);
  
  try {
    if (!c.env.ASSETS) {
      console.error('ASSETS binding not found');
      return c.text('ASSETS binding not configured', 500);
    }
    
    const assetRequest = new Request(url.toString(), c.req.raw);
    const response = await c.env.ASSETS.fetch(assetRequest);
    
    if (response.status === 200) {
      // Set proper headers for XML sitemap
      return new Response(response.body, {
        status: 200,
        headers: {
          'content-type': 'application/xml;charset=UTF-8',
          'cache-control': 'public, max-age=3600', // Cache for 1 hour
          'x-robots-tag': 'noindex', // Sitemaps shouldn't be indexed themselves
        },
      });
    }
    
    return c.text('Sitemap not found', 404);
  } catch (e) {
    return c.json({
      error: 'Internal Server Error',
      message: 'Failed to serve sitemap',
    }, 500);
  }
});

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
    
    // If not found, check if we should serve index.html for client-side routing
    if (response.status === 404) {
      // Check if the path has a file extension
      const hasFileExtension = /\.[a-zA-Z0-9]+$/.test(url.pathname);
      
      // Only serve index.html for routes without file extensions (actual routes)
      // Don't serve index.html for missing assets like .js, .css, .png, etc.
      if (!hasFileExtension) {
        const indexUrl = new URL(url);
        indexUrl.pathname = '/index.html';
        const indexRequest = new Request(indexUrl.toString(), c.req.raw);
        const indexResponse = await c.env.ASSETS.fetch(indexRequest);
        
        if (indexResponse.status === 200) {
          // Clone the response and add appropriate headers
          return new Response(indexResponse.body, {
            status: 200,
            statusText: 'OK',
            headers: {
              'content-type': 'text/html;charset=UTF-8',
              'cache-control': 'no-cache',
              // Add security headers for HTML
              'x-content-type-options': 'nosniff',
              'x-frame-options': 'DENY',
            },
          });
        }
      }
      
      // For files with extensions that don't exist, return a proper 404
      return c.text('Not Found', 404);
    }
    
    // Add cache headers and correct content types for static assets
    if (response.status === 200) {
      const hasFileExtension = /\.[a-zA-Z0-9]+$/.test(url.pathname);
      if (hasFileExtension) {
        // Clone response and add cache headers for static assets
        const headers = new Headers(response.headers);
        
        // Set correct Content-Type for XML files (sitemaps)
        if (url.pathname.endsWith('.xml')) {
          headers.set('content-type', 'application/xml;charset=UTF-8');
        }
        
        // Cache static assets
        if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i)) {
          // Cache static assets for 1 day
          headers.set('cache-control', 'public, max-age=86400');
        } else if (url.pathname.endsWith('.xml')) {
          // Cache XML files (sitemaps) for 1 hour
          headers.set('cache-control', 'public, max-age=3600');
        } else {
          // Default cache for other files
          headers.set('cache-control', 'public, max-age=3600');
        }
        
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
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
