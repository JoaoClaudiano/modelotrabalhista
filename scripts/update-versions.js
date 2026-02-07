#!/usr/bin/env node

/**
 * Master script to update all version-related files
 * This should be run before each deployment
 */

const { updateServiceWorkerVersion } = require('./update-service-worker-version');
const { updateCacheBusting } = require('./update-cache-busting');

async function updateAllVersions() {
  console.log('🚀 Iniciando atualização completa de versões...\n');
  console.log('═'.repeat(60));
  
  try {
    // 1. Update Service Worker version
    console.log('\n📦 ETAPA 1: Service Worker\n');
    const swResult = updateServiceWorkerVersion();
    
    console.log('\n' + '═'.repeat(60));
    
    // 2. Update cache-busting versions in HTML files
    console.log('\n🔄 ETAPA 2: Cache-Busting HTML\n');
    const cbResult = updateCacheBusting();
    
    console.log('\n' + '═'.repeat(60));
    
    // 3. Summary
    console.log('\n✨ RESUMO FINAL\n');
    console.log('Service Worker:');
    console.log(`  • Versão: ${swResult.oldVersion} → ${swResult.newVersion}`);
    console.log(`  • Cache: ${swResult.oldCacheName} → ${swResult.newCacheName}`);
    console.log('\nCache-Busting:');
    console.log(`  • Nova versão: ${cbResult.version}`);
    console.log(`  • Arquivos modificados: ${cbResult.filesModified}`);
    console.log(`  • Substituições totais: ${cbResult.totalReplacements}`);
    
    console.log('\n' + '═'.repeat(60));
    console.log('\n✅ Todas as versões foram atualizadas com sucesso!');
    console.log('📝 Não esqueça de fazer commit das mudanças:\n');
    console.log('   git add service-worker.js *.html artigos/*.html pages/*.html');
    console.log('   git commit -m "🔄 Auto-update: Service Worker e cache-busting"');
    console.log('   git push\n');
    
  } catch (error) {
    console.error('\n❌ Erro durante atualização de versões:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  updateAllVersions();
}

module.exports = { updateAllVersions };
