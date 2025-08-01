const fs = require('fs');
const path = require('path');

// Read the complete blog data
const sourcePath = path.join(__dirname, '../backend/data/all-blog-articles.json');
const sourceData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

console.log(`Source file has ${sourceData.posts.length} posts`);
console.log(`File size: ${(fs.statSync(sourcePath).size / 1024 / 1024).toFixed(2)} MB`);

// Configuration
const POSTS_PER_CHUNK = 500; // 500 posts per file to stay under 1MB limit
const totalPosts = sourceData.posts.length;
const totalChunks = Math.ceil(totalPosts / POSTS_PER_CHUNK);

console.log(`Creating ${totalChunks} chunks with ${POSTS_PER_CHUNK} posts each`);

// Output directories
const outputDirs = [
  '../apps/web/react-app/public',
  '../apps/web/react-app/dist',
  '../personality-spark-api/public'
];

// Create chunks
const chunks = [];
for (let i = 0; i < totalChunks; i++) {
  const start = i * POSTS_PER_CHUNK;
  const end = Math.min(start + POSTS_PER_CHUNK, totalPosts);
  
  chunks.push({
    chunk: i + 1,
    totalChunks: totalChunks,
    posts: sourceData.posts.slice(start, end),
    start: start,
    end: end - 1,
    count: end - start
  });
}

// Save chunks to all output directories
outputDirs.forEach(dir => {
  const outputPath = path.join(__dirname, dir);
  console.log(`\nProcessing directory: ${dir}`);
  
  // Remove old chunk files first
  const files = fs.readdirSync(outputPath);
  files.forEach(file => {
    if (file.match(/^blog-data-\d+\.json$/)) {
      fs.unlinkSync(path.join(outputPath, file));
      console.log(`  Removed old file: ${file}`);
    }
  });
  
  // Save each chunk
  chunks.forEach((chunk, index) => {
    const chunkPath = path.join(outputPath, `blog-data-${index + 1}.json`);
    fs.writeFileSync(chunkPath, JSON.stringify(chunk, null, 2));
    console.log(`  Created ${path.basename(chunkPath)} with ${chunk.count} posts`);
  });
  
  // Create an index file with metadata
  const indexData = {
    totalPosts: totalPosts,
    totalChunks: totalChunks,
    postsPerChunk: POSTS_PER_CHUNK,
    chunks: chunks.map((chunk, index) => ({
      file: `blog-data-${index + 1}.json`,
      chunk: index + 1,
      start: chunk.start,
      end: chunk.end,
      count: chunk.count
    })),
    generated: new Date().toISOString()
  };
  
  const indexPath = path.join(outputPath, 'blog-index.json');
  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
  console.log(`  Created blog-index.json with metadata`);
  
  // Also save a truncated blog-data.json for backward compatibility
  const truncatedData = {
    posts: sourceData.posts.slice(0, 947) // Keep first 947 for compatibility
  };
  const fullDataPath = path.join(outputPath, 'blog-data.json');
  fs.writeFileSync(fullDataPath, JSON.stringify(truncatedData, null, 2));
  console.log(`  Created blog-data.json with ${truncatedData.posts.length} posts (truncated for compatibility)`);
});

// Check chunk file sizes
console.log('\nChunk file sizes:');
const sampleDir = path.join(__dirname, '../personality-spark-api/public');
chunks.forEach((_, index) => {
  const chunkPath = path.join(sampleDir, `blog-data-${index + 1}.json`);
  const size = fs.statSync(chunkPath).size;
  console.log(`blog-data-${index + 1}.json: ${(size / 1024).toFixed(2)} KB`);
});

// Verify a sample article
console.log('\nVerifying sample article...');
const sampleSlug = 'what-does-it-mean-if-a-guy-copies-your-actions';
let found = false;
for (let i = 0; i < chunks.length; i++) {
  const post = chunks[i].posts.find(p => p.slug === sampleSlug);
  if (post) {
    console.log(`Found article "${post.title}" in chunk ${i + 1}`);
    console.log(`Content preview: ${post.content.substring(0, 100)}...`);
    found = true;
    break;
  }
}
if (!found) {
  console.log('Sample article not found!');
}

console.log('\nBlog chunk generation complete!');