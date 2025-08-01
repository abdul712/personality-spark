const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Configure marked for consistent output
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: false,
  mangle: false
});

// Directories to process
const directories = [
  '../apps/web/react-app/public',
  '../apps/web/react-app/dist',
  '../personality-spark-api/public'
];

console.log('Converting markdown to HTML in blog data files...\n');

directories.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${dir} - directory doesn't exist`);
    return;
  }
  
  console.log(`Processing ${dir}...`);
  
  // Process blog index
  const indexPath = path.join(fullPath, 'blog-index.json');
  if (fs.existsSync(indexPath)) {
    console.log('  - Found blog-index.json');
  }
  
  // Process all blog data chunks
  const files = fs.readdirSync(fullPath);
  const blogDataFiles = files.filter(f => f.match(/^blog-data-\d+\.json$/));
  
  blogDataFiles.forEach(file => {
    const filePath = path.join(fullPath, file);
    console.log(`  - Processing ${file}...`);
    
    try {
      // Read the file
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Convert markdown to HTML for each post
      if (data.posts && Array.isArray(data.posts)) {
        let convertedCount = 0;
        data.posts = data.posts.map(post => {
          if (post.content && typeof post.content === 'string') {
            // Check if content looks like markdown (has ## or |)
            if (post.content.includes('##') || post.content.includes('|')) {
              post.content = marked(post.content);
              convertedCount++;
            }
          }
          return post;
        });
        
        // Write back the file
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`    ✓ Converted ${convertedCount} posts to HTML`);
      }
    } catch (error) {
      console.error(`    ✗ Error processing ${file}:`, error.message);
    }
  });
  
  // Also process the main blog-data.json if it exists
  const mainBlogDataPath = path.join(fullPath, 'blog-data.json');
  if (fs.existsSync(mainBlogDataPath)) {
    console.log('  - Processing blog-data.json...');
    try {
      const data = JSON.parse(fs.readFileSync(mainBlogDataPath, 'utf8'));
      if (data.posts && Array.isArray(data.posts)) {
        let convertedCount = 0;
        data.posts = data.posts.map(post => {
          if (post.content && typeof post.content === 'string') {
            if (post.content.includes('##') || post.content.includes('|')) {
              post.content = marked(post.content);
              convertedCount++;
            }
          }
          return post;
        });
        fs.writeFileSync(mainBlogDataPath, JSON.stringify(data, null, 2));
        console.log(`    ✓ Converted ${convertedCount} posts to HTML`);
      }
    } catch (error) {
      console.error(`    ✗ Error processing blog-data.json:`, error.message);
    }
  }
  
  console.log('');
});

console.log('Conversion complete!');