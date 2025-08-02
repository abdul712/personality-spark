#!/usr/bin/env node

/**
 * Fix Invalid Slugs and Generate HTML Files
 * 
 * This script identifies articles with invalid slugs (URLs, etc.) and creates
 * proper HTML files for all remaining articles.
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// All JSON files containing article data
const BLOG_DATA_FILES = [
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
 * Check if existing HTML file exists
 */
async function htmlFileExists(filename) {
    try {
        await fs.access(filename);
        return true;
    } catch {
        return false;
    }
}

/**
 * Create a valid filename from invalid slug
 */
function createValidFilename(slug, title, id) {
    // If slug is a URL, extract meaningful part or use title
    if (slug && (slug.startsWith('http') || slug.includes('personalityspark.com'))) {
        // Try to extract meaningful part from URL
        const urlMatch = slug.match(/\/([^\/\?]+)(?:\?|$)/);
        if (urlMatch && urlMatch[1] && urlMatch[1] !== '' && !urlMatch[1].startsWith('p=')) {
            return urlMatch[1].replace(/[^a-z0-9-]/gi, '-').toLowerCase().replace(/-+/g, '-').replace(/^-|-$/g, '');
        }
        
        // If URL has ?p=ID, use title-based filename
        if (slug.includes('?p=')) {
            const titleSlug = title ? 
                title.toLowerCase()
                    .replace(/[^a-z0-9\s]/gi, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '') 
                : '';
            if (titleSlug) {
                return titleSlug;
            }
        }
    }
    
    // If slug is invalid but title exists, create from title
    if (title) {
        const titleSlug = title.toLowerCase()
            .replace(/[^a-z0-9\s]/gi, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        if (titleSlug && titleSlug.length > 0) {
            return titleSlug;
        }
    }
    
    // Last resort: use ID or generate hash
    if (id) {
        return `article-${id}`;
    }
    
    // Generate unique filename based on content hash
    const contentHash = crypto.createHash('md5').update(JSON.stringify({ slug, title, id })).digest('hex').substring(0, 8);
    return `article-${contentHash}`;
}

/**
 * Create HTML template for article
 */
function createHTMLTemplate(article, filename) {
    const title = article.title || 'Personality Article';
    const content = article.content || article.excerpt || 'Content coming soon...';
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | PersonalitySpark</title>
    <meta name="description" content="${article.excerpt || title}">
    <meta name="keywords" content="${article.tags ? article.tags.join(', ') : 'psychology, personality, relationships'}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${article.excerpt || title}">
    <meta property="og:type" content="article">
    <link rel="canonical" href="https://personalityspark.com/${filename}">
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
        .warning {
            background: #fff3cd;
            border: 1px solid #ffecb5;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <header>
        <h1>${title}</h1>
        <div class="meta">
            <strong>Published:</strong> ${article.date || new Date().toLocaleDateString()}<br>
            <strong>Reading Time:</strong> ${article.readTime || '5 min read'}<br>
            <strong>Category:</strong> ${article.category || 'Psychology'}
        </div>
    </header>
    
    <main class="content">
        ${content}
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
 * Load all articles and identify those without HTML files
 */
async function findMissingHTMLFiles() {
    const allArticles = new Map();
    const articlesWithoutHTML = [];
    
    console.log('🔍 Loading articles and checking for missing HTML files...\n');
    
    for (const filePath of BLOG_DATA_FILES) {
        try {
            console.log(`📖 Reading: ${filePath}`);
            const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
            
            if (data.posts && Array.isArray(data.posts)) {
                let fileCount = 0;
                for (const post of data.posts) {
                    const key = post.id || post.slug;
                    if (key && !allArticles.has(key)) {
                        allArticles.set(key, post);
                        fileCount++;
                        
                        // Check if HTML file exists for this article
                        const originalSlug = post.slug || post.id;
                        const htmlFileName = `${originalSlug}.html`;
                        
                        if (!(await htmlFileExists(htmlFileName))) {
                            articlesWithoutHTML.push(post);
                        }
                    }
                }
                console.log(`   ✅ Found ${fileCount} articles`);
            }
        } catch (error) {
            console.log(`   ❌ Error reading ${filePath}: ${error.message}`);
        }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total articles found: ${allArticles.size}`);
    console.log(`   Articles without HTML files: ${articlesWithoutHTML.length}`);
    
    return articlesWithoutHTML;
}

/**
 * Generate HTML files for articles with invalid slugs
 */
async function generateMissingHTMLFiles() {
    console.log('🚀 Starting HTML file generation for missing articles...\n');
    
    try {
        // Find articles without HTML files
        const missingArticles = await findMissingHTMLFiles();
        
        if (missingArticles.length === 0) {
            console.log('✨ All articles already have HTML files!');
            return;
        }
        
        console.log(`\n📝 Generating HTML files for ${missingArticles.length} missing articles...\n`);
        
        let successCount = 0;
        let errorCount = 0;
        const errorDetails = [];
        
        // Process articles in batches
        const batchSize = 25;
        for (let i = 0; i < missingArticles.length; i += batchSize) {
            const batch = missingArticles.slice(i, i + batchSize);
            console.log(`📦 Processing batch ${Math.floor(i/batchSize) + 1} (${i + 1}-${Math.min(i + batchSize, missingArticles.length)})...`);
            
            const promises = batch.map(async (article) => {
                try {
                    const originalSlug = article.slug || article.id;
                    const validFilename = createValidFilename(originalSlug, article.title, article.id);
                    const htmlFileName = `${validFilename}.html`;
                    
                    // Check if this valid filename already exists
                    if (await htmlFileExists(htmlFileName)) {
                        return { success: true, filename: htmlFileName, status: 'already_exists' };
                    }
                    
                    const html = createHTMLTemplate(article, htmlFileName);
                    await fs.writeFile(htmlFileName, html);
                    
                    return { 
                        success: true, 
                        filename: htmlFileName,
                        originalSlug: originalSlug,
                        title: article.title
                    };
                } catch (error) {
                    return { 
                        success: false, 
                        error: error.message, 
                        article: article.id || article.slug || 'unknown',
                        title: article.title
                    };
                }
            });
            
            const results = await Promise.all(promises);
            
            results.forEach(result => {
                if (result.success) {
                    if (result.status === 'already_exists') {
                        console.log(`   ↪️  Already exists: ${result.filename}`);
                    } else {
                        console.log(`   ✅ Created: ${result.filename} (${result.title || 'No title'})`);
                    }
                    successCount++;
                } else {
                    errorCount++;
                    errorDetails.push(result);
                    console.log(`   ❌ Failed: ${result.article} - ${result.error}`);
                }
            });
            
            console.log(`   📊 Batch completed: ${successCount} total success, ${errorCount} total errors`);
        }
        
        console.log(`\n🎉 HTML File Generation Complete!`);
        console.log(`📊 Final Results:`);
        console.log(`   ✅ Successfully created: ${successCount} HTML files`);
        console.log(`   ❌ Errors: ${errorCount}`);
        console.log(`   📈 Success rate: ${((successCount / missingArticles.length) * 100).toFixed(2)}%`);
        
        if (errorDetails.length > 0) {
            console.log(`\n❌ Error Details:`);
            errorDetails.forEach(error => {
                console.log(`   - ${error.article}: ${error.error}`);
            });
        }
        
        if (successCount > 0) {
            console.log(`\n🌟 All missing articles now have HTML files!`);
            
            // Count total HTML files
            const totalHTMLFiles = await countHTMLFiles();
            console.log(`\n📊 Total HTML files in repository: ${totalHTMLFiles}`);
        }
        
    } catch (error) {
        console.error('💥 Fatal error during HTML generation:', error.message);
        process.exit(1);
    }
}

/**
 * Count total HTML files in repository
 */
async function countHTMLFiles() {
    try {
        const files = await fs.readdir('.');
        const htmlFiles = files.filter(file => file.endsWith('.html'));
        return htmlFiles.length;
    } catch (error) {
        return 0;
    }
}

// Main execution
if (require.main === module) {
    generateMissingHTMLFiles();
}

module.exports = { generateMissingHTMLFiles };