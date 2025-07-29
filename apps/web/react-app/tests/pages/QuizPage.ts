import { Page, Locator } from '@playwright/test';

export class QuizPage {
  readonly page: Page;
  readonly questionText: Locator;
  readonly answerOptions: Locator;
  readonly progressBar: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly loadingIndicator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.questionText = page.locator('[class*="question-text"]');
    this.answerOptions = page.locator('[class*="answer-option"]');
    this.progressBar = page.locator('[class*="progress-bar"]');
    this.submitButton = page.locator('button:has-text("Submit")');
    this.errorMessage = page.locator('[class*="error-message"]');
    this.loadingIndicator = page.locator('[class*="loading"]');
  }

  async selectAnswer(index: number = 0) {
    await this.answerOptions.nth(index).click();
  }

  async completeQuiz(answerIndices: number[] = []) {
    const questionCount = answerIndices.length || 5;
    
    for (let i = 0; i < questionCount; i++) {
      await this.selectAnswer(answerIndices[i] || 0);
      // Wait for next question or submit button
      await this.page.waitForTimeout(500);
    }
    
    if (await this.submitButton.isVisible()) {
      await this.submitButton.click();
    }
  }

  async getCurrentQuestionNumber(): Promise<number> {
    const progressText = await this.progressBar.textContent();
    const match = progressText?.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  async isErrorVisible() {
    return await this.errorMessage.isVisible();
  }
}