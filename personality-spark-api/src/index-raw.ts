// Absolutely minimal worker without any framework
export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    // Log to see if this is being called
    console.log('Raw worker called for:', request.url);
    
    const url = new URL(request.url);
    
    // Test various endpoints
    if (url.pathname === '/raw-test') {
      return new Response('Raw test response - no compression', {
        headers: {
          'Content-Type': 'text/plain',
          'X-Test': 'raw-worker',
        },
      });
    }
    
    if (url.pathname === '/raw-json') {
      return new Response(JSON.stringify({ message: 'Raw JSON response', test: true }), {
        headers: {
          'Content-Type': 'application/json',
          'X-Test': 'raw-worker-json',
        },
      });
    }
    
    // Return 404 for everything else
    return new Response('Not found from raw worker', { 
      status: 404,
      headers: {
        'Content-Type': 'text/plain',
        'X-Test': 'raw-worker-404',
      },
    });
  },
};

// Export RateLimiter to satisfy the Durable Object binding
export { RateLimiter } from './middleware/rateLimit';