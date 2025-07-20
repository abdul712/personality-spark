import { Hono } from 'hono';
import type { Context } from '../types/env';

export const blogRouter = new Hono<Context>();

// Static blog data (will be replaced with D1 database later)
const blogData = {
  posts: [] as any[]
};

// Load blog data from KV storage or use static data
async function loadBlogData(c: Context['var']) {
  try {
    // Try to get blog data from KV storage
    const cached = await c.env.CACHE.get('blog-data', 'json');
    if (cached) {
      return cached;
    }
    
    // If not in cache, return empty for now
    // In production, this would load from D1 database
    return blogData;
  } catch (error) {
    console.error('Error loading blog data:', error);
    return blogData;
  }
}

// Get all blog posts
blogRouter.get('/posts', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const search = c.req.query('search');
  
  const data = await loadBlogData(c.var);
  let posts = data.posts || [];
  
  // Search functionality
  if (search) {
    const searchLower = search.toLowerCase();
    posts = posts.filter((post: any) =>
      post.title.toLowerCase().includes(searchLower) ||
      post.excerpt.toLowerCase().includes(searchLower)
    );
  }
  
  // Pagination
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
});

// Get a single blog post by slug
blogRouter.get('/posts/:slug', async (c) => {
  const slug = c.req.param('slug');
  const data = await loadBlogData(c.var);
  const posts = data.posts || [];
  
  const post = posts.find((p: any) => p.slug === slug);
  
  if (!post) {
    return c.json({ error: 'Blog post not found' }, 404);
  }
  
  return c.json(post);
});

// Get related posts
blogRouter.get('/posts/:slug/related', async (c) => {
  const slug = c.req.param('slug');
  const limit = parseInt(c.req.query('limit') || '5');
  
  const data = await loadBlogData(c.var);
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
});

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