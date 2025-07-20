from fastapi import APIRouter, HTTPException
from typing import List, Optional
import json
from pathlib import Path
from datetime import datetime

router = APIRouter()

# Path to blog data
BLOG_DATA_PATH = Path(__file__).parent.parent.parent / "data" / "blog-articles.json"

# Cache for blog data
blog_cache = None

def load_blog_data():
    """Load blog data from JSON file."""
    global blog_cache
    if blog_cache is None and BLOG_DATA_PATH.exists():
        with open(BLOG_DATA_PATH, 'r', encoding='utf-8') as f:
            blog_cache = json.load(f)
    return blog_cache or {"posts": []}

@router.get("/posts")
async def get_blog_posts(
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None
):
    """Get paginated list of blog posts."""
    data = load_blog_data()
    posts = data.get("posts", [])
    
    # Search functionality
    if search:
        search_lower = search.lower()
        posts = [
            post for post in posts
            if search_lower in post.get("title", "").lower() or
               search_lower in post.get("excerpt", "").lower()
        ]
    
    # Pagination
    start = (page - 1) * limit
    end = start + limit
    paginated_posts = posts[start:end]
    
    # Return only necessary fields for listing
    return {
        "posts": [
            {
                "id": post["id"],
                "title": post["title"],
                "excerpt": post["excerpt"],
                "date": post["date"],
                "slug": post["slug"],
                "readTime": post["readTime"]
            }
            for post in paginated_posts
        ],
        "total": len(posts),
        "page": page,
        "pages": (len(posts) + limit - 1) // limit
    }

@router.get("/posts/{slug}")
async def get_blog_post(slug: str):
    """Get a single blog post by slug."""
    data = load_blog_data()
    posts = data.get("posts", [])
    
    # Find post by slug
    post = next((p for p in posts if p.get("slug") == slug), None)
    
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    return post

@router.get("/posts/related/{slug}")
async def get_related_posts(slug: str, limit: int = 5):
    """Get related blog posts based on current post."""
    data = load_blog_data()
    posts = data.get("posts", [])
    
    # Find current post
    current_post = next((p for p in posts if p.get("slug") == slug), None)
    if not current_post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    # Simple related posts: just get other posts excluding current one
    # In a real implementation, you'd use tags, categories, or ML to find related content
    related = [p for p in posts if p.get("slug") != slug][:limit]
    
    return {
        "posts": [
            {
                "id": post["id"],
                "title": post["title"],
                "excerpt": post["excerpt"],
                "slug": post["slug"],
                "readTime": post["readTime"]
            }
            for post in related
        ]
    }

@router.get("/categories")
async def get_blog_categories():
    """Get list of blog categories."""
    # For now, return predefined categories
    # In a real implementation, these would be extracted from posts
    return {
        "categories": [
            {"id": "relationships", "name": "Relationships", "count": 45},
            {"id": "body-language", "name": "Body Language", "count": 32},
            {"id": "communication", "name": "Communication", "count": 28},
            {"id": "dating", "name": "Dating", "count": 34}
        ]
    }