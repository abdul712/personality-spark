import { test, expect } from '@playwright/test';

test.describe('Input Validation Tests', () => {
  test('should reject invalid quiz submission data', async ({ request }) => {
    // Test with missing required fields
    const response1 = await request.post('/api/quizzes/submit', {
      data: {
        quizId: 1
        // Missing answers
      }
    });
    expect(response1.status()).toBe(400);

    // Test with invalid data types
    const response2 = await request.post('/api/quizzes/submit', {
      data: {
        quizId: 'not-a-number',
        answers: 'not-an-array'
      }
    });
    expect(response2.status()).toBe(400);

    // Test with malformed data
    const response3 = await request.post('/api/quizzes/submit', {
      data: {
        quizId: -1,
        answers: [{}, {}, {}] // Invalid answer format
      }
    });
    expect(response3.status()).toBe(400);
  });

  test('should validate quiz ID parameters', async ({ request }) => {
    // Test with non-numeric quiz ID
    const response1 = await request.get('/api/quizzes/abc');
    expect([400, 404]).toContain(response1.status());

    // Test with SQL injection attempt
    const response2 = await request.get('/api/quizzes/1; DROP TABLE quizzes;--');
    expect([400, 404]).toContain(response2.status());

    // Test with extremely large number
    const response3 = await request.get('/api/quizzes/999999999999999999999');
    expect([400, 404]).toContain(response3.status());
  });

  test('should validate result ID format', async ({ request }) => {
    // Test with invalid UUID format
    const response1 = await request.get('/api/results/not-a-uuid');
    expect([400, 404]).toContain(response1.status());

    // Test with SQL injection in UUID
    const response2 = await request.get("/api/results/'; DROP TABLE results;--");
    expect([400, 404]).toContain(response2.status());
  });

  test('should validate share functionality inputs', async ({ request }) => {
    // Test with missing result ID
    const response1 = await request.post('/api/share', {
      data: {}
    });
    expect(response1.status()).toBe(400);

    // Test with invalid share data
    const response2 = await request.post('/api/share', {
      data: {
        resultId: '<script>alert("xss")</script>',
        platform: 'invalid-platform'
      }
    });
    expect(response2.status()).toBe(400);
  });

  test('should limit input length', async ({ page }) => {
    await page.goto('/quizzes/1');
    
    // Find any text inputs
    const inputs = await page.locator('input[type="text"], textarea').all();
    
    for (const input of inputs) {
      const maxLength = await input.getAttribute('maxlength');
      
      if (maxLength) {
        // Try to input more than allowed
        const longText = 'a'.repeat(parseInt(maxLength) + 100);
        await input.fill(longText);
        
        const actualValue = await input.inputValue();
        expect(actualValue.length).toBeLessThanOrEqual(parseInt(maxLength));
      }
    }
  });

  test('should validate email format if email input exists', async ({ page }) => {
    await page.goto('/');
    
    const emailInputs = await page.locator('input[type="email"]').all();
    
    for (const input of emailInputs) {
      // Test invalid email formats
      const invalidEmails = [
        'notanemail',
        '@invalid.com',
        'test@',
        'test..email@domain.com',
        'test email@domain.com'
      ];
      
      for (const invalidEmail of invalidEmails) {
        await input.fill(invalidEmail);
        await input.blur();
        
        // Check for validation error
        const isValid = await input.evaluate((el: HTMLInputElement) => el.checkValidity());
        expect(isValid).toBe(false);
      }
      
      // Test valid email
      await input.fill('test@example.com');
      await input.blur();
      const isValid = await input.evaluate((el: HTMLInputElement) => el.checkValidity());
      expect(isValid).toBe(true);
    }
  });

  test('should prevent path traversal attacks', async ({ request }) => {
    // Test various path traversal attempts
    const pathTraversalAttempts = [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\config\\sam',
      '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
      '....//....//....//etc/passwd'
    ];

    for (const attempt of pathTraversalAttempts) {
      const response = await request.get(`/api/files/${attempt}`);
      expect([400, 403, 404]).toContain(response.status());
      
      // Ensure no sensitive data is returned
      const text = await response.text();
      expect(text).not.toContain('root:');
      expect(text).not.toContain('Administrator:');
    }
  });
});