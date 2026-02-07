#!/usr/bin/env node

/**
 * Script to refactor Firebase absolute URLs to relative paths
 * Replaces https://modelotrabalhista-2026.web.app/... with /...
 * Maintains cache-busting and other URL parameters
 */

const fs = require('fs');
const path = require('path');

// Firebase base URL to replace
const FIREBASE_BASE_URL = 'https://modelotrabalhista-2026.web.app';

// Directories to search for HTML files
const SEARCH_DIRS = ['.', 'artigos', 'pages', 'exemplos-documentos'];

// Files/directories to exclude
const EXCLUDE = ['node_modules', '.git', 'template.html', 'example.html'];

/**
 * Get all HTML files in a directory
 */
function getHtmlFiles(dir, baseDir = dir) {
  let results = [];
  
  try {
    const list = fs.readdirSync(dir);
    
    list.forEach(file => {
      // Skip excluded files and directories
      if (EXCLUDE.includes(file)) return;
      
      const filePath = path.join(dir, file);
      
      try {
        const stat = fs.statSync(filePath);
        
        if (stat && stat.isDirectory()) {
          // Recursively get files from subdirectories
          results = results.concat(getHtmlFiles(filePath, baseDir));
        } else if (file.endsWith('.html')) {
          results.push(filePath);
        }
      } catch (err) {
        console.warn(`⚠️  Não foi possível acessar ${filePath}: ${err.message}`);
      }
    });
  } catch (err) {
    console.warn(`⚠️  Não foi possível ler diretório ${dir}: ${err.message}`);
  }
  
  return results;
}

/**
 * Replace Firebase absolute URLs with relative paths
 */
function refactorUrlsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Count replacements by type
    let replacements = {
      total: 0,
      meta: 0,
      canonical: 0,
      jsonLd: 0,
      links: 0
    };
    
    // Replace all instances of Firebase base URL
    // This regex captures the entire URL including any query parameters
    const urlPattern = new RegExp(FIREBASE_BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    
    content = content.replace(urlPattern, (match, offset) => {
      replacements.total++;
      
      // Determine context for better reporting
      const context = originalContent.substring(Math.max(0, offset - 50), offset);
      if (context.includes('property="og:')) {
        replacements.meta++;
      } else if (context.includes('rel="canonical"')) {
        replacements.canonical++;
      } else if (context.includes('"@type"') || context.includes('"@id"')) {
        replacements.jsonLd++;
      } else if (context.includes('href=') || context.includes('api.whatsapp.com')) {
        replacements.links++;
      }
      
      return '';
    });
    
    // Special handling for root URL (https://modelotrabalhista-2026.web.app/)
    // Replace with just / for better relative path handling
    content = content.replace(/href="\/"/g, 'href="/"');
    content = content.replace(/content="\/"/g, 'content="/"');
    
    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      return replacements;
    }
    
    return null;
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Main function
 */
function refactorFirebaseUrls() {
  try {
    console.log('🔄 Refatorando URLs absolutas do Firebase...');
    console.log(`🎯 Alvo: ${FIREBASE_BASE_URL}`);
    console.log(`📝 Substituindo por: caminhos relativos (/...)\n`);
    
    let totalFiles = 0;
    let totalReplacements = {
      total: 0,
      meta: 0,
      canonical: 0,
      jsonLd: 0,
      links: 0
    };
    
    // Process each search directory
    SEARCH_DIRS.forEach(dir => {
      const dirPath = path.join(process.cwd(), dir);
      
      if (!fs.existsSync(dirPath)) {
        console.warn(`⚠️  Diretório não encontrado: ${dir}`);
        return;
      }
      
      const htmlFiles = getHtmlFiles(dirPath);
      
      console.log(`📁 Processando diretório: ${dir} (${htmlFiles.length} arquivos)`);
      
      htmlFiles.forEach(filePath => {
        const replacements = refactorUrlsInFile(filePath);
        if (replacements && replacements.total > 0) {
          totalFiles++;
          totalReplacements.total += replacements.total;
          totalReplacements.meta += replacements.meta;
          totalReplacements.canonical += replacements.canonical;
          totalReplacements.jsonLd += replacements.jsonLd;
          totalReplacements.links += replacements.links;
          
          const relativePath = path.relative(process.cwd(), filePath);
          console.log(`   ✅ ${relativePath}: ${replacements.total} substituições`);
        }
      });
    });
    
    console.log('\n📊 Resumo:');
    console.log(`   Arquivos modificados: ${totalFiles}`);
    console.log(`   Total de substituições: ${totalReplacements.total}`);
    console.log(`     - Meta tags (og:, twitter:): ${totalReplacements.meta}`);
    console.log(`     - Links canônicos: ${totalReplacements.canonical}`);
    console.log(`     - JSON-LD: ${totalReplacements.jsonLd}`);
    console.log(`     - Links/outros: ${totalReplacements.links}`);
    console.log(`\n✅ Refatoração concluída com sucesso!`);
    console.log(`💡 URLs convertidas de ${FIREBASE_BASE_URL}/... para /...`);
    
    return {
      filesModified: totalFiles,
      totalReplacements: totalReplacements
    };
    
  } catch (error) {
    console.error('❌ Erro ao refatorar URLs:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  refactorFirebaseUrls();
}

module.exports = { refactorFirebaseUrls };
