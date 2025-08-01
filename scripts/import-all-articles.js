const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Paths
const CSV_PATH = '/Users/abdulrahim/Downloads/Personality_Spark.csv';
const ARTICLES_DIR = '/Users/abdulrahim/Downloads/untitled folder/New';
const OUTPUT_PATH = path.join(__dirname, '../backend/data/all-blog-articles.json');

// Function to convert title to filename
function titleToFilename(title) {
  return title
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .trim() + '.txt';
}

// Function to extract slug from URL
function urlToSlug(url) {
  return url
    .replace('https://personalityspark.com/', '')
    .replace(/\/$/, ''); // Remove trailing slash
}

// Function to generate excerpt from content
function generateExcerpt(content, maxLength = 200) {
  // Remove HTML tags for excerpt
  const textContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (textContent.length <= maxLength) return textContent;
  return textContent.substring(0, maxLength).trim() + '...';
}

// Function to estimate read time
function estimateReadTime(content) {
  const words = content.split(/\s+/).length;
  const wordsPerMinute = 200;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

// Main function
async function importArticles() {
  console.log('Starting article import...');
  
  // Read CSV file
  const csvData = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on('data', (row) => csvData.push(row))
      .on('end', resolve)
      .on('error', reject);
  });
  
  console.log(`Found ${csvData.length} entries in CSV`);
  
  const posts = [];
  let successCount = 0;
  let errorCount = 0;
  
  // Process each article
  for (const row of csvData) {
    try {
      const title = row.Title;
      const url = row.Permalink;
      
      if (!title || !url) {
        console.warn(`Skipping row with missing data: ${JSON.stringify(row)}`);
        continue;
      }
      
      // Try different filename variations
      const possibleFilenames = [
        titleToFilename(title),
        title.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_').trim() + '.txt',
        title.replace(/\s+/g, '_') + '.txt',
        // Handle special cases like quotes
        title.replace(/"/g, '').replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').trim() + '.txt'
      ];
      
      let content = null;
      let usedFilename = null;
      
      // Try to find the file
      for (const filename of possibleFilenames) {
        const filePath = path.join(ARTICLES_DIR, filename);
        if (fs.existsSync(filePath)) {
          content = fs.readFileSync(filePath, 'utf8');
          usedFilename = filename;
          break;
        }
      }
      
      if (!content) {
        console.error(`Could not find file for: ${title}`);
        console.error(`  Tried filenames: ${possibleFilenames.join(', ')}`);
        errorCount++;
        continue;
      }
      
      const slug = urlToSlug(url);
      const date = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      // Convert content to HTML paragraphs
      const htmlContent = content
        .split('\n\n')
        .filter(para => para.trim())
        .map(para => `<p>${para.trim()}</p>`)
        .join('\n');
      
      const post = {
        id: slug,
        slug: slug,
        title: title,
        content: htmlContent,
        excerpt: generateExcerpt(htmlContent),
        date: date,
        readTime: estimateReadTime(content),
        source: usedFilename
      };
      
      posts.push(post);
      successCount++;
      
      if (successCount % 100 === 0) {
        console.log(`Processed ${successCount} articles...`);
      }
    } catch (error) {
      console.error(`Error processing ${row.Title}:`, error.message);
      errorCount++;
    }
  }
  
  console.log(`\nImport complete!`);
  console.log(`Success: ${successCount} articles`);
  console.log(`Errors: ${errorCount} articles`);
  console.log(`Total posts: ${posts.length}`);
  
  // Save to JSON file
  const blogData = { posts };
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(blogData, null, 2));
  console.log(`\nSaved to: ${OUTPUT_PATH}`);
  console.log(`File size: ${(fs.statSync(OUTPUT_PATH).size / 1024 / 1024).toFixed(2)} MB`);
}

// Run the import
importArticles().catch(console.error);