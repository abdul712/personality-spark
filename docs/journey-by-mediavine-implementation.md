# Journey by Mediavine Implementation Guide

## Overview

Journey by Mediavine is an ad management solution for growing websites. Unlike traditional ad networks, Journey has specific limitations and requirements that are important to understand.

## Key Implementation Details

### Script Tag

The Journey script must be included in the `<head>` section of your HTML:

```html
<script type="text/javascript" async="async" data-noptimize="1" data-cfasync="false" src="//scripts.scriptwrapper.com/tags/YOUR-PUBLISHER-ID.js"></script>
```

**Important attributes:**
- `async="async"` - Ensures non-blocking load
- `data-noptimize="1"` - Prevents optimization plugins from modifying the script
- `data-cfasync="false"` - Prevents Cloudflare Rocket Loader from interfering

### Publisher ID

Our publisher ID: `cd1147c1-3ea2-4dea-b685-660b90e8962e`

## Important Limitations

### No Manual Ad Placement

**Journey by Mediavine does NOT support manual ad placement.** This is a critical limitation:

1. **Automatic Placement Only**: Journey automatically places ads within blog post content
2. **No Custom Positioning**: You cannot specify where ads appear
3. **Blog Posts Only**: Ads only appear on long-form content/blog posts
4. **No Homepage Ads**: Only adhesion banner and universal video player show on homepages

### What This Means for Our Implementation

1. **No JavaScript API**: There's no `window.journey()` or similar API for manual control
2. **Ad Components Are Placeholders**: Our `JourneyAd` React components serve only as placeholders
3. **Automatic Optimization**: Journey handles all ad placement and optimization automatically

## Script Optimization Conflicts

To ensure ads load consistently, exclude the Journey script from:

1. **JavaScript minification**
2. **JavaScript combining/bundling**
3. **Lazy loading (for iframes)**
4. **Cloudflare Rocket Loader**

Add "scriptwrapper" to exclusion lists in optimization plugins.

## Implementation Checklist

- [x] Added Journey script to index.html with correct attributes
- [x] Used correct publisher ID in script URL
- [x] Updated React components to reflect Journey's limitations
- [x] Added appropriate code comments about automatic placement
- [ ] Excluded script from optimization plugins (if applicable)
- [ ] Tested on actual blog post content

## Common Issues

1. **Ads Not Showing**: Ensure you're viewing blog post content, not homepage
2. **Script Conflicts**: Check for optimization plugins interfering with the script
3. **Page Builders**: Journey is not compatible with most page builders

## Support

For issues, contact Journey support through their Zendesk: https://journeymv.zendesk.com/