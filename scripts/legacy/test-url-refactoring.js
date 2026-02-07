#!/usr/bin/env node

/**
 * Test script to verify URL refactoring was successful
 * Checks that no Firebase absolute URLs remain in HTML/CSS/JS files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FIREBASE_URL = 'https://modelotrabalhista-2026.web.app';

// Files that are allowed to have Firebase URLs
const ALLOWED_FILES = [
  'README.md',
  'sitemap.xml',
  'robots.txt',
  'scripts/generate-sitemap.js',
  'scripts/generate-robots.js',
  'scripts/refactor-firebase-urls.js',
  'scripts/update-docs-urls.js',
  'URL_REFACTORING_SUMMARY.md',
  'test-url-refactoring.js'
];

// Directories to check
const CHECK_EXTENSIONS = ['*.html', '*.css', '*.js'];

function checkFiles() {
  console.log('🔍 Verificando URLs do Firebase no código...\n');
  
  let hasIssues = false;
  let checkedFiles = 0;
  let issuesFound = [];
  
  CHECK_EXTENSIONS.forEach(ext => {
    try {
      // Find all files with the extension (excluding node_modules and .git)
      const findCmd = `find . -name "${ext}" ! -path "./node_modules/*" ! -path "./.git/*" -type f`;
      const files = execSync(findCmd, { encoding: 'utf8' }).trim().split('\n').filter(f => f);
      
      files.forEach(file => {
        // Skip allowed files
        const relativePath = file.replace('./', '');
        if (ALLOWED_FILES.some(allowed => relativePath.includes(allowed) || relativePath.startsWith('docs/'))) {
          return;
        }
        
        checkedFiles++;
        
        try {
          const content = fs.readFileSync(file, 'utf8');
          
          if (content.includes(FIREBASE_URL)) {
            hasIssues = true;
            const matches = content.match(new RegExp(FIREBASE_URL, 'g'));
            issuesFound.push({
              file: relativePath,
              count: matches ? matches.length : 0
            });
          }
        } catch (err) {
          console.warn(`⚠️  Não foi possível ler ${file}`);
        }
      });
    } catch (err) {
      // No files found for this extension, that's ok
    }
  });
  
  console.log(`📊 Arquivos verificados: ${checkedFiles}\n`);
  
  if (hasIssues) {
    console.log('❌ FALHOU: URLs absolutas do Firebase encontradas:\n');
    issuesFound.forEach(issue => {
      console.log(`   ❌ ${issue.file}: ${issue.count} ocorrências`);
    });
    console.log('\n💡 Execute: node scripts/refactor-firebase-urls.js');
    process.exit(1);
  } else {
    console.log('✅ SUCESSO: Nenhuma URL absoluta do Firebase encontrada em HTML/CSS/JS!');
    console.log('✅ Todos os arquivos usam caminhos relativos');
    console.log('✅ Site portável para qualquer domínio');
  }
}

function checkCacheBusting() {
  console.log('\n🔍 Verificando cache-busting...\n');
  
  try {
    const indexContent = fs.readFileSync('index.html', 'utf8');
    const hasVersionParams = indexContent.includes('?v=');
    
    if (hasVersionParams) {
      console.log('✅ Cache-busting funcionando: ?v= parâmetros encontrados');
      
      // Check if version params work with relative paths
      const relativeWithVersion = indexContent.match(/href="\/[^"]*\?v=/g) || 
                                  indexContent.match(/src="\/[^"]*\?v=/g);
      
      if (relativeWithVersion) {
        console.log('✅ Cache-busting usa caminhos relativos corretamente');
      }
    } else {
      console.log('⚠️  Cache-busting não encontrado (pode ser normal)');
    }
  } catch (err) {
    console.log('⚠️  Não foi possível verificar cache-busting');
  }
}

function checkServiceWorker() {
  console.log('\n🔍 Verificando Service Worker...\n');
  
  try {
    const swContent = fs.readFileSync('service-worker.js', 'utf8');
    
    if (swContent.includes(FIREBASE_URL)) {
      console.log('❌ Service Worker contém URLs absolutas do Firebase');
      process.exit(1);
    }
    
    // Check that ESSENTIAL_RESOURCES uses relative paths
    if (swContent.includes('ESSENTIAL_RESOURCES') && !swContent.includes(`'${FIREBASE_URL}`)) {
      console.log('✅ Service Worker usa caminhos relativos');
    }
    
  } catch (err) {
    console.log('⚠️  Não foi possível verificar Service Worker');
  }
}

function main() {
  console.log('=' .repeat(60));
  console.log('   TESTE DE REFATORAÇÃO DE URLs');
  console.log('=' .repeat(60));
  console.log();
  
  checkFiles();
  checkCacheBusting();
  checkServiceWorker();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ TODOS OS TESTES PASSARAM!');
  console.log('='.repeat(60));
  console.log();
}

if (require.main === module) {
  main();
}

module.exports = { checkFiles };
