import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Footer } from '../components/Footer';
import '../styles/blog.css';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  date: string;
  readTime: string;
  slug: string;
}

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      // Don't try to fetch JSON files as blog posts
      if (slug.endsWith('.json')) {
        window.location.href = `/${slug}`;
        return;
      }
      fetchBlogPost(slug);
    }
  }, [slug]);

  // Helper function to strip the first <h1> tag from content
  const stripFirstH1 = (content: string): string => {
    // Match the first <h1> tag and its content
    const h1Regex = /<h1[^>]*>.*?<\/h1>/i;
    return content.replace(h1Regex, '').trim();
  };
  

  const fetchBlogPost = async (postSlug: string) => {
    try {
      const response = await fetch(`/api/v1/blog/posts/${postSlug}`);
      if (response.ok) {
        const data = await response.json();
        // Strip the first h1 from content
        if (data.content) {
          data.content = stripFirstH1(data.content);
        }
        setPost(data);
      } else {
        // Fallback to static data - try chunks first
        try {
          const indexResponse = await fetch('/blog-index.json');
          const indexData = await indexResponse.json();
          
          // Load chunks and search for the post
          let foundPost = null;
          for (const chunkInfo of indexData.chunks) {
            const chunkResponse = await fetch(`/${chunkInfo.file}`);
            const chunkData = await chunkResponse.json();
            foundPost = chunkData.posts.find((p: BlogPost) => p.slug === postSlug);
            if (foundPost) break;
          }
          
          if (foundPost) {
            if (foundPost.content) {
              foundPost.content = stripFirstH1(foundPost.content);
            }
            setPost(foundPost);
          }
        } catch (chunkError) {
          // Last resort: try original blog-data.json
          const fallbackResponse = await fetch('/blog-data.json');
          const fallbackData = await fallbackResponse.json();
          const foundPost = fallbackData.posts.find((p: BlogPost) => p.slug === postSlug);
          if (foundPost) {
            if (foundPost.content) {
              foundPost.content = stripFirstH1(foundPost.content);
            }
            setPost(foundPost);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
      // Try fallback with chunks
      try {
        const indexResponse = await fetch('/blog-index.json');
        const indexData = await indexResponse.json();
        
        // Load chunks and search for the post
        let foundPost = null;
        for (const chunkInfo of indexData.chunks) {
          const chunkResponse = await fetch(`/${chunkInfo.file}`);
          const chunkData = await chunkResponse.json();
          foundPost = chunkData.posts.find((p: BlogPost) => p.slug === postSlug);
          if (foundPost) break;
        }
        
        if (foundPost) {
          if (foundPost.content) {
            foundPost.content = stripFirstH1(foundPost.content);
          }
          setPost(foundPost);
        }
      } catch (fallbackError) {
        console.error('Error fetching fallback data:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Post not found</h1>
          <Link to="/blog" className="text-purple-600 hover:text-purple-700">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <nav className="flex items-center justify-between">
            <Link to="/blog" className="flex items-center gap-2 text-purple-600 hover:text-purple-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Blog
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <article className="bg-white rounded-xl shadow-md p-8 md:p-12">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{post.title}</h1>
            <div className="flex items-center text-sm text-gray-500">
              <span>{post.date}</span>
              <span className="mx-2">•</span>
              <span>{post.readTime}</span>
            </div>
          </header>

          <div 
            className="prose prose-lg max-w-none blog-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;