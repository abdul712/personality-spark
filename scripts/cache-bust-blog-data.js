const fs = require('fs');
const path = require('path');

// Add cache-busting timestamp to all blog data files
function cacheBustBlogData() {
  const directories = [
    '../apps/web/react-app/public',
    '../apps/web/react-app/dist',
    '../personality-spark-api/public'
  ];
  
  const timestamp = new Date().getTime();
  console.log(`Adding cache-bust timestamp: ${timestamp}`);
  
  directories.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    
    // Update blog-index.json
    const indexPath = path.join(fullPath, 'blog-index.json');
    if (fs.existsSync(indexPath)) {
      const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
      indexData.cacheBust = timestamp;
      indexData.lastUpdated = new Date().toISOString();
      fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
      console.log(`Updated ${dir}/blog-index.json`);
    }
    
    // Update all blog-data-*.json files
    for (let i = 1; i <= 6; i++) {
      const chunkPath = path.join(fullPath, `blog-data-${i}.json`);
      if (fs.existsSync(chunkPath)) {
        const chunkData = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
        chunkData.cacheBust = timestamp;
        chunkData.lastUpdated = new Date().toISOString();
        fs.writeFileSync(chunkPath, JSON.stringify(chunkData, null, 2));
        console.log(`Updated ${dir}/blog-data-${i}.json`);
      }
    }
  });
  
  console.log('\nCache-busting complete!');
}

cacheBustBlogData();