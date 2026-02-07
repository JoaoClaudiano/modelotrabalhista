#!/usr/bin/env node

/**
 * Test Firebase configuration to ensure all rewrites are correctly set up
 */

const fs = require('fs');
const path = require('path');

function testFirebaseConfig() {
  console.log('🧪 Testing Firebase configuration...\n');
  
  // Read firebase.json
  const configPath = path.join(__dirname, 'firebase.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  let errors = 0;
  let warnings = 0;
  
  // Test 1: Check that rewrites exist
  console.log('✓ Test 1: Checking rewrites configuration exists');
  if (!config.hosting.rewrites) {
    console.error('❌ ERROR: No rewrites section found in firebase.json');
    errors++;
  } else {
    console.log('  ✓ Rewrites section found with', config.hosting.rewrites.length, 'rules');
  }
  
  // Test 2: Check favicon rewrite
  console.log('\n✓ Test 2: Checking favicon.ico rewrite');
  const faviconRewrite = config.hosting.rewrites.find(r => r.source === '/favicon.ico');
  if (!faviconRewrite) {
    console.error('❌ ERROR: No rewrite for /favicon.ico found');
    errors++;
  } else if (faviconRewrite.destination !== '/assets/favicon.ico') {
    console.error('❌ ERROR: favicon.ico rewrite points to wrong destination:', faviconRewrite.destination);
    errors++;
  } else {
    console.log('  ✓ favicon.ico rewrite is correctly configured');
  }
  
  // Test 3: Check demissao-comum-acordo rewrite
  console.log('\n✓ Test 3: Checking demissao-comum-acordo rewrite');
  const demissaoRewrite = config.hosting.rewrites.find(r => r.source.includes('demissao-comum-acordo'));
  if (!demissaoRewrite) {
    console.error('❌ ERROR: No rewrite for demissao-comum-acordo found');
    errors++;
  } else if (demissaoRewrite.destination !== '/artigos/demissao-comum-acordo.html') {
    console.error('❌ ERROR: demissao-comum-acordo rewrite points to wrong destination:', demissaoRewrite.destination);
    errors++;
  } else {
    console.log('  ✓ demissao-comum-acordo rewrite is correctly configured');
  }
  
  // Test 4: Check that all article HTML files have rewrites
  console.log('\n✓ Test 4: Checking that all articles have rewrites');
  const artigosDir = path.join(__dirname, 'artigos');
  const articleFiles = fs.readdirSync(artigosDir)
    .filter(f => f.endsWith('.html') && f !== 'index.html' && f !== 'template.html')
    .map(f => f.replace('.html', ''));
  
  let missingRewrites = [];
  for (const article of articleFiles) {
    const hasRewrite = config.hosting.rewrites.some(r => r.source.includes(article));
    if (!hasRewrite) {
      missingRewrites.push(article);
    }
  }
  
  if (missingRewrites.length > 0) {
    console.error('  ❌ ERROR: Missing rewrites for articles:', missingRewrites);
    errors += missingRewrites.length;
  } else {
    console.log('  ✓ All', articleFiles.length, 'articles have rewrites configured');
  }
  
  // Test 5: Verify destination files exist
  console.log('\n✓ Test 5: Verifying destination files exist');
  let missingFiles = [];
  for (const rewrite of config.hosting.rewrites) {
    const filePath = path.join(__dirname, rewrite.destination);
    if (!fs.existsSync(filePath)) {
      missingFiles.push(rewrite.destination);
    }
  }
  
  if (missingFiles.length > 0) {
    console.error('  ❌ ERROR: Destination files do not exist:', missingFiles);
    errors += missingFiles.length;
  } else {
    console.log('  ✓ All destination files exist');
  }
  
  // Test 6: Check cleanUrls is enabled
  console.log('\n✓ Test 6: Checking cleanUrls configuration');
  if (!config.hosting.cleanUrls) {
    console.warn('  ⚠️  WARNING: cleanUrls is not enabled');
    warnings++;
  } else {
    console.log('  ✓ cleanUrls is enabled');
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  if (errors === 0 && warnings === 0) {
    console.log('✅ All tests passed! Firebase configuration is correct.');
    process.exit(0);
  } else {
    if (errors > 0) {
      console.log('❌', errors, 'error(s) found');
    }
    if (warnings > 0) {
      console.log('⚠️ ', warnings, 'warning(s) found');
    }
    process.exit(errors > 0 ? 1 : 0);
  }
}

// Run tests
testFirebaseConfig();
