import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { QuizListPage } from '../pages/QuizListPage';
import { QuizPage } from '../pages/QuizPage';
import { ResultPage } from '../pages/ResultPage';

test.describe('Error Boundary Tests', () => {
  test('should handle component errors gracefully', async ({ page }) => {
    // Inject error into React component
    await page.addInitScript(() => {
      const originalError = console.error;
      window.console.error = (...args) => {
        // Suppress expected error boundary logs
        if (args[0]?.includes?.('Error boundary')) return;
        originalError(...args);
      };
    });

    await page.goto('/');
    
    // Force an error in a component
    await page.evaluate(() => {
      const errorEvent = new ErrorEvent('error', {
        error: new Error('Test component error'),
        message: 'Test component error'
      });
      window.dispatchEvent(errorEvent);
    });

    // Should show error boundary UI instead of blank page
    await expect(page.locator('text=Something went wrong')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has-text("Try again")')).toBeVisible();
  });

  test('should recover from errors when retry is clicked', async ({ page }) => {
    const homePage = new HomePage(page);
    
    // Navigate to page with forced error
    await page.route('**/api/quizzes', async route => {
      await route.abort('failed');
    });

    await page.goto('/quizzes');
    
    // Should show error UI
    await expect(page.locator('text=Something went wrong')).toBeVisible({ timeout: 5000 });
    
    // Fix the error and retry
    await page.unroute('**/api/quizzes');
    await page.route('**/api/quizzes', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, title: 'Test Quiz', description: 'Test', questionCount: 5 }
        ])
      });
    });

    await page.locator('button:has-text("Try again")').click();
    
    // Should recover and show quizzes
    await expect(page.locator('[class*="quiz-card"]')).toBeVisible({ timeout: 5000 });
  });

  test('should handle async errors in quiz flow', async ({ page }) => {
    // Start normal quiz flow
    await page.goto('/quizzes/1');
    
    // Mock API error during quiz
    await page.route('**/api/quizzes/1', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    // Should show error state
    await expect(page.locator('text=Failed to load quiz')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has-text("Try Again")')).toBeVisible();
  });

  test('should handle network timeouts gracefully', async ({ page, context }) => {
    // Set offline mode to simulate network issues
    await context.setOffline(true);
    
    await page.goto('/quizzes', { waitUntil: 'domcontentloaded' });
    
    // Should show network error message
    await expect(page.locator('text=/network|offline|connection/i')).toBeVisible({ timeout: 10000 });
    
    // Go back online and retry
    await context.setOffline(false);
    const retryButton = page.locator('button:has-text("Try Again"), button:has-text("Retry")');
    
    if (await retryButton.isVisible()) {
      await retryButton.click();
      // Should eventually load content
      await expect(page.locator('[class*="quiz-card"]')).toBeVisible({ timeout: 10000 });
    }
  });

  test('should log errors to console in development', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Cause an intentional error
    await page.goto('/');
    await page.evaluate(() => {
      throw new Error('Test error for logging');
    });

    // In development, errors should be logged
    // Note: This behavior might differ in production
    expect(errors.some(e => e.includes('Test error'))).toBe(true);
  });

  test('should not expose sensitive information in error messages', async ({ page }) => {
    // Mock various API errors
    await page.route('**/api/**', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Database connection failed at postgresql://user:password@localhost:5432/db',
          stack: 'Error: Connection failed\n    at Connection.connect...',
          details: {
            host: 'localhost',
            port: 5432,
            database: 'personality_spark'
          }
        })
      });
    });

    await page.goto('/quizzes');
    
    // Wait for error message
    await page.waitForTimeout(2000);
    
    // Check that sensitive information is not displayed
    const pageContent = await page.content();
    expect(pageContent).not.toContain('postgresql://');
    expect(pageContent).not.toContain('password');
    expect(pageContent).not.toContain('Connection.connect');
    expect(pageContent).not.toContain('localhost:5432');
    
    // Should show generic error message
    await expect(page.locator('text=/something went wrong|error occurred|try again/i')).toBeVisible();
  });
});