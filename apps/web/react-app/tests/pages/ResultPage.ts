import { Page, Locator } from '@playwright/test';

export class ResultPage {
  readonly page: Page;
  readonly resultTitle: Locator;
  readonly personalityType: Locator;
  readonly shareButton: Locator;
  readonly retakeButton: Locator;
  readonly traitsSection: Locator;
  readonly errorMessage: Locator;
  readonly shareModal: Locator;
  readonly copyLinkButton: Locator;
  readonly shareSuccessMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.resultTitle = page.locator('h1:has-text("Your Results")');
    this.personalityType = page.locator('[class*="personality-type"]');
    this.shareButton = page.locator('button:has-text("Share")');
    this.retakeButton = page.locator('button:has-text("Take Another Quiz")');
    this.traitsSection = page.locator('[class*="traits-section"]');
    this.errorMessage = page.locator('[class*="error-message"]');
    this.shareModal = page.locator('[class*="share-modal"]');
    this.copyLinkButton = page.locator('button:has-text("Copy Link")');
    this.shareSuccessMessage = page.locator('text=Link copied to clipboard');
  }

  async waitForResults() {
    await this.resultTitle.waitFor({ state: 'visible', timeout: 10000 });
  }

  async getPersonalityType(): Promise<string> {
    return await this.personalityType.textContent() || '';
  }

  async shareResults() {
    await this.shareButton.click();
  }

  async copyShareLink() {
    await this.copyLinkButton.click();
  }

  async isShareSuccessVisible() {
    return await this.shareSuccessMessage.isVisible();
  }

  async retakeQuiz() {
    await this.retakeButton.click();
  }

  async isErrorVisible() {
    return await this.errorMessage.isVisible();
  }
}