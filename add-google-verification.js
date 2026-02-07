const fs = require('fs');
const path = require('path');

// Google Site Verification meta tag
// TODO: Replace with actual verification code from Google Search Console
const VERIFICATION_TAG = '    <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE_HERE" />\n';

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
    
    // Find the viewport meta tag and add our tag after it
    const viewportRegex = /(<meta name="viewport"[^>]*>)\n/;
    
    if (viewportRegex.test(content)) {
        content = content.replace(viewportRegex, `$1\n${VERIFICATION_TAG}`);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  ✓ Added verification tag`);
        return true;
    } else {
        // If no viewport tag, try to add after charset
        const charsetRegex = /(<meta charset="[^"]*">)\n/;
        if (charsetRegex.test(content)) {
            content = content.replace(charsetRegex, `$1\n${VERIFICATION_TAG}`);
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`  ✓ Added verification tag after charset`);
            return true;
        } else {
            // Last resort: add after <head>
            const headRegex = /(<head>)\n/;
            if (headRegex.test(content)) {
                content = content.replace(headRegex, `$1\n${VERIFICATION_TAG}`);
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
let errorCount = 0;

htmlFiles.forEach(file => {
    const result = addVerificationTag(file);
    if (result === true) {
        successCount++;
    } else if (result === false) {
        skippedCount++;
    } else {
        errorCount++;
    }
});

console.log('\n--- Summary ---');
console.log(`Total files: ${htmlFiles.length}`);
console.log(`✓ Added: ${successCount}`);
console.log(`⊘ Skipped (already exists): ${skippedCount}`);
console.log(`✗ Errors: ${errorCount}`);
console.log('\nDone!');
