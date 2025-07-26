#!/usr/bin/env node

// Script to purge Cloudflare cache for blog data files
// This ensures the new chunked files are served immediately

const files = [
  'https://personalityspark.com/blog-index.json',
  'https://personalityspark.com/blog-data-1.json',
  'https://personalityspark.com/blog-data-2.json', 
  'https://personalityspark.com/blog-data-3.json',
  'https://personalityspark.com/blog-data-4.json',
  'https://personalityspark.com/blog-data.json' // Also purge the old file
];

console.log('Cloudflare Cache Purge Instructions:');
console.log('=====================================\n');
console.log('Since we cannot access Cloudflare API tokens directly, please manually purge the cache:');
console.log('\n1. Go to Cloudflare Dashboard');
console.log('2. Select your domain: personalityspark.com');
console.log('3. Navigate to Caching > Configuration');
console.log('4. Click "Purge Cache"');
console.log('5. Select "Custom Purge"');
console.log('6. Enter these URLs one by one:\n');

files.forEach(file => {
  console.log(`   ${file}`);
});

console.log('\nAlternatively, you can purge everything (not recommended for production):');
console.log('- Click "Purge Everything" instead of "Custom Purge"\n');

console.log('The deployment has been pushed to GitHub and should rebuild automatically.');
console.log('After cache purge, the blog should show all 1718 articles.');