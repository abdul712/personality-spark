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

// Import logger
import { logger as structuredLogger, Logger } from './utils/logger';

const app = new Hono<Context>();

// Request ID middleware
app.use('*', async (c, next) => {
  // Generate unique request ID
  const requestId = crypto.randomUUID ? crypto.randomUUID() : 
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Store in context for use throughout the request
  c.set('requestId', requestId);
  
  // Add to response headers
  c.header('X-Request-ID', requestId);
  
  await next();
});

// Structured logging middleware
app.use('*', async (c, next) => {
  const start = Date.now();
  const logContext = Logger.createContext(c);
  
  // Log request
  structuredLogger.info('Request received', logContext);
  
  await next();
  
  const duration = Date.now() - start;
  const status = c.res.status;
  
  // Log response
  const responseContext = {
    ...logContext,
    statusCode: status,
    duration,
  };
  
  if (status >= 400) {
    structuredLogger.warn('Request failed', responseContext);
  } else {
    structuredLogger.info('Request completed', responseContext);
  }
});

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
const ALLOWED_ORIGINS = [
  'https://personalityspark.com',
  'https://www.personalityspark.com',
  // Development origins - exact match only
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8080'
];

app.use('*', cors({
  origin: (origin) => {
    // Allow requests with no origin (e.g., mobile apps, Postman)
    if (!origin) return null;
    
    // Check against whitelist with exact matching
    if (ALLOWED_ORIGINS.includes(origin)) {
      return origin;
    }
    
    // Reject all other origins
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
app.get('/health', async (c) => {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT || 'production',
    requestId: c.get('requestId'),
    checks: {
      api: 'healthy',
      database: 'unknown',
      cache: 'unknown',
      rateLimiter: 'unknown',
    },
    version: '1.0.0',
  };

  // Check database connectivity (if DATABASE binding exists)
  if (c.env.DATABASE) {
    try {
      // Simple query to check database connection
      await c.env.DATABASE.prepare('SELECT 1').first();
      checks.checks.database = 'healthy';
    } catch (error) {
      checks.checks.database = 'unhealthy';
      checks.status = 'degraded';
    }
  } else {
    checks.checks.database = 'not_configured';
  }

  // Check cache availability (KV store)
  if (c.env.KV_CACHE) {
    try {
      // Try to read a test key
      await c.env.KV_CACHE.get('health_check_test');
      checks.checks.cache = 'healthy';
    } catch (error) {
      checks.checks.cache = 'unhealthy';
      checks.status = 'degraded';
    }
  } else {
    checks.checks.cache = 'not_configured';
  }

  // Check rate limiter
  if (c.env.RATE_LIMITER) {
    try {
      // Create a test rate limiter instance
      const testId = c.env.RATE_LIMITER.idFromName('health_check_test');
      const testStub = c.env.RATE_LIMITER.get(testId);
      
      // Make a test request
      const response = await testStub.fetch(
        new Request('http://rate-limiter', {
          method: 'POST',
          body: JSON.stringify({ key: 'health_check', limit: 1, window: 1000 }),
        })
      );
      
      if (response.ok) {
        checks.checks.rateLimiter = 'healthy';
      } else {
        checks.checks.rateLimiter = 'unhealthy';
        checks.status = 'degraded';
      }
    } catch (error) {
      checks.checks.rateLimiter = 'unhealthy';
      checks.status = 'degraded';
    }
  } else {
    checks.checks.rateLimiter = 'not_configured';
  }

  // Return appropriate status code
  const statusCode = checks.status === 'healthy' ? 200 : 503;
  
  return c.json(checks, statusCode);
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
          'cache-control': 'public, max-age=3600, must-revalidate', // Cache for 1 hour
          'x-robots-tag': 'noindex', // Sitemaps shouldn't be indexed themselves
          'x-request-id': c.get('requestId'),
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
        
        // Determine cache strategy based on file type
        const isHashedAsset = /\.[0-9a-f]{8,}\.(js|css)$/i.test(url.pathname) || 
                            /-[0-9a-f]{8,}\.(js|css)$/i.test(url.pathname);
        
        if (isHashedAsset) {
          // Immutable cache for hashed assets (fingerprinted files)
          headers.set('cache-control', 'public, max-age=31536000, immutable');
        } else if (url.pathname.match(/\.(js|css)$/i)) {
          // Non-hashed JS/CSS files - cache for 1 hour
          headers.set('cache-control', 'public, max-age=3600, must-revalidate');
        } else if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|avif)$/i)) {
          // Images - cache for 7 days
          headers.set('cache-control', 'public, max-age=604800');
        } else if (url.pathname.match(/\.(woff|woff2|ttf|eot|otf)$/i)) {
          // Fonts - cache for 30 days
          headers.set('cache-control', 'public, max-age=2592000');
        } else if (url.pathname.endsWith('.xml')) {
          // XML files (sitemaps) - cache for 1 hour
          headers.set('cache-control', 'public, max-age=3600');
        } else if (url.pathname.endsWith('.json')) {
          // JSON files - cache for 5 minutes (API responses)
          headers.set('cache-control', 'public, max-age=300, must-revalidate');
        } else if (url.pathname.endsWith('.html')) {
          // HTML files - no cache
          headers.set('cache-control', 'no-cache, must-revalidate');
        } else {
          // Default cache for other files - 1 hour
          headers.set('cache-control', 'public, max-age=3600');
        }
        
        // Add CORS headers for font files
        if (url.pathname.match(/\.(woff|woff2|ttf|eot|otf)$/i)) {
          headers.set('access-control-allow-origin', '*');
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
