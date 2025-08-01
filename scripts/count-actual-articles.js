const https = require('https');
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

// Main function
async function countActualArticles() {
  try {
    console.log('Fetching sitemap index...');
    const sitemapIndexXML = await fetchXML('https://personalityspark.com/sitemap-index.xml');
    const sitemapIndex = await parseXML(sitemapIndexXML);
    
    const sitemapUrls = sitemapIndex.sitemapindex.sitemap.map(s => s.loc[0]);
    console.log(`Found ${sitemapUrls.length} sitemaps\n`);
    
    let totalArticles = 0;
    let articlesByType = {};
    
    // Process each sitemap
    for (const sitemapUrl of sitemapUrls) {
      console.log(`Processing ${sitemapUrl}...`);
      const sitemapXML = await fetchXML(sitemapUrl);
      const sitemap = await parseXML(sitemapXML);
      
      let sitemapArticles = 0;
      
      if (sitemap.urlset && sitemap.urlset.url) {
        for (const url of sitemap.urlset.url) {
          const loc = url.loc[0];
          
          // Skip non-article URLs
          if (loc.includes('/quiz/') || 
              loc === 'https://personalityspark.com/' ||
              loc.includes('/quiz-list') ||
              loc.includes('/blog') ||
              loc.includes('/privacy-policy') ||
              loc.includes('/terms-of-service') ||
              loc.includes('/about') ||
              loc.includes('/contact')) {
            continue;
          }
          
          // Extract slug to categorize
          const slug = loc.replace('https://personalityspark.com/', '');
          
          // Categorize by content type
          let category = 'general';
          if (slug.includes('what-does-it-mean')) {
            category = 'what-does-it-mean';
          } else if (slug.includes('how-to')) {
            category = 'how-to';
          } else if (slug.includes('why')) {
            category = 'why';
          } else if (slug.includes('when')) {
            category = 'when';
          }
          
          articlesByType[category] = (articlesByType[category] || 0) + 1;
          sitemapArticles++;
          totalArticles++;
        }
      }
      
      console.log(`  Found ${sitemapArticles} articles`);
    }
    
    console.log('\n=== FINAL COUNT ===');
    console.log(`Total articles in sitemap: ${totalArticles}`);
    console.log('\nBreakdown by type:');
    Object.entries(articlesByType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    
    // Check what we have in blog data
    const fs = require('fs');
    const path = require('path');
    const indexPath = path.join(__dirname, '../apps/web/react-app/public/blog-index.json');
    
    if (fs.existsSync(indexPath)) {
      const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
      console.log(`\nCurrent blog-index.json shows: ${indexData.totalPosts} posts`);
      
      if (totalArticles > indexData.totalPosts) {
        console.log(`\nMISSING: ${totalArticles - indexData.totalPosts} articles!`);
      } else if (totalArticles < indexData.totalPosts) {
        console.log(`\nEXTRA: ${indexData.totalPosts - totalArticles} articles in blog data that aren't in sitemap`);
      } else {
        console.log('\n✓ Article count matches!');
      }
    }
    
  } catch (error) {
    console.error('Error counting articles:', error);
  }
}

// Run the script
countActualArticles();