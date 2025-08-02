#!/usr/bin/env node

const { SingleArticleProcessor } = require('./scripts/single-article-update.js');

async function processBatch2() {
  console.log('🚀 Processing Batch 2 Articles');
  console.log('================================\n');
  
  const processor = new SingleArticleProcessor();
  
  // Process all Batch 2 articles
  const result = await processor.processBatch2Articles();
  
  return result;
}

if (require.main === module) {
  processBatch2().then(results => {
    const successful = results.filter(r => r.success).length;
    console.log(`\n🎉 BATCH 2 COMPLETE: ${successful}/${results.length} articles processed successfully`);
    process.exit(successful === results.length ? 0 : 1);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { processBatch2 };