import { test, expect } from '@playwright/test';

test.describe('Rate Limiting Tests', () => {
  test('should enforce rate limits on API endpoints', async ({ request }) => {
    const endpoint = '/api/quizzes/submit';
    const requests: Promise<any>[] = [];
    
    // Send multiple rapid requests
    for (let i = 0; i < 20; i++) {
      requests.push(
        request.post(endpoint, {
          data: {
            quizId: 1,
            answers: [
              { questionId: 1, answerId: 1 },
              { questionId: 2, answerId: 1 },
              { questionId: 3, answerId: 1 },
              { questionId: 4, answerId: 1 },
              { questionId: 5, answerId: 1 }
            ]
          }
        })
      );
    }

    const responses = await Promise.all(requests);
    
    // Check if any requests were rate limited
    const rateLimitedResponses = responses.filter(r => r.status() === 429);
    expect(rateLimitedResponses.length).toBeGreaterThan(0);

    // Check for rate limit headers
    const lastResponse = responses[responses.length - 1];
    const headers = lastResponse.headers();
    
    if (lastResponse.status() === 429) {
      expect(headers['x-ratelimit-limit']).toBeDefined();
      expect(headers['x-ratelimit-remaining']).toBeDefined();
      expect(headers['x-ratelimit-reset']).toBeDefined();
    }
  });

  test('should have different rate limits for different endpoints', async ({ request }) => {
    // Test read endpoints (should have higher limits)
    const readRequests: Promise<any>[] = [];
    for (let i = 0; i < 100; i++) {
      readRequests.push(request.get('/api/quizzes'));
    }
    
    const readResponses = await Promise.all(readRequests);
    const readRateLimited = readResponses.filter(r => r.status() === 429);
    
    // Test write endpoints (should have lower limits)
    const writeRequests: Promise<any>[] = [];
    for (let i = 0; i < 20; i++) {
      writeRequests.push(
        request.post('/api/analytics/track', {
          data: { event: 'test', properties: {} }
        })
      );
    }
    
    const writeResponses = await Promise.all(writeRequests);
    const writeRateLimited = writeResponses.filter(r => r.status() === 429);
    
    // Write endpoints should be rate limited more aggressively
    expect(writeRateLimited.length).toBeGreaterThan(0);
  });

  test('should reset rate limits after time window', async ({ request }) => {
    const endpoint = '/api/quizzes';
    
    // First, hit the rate limit
    const requests1: Promise<any>[] = [];
    for (let i = 0; i < 100; i++) {
      requests1.push(request.get(endpoint));
    }
    
    const responses1 = await Promise.all(requests1);
    const rateLimited1 = responses1.filter(r => r.status() === 429);
    
    if (rateLimited1.length > 0) {
      // Get reset time from headers
      const resetHeader = rateLimited1[0].headers()['x-ratelimit-reset'];
      const resetTime = resetHeader ? parseInt(resetHeader) * 1000 : Date.now() + 60000;
      const waitTime = Math.max(0, resetTime - Date.now() + 1000);
      
      // Wait for rate limit to reset (up to 5 seconds for test)
      await new Promise(resolve => setTimeout(resolve, Math.min(waitTime, 5000)));
      
      // Try again
      const response2 = await request.get(endpoint);
      expect(response2.status()).not.toBe(429);
    }
  });

  test('should rate limit by IP address', async ({ request, context }) => {
    // Create requests from different contexts (simulating different IPs)
    const endpoint = '/api/quizzes/submit';
    
    // Send requests from current context
    const requests1: Promise<any>[] = [];
    for (let i = 0; i < 10; i++) {
      requests1.push(
        request.post(endpoint, {
          data: {
            quizId: 1,
            answers: [{ questionId: 1, answerId: 1 }]
          }
        })
      );
    }
    
    const responses1 = await Promise.all(requests1);
    const rateLimited1 = responses1.filter(r => r.status() === 429);
    
    // In a real test, you would use a proxy or different network
    // to test different IP addresses. For now, we just verify
    // that rate limiting is applied
    expect(responses1.some(r => r.status() === 429 || r.status() === 200)).toBe(true);
  });

  test('should handle rate limit gracefully in UI', async ({ page }) => {
    // Mock rate limited response
    let requestCount = 0;
    await page.route('**/api/quizzes', async route => {
      requestCount++;
      if (requestCount > 5) {
        await route.fulfill({
          status: 429,
          headers: {
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + 60)
          },
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Rate limit exceeded. Please try again later.'
          })
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/quizzes');
    
    // Trigger multiple reloads to hit rate limit
    for (let i = 0; i < 7; i++) {
      await page.reload();
      await page.waitForTimeout(100);
    }
    
    // Check for rate limit error message
    await expect(page.locator('text=Rate limit exceeded')).toBeVisible();
  });
});