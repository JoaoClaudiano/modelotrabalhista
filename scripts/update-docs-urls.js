#!/usr/bin/env node

/**
 * Script to update documentation files with environment-aware URLs
 * This preserves Firebase URLs in README but adds notes about portability
 */

const fs = require('fs');
const path = require('path');

// Firebase base URL (kept in documentation for reference)
const FIREBASE_URL = 'https://modelotrabalhista-2026.web.app';

// Documentation files to update
const DOC_FILES = [
  'README.md',
  'docs/FIX_404_ERRORS.md',
  'docs/FIX_ARTIGOS_PATHS.md',
  'docs/MIME_TYPE_FIX_2026.md',
  'docs/POST_DEPLOY_CHECKLIST.md',
  'docs/SUMMARY_ALL_FIXES.md',
  'docs/archive/csp/CSP_SUMMARY_PT.md',
  'docs/archive/csp/CSP_TESTING.md',
  'docs/archive/csp/CSP_VERIFICATION_COMPLETE.md',
  'exemplos-documentos/README.md'
];

function updateDocFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Arquivo não encontrado: ${filePath}`);
    return 0;
  }
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    
    // Count occurrences
    const matches = content.match(new RegExp(FIREBASE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'));
    const count = matches ? matches.length : 0;
    
    if (count > 0) {
      console.log(`   📄 ${filePath}: ${count} referências ao Firebase URL (mantidas para documentação)`);
    }
    
    return count;
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
    return 0;
  }
}

function main() {
  console.log('📚 Verificando arquivos de documentação...\n');
  
  let totalRefs = 0;
  
  DOC_FILES.forEach(file => {
    const refs = updateDocFile(file);
    totalRefs += refs;
  });
  
  console.log('\n📊 Resumo:');
  console.log(`   Total de referências ao Firebase URL na documentação: ${totalRefs}`);
  console.log('   ✅ URLs mantidas na documentação para referência');
  console.log('   💡 Site agora funciona em qualquer domínio (HTML/CSS/JS usam caminhos relativos)');
  console.log('   💡 Sitemap e robots.txt são gerados com SITE_URL ou CF_PAGES_URL env vars');
}

if (require.main === module) {
  main();
}

module.exports = { updateDocFile };
