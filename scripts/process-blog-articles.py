#!/usr/bin/env python3
"""
Script to process blog articles from text files:
- Removes lines starting with "@ Midjourney AI Image Prompt:"
- Removes lines starting with "C:\\Users\\"
- Converts content to clean HTML format
- Saves processed articles to the backend API
"""

import os
import re
import json
from datetime import datetime
from pathlib import Path

def clean_article_content(content):
    """Remove unwanted lines and clean up the article content."""
    lines = content.split('\n')
    cleaned_lines = []
    
    for line in lines:
        # Skip lines that start with unwanted patterns
        if line.strip().startswith('@ Midjourney AI Image Prompt:'):
            continue
        if line.strip().startswith('C:\\Users\\'):
            continue
        
        cleaned_lines.append(line)
    
    return '\n'.join(cleaned_lines)

def convert_to_html(content):
    """Convert cleaned text content to HTML format."""
    lines = content.strip().split('\n')
    html_parts = []
    in_list = False
    
    for i, line in enumerate(lines):
        line = line.strip()
        
        if not line:
            # Empty line
            if in_list:
                html_parts.append('</ul>')
                in_list = False
            continue
        
        # Headers
        if line.startswith('# '):
            if in_list:
                html_parts.append('</ul>')
                in_list = False
            html_parts.append(f'<h1>{line[2:].strip()}</h1>')
        elif line.startswith('## '):
            if in_list:
                html_parts.append('</ul>')
                in_list = False
            html_parts.append(f'<h2>{line[3:].strip()}</h2>')
        elif line.startswith('### '):
            if in_list:
                html_parts.append('</ul>')
                in_list = False
            html_parts.append(f'<h3>{line[4:].strip()}</h3>')
        
        # Lists
        elif line.startswith('- '):
            if not in_list:
                html_parts.append('<ul>')
                in_list = True
            html_parts.append(f'<li>{line[2:].strip()}</li>')
        
        # Bold text
        elif '**' in line:
            if in_list:
                html_parts.append('</ul>')
                in_list = False
            # Replace **text** with <strong>text</strong>
            line = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', line)
            html_parts.append(f'<p>{line}</p>')
        
        # Tables
        elif '|' in line and line.count('|') > 2:
            if in_list:
                html_parts.append('</ul>')
                in_list = False
            
            # Check if it's a separator line
            if all(c in '|-: ' for c in line):
                continue
            
            # Start table if not already started
            if i == 0 or '|' not in lines[i-1]:
                html_parts.append('<table class="blog-table">')
                # This is a header row
                cells = [cell.strip() for cell in line.split('|') if cell.strip()]
                html_parts.append('<thead><tr>')
                for cell in cells:
                    html_parts.append(f'<th>{cell}</th>')
                html_parts.append('</tr></thead><tbody>')
            else:
                # Regular table row
                cells = [cell.strip() for cell in line.split('|') if cell.strip()]
                html_parts.append('<tr>')
                for cell in cells:
                    html_parts.append(f'<td>{cell}</td>')
                html_parts.append('</tr>')
            
            # Check if next line is not a table row
            if i == len(lines) - 1 or '|' not in lines[i+1]:
                html_parts.append('</tbody></table>')
        
        # Regular paragraphs
        else:
            if in_list:
                html_parts.append('</ul>')
                in_list = False
            if line:
                html_parts.append(f'<p>{line}</p>')
    
    # Close any open lists
    if in_list:
        html_parts.append('</ul>')
    
    return '\n'.join(html_parts)

def generate_slug(filename):
    """Generate a URL-friendly slug from the filename."""
    # Remove file extension
    name = os.path.splitext(filename)[0]
    # Replace underscores with hyphens
    slug = name.replace('_', '-').lower()
    # Remove any non-alphanumeric characters except hyphens
    slug = re.sub(r'[^a-z0-9-]', '', slug)
    # Remove multiple consecutive hyphens
    slug = re.sub(r'-+', '-', slug)
    return slug.strip('-')

def extract_excerpt(content, max_length=200):
    """Extract a short excerpt from the content."""
    # Get the first paragraph that's not a header
    lines = content.strip().split('\n')
    for line in lines:
        line = line.strip()
        if line and not line.startswith('#') and not line.startswith('-'):
            # Remove any markdown formatting
            excerpt = re.sub(r'\*\*([^*]+)\*\*', r'\1', line)
            if len(excerpt) > max_length:
                excerpt = excerpt[:max_length].rsplit(' ', 1)[0] + '...'
            return excerpt
    return "Read more about this topic..."

def calculate_read_time(content):
    """Calculate estimated read time based on word count."""
    words = len(content.split())
    # Average reading speed is 200-250 words per minute
    minutes = max(1, round(words / 225))
    return f"{minutes} min read"

def process_article(filepath):
    """Process a single article file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Clean the content
    cleaned_content = clean_article_content(content)
    
    # Convert to HTML
    html_content = convert_to_html(cleaned_content)
    
    # Extract metadata
    filename = os.path.basename(filepath)
    slug = generate_slug(filename)
    
    # Extract title (first # heading or filename)
    title_match = re.search(r'^#\s+(.+)$', cleaned_content, re.MULTILINE)
    title = title_match.group(1) if title_match else filename.replace('_', ' ').replace('.txt', '')
    
    # Create article object
    article = {
        'id': slug,
        'slug': slug,
        'title': title,
        'content': html_content,
        'excerpt': extract_excerpt(cleaned_content),
        'date': datetime.now().strftime('%B %d, %Y'),
        'readTime': calculate_read_time(cleaned_content),
        'filename': filename
    }
    
    return article

def save_articles_to_json(articles, output_path):
    """Save processed articles to a JSON file."""
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump({'posts': articles}, f, indent=2, ensure_ascii=False)

def main():
    """Main function to process all articles."""
    # Directory containing the articles
    articles_dir = Path('/Users/abdulrahim/GitHub Projects/Batch 1')
    
    # Output directory for processed articles
    output_dir = Path('/Users/abdulrahim/GitHub Projects/personality-spark/backend/data')
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Process all .txt files in the directory
    articles = []
    
    if articles_dir.exists():
        for filepath in articles_dir.glob('*.txt'):
            print(f"Processing: {filepath.name}")
            try:
                article = process_article(filepath)
                articles.append(article)
                
                # Also save individual HTML files
                html_path = output_dir / f"{article['slug']}.html"
                with open(html_path, 'w', encoding='utf-8') as f:
                    f.write(article['content'])
                
                print(f"  ✓ Processed successfully")
            except Exception as e:
                print(f"  ✗ Error: {e}")
    
    # Save all articles to JSON
    json_path = output_dir / 'blog-articles.json'
    save_articles_to_json(articles, json_path)
    print(f"\nSaved {len(articles)} articles to {json_path}")

if __name__ == '__main__':
    main()