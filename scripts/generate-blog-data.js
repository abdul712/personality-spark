const https = require('https');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

// Function to fetch XML content
function fetchXML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// Function to parse XML
async function parseXML(xmlData) {
  const parser = new xml2js.Parser();
  return parser.parseStringPromise(xmlData);
}

// Function to generate excerpt from slug
function generateExcerpt(slug) {
  const title = slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
  
  return `Discover the meaning and psychology behind ${title.toLowerCase()}. This insightful article explores the various interpretations, body language cues, and relationship dynamics...`;
}

// Function to generate title from slug
function generateTitle(slug) {
  return slug
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Main function
async function generateBlogData() {
  try {
    console.log('Fetching sitemap index...');
    const sitemapIndexXML = await fetchXML('https://personalityspark.com/sitemap-index.xml');
    const sitemapIndex = await parseXML(sitemapIndexXML);
    
    const sitemapUrls = sitemapIndex.sitemapindex.sitemap.map(s => s.loc[0]);
    console.log(`Found ${sitemapUrls.length} sitemaps`);
    
    const allPosts = [];
    
    // Process each sitemap
    for (const sitemapUrl of sitemapUrls) {
      console.log(`Processing ${sitemapUrl}...`);
      const sitemapXML = await fetchXML(sitemapUrl);
      const sitemap = await parseXML(sitemapXML);
      
      if (sitemap.urlset && sitemap.urlset.url) {
        for (const url of sitemap.urlset.url) {
          const loc = url.loc[0];
          
          // Skip non-article URLs
          if (loc.includes('/quiz/') || 
              loc === 'https://personalityspark.com/' ||
              loc.includes('/quiz-list') ||
              loc.includes('/blog') ||
              loc.includes('/privacy-policy') ||
              loc.includes('/terms-of-service')) {
            continue;
          }
          
          // Extract slug from URL
          const slug = loc.replace('https://personalityspark.com/', '');
          
          // Create post object
          const post = {
            id: slug,
            slug: slug,
            title: generateTitle(slug),
            excerpt: generateExcerpt(slug),
            date: new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            readTime: `${Math.floor(Math.random() * 10) + 5} min read`,
            content: `<p>Content for ${generateTitle(slug)} will be loaded dynamically.</p>`
          };
          
          allPosts.push(post);
        }
      }
    }
    
    console.log(`Total articles found: ${allPosts.length}`);
    
    // Sort posts alphabetically by title
    allPosts.sort((a, b) => a.title.localeCompare(b.title));
    
    // Create blog data object
    const blogData = {
      posts: allPosts,
      total: allPosts.length,
      generated: new Date().toISOString()
    };
    
    // Write to file
    const outputPath = path.join(__dirname, '../apps/web/react-app/public/blog-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(blogData, null, 2));
    
    console.log(`Successfully generated blog-data.json with ${allPosts.length} articles`);
    console.log(`File saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('Error generating blog data:', error);
  }
}

// Run the script
generateBlogData();