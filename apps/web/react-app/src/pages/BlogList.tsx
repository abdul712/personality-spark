import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Footer } from '../components/Footer';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  slug: string;
  readTime: string;
}

interface ChunkInfo {
  file: string;
  posts: number;
}

const POSTS_PER_PAGE = 20;

const BlogList: React.FC = () => {
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [displayedPosts, setDisplayedPosts] = useState<BlogPost[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  useEffect(() => {
    // Update displayed posts when page changes
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    setDisplayedPosts(allPosts.slice(startIndex, endIndex));
  }, [currentPage, allPosts]);

  const fetchBlogPosts = async () => {
    try {
      const response = await fetch('/api/v1/blog/posts?limit=3000');
      const data = await response.json();
      if (data.posts && data.posts.length > 0) {
        setAllPosts(data.posts);
        setTotalPages(Math.ceil(data.posts.length / POSTS_PER_PAGE));
      } else {
        throw new Error('No posts in API response');
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      // Fallback to static data - load from chunks
      try {
        // First, load the index to know how many chunks we have
        const indexResponse = await fetch('/blog-index.json');
        if (!indexResponse.ok) throw new Error('Failed to fetch blog index');
        const indexData = await indexResponse.json();
        
        // Load all chunks in parallel with full URL
        const chunkPromises = indexData.chunks.map((chunk: ChunkInfo) => 
          fetch(`/${chunk.file}`).then(res => {
            if (!res.ok) throw new Error(`Failed to fetch ${chunk.file}`);
            return res.json();
          })
        );
        
        const chunks = await Promise.all(chunkPromises);
        
        // Combine all posts from chunks
        const allPostsFromChunks = chunks.flatMap(chunk => chunk.posts);
        
        console.log(`Loaded ${allPostsFromChunks.length} posts from ${chunks.length} chunks`);
        
        setAllPosts(allPostsFromChunks);
        setTotalPages(Math.ceil(allPostsFromChunks.length / POSTS_PER_PAGE));
      } catch (fallbackError) {
        console.error('Error fetching fallback data:', fallbackError);
        // Try original blog-data.json as last resort
        try {
          const fallbackResponse = await fetch('/blog-data.json');
          const fallbackData = await fallbackResponse.json();
          setAllPosts(fallbackData.posts || []);
          setTotalPages(Math.ceil((fallbackData.posts || []).length / POSTS_PER_PAGE));
        } catch (lastError) {
          console.error('Error fetching original blog data:', lastError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <nav className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-purple-600 hover:text-purple-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Personality Insights Blog</h1>
          <p className="text-xl text-gray-600">Discover insights about personality, relationships, and self-discovery</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayedPosts.map((post) => (
                <React.Fragment key={post.id}>
                  <Link
                    to={`/${post.slug}`}
                    className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  >
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>{post.date}</span>
                        <span className="mx-2">•</span>
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </Link>
                </React.Fragment>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            currentPage === page
                              ? 'bg-purple-600 text-white'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-1 py-2 text-gray-500">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
            
            <div className="mt-4 text-center text-sm text-gray-600">
              Showing {((currentPage - 1) * POSTS_PER_PAGE) + 1}-{Math.min(currentPage * POSTS_PER_PAGE, allPosts.length)} of {allPosts.length} articles
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BlogList;