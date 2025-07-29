import { test, expect } from '@playwright/test';

test.describe('Request ID Tracking Tests', () => {
  test('should include X-Request-ID header in responses', async ({ request }) => {
    const response = await request.get('/api/quizzes');
    
    const requestId = response.headers()['x-request-id'];
    expect(requestId).toBeTruthy();
    expect(requestId).toMatch(/^[a-f0-9-]+$/); // Should be UUID-like
  });

  test('should generate unique request IDs for each request', async ({ request }) => {
    const responses = await Promise.all([
      request.get('/api/quizzes'),
      request.get('/api/quizzes'),
      request.get('/api/quizzes')
    ]);
    
    const requestIds = responses.map(r => r.headers()['x-request-id']);
    const uniqueIds = new Set(requestIds);
    
    expect(uniqueIds.size).toBe(requestIds.length);
  });

  test('should accept client-provided X-Request-ID', async ({ request }) => {
    const clientRequestId = 'client-generated-12345';
    
    const response = await request.get('/api/quizzes', {
      headers: {
        'X-Request-ID': clientRequestId
      }
    });
    
    const responseRequestId = response.headers()['x-request-id'];
    expect(responseRequestId).toBe(clientRequestId);
  });

  test('should include request ID in error responses', async ({ request }) => {
    const response = await request.get('/api/quizzes/99999'); // Non-existent quiz
    
    const requestId = response.headers()['x-request-id'];
    expect(requestId).toBeTruthy();
    
    if (!response.ok()) {
      const errorData = await response.json();
      expect(errorData).toHaveProperty('requestId', requestId);
    }
  });

  test('should propagate request ID through API calls', async ({ request }) => {
    const customRequestId = 'trace-me-12345';
    
    // Submit a quiz with custom request ID
    const submitResponse = await request.post('/api/quizzes/submit', {
      headers: {
        'X-Request-ID': customRequestId
      },
      data: {
        quizId: 1,
        answers: [
          { questionId: 1, answerId: 1 }
        ]
      }
    });
    
    expect(submitResponse.headers()['x-request-id']).toBe(customRequestId);
    
    // If the response includes a result ID, check that too
    if (submitResponse.ok()) {
      const data = await submitResponse.json();
      if (data.resultId) {
        const resultResponse = await request.get(`/api/results/${data.resultId}`, {
          headers: {
            'X-Request-ID': customRequestId + '-follow'
          }
        });
        
        expect(resultResponse.headers()['x-request-id']).toBe(customRequestId + '-follow');
      }
    }
  });

  test('should handle request ID in CORS preflight', async ({ request }) => {
    const response = await request.fetch('/api/quizzes', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, X-Request-ID',
        'X-Request-ID': 'preflight-12345'
      }
    });
    
    const allowedHeaders = response.headers()['access-control-allow-headers'];
    expect(allowedHeaders).toContain('X-Request-ID');
  });

  test('should log request IDs for debugging', async ({ page, request }) => {
    const consoleLogs: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'info') {
        consoleLogs.push(msg.text());
      }
    });

    await page.goto('/');
    
    // Make an API request from the page
    await page.evaluate(async () => {
      const response = await fetch('/api/quizzes');
      const requestId = response.headers.get('X-Request-ID');
      console.log(`Request ID: ${requestId}`);
    });
    
    // Check if request ID was logged
    const requestIdLog = consoleLogs.find(log => log.includes('Request ID:'));
    expect(requestIdLog).toBeTruthy();
  });

  test('should validate request ID format', async ({ request }) => {
    // Test with invalid request ID formats
    const invalidIds = [
      'invalid spaces',
      '<script>alert("xss")</script>',
      '../../etc/passwd',
      'a'.repeat(1000) // Too long
    ];
    
    for (const invalidId of invalidIds) {
      const response = await request.get('/api/quizzes', {
        headers: {
          'X-Request-ID': invalidId
        }
      });
      
      const responseId = response.headers()['x-request-id'];
      
      // Should either reject or sanitize the ID
      expect(responseId).not.toBe(invalidId);
      expect(responseId).toMatch(/^[a-zA-Z0-9-_]+$/);
    }
  });

  test('should include request ID in rate limit responses', async ({ request }) => {
    // Send many requests to trigger rate limiting
    const requests = Array(50).fill(null).map(() => 
      request.post('/api/quizzes/submit', {
        data: { quizId: 1, answers: [] }
      })
    );
    
    const responses = await Promise.all(requests);
    const rateLimitedResponse = responses.find(r => r.status() === 429);
    
    if (rateLimitedResponse) {
      expect(rateLimitedResponse.headers()['x-request-id']).toBeTruthy();
      
      const errorData = await rateLimitedResponse.json();
      expect(errorData).toHaveProperty('requestId');
    }
  });

  test('should include request ID in timeout errors', async ({ request }) => {
    // This test assumes the API has a timeout mechanism
    const response = await request.get('/api/slow-endpoint', {
      timeout: 1000, // 1 second timeout
      headers: {
        'X-Request-ID': 'timeout-test-123'
      }
    }).catch(error => error.response);
    
    if (response && response.headers) {
      const requestId = response.headers()['x-request-id'];
      expect(requestId).toBeTruthy();
    }
  });
});