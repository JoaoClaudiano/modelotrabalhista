#!/usr/bin/env node

/**
 * Script to automatically update Service Worker version
 * This increments the patch version number each time it's run
 */

const fs = require('fs');
const path = require('path');

const SERVICE_WORKER_PATH = path.join(process.cwd(), 'service-worker.js');

function updateServiceWorkerVersion() {
  try {
    console.log('🔄 Atualizando versão do Service Worker...');
    
    // Read service worker file
    let content;
    try {
      content = fs.readFileSync(SERVICE_WORKER_PATH, 'utf8');
    } catch (readError) {
      throw new Error(`Não foi possível ler service-worker.js: ${readError.message}`);
    }
    
    // Extract current version from CACHE_NAME
    const cacheNameMatch = content.match(/const CACHE_NAME = '([^']+)'/);
    if (!cacheNameMatch) {
      throw new Error('CACHE_NAME não encontrado no service-worker.js');
    }
    
    const oldCacheName = cacheNameMatch[1];
    console.log(`📦 Cache name atual: ${oldCacheName}`);
    
    // Extract version from cache name (e.g., "modelotrabalhista-v1.3" -> "1.3")
    const versionMatch = oldCacheName.match(/v(\d+)\.(\d+)/);
    if (!versionMatch) {
      throw new Error('Formato de versão inválido no CACHE_NAME');
    }
    
    const major = parseInt(versionMatch[1]);
    const minor = parseInt(versionMatch[2]);
    
    // Increment minor version
    const newMinor = minor + 1;
    const newVersion = `${major}.${newMinor}`;
    const newCacheName = oldCacheName.replace(/v\d+\.\d+/, `v${newVersion}`);
    
    console.log(`✨ Nova versão: ${newVersion}`);
    console.log(`📦 Novo cache name: ${newCacheName}`);
    
    // Replace CACHE_NAME
    content = content.replace(
      /const CACHE_NAME = '[^']+'/,
      `const CACHE_NAME = '${newCacheName}'`
    );
    
    // Update version in comment
    content = content.replace(
      /\/\/ Versão \d+\.\d+\.\d+/,
      `// Versão ${newVersion}.0`
    );
    
    // Update console.log messages
    content = content.replace(
      /console\.log\('\[Service Worker\] Installing v\d+\.\d+/g,
      `console.log('[Service Worker] Installing v${newVersion}`
    );
    
    content = content.replace(
      /console\.log\('\[Service Worker\] Activating v\d+\.\d+/g,
      `console.log('[Service Worker] Activating v${newVersion}`
    );
    
    // Write back to file
    fs.writeFileSync(SERVICE_WORKER_PATH, content, 'utf8');
    
    console.log('✅ Service Worker atualizado com sucesso!');
    console.log(`   Versão: ${oldCacheName} → ${newCacheName}`);
    
    return {
      oldVersion: `${major}.${minor}`,
      newVersion: newVersion,
      oldCacheName: oldCacheName,
      newCacheName: newCacheName
    };
    
  } catch (error) {
    console.error('❌ Erro ao atualizar Service Worker:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  updateServiceWorkerVersion();
}

module.exports = { updateServiceWorkerVersion };
