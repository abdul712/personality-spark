import { Page, Locator } from '@playwright/test';

export class BlogPage {
  readonly page: Page;
  readonly blogPosts: Locator;
  readonly postTitle: Locator;
  readonly postContent: Locator;
  readonly loadingIndicator: Locator;
  readonly errorMessage: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.blogPosts = page.locator('[class*="blog-post-card"]');
    this.postTitle = page.locator('h1[class*="post-title"]');
    this.postContent = page.locator('[class*="post-content"]');
    this.loadingIndicator = page.locator('[class*="loading"]');
    this.errorMessage = page.locator('[class*="error-message"]');
    this.backButton = page.locator('a:has-text("Back to Blog")');
  }

  async goto() {
    await this.page.goto('/blog');
  }

  async gotoPost(slug: string) {
    await this.page.goto(`/blog/${slug}`);
  }

  async selectPost(index: number = 0) {
    await this.blogPosts.nth(index).click();
  }

  async waitForPostsToLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.loadingIndicator.waitFor({ state: 'detached', timeout: 10000 });
  }

  async getPostCount() {
    return await this.blogPosts.count();
  }

  async getPostContentHTML(): Promise<string> {
    return await this.postContent.innerHTML();
  }

  async isErrorVisible() {
    return await this.errorMessage.isVisible();
  }

  async goBack() {
    await this.backButton.click();
  }
}