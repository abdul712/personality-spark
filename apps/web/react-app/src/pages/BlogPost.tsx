import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { LeaderboardAd, InArticleAd, MediumRectangleAd } from '../components/JourneyAd';
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
      fetchBlogPost(slug);
    }
  }, [slug]);

  // Helper function to strip the first <h1> tag from content
  const stripFirstH1 = (content: string): string => {
    // Match the first <h1> tag and its content
    const h1Regex = /<h1[^>]*>.*?<\/h1>/i;
    return content.replace(h1Regex, '').trim();
  };
  
  // Helper function to insert ads within article content
  const insertAdsInContent = (content: string, slug: string): string => {
    // Split content into paragraphs
    const paragraphs = content.split('</p>');
    
    // Insert an ad after every 3-4 paragraphs
    const adInterval = 4;
    let adCount = 0;
    
    const contentWithAds = paragraphs.map((paragraph, index) => {
      // Skip if it's just whitespace or the last item
      if (!paragraph.trim() || index === paragraphs.length - 1) {
        return paragraph;
      }
      
      // Add the closing tag back
      let result = paragraph + '</p>';
      
      // Insert ad after every adInterval paragraphs
      if ((index + 1) % adInterval === 0 && adCount < 2) { // Max 2 in-content ads
        adCount++;
        result += `
          <div class="in-article-ad-wrapper" style="margin: 2rem 0;">
            <div id="journey-in-article-${slug}-${adCount}" 
                 data-journey-placement-id="article-content-${adCount}"
                 style="min-height: 250px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.375rem; display: flex; align-items: center; justify-content: center;">
              <!-- In-article ad will be loaded here -->
            </div>
          </div>
        `;
      }
      
      return result;
    }).join('');
    
    return contentWithAds;
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
        // Fallback to static data
        const fallbackResponse = await fetch('/blog-data.json');
        const fallbackData = await fallbackResponse.json();
        const foundPost = fallbackData.posts.find((p: BlogPost) => p.slug === postSlug);
        if (foundPost) {
          // Strip the first h1 from content
          if (foundPost.content) {
            foundPost.content = stripFirstH1(foundPost.content);
          }
          setPost(foundPost);
        }
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
      // Try fallback
      try {
        const fallbackResponse = await fetch('/blog-data.json');
        const fallbackData = await fallbackResponse.json();
        const foundPost = fallbackData.posts.find((p: BlogPost) => p.slug === postSlug);
        if (foundPost) {
          // Strip the first h1 from content
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
        {/* Top Leaderboard Ad */}
        <LeaderboardAd slotId={`article-${post.slug}-top`} />
        
        <article className="bg-white rounded-xl shadow-md p-8 md:p-12 mt-6">
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
            dangerouslySetInnerHTML={{ __html: insertAdsInContent(post.content, post.slug) }}
          />
          
          {/* Bottom Medium Rectangle Ad */}
          <div className="mt-12 flex justify-center">
            <MediumRectangleAd slotId={`article-${post.slug}-bottom`} />
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;