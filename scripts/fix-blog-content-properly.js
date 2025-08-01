const fs = require('fs');
const path = require('path');
const https = require('https');
const xml2js = require('xml2js');

// Function to fetch XML content
function fetchXML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// Function to parse XML
async function parseXML(xmlData) {
  const parser = new xml2js.Parser();
  return parser.parseStringPromise(xmlData);
}

// Function to convert markdown to HTML
function markdownToHTML(markdown) {
  if (!markdown || typeof markdown !== 'string') {
    return '';
  }
  
  let html = markdown;
  
  // Remove the first H1 if it exists (we'll use the title instead)
  html = html.replace(/^#\s+[^\n]+\n/, '');
  
  // Convert headers with proper styling
  html = html.replace(/^######\s+(.+)$/gm, '<h6 class="text-base font-medium text-gray-600 mt-2 mb-1">$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5 class="text-lg font-medium text-gray-600 mt-3 mb-2">$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4 class="text-xl font-semibold text-gray-600 mt-4 mb-2">$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3 class="text-2xl font-semibold text-gray-700 mt-6 mb-3">$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2 class="text-3xl font-bold text-gray-800 mt-8 mb-4">$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h2 class="text-3xl font-bold text-gray-800 mt-8 mb-4">$1</h2>');
  
  // Convert bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  // Convert lists
  html = html.replace(/^- (.+)$/gm, '<li class="text-gray-700">$1</li>');
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="text-gray-700">$1</li>');
  
  // Wrap consecutive list items in ul/ol tags
  html = html.replace(/(<li class="text-gray-700">.*<\/li>\n?)+/g, (match) => {
    const isOrdered = match.includes('1.');
    const listType = isOrdered ? 'ol' : 'ul';
    const className = isOrdered ? 'list-decimal' : 'list-disc';
    return `<${listType} class="${className} list-inside space-y-2 mb-4 ml-4">${match}</${listType}>`;
  });
  
  // Convert blockquotes
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote class="border-l-4 border-purple-500 pl-4 py-2 mb-4 italic text-gray-600">$1</blockquote>');
  
  // Convert tables
  html = html.replace(/\|(.+)\|/g, (match, content) => {
    if (match.includes('---')) return ''; // Skip separator rows
    
    const cells = content.split('|').map(cell => cell.trim());
    const isHeader = cells.some(cell => cell.match(/^:?-+:?$/));
    
    if (!isHeader && cells.length > 0) {
      const cellTags = cells.map((cell, index) => {
        if (index === 0) {
          return `<td class="px-4 py-3 text-gray-600 border-b border-gray-200 font-semibold text-purple-600">${cell}</td>`;
        }
        return `<td class="px-4 py-3 text-gray-600 border-b border-gray-200">${cell}</td>`;
      }).join('');
      return `<tr class="hover:bg-gray-50">${cellTags}</tr>`;
    }
    
    return match;
  });
  
  // Wrap tables
  const tableRegex = /(<tr.*?>.*?<\/tr>\s*)+/gs;
  html = html.replace(tableRegex, (match) => {
    return `<div class="overflow-x-auto mb-6">
      <table class="min-w-full border-collapse">
        <tbody class="divide-y divide-gray-200">
          ${match}
        </tbody>
      </table>
    </div>`;
  });
  
  // Convert paragraphs
  const lines = html.split('\n');
  const processedLines = [];
  let inBlock = false;
  
  for (let line of lines) {
    line = line.trim();
    
    // Check if line is already HTML or empty
    if (!line || line.startsWith('<') || line.startsWith('|')) {
      processedLines.push(line);
      inBlock = false;
    } else {
      // It's a text paragraph
      processedLines.push(`<p class="text-gray-700 leading-relaxed mb-4">${line}</p>`);
    }
  }
  
  html = processedLines.join('\n');
  
  // Clean up empty paragraphs and extra newlines
  html = html.replace(/<p class="text-gray-700 leading-relaxed mb-4"><\/p>/g, '');
  html = html.replace(/\n{3,}/g, '\n\n');
  
  return html.trim();
}

// Function to clean excerpt
function cleanExcerpt(text) {
  if (!text) return '';
  
  // Remove markdown headers
  let cleaned = text.replace(/^#+\s+/gm, '');
  
  // Remove other markdown formatting
  cleaned = cleaned.replace(/\*\*\*(.+?)\*\*\*/g, '$1');
  cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, '$1');
  cleaned = cleaned.replace(/\*(.+?)\*/g, '$1');
  cleaned = cleaned.replace(/^[-*]\s+/gm, '');
  cleaned = cleaned.replace(/^\d+\.\s+/gm, '');
  cleaned = cleaned.replace(/^>\s+/gm, '');
  cleaned = cleaned.replace(/\|/g, ' ');
  
  // Trim to reasonable length
  if (cleaned.length > 200) {
    cleaned = cleaned.substring(0, 197) + '...';
  }
  
  return cleaned.trim();
}

// Main function to re-import and fix all articles
async function fixAllBlogContent() {
  try {
    console.log('Loading existing blog data to fix content...');
    
    const allPosts = [];
    const indexPath = path.join(__dirname, '../apps/web/react-app/public/blog-index.json');
    
    // Load existing blog data
    if (!fs.existsSync(indexPath)) {
      throw new Error('blog-index.json not found!');
    }
    
    const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    console.log(`Found ${indexData.totalPosts} posts in ${indexData.totalChunks} chunks`);
    
    // Load all chunks and fix content
    for (const chunkInfo of indexData.chunks) {
      const chunkPath = path.join(__dirname, '../apps/web/react-app/public', chunkInfo.file);
      if (fs.existsSync(chunkPath)) {
        const chunkData = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
        
        for (const post of chunkData.posts) {
          // Fix content by removing [object Object] and converting markdown properly
          let fixedContent = post.content;
          
          // Remove [object Object] strings
          fixedContent = fixedContent.replace(/\[object Object\]/g, '');
          
          // Check if content has markdown patterns
          if (fixedContent.includes('#') || fixedContent.includes('**') || fixedContent.includes('*')) {
            // Convert markdown to HTML
            fixedContent = markdownToHTML(fixedContent);
          }
          
          // Clean up excerpt
          const cleanedExcerpt = cleanExcerpt(post.excerpt);
          
          // Create fixed post
          const fixedPost = {
            ...post,
            content: fixedContent,
            excerpt: cleanedExcerpt
          };
          
          allPosts.push(fixedPost);
        }
      }
    }
    
    console.log(`Total articles found: ${allPosts.length}`);
    
    // Sort posts alphabetically
    allPosts.sort((a, b) => a.title.localeCompare(b.title));
    
    // Split into chunks
    const CHUNK_SIZE = 500;
    const chunks = [];
    
    for (let i = 0; i < allPosts.length; i += CHUNK_SIZE) {
      chunks.push({
        posts: allPosts.slice(i, i + CHUNK_SIZE),
        chunk: Math.floor(i / CHUNK_SIZE) + 1,
        start: i,
        end: Math.min(i + CHUNK_SIZE - 1, allPosts.length - 1),
        count: Math.min(CHUNK_SIZE, allPosts.length - i)
      });
    }
    
    // Create blog index
    const blogIndex = {
      totalPosts: allPosts.length,
      totalChunks: chunks.length,
      postsPerChunk: CHUNK_SIZE,
      chunks: chunks.map(c => ({
        file: `blog-data-${c.chunk}.json`,
        chunk: c.chunk,
        start: c.start,
        end: c.end,
        count: c.count
      })),
      generated: new Date().toISOString()
    };
    
    // Save files to all directories
    const directories = [
      '../apps/web/react-app/public',
      '../apps/web/react-app/dist',
      '../personality-spark-api/public'
    ];
    
    directories.forEach(dir => {
      const fullPath = path.join(__dirname, dir);
      
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
      
      // Save index
      fs.writeFileSync(
        path.join(fullPath, 'blog-index.json'),
        JSON.stringify(blogIndex, null, 2)
      );
      
      // Save chunks
      chunks.forEach(chunk => {
        fs.writeFileSync(
          path.join(fullPath, `blog-data-${chunk.chunk}.json`),
          JSON.stringify({
            posts: chunk.posts,
            chunk: chunk.chunk,
            total: allPosts.length
          }, null, 2)
        );
      });
      
      console.log(`Saved to ${dir}`);
    });
    
    console.log(`\nSuccessfully fixed all blog content!`);
    console.log(`Total articles: ${allPosts.length}`);
    console.log(`Total chunks: ${chunks.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the fix
fixAllBlogContent();