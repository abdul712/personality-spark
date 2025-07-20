#!/usr/bin/env python3
"""
Script to import articles from multiple batch folders into the personality-spark blog system.
This script processes articles from the Articles directory batch by batch to avoid timeout issues.
"""

import os
import re
import json
import argparse
from datetime import datetime
from pathlib import Path
import time

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
    skip_first_h1 = True  # Skip the first H1 since it's shown in the component
    
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
            if skip_first_h1:
                skip_first_h1 = False
                continue  # Skip the first H1
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
        
        # Numbered lists
        elif re.match(r'^\d+\.\s+', line):
            if in_list:
                html_parts.append('</ul>')
                in_list = False
            # Extract the content after the number
            list_content = re.sub(r'^\d+\.\s+', '', line)
            # Check if we need to start an ordered list
            if not html_parts or not html_parts[-1].endswith('</ol>'):
                # Check if previous line was also a numbered list
                prev_line = lines[i-1].strip() if i > 0 else ''
                if not re.match(r'^\d+\.\s+', prev_line):
                    html_parts.append('<ol>')
            html_parts.append(f'<li>{list_content}</li>')
            # Check if next line is not a numbered list to close the ol tag
            next_line = lines[i+1].strip() if i < len(lines) - 1 else ''
            if not re.match(r'^\d+\.\s+', next_line):
                html_parts.append('</ol>')
        
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

def load_existing_articles(json_path):
    """Load existing articles from JSON file."""
    if json_path.exists():
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data.get('posts', [])
    return []

def save_articles_to_json(articles, output_path):
    """Save processed articles to a JSON file."""
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump({'posts': articles}, f, indent=2, ensure_ascii=False)

def process_batch(batch_dir, output_dir, existing_articles, existing_slugs):
    """Process all articles in a single batch directory."""
    batch_name = batch_dir.name
    processed_count = 0
    skipped_count = 0
    
    print(f"\nProcessing {batch_name}...")
    
    if not batch_dir.exists():
        print(f"  ✗ Directory not found: {batch_dir}")
        return processed_count, skipped_count
    
    txt_files = list(batch_dir.glob('*.txt'))
    print(f"  Found {len(txt_files)} .txt files")
    
    for filepath in txt_files:
        try:
            # Check if article already exists
            slug = generate_slug(filepath.name)
            if slug in existing_slugs:
                print(f"  → Skipping {filepath.name} (already imported)")
                skipped_count += 1
                continue
            
            print(f"  Processing: {filepath.name}")
            article = process_article(filepath)
            existing_articles.append(article)
            existing_slugs.add(slug)
            
            # Save individual HTML file
            html_path = output_dir / f"{article['slug']}.html"
            with open(html_path, 'w', encoding='utf-8') as f:
                f.write(article['content'])
            
            print(f"  ✓ Processed successfully")
            processed_count += 1
            
            # Add a small delay to avoid overwhelming the system
            time.sleep(0.1)
            
        except Exception as e:
            print(f"  ✗ Error processing {filepath.name}: {e}")
    
    return processed_count, skipped_count

def main():
    """Main function to process articles from multiple batch folders."""
    parser = argparse.ArgumentParser(description='Import articles from batch folders')
    parser.add_argument('--articles-dir', type=str, 
                        default='/Users/abdulrahim/GitHub Projects/Articles',
                        help='Directory containing the batch folders')
    parser.add_argument('--output-dir', type=str,
                        default='/Users/abdulrahim/GitHub Projects/personality-spark/backend/data',
                        help='Output directory for processed articles')
    parser.add_argument('--batches', nargs='+', 
                        help='Specific batch folders to process (e.g., "Batch 10" "Batch 11")')
    
    args = parser.parse_args()
    
    # Set up paths
    articles_base_dir = Path(args.articles_dir)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Load existing articles
    json_path = output_dir / 'blog-articles.json'
    existing_articles = load_existing_articles(json_path)
    existing_slugs = {article['slug'] for article in existing_articles}
    
    print(f"Found {len(existing_articles)} existing articles")
    
    # Determine which batches to process
    if args.batches:
        batch_dirs = [articles_base_dir / batch for batch in args.batches]
    else:
        # Process all batch directories
        batch_dirs = sorted([d for d in articles_base_dir.iterdir() 
                            if d.is_dir() and d.name.startswith('Batch')])
    
    # Process each batch
    total_processed = 0
    total_skipped = 0
    
    for batch_dir in batch_dirs:
        processed, skipped = process_batch(batch_dir, output_dir, existing_articles, existing_slugs)
        total_processed += processed
        total_skipped += skipped
        
        # Save progress after each batch
        save_articles_to_json(existing_articles, json_path)
        print(f"  Saved progress: {len(existing_articles)} total articles")
    
    # Final save
    save_articles_to_json(existing_articles, json_path)
    
    print(f"\n{'='*50}")
    print(f"Import Summary:")
    print(f"  Total articles: {len(existing_articles)}")
    print(f"  Newly processed: {total_processed}")
    print(f"  Skipped (already imported): {total_skipped}")
    print(f"  Output saved to: {json_path}")
    
    # Also update the public blog data file
    public_json_path = Path(args.output_dir).parent.parent / 'public' / 'blog-data.json'
    if public_json_path.parent.exists():
        save_articles_to_json(existing_articles, public_json_path)
        print(f"  Public data updated: {public_json_path}")

if __name__ == '__main__':
    main()