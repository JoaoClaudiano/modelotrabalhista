# Google Site Verification Setup

## What Was Done

A Google Site Verification meta tag has been added to all 37 HTML files in the repository. The tag is placed in the `<head>` section, immediately after the viewport meta tag, following SEO best practices.

## Files Modified

- `index.html` (root)
- All files in `pages/` directory (7 files)
- All files in `artigos/` directory (30 files including template)

**Total: 37 HTML files**

## Current Tag Format

```html
<meta name="google-site-verification" content="YOUR_VERIFICATION_CODE_HERE" />
```

## How to Complete the Setup

### Step 1: Get Your Verification Code from Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console/)
2. Add your property (website URL)
3. Choose the "HTML tag" verification method
4. Copy the verification code from the meta tag Google provides

The code will look something like:
```html
<meta name="google-site-verification" content="abc123xyz789..." />
```

### Step 2: Replace the Placeholder

You have two options to replace the placeholder verification code:

#### Option A: Manual Find and Replace
1. Open your code editor
2. Find all instances of: `YOUR_VERIFICATION_CODE_HERE`
3. Replace with your actual verification code
4. Save all files
5. Commit and push changes

#### Option B: Use the Provided Script
1. Edit `add-google-verification.js`
2. Update line 6 with your actual verification code:
   ```javascript
   const VERIFICATION_TAG = '    <meta name="google-site-verification" content="YOUR_ACTUAL_CODE_HERE" />\n';
   ```
3. Run: `node add-google-verification.js`
4. The script will update all files automatically
5. Commit and push changes

### Step 3: Verify in Google Search Console

1. After deploying your changes, return to Google Search Console
2. Click the "Verify" button
3. Google will check your site for the meta tag
4. Once verified, you'll have access to search analytics and other tools

## Why This Tag Is Important

- **SEO**: Verifies site ownership in Google Search Console
- **Analytics**: Access to search performance data
- **Indexing**: Control how Google crawls and indexes your site
- **Issues**: Get notified about indexing issues, security problems, and penalties
- **Sitemap**: Submit and monitor your sitemap

## Placement in HTML

The tag is strategically placed after the viewport meta tag and before other meta tags/scripts:

```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE_HERE" />
    <!-- Other meta tags and content follow... -->
</head>
```

This placement ensures:
- ✅ Google can find it easily
- ✅ It loads early in the page
- ✅ It doesn't interfere with other scripts
- ✅ Follows SEO best practices

## Troubleshooting

If verification fails:
1. Ensure the code is exactly as Google provided (no extra spaces/characters)
2. Verify the tag is in the `<head>` section
3. Make sure your site is deployed and publicly accessible
4. Check that there are no syntax errors in the HTML
5. Wait a few minutes and try again (sometimes Google needs time to crawl)

## Additional Notes

- The verification tag must remain in your HTML even after successful verification
- If you remove it, you may lose access to Search Console
- The tag is lightweight and doesn't affect page performance
- Each domain/subdomain may need its own verification
