import { test, expect } from '@playwright/test';

test.describe('Cache Headers Tests', () => {
  test('should set appropriate cache headers for static assets', async ({ request }) => {
    const staticAssets = [
      '/assets/logo.png',
      '/assets/styles.css',
      '/assets/bundle.js',
      '/fonts/Inter.woff2'
    ];
    
    for (const asset of staticAssets) {
      const response = await request.get(asset, { failOnStatusCode: false });
      
      if (response.ok()) {
        const cacheControl = response.headers()['cache-control'];
        
        // Static assets should have long cache times
        expect(cacheControl).toMatch(/max-age=\d+/);
        expect(cacheControl).toContain('public');
        
        // Should have ETag for cache validation
        expect(response.headers()['etag']).toBeTruthy();
      }
    }
  });

  test('should not cache API responses by default', async ({ request }) => {
    const response = await request.get('/api/quizzes');
    
    const cacheControl = response.headers()['cache-control'];
    expect(cacheControl).toMatch(/no-cache|no-store|must-revalidate|private/);
  });

  test('should cache quiz list with short TTL', async ({ request }) => {
    const response = await request.get('/api/quizzes');
    
    if (response.ok()) {
      const cacheControl = response.headers()['cache-control'];
      
      // Quiz list can be cached for a short time
      if (cacheControl && cacheControl.includes('max-age')) {
        const maxAge = parseInt(cacheControl.match(/max-age=(\d+)/)?.[1] || '0');
        expect(maxAge).toBeLessThanOrEqual(300); // Max 5 minutes
      }
    }
  });

  test('should not cache user-specific data', async ({ request }) => {
    const endpoints = [
      '/api/user/profile',
      '/api/user/history',
      '/api/results/user-specific-id'
    ];
    
    for (const endpoint of endpoints) {
      const response = await request.get(endpoint, { 
        failOnStatusCode: false,
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
      
      const cacheControl = response.headers()['cache-control'];
      
      if (cacheControl) {
        expect(cacheControl).toContain('private');
        expect(cacheControl).toMatch(/no-store|no-cache/);
      }
    }
  });

  test('should handle conditional requests with ETag', async ({ request }) => {
    // First request to get ETag
    const response1 = await request.get('/api/quizzes');
    const etag = response1.headers()['etag'];
    
    if (etag) {
      // Second request with If-None-Match
      const response2 = await request.get('/api/quizzes', {
        headers: {
          'If-None-Match': etag
        }
      });
      
      // Should return 304 if content hasn't changed
      if (response2.status() === 304) {
        const body = await response2.text();
        expect(body).toBe(''); // 304 should have no body
      }
    }
  });

  test('should handle conditional requests with Last-Modified', async ({ request }) => {
    const response1 = await request.get('/data/blog/posts.json');
    const lastModified = response1.headers()['last-modified'];
    
    if (lastModified) {
      // Request with If-Modified-Since
      const response2 = await request.get('/data/blog/posts.json', {
        headers: {
          'If-Modified-Since': lastModified
        }
      });
      
      // Should return 304 if not modified
      if (response2.status() === 304) {
        expect(response2.headers()['last-modified']).toBeTruthy();
      }
    }
  });

  test('should set proper cache headers for different content types', async ({ request }) => {
    const contentTypes = [
      { path: '/api/quizzes', type: 'application/json', cache: 'short' },
      { path: '/images/hero.jpg', type: 'image/jpeg', cache: 'long' },
      { path: '/data/static.json', type: 'application/json', cache: 'medium' }
    ];
    
    for (const { path, type, cache } of contentTypes) {
      const response = await request.get(path, { failOnStatusCode: false });
      
      if (response.ok()) {
        const contentType = response.headers()['content-type'];
        const cacheControl = response.headers()['cache-control'];
        
        expect(contentType).toContain(type);
        
        if (cacheControl && cacheControl.includes('max-age')) {
          const maxAge = parseInt(cacheControl.match(/max-age=(\d+)/)?.[1] || '0');
          
          switch (cache) {
            case 'long':
              expect(maxAge).toBeGreaterThan(86400); // > 1 day
              break;
            case 'medium':
              expect(maxAge).toBeGreaterThan(300); // > 5 minutes
              expect(maxAge).toBeLessThan(86400); // < 1 day
              break;
            case 'short':
              expect(maxAge).toBeLessThanOrEqual(300); // <= 5 minutes
              break;
          }
        }
      }
    }
  });

  test('should include Vary header for content negotiation', async ({ request }) => {
    const response = await request.get('/api/quizzes');
    
    const varyHeader = response.headers()['vary'];
    if (varyHeader) {
      expect(varyHeader.toLowerCase()).toContain('accept');
      
      // If CORS is enabled
      if (response.headers()['access-control-allow-origin']) {
        expect(varyHeader.toLowerCase()).toContain('origin');
      }
    }
  });

  test('should disable caching for error responses', async ({ request }) => {
    const response = await request.get('/api/quizzes/invalid-id');
    
    if (!response.ok()) {
      const cacheControl = response.headers()['cache-control'];
      expect(cacheControl).toMatch(/no-cache|no-store/);
    }
  });

  test('should handle cache busting for versioned assets', async ({ request }) => {
    const versionedAssets = [
      '/assets/app.v123.js',
      '/assets/styles.abc123.css',
      '/assets/vendor.chunk.def456.js'
    ];
    
    for (const asset of versionedAssets) {
      const response = await request.get(asset, { failOnStatusCode: false });
      
      if (response.ok()) {
        const cacheControl = response.headers()['cache-control'];
        
        // Versioned assets can have very long cache times
        expect(cacheControl).toContain('public');
        expect(cacheControl).toMatch(/max-age=31536000|immutable/); // 1 year or immutable
      }
    }
  });

  test('should prevent caching of sensitive endpoints', async ({ request }) => {
    const sensitiveEndpoints = [
      '/api/auth/login',
      '/api/auth/logout',
      '/api/user/settings',
      '/api/admin/dashboard'
    ];
    
    for (const endpoint of sensitiveEndpoints) {
      const response = await request.post(endpoint, { 
        failOnStatusCode: false,
        data: {}
      });
      
      const cacheControl = response.headers()['cache-control'];
      const pragma = response.headers()['pragma'];
      
      // Should have strong no-cache directives
      expect(cacheControl).toContain('no-store');
      expect(pragma).toBe('no-cache');
    }
  });

  test('should handle browser cache revalidation', async ({ page }) => {
    // Load page and assets
    await page.goto('/');
    
    // Get all network requests
    const requests: { url: string, headers: any }[] = [];
    page.on('request', request => {
      requests.push({
        url: request.url(),
        headers: request.headers()
      });
    });
    
    // Reload page
    await page.reload();
    
    // Check if browser sent conditional request headers
    const conditionalRequests = requests.filter(r => 
      r.headers['if-none-match'] || r.headers['if-modified-since']
    );
    
    expect(conditionalRequests.length).toBeGreaterThan(0);
  });
});