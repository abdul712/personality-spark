import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { QuizListPage } from '../pages/QuizListPage';
import { QuizPage } from '../pages/QuizPage';
import { ResultPage } from '../pages/ResultPage';
import { BlogPage } from '../pages/BlogPage';

test.describe('Error Recovery Flow Integration Tests', () => {
  test('should recover from API errors during quiz flow', async ({ page }) => {
    const quizListPage = new QuizListPage(page);
    const quizPage = new QuizPage(page);
    let apiCallCount = 0;
    
    // Mock intermittent API failures
    await page.route('**/api/quizzes/1', async route => {
      apiCallCount++;
      if (apiCallCount === 1) {
        // First call fails
        await route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal server error' })
        });
      } else {
        // Subsequent calls succeed
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 1,
            title: 'Recovery Test Quiz',
            questions: Array(5).fill(null).map((_, i) => ({
              id: i + 1,
              text: `Question ${i + 1}?`,
              options: [
                { id: 1, text: 'Option 1' },
                { id: 2, text: 'Option 2' }
              ]
            }))
          })
        });
      }
    });

    await page.goto('/quizzes/1');
    
    // Should show error
    await expect(quizPage.errorMessage).toBeVisible();
    
    // Retry should work
    const retryButton = page.locator('button:has-text("Try Again"), button:has-text("Retry")');
    await retryButton.click();
    
    // Quiz should load successfully
    await expect(quizPage.questionText).toBeVisible();
    
    // Complete quiz to verify full recovery
    await quizPage.completeQuiz();
    await expect(page).toHaveURL(/\/results\//);
  });

  test('should handle submission errors and allow retry', async ({ page }) => {
    const quizPage = new QuizPage(page);
    let submissionAttempts = 0;
    
    // Mock successful quiz load
    await page.route('**/api/quizzes/1', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          title: 'Test Quiz',
          questions: [
            {
              id: 1,
              text: 'Question 1?',
              options: [
                { id: 1, text: 'Yes' },
                { id: 2, text: 'No' }
              ]
            }
          ]
        })
      });
    });

    // Mock submission with failure then success
    await page.route('**/api/quizzes/submit', async route => {
      submissionAttempts++;
      if (submissionAttempts === 1) {
        await route.fulfill({
          status: 503,
          body: JSON.stringify({ error: 'Service temporarily unavailable' })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            resultId: 'test-result-123',
            redirectUrl: '/results/test-result-123'
          })
        });
      }
    });

    await page.goto('/quizzes/1');
    await quizPage.selectAnswer(0);
    await quizPage.submitButton.click();
    
    // Should show error
    await expect(page.locator('text=/error|failed|try again/i')).toBeVisible();
    
    // Retry submission
    const retryButton = page.locator('button:has-text("Try Again"), button:has-text("Retry")');
    if (await retryButton.isVisible()) {
      await retryButton.click();
    } else {
      // Or resubmit
      await quizPage.submitButton.click();
    }
    
    // Should succeed and redirect
    await expect(page).toHaveURL(/\/results\//);
  });

  test('should maintain application state during error recovery', async ({ page }) => {
    // Set some application state
    await page.goto('/');
    
    // Set preferences
    await page.evaluate(() => {
      localStorage.setItem('userPreferences', JSON.stringify({
        theme: 'dark',
        fontSize: 'large',
        animations: true
      }));
    });

    // Navigate to quiz with error
    await page.route('**/api/quizzes', async route => {
      await route.abort('failed');
    });

    await page.goto('/quizzes');
    
    // Should show error
    await expect(page.locator('text=/error|failed/i')).toBeVisible();
    
    // Check that preferences are still maintained
    const preferences = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('userPreferences') || '{}');
    });
    
    expect(preferences).toMatchObject({
      theme: 'dark',
      fontSize: 'large',
      animations: true
    });
    
    // Fix error and continue
    await page.unroute('**/api/quizzes');
    await page.reload();
    
    // App should work with preferences intact
    const theme = await page.evaluate(() => {
      const prefs = JSON.parse(localStorage.getItem('userPreferences') || '{}');
      return prefs.theme;
    });
    expect(theme).toBe('dark');
  });

  test('should handle cascading errors gracefully', async ({ page }) => {
    let quizLoadFails = true;
    let resultLoadFails = true;
    
    // Mock multiple failing endpoints
    await page.route('**/api/quizzes/1', async route => {
      if (quizLoadFails) {
        await route.fulfill({ status: 500 });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 1,
            title: 'Test Quiz',
            questions: [{ id: 1, text: 'Q1?', options: [{ id: 1, text: 'A1' }] }]
          })
        });
      }
    });

    await page.route('**/api/results/*', async route => {
      if (resultLoadFails) {
        await route.fulfill({ status: 500 });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'test-123',
            personalityType: 'TEST',
            traits: {}
          })
        });
      }
    });

    // Try to load quiz
    await page.goto('/quizzes/1');
    await expect(page.locator('text=/error|failed/i')).toBeVisible();
    
    // Fix quiz endpoint and retry
    quizLoadFails = false;
    await page.reload();
    await expect(page.locator('text=Test Quiz')).toBeVisible();
    
    // Complete quiz (will fail on results)
    const quizPage = new QuizPage(page);
    await quizPage.selectAnswer(0);
    
    // Mock successful submission but failing results
    await page.route('**/api/quizzes/submit', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ resultId: 'test-123' })
      });
    });
    
    await quizPage.submitButton.click();
    
    // Results page should show error
    await expect(page.locator('text=/error|failed/i')).toBeVisible();
    
    // Fix results endpoint and retry
    resultLoadFails = false;
    await page.reload();
    
    // Should show results
    const resultPage = new ResultPage(page);
    await resultPage.waitForResults();
    expect(await resultPage.getPersonalityType()).toBe('TEST');
  });

  test('should handle authentication errors during flow', async ({ page }) => {
    // Mock auth error on protected endpoint
    await page.route('**/api/user/profile', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Unauthorized',
          message: 'Please log in to continue'
        })
      });
    });

    // Start quiz flow
    const quizPage = new QuizPage(page);
    await page.goto('/quizzes/1');
    await quizPage.completeQuiz();
    
    // If the app tries to save to profile (authenticated feature)
    const profileButton = page.locator('button:has-text("Save to Profile")');
    if (await profileButton.isVisible()) {
      await profileButton.click();
      
      // Should handle auth error gracefully
      await expect(page.locator('text=/log in|sign in|unauthorized/i')).toBeVisible();
      
      // User should still be able to view results
      const resultPage = new ResultPage(page);
      await expect(resultPage.personalityType).toBeVisible();
    }
  });

  test('should recover from browser storage errors', async ({ page }) => {
    // Override localStorage to simulate quota exceeded
    await page.addInitScript(() => {
      const originalSetItem = Storage.prototype.setItem;
      let failCount = 0;
      
      Storage.prototype.setItem = function(key, value) {
        failCount++;
        if (failCount <= 2 && key.includes('quiz')) {
          throw new Error('QuotaExceededError');
        }
        return originalSetItem.call(this, key, value);
      };
    });

    const quizPage = new QuizPage(page);
    await page.goto('/quizzes/1');
    
    // Complete quiz (storage errors might occur)
    await quizPage.completeQuiz();
    
    // Should still complete successfully
    await expect(page).toHaveURL(/\/results\//);
    
    // App should handle storage errors gracefully
    const errors = await page.evaluate(() => {
      return window.localStorage.getItem('errors');
    });
    
    // Should not have crashed the app
    const resultPage = new ResultPage(page);
    await expect(resultPage.personalityType).toBeVisible();
  });

  test('should handle mixed content and security errors', async ({ page, context }) => {
    // Test handling of blocked mixed content
    await page.route('**/*.jpg', async route => {
      if (route.request().url().startsWith('http://')) {
        // Simulate mixed content block
        await route.abort('blockedbyclient');
      } else {
        await route.continue();
      }
    });

    const blogPage = new BlogPage(page);
    await blogPage.goto();
    
    // Page should load despite blocked resources
    await expect(page.locator('h1, h2')).toBeVisible();
    
    // Check for fallback images or placeholders
    const images = await page.locator('img').all();
    for (const img of images) {
      const src = await img.getAttribute('src');
      if (src) {
        // Should not have http:// images
        expect(src).not.toMatch(/^http:\/\//);
      }
    }
  });

  test('should provide user-friendly error messages', async ({ page }) => {
    const errorScenarios = [
      { 
        url: '**/api/quizzes',
        status: 500,
        expectedMessage: /server error|something went wrong|try again later/i
      },
      {
        url: '**/api/quizzes',
        status: 503,
        expectedMessage: /maintenance|temporarily unavailable|back soon/i
      },
      {
        url: '**/api/quizzes',
        status: 404,
        expectedMessage: /not found|doesn't exist|check the URL/i
      },
      {
        url: '**/api/quizzes',
        status: 429,
        expectedMessage: /too many requests|slow down|rate limit/i
      }
    ];

    for (const scenario of errorScenarios) {
      await page.route(scenario.url, async route => {
        await route.fulfill({
          status: scenario.status,
          contentType: 'application/json',
          body: JSON.stringify({
            error: `HTTP ${scenario.status}`,
            message: 'Technical error message'
          })
        });
      });

      await page.goto('/quizzes');
      
      // Should show user-friendly message, not technical details
      await expect(page.locator(`text=${scenario.expectedMessage}`)).toBeVisible();
      
      // Should not show technical error details
      const pageContent = await page.content();
      expect(pageContent).not.toContain('Technical error message');
      expect(pageContent).not.toContain('stack trace');
      expect(pageContent).not.toContain('at line');
      
      await page.unroute(scenario.url);
    }
  });
});