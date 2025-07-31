const fs = require('fs');
const path = require('path');

// Read the original blog data with real content
const sourcePath = path.join(__dirname, '../backend/data/blog-articles.json');
const sourceData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

console.log(`Source file has ${sourceData.posts.length} posts`);

// Configuration
const POSTS_PER_CHUNK = 500; // 500 posts per file should be well under 1MB
const totalPosts = sourceData.posts.length;
const totalChunks = Math.ceil(totalPosts / POSTS_PER_CHUNK);

console.log(`Total posts: ${totalPosts}`);
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
  
  // Save each chunk
  chunks.forEach((chunk, index) => {
    const chunkPath = path.join(outputPath, `blog-data-${index + 1}.json`);
    fs.writeFileSync(chunkPath, JSON.stringify(chunk, null, 2));
    console.log(`Created ${chunkPath} with ${chunk.count} posts`);
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
  console.log(`Created ${indexPath} with metadata`);
  
  // Also save the full blog-data.json (truncated version)
  const truncatedData = {
    posts: sourceData.posts.slice(0, 947) // Keep first 947 for compatibility
  };
  const fullDataPath = path.join(outputPath, 'blog-data.json');
  fs.writeFileSync(fullDataPath, JSON.stringify(truncatedData, null, 2));
  console.log(`Created ${fullDataPath} with ${truncatedData.posts.length} posts (truncated)`);
});

// Check file sizes
console.log('\nFile sizes:');
console.log(`Source blog-articles.json: ${(fs.statSync(sourcePath).size / 1024 / 1024).toFixed(2)} MB`);

// Verify content
const samplePost = chunks[0].posts.find(p => p.slug === 'signs-a-guy-is-using-you-emotionally');
if (samplePost) {
  console.log('\nSample post content check:');
  console.log(`Slug: ${samplePost.slug}`);
  console.log(`Content preview: ${samplePost.content.substring(0, 100)}...`);
}