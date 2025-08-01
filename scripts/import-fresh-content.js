const fs = require('fs');
const path = require('path');

// Function to convert markdown to HTML
function markdownToHTML(markdown) {
  if (!markdown || typeof markdown !== 'string') {
    return '';
  }
  
  let html = markdown;
  
  // Convert headers (H2-H6, skip H1)
  html = html.replace(/^######\s+(.+)$/gm, '<h6 class="text-base font-medium text-gray-600 mt-2 mb-1">$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5 class="text-lg font-medium text-gray-600 mt-3 mb-2">$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4 class="text-xl font-semibold text-gray-600 mt-4 mb-2">$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3 class="text-2xl font-semibold text-gray-700 mt-6 mb-3">$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2 class="text-3xl font-bold text-gray-800 mt-8 mb-4">$1</h2>');
  
  // Convert bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  // Convert lists
  html = html.replace(/^- (.+)$/gm, '<li class="text-gray-700">$1</li>');
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="text-gray-700">$1</li>');
  
  // Wrap consecutive list items
  html = html.replace(/(<li class="text-gray-700">.*<\/li>\n?)+/g, (match) => {
    const isOrdered = match.includes('1.');
    const listType = isOrdered ? 'ol' : 'ul';
    const className = isOrdered ? 'list-decimal' : 'list-disc';
    return `<${listType} class="${className} list-inside space-y-2 mb-4 ml-4">${match}</${listType}>`;
  });
  
  // Convert blockquotes
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote class="border-l-4 border-purple-500 pl-4 py-2 mb-4 italic text-gray-600">$1</blockquote>');
  
  // Convert paragraphs
  const lines = html.split('\n');
  const processedLines = [];
  
  for (let line of lines) {
    line = line.trim();
    
    // Check if line is already HTML or empty
    if (!line || line.startsWith('<')) {
      processedLines.push(line);
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

// Main function to create blog posts from titles
async function importFreshContent() {
  try {
    console.log('Creating fresh blog content...');
    
    // Load existing blog index to get all slugs
    const indexPath = path.join(__dirname, '../apps/web/react-app/public/blog-index.json');
    const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    
    const allPosts = [];
    
    // Process each chunk to get all existing posts
    for (const chunkInfo of indexData.chunks) {
      const chunkPath = path.join(__dirname, '../apps/web/react-app/public', chunkInfo.file);
      if (fs.existsSync(chunkPath)) {
        const chunkData = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
        
        for (const post of chunkData.posts) {
          // Create fresh content based on title
          const title = post.title;
          const slug = post.slug;
          
          // Generate sample content based on title
          let content = `## Introduction

${title} is an important topic that many people are curious about. In this comprehensive guide, we'll explore various aspects and provide valuable insights.

## Key Points

Understanding ${title.toLowerCase()} requires looking at several important factors:

- **Core Concepts**: The fundamental principles that define this topic
- **Practical Applications**: How this applies to real-world situations
- **Common Misconceptions**: What people often get wrong about this

## Detailed Analysis

When examining ${title.toLowerCase()}, it's essential to consider the broader context. This involves understanding not just the surface-level information, but also the deeper implications and connections to related topics.

### Important Considerations

There are several key aspects to keep in mind:

1. The historical context and how it has evolved over time
2. Current perspectives and modern interpretations
3. Future implications and potential developments

## Practical Implications

Understanding ${title.toLowerCase()} can have significant practical benefits. Whether you're looking to improve your knowledge, make better decisions, or simply satisfy your curiosity, this information provides valuable insights.

### Real-World Applications

Here are some ways this knowledge can be applied:

- Personal development and self-improvement
- Professional growth and career advancement
- Better understanding of relationships and social dynamics

## Conclusion

${title} is a multifaceted topic that offers numerous insights and opportunities for growth. By understanding these concepts, you can gain valuable knowledge that applies to many areas of life.

Remember that learning is an ongoing process, and there's always more to discover about ${title.toLowerCase()}.`;
          
          // Convert to HTML
          const htmlContent = markdownToHTML(content);
          
          // Generate excerpt
          const excerpt = cleanExcerpt(`${title} is an important topic that many people are curious about. In this comprehensive guide, we'll explore various aspects and provide valuable insights.`);
          
          // Create post object
          const freshPost = {
            id: slug,
            slug: slug,
            title: title,
            content: htmlContent,
            excerpt: excerpt,
            date: post.date || new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            readTime: post.readTime || `${Math.floor(Math.random() * 5) + 3} min read`
          };
          
          allPosts.push(freshPost);
        }
      }
    }
    
    console.log(`Total articles created: ${allPosts.length}`);
    
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
    const newBlogIndex = {
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
        JSON.stringify(newBlogIndex, null, 2)
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
    
    console.log(`\nSuccessfully created fresh blog content!`);
    console.log(`Total articles: ${allPosts.length}`);
    console.log(`Total chunks: ${chunks.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the import
importFreshContent();