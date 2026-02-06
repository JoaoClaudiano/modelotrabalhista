# CSP Violation Reporting Guide

## Overview

This document explains how to use the Content-Security-Policy-Report-Only (CSP-Report-Only) feature to monitor potential security policy violations without blocking resources. This allows you to test and refine your CSP before enforcing it.

## What is CSP-Report-Only?

Content-Security-Policy-Report-Only is a special HTTP header (or meta tag) that monitors your site for CSP violations **without blocking any resources**. It works alongside the regular CSP that actively blocks unauthorized resources.

### Key Benefits

- **Non-blocking**: Resources are not blocked, only violations are reported
- **Safe Testing**: Test new CSP rules before enforcing them
- **Continuous Monitoring**: Detect unexpected resource loads or inline code
- **Debugging**: Identify CSP issues during development and production

## Implementation

### 1. Meta Tags (All HTML Pages)

Every HTML page includes both enforcing and report-only CSP:

```html
<!-- Enforcing CSP (blocks violations) -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; ...">

<!-- Report-Only CSP (reports violations without blocking) -->
<meta http-equiv="Content-Security-Policy-Report-Only" content="default-src 'self'; ...">
```

### 2. Console-Based Reporter

The `js/csp-reporter.js` module automatically captures and logs all CSP violations to the browser console.

**Features:**
- Real-time violation logging with color coding
- Detailed violation information (source, directive, location)
- Actionable fix suggestions
- Violation history and statistics
- Export capabilities for analysis

## How to Use

### Viewing Violations in the Browser Console

1. **Open Developer Tools**
   - Chrome/Edge: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Firefox: Press `F12` or `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)
   - Safari: Enable Developer menu, then `Cmd+Option+C`

2. **Look for CSP Violation Messages**
   - Report-Only violations are marked with **orange** color: `[CSP Report-Only]`
   - Enforced violations are marked with **red** color: `[CSP Enforced]`

3. **Read Violation Details**
   Each violation log includes:
   - **Type**: The directive that was violated (e.g., `script-src`, `style-src`)
   - **Blocked**: The resource URI that triggered the violation
   - **Violated Directive**: The specific CSP directive
   - **Location**: File and line number (if available)
   - **Code Sample**: Snippet of the violating code
   - **Fix Suggestion**: Actionable advice on how to resolve

### Example Console Output

```
🔸 [CSP Report-Only] Violation Detected
  Type: script-src
  Blocked: https://example.com/script.js
  Violated Directive: script-src 'self' 'unsafe-inline' ...
  Location: index.html:123:45
  Code Sample: <script src="https://example.com/script.js">
  💡 How to fix: Add the script source to script-src directive: https://example.com/script.js
```

### Using the JavaScript API

The CSP Reporter exposes a global API for programmatic access:

```javascript
// Get all violations
const violations = window.CSPReporter.getViolations();
console.log('Total violations:', violations.length);

// Get statistics
const stats = window.CSPReporter.getStats();
console.log('Violations by directive:', stats.byDirective);
console.log('Report-only violations:', stats.reportOnly);
console.log('Enforced violations:', stats.enforced);

// Clear violations
window.CSPReporter.clearViolations();

// Export violations as JSON
const json = window.CSPReporter.exportViolations();
console.log(json);

// Access configuration
console.log('Reporter config:', window.CSPReporter.config);
```

## Understanding Violation Types

### Common Directives

| Directive | Description | Common Causes |
|-----------|-------------|---------------|
| `script-src` | Controls JavaScript sources | External scripts, inline `<script>` tags, `onclick` handlers |
| `style-src` | Controls CSS sources | External stylesheets, inline `<style>` tags, `style` attributes |
| `img-src` | Controls image sources | External images, data URLs, inline SVG |
| `font-src` | Controls font sources | Web fonts from CDNs |
| `connect-src` | Controls AJAX/WebSocket | API calls, fetch requests, WebSocket connections |
| `frame-src` | Controls iframes | Embedded content, third-party widgets |
| `media-src` | Controls audio/video | Media elements from external sources |

### Violation Categories

1. **External Resource Violations**
   - Loading scripts, styles, images, etc. from unauthorized domains
   - **Fix**: Add the domain to the appropriate CSP directive

2. **Inline Code Violations**
   - Inline `<script>` or `<style>` tags
   - Inline event handlers (`onclick`, `onerror`, etc.)
   - Inline styles (`style` attribute)
   - **Fix**: Move code to external files or use nonces/hashes

3. **Dynamic Code Violations**
   - `eval()` usage
   - `new Function()` constructor
   - `setTimeout`/`setInterval` with string arguments
   - **Fix**: Avoid dynamic code execution or use `'unsafe-eval'`

## Acting on Violations

### Step 1: Identify the Violation

Review the console log to understand:
- What resource was blocked?
- Which directive was violated?
- Where in your code did it occur?

### Step 2: Determine if It's Legitimate

Ask yourself:
- Is this resource necessary for the site to function?
- Is it from a trusted source?
- Could it be moved to an external file?

### Step 3: Take Action

#### Option A: Whitelist the Resource (Recommended)

If the resource is legitimate and necessary:

1. **Update CSP in HTML files**
   ```html
   <!-- Before -->
   script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;
   
   <!-- After -->
   script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://trusted-domain.com;
   ```

2. **Update `_headers` file** (for GitHub Pages)
   ```
   Content-Security-Policy: ... script-src 'self' https://trusted-domain.com ...
   ```

3. **Update `firebase.json`** (for Firebase Hosting)
   ```json
   {
     "key": "Content-Security-Policy",
     "value": "... script-src 'self' https://trusted-domain.com ..."
   }
   ```

#### Option B: Refactor the Code (More Secure)

If possible, refactor to avoid the violation:

**Example: Remove inline event handlers**
```html
<!-- Before (violates script-src) -->
<button onclick="doSomething()">Click me</button>

<!-- After (CSP-compliant) -->
<button id="myButton">Click me</button>
<script src="button-handler.js"></script>
```

**Example: Move inline styles**
```html
<!-- Before (violates style-src) -->
<div style="color: red;">Text</div>

<!-- After (CSP-compliant) -->
<div class="red-text">Text</div>
<link rel="stylesheet" href="styles.css">
```

#### Option C: Ignore False Positives

Some violations may be:
- From browser extensions
- From legitimate inline code already using `'unsafe-inline'`
- From development tools

Review and dismiss these as appropriate.

### Step 4: Test Changes

1. Update the CSP directives
2. Clear violations: `window.CSPReporter.clearViolations()`
3. Reload the page
4. Verify no new violations appear

### Step 5: Document Changes

Update the CSP documentation files:
- `CSP_DOCUMENTATION.md` - Add new whitelisted domains
- `CSP_IMPLEMENTATION_SUMMARY.md` - Update statistics

## Monitoring in Production

### Regular Review Process

1. **Daily**: Quick check of console for violations during development
2. **Weekly**: Review violation statistics
3. **Monthly**: Export and analyze violation trends
4. **Before Deployment**: Ensure no violations from new code

### Export and Analysis

Export violations for detailed analysis:

```javascript
// Export to JSON
const json = window.CSPReporter.exportViolations();

// Copy to clipboard
navigator.clipboard.writeText(json);

// Or download as file
const blob = new Blob([json], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'csp-violations-' + new Date().toISOString() + '.json';
a.click();
```

### Statistics Review

```javascript
const stats = window.CSPReporter.getStats();

console.log('📊 CSP Violation Statistics:');
console.log('Total violations:', stats.total);
console.log('Report-only:', stats.reportOnly);
console.log('Enforced:', stats.enforced);
console.log('\nBy directive:');
console.table(stats.byDirective);
console.log('\nUnique blocked URIs:');
console.log(stats.uniqueBlockedURIs);
```

## Common Scenarios

### Scenario 1: Adding a New CDN

**Violation**: `script-src` violation for `https://newcdn.com/library.js`

**Action**:
1. Verify the CDN is trustworthy
2. Add to CSP: `script-src 'self' ... https://newcdn.com`
3. Update all configuration files
4. Test and verify

### Scenario 2: Third-Party Widget

**Violation**: Multiple violations from widget (scripts, styles, iframes)

**Action**:
1. Identify all domains used by the widget
2. Add each domain to appropriate directive:
   - Scripts: `script-src`
   - Styles: `style-src`
   - Frames: `frame-src`
3. Test thoroughly

### Scenario 3: Inline Script Violation

**Violation**: `script-src-attr` violation for inline event handler

**Action** (choose one):
1. **Best**: Move to external JS file with `addEventListener`
2. **Alternative**: Use `'unsafe-inline'` (already enabled in this project)
3. **Advanced**: Use nonces or hashes

### Scenario 4: Browser Extension Interference

**Violation**: Random violations from unknown sources

**Action**:
1. Test in incognito/private mode
2. If violations disappear, they're from extensions
3. Ignore these violations (user-specific)

## Troubleshooting

### Violations Not Appearing

**Check:**
- Is the CSP Reporter script loaded? (Look for initialization message)
- Are violations actually occurring? (Try intentionally violating CSP)
- Is console filtering hiding messages?

### Too Many Violations

**Solutions:**
- Group similar violations to identify patterns
- Focus on high-frequency violations first
- Use `stats.byDirective` to prioritize

### False Positives

**Common causes:**
- Browser extensions
- Development tools
- Legitimate inline code with `'unsafe-inline'`

**Solutions:**
- Test in clean browser environment
- Review against known legitimate code
- Document known false positives

## Advanced Features

### Custom Configuration

Modify the reporter configuration:

```javascript
// Access configuration
const config = window.CSPReporter.config;

// Disable console logging temporarily
config.consoleLogging = false;

// Enable again
config.consoleLogging = true;

// Disable detailed logging for cleaner output
config.detailedLogging = false;

// Change storage limits
config.maxStoredViolations = 100;
```

### Session Persistence

Violations are stored in `sessionStorage` and persist across page refreshes within the same browser session.

**Clear storage:**
```javascript
sessionStorage.removeItem('csp-violations');
```

### Filtering Violations

```javascript
const violations = window.CSPReporter.getViolations();

// Filter by directive
const scriptViolations = violations.filter(v => 
  v.effectiveDirective.includes('script')
);

// Filter by domain
const externalViolations = violations.filter(v => 
  v.blockedURI.startsWith('http')
);

// Filter report-only violations
const reportOnlyViolations = violations.filter(v => 
  v.disposition === 'report'
);
```

## Best Practices

1. **Review violations regularly** - Don't let them accumulate
2. **Fix legitimate violations** - Update CSP or refactor code
3. **Document all changes** - Keep CSP documentation up to date
4. **Test thoroughly** - Ensure changes don't break functionality
5. **Use report-only for testing** - Before updating enforcing CSP
6. **Monitor production** - Keep an eye on violation trends
7. **Educate team members** - Ensure everyone understands CSP

## Transitioning to Enforcement

When you're confident in your Report-Only CSP:

1. **Review all violations** - Ensure no legitimate resources are blocked
2. **Update enforcing CSP** - Match it to the report-only policy
3. **Monitor closely** - Check for any unexpected issues
4. **Keep report-only** - Continue monitoring for new violations
5. **Iterate** - Refine as needed

## References

- [MDN: Content-Security-Policy-Report-Only](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy-Report-Only)
- [W3C: CSP Level 3](https://www.w3.org/TR/CSP3/)
- [Google: CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- `CSP_DOCUMENTATION.md` - Main CSP documentation
- `js/csp-reporter.js` - Reporter source code
