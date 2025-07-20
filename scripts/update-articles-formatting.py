#!/usr/bin/env python3
"""
Script to update all blog articles with:
1. Proper formatting (bold text using <strong> tags)
2. External links to authoritative sources (Wikipedia, psychology websites)
3. Internal links between related articles
"""

import json
import re
import random
from pathlib import Path
from typing import Dict, List, Tuple
import time

# External link resources
EXTERNAL_LINKS = {
    # Psychology and personality topics
    "personality": "https://en.wikipedia.org/wiki/Personality_psychology",
    "psychology": "https://en.wikipedia.org/wiki/Psychology",
    "relationship": "https://en.wikipedia.org/wiki/Interpersonal_relationship",
    "communication": "https://en.wikipedia.org/wiki/Communication",
    "body language": "https://en.wikipedia.org/wiki/Body_language",
    "non-verbal": "https://en.wikipedia.org/wiki/Nonverbal_communication",
    "nonverbal": "https://en.wikipedia.org/wiki/Nonverbal_communication",
    "emotional intelligence": "https://en.wikipedia.org/wiki/Emotional_intelligence",
    "attachment": "https://en.wikipedia.org/wiki/Attachment_theory",
    "love": "https://en.wikipedia.org/wiki/Love",
    "attraction": "https://en.wikipedia.org/wiki/Interpersonal_attraction",
    "trust": "https://en.wikipedia.org/wiki/Trust_(emotion)",
    "anxiety": "https://en.wikipedia.org/wiki/Anxiety",
    "stress": "https://en.wikipedia.org/wiki/Psychological_stress",
    "depression": "https://en.wikipedia.org/wiki/Depression_(mood)",
    "self-esteem": "https://en.wikipedia.org/wiki/Self-esteem",
    "confidence": "https://en.wikipedia.org/wiki/Confidence",
    "empathy": "https://en.wikipedia.org/wiki/Empathy",
    "mindfulness": "https://en.wikipedia.org/wiki/Mindfulness",
    "meditation": "https://en.wikipedia.org/wiki/Meditation",
    "cognitive": "https://en.wikipedia.org/wiki/Cognition",
    "behavior": "https://en.wikipedia.org/wiki/Human_behavior",
    "behaviour": "https://en.wikipedia.org/wiki/Human_behavior",
    "emotion": "https://en.wikipedia.org/wiki/Emotion",
    "feeling": "https://en.wikipedia.org/wiki/Feeling",
    "intimacy": "https://en.wikipedia.org/wiki/Intimate_relationship",
    "friendship": "https://en.wikipedia.org/wiki/Friendship",
    "social": "https://en.wikipedia.org/wiki/Social_psychology",
    "dating": "https://en.wikipedia.org/wiki/Dating",
    "marriage": "https://en.wikipedia.org/wiki/Marriage",
    "conflict": "https://en.wikipedia.org/wiki/Conflict_resolution",
    "boundaries": "https://en.wikipedia.org/wiki/Personal_boundaries",
    "attachment style": "https://en.wikipedia.org/wiki/Attachment_in_adults",
    "emotional regulation": "https://en.wikipedia.org/wiki/Emotional_self-regulation",
    "mental health": "https://en.wikipedia.org/wiki/Mental_health",
    "well-being": "https://en.wikipedia.org/wiki/Well-being",
    "happiness": "https://en.wikipedia.org/wiki/Happiness",
    "resilience": "https://en.wikipedia.org/wiki/Psychological_resilience",
    "vulnerability": "https://en.wikipedia.org/wiki/Vulnerability",
    "authenticity": "https://en.wikipedia.org/wiki/Authenticity_(philosophy)",
    "self-awareness": "https://en.wikipedia.org/wiki/Self-awareness",
    "emotional connection": "https://en.wikipedia.org/wiki/Emotional_intimacy",
    "compatibility": "https://en.wikipedia.org/wiki/Interpersonal_compatibility",
    "commitment": "https://en.wikipedia.org/wiki/Commitment",
    "flirting": "https://en.wikipedia.org/wiki/Flirting",
    "romance": "https://en.wikipedia.org/wiki/Romance_(love)"
}

def fix_bold_formatting(content: str) -> str:
    """Fix bold text formatting by converting **text** to <strong>text</strong>"""
    # Pattern to match **text** but not already converted <strong> tags
    pattern = r'\*\*([^*]+)\*\*'
    
    def replace_bold(match):
        text = match.group(1)
        # Skip if it's already within a <strong> tag
        if '<strong>' in text or '</strong>' in text:
            return match.group(0)
        return f'<strong>{text}</strong>'
    
    # First pass: convert **text** to <strong>text</strong>
    content = re.sub(pattern, replace_bold, content)
    
    # Second pass: ensure list items with bold text are properly formatted
    # Fix patterns like "**text**: description" in lists
    content = re.sub(r'<li><strong>([^<]+)</strong>:\s*', r'<li><strong>\1</strong>: ', content)
    
    return content

def add_external_link(content: str, term: str, url: str, already_linked: set) -> Tuple[str, bool]:
    """Add a single external link to the content for the given term"""
    if term.lower() in already_linked:
        return content, False
    
    # Create patterns to find the term (case-insensitive)
    patterns = [
        # In paragraphs
        (rf'(<p>[^<]*?)\b({re.escape(term)})\b([^<]*?</p>)', r'\1<a href="' + url + r'" target="_blank" rel="noopener">\2</a>\3'),
        # In list items
        (rf'(<li>[^<]*?)\b({re.escape(term)})\b([^<]*?</li>)', r'\1<a href="' + url + r'" target="_blank" rel="noopener">\2</a>\3'),
        # In headings (but we'll be more selective)
        (rf'(<h[2-3]>[^<]*?)\b({re.escape(term)})\b([^<]*?</h[2-3]>)', r'\1<a href="' + url + r'" target="_blank" rel="noopener">\2</a>\3'),
    ]
    
    for pattern, replacement in patterns:
        # Check if we can find the term
        match = re.search(pattern, content, re.IGNORECASE)
        if match:
            # Make sure we're not linking inside an existing link
            full_match = match.group(0)
            if '<a ' not in full_match and '</a>' not in full_match:
                # Replace only the first occurrence
                new_content = re.sub(pattern, replacement, content, count=1, flags=re.IGNORECASE)
                if new_content != content:
                    already_linked.add(term.lower())
                    return new_content, True
    
    return content, False

def add_external_links(content: str) -> str:
    """Add external links to Wikipedia and other authoritative sources"""
    already_linked = set()
    links_added = 0
    max_links = 3  # Limit external links per article
    
    # Sort terms by length (longer first) to avoid partial matches
    sorted_terms = sorted(EXTERNAL_LINKS.items(), key=lambda x: len(x[0]), reverse=True)
    
    # First, try to add links for longer, more specific terms
    for term, url in sorted_terms:
        if links_added >= max_links:
            break
        content, added = add_external_link(content, term, url, already_linked)
        if added:
            links_added += 1
    
    # If we haven't added enough links, try shorter terms
    if links_added < max_links:
        for term, url in sorted_terms:
            if links_added >= max_links:
                break
            if term.lower() not in already_linked:
                content, added = add_external_link(content, term, url, already_linked)
                if added:
                    links_added += 1
    
    return content

def find_related_articles(current_article: Dict, all_articles: List[Dict], max_links: int = 5) -> List[Tuple[str, str, str]]:
    """Find related articles based on title and content similarity"""
    related = []
    current_title_words = set(current_article['title'].lower().split())
    current_slug = current_article['slug']
    
    # Keywords to look for in titles
    keywords_in_current = []
    for keyword in ['relationship', 'personality', 'love', 'attraction', 'communication', 
                    'body language', 'dating', 'flirting', 'emotional', 'trust', 'intimacy',
                    'signs', 'mean', 'guy', 'girl', 'woman', 'man', 'partner']:
        if keyword in current_article['title'].lower() or keyword in current_article['content'].lower()[:500]:
            keywords_in_current.append(keyword)
    
    # Score each article based on relevance
    scored_articles = []
    for article in all_articles:
        if article['slug'] == current_slug:
            continue
        
        score = 0
        other_title_words = set(article['title'].lower().split())
        
        # Title word overlap
        common_words = current_title_words & other_title_words
        # Exclude common words
        common_words = common_words - {'the', 'a', 'an', 'is', 'it', 'when', 'what', 'how', 'why', 'does', 'do', 'your', 'you'}
        score += len(common_words) * 3
        
        # Keyword matches
        for keyword in keywords_in_current:
            if keyword in article['title'].lower():
                score += 2
            if keyword in article['content'].lower()[:500]:
                score += 1
        
        # Special boost for similar article types
        if 'what does it mean' in current_article['title'].lower() and 'what does it mean' in article['title'].lower():
            score += 5
        if 'signs' in current_article['title'].lower() and 'signs' in article['title'].lower():
            score += 5
        
        if score > 0:
            scored_articles.append((score, article))
    
    # Sort by score and take top matches
    scored_articles.sort(key=lambda x: x[0], reverse=True)
    
    for score, article in scored_articles[:max_links]:
        # Find a good anchor text from the current article's content
        # Look for mentions of relevant keywords that we can link
        anchor_text = None
        article_title_words = article['title'].lower().split()
        
        # Try to find a natural phrase to link
        for word in article_title_words:
            if len(word) > 4 and word not in ['what', 'does', 'mean', 'when', 'your']:
                # Look for this word in the content
                pattern = rf'\b{re.escape(word)}(?:ing|s|ed|es)?\b'
                match = re.search(pattern, current_article['content'], re.IGNORECASE)
                if match:
                    anchor_text = match.group(0)
                    break
        
        if anchor_text:
            related.append((anchor_text, article['slug'], article['title']))
    
    return related

def add_internal_links(content: str, related_articles: List[Tuple[str, str, str]], article_slug: str) -> str:
    """Add internal links to related articles"""
    already_linked_slugs = set()
    links_added = 0
    
    for anchor_text, slug, title in related_articles:
        if slug in already_linked_slugs or links_added >= 5:
            continue
        
        # Create the internal link
        link = f'<a href="/blog/{slug}" title="{title}">{anchor_text}</a>'
        
        # Find where to add the link (case-insensitive)
        patterns = [
            # In paragraphs
            (rf'(<p>[^<]*?)\b({re.escape(anchor_text)})\b([^<]*?</p>)', rf'\1{link}\3'),
            # In list items
            (rf'(<li>[^<]*?)\b({re.escape(anchor_text)})\b([^<]*?</li>)', rf'\1{link}\3'),
        ]
        
        for pattern, replacement in patterns:
            # Check if we can find the anchor text
            match = re.search(pattern, content, re.IGNORECASE)
            if match:
                # Make sure we're not linking inside an existing link or strong tag
                full_match = match.group(0)
                if '<a ' not in full_match and '</a>' not in full_match and '<strong>' not in full_match:
                    # Replace only the first occurrence
                    new_content = re.sub(pattern, replacement, content, count=1, flags=re.IGNORECASE)
                    if new_content != content:
                        content = new_content
                        already_linked_slugs.add(slug)
                        links_added += 1
                        break
    
    return content

def update_article(article: Dict, all_articles: List[Dict]) -> Dict:
    """Update a single article with formatting and links"""
    # Create a copy of the article
    updated_article = article.copy()
    
    # Fix bold formatting
    updated_content = fix_bold_formatting(article['content'])
    
    # Add external links
    updated_content = add_external_links(updated_content)
    
    # Find related articles and add internal links
    related_articles = find_related_articles(article, all_articles)
    updated_content = add_internal_links(updated_content, related_articles, article['slug'])
    
    # Update the article content
    updated_article['content'] = updated_content
    
    # Also update the excerpt if it contains bold formatting
    if 'excerpt' in updated_article:
        updated_article['excerpt'] = re.sub(r'\*\*([^*]+)\*\*', r'\1', updated_article['excerpt'])
    
    return updated_article

def main():
    """Main function to update all articles"""
    # Load existing articles
    blog_data_path = Path('/Users/abdulrahim/GitHub Projects/personality-spark/backend/data/blog-articles.json')
    
    print("Loading existing articles...")
    with open(blog_data_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        articles = data['posts']
    
    print(f"Found {len(articles)} articles to update")
    
    # Update each article
    updated_articles = []
    for i, article in enumerate(articles):
        if i % 50 == 0:
            print(f"Processing article {i+1}/{len(articles)}...")
        
        updated_article = update_article(article, articles)
        updated_articles.append(updated_article)
        
        # Update the individual HTML file
        html_path = blog_data_path.parent / f"{article['slug']}.html"
        if html_path.exists():
            with open(html_path, 'w', encoding='utf-8') as f:
                f.write(updated_article['content'])
        
        # Small delay to avoid overwhelming the system
        if i % 10 == 0:
            time.sleep(0.1)
    
    # Save updated articles
    print("\nSaving updated articles...")
    updated_data = {'posts': updated_articles}
    with open(blog_data_path, 'w', encoding='utf-8') as f:
        json.dump(updated_data, f, indent=2, ensure_ascii=False)
    
    # Copy to public directories
    print("\nCopying to public directories...")
    public_paths = [
        Path('/Users/abdulrahim/GitHub Projects/personality-spark/apps/web/public/blog-data.json'),
        Path('/Users/abdulrahim/GitHub Projects/personality-spark/apps/web/react-app/public/blog-data.json'),
        Path('/Users/abdulrahim/GitHub Projects/personality-spark/personality-spark-api/public/blog-data.json'),
    ]
    
    for public_path in public_paths:
        if public_path.parent.exists():
            with open(public_path, 'w', encoding='utf-8') as f:
                json.dump(updated_data, f, indent=2, ensure_ascii=False)
            print(f"  ✓ Updated {public_path}")
    
    print("\n✅ All articles updated successfully!")
    print(f"  - Fixed bold formatting")
    print(f"  - Added external links to authoritative sources")
    print(f"  - Added internal links between related articles")

if __name__ == '__main__':
    main()