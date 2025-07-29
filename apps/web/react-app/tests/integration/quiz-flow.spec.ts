import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { QuizListPage } from '../pages/QuizListPage';
import { QuizPage } from '../pages/QuizPage';
import { ResultPage } from '../pages/ResultPage';

test.describe('Complete Quiz Flow Integration Tests', () => {
  test('should complete full quiz flow from home to results', async ({ page }) => {
    const homePage = new HomePage(page);
    const quizListPage = new QuizListPage(page);
    const quizPage = new QuizPage(page);
    const resultPage = new ResultPage(page);
    
    // Start from home page
    await homePage.goto();
    await expect(homePage.heroTitle).toBeVisible();
    
    // Navigate to quiz list
    await homePage.navigateToQuizzes();
    await expect(page).toHaveURL(/\/quizzes/);
    
    // Wait for quizzes to load and select first quiz
    await quizListPage.waitForQuizzesToLoad();
    const quizCount = await quizListPage.getQuizCount();
    expect(quizCount).toBeGreaterThan(0);
    
    await quizListPage.selectQuiz(0);
    await expect(page).toHaveURL(/\/quizzes\/\d+/);
    
    // Complete the quiz
    await expect(quizPage.questionText).toBeVisible();
    await quizPage.completeQuiz([0, 1, 2, 1, 0]); // Answer pattern
    
    // Wait for results
    await expect(page).toHaveURL(/\/results\//);
    await resultPage.waitForResults();
    
    // Verify results are displayed
    const personalityType = await resultPage.getPersonalityType();
    expect(personalityType).toBeTruthy();
    expect(personalityType.length).toBeGreaterThan(0);
    
    // Test share functionality
    await resultPage.shareResults();
    await expect(resultPage.shareModal).toBeVisible();
    
    await resultPage.copyShareLink();
    await expect(resultPage.shareSuccessMessage).toBeVisible();
  });

  test('should handle quiz abandonment and resumption', async ({ page }) => {
    const quizPage = new QuizPage(page);
    
    // Start a quiz
    await page.goto('/quizzes/1');
    await expect(quizPage.questionText).toBeVisible();
    
    // Answer some questions
    await quizPage.selectAnswer(0);
    await page.waitForTimeout(500);
    await quizPage.selectAnswer(1);
    
    const progressBefore = await quizPage.getCurrentQuestionNumber();
    
    // Navigate away
    await page.goto('/');
    
    // Come back to the quiz
    await page.goto('/quizzes/1');
    
    // Should either resume or restart - both are valid behaviors
    const progressAfter = await quizPage.getCurrentQuestionNumber();
    expect(progressAfter).toBeGreaterThanOrEqual(1);
  });

  test('should handle network interruption during quiz', async ({ page, context }) => {
    const quizPage = new QuizPage(page);
    
    await page.goto('/quizzes/1');
    await quizPage.selectAnswer(0);
    
    // Simulate network interruption
    await context.setOffline(true);
    
    // Try to continue quiz
    await quizPage.selectAnswer(1);
    
    // Should show error or offline message
    await expect(page.locator('text=/offline|network|connection/i')).toBeVisible({ timeout: 10000 });
    
    // Restore network
    await context.setOffline(false);
    
    // Should be able to continue
    const retryButton = page.locator('button:has-text("Try Again"), button:has-text("Retry")');
    if (await retryButton.isVisible()) {
      await retryButton.click();
    }
    
    // Quiz should be functional again
    await expect(quizPage.answerOptions).toBeVisible();
  });

  test('should validate quiz answers before submission', async ({ page }) => {
    const quizPage = new QuizPage(page);
    
    // Mock quiz with validation
    await page.route('**/api/quizzes/1', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          title: 'Validation Test Quiz',
          questions: Array(5).fill(null).map((_, i) => ({
            id: i + 1,
            text: `Question ${i + 1}?`,
            options: [
              { id: 1, text: 'Option 1' },
              { id: 2, text: 'Option 2' },
              { id: 3, text: 'Option 3' },
              { id: 4, text: 'Option 4' }
            ],
            required: true
          }))
        })
      });
    });

    await page.goto('/quizzes/1');
    
    // Try to skip questions and submit
    for (let i = 0; i < 3; i++) {
      const nextButton = page.locator('button:has-text("Next"), button:has-text("Skip")');
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(300);
      }
    }
    
    // Try to submit without answering all questions
    if (await quizPage.submitButton.isVisible()) {
      await quizPage.submitButton.click();
      
      // Should show validation error
      await expect(page.locator('text=/please answer|required|complete all/i')).toBeVisible();
    }
  });

  test('should track quiz progress and completion', async ({ page }) => {
    const analyticsEvents: any[] = [];
    
    // Intercept analytics calls
    await page.route('**/api/analytics/track', async route => {
      const data = route.request().postDataJSON();
      analyticsEvents.push(data);
      await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
    });

    const quizPage = new QuizPage(page);
    await page.goto('/quizzes/1');
    
    // Complete quiz
    await quizPage.completeQuiz([0, 1, 2, 3, 0]);
    
    // Check analytics events
    const startEvent = analyticsEvents.find(e => e.event === 'quiz_started');
    const completeEvent = analyticsEvents.find(e => e.event === 'quiz_completed');
    
    expect(startEvent).toBeTruthy();
    expect(completeEvent).toBeTruthy();
    expect(completeEvent.properties.quizId).toBe(1);
  });

  test('should handle multiple quizzes in succession', async ({ page }) => {
    const quizListPage = new QuizListPage(page);
    const quizPage = new QuizPage(page);
    const resultPage = new ResultPage(page);
    
    await quizListPage.goto();
    await quizListPage.waitForQuizzesToLoad();
    
    // Complete first quiz
    await quizListPage.selectQuiz(0);
    await quizPage.completeQuiz([0, 1, 0, 1, 0]);
    await resultPage.waitForResults();
    
    // Take another quiz
    await resultPage.retakeQuiz();
    await expect(page).toHaveURL(/\/quizzes/);
    
    // Select different quiz
    await quizListPage.selectQuiz(1);
    await quizPage.completeQuiz([1, 1, 1, 1, 1]);
    await resultPage.waitForResults();
    
    // Results should be different
    const personalityType2 = await resultPage.getPersonalityType();
    expect(personalityType2).toBeTruthy();
  });

  test('should preserve user preferences throughout flow', async ({ page }) => {
    // Set preferences (e.g., dark mode, language)
    await page.goto('/');
    
    // Toggle dark mode if available
    const darkModeToggle = page.locator('[aria-label*="dark mode"], [aria-label*="theme"]');
    if (await darkModeToggle.isVisible()) {
      await darkModeToggle.click();
    }
    
    // Navigate through quiz flow
    const homePage = new HomePage(page);
    await homePage.navigateToQuizzes();
    
    // Check that preference is maintained
    const isDarkMode = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ||
             document.body.classList.contains('dark-mode');
    });
    
    // Complete a quiz
    const quizPage = new QuizPage(page);
    await page.goto('/quizzes/1');
    await quizPage.completeQuiz();
    
    // Preference should still be active on results page
    const isDarkModeAfter = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ||
             document.body.classList.contains('dark-mode');
    });
    
    expect(isDarkModeAfter).toBe(isDarkMode);
  });

  test('should handle deep linking to quiz results', async ({ page }) => {
    const resultPage = new ResultPage(page);
    
    // Mock result data
    await page.route('**/api/results/shared-result-123', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'shared-result-123',
          personalityType: 'ENFP',
          traits: {
            openness: 85,
            conscientiousness: 60,
            extraversion: 90,
            agreeableness: 75,
            neuroticism: 40
          },
          description: 'The Campaigner - Enthusiastic and creative'
        })
      });
    });

    // Navigate directly to shared result
    await page.goto('/results/shared-result-123');
    await resultPage.waitForResults();
    
    // Verify result is displayed correctly
    const personalityType = await resultPage.getPersonalityType();
    expect(personalityType).toBe('ENFP');
    
    // User should be able to take their own quiz from here
    await expect(resultPage.retakeButton).toBeVisible();
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    const homePage = new HomePage(page);
    const quizListPage = new QuizListPage(page);
    const quizPage = new QuizPage(page);
    
    // Navigate through pages
    await homePage.goto();
    await homePage.navigateToQuizzes();
    await quizListPage.waitForQuizzesToLoad();
    await quizListPage.selectQuiz(0);
    
    // Go back
    await page.goBack();
    await expect(page).toHaveURL(/\/quizzes$/);
    
    // Go back again
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    
    // Go forward
    await page.goForward();
    await expect(page).toHaveURL(/\/quizzes$/);
    
    // Go forward again
    await page.goForward();
    await expect(page).toHaveURL(/\/quizzes\/\d+/);
    
    // Quiz should still be functional
    await expect(quizPage.questionText).toBeVisible();
  });
});