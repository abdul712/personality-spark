#!/usr/bin/env node

const { SingleArticleProcessor } = require('./scripts/single-article-update.js');

async function testSingleArticle() {
  console.log('🧪 Testing Single Article Update Script');
  console.log('=====================================\n');
  
  const processor = new SingleArticleProcessor();
  
  try {
    // Test with first Batch 2 article
    const articleId = 'signs-your-twin-flame-misses-you';
    console.log(`Testing with: ${articleId}\n`);
    
    const result = await processor.processArticle(articleId);
    
    if (result.success) {
      console.log('\n✅ TEST PASSED!');
      console.log(`📊 Summary: ${JSON.stringify(result.summary, null, 2)}`);
    } else {
      console.log('\n❌ TEST FAILED!');
      console.log(`Error: ${result.error}`);
    }
    
    return result;
  } catch (error) {
    console.error('\n❌ TEST CRASHED!');
    console.error(`Fatal error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

if (require.main === module) {
  testSingleArticle().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}

module.exports = { testSingleArticle };