# Deployment Guide - Domain Portability

## Overview
This site has been refactored to work on **any domain** without code changes. All internal URLs use relative paths, making deployment simple and portable.

## Quick Start

### Deploy to Cloudflare Pages
1. Connect your repository to Cloudflare Pages
2. Set build command: `npm run build`
3. Deploy!

The site will automatically work at your `*.pages.dev` domain. The sitemap and robots.txt will automatically use the Cloudflare Pages URL via the `CF_PAGES_URL` environment variable.

### Deploy to Custom Domain
1. Set the `SITE_URL` environment variable:
   ```bash
   export SITE_URL=https://your-domain.com
   ```
2. Build: `npm run build`
3. Deploy files to your hosting

### Deploy to GitHub Pages
```bash
export SITE_URL=https://joaoclaudiano.github.io/modelotrabalhista
npm run build
# Then push to gh-pages branch or let GitHub Actions handle it
```

The site is configured to use GitHub Pages URL by default in the current build.

### Deploy to Firebase Hosting
```bash
export SITE_URL=https://modelotrabalhista-2026.web.app
npm run build
firebase deploy
```

## Environment Variables

### SITE_URL
Set this to your site's primary URL for sitemap/robots.txt generation:
```bash
export SITE_URL=https://www.example.com
npm run generate-sitemap
npm run generate-robots
```

### CF_PAGES_URL
Automatically set by Cloudflare Pages. Falls back to SITE_URL if not set.

## Build Commands

```bash
# Full build (updates versions, generates sitemap & robots.txt)
npm run build

# Update only cache-busting versions
npm run update-cache

# Update Service Worker version
npm run update-sw

# Generate sitemap
npm run generate-sitemap

# Generate robots.txt
npm run generate-robots

# Run tests
npm run test:all
```

## Verification

Run the URL refactoring test to ensure all URLs are relative:
```bash
npm run test:urls
```

Expected output:
```
✅ SUCESSO: Nenhuma URL absoluta do Firebase encontrada em HTML/CSS/JS!
✅ Todos os arquivos usam caminhos relativos
✅ Site portável para qualquer domínio
```

## What's Been Changed

### ✅ HTML Files (35 files)
- All `<link rel="canonical">` use relative paths
- All meta tags (og:url, og:image) use relative paths
- All JSON-LD structured data uses relative paths
- All internal links use relative paths

### ✅ Service Worker
- All cached resources use relative paths
- Compatible with any domain

### ✅ CSS & JavaScript
- All imports and references use relative paths
- External CDN URLs remain absolute (as intended)

### ✅ Build Scripts
- `generate-sitemap.js` - Environment-aware
- `generate-robots.js` - Environment-aware
- `update-cache-busting.js` - Works with relative paths

## Hosting Compatibility

| Platform | Status | Notes |
|----------|--------|-------|
| GitHub Pages | ✅ Active | Currently deployed, set SITE_URL to https://joaoclaudiano.github.io/modelotrabalhista |
| Firebase Hosting | ✅ Available | Alternative deployment, set SITE_URL before build |
| Cloudflare Pages | ✅ Ready | Uses CF_PAGES_URL automatically |
| Netlify | ✅ Ready | Set SITE_URL in build settings |
| Custom Domain | ✅ Ready | Set SITE_URL before build |
| localhost | ✅ Ready | Works without configuration |

## Troubleshooting

### Sitemap shows wrong domain
Set the appropriate environment variable before generating:
```bash
export SITE_URL=https://correct-domain.com
npm run generate-sitemap
```

### Cache issues after deployment
The Service Worker will automatically update. Users may need to:
1. Clear browser cache
2. Unregister old Service Worker (automatic on next visit)

### Testing locally
No special configuration needed. Just open `index.html` in a browser or use a local server:
```bash
python -m http.server 8000
# or
npx http-server
```

## Support

For issues or questions, refer to:
- `URL_REFACTORING_SUMMARY.md` - Technical details
- `test-url-refactoring.js` - Validation script
- `demo-portability.sh` - Demonstration script

---

**Status**: Production Ready ✅  
**Last Updated**: 2026-02-07
