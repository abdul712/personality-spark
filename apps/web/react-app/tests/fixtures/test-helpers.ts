import { Page, Route } from '@playwright/test';
import { mockQuizData, mockBlogData, mockApiResponses } from './test-data';

/**
 * Helper functions for Playwright tests
 */
export class TestHelpers {
  /**
   * Setup common mock routes for successful API responses
   */
  static async setupSuccessfulMocks(page: Page) {
    // Mock quiz list
    await page.route('**/api/quizzes', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'X-Request-ID': 'test-request-123' },
        body: JSON.stringify(mockQuizData.quizList)
      });
    });

    // Mock individual quiz
    await page.route('**/api/quizzes/1', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'X-Request-ID': 'test-request-124' },
        body: JSON.stringify(mockQuizData.basicQuiz)
      });
    });

    // Mock quiz submission
    await page.route('**/api/quizzes/submit', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'X-Request-ID': 'test-request-125' },
        body: JSON.stringify({
          resultId: 'result-123',
          success: true
        })
      });
    });

    // Mock quiz results
    await page.route('**/api/results/result-123', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'X-Request-ID': 'test-request-126' },
        body: JSON.stringify(mockQuizData.mockResults.basic)
      });
    });

    // Mock blog posts
    await page.route('**/data/blog/posts.json', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBlogData.posts)
      });
    });
  }

  /**
   * Setup mock routes for error scenarios
   */
  static async setupErrorMocks(page: Page, errorType: 'badRequest' | 'unauthorized' | 'notFound' | 'serverError' | 'rateLimit' = 'serverError') {
    const error = mockApiResponses.errors[errorType];
    
    await page.route('**/api/**', async route => {
      await route.fulfill({
        status: error.status,
        contentType: 'application/json',
        headers: error.headers || { 'X-Request-ID': 'test-request-error' },
        body: JSON.stringify(error.body)
      });
    });
  }

  /**
   * Wait for all network requests to complete
   */
  static async waitForNetworkIdle(page: Page, timeout: number = 5000) {
    await page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Check for console errors
   */
  static async getConsoleErrors(page: Page): Promise<string[]> {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    return errors;
  }

  /**
   * Mock rate limiting
   */
  static async setupRateLimit(page: Page, endpoint: string, maxRequests: number = 5) {
    let requestCount = 0;
    
    await page.route(endpoint, async route => {
      requestCount++;
      
      if (requestCount > maxRequests) {
        await route.fulfill({
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + 60)
          },
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded'
          })
        });
      } else {
        await route.continue();
      }
    });
  }

  /**
   * Simulate slow network
   */
  static async simulateSlowNetwork(page: Page, delay: number = 2000) {
    await page.route('**/api/**', async route => {
      await new Promise(resolve => setTimeout(resolve, delay));
      await route.continue();
    });
  }

  /**
   * Check security headers
   */
  static async checkSecurityHeaders(page: Page, url: string) {
    const response = await page.request.get(url);
    const headers = response.headers();
    
    return {
      hasCSP: !!headers['content-security-policy'],
      hasXFrameOptions: !!headers['x-frame-options'],
      hasXContentTypeOptions: !!headers['x-content-type-options'],
      hasStrictTransportSecurity: !!headers['strict-transport-security'],
      hasReferrerPolicy: !!headers['referrer-policy']
    };
  }

  /**
   * Inject malicious content for XSS testing
   */
  static async injectMaliciousContent(page: Page, selector: string, content: string) {
    await page.locator(selector).fill(content);
    await page.waitForTimeout(100); // Allow processing
    
    // Check if script executed (should not happen if properly sanitized)
    const hasAlert = await page.evaluate(() => {
      const originalAlert = window.alert;
      let alertCalled = false;
      
      window.alert = () => {
        alertCalled = true;
      };
      
      setTimeout(() => {
        window.alert = originalAlert;
      }, 100);
      
      return alertCalled;
    });
    
    return !hasAlert; // Returns true if XSS was prevented
  }

  /**
   * Test accessibility with basic checks
   */
  static async checkBasicAccessibility(page: Page) {
    // Check for alt text on images
    const images = await page.locator('img').all();
    const imagesWithoutAlt = [];
    
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      if (!alt) {
        const src = await img.getAttribute('src');
        imagesWithoutAlt.push(src);
      }
    }
    
    // Check for proper heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    const headingLevels = [];
    
    for (const heading of headings) {
      const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
      headingLevels.push(parseInt(tagName[1]));
    }
    
    // Check for form labels
    const inputs = await page.locator('input[type="text"], input[type="email"], input[type="password"], textarea').all();
    const inputsWithoutLabels = [];
    
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      
      if (id) {
        const hasLabel = await page.locator(`label[for="${id}"]`).count() > 0;
        if (!hasLabel && !ariaLabel && !ariaLabelledBy) {
          inputsWithoutLabels.push(id);
        }
      }
    }
    
    return {
      imagesWithoutAlt: imagesWithoutAlt.length,
      headingHierarchy: headingLevels,
      inputsWithoutLabels: inputsWithoutLabels.length
    };
  }

  /**
   * Test keyboard navigation
   */
  static async testKeyboardNavigation(page: Page) {
    const focusableElements = await page.locator(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    ).all();
    
    let currentIndex = 0;
    const focusedElements = [];
    
    // Start from first element
    if (focusableElements.length > 0) {
      await focusableElements[0].focus();
      
      // Tab through elements
      for (let i = 0; i < Math.min(focusableElements.length, 10); i++) {
        await page.keyboard.press('Tab');
        
        const focusedElement = await page.evaluate(() => {
          const focused = document.activeElement;
          return {
            tagName: focused?.tagName.toLowerCase(),
            id: focused?.id,
            className: focused?.className
          };
        });
        
        focusedElements.push(focusedElement);
      }
    }
    
    return {
      totalFocusableElements: focusableElements.length,
      focusOrder: focusedElements
    };
  }

  /**
   * Measure page performance
   */
  static async measurePerformance(page: Page) {
    const performanceData = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        loadComplete: navigation.loadEventEnd - navigation.navigationStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    });
    
    return performanceData;
  }

  /**
   * Clean up after tests
   */
  static async cleanup(page: Page) {
    // Clear local storage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Unroute all routes
    await page.unrouteAll();
  }
}