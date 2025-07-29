import { test, expect } from '@playwright/test';

test.describe('Health Check API Tests', () => {
  test('should have a working health check endpoint', async ({ request }) => {
    const response = await request.get('/health');
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('status', 'ok');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('version');
  });

  test('should return proper content type', async ({ request }) => {
    const response = await request.get('/health');
    
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
  });

  test('should be accessible without authentication', async ({ request }) => {
    const response = await request.get('/health', {
      headers: {
        // No auth headers
      }
    });
    
    expect(response.ok()).toBeTruthy();
  });

  test('should respond quickly', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get('/health');
    const endTime = Date.now();
    
    expect(response.ok()).toBeTruthy();
    expect(endTime - startTime).toBeLessThan(1000); // Should respond within 1 second
  });

  test('should include service dependencies status', async ({ request }) => {
    const response = await request.get('/health/detailed');
    
    if (response.ok()) {
      const data = await response.json();
      
      // Check for various service statuses
      if (data.services) {
        expect(data.services).toHaveProperty('database');
        expect(data.services).toHaveProperty('cache');
        expect(data.services).toHaveProperty('ai');
        
        // Each service should have a status
        Object.values(data.services).forEach(service => {
          expect(service).toHaveProperty('status');
          expect(['healthy', 'degraded', 'unhealthy']).toContain(service.status);
        });
      }
    }
  });

  test('should handle HEAD requests', async ({ request }) => {
    const response = await request.head('/health');
    
    expect(response.ok()).toBeTruthy();
    expect(response.headers()).toBeDefined();
    
    // HEAD request should not have a body
    const text = await response.text();
    expect(text).toBe('');
  });

  test('should include proper cache headers', async ({ request }) => {
    const response = await request.get('/health');
    
    const cacheControl = response.headers()['cache-control'];
    expect(cacheControl).toContain('no-cache');
    expect(cacheControl).toContain('no-store');
  });

  test('should handle concurrent health checks', async ({ request }) => {
    const requests = Array(10).fill(null).map(() => request.get('/health'));
    const responses = await Promise.all(requests);
    
    responses.forEach(response => {
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
    });
  });

  test('should return different timestamps for sequential calls', async ({ request }) => {
    const response1 = await request.get('/health');
    const data1 = await response1.json();
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const response2 = await request.get('/health');
    const data2 = await response2.json();
    
    expect(data1.timestamp).not.toBe(data2.timestamp);
  });

  test('should handle malformed requests gracefully', async ({ request }) => {
    // Send request with malformed headers
    const response = await request.get('/health', {
      headers: {
        'Content-Type': 'invalid/type;;;',
        'Accept': '*/*, invalid'
      }
    });
    
    // Should still return OK
    expect(response.ok()).toBeTruthy();
  });
});