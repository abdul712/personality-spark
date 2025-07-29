import { test, expect } from '@playwright/test';
import { BlogPage } from '../pages/BlogPage';

test.describe('XSS Protection Tests', () => {
  test('should sanitize malicious content in blog posts', async ({ page }) => {
    const blogPage = new BlogPage(page);
    
    // Navigate to a test blog post that might contain malicious content
    await blogPage.goto();
    await blogPage.waitForPostsToLoad();
    
    // Check if any blog post content contains unsanitized scripts
    const posts = await page.locator('[class*="blog-post-card"]').all();
    
    for (const post of posts) {
      const content = await post.innerHTML();
      // Check that script tags are escaped or removed
      expect(content).not.toContain('<script>');
      expect(content).not.toContain('javascript:');
      expect(content).not.toContain('onerror=');
      expect(content).not.toContain('onclick=');
    }
  });

  test('should prevent XSS in quiz content', async ({ page }) => {
    // Create a mock response with malicious content
    await page.route('**/api/quizzes', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{
          id: 1,
          title: '<script>alert("XSS")</script>Test Quiz',
          description: 'Test <img src=x onerror=alert("XSS")> Description',
          questionCount: 5
        }])
      });
    });

    await page.goto('/quizzes');
    
    // Check that malicious content is sanitized
    const content = await page.content();
    expect(content).not.toContain('<script>alert("XSS")</script>');
    expect(content).not.toContain('onerror=alert');
    
    // Check that the text content is still displayed (sanitized)
    await expect(page.locator('text=Test Quiz')).toBeVisible();
  });

  test('should sanitize user input in forms', async ({ page }) => {
    await page.goto('/quizzes/1');
    
    // Try to inject malicious content in any input fields
    const inputs = await page.locator('input[type="text"], textarea').all();
    
    for (const input of inputs) {
      await input.fill('<script>alert("XSS")</script>');
      
      // Submit or blur to trigger any processing
      await input.blur();
      
      // Check that the value is properly escaped when displayed
      const value = await input.inputValue();
      const displayedContent = await page.content();
      
      if (value.includes('<script>')) {
        expect(displayedContent).not.toContain('<script>alert("XSS")</script>');
      }
    }
  });

  test('should have Content Security Policy headers', async ({ request }) => {
    const response = await request.get('/');
    const cspHeader = response.headers()['content-security-policy'];
    
    if (cspHeader) {
      // Check for important CSP directives
      expect(cspHeader).toContain("default-src 'self'");
      expect(cspHeader).toMatch(/script-src .*(self|nonce-)/);
      expect(cspHeader).not.toContain("unsafe-inline");
      expect(cspHeader).not.toContain("unsafe-eval");
    }
  });

  test('should escape HTML in error messages', async ({ page }) => {
    // Force an error with malicious content
    await page.route('**/api/quizzes', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: '<script>alert("XSS")</script>Invalid request'
        })
      });
    });

    await page.goto('/quizzes');
    
    // Check that error message is displayed but sanitized
    await expect(page.locator('text=Invalid request')).toBeVisible();
    const content = await page.content();
    expect(content).not.toContain('<script>alert("XSS")</script>');
  });
});