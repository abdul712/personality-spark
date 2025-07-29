import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly heroTitle: Locator;
  readonly ctaButton: Locator;
  readonly featureCards: Locator;
  readonly navLinks: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heroTitle = page.locator('h1');
    this.ctaButton = page.locator('button:has-text("Start Your Journey")');
    this.featureCards = page.locator('[class*="feature-card"]');
    this.navLinks = page.locator('nav a');
  }

  async goto() {
    await this.page.goto('/');
  }

  async navigateToQuizzes() {
    await this.ctaButton.click();
  }

  async getFeatureCount() {
    return await this.featureCards.count();
  }
}