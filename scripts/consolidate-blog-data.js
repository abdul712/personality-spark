const fs = require('fs');
const path = require('path');

console.log('🔄 Consolidating blog data from chunks...\n');

// Read the blog index
const indexPath = path.join(__dirname, '../apps/web/react-app/dist/blog-index.json');
const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

// Collect all posts from chunks
const allPosts = [];

for (const chunkInfo of indexData.chunks) {
  const chunkPath = path.join(__dirname, '../apps/web/react-app/dist', chunkInfo.file);
  console.log(`📖 Reading ${chunkInfo.file}...`);
  
  const chunkData = JSON.parse(fs.readFileSync(chunkPath, 'utf-8'));
  allPosts.push(...chunkData.posts);
}

console.log(`\n✅ Collected ${allPosts.length} posts from ${indexData.chunks.length} chunks`);

// Create the consolidated blog data
const blogData = {
  posts: allPosts,
  lastUpdated: new Date().toISOString(),
  totalPosts: allPosts.length
};

// Write to backend blog-articles.json
const backendPath = path.join(__dirname, '../backend/data/blog-articles.json');
console.log(`\n💾 Writing to ${backendPath}...`);

fs.writeFileSync(backendPath, JSON.stringify(blogData, null, 2));

console.log('\n✅ Successfully consolidated blog data!');
console.log(`📊 Total posts: ${allPosts.length}`);
console.log(`📝 Updated: ${blogData.lastUpdated}`);

// Verify content doesn't have [object Object]
const samplePost = allPosts[0];
if (samplePost && samplePost.content) {
  const hasObjectString = samplePost.content.includes('[object Object]');
  if (hasObjectString) {
    console.log('\n⚠️  WARNING: Content still contains [object Object]!');
  } else {
    console.log('\n✅ Content is clean (no [object Object] found)');
  }
}