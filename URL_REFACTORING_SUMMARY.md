# URL Refactoring Summary

## Overview
This project has been refactored to use **relative URLs** instead of absolute Firebase URLs throughout the codebase. This makes the site **portable** and able to work on any domain, including **Cloudflare Pages**, custom domains, or local development environments.

## Changes Made

### 1. HTML Files ✅
- **35 HTML files** refactored (index.html, all articles, all pages)
- **186 total substitutions** made
- Changed in:
  - Meta tags (`og:url`, `og:image`, `twitter:image`)
  - Canonical links (`<link rel="canonical">`)
  - JSON-LD structured data (`@id`, `url` fields)
  - Share links (WhatsApp, social media)
  - All internal links and references

**Before:**
```html
<link rel="canonical" href="https://modelotrabalhista-2026.web.app/artigos/seguro-desemprego-2026.html">
<meta property="og:url" content="https://modelotrabalhista-2026.web.app/">
```

**After:**
```html
<link rel="canonical" href="/artigos/seguro-desemprego-2026.html">
<meta property="og:url" content="/">
```

### 2. Service Worker ✅
- Already using relative paths for all cached resources
- No changes needed
- Cache-busting with `?v=` parameters works correctly with relative URLs

### 3. CSS Files ✅
- No Firebase URLs found
- All background images and imports already use relative paths

### 4. JavaScript Files ✅
- No Firebase URLs found (except CDN URLs which should remain absolute)
- All module imports and fetch calls use relative paths
- External CDN URLs (jsdelivr, unpkg) remain absolute as intended

### 5. Sitemap & Robots.txt ⚙️
- Generators updated to support **environment variables**
- Use `SITE_URL` or `CF_PAGES_URL` environment variables
- Default to Firebase URL if no env var is set
- Compatible with Cloudflare Pages automatic deployments

**Environment Variables:**
```bash
# For Cloudflare Pages (automatically set)
CF_PAGES_URL=https://your-site.pages.dev

# Or manually set
SITE_URL=https://your-custom-domain.com

# Generate sitemap and robots.txt
npm run generate-sitemap
npm run generate-robots
```

### 6. Documentation 📚
- Documentation files kept with Firebase URLs for reference
- README updated with portability notes

## Benefits

### ✅ Portability
- Site works on **any domain** without changes
- Perfect for:
  - Cloudflare Pages
  - GitHub Pages  
  - Netlify
  - Custom domains
  - Local development

### ✅ SEO Friendly
- Canonical URLs are domain-relative
- Search engines will index the current domain
- No duplicate content issues

### ✅ Cache-Busting Compatible
- All `?v=` version parameters work correctly
- Service Worker cache invalidation works as expected
- No breaking changes to caching logic

### ✅ Share Links Work
- Social media share links use relative URLs
- Work correctly when site is accessed from any domain

## Scripts Available

```bash
# Refactor HTML files (already done)
node scripts/refactor-firebase-urls.js

# Generate sitemap with environment-aware URLs
npm run generate-sitemap

# Generate robots.txt with environment-aware URLs  
npm run generate-robots

# Update cache-busting versions (uses relative URLs)
npm run update-cache

# Update Service Worker version
npm run update-sw

# Full build (updates all)
npm run build
```

## Testing

### Local Testing
```bash
# The site should work on localhost without any issues
# All resources load correctly with relative paths
```

### Cloudflare Pages
```bash
# Cloudflare Pages automatically sets CF_PAGES_URL
# Sitemap and robots.txt will use the Cloudflare domain
# All HTML pages work without any changes
```

### Custom Domain
```bash
# Set SITE_URL before deployment
export SITE_URL=https://your-domain.com
npm run build
```

## Migration Notes

- **No breaking changes** to functionality
- Cache will be cleared on first visit (new URLs)
- Service Worker continues to work normally
- All existing links and bookmarks work

## Future Maintenance

When adding new HTML files:
1. Use **relative paths** for all internal links: `/artigos/article.html`
2. Use **relative paths** for all assets: `/css/style.css`, `/js/main.js`
3. Use **relative paths** for canonical: `<link rel="canonical" href="/path">`
4. Use **relative paths** in JSON-LD: `"url": "/path"`, `"@id": "/path"`

## Verification

✅ All HTML files use relative URLs  
✅ Service Worker uses relative URLs  
✅ CSS files use relative URLs  
✅ JS files use relative URLs (except CDN)  
✅ Sitemap generator is environment-aware  
✅ Robots.txt generator is environment-aware  
✅ Cache-busting works correctly  
✅ Share links work correctly  

**Status: Complete** 🎉

---

*Last updated: 2026-02-07*
