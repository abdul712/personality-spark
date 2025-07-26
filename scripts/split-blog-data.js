const fs = require('fs');
const path = require('path');

// Read the original blog-data.json
const blogDataPath = path.join(__dirname, '../apps/web/react-app/public/blog-data.json');
const blogData = JSON.parse(fs.readFileSync(blogDataPath, 'utf8'));

// Configuration
const POSTS_PER_CHUNK = 500; // 500 posts per file should be well under 1MB
const totalPosts = blogData.posts.length;
const totalChunks = Math.ceil(totalPosts / POSTS_PER_CHUNK);

console.log(`Total posts: ${totalPosts}`);
console.log(`Creating ${totalChunks} chunks with ${POSTS_PER_CHUNK} posts each`);

// Create chunks
const chunks = [];
for (let i = 0; i < totalChunks; i++) {
  const start = i * POSTS_PER_CHUNK;
  const end = Math.min(start + POSTS_PER_CHUNK, totalPosts);
  
  chunks.push({
    chunk: i + 1,
    totalChunks: totalChunks,
    posts: blogData.posts.slice(start, end),
    start: start,
    end: end - 1,
    count: end - start
  });
}

// Save each chunk
chunks.forEach((chunk, index) => {
  const chunkPath = path.join(__dirname, `../apps/web/react-app/public/blog-data-${index + 1}.json`);
  fs.writeFileSync(chunkPath, JSON.stringify(chunk, null, 2));
  console.log(`Created blog-data-${index + 1}.json with ${chunk.count} posts`);
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

const indexPath = path.join(__dirname, '../apps/web/react-app/public/blog-index.json');
fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
console.log(`Created blog-index.json with metadata`);

// Check file sizes
console.log('\nFile sizes:');
console.log(`Original blog-data.json: ${(fs.statSync(blogDataPath).size / 1024).toFixed(2)} KB`);
console.log(`blog-index.json: ${(fs.statSync(indexPath).size / 1024).toFixed(2)} KB`);
chunks.forEach((_, index) => {
  const chunkPath = path.join(__dirname, `../apps/web/react-app/public/blog-data-${index + 1}.json`);
  console.log(`blog-data-${index + 1}.json: ${(fs.statSync(chunkPath).size / 1024).toFixed(2)} KB`);
});