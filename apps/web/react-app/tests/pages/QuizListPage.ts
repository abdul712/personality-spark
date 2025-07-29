import { Page, Locator } from '@playwright/test';

export class QuizListPage {
  readonly page: Page;
  readonly quizCards: Locator;
  readonly loadingIndicator: Locator;
  readonly errorMessage: Locator;
  readonly retryButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.quizCards = page.locator('[class*="quiz-card"]');
    this.loadingIndicator = page.locator('[class*="loading"]');
    this.errorMessage = page.locator('[class*="error-message"]');
    this.retryButton = page.locator('button:has-text("Try Again")');
  }

  async goto() {
    await this.page.goto('/quizzes');
  }

  async selectQuiz(index: number = 0) {
    await this.quizCards.nth(index).click();
  }

  async waitForQuizzesToLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.loadingIndicator.waitFor({ state: 'detached', timeout: 10000 });
  }

  async getQuizCount() {
    return await this.quizCards.count();
  }

  async isErrorVisible() {
    return await this.errorMessage.isVisible();
  }

  async retryLoading() {
    await this.retryButton.click();
  }
}