#!/usr/bin/env node

/**
 * Batch Article Processing System
 * 
 * Processes multiple articles in sequence for the blog content enhancement project.
 * This script helps process the remaining 2,525 articles efficiently.
 * 
 * Usage: node scripts/batch-processor.js [start-number] [count]
 * Example: node scripts/batch-processor.js 1 50
 */

const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

/**
 * Get all article IDs from the main blog data file
 */
async function getAllArticleIds() {
    try {
        const mainDataPath = 'backend/data/blog-articles.json';
        const data = JSON.parse(await fs.readFile(mainDataPath, 'utf8'));
        
        if (!data.posts || !Array.isArray(data.posts)) {
            throw new Error('Invalid blog data structure');
        }
        
        return data.posts.map(post => post.id || post.slug).filter(Boolean);
    } catch (error) {
        console.error('Error loading article IDs:', error.message);
        process.exit(1);
    }
}

/**
 * Run single article update script
 */
function processSingleArticle(articleId) {
    return new Promise((resolve, reject) => {
        const child = spawn('node', ['scripts/single-article-update.js', articleId], {
            cwd: process.cwd(),
            stdio: 'inherit'
        });
        
        child.on('close', (code) => {
            if (code === 0) {
                resolve(articleId);
            } else {
                reject(new Error(`Article ${articleId} failed with code ${code}`));
            }
        });
        
        child.on('error', (error) => {
            reject(error);
        });
    });
}

/**
 * Process articles in batches
 */
async function processBatch(articleIds, startIndex, count) {
    const batch = articleIds.slice(startIndex - 1, startIndex - 1 + count);
    const results = {
        successful: [],
        failed: []
    };
    
    console.log(`🚀 Processing batch of ${batch.length} articles...`);
    console.log(`📊 Range: ${startIndex} to ${startIndex + batch.length - 1}`);
    console.log('═'.repeat(60));
    
    const startTime = Date.now();
    
    for (let i = 0; i < batch.length; i++) {
        const articleId = batch[i];
        const articleNumber = startIndex + i;
        
        try {
            console.log(`\n[${articleNumber}/${articleIds.length}] Processing: ${articleId}`);
            await processSingleArticle(articleId);
            results.successful.push(articleId);
            console.log(`✅ Completed: ${articleId}`);
        } catch (error) {
            results.failed.push({ articleId, error: error.message });
            console.error(`❌ Failed: ${articleId} - ${error.message}`);
        }
    }
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log('\n' + '═'.repeat(60));
    console.log('📊 BATCH SUMMARY');
    console.log(`✅ Successful: ${results.successful.length}/${batch.length}`);
    console.log(`❌ Failed: ${results.failed.length}/${batch.length}`);
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log(`📈 Rate: ${Math.round(batch.length / (duration / 60))} articles/minute`);
    
    if (results.failed.length > 0) {
        console.log('\n❌ Failed Articles:');
        results.failed.forEach(({ articleId, error }) => {
            console.log(`   - ${articleId}: ${error}`);
        });
    }
    
    return results;
}

/**
 * Generate progress report
 */
async function generateProgressReport(totalArticles, processed, successful, failed) {
    const progress = ((processed / totalArticles) * 100).toFixed(2);
    const remaining = totalArticles - processed;
    const estimatedBatches = Math.ceil(remaining / 10);
    
    const report = `
# Blog Content Enhancement Progress Report

## Current Status
- **Total Articles**: ${totalArticles}
- **Processed**: ${processed} (${progress}%)
- **Successful**: ${successful}
- **Failed**: ${failed}
- **Remaining**: ${remaining}

## Estimates
- **Remaining Batches** (10 articles each): ${estimatedBatches}
- **Estimated Time** (2-3 min per article): ${Math.round(remaining * 2.5 / 60)} hours

## Next Steps
1. Continue processing in batches of 10-50 articles
2. Monitor for failed articles and retry if needed
3. Commit and push updates regularly
4. Track progress in blog-update-tracker.md

Generated: ${new Date().toISOString()}
`;
    
    await fs.writeFile('batch-progress-report.md', report, 'utf8');
    console.log('\n📄 Progress report saved to: batch-progress-report.md');
}

/**
 * Main execution function
 */
async function main() {
    const startNumber = parseInt(process.argv[2]) || 1;
    const count = parseInt(process.argv[3]) || 10;
    
    if (startNumber < 1 || count < 1) {
        console.error('❌ Error: Start number and count must be positive integers');
        console.log('Usage: node scripts/batch-processor.js [start-number] [count]');
        console.log('Example: node scripts/batch-processor.js 1 50');
        process.exit(1);
    }
    
    console.log('🔍 Loading all article IDs...');
    const allArticleIds = await getAllArticleIds();
    console.log(`📚 Found ${allArticleIds.length} total articles`);
    
    if (startNumber > allArticleIds.length) {
        console.error(`❌ Error: Start number ${startNumber} exceeds total articles ${allArticleIds.length}`);
        process.exit(1);
    }
    
    const actualCount = Math.min(count, allArticleIds.length - startNumber + 1);
    console.log(`📝 Will process ${actualCount} articles starting from position ${startNumber}`);
    
    try {
        const results = await processBatch(allArticleIds, startNumber, actualCount);
        
        // Generate progress report
        const totalProcessed = startNumber + actualCount - 1;
        await generateProgressReport(
            allArticleIds.length,
            totalProcessed,
            results.successful.length,
            results.failed.length
        );
        
        console.log('\n🎉 Batch processing completed!');
        console.log(`💡 To continue, run: node scripts/batch-processor.js ${startNumber + actualCount} ${count}`);
        
    } catch (error) {
        console.error('\n❌ Fatal error during batch processing:', error.message);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = {
    getAllArticleIds,
    processBatch,
    generateProgressReport
};