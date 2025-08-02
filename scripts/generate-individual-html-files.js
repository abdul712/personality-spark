#!/usr/bin/env node

/**
 * Generate Individual HTML Files for All Articles
 * 
 * This script reads all the processed articles from JSON files and creates
 * individual HTML files for each of the 2,535 articles.
 */

const fs = require('fs').promises;
const path = require('path');

// All JSON files containing article data
const BLOG_DATA_FILES = [
    'backend/data/blog-articles.json',
    'apps/web/react-app/public/blog-data.json',
    'apps/web/react-app/public/blog-data-1.json',
    'apps/web/react-app/public/blog-data-2.json',
    'apps/web/react-app/public/blog-data-3.json',
    'apps/web/react-app/public/blog-data-4.json',
    'apps/web/react-app/public/blog-data-5.json',
    'apps/web/react-app/public/blog-data-6.json',
    'personality-spark-api/public/blog-data.json',
    'personality-spark-api/public/blog-data-1.json',
    'personality-spark-api/public/blog-data-2.json',
    'personality-spark-api/public/blog-data-3.json',
    'personality-spark-api/public/blog-data-4.json',
    'personality-spark-api/public/blog-data-5.json',
    'personality-spark-api/public/blog-data-6.json'
];

/**
 * Create HTML template for article
 */
function createHTMLTemplate(article) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article.title} | PersonalitySpark</title>
    <meta name="description" content="${article.excerpt || article.title}">
    <meta name="keywords" content="${article.tags ? article.tags.join(', ') : ''}">
    <meta property="og:title" content="${article.title}">
    <meta property="og:description" content="${article.excerpt || article.title}">
    <meta property="og:type" content="article">
    <link rel="canonical" href="https://personalityspark.com/${article.slug}.html">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #e74c3c;
            padding-bottom: 10px;
        }
        h2, h3, h4 {
            color: #34495e;
            margin-top: 30px;
        }
        .meta {
            color: #7f8c8d;
            font-size: 14px;
            margin-bottom: 20px;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 5px;
        }
        .content {
            margin-top: 20px;
        }
        .tags {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
        .tag {
            display: inline-block;
            background: #3498db;
            color: white;
            padding: 5px 10px;
            margin-right: 5px;
            border-radius: 3px;
            text-decoration: none;
            font-size: 12px;
        }
        a {
            color: #3498db;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        blockquote {
            border-left: 4px solid #3498db;
            margin: 20px 0;
            padding-left: 20px;
            font-style: italic;
            color: #666;
        }
    </style>
</head>
<body>
    <header>
        <h1>${article.title}</h1>
        <div class="meta">
            <strong>Published:</strong> ${article.date || new Date().toLocaleDateString()}<br>
            <strong>Reading Time:</strong> ${article.readTime || '5 min read'}<br>
            <strong>Category:</strong> ${article.category || 'Psychology'}
        </div>
    </header>
    
    <main class="content">
        ${article.content || article.excerpt || ''}
    </main>
    
    ${article.tags ? `
    <footer class="tags">
        <strong>Tags:</strong>
        ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
    </footer>
    ` : ''}
    
    <nav style="margin-top: 40px; text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
        <a href="/" style="background: #e74c3c; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">← Back to PersonalitySpark</a>
    </nav>
</body>
</html>`;
}

/**
 * Load all articles from JSON files
 */
async function loadAllArticles() {
    const allArticles = new Map();
    let totalProcessed = 0;
    
    console.log('📚 Loading articles from all JSON files...\n');
    
    for (const filePath of BLOG_DATA_FILES) {
        try {
            console.log(`📖 Reading: ${filePath}`);
            const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
            
            if (data.posts && Array.isArray(data.posts)) {
                let fileCount = 0;
                data.posts.forEach(post => {
                    const key = post.id || post.slug;
                    if (key && !allArticles.has(key)) {
                        allArticles.set(key, post);
                        fileCount++;
                    }
                });
                console.log(`   ✅ Found ${fileCount} articles`);
                totalProcessed += fileCount;
            }
        } catch (error) {
            console.log(`   ❌ Error reading ${filePath}: ${error.message}`);
        }
    }
    
    console.log(`\n🎯 Total unique articles loaded: ${allArticles.size}`);
    return Array.from(allArticles.values());
}

/**
 * Generate HTML files for all articles
 */
async function generateHTMLFiles() {
    console.log('🚀 Starting HTML file generation for all articles...\n');
    
    try {
        // Load all articles
        const articles = await loadAllArticles();
        
        if (articles.length === 0) {
            console.log('❌ No articles found to process');
            return;
        }
        
        console.log(`📝 Generating HTML files for ${articles.length} articles...\n`);
        
        let successCount = 0;
        let errorCount = 0;
        
        // Process articles in batches to avoid overwhelming the system
        const batchSize = 50;
        for (let i = 0; i < articles.length; i += batchSize) {
            const batch = articles.slice(i, i + batchSize);
            console.log(`📦 Processing batch ${Math.floor(i/batchSize) + 1} (${i + 1}-${Math.min(i + batchSize, articles.length)})...`);
            
            const promises = batch.map(async (article) => {
                try {
                    const filename = `${article.slug || article.id}.html`;
                    const html = createHTMLTemplate(article);
                    
                    await fs.writeFile(filename, html);
                    return { success: true, filename };
                } catch (error) {
                    return { success: false, error: error.message, article: article.id || article.slug };
                }
            });
            
            const results = await Promise.all(promises);
            
            results.forEach(result => {
                if (result.success) {
                    successCount++;
                } else {
                    errorCount++;
                    console.log(`   ❌ Failed to create ${result.article}: ${result.error}`);
                }
            });
            
            // Show progress
            console.log(`   ✅ Batch completed: ${successCount} success, ${errorCount} errors`);
        }
        
        console.log(`\n🎉 HTML File Generation Complete!`);
        console.log(`📊 Final Results:`);
        console.log(`   ✅ Successfully created: ${successCount} HTML files`);
        console.log(`   ❌ Errors: ${errorCount}`);
        console.log(`   📈 Success rate: ${((successCount / articles.length) * 100).toFixed(2)}%`);
        
        if (successCount > 0) {
            console.log(`\n🌟 All ${successCount} HTML files are now available in the root directory!`);
            console.log(`   You can now access any article as: articlename.html`);
        }
        
    } catch (error) {
        console.error('💥 Fatal error during HTML generation:', error.message);
        process.exit(1);
    }
}

// Main execution
if (require.main === module) {
    generateHTMLFiles();
}

module.exports = { generateHTMLFiles };