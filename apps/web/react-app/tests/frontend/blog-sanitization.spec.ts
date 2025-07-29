import { test, expect } from '@playwright/test';
import { BlogPage } from '../pages/BlogPage';

test.describe('Blog Content Sanitization Tests', () => {
  test('should sanitize malicious HTML in blog posts', async ({ page }) => {
    const blogPage = new BlogPage(page);
    
    // Mock blog post with malicious content
    await page.route('**/data/blog/posts/malicious-post.json', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          title: 'Test Post<script>alert("XSS")</script>',
          content: `
            <h2>Normal heading</h2>
            <p>Some text with <script>alert("XSS")</script> embedded script.</p>
            <img src="x" onerror="alert('XSS')">
            <a href="javascript:alert('XSS')">Malicious Link</a>
            <div onclick="alert('XSS')">Click me</div>
            <iframe src="http://evil.com"></iframe>
            <object data="http://evil.com"></object>
            <embed src="http://evil.com">
            <style>body { display: none; }</style>
          `,
          date: '2024-01-01',
          author: 'Test Author'
        })
      });
    });

    await blogPage.gotoPost('malicious-post');
    
    // Get the rendered content
    const content = await blogPage.getPostContentHTML();
    
    // Check that dangerous elements are removed
    expect(content).not.toContain('<script>');
    expect(content).not.toContain('onerror=');
    expect(content).not.toContain('javascript:');
    expect(content).not.toContain('onclick=');
    expect(content).not.toContain('<iframe');
    expect(content).not.toContain('<object');
    expect(content).not.toContain('<embed');
    expect(content).not.toContain('<style>');
    
    // Check that safe content is preserved
    expect(content).toContain('Normal heading');
    expect(content).toContain('Some text with');
  });

  test('should sanitize blog list previews', async ({ page }) => {
    await page.route('**/data/blog/posts.json', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            slug: 'test-post',
            title: 'Test<script>alert("XSS")</script> Post',
            excerpt: 'Preview with <img src=x onerror=alert("XSS")> image',
            date: '2024-01-01',
            readTime: '5 min'
          }
        ])
      });
    });

    const blogPage = new BlogPage(page);
    await blogPage.goto();
    await blogPage.waitForPostsToLoad();
    
    // Check that list items are sanitized
    const postCards = await page.locator('[class*="blog-post-card"]').all();
    
    for (const card of postCards) {
      const cardHTML = await card.innerHTML();
      expect(cardHTML).not.toContain('<script>');
      expect(cardHTML).not.toContain('onerror=');
      expect(cardHTML).toContain('Test'); // Safe content preserved
      expect(cardHTML).toContain('Preview with'); // Safe content preserved
    }
  });

  test('should handle data: URLs safely', async ({ page }) => {
    await page.route('**/data/blog/posts/data-url-post.json', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          title: 'Data URL Test',
          content: `
            <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxzY3JpcHQ+YWxlcnQoJ1hTUycpPC9zY3JpcHQ+PC9zdmc+">
            <img src="data:text/html,<script>alert('XSS')</script>">
            <a href="data:text/html,<script>alert('XSS')</script>">Data Link</a>
          `,
          date: '2024-01-01'
        })
      });
    });

    const blogPage = new BlogPage(page);
    await blogPage.gotoPost('data-url-post');
    
    const content = await blogPage.getPostContentHTML();
    
    // Data URLs with potentially dangerous content should be blocked
    expect(content).not.toContain('data:text/html');
    expect(content).not.toContain('data:image/svg+xml');
  });

  test('should preserve safe HTML formatting', async ({ page }) => {
    await page.route('**/data/blog/posts/safe-post.json', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          title: 'Safe Formatting Test',
          content: `
            <h1>Main Heading</h1>
            <h2>Subheading</h2>
            <p>Regular paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
            <ul>
              <li>List item 1</li>
              <li>List item 2</li>
            </ul>
            <blockquote>A nice quote</blockquote>
            <pre><code>console.log('Hello');</code></pre>
            <a href="/about" target="_blank" rel="noopener">Safe Link</a>
            <img src="/images/safe.jpg" alt="Safe Image">
          `,
          date: '2024-01-01'
        })
      });
    });

    const blogPage = new BlogPage(page);
    await blogPage.gotoPost('safe-post');
    
    const content = await blogPage.getPostContentHTML();
    
    // Check that safe HTML is preserved
    expect(content).toContain('<h1>Main Heading</h1>');
    expect(content).toContain('<strong>bold</strong>');
    expect(content).toContain('<em>italic</em>');
    expect(content).toContain('<ul>');
    expect(content).toContain('<li>List item 1</li>');
    expect(content).toContain('<blockquote>');
    expect(content).toContain('<code>console.log');
    expect(content).toContain('href="/about"');
    expect(content).toContain('alt="Safe Image"');
  });

  test('should handle markdown content safely', async ({ page }) => {
    await page.route('**/data/blog/posts/markdown-post.json', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          title: 'Markdown Test',
          content: `
# Heading with <script>alert('XSS')</script>

Regular text with **bold** and *italic*.

[Link](javascript:alert('XSS'))

![Image](x" onerror="alert('XSS'))

\`\`\`javascript
console.log('Safe code');
<script>alert('XSS in code block')</script>
\`\`\`
          `,
          format: 'markdown',
          date: '2024-01-01'
        })
      });
    });

    const blogPage = new BlogPage(page);
    await blogPage.gotoPost('markdown-post');
    
    const content = await blogPage.getPostContentHTML();
    
    // Check that markdown is rendered safely
    expect(content).not.toContain('<script>');
    expect(content).not.toContain('javascript:');
    expect(content).not.toContain('onerror=');
    
    // Code blocks should escape HTML
    expect(content).toContain('&lt;script&gt;');
    
    // Check that safe markdown is rendered
    expect(content).toContain('<strong>bold</strong>');
    expect(content).toContain('<em>italic</em>');
  });

  test('should limit resource loading', async ({ page }) => {
    let externalRequests: string[] = [];
    
    page.on('request', request => {
      const url = request.url();
      if (!url.startsWith('http://localhost') && !url.startsWith('file://')) {
        externalRequests.push(url);
      }
    });

    await page.route('**/data/blog/posts/external-resources.json', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          title: 'External Resources Test',
          content: `
            <img src="https://external-site.com/tracker.gif">
            <link rel="stylesheet" href="https://external-site.com/malicious.css">
            <script src="https://external-site.com/malicious.js"></script>
          `,
          date: '2024-01-01'
        })
      });
    });

    const blogPage = new BlogPage(page);
    await blogPage.gotoPost('external-resources');
    await page.waitForTimeout(2000);
    
    // Check that external resources were not loaded
    const maliciousRequests = externalRequests.filter(url => 
      url.includes('external-site.com')
    );
    
    expect(maliciousRequests.length).toBe(0);
  });

  test('should handle HTML entities properly', async ({ page }) => {
    await page.route('**/data/blog/posts/entities-post.json', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          title: 'HTML Entities & Special Characters',
          content: `
            <p>Less than: &lt; Greater than: &gt;</p>
            <p>Ampersand: &amp; Quote: &quot;</p>
            <p>Copyright: &copy; Trademark: &trade;</p>
            <p>User input: &lt;script&gt;alert('XSS')&lt;/script&gt;</p>
          `,
          date: '2024-01-01'
        })
      });
    });

    const blogPage = new BlogPage(page);
    await blogPage.gotoPost('entities-post');
    
    // Check that entities are displayed correctly
    await expect(page.locator('text=Less than: < Greater than: >')).toBeVisible();
    await expect(page.locator('text=Ampersand: & Quote: "')).toBeVisible();
    await expect(page.locator('text=Copyright: © Trademark: ™')).toBeVisible();
    
    // Check that escaped script tags remain escaped
    const content = await blogPage.getPostContentHTML();
    expect(content).toContain('&lt;script&gt;');
    expect(content).not.toContain('<script>alert');
  });
});