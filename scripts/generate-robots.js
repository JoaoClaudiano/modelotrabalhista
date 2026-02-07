#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Base URL for the website
// Note: This is still needed for the Sitemap directive in robots.txt
// However, all Disallow directives use relative paths
// Set SITE_URL environment variable for custom domains (e.g., Cloudflare Pages)
const BASE_URL = process.env.SITE_URL || process.env.CF_PAGES_URL || 'https://modelotrabalhista.pages.dev';

// Directories and files that should NOT be crawled
const DISALLOW_PATTERNS = [
  '/admin/',
  '/login/',
  '/config/',
  '/.git/',
  '/node_modules/',
  '/assets/temp/',
];

// Extensions to block (note: wildcards are widely supported but not standard)
const DISALLOW_EXTENSIONS = [
  '*.json',
  '*.js',
  '*.css',
];

// Specific files to block
const DISALLOW_FILES = [
  '/template.html',
  '/example.html',
];

// Function to check if a file should be disallowed
function shouldDisallowFile(filename) {
  // Check specific filenames
  if (filename === 'template.html' || filename === 'example.html') {
    return true;
  }
  
  // Note: We don't disallow by extension here because wildcards in DISALLOW_EXTENSIONS handle this
  return false;
}

// Function to get all directories that should be disallowed
function getDisallowedPaths(dir, baseDir = dir, results = []) {
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    // Skip hidden files and directories, and node_modules
    if (file.startsWith('.') || file === 'node_modules') return;
    
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    const relativePath = path.relative(baseDir, filePath);
    
    if (stat && stat.isDirectory()) {
      // Recursively check subdirectories
      getDisallowedPaths(filePath, baseDir, results);
    } else {
      // Add specific files that should be disallowed
      if (shouldDisallowFile(file)) {
        const urlPath = '/' + relativePath.replace(/\\/g, '/');
        if (!results.includes(urlPath)) {
          results.push(urlPath);
        }
      }
    }
  });
  
  return results;
}

// Function to generate robots.txt content
function generateRobotsContent() {
  const repoRoot = process.cwd();
  
  // Get dynamically disallowed paths
  const dynamicDisallows = getDisallowedPaths(repoRoot);
  
  // Build robots.txt content
  let content = '';
  
  // Main user-agent section
  content += 'User-agent: *\n';
  content += 'Allow: /\n';
  content += '\n';
  
  // Sitemap reference
  content += `Sitemap: ${BASE_URL}/sitemap.xml\n`;
  content += '\n';
  
  // Disallow sections
  content += '# Desabilitar crawling de áreas administrativas\n';
  
  // Add directory patterns
  DISALLOW_PATTERNS.forEach(pattern => {
    content += `Disallow: ${pattern}\n`;
  });
  
  content += '\n# Bloquear arquivos técnicos (wildcards - amplamente suportado)\n';
  
  // Add extension wildcards (note: widely supported but not in official spec)
  DISALLOW_EXTENSIONS.forEach(pattern => {
    content += `Disallow: ${pattern}\n`;
  });
  
  content += '\n# Bloquear arquivos específicos\n';
  
  // Add specific files
  DISALLOW_FILES.forEach(pattern => {
    content += `Disallow: ${pattern}\n`;
  });
  
  // Add dynamic disallows for template and example files found in subdirectories
  const uniqueDisallows = [...new Set(dynamicDisallows)].sort();
  if (uniqueDisallows.length > 0) {
    content += '\n# Templates e exemplos em subdiretórios\n';
    uniqueDisallows.forEach(path => {
      content += `Disallow: ${path}\n`;
    });
  }
  
  content += '\n';
  
  // Allow specific bots explicitly
  const bots = [
    'Googlebot',
    'Bingbot',
    'Slurp',
    'DuckDuckBot',
    'Baiduspider',
    'YandexBot'
  ];
  
  content += '# Permitir todos os principais crawlers\n';
  bots.forEach(bot => {
    content += `User-agent: ${bot}\n`;
    content += `Allow: /\n`;
    content += '\n';
  });
  
  return content;
}

// Main function
function generateRobotsTxt() {
  try {
    const repoRoot = process.cwd();
    const robotsPath = path.join(repoRoot, 'robots.txt');
    
    // Generate content
    const content = generateRobotsContent();
    
    // Write to robots.txt
    fs.writeFileSync(robotsPath, content);
    
    console.log(`✅ robots.txt gerado com sucesso em ${robotsPath}`);
    console.log('\n📄 Conteúdo gerado:');
    console.log('─'.repeat(50));
    console.log(content);
    console.log('─'.repeat(50));
    
  } catch (error) {
    console.error('❌ Erro ao gerar robots.txt:', error);
    process.exit(1);
  }
}

// Run the generator
generateRobotsTxt();
