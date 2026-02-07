#!/usr/bin/env node

/**
 * Fix path issues in artigos HTML files
 * Issues to fix:
 * 1. href="contato.html" -> href="../pages/contato.html"
 * 2. href="../contato.html" -> href="../pages/contato.html"
 */

const fs = require('fs');
const path = require('path');

function fixArticleFile(filePath) {
  console.log(`\n📝 Processing: ${path.basename(filePath)}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let changes = 0;
  
  // Fix 1: href="contato.html" -> href="../pages/contato.html"
  // But only if it's not already correct (not href="../pages/contato.html")
  const incorrectPattern1 = /href="contato\.html"/g;
  const matches1 = content.match(incorrectPattern1);
  if (matches1) {
    content = content.replace(incorrectPattern1, 'href="../pages/contato.html"');
    changes += matches1.length;
    console.log(`  ✓ Fixed ${matches1.length} instance(s) of href="contato.html"`);
  }
  
  // Fix 2: href="../contato.html" -> href="../pages/contato.html"
  const incorrectPattern2 = /href="\.\.\/contato\.html"/g;
  const matches2 = content.match(incorrectPattern2);
  if (matches2) {
    content = content.replace(incorrectPattern2, 'href="../pages/contato.html"');
    changes += matches2.length;
    console.log(`  ✓ Fixed ${matches2.length} instance(s) of href="../contato.html"`);
  }
  
  if (changes > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ Saved with ${changes} change(s)`);
    return changes;
  } else {
    console.log(`  ⏭️  No changes needed`);
    return 0;
  }
}

function main() {
  console.log('🔧 Fixing path issues in artigos folder...\n');
  
  const artigosDir = path.join(__dirname, 'artigos');
  const files = fs.readdirSync(artigosDir)
    .filter(f => f.endsWith('.html'))
    .filter(f => f !== 'template.html'); // Don't modify template
  
  let totalChanges = 0;
  let filesChanged = 0;
  
  for (const file of files) {
    const filePath = path.join(artigosDir, file);
    const changes = fixArticleFile(filePath);
    if (changes > 0) {
      filesChanged++;
      totalChanges += changes;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Complete!`);
  console.log(`   Files processed: ${files.length}`);
  console.log(`   Files changed: ${filesChanged}`);
  console.log(`   Total changes: ${totalChanges}`);
}

main();
