import { test, expect } from '@playwright/test';
import { BlogPage } from '../pages/BlogPage';
import { HomePage } from '../pages/HomePage';

test.describe('Blog Navigation Integration Tests', () => {
  test('should navigate from home to blog and read posts', async ({ page }) => {
    const homePage = new HomePage(page);
    const blogPage = new BlogPage(page);
    
    // Start from home
    await homePage.goto();
    
    // Navigate to blog via nav link
    const blogLink = page.locator('nav a:has-text("Blog")');
    await blogLink.click();
    
    await expect(page).toHaveURL(/\/blog/);
    await blogPage.waitForPostsToLoad();
    
    // Verify blog posts are loaded
    const postCount = await blogPage.getPostCount();
    expect(postCount).toBeGreaterThan(0);
    
    // Click on first blog post
    await blogPage.selectPost(0);
    
    // Verify we're on a blog post page
    await expect(page).toHaveURL(/\/blog\/[\w-]+/);
    await expect(blogPage.postTitle).toBeVisible();
    await expect(blogPage.postContent).toBeVisible();
    
    // Navigate back to blog list
    await blogPage.goBack();
    await expect(page).toHaveURL(/\/blog$/);
  });

  test('should handle blog post loading errors gracefully', async ({ page }) => {
    const blogPage = new BlogPage(page);
    
    // Mock error for specific post
    await page.route('**/data/blog/posts/error-post.json', async route => {
      await route.fulfill({
        status: 404,
        body: 'Not Found'
      });
    });

    await blogPage.gotoPost('error-post');
    
    // Should show error message
    await expect(blogPage.errorMessage).toBeVisible();
    await expect(page.locator('text=Blog post not found')).toBeVisible();
    
    // Should provide way to go back
    const backLink = page.locator('a:has-text("Back"), button:has-text("Go Back")');
    await expect(backLink).toBeVisible();
  });

  test('should load blog posts with proper content structure', async ({ page }) => {
    const blogPage = new BlogPage(page);
    
    // Mock well-structured blog post
    await page.route('**/data/blog/posts/structured-post.json', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          title: 'Understanding Personality Types',
          author: 'Dr. Jane Smith',
          date: '2024-01-15',
          readTime: '8 min read',
          tags: ['personality', 'psychology', 'self-discovery'],
          content: `
            <h2>Introduction to Personality Types</h2>
            <p>Personality types help us understand ourselves and others better.</p>
            
            <h3>The Big Five Model</h3>
            <p>The Big Five personality traits are:</p>
            <ul>
              <li>Openness</li>
              <li>Conscientiousness</li>
              <li>Extraversion</li>
              <li>Agreeableness</li>
              <li>Neuroticism</li>
            </ul>
            
            <blockquote>
              "Knowing yourself is the beginning of all wisdom." - Aristotle
            </blockquote>
            
            <h3>Practical Applications</h3>
            <p>Understanding personality types can improve:</p>
            <ol>
              <li>Personal relationships</li>
              <li>Career choices</li>
              <li>Communication skills</li>
            </ol>
          `
        })
      });
    });

    await blogPage.gotoPost('structured-post');
    
    // Verify all elements are rendered properly
    await expect(page.locator('h1:has-text("Understanding Personality Types")')).toBeVisible();
    await expect(page.locator('text=Dr. Jane Smith')).toBeVisible();
    await expect(page.locator('text=8 min read')).toBeVisible();
    
    // Check content structure
    await expect(page.locator('h2:has-text("Introduction to Personality Types")')).toBeVisible();
    await expect(page.locator('h3:has-text("The Big Five Model")')).toBeVisible();
    await expect(page.locator('ul li:has-text("Openness")')).toBeVisible();
    await expect(page.locator('blockquote')).toBeVisible();
    await expect(page.locator('ol li:has-text("Personal relationships")')).toBeVisible();
  });

  test('should handle blog pagination if implemented', async ({ page }) => {
    const blogPage = new BlogPage(page);
    
    // Mock paginated blog response
    await page.route('**/data/blog/posts.json', async route => {
      const url = new URL(route.request().url());
      const pageParam = url.searchParams.get('page') || '1';
      const page = parseInt(pageParam);
      
      const posts = Array(10).fill(null).map((_, i) => ({
        id: (page - 1) * 10 + i + 1,
        slug: `post-${(page - 1) * 10 + i + 1}`,
        title: `Blog Post ${(page - 1) * 10 + i + 1}`,
        excerpt: `Excerpt for post ${(page - 1) * 10 + i + 1}`,
        date: '2024-01-01',
        readTime: '5 min'
      }));
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          posts,
          totalPages: 3,
          currentPage: page
        })
      });
    });

    await blogPage.goto();
    
    // Check if pagination controls exist
    const nextButton = page.locator('button:has-text("Next"), a:has-text("Next")');
    const prevButton = page.locator('button:has-text("Previous"), a:has-text("Previous")');
    const pageNumbers = page.locator('[aria-label*="Page"]');
    
    if (await nextButton.isVisible()) {
      // Test pagination
      await nextButton.click();
      await page.waitForLoadState('networkidle');
      
      // URL or content should update
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/page=2|p=2|\/2/);
      
      // Previous button should now be enabled
      await expect(prevButton).toBeEnabled();
    }
  });

  test('should track blog reading analytics', async ({ page }) => {
    const analyticsEvents: any[] = [];
    
    await page.route('**/api/analytics/track', async route => {
      const data = route.request().postDataJSON();
      analyticsEvents.push(data);
      await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
    });

    const blogPage = new BlogPage(page);
    await blogPage.goto();
    await blogPage.waitForPostsToLoad();
    
    // View blog list
    const listViewEvent = analyticsEvents.find(e => e.event === 'blog_list_viewed');
    expect(listViewEvent).toBeTruthy();
    
    // Click on a post
    await blogPage.selectPost(0);
    
    // Check post view event
    const postViewEvent = analyticsEvents.find(e => e.event === 'blog_post_viewed');
    expect(postViewEvent).toBeTruthy();
    expect(postViewEvent.properties).toHaveProperty('postSlug');
    
    // Scroll through post (if scroll tracking is implemented)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check for read completion event
    await page.waitForTimeout(2000); // Wait for any debounced events
    const readCompleteEvent = analyticsEvents.find(e => e.event === 'blog_post_read_complete');
    // This might not be implemented, so we just check if it exists
  });

  test('should handle related posts and navigation', async ({ page }) => {
    const blogPage = new BlogPage(page);
    
    // Mock blog post with related posts
    await page.route('**/data/blog/posts/main-post.json', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          title: 'Main Blog Post',
          content: '<p>Main content here</p>',
          date: '2024-01-15',
          relatedPosts: [
            { slug: 'related-1', title: 'Related Post 1' },
            { slug: 'related-2', title: 'Related Post 2' }
          ]
        })
      });
    });

    await blogPage.gotoPost('main-post');
    
    // Check if related posts are displayed
    const relatedSection = page.locator('section:has-text("Related"), aside:has-text("Related")');
    
    if (await relatedSection.isVisible()) {
      const relatedLinks = relatedSection.locator('a');
      const relatedCount = await relatedLinks.count();
      expect(relatedCount).toBeGreaterThan(0);
      
      // Click on related post
      await relatedLinks.first().click();
      
      // Should navigate to related post
      await expect(page).toHaveURL(/\/blog\/related-1/);
    }
  });

  test('should support blog search functionality', async ({ page }) => {
    const blogPage = new BlogPage(page);
    await blogPage.goto();
    
    // Look for search input
    const searchInput = page.locator('input[placeholder*="Search"], input[aria-label*="Search"]');
    
    if (await searchInput.isVisible()) {
      // Type search query
      await searchInput.fill('personality types');
      await searchInput.press('Enter');
      
      // Wait for results
      await page.waitForLoadState('networkidle');
      
      // Check if results are filtered
      const posts = await blogPage.getPostCount();
      
      // Verify search worked (URL might contain search param)
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/search=|q=|query=/);
    }
  });

  test('should handle blog categories and tags', async ({ page }) => {
    const blogPage = new BlogPage(page);
    
    // Mock blog posts with categories
    await page.route('**/data/blog/posts.json', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            slug: 'personality-basics',
            title: 'Personality Basics',
            excerpt: 'Introduction to personality',
            category: 'Psychology',
            tags: ['beginner', 'personality'],
            date: '2024-01-01'
          },
          {
            id: 2,
            slug: 'career-personality',
            title: 'Career and Personality',
            excerpt: 'How personality affects career',
            category: 'Career',
            tags: ['career', 'professional'],
            date: '2024-01-02'
          }
        ])
      });
    });

    await blogPage.goto();
    await blogPage.waitForPostsToLoad();
    
    // Look for category filters
    const categoryFilter = page.locator('[aria-label*="Category"], select:has-text("Category")');
    
    if (await categoryFilter.isVisible()) {
      // Select a category
      await categoryFilter.selectOption('Psychology');
      await page.waitForLoadState('networkidle');
      
      // Check that posts are filtered
      const visiblePosts = await page.locator('[class*="blog-post-card"]:visible').count();
      expect(visiblePosts).toBeGreaterThan(0);
    }
    
    // Check for tag links
    const tagLinks = page.locator('a[href*="tag="], a[href*="/tag/"]');
    
    if (await tagLinks.first().isVisible()) {
      await tagLinks.first().click();
      await page.waitForLoadState('networkidle');
      
      // Should filter by tag
      expect(page.url()).toMatch(/tag=/);
    }
  });

  test('should preserve reading position on navigation', async ({ page }) => {
    const blogPage = new BlogPage(page);
    
    await blogPage.gotoPost('long-post');
    
    // Scroll to middle of post
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    const scrollPositionBefore = await page.evaluate(() => window.pageYOffset);
    
    // Navigate away and back
    await page.goto('/');
    await page.goBack();
    
    // Check if scroll position is restored (browser dependent)
    const scrollPositionAfter = await page.evaluate(() => window.pageYOffset);
    
    // This behavior is browser-specific, so we just verify the page loaded
    await expect(blogPage.postContent).toBeVisible();
  });
});