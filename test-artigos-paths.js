#!/usr/bin/env node

/**
 * Comprehensive test for artigos folder HTML files
 * Validates all path references are correct
 */

const fs = require('fs');
const path = require('path');

function testArticleFile(filePath, fileName) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  // Test 1: No bare contato.html references (should be ../pages/contato.html)
  if (content.match(/href="contato\.html"/)) {
    issues.push('❌ Found bare href="contato.html" (should be ../pages/contato.html)');
  }
  
  // Test 2: No ../contato.html references (should be ../pages/contato.html)
  if (content.match(/href="\.\.\/contato\.html"/)) {
    issues.push('❌ Found href="../contato.html" (should be ../pages/contato.html)');
  }
  
  // Test 3: Assets should use ../ prefix
  const bareAssetRefs = content.match(/(?:href|src)="(?:css|assets|js)\//g);
  if (bareAssetRefs) {
    issues.push(`❌ Found ${bareAssetRefs.length} asset reference(s) without ../ prefix`);
  }
  
  // Test 4: Check favicon references are correct
  const faviconRefs = content.match(/href="[^"]*favicon[^"]*"/g);
  if (faviconRefs) {
    const incorrectFavicons = faviconRefs.filter(ref => 
      !ref.includes('../assets/') && !ref.includes('http')
    );
    if (incorrectFavicons.length > 0) {
      issues.push(`❌ Found ${incorrectFavicons.length} incorrect favicon reference(s)`);
    }
  }
  
  // Test 5: CSS files should use ../ prefix (except template.css)
  const cssRefs = content.match(/href="[^"]*\.css[^"]*"/g);
  if (cssRefs) {
    const incorrectCss = cssRefs.filter(ref => 
      ref.includes('href="css/') || 
      (ref.includes('/css/') && !ref.includes('../css/') && !ref.includes('http'))
    );
    if (incorrectCss.length > 0) {
      issues.push(`❌ Found ${incorrectCss.length} CSS reference(s) without ../ prefix`);
    }
  }
  
  // Test 6: JS files should use ../ prefix (except template.js)
  const jsRefs = content.match(/src="[^"]*\.js[^"]*"/g);
  if (jsRefs) {
    const incorrectJs = jsRefs.filter(ref => 
      ref.includes('src="js/') ||
      (ref.includes('/js/') && !ref.includes('../js/') && !ref.includes('http') && !ref.includes('template.js'))
    );
    if (incorrectJs.length > 0) {
      issues.push(`❌ Found ${incorrectJs.length} JS reference(s) without ../ prefix`);
    }
  }
  
  return issues;
}

function main() {
  console.log('🧪 Testing all artigos HTML files for path issues...\n');
  
  const artigosDir = path.join(__dirname, 'artigos');
  const files = fs.readdirSync(artigosDir)
    .filter(f => f.endsWith('.html'))
    .filter(f => f !== 'template.html');
  
  let totalIssues = 0;
  let filesWithIssues = 0;
  
  for (const file of files) {
    const filePath = path.join(artigosDir, file);
    const issues = testArticleFile(filePath, file);
    
    if (issues.length > 0) {
      console.log(`\n📝 ${file}:`);
      issues.forEach(issue => console.log(`  ${issue}`));
      filesWithIssues++;
      totalIssues += issues.length;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  if (totalIssues === 0) {
    console.log('✅ All tests passed! All paths are correct.');
    console.log(`   Files tested: ${files.length}`);
    process.exit(0);
  } else {
    console.log('❌ Tests failed!');
    console.log(`   Files tested: ${files.length}`);
    console.log(`   Files with issues: ${filesWithIssues}`);
    console.log(`   Total issues found: ${totalIssues}`);
    process.exit(1);
  }
}

main();
