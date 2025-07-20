const fs = require('fs');
const path = require('path');

// Function to generate sitemap XML
function generateSitemap(posts) {
  const baseUrl = 'https://personalityspark.com';
  const currentDate = new Date().toISOString().split('T')[0];
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Add homepage
  xml += '  <url>\n';
  xml += `    <loc>${baseUrl}/</loc>\n`;
  xml += `    <lastmod>${currentDate}</lastmod>\n`;
  xml += '    <changefreq>daily</changefreq>\n';
  xml += '    <priority>1.0</priority>\n';
  xml += '  </url>\n';
  
  // Add blog listing page
  xml += '  <url>\n';
  xml += `    <loc>${baseUrl}/blog</loc>\n`;
  xml += `    <lastmod>${currentDate}</lastmod>\n`;
  xml += '    <changefreq>daily</changefreq>\n';
  xml += '    <priority>0.9</priority>\n';
  xml += '  </url>\n';
  
  // Add all blog posts
  posts.forEach(post => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
  });
  
  // Add other static pages
  const staticPages = ['about', 'privacy', 'terms'];
  staticPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/${page}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.5</priority>\n';
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  
  return xml;
}

// Main function
function main() {
  const blogDataPath = '/Users/abdulrahim/GitHub Projects/personality-spark/personality-spark-api/public/blog-data.json';
  const sitemapPath = '/Users/abdulrahim/GitHub Projects/personality-spark/personality-spark-api/public/sitemap.xml';
  
  // Read blog data
  const blogData = JSON.parse(fs.readFileSync(blogDataPath, 'utf8'));
  console.log(`Found ${blogData.posts.length} articles`);
  
  // Generate sitemap
  const sitemap = generateSitemap(blogData.posts);
  
  // Write sitemap
  fs.writeFileSync(sitemapPath, sitemap);
  console.log(`Sitemap updated with ${blogData.posts.length + 5} URLs`);
  console.log(`Sitemap saved to: ${sitemapPath}`);
}

// Run the script
main();