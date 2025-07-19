export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname === '/test') {
      return new Response('Test OK', {
        headers: { 'Content-Type': 'text/plain' },
      });
    }
    
    return new Response('Not Found', { status: 404 });
  },
};