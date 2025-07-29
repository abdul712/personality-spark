import { test, expect } from '@playwright/test';
import { QuizListPage } from '../pages/QuizListPage';
import { QuizPage } from '../pages/QuizPage';
import { ResultPage } from '../pages/ResultPage';
import { BlogPage } from '../pages/BlogPage';

test.describe('Error States Tests', () => {
  test.describe('Quiz List Error States', () => {
    test('should show error when quiz list fails to load', async ({ page }) => {
      const quizListPage = new QuizListPage(page);
      
      await page.route('**/api/quizzes', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' })
        });
      });

      await quizListPage.goto();
      
      await expect(quizListPage.errorMessage).toBeVisible();
      await expect(quizListPage.retryButton).toBeVisible();
      await expect(page.locator('text=Failed to load quizzes')).toBeVisible();
    });

    test('should retry loading quizzes when retry button is clicked', async ({ page }) => {
      const quizListPage = new QuizListPage(page);
      let attemptCount = 0;
      
      await page.route('**/api/quizzes', async route => {
        attemptCount++;
        if (attemptCount === 1) {
          await route.fulfill({
            status: 500,
            body: JSON.stringify({ error: 'Server error' })
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
              { id: 1, title: 'Personality Quiz', description: 'Discover yourself', questionCount: 5 }
            ])
          });
        }
      });

      await quizListPage.goto();
      await quizListPage.retryButton.click();
      
      await expect(quizListPage.quizCards).toHaveCount(1);
      await expect(quizListPage.errorMessage).not.toBeVisible();
    });

    test('should handle empty quiz list', async ({ page }) => {
      const quizListPage = new QuizListPage(page);
      
      await page.route('**/api/quizzes', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      });

      await quizListPage.goto();
      
      await expect(page.locator('text=No quizzes available')).toBeVisible();
    });
  });

  test.describe('Quiz Page Error States', () => {
    test('should show error when quiz fails to load', async ({ page }) => {
      const quizPage = new QuizPage(page);
      
      await page.route('**/api/quizzes/1', async route => {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Quiz not found' })
        });
      });

      await page.goto('/quizzes/1');
      
      await expect(quizPage.errorMessage).toBeVisible();
      await expect(page.locator('text=Quiz not found')).toBeVisible();
    });

    test('should handle quiz submission errors', async ({ page }) => {
      const quizPage = new QuizPage(page);
      
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
                  { id: 1, text: 'Option 1' },
                  { id: 2, text: 'Option 2' }
                ]
              }
            ]
          })
        });
      });

      // Mock submission error
      await page.route('**/api/quizzes/submit', async route => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Invalid submission data' })
        });
      });

      await page.goto('/quizzes/1');
      await quizPage.selectAnswer(0);
      await quizPage.submitButton.click();
      
      await expect(page.locator('text=Failed to submit quiz')).toBeVisible();
    });

    test('should handle timeout errors gracefully', async ({ page }) => {
      await page.route('**/api/quizzes/1', async route => {
        // Simulate timeout by not responding
        await new Promise(resolve => setTimeout(resolve, 35000));
      });

      await page.goto('/quizzes/1', { timeout: 5000 }).catch(() => {});
      
      await expect(page.locator('text=/timeout|taking too long|try again/i')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Result Page Error States', () => {
    test('should show error when results fail to load', async ({ page }) => {
      const resultPage = new ResultPage(page);
      
      await page.route('**/api/results/*', async route => {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Results not found' })
        });
      });

      await page.goto('/results/test-id');
      
      await expect(resultPage.errorMessage).toBeVisible();
      await expect(page.locator('text=Results not found')).toBeVisible();
    });

    test('should handle share functionality errors', async ({ page }) => {
      const resultPage = new ResultPage(page);
      
      // Mock successful result load
      await page.route('**/api/results/test-id', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'test-id',
            personalityType: 'INTJ',
            traits: { openness: 80, conscientiousness: 75 }
          })
        });
      });

      // Mock share error
      await page.route('**/api/share', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Share service unavailable' })
        });
      });

      await page.goto('/results/test-id');
      await resultPage.shareButton.click();
      
      await expect(page.locator('text=Failed to create share link')).toBeVisible();
    });
  });

  test.describe('Blog Error States', () => {
    test('should show error when blog posts fail to load', async ({ page }) => {
      const blogPage = new BlogPage(page);
      
      await page.route('**/data/blog/posts.json', async route => {
        await route.fulfill({
          status: 500,
          body: 'Server Error'
        });
      });

      await blogPage.goto();
      
      await expect(blogPage.errorMessage).toBeVisible();
      await expect(page.locator('text=Failed to load blog posts')).toBeVisible();
    });

    test('should handle individual blog post loading errors', async ({ page }) => {
      const blogPage = new BlogPage(page);
      
      await page.route('**/data/blog/posts/test-post.json', async route => {
        await route.fulfill({
          status: 404,
          body: 'Not Found'
        });
      });

      await blogPage.gotoPost('test-post');
      
      await expect(blogPage.errorMessage).toBeVisible();
      await expect(page.locator('text=Blog post not found')).toBeVisible();
    });

    test('should handle malformed blog data gracefully', async ({ page }) => {
      const blogPage = new BlogPage(page);
      
      await page.route('**/data/blog/posts.json', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: 'Invalid JSON{'
        });
      });

      await blogPage.goto();
      
      await expect(blogPage.errorMessage).toBeVisible();
      await expect(page.locator('text=/error|failed|try again/i')).toBeVisible();
    });
  });

  test('should maintain user context during error recovery', async ({ page }) => {
    // Start a quiz
    await page.goto('/quizzes/1');
    
    // Answer some questions
    const quizPage = new QuizPage(page);
    await quizPage.selectAnswer(0);
    
    // Simulate network error
    await page.route('**/api/**', async route => {
      await route.abort('failed');
    });
    
    // Try to proceed (should fail)
    await quizPage.selectAnswer(1);
    
    // Should show error but maintain progress
    await expect(page.locator('text=/error|failed/i')).toBeVisible();
    
    // Fix network and continue
    await page.unroute('**/api/**');
    
    // Progress should be maintained
    const progress = await quizPage.getCurrentQuestionNumber();
    expect(progress).toBeGreaterThan(0);
  });
});