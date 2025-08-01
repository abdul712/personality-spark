const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Configure marked for better output
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: true,
  mangle: false
});

// Custom renderer for better styling
const renderer = new marked.Renderer();

// Custom heading renderer with styling
renderer.heading = function(text, level) {
  const sizes = {
    1: 'text-4xl font-bold text-gray-900 mb-6',
    2: 'text-3xl font-bold text-gray-800 mt-8 mb-4',
    3: 'text-2xl font-semibold text-gray-700 mt-6 mb-3',
    4: 'text-xl font-semibold text-gray-600 mt-4 mb-2',
    5: 'text-lg font-medium text-gray-600 mt-3 mb-2',
    6: 'text-base font-medium text-gray-600 mt-2 mb-1'
  };
  return `<h${level} class="${sizes[level]}">${text}</h${level}>`;
};

// Custom paragraph renderer
renderer.paragraph = function(text) {
  return `<p class="text-gray-700 leading-relaxed mb-4">${text}</p>`;
};

// Custom list renderer
renderer.list = function(body, ordered) {
  const type = ordered ? 'ol' : 'ul';
  const className = ordered ? 'list-decimal' : 'list-disc';
  return `<${type} class="${className} list-inside space-y-2 mb-4 ml-4">${body}</${type}>`;
};

// Custom list item renderer
renderer.listitem = function(text) {
  return `<li class="text-gray-700">${text}</li>`;
};

// Custom table renderer
renderer.table = function(header, body) {
  return `
    <div class="overflow-x-auto mb-6">
      <table class="min-w-full border-collapse">
        <thead>
          ${header}
        </thead>
        <tbody class="divide-y divide-gray-200">
          ${body}
        </tbody>
      </table>
    </div>
  `;
};

renderer.tablerow = function(content) {
  return `<tr class="hover:bg-gray-50">${content}</tr>`;
};

renderer.tablecell = function(content, flags) {
  const type = flags.header ? 'th' : 'td';
  const className = flags.header 
    ? 'px-4 py-3 bg-gray-100 text-left font-semibold text-gray-700 border-b-2 border-gray-300' 
    : 'px-4 py-3 text-gray-600 border-b border-gray-200';
  return `<${type} class="${className}">${content}</${type}>`;
};

// Custom strong renderer
renderer.strong = function(text) {
  return `<strong class="font-semibold text-gray-900">${text}</strong>`;
};

// Custom blockquote renderer
renderer.blockquote = function(quote) {
  return `<blockquote class="border-l-4 border-purple-500 pl-4 py-2 mb-4 italic text-gray-600">${quote}</blockquote>`;
};

// Custom code renderer
renderer.code = function(code, language) {
  return `<pre class="bg-gray-100 rounded-lg p-4 overflow-x-auto mb-4"><code class="text-sm">${code}</code></pre>`;
};

marked.use({ renderer });

// Function to fix content
function fixContent(content) {
  if (!content || typeof content !== 'string') {
    return content;
  }
  
  // Remove wrapping <p> tags that contain markdown
  let fixedContent = content;
  
  // Replace <p># heading</p> with proper markdown processing
  fixedContent = fixedContent.replace(/<p>\s*#/g, '#');
  fixedContent = fixedContent.replace(/<\/p>\s*\n*<p>/g, '\n\n');
  fixedContent = fixedContent.replace(/<p>|<\/p>/g, '');
  
  // Convert the markdown to proper HTML
  const html = marked(fixedContent);
  
  return html;
}

// Process all directories
const directories = [
  '../apps/web/react-app/public',
  '../apps/web/react-app/dist',
  '../personality-spark-api/public'
];

let totalProcessed = 0;
let totalArticles = 0;

console.log('Fixing blog content rendering...\n');

directories.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${dir} - directory doesn't exist`);
    return;
  }
  
  console.log(`Processing ${dir}...`);
  
  // Process all blog data chunks
  const files = fs.readdirSync(fullPath);
  const blogDataFiles = files.filter(f => f.match(/^blog-data-\d+\.json$/));
  
  blogDataFiles.forEach(file => {
    const filePath = path.join(fullPath, file);
    console.log(`  - Processing ${file}...`);
    
    try {
      // Read the file
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Fix content for each post
      if (data.posts && Array.isArray(data.posts)) {
        let fixedCount = 0;
        data.posts = data.posts.map(post => {
          if (post.content && typeof post.content === 'string') {
            const originalContent = post.content;
            post.content = fixContent(post.content);
            if (originalContent !== post.content) {
              fixedCount++;
            }
          }
          return post;
        });
        
        totalArticles += data.posts.length;
        totalProcessed += fixedCount;
        
        // Write back the file
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`    ✓ Fixed ${fixedCount} posts out of ${data.posts.length}`);
      }
    } catch (error) {
      console.error(`    ✗ Error processing ${file}:`, error.message);
    }
  });
  
  console.log('');
});

// Update the blog index to reflect correct total
directories.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  const indexPath = path.join(fullPath, 'blog-index.json');
  
  if (fs.existsSync(indexPath)) {
    try {
      const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
      
      // Count actual articles
      let actualTotal = 0;
      if (indexData.chunks) {
        indexData.chunks.forEach(chunk => {
          actualTotal += chunk.count;
        });
      }
      
      // Update total if needed
      if (indexData.totalPosts !== actualTotal) {
        console.log(`Updating blog-index.json in ${dir}: ${indexData.totalPosts} -> ${actualTotal}`);
        indexData.totalPosts = actualTotal;
        fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
      }
    } catch (error) {
      console.error(`Error updating index in ${dir}:`, error.message);
    }
  }
});

console.log(`\nRendering fix complete!`);
console.log(`Total articles found: ${totalArticles}`);
console.log(`Total articles fixed: ${totalProcessed}`);
console.log('\nNote: You may need to rebuild and redeploy for changes to take effect.');