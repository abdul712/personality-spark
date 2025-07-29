import { test, expect } from '@playwright/test';

test.describe('CORS Security Tests', () => {
  test('should reject requests from unauthorized origins', async ({ request }) => {
    // Test API endpoint with unauthorized origin
    const response = await request.get('/api/quizzes', {
      headers: {
        'Origin': 'https://malicious-site.com'
      }
    });

    // Should either block the request or not include CORS headers
    const corsHeader = response.headers()['access-control-allow-origin'];
    expect(corsHeader).not.toBe('https://malicious-site.com');
    expect(corsHeader).not.toBe('*');
  });

  test('should allow requests from authorized origins', async ({ request }) => {
    // Test API endpoint with authorized origin
    const response = await request.get('/api/quizzes', {
      headers: {
        'Origin': 'http://localhost:3000'
      }
    });

    expect(response.ok()).toBeTruthy();
  });

  test('should handle preflight requests properly', async ({ request }) => {
    const response = await request.fetch('/api/quizzes', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });

    expect(response.headers()['access-control-allow-methods']).toContain('POST');
    expect(response.headers()['access-control-allow-headers']).toContain('Content-Type');
  });

  test('should not expose sensitive headers', async ({ request }) => {
    const response = await request.get('/api/quizzes');
    
    // Check that sensitive headers are not exposed
    expect(response.headers()['x-powered-by']).toBeUndefined();
    expect(response.headers()['server']).not.toMatch(/nginx\/[\d.]+/); // Should not expose version
  });
});