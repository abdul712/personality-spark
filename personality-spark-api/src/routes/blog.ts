import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Context } from '../types/env';

export const blogRouter = new Hono<Context>();

// Query parameter schemas
const PaginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(1).max(1000)).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(1).max(2000)).optional().default('20'),
  search: z.string().max(100).optional()
});

const RelatedPostsSchema = z.object({
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(1).max(20)).optional().default('5')
});

// Load blog data from chunked files or KV
async function loadBlogData(c: any) {
  try {
    // Try to get blog data from KV storage first
    const cached = await c.env.CACHE.get('blog-data-all', 'json');
    if (cached && cached.posts && cached.posts.length > 0) {
      return cached;
    }
  } catch (error) {
    console.error('Error loading from KV:', error);
  }
  
  try {
    // First load the index to know about chunks
    const url = new URL(c.req.url);
    const indexUrl = `${url.protocol}//${url.host}/blog-index.json`;
    const indexResponse = await fetch(indexUrl);
    
    if (!indexResponse.ok) {
      throw new Error('Failed to fetch blog index');
    }
    
    const indexData = await indexResponse.json();
    
    // Load all chunks in parallel
    const chunkPromises = indexData.chunks.map(async (chunk: any) => {
      const chunkUrl = `${url.protocol}//${url.host}/${chunk.file}`;
      const response = await fetch(chunkUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${chunk.file}`);
      }
      return response.json();
    });
    
    const chunks = await Promise.all(chunkPromises);
    
    // Combine all posts from chunks
    const allPosts = chunks.flatMap(chunk => chunk.posts);
    
    const data = { posts: allPosts };
    
    // Cache the combined data in KV for future use
    try {
      await c.env.CACHE.put('blog-data-all', JSON.stringify(data), {
        expirationTtl: 3600 // Cache for 1 hour
      });
    } catch (cacheError) {
      console.error('Error caching blog data:', cacheError);
    }
    
    return data;
  } catch (error) {
    console.error('Error loading blog data from chunks:', error);
    
    // Fallback to original blog-data.json if chunks fail
    try {
      const url = new URL(c.req.url);
      const blogDataUrl = `${url.protocol}//${url.host}/blog-data.json`;
      const response = await fetch(blogDataUrl);
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (fallbackError) {
      console.error('Error fetching fallback blog data:', fallbackError);
    }
  }
  
  // Return empty data as last resort
  return { posts: [] };
}

// Get all blog posts
blogRouter.get('/posts', 
  zValidator('query', PaginationSchema),
  async (c) => {
    const { page, limit, search } = c.req.valid('query');
    
    const data = await loadBlogData(c);
    let posts = data.posts || [];
    
    // Search functionality with sanitized input
    if (search) {
      const searchLower = search.toLowerCase();
      posts = posts.filter((post: any) =>
        post.title.toLowerCase().includes(searchLower) ||
        post.excerpt.toLowerCase().includes(searchLower)
      );
    }
    
    // Pagination with validated bounds
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedPosts = posts.slice(start, end);
    
    return c.json({
      posts: paginatedPosts.map((post: any) => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        date: post.date,
        slug: post.slug,
        readTime: post.readTime
      })),
      total: posts.length,
      page: page,
      pages: Math.ceil(posts.length / limit)
    });
  }
);

// Get a single blog post by slug
blogRouter.get('/posts/:slug', async (c) => {
  const slug = c.req.param('slug');
  
  // Validate slug format - alphanumeric with hyphens only
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugRegex.test(slug) || slug.length > 100) {
    return c.json({ 
      error: 'Invalid slug format',
      message: 'Slug must contain only lowercase letters, numbers, and hyphens'
    }, 400);
  }
  
  const data = await loadBlogData(c);
  const posts = data.posts || [];
  
  const post = posts.find((p: any) => p.slug === slug);
  
  if (!post) {
    return c.json({ error: 'Blog post not found' }, 404);
  }
  
  // Content is already HTML, no need to convert
  return c.json(post);
});

// Get related posts
blogRouter.get('/posts/:slug/related', 
  zValidator('query', RelatedPostsSchema),
  async (c) => {
    const slug = c.req.param('slug');
    const { limit } = c.req.valid('query');
    
    // Validate slug format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug) || slug.length > 100) {
      return c.json({ 
        error: 'Invalid slug format',
        message: 'Slug must contain only lowercase letters, numbers, and hyphens'
      }, 400);
    }
    
    const data = await loadBlogData(c);
    const posts = data.posts || [];
    
    // Find current post
    const currentPost = posts.find((p: any) => p.slug === slug);
    if (!currentPost) {
      return c.json({ error: 'Blog post not found' }, 404);
    }
    
    // Get related posts (excluding current)
    const related = posts
      .filter((p: any) => p.slug !== slug)
      .slice(0, limit);
    
    return c.json({
      posts: related.map((post: any) => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        slug: post.slug,
        readTime: post.readTime
      }))
    });
  }
);

// Get blog categories
blogRouter.get('/categories', async (c) => {
  // Return predefined categories for now
  return c.json({
    categories: [
      { id: 'relationships', name: 'Relationships', count: 45 },
      { id: 'body-language', name: 'Body Language', count: 32 },
      { id: 'communication', name: 'Communication', count: 28 },
      { id: 'dating', name: 'Dating', count: 34 }
    ]
  });
});