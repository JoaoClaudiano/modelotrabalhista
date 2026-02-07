#!/usr/bin/env node

/**
 * Script to automatically update cache-busting version numbers in HTML files
 * Replaces ?v=XXXXXXXX with current timestamp to force browser cache refresh
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get current timestamp
// Note: All files in the same run get the same timestamp to ensure 
// consistency across all HTML files in a single deployment
const VERSION = Math.floor(Date.now() / 1000).toString();

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
        // Skip files that can't be accessed
        console.warn(`⚠️  Não foi possível acessar ${filePath}: ${err.message}`);
      }
    });
  } catch (err) {
    console.warn(`⚠️  Não foi possível ler diretório ${dir}: ${err.message}`);
  }
  
  return results;
}

/**
 * Update version numbers in a file
 */
function updateVersionsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Pattern to match ?v=XXXXXXXX or ?v=XXXXXXXXXX
    // Matches both 10-digit and other length timestamps
    const versionPattern = /(\?v=)\d+/g;
    
    // Count replacements
    let replacementCount = 0;
    content = content.replace(versionPattern, (match) => {
      replacementCount++;
      return `?v=${VERSION}`;
    });
    
    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      return replacementCount;
    }
    
    return 0;
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
    return 0;
  }
}

/**
 * Main function
 */
function updateCacheBusting() {
  try {
    console.log('🔄 Atualizando versões de cache-busting...');
    console.log(`📅 Nova versão (timestamp): ${VERSION}`);
    console.log(`   Data: ${new Date(parseInt(VERSION) * 1000).toISOString()}\n`);
    
    let totalFiles = 0;
    let totalReplacements = 0;
    
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
        const replacements = updateVersionsInFile(filePath);
        if (replacements > 0) {
          totalFiles++;
          totalReplacements += replacements;
          const relativePath = path.relative(process.cwd(), filePath);
          console.log(`   ✅ ${relativePath}: ${replacements} substituições`);
        }
      });
    });
    
    console.log('\n📊 Resumo:');
    console.log(`   Arquivos modificados: ${totalFiles}`);
    console.log(`   Total de substituições: ${totalReplacements}`);
    console.log(`   Nova versão: ?v=${VERSION}`);
    console.log('\n✅ Cache-busting atualizado com sucesso!');
    
    return {
      version: VERSION,
      filesModified: totalFiles,
      totalReplacements: totalReplacements
    };
    
  } catch (error) {
    console.error('❌ Erro ao atualizar cache-busting:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  updateCacheBusting();
}

module.exports = { updateCacheBusting };
