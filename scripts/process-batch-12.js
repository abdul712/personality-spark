const fs = require('fs');
const path = require('path');

// Function to format the title
function formatTitle(filename) {
  return filename
    .replace(/_/g, ' ')
    .replace('.txt', '');
}

// Function to generate slug
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

// Function to generate excerpt
function generateExcerpt(content) {
  // Extract first paragraph (after removing title and metadata)
  const paragraphs = content.match(/<p>([^<]+)<\/p>/g);
  if (paragraphs && paragraphs.length > 0) {
    const firstPara = paragraphs[0].replace(/<[^>]*>/g, '');
    return firstPara.length > 160 ? firstPara.substring(0, 157) + '...' : firstPara;
  }
  return '';
}

// Function to add internal links
function addInternalLinks(content, allSlugs) {
  // Define keyword to slug mappings for internal linking
  const keywordMappings = [
    { keyword: 'emotional connection', slug: 'what-does-it-mean-when-a-guy-kisses-you-slowly' },
    { keyword: 'body language', slug: 'what-does-it-mean-if-someone-closes-their-eyes-while-talking' },
    { keyword: 'communication', slug: 'what-does-it-mean-when-a-guy-sighs-around-you' },
    { keyword: 'relationship', slug: 'what-does-it-mean-when-someone-says-they-need-space' },
    { keyword: 'attraction', slug: 'what-does-it-mean-when-a-guy-notices-your-hair' },
    { keyword: 'trust', slug: 'signs-he-feels-safe-with-you' },
    { keyword: 'vulnerability', slug: 'what-does-it-mean-when-a-guy-opens-the-door-for-you' },
    { keyword: 'intimacy', slug: 'what-does-it-mean-when-a-guy-touches-the-back-of-your-neck' },
    { keyword: 'affection', slug: 'what-does-it-mean-when-a-guy-kisses-you-on-the-forehead' },
    { keyword: 'comfort', slug: 'what-does-it-mean-when-a-guy-touches-you-a-lot' }
  ];

  let processedContent = content;
  
  // Add internal links (limit to 3-5 per article)
  let linkCount = 0;
  const maxLinks = Math.floor(Math.random() * 3) + 3; // 3-5 links
  
  for (const mapping of keywordMappings) {
    if (linkCount >= maxLinks) break;
    
    // Create regex to find the keyword (case insensitive, word boundary)
    const regex = new RegExp(`\\b(${mapping.keyword})\\b(?![^<]*>)`, 'gi');
    
    // Replace first occurrence only
    processedContent = processedContent.replace(regex, (match) => {
      if (linkCount < maxLinks && allSlugs.includes(mapping.slug)) {
        linkCount++;
        return `<a href="/blog/${mapping.slug}" title="${formatTitle(mapping.slug)}">${match}</a>`;
      }
      return match;
    });
  }
  
  return processedContent;
}

// Function to add external links
function addExternalLinks(content) {
  // Add Wikipedia links for relevant topics
  const wikipediaLinks = [
    { keyword: 'psychology', url: 'https://en.wikipedia.org/wiki/Psychology' },
    { keyword: 'emotional intelligence', url: 'https://en.wikipedia.org/wiki/Emotional_intelligence' },
    { keyword: 'interpersonal relationship', url: 'https://en.wikipedia.org/wiki/Interpersonal_relationship' },
    { keyword: 'nonverbal communication', url: 'https://en.wikipedia.org/wiki/Nonverbal_communication' },
    { keyword: 'attachment theory', url: 'https://en.wikipedia.org/wiki/Attachment_theory' },
    { keyword: 'love languages', url: 'https://en.wikipedia.org/wiki/The_Five_Love_Languages' },
    { keyword: 'trust', url: 'https://en.wikipedia.org/wiki/Trust_(social_science)' },
    { keyword: 'empathy', url: 'https://en.wikipedia.org/wiki/Empathy' },
    { keyword: 'boundaries', url: 'https://en.wikipedia.org/wiki/Personal_boundaries' },
    { keyword: 'vulnerability', url: 'https://en.wikipedia.org/wiki/Vulnerability' }
  ];

  let processedContent = content;
  let externalLinkAdded = false;
  
  // Add one external link per article
  for (const link of wikipediaLinks) {
    if (externalLinkAdded) break;
    
    const regex = new RegExp(`\\b(${link.keyword})\\b(?![^<]*>)`, 'gi');
    
    processedContent = processedContent.replace(regex, (match) => {
      if (!externalLinkAdded) {
        externalLinkAdded = true;
        return `<a href="${link.url}" target="_blank" rel="noopener">${match}</a>`;
      }
      return match;
    });
  }
  
  return processedContent;
}

// Function to format content with HTML
function formatContent(content) {
  let formatted = content;
  
  // Skip the title line (first line starting with #)
  formatted = formatted.replace(/^#\s+.+\n+/, '');
  
  // Remove Midjourney prompts
  formatted = formatted.replace(/@\s*Midjourney[^@]+/g, '');
  
  // Convert headers
  formatted = formatted.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  formatted = formatted.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  
  // Convert bold text
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Convert lists
  formatted = formatted.replace(/^-\s+(.+)$/gm, '<li>$1</li>');
  formatted = formatted.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
    return '<ul>\n' + match + '</ul>\n';
  });
  
  // Convert tables
  formatted = formatted.replace(/\|([^|]+)\|([^|]+)\|([^|]*)\|?/gm, (match, col1, col2, col3) => {
    if (match.includes('---')) return ''; // Skip separator lines
    const cells = [col1, col2, col3].filter(c => c).map(c => c.trim());
    if (cells.length === 0) return '';
    return '<tr>\n' + cells.map(cell => `<td>${cell}</td>`).join('\n') + '\n</tr>';
  });
  
  // Wrap tables
  formatted = formatted.replace(/(<tr>[\s\S]*?<\/tr>\n?)+/g, (match) => {
    return '<table class="blog-table">\n<tbody>\n' + match + '</tbody>\n</table>\n';
  });
  
  // Convert paragraphs
  formatted = formatted.split('\n\n').map(para => {
    para = para.trim();
    if (para && !para.startsWith('<') && para.length > 0) {
      return `<p>${para}</p>`;
    }
    return para;
  }).join('\n');
  
  // Clean up empty tags and extra whitespace
  formatted = formatted.replace(/<p>\s*<\/p>/g, '');
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  
  // Add text-align: justify to paragraphs
  formatted = formatted.replace(/<p>/g, '<p style="text-align: justify;">');
  
  return formatted.trim();
}

// Function to calculate read time
function calculateReadTime(content) {
  const text = content.replace(/<[^>]*>/g, '');
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  const readTime = Math.ceil(wordCount / 200); // 200 words per minute
  return `${readTime} min read`;
}

// Function to get current date
function getCurrentDate() {
  const date = new Date();
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// Function to process a batch of articles
async function processBatch(files, startIndex, batchSize, existingPosts, allSlugs) {
  const endIndex = Math.min(startIndex + batchSize, files.length);
  const batch = files.slice(startIndex, endIndex);
  const newPosts = [];
  
  console.log(`Processing batch: ${startIndex + 1} to ${endIndex} of ${files.length}`);
  
  for (const file of batch) {
    if (!file.endsWith('.txt')) continue;
    
    const filePath = path.join('/Users/abdulrahim/Downloads/Batch 12', file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    const title = formatTitle(file);
    const slug = generateSlug(title);
    const id = slug;
    
    // Skip if already exists
    if (existingPosts.some(post => post.slug === slug)) {
      console.log(`Skipping duplicate: ${title}`);
      continue;
    }
    
    // Format content
    let formattedContent = formatContent(content);
    
    // Add internal and external links
    formattedContent = addInternalLinks(formattedContent, allSlugs);
    formattedContent = addExternalLinks(formattedContent);
    
    const post = {
      id: id,
      slug: slug,
      title: title,
      content: formattedContent,
      excerpt: generateExcerpt(formattedContent),
      date: getCurrentDate(),
      readTime: calculateReadTime(formattedContent),
      filename: file
    };
    
    newPosts.push(post);
    console.log(`Processed: ${title}`);
  }
  
  return newPosts;
}

// Main function
async function main() {
  const batchDir = '/Users/abdulrahim/Downloads/Batch 12';
  const blogDataPath = '/Users/abdulrahim/GitHub Projects/personality-spark/personality-spark-api/public/blog-data.json';
  
  // Read existing blog data
  let blogData = { posts: [] };
  if (fs.existsSync(blogDataPath)) {
    blogData = JSON.parse(fs.readFileSync(blogDataPath, 'utf8'));
  }
  
  // Get all existing slugs for internal linking
  const allSlugs = blogData.posts.map(post => post.slug);
  
  // Read all files from Batch 12
  const files = fs.readdirSync(batchDir).filter(f => f.endsWith('.txt'));
  console.log(`Found ${files.length} articles to process`);
  
  // Process in batches of 50
  const batchSize = 50;
  let totalProcessed = 0;
  
  for (let i = 0; i < files.length; i += batchSize) {
    const newPosts = await processBatch(files, i, batchSize, blogData.posts, allSlugs);
    
    // Add new posts to existing data
    blogData.posts.push(...newPosts);
    totalProcessed += newPosts.length;
    
    // Update allSlugs for next batch
    newPosts.forEach(post => allSlugs.push(post.slug));
    
    // Save after each batch
    fs.writeFileSync(blogDataPath, JSON.stringify(blogData, null, 2));
    console.log(`Saved batch. Total articles: ${blogData.posts.length}`);
    
    // Small delay between batches
    if (i + batchSize < files.length) {
      console.log('Waiting before next batch...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log(`\nProcessing complete!`);
  console.log(`Total articles processed: ${totalProcessed}`);
  console.log(`Total articles in blog: ${blogData.posts.length}`);
}

// Run the script
main().catch(console.error);