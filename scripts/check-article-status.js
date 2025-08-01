#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Article Content Analysis Report\n');

// Files to check
const filesToCheck = [
  'apps/web/react-app/public/blog-data-1.json',
  'apps/web/react-app/public/blog-data-2.json', 
  'apps/web/react-app/public/blog-data-3.json',
  'apps/web/react-app/public/blog-data-4.json',
  'apps/web/react-app/public/blog-data-5.json',
  'apps/web/react-app/public/blog-data-6.json'
];

let totalArticles = 0;
let updatedArticles = 0;
let genericArticles = 0;

// Reference: Updated 1331 article characteristics
const updatedCharacteristics = {
  minLength: 1500, // Updated articles should be longer
  minReadTime: 6,  // Updated articles should be 6+ minutes
  hasSpecificContent: true // Should have specific, not generic content
};

console.log('Analyzing articles across all data files...\n');

for (const filePath of filesToCheck) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    continue;
  }
  
  console.log(`📄 Analyzing ${filePath}...`);
  
  try {
    const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    const posts = data.posts || [];
    
    let fileUpdated = 0;
    let fileGeneric = 0;
    
    for (const post of posts) {
      totalArticles++;
      
      // Check if article appears to be updated (like 1331 article)
      const contentLength = post.content ? post.content.length : 0;
      const readTimeMatch = post.readTime ? post.readTime.match(/(\d+)/) : null;
      const readTimeMinutes = readTimeMatch ? parseInt(readTimeMatch[1]) : 0;
      
      // Check for generic template indicators
      const hasGenericContent = post.content && (
        post.content.includes('Key Points') ||
        post.content.includes('Understanding ' + post.title.toLowerCase() + ' requires looking at several important factors') ||
        post.content.includes('Core Concepts</strong>: The fundamental principles that define this topic') ||
        post.content.includes('is an important topic that many people are curious about')
      );
      
      // Check for comprehensive content (like 1331 article)
      const hasComprehensiveContent = post.content && (
        contentLength > 1500 &&
        readTimeMinutes >= 6 &&
        !hasGenericContent &&
        post.content.includes('<h2') && // Has proper headings
        post.content.includes('<ul') && // Has lists
        post.content.length > post.excerpt.length * 10 // Much longer than excerpt
      );
      
      if (hasComprehensiveContent) {
        updatedArticles++;
        fileUpdated++;
      } else if (hasGenericContent) {
        genericArticles++;
        fileGeneric++;
      }
    }
    
    console.log(`  📊 Total: ${posts.length} articles`);
    console.log(`  ✅ Updated (comprehensive): ${fileUpdated}`);
    console.log(`  ⚠️  Generic templates: ${fileGeneric}`);
    console.log(`  📝 Other/mixed: ${posts.length - fileUpdated - fileGeneric}\n`);
    
  } catch (error) {
    console.log(`  ❌ Error reading file: ${error.message}\n`);
  }
}

// Summary report
console.log('📈 OVERALL SUMMARY');
console.log('==================');
console.log(`📊 Total Articles Analyzed: ${totalArticles}`);
console.log(`✅ Updated Articles (Research-based): ${updatedArticles} (${((updatedArticles/totalArticles)*100).toFixed(1)}%)`);
console.log(`⚠️  Generic Template Articles: ${genericArticles} (${((genericArticles/totalArticles)*100).toFixed(1)}%)`);
console.log(`📝 Other/Mixed Content: ${totalArticles - updatedArticles - genericArticles} (${(((totalArticles - updatedArticles - genericArticles)/totalArticles)*100).toFixed(1)}%)`);

console.log('\n🎯 PROGRESS ASSESSMENT');
console.log('======================');

if (updatedArticles === 0) {
  console.log('❌ No articles have been updated with comprehensive content yet');
  console.log('📋 Action needed: Begin batch processing to update generic templates');
} else if (updatedArticles < 100) {
  console.log('🟡 Initial progress - few articles updated');
  console.log('📋 Action needed: Scale up batch processing for remaining articles');
} else if (updatedArticles < totalArticles * 0.5) {
  console.log('🟠 Moderate progress - less than 50% complete');
  console.log('📋 Action needed: Continue batch processing at current pace');
} else if (updatedArticles < totalArticles * 0.9) {
  console.log('🟢 Good progress - majority of articles updated');
  console.log('📋 Action needed: Focus on completing remaining articles');
} else {
  console.log('🎉 Excellent progress - most articles have been updated!');
  console.log('📋 Action needed: Final quality review and validation');
}

// Show sample of articles that need updating
if (genericArticles > 0) {
  console.log('\n🔧 NEXT STEPS RECOMMENDATION');
  console.log('============================');
  console.log('1. Create batch processing scripts for remaining generic articles');
  console.log('2. Use the successful 1331 article as a template for quality standards');
  console.log('3. Focus on high-traffic topics first (angel numbers, twin flames, personality)');
  console.log('4. Implement proper SEO with external and internal links');
  console.log('5. Run this script regularly to track progress');
}

console.log('\n💡 To run this check again: node scripts/check-article-status.js');