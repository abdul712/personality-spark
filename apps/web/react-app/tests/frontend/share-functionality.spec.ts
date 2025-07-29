import { test, expect } from '@playwright/test';
import { ResultPage } from '../pages/ResultPage';

test.describe('Share Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock successful result load
    await page.route('**/api/results/test-id', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-id',
          personalityType: 'INTJ',
          traits: {
            openness: 80,
            conscientiousness: 75,
            extraversion: 45,
            agreeableness: 60,
            neuroticism: 30
          },
          description: 'The Architect - Strategic and innovative'
        })
      });
    });
  });

  test('should copy share link to clipboard', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    const resultPage = new ResultPage(page);
    await page.goto('/results/test-id');
    await resultPage.waitForResults();
    
    // Click share button
    await resultPage.shareButton.click();
    
    // Click copy link button
    await resultPage.copyLinkButton.click();
    
    // Check success message
    await expect(resultPage.shareSuccessMessage).toBeVisible();
    
    // Verify clipboard content
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('http');
    expect(clipboardText).toContain('/results/test-id');
  });

  test('should handle clipboard API not available', async ({ page }) => {
    // Override clipboard API to simulate unavailability
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined
      });
    });
    
    const resultPage = new ResultPage(page);
    await page.goto('/results/test-id');
    await resultPage.waitForResults();
    
    await resultPage.shareButton.click();
    await resultPage.copyLinkButton.click();
    
    // Should show fallback behavior or error message
    await expect(page.locator('text=/copied|select|share/i')).toBeVisible();
  });

  test('should generate shareable card image', async ({ page }) => {
    await page.route('**/api/share/card', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          imageUrl: '/share/cards/test-id.png',
          shareUrl: 'https://personalityspark.com/share/test-id'
        })
      });
    });
    
    const resultPage = new ResultPage(page);
    await page.goto('/results/test-id');
    await resultPage.waitForResults();
    
    await resultPage.shareButton.click();
    
    // Check for share card preview
    const shareCard = page.locator('img[alt*="share"], [class*="share-card"]');
    await expect(shareCard).toBeVisible();
    
    // Verify share card has proper attributes
    const imageSrc = await shareCard.getAttribute('src');
    expect(imageSrc).toBeTruthy();
  });

  test('should share to social media platforms', async ({ page, context }) => {
    const resultPage = new ResultPage(page);
    await page.goto('/results/test-id');
    await resultPage.waitForResults();
    
    await resultPage.shareButton.click();
    
    // Test Twitter/X share
    const twitterSharePromise = context.waitForEvent('page');
    await page.locator('button[aria-label*="Twitter"], button[aria-label*="X"]').click();
    const twitterPage = await twitterSharePromise;
    
    expect(twitterPage.url()).toContain('twitter.com/intent/tweet');
    await twitterPage.close();
    
    // Test Facebook share
    const facebookSharePromise = context.waitForEvent('page');
    await page.locator('button[aria-label*="Facebook"]').click();
    const facebookPage = await facebookSharePromise;
    
    expect(facebookPage.url()).toContain('facebook.com/sharer');
    await facebookPage.close();
  });

  test('should track share events', async ({ page }) => {
    const shareEvents: any[] = [];
    
    await page.route('**/api/analytics/track', async route => {
      const request = route.request();
      const data = request.postDataJSON();
      shareEvents.push(data);
      
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true })
      });
    });
    
    const resultPage = new ResultPage(page);
    await page.goto('/results/test-id');
    await resultPage.waitForResults();
    
    await resultPage.shareButton.click();
    await resultPage.copyLinkButton.click();
    
    // Check that share event was tracked
    const shareEvent = shareEvents.find(e => e.event === 'share_result');
    expect(shareEvent).toBeTruthy();
    expect(shareEvent.properties).toMatchObject({
      method: 'copy_link',
      resultId: 'test-id'
    });
  });

  test('should generate proper Open Graph meta tags for shared results', async ({ page }) => {
    await page.goto('/results/test-id');
    
    // Check Open Graph meta tags
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
    
    expect(ogTitle).toContain('Personality');
    expect(ogDescription).toContain('INTJ');
    expect(ogImage).toBeTruthy();
    expect(ogUrl).toContain('/results/test-id');
    
    // Check Twitter Card meta tags
    const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute('content');
    expect(twitterCard).toBe('summary_large_image');
  });

  test('should handle share modal accessibility', async ({ page }) => {
    const resultPage = new ResultPage(page);
    await page.goto('/results/test-id');
    await resultPage.waitForResults();
    
    await resultPage.shareButton.click();
    
    // Check modal has proper ARIA attributes
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    
    const modalLabel = await modal.getAttribute('aria-label');
    expect(modalLabel).toContain('Share');
    
    // Check focus management
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'INPUT']).toContain(focusedElement);
    
    // Test escape key closes modal
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
  });

  test('should provide text-only share option', async ({ page }) => {
    const resultPage = new ResultPage(page);
    await page.goto('/results/test-id');
    await resultPage.waitForResults();
    
    await resultPage.shareButton.click();
    
    // Look for text share option
    const textShareButton = page.locator('button:has-text("Copy Text")');
    await textShareButton.click();
    
    // Check that personality result text is copied
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('INTJ');
    expect(clipboardText).toContain('The Architect');
    expect(clipboardText).not.toContain('http'); // Text only, no URL
  });

  test('should handle share errors gracefully', async ({ page }) => {
    await page.route('**/api/share/card', async route => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Failed to generate share card' })
      });
    });
    
    const resultPage = new ResultPage(page);
    await page.goto('/results/test-id');
    await resultPage.waitForResults();
    
    await resultPage.shareButton.click();
    
    // Should still allow basic sharing even if card generation fails
    await expect(resultPage.copyLinkButton).toBeVisible();
    
    // Error message should be user-friendly
    const errorMessage = page.locator('text=/share card unavailable|couldn\'t load preview/i');
    if (await errorMessage.isVisible()) {
      expect(await errorMessage.textContent()).not.toContain('500');
      expect(await errorMessage.textContent()).not.toContain('stack trace');
    }
  });
});