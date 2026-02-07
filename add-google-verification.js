/**
 * Google Site Verification Tag Insertion Script
 * 
 * Purpose: Automatically adds Google Site Verification meta tag to all HTML files
 * in the repository for enabling Google Search Console verification.
 * 
 * Requirements: Node.js (no additional dependencies required)
 * 
 * Usage: 
 *   1. Update the VERIFICATION_TAG constant with your actual verification code
 *   2. Run: node add-google-verification.js
 * 
 * The script will:
 *   - Find all HTML files in the repository (excluding node_modules)
 *   - Add the verification tag after the viewport meta tag
 *   - Skip files that already have the tag
 *   - Report success/skip status for each file
 */

const fs = require('fs');
const path = require('path');

// Google Site Verification meta tag
// Verification code from Google Search Console
const VERIFICATION_CODE = 'B95cdpZnyF2xXeTjto-_lv9N8Vw1WHJR3p2NcF36-HI';

// Find all HTML files
function findHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.git')) {
            findHtmlFiles(filePath, fileList);
        } else if (file.endsWith('.html')) {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

// Add Google Site Verification tag to HTML file
function addVerificationTag(filePath) {
    console.log(`Processing: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the tag already exists
    if (content.includes('google-site-verification')) {
        console.log(`  ✓ Tag already exists, skipping...`);
        return false;
    }
    
    // Find the viewport meta tag and detect its indentation
    const viewportMatch = content.match(/^([ \t]*)<meta name="viewport"[^>]*>\n/m);
    
    if (viewportMatch) {
        const indentation = viewportMatch[1]; // Capture the indentation
        const tagWithIndent = `${indentation}<meta name="google-site-verification" content="${VERIFICATION_CODE}" />\n`;
        content = content.replace(viewportMatch[0], `${viewportMatch[0]}${tagWithIndent}`);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  ✓ Added verification tag`);
        return true;
    } else {
        // If no viewport tag, try to add after charset
        const charsetMatch = content.match(/^([ \t]*)<meta charset="[^"]*">\n/m);
        if (charsetMatch) {
            const indentation = charsetMatch[1];
            const tagWithIndent = `${indentation}<meta name="google-site-verification" content="${VERIFICATION_CODE}" />\n`;
            content = content.replace(charsetMatch[0], `${charsetMatch[0]}${tagWithIndent}`);
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`  ✓ Added verification tag after charset`);
            return true;
        } else {
            // Last resort: add after <head>
            const headMatch = content.match(/^([ \t]*)(<head>)\n/m);
            if (headMatch) {
                const indentation = headMatch[1] + '    '; // Add standard indent
                const tagWithIndent = `${indentation}<meta name="google-site-verification" content="${VERIFICATION_CODE}" />\n`;
                content = content.replace(headMatch[0], `${headMatch[0]}${tagWithIndent}`);
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`  ✓ Added verification tag after <head>`);
                return true;
            } else {
                console.log(`  ✗ Could not find suitable location for tag`);
                return false;
            }
        }
    }
}

// Main execution
console.log('Starting Google Site Verification tag addition...\n');

const htmlFiles = findHtmlFiles('.');
console.log(`Found ${htmlFiles.length} HTML files\n`);

let successCount = 0;
let skippedCount = 0;

htmlFiles.forEach(file => {
    const result = addVerificationTag(file);
    if (result === true) {
        successCount++;
    } else {
        skippedCount++;
    }
});

console.log('\n--- Summary ---');
console.log(`Total files: ${htmlFiles.length}`);
console.log(`✓ Added: ${successCount}`);
console.log(`⊘ Skipped (already exists): ${skippedCount}`);
console.log('\nDone!');
