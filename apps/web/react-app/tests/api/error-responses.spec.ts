import { test, expect } from '@playwright/test';

test.describe('API Error Response Tests', () => {
  test('should return structured error for 404', async ({ request }) => {
    const response = await request.get('/api/quizzes/99999');
    
    expect(response.status()).toBe(404);
    
    const errorData = await response.json();
    expect(errorData).toHaveProperty('error');
    expect(errorData).toHaveProperty('message');
    expect(errorData).toHaveProperty('requestId');
    expect(errorData).toHaveProperty('timestamp');
    expect(errorData).not.toHaveProperty('stack'); // Should not expose stack traces
  });

  test('should return proper error for invalid request body', async ({ request }) => {
    const response = await request.post('/api/quizzes/submit', {
      data: 'invalid json string',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    expect(response.status()).toBe(400);
    
    const errorData = await response.json();
    expect(errorData.error).toContain('Bad Request');
    expect(errorData.message).toBeTruthy();
  });

  test('should handle validation errors with details', async ({ request }) => {
    const response = await request.post('/api/quizzes/submit', {
      data: {
        quizId: 'not-a-number',
        answers: 'not-an-array'
      }
    });
    
    expect(response.status()).toBe(400);
    
    const errorData = await response.json();
    expect(errorData).toHaveProperty('error');
    expect(errorData).toHaveProperty('details');
    
    // Should provide field-level validation errors
    if (errorData.details) {
      expect(Array.isArray(errorData.details) || typeof errorData.details === 'object').toBe(true);
    }
  });

  test('should not expose internal errors in production', async ({ request }) => {
    // Force an internal error by sending malformed data
    const response = await request.post('/api/internal-error-test', {
      data: { trigger: 'error' }
    }).catch(e => e.response);
    
    if (response && response.status() === 500) {
      const errorData = await response.json();
      
      // Should not expose sensitive information
      expect(errorData).not.toHaveProperty('stack');
      expect(errorData).not.toHaveProperty('sql');
      expect(errorData).not.toHaveProperty('query');
      expect(JSON.stringify(errorData)).not.toContain('password');
      expect(JSON.stringify(errorData)).not.toContain('secret');
      
      // Should have generic error message
      expect(errorData.error).toBe('Internal Server Error');
      expect(errorData.message).toBeTruthy();
    }
  });

  test('should handle method not allowed errors', async ({ request }) => {
    // Try to use wrong HTTP method
    const response = await request.delete('/api/quizzes');
    
    expect(response.status()).toBe(405);
    
    const errorData = await response.json();
    expect(errorData.error).toContain('Method Not Allowed');
    
    // Should include Allow header
    const allowHeader = response.headers()['allow'];
    expect(allowHeader).toBeTruthy();
    expect(allowHeader).toContain('GET');
  });

  test('should provide consistent error format across endpoints', async ({ request }) => {
    const errorResponses = await Promise.all([
      request.get('/api/quizzes/invalid'),
      request.post('/api/quizzes/submit', { data: {} }),
      request.get('/api/results/invalid-uuid'),
      request.post('/api/share', { data: {} })
    ]);
    
    for (const response of errorResponses) {
      if (!response.ok()) {
        const errorData = await response.json();
        
        // All errors should have consistent structure
        expect(errorData).toHaveProperty('error');
        expect(errorData).toHaveProperty('message');
        expect(errorData).toHaveProperty('requestId');
        expect(errorData).toHaveProperty('timestamp');
        
        // Timestamp should be valid ISO date
        expect(new Date(errorData.timestamp).toISOString()).toBe(errorData.timestamp);
      }
    }
  });

  test('should handle content negotiation errors', async ({ request }) => {
    const response = await request.get('/api/quizzes', {
      headers: {
        'Accept': 'application/xml' // API only supports JSON
      }
    });
    
    // Should either return JSON anyway or return 406 Not Acceptable
    if (response.status() === 406) {
      const errorData = await response.json();
      expect(errorData.error).toContain('Not Acceptable');
      expect(errorData.message).toContain('JSON');
    } else {
      expect(response.headers()['content-type']).toContain('application/json');
    }
  });

  test('should include correlation ID in distributed errors', async ({ request }) => {
    const correlationId = 'test-correlation-123';
    
    const response = await request.get('/api/quizzes/error-test', {
      headers: {
        'X-Correlation-ID': correlationId
      }
    });
    
    if (!response.ok()) {
      const errorData = await response.json();
      
      // Should include correlation ID if provided
      if (errorData.correlationId) {
        expect(errorData.correlationId).toBe(correlationId);
      }
    }
  });

  test('should handle timeout errors appropriately', async ({ request }) => {
    // Create a request that will timeout
    const responsePromise = request.get('/api/slow-endpoint', {
      timeout: 100 // 100ms timeout
    });
    
    try {
      await responsePromise;
    } catch (error) {
      expect(error.message).toContain('timeout');
    }
  });

  test('should sanitize error messages from user input', async ({ request }) => {
    const maliciousInput = '<script>alert("XSS")</script>';
    
    const response = await request.post('/api/quizzes/submit', {
      data: {
        quizId: maliciousInput,
        answers: []
      }
    });
    
    expect(response.status()).toBe(400);
    
    const errorData = await response.json();
    const errorString = JSON.stringify(errorData);
    
    // Error message should not contain unescaped script tags
    expect(errorString).not.toContain('<script>');
    expect(errorString).not.toContain('</script>');
  });

  test('should provide helpful validation messages', async ({ request }) => {
    const response = await request.post('/api/quizzes/submit', {
      data: {
        quizId: 1,
        answers: [
          { questionId: 1 }, // Missing answerId
          { answerId: 2 }, // Missing questionId
          { questionId: 3, answerId: 'invalid' } // Invalid type
        ]
      }
    });
    
    expect(response.status()).toBe(400);
    
    const errorData = await response.json();
    expect(errorData.message).toBeTruthy();
    
    // Should provide actionable error messages
    if (errorData.details) {
      const details = Array.isArray(errorData.details) ? errorData.details : [errorData.details];
      details.forEach(detail => {
        expect(detail).toBeTruthy();
        expect(typeof detail === 'string' || typeof detail === 'object').toBe(true);
      });
    }
  });
});