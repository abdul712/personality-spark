#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'https://personalityspark.com';
const OUTPUT_DIR = path.join(__dirname, '..', 'personality-spark-api', 'public');
const BLOG_DATA_PATH = path.join(OUTPUT_DIR, 'blog-data.json');
const MAX_URLS_PER_SITEMAP = 200; // Google recommends max 50,000 but we'll use 200 for better organization

// Priority and changefreq values for different page types
const PAGE_CONFIG = {
  home: { priority: 1.0, changefreq: 'weekly' },
  quizList: { priority: 0.9, changefreq: 'weekly' },
  blogList: { priority: 0.8, changefreq: 'daily' },
  blog: { priority: 0.7, changefreq: 'monthly' },
  legal: { priority: 0.3, changefreq: 'yearly' },
  quiz: { priority: 0.8, changefreq: 'weekly' }
};

// Static pages to include in the sitemap
const STATIC_PAGES = [
  { loc: '/', ...PAGE_CONFIG.home },
  { loc: '/quiz-list', ...PAGE_CONFIG.quizList },
  { loc: '/blog', ...PAGE_CONFIG.blogList },
  { loc: '/privacy-policy', ...PAGE_CONFIG.legal },
  { loc: '/terms-of-service', ...PAGE_CONFIG.legal },
  { loc: '/quiz/personality-test', ...PAGE_CONFIG.quiz },
  { loc: '/quiz/compatibility-test', ...PAGE_CONFIG.quiz },
  { loc: '/quiz/career-quiz', ...PAGE_CONFIG.quiz },
  { loc: '/quiz/love-language-quiz', ...PAGE_CONFIG.quiz },
  { loc: '/quiz/stress-test', ...PAGE_CONFIG.quiz }
];

// XML namespace for sitemaps
const SITEMAP_NAMESPACE = 'http://www.sitemaps.org/schemas/sitemap/0.9';

/**
 * Escape XML special characters
 */
function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Format date to W3C datetime format (YYYY-MM-DD)
 */
function formatDate(date) {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

/**
 * Generate XML for a single URL entry
 */
function generateUrlEntry(url) {
  const loc = url.loc.startsWith('http') ? url.loc : `${BASE_URL}${url.loc}`;
  let xml = '  <url>\n';
  xml += `    <loc>${escapeXml(loc)}</loc>\n`;
  
  if (url.lastmod) {
    xml += `    <lastmod>${formatDate(url.lastmod)}</lastmod>\n`;
  }
  
  if (url.changefreq) {
    xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
  }
  
  if (url.priority !== undefined) {
    xml += `    <priority>${url.priority}</priority>\n`;
  }
  
  xml += '  </url>\n';
  return xml;
}

/**
 * Generate a sitemap XML file
 */
function generateSitemap(urls, filename) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += `<urlset xmlns="${SITEMAP_NAMESPACE}">\n`;
  
  urls.forEach(url => {
    xml += generateUrlEntry(url);
  });
  
  xml += '</urlset>';
  
  const filePath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filePath, xml, 'utf8');
  console.log(`✓ Generated ${filename} with ${urls.length} URLs`);
  
  return filename;
}

/**
 * Generate sitemap index XML file
 */
function generateSitemapIndex(sitemapFiles) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  sitemapFiles.forEach(file => {
    xml += '  <sitemap>\n';
    xml += `    <loc>${BASE_URL}/${file}</loc>\n`;
    xml += `    <lastmod>${formatDate(new Date())}</lastmod>\n`;
    xml += '  </sitemap>\n';
  });
  
  xml += '</sitemapindex>';
  
  const filePath = path.join(OUTPUT_DIR, 'sitemap-index.xml');
  fs.writeFileSync(filePath, xml, 'utf8');
  console.log(`✓ Generated sitemap-index.xml with ${sitemapFiles.length} sitemaps`);
}

/**
 * Load blog data and generate blog URLs
 */
function loadBlogUrls() {
  try {
    const blogData = JSON.parse(fs.readFileSync(BLOG_DATA_PATH, 'utf8'));
    console.log(`✓ Loaded ${blogData.posts.length} blog posts`);
    
    return blogData.posts.map(post => ({
      loc: `/${post.slug}`,
      lastmod: post.date || new Date().toISOString(),
      ...PAGE_CONFIG.blog
    }));
  } catch (error) {
    console.error('Error loading blog data:', error);
    return [];
  }
}

/**
 * Split URLs into chunks for multiple sitemaps
 */
function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Main function to generate all sitemaps
 */
function generateAllSitemaps() {
  console.log('🚀 Starting sitemap generation...\n');
  
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Load all URLs
  const blogUrls = loadBlogUrls();
  const allUrls = [...STATIC_PAGES, ...blogUrls];
  
  console.log(`\n📊 Total URLs to include: ${allUrls.length}`);
  console.log(`   - Static pages: ${STATIC_PAGES.length}`);
  console.log(`   - Blog posts: ${blogUrls.length}\n`);
  
  // Split URLs into chunks
  const urlChunks = chunkArray(allUrls, MAX_URLS_PER_SITEMAP);
  const sitemapFiles = [];
  
  // Generate individual sitemaps
  urlChunks.forEach((chunk, index) => {
    const filename = `sitemap-${index + 1}.xml`;
    generateSitemap(chunk, filename);
    sitemapFiles.push(filename);
  });
  
  // Generate sitemap index
  console.log('');
  generateSitemapIndex(sitemapFiles);
  
  // Generate robots.txt entry
  const robotsContent = `
# Sitemap location
Sitemap: ${BASE_URL}/sitemap-index.xml
`;
  
  console.log('\n📝 Add the following to your robots.txt file:');
  console.log(robotsContent);
  
  console.log('\n✅ Sitemap generation complete!');
  console.log(`\n📍 Sitemap files location: ${OUTPUT_DIR}`);
  console.log(`\n🔗 Submit this URL to Google Search Console: ${BASE_URL}/sitemap-index.xml`);
}

// Run the script
try {
  generateAllSitemaps();
} catch (error) {
  console.error('❌ Error generating sitemaps:', error);
  process.exit(1);
}