#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Base URL for the website
const BASE_URL = 'https://modelotrabalhista.com.br';

// Directories and files that should NOT be crawled
const DISALLOW_PATTERNS = [
  '/admin/',
  '/login/',
  '/config/',
  '/.git/',
  '/node_modules/',
  '/assets/temp/',
  '*.json',
  '*.js',
  '*.css',
  '/template.html',
  '/example.html',
];

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
      // Add template and example files to disallow list
      if (file === 'template.html' || file === 'example.html' || 
          file.endsWith('.js') || file.endsWith('.css') || file.endsWith('.json')) {
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
  content += '# Desabilitar crawling de áreas administrativas e arquivos técnicos\n';
  
  // Add static disallow patterns
  DISALLOW_PATTERNS.forEach(pattern => {
    if (pattern.startsWith('/') && pattern.endsWith('/')) {
      // It's a directory
      content += `Disallow: ${pattern}\n`;
    } else if (pattern.includes('*')) {
      // It's a pattern (some crawlers support this)
      content += `Disallow: ${pattern}\n`;
    } else {
      content += `Disallow: ${pattern}\n`;
    }
  });
  
  // Add dynamic disallows for template and technical files
  const uniqueDisallows = [...new Set(dynamicDisallows)].sort();
  if (uniqueDisallows.length > 0) {
    content += '\n# Arquivos técnicos e templates\n';
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
