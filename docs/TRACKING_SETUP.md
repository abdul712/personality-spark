# Tracking Scripts Setup Guide

This guide explains how to add various tracking scripts to your PersonalitySpark website.

## Quick Setup

1. Copy the `.env.example` file to `.env` in the `apps/web/react-app` directory:
   ```bash
   cd apps/web/react-app
   cp .env.example .env
   ```

2. Edit the `.env` file and add your tracking IDs.

## Available Tracking Options

### 1. Google Analytics

To add Google Analytics:

1. Create a Google Analytics 4 property at [analytics.google.com](https://analytics.google.com)
2. Get your Measurement ID (format: G-XXXXXXXXXX)
3. Add it to your `.env` file:
   ```
   REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

### 2. Google Search Console

To verify your site with Google Search Console:

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property
3. Choose "HTML tag" verification method
4. Copy just the content value from the meta tag
5. Add it to your `.env` file:
   ```
   REACT_APP_GOOGLE_SITE_VERIFICATION=your-verification-token
   ```

### 3. Facebook Pixel

To add Facebook Pixel tracking:

1. Get your Pixel ID from Facebook Business Manager
2. Add it to your `.env` file:
   ```
   REACT_APP_FB_PIXEL_ID=your-pixel-id
   ```

### 4. Custom Scripts

You can add any custom scripts to the head or body:

```
REACT_APP_CUSTOM_HEAD_SCRIPTS=<script>console.log('Custom head script');</script>
REACT_APP_CUSTOM_BODY_SCRIPTS=<script>console.log('Custom body script');</script>
```

## How It Works

The tracking system automatically:
- Injects scripts into the appropriate location (head or body)
- Only loads scripts that have valid IDs configured
- Prevents duplicate script injection
- Works with client-side routing

## Sitemap Submission

A sitemap has been generated for your website. To submit it to Google:

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property
3. Click on "Sitemaps" in the left menu
4. Enter: `https://personality-spark-api.mabdulrahim.workers.dev/sitemap.xml`
5. Click "Submit"

The sitemap includes:
- All static pages
- All quiz types
- All blog articles
- Proper priorities and change frequencies

## Robots.txt

A `robots.txt` file has also been created that:
- Allows all search engines to crawl your site
- Blocks API endpoints from being crawled
- References your sitemap location
- Sets a reasonable crawl delay

## Regenerating the Sitemap

To regenerate the sitemap after adding new content:

```bash
cd /Users/abdulrahim/GitHub\ Projects/personality-spark
python3 scripts/generate-sitemap.py
```

## Deployment

After configuring your tracking scripts:

1. Build the React app:
   ```bash
   cd apps/web/react-app
   npm run build
   ```

2. Deploy to Cloudflare:
   ```bash
   git add .
   git commit -m "Add tracking scripts and sitemap"
   git push origin main
   ```

The tracking scripts will be automatically included in your deployed website.

## Privacy Considerations

Remember to update your privacy policy to mention the tracking scripts you're using, especially if you're collecting user data through Google Analytics, Facebook Pixel, or similar services.