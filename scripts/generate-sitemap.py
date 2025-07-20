#!/usr/bin/env python3
"""
Generate a sitemap.xml file for the PersonalitySpark website
Includes all static pages, quiz pages, and blog articles
"""

import json
import xml.etree.ElementTree as ET
from xml.dom import minidom
from datetime import datetime
from pathlib import Path

def prettify_xml(elem):
    """Return a pretty-printed XML string for the Element."""
    rough_string = ET.tostring(elem, 'utf-8')
    reparsed = minidom.parseString(rough_string)
    return reparsed.toprettyxml(indent="  ")

def generate_sitemap():
    """Generate the sitemap.xml file."""
    # Base URL for the website
    base_url = "https://personality-spark-api.mabdulrahim.workers.dev"
    
    # Create the root element
    urlset = ET.Element("urlset")
    urlset.set("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9")
    
    # Static pages with their priorities
    static_pages = [
        {"loc": "/", "priority": "1.0", "changefreq": "daily"},
        {"loc": "/quiz-list", "priority": "0.9", "changefreq": "weekly"},
        {"loc": "/blog", "priority": "0.8", "changefreq": "daily"},
    ]
    
    # Quiz types
    quiz_types = [
        "personality",
        "big-five",
        "mbti",
        "enneagram",
        "love-language",
        "career",
        "emotional-intelligence",
        "creativity",
        "leadership",
        "stress-management"
    ]
    
    # Add static pages
    for page in static_pages:
        url = ET.SubElement(urlset, "url")
        loc = ET.SubElement(url, "loc")
        loc.text = base_url + page["loc"]
        
        lastmod = ET.SubElement(url, "lastmod")
        lastmod.text = datetime.now().strftime("%Y-%m-%d")
        
        changefreq = ET.SubElement(url, "changefreq")
        changefreq.text = page["changefreq"]
        
        priority = ET.SubElement(url, "priority")
        priority.text = page["priority"]
    
    # Add quiz pages
    for quiz_type in quiz_types:
        url = ET.SubElement(urlset, "url")
        loc = ET.SubElement(url, "loc")
        loc.text = f"{base_url}/quiz/{quiz_type}"
        
        lastmod = ET.SubElement(url, "lastmod")
        lastmod.text = datetime.now().strftime("%Y-%m-%d")
        
        changefreq = ET.SubElement(url, "changefreq")
        changefreq.text = "weekly"
        
        priority = ET.SubElement(url, "priority")
        priority.text = "0.7"
    
    # Add blog articles
    blog_data_path = Path('/Users/abdulrahim/GitHub Projects/personality-spark/backend/data/blog-articles.json')
    
    if blog_data_path.exists():
        with open(blog_data_path, 'r', encoding='utf-8') as f:
            blog_data = json.load(f)
            
        for post in blog_data.get('posts', []):
            url = ET.SubElement(urlset, "url")
            loc = ET.SubElement(url, "loc")
            loc.text = f"{base_url}/{post['slug']}"
            
            lastmod = ET.SubElement(url, "lastmod")
            # Use current date for blog posts (you can modify this if you track modification dates)
            lastmod.text = datetime.now().strftime("%Y-%m-%d")
            
            changefreq = ET.SubElement(url, "changefreq")
            changefreq.text = "monthly"
            
            priority = ET.SubElement(url, "priority")
            priority.text = "0.6"
    
    # Generate the pretty XML
    xml_string = prettify_xml(urlset)
    
    # Save to multiple locations
    output_paths = [
        Path('/Users/abdulrahim/GitHub Projects/personality-spark/apps/web/react-app/public/sitemap.xml'),
        Path('/Users/abdulrahim/GitHub Projects/personality-spark/personality-spark-api/public/sitemap.xml')
    ]
    
    for output_path in output_paths:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(xml_string)
        print(f"✓ Sitemap saved to: {output_path}")
    
    # Also generate a robots.txt file
    robots_content = """User-agent: *
Allow: /

Sitemap: https://personality-spark-api.mabdulrahim.workers.dev/sitemap.xml

# Block access to API endpoints from crawlers
Disallow: /api/

# Allow search engines to index all content
Allow: /blog
Allow: /quiz/
Allow: /*.html$
Allow: /*.htm$

# Crawl delay (in seconds)
Crawl-delay: 1
"""
    
    robots_paths = [
        Path('/Users/abdulrahim/GitHub Projects/personality-spark/apps/web/react-app/public/robots.txt'),
        Path('/Users/abdulrahim/GitHub Projects/personality-spark/personality-spark-api/public/robots.txt')
    ]
    
    for robots_path in robots_paths:
        robots_path.parent.mkdir(parents=True, exist_ok=True)
        with open(robots_path, 'w', encoding='utf-8') as f:
            f.write(robots_content)
        print(f"✓ robots.txt saved to: {robots_path}")
    
    # Count URLs
    url_count = len(urlset.findall('url'))
    print(f"\n✅ Sitemap generated successfully with {url_count} URLs")
    print(f"📍 Sitemap URL: {base_url}/sitemap.xml")
    print("\n📝 Next steps:")
    print("1. Deploy the changes to your website")
    print("2. Submit the sitemap to Google Search Console:")
    print("   - Go to https://search.google.com/search-console")
    print("   - Select your property")
    print("   - Go to 'Sitemaps' in the left menu")
    print(f"   - Add: {base_url}/sitemap.xml")

if __name__ == '__main__':
    generate_sitemap()