#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Updating sitemap with new URL structure...\n');

try {
  // Run the generate-sitemap script
  const scriptPath = path.join(__dirname, 'generate-sitemap.js');
  execSync(`node "${scriptPath}"`, { stdio: 'inherit' });
  
  console.log('\n✅ Sitemap updated successfully!');
  console.log('\n📍 Next steps:');
  console.log('1. Commit and push the updated sitemap files');
  console.log('2. The changes will be automatically deployed via Cloudflare');
  console.log('3. Submit the updated sitemap to Google Search Console');
  console.log('4. Set up 301 redirects from /blog/* to /* URLs (if needed)');
} catch (error) {
  console.error('❌ Error updating sitemap:', error.message);
  process.exit(1);
}