# Content Security Policy (CSP) Implementation

## Overview

This document describes the Content Security Policy (CSP) implementation for ModeloTrabalhista, designed to be compatible with both GitHub Pages and Firebase Hosting.

## Security Headers Implemented

### 1. Content Security Policy (CSP)

The CSP is configured to allow only trusted sources while maintaining functionality:

```
default-src 'self';
script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://vlibras.gov.br;
style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com;
font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com;
img-src 'self' data: https:;
connect-src 'self';
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
upgrade-insecure-requests
```

#### Directive Explanations

- **default-src 'self'**: Default policy allows resources only from the same origin
- **script-src**: Allows scripts from:
  - `'self'`: Same origin scripts
  - `'unsafe-inline'`: Required for inline scripts (VLibras initialization, service worker registration, etc.)
  - `https://cdnjs.cloudflare.com`: Font Awesome CDN
  - `https://vlibras.gov.br`: Brazilian Sign Language widget (accessibility requirement)
- **style-src**: Allows styles from:
  - `'self'`: Same origin stylesheets
  - `'unsafe-inline'`: Required for inline styles (loading animations, dynamic styles)
  - `https://cdnjs.cloudflare.com`: Font Awesome styles
  - `https://fonts.googleapis.com`: Google Fonts CSS
- **font-src**: Allows fonts from:
  - `'self'`: Local fonts
  - `https://cdnjs.cloudflare.com`: Font Awesome fonts
  - `https://fonts.gstatic.com`: Google Fonts files
- **img-src 'self' data: https:**: Allows images from same origin, data URIs, and any HTTPS source
- **connect-src 'self'**: Restricts AJAX/WebSocket/EventSource to same origin
- **frame-ancestors 'none'**: Prevents the site from being embedded in iframes (clickjacking protection)
- **base-uri 'self'**: Restricts base tag to same origin
- **form-action 'self'**: Restricts form submissions to same origin
- **upgrade-insecure-requests**: Automatically upgrades HTTP requests to HTTPS

### 2. Additional Security Headers

- **X-Frame-Options: DENY** - Prevents clickjacking attacks
- **X-Content-Type-Options: nosniff** - Prevents MIME type sniffing
- **X-XSS-Protection: 1; mode=block** - Enables XSS filter in older browsers
- **Referrer-Policy: strict-origin-when-cross-origin** - Controls referrer information
- **Permissions-Policy: geolocation=(), microphone=(), camera=()** - Disables unnecessary browser features

## Implementation Methods

### 1. Meta Tags (All HTML Files)

Every HTML file includes a CSP meta tag in the `<head>` section:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://vlibras.gov.br; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests">
```

**Files Updated:**
- `index.html`
- All files in `pages/` directory (6 files)
- All files in `artigos/` directory (30 files)

### 2. GitHub Pages (_headers file)

For GitHub Pages deployment, the `_headers` file configures HTTP headers:

```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://vlibras.gov.br; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
```

**Note:** GitHub Pages has limited support for custom headers. The `_headers` file format is supported by some GitHub Pages configurations, but the meta tag implementation ensures CSP works regardless.

### 3. Firebase Hosting (firebase.json)

For Firebase Hosting deployment, the `firebase.json` file configures headers:

```json
{
  "hosting": {
    "public": ".",
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Content-Security-Policy",
            "value": "..."
          },
          ...
        ]
      }
    ]
  }
}
```

This configuration also includes:
- Cache control headers for static assets:
  - Images: 30 days
  - CSS/JS: 1 day  
  - HTML: No cache (always fresh)
- Clean URLs enabled (removes .html extension)
- Trailing slash handling configured

## Why 'unsafe-inline' is Used

While `'unsafe-inline'` reduces the security benefits of CSP, it's currently necessary for:

1. **VLibras Widget Initialization**: The Brazilian Sign Language (Libras) accessibility widget requires inline script execution
2. **Service Worker Registration**: Inline script for PWA functionality
3. **Loading Animations**: Inline styles in the `<head>` for initial loading state
4. **Dynamic Year in Footer**: Small inline script to update copyright year

### Future Improvements

To eliminate `'unsafe-inline'`:

1. **Move Inline Scripts to External Files**: 
   - Create `init.js` for initialization scripts
   - Create `service-worker-register.js` for SW registration
   
2. **Use CSP Nonces**: Generate unique nonces for each page load
   ```html
   <script nonce="random-nonce">...</script>
   ```
   
3. **Extract Inline Styles**: Move all inline styles to external CSS files

4. **Use Hashes**: For small unchanging inline scripts, use SHA-256 hashes
   ```
   script-src 'self' 'sha256-hash-of-script'
   ```

## Testing the CSP

### Browser Console

Open browser developer tools and check the Console tab for CSP violations:

```
Content Security Policy: The page's settings blocked the loading of a resource at ...
```

### CSP Evaluator

Use Google's CSP Evaluator to analyze the policy:
https://csp-evaluator.withgoogle.com/

### Security Headers Scanner

Test deployed site with:
- https://securityheaders.com/
- https://observatory.mozilla.org/

## Compatibility

### GitHub Pages ✅
- Meta tag CSP: ✅ Fully supported
- _headers file: ⚠️ Limited support (meta tag ensures coverage)

### Firebase Hosting ✅
- Meta tag CSP: ✅ Fully supported
- firebase.json headers: ✅ Fully supported

### Browser Support ✅
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support

## Maintenance

When adding new external resources:

1. Update the CSP in:
   - Meta tags in affected HTML files
   - `_headers` file
   - `firebase.json` file

2. Test thoroughly before deployment

3. Document the change in this file

## References

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Level 3 Specification](https://www.w3.org/TR/CSP3/)
- [GitHub Pages Custom Headers](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages#static-site-generators)
- [Firebase Hosting Headers](https://firebase.google.com/docs/hosting/full-config#headers)
