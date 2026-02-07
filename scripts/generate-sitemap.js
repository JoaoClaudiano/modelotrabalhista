#!/usr/bin/env node

const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Base URL and path for the website
// Using environment variable or default for better portability across environments
// Set SITE_URL environment variable for custom domains (e.g., Cloudflare Pages)
const SITE_URL = process.env.SITE_URL || process.env.CF_PAGES_URL || 'https://modelotrabalhista.pages.dev';

// Parse the URL to separate hostname and path
let BASE_HOSTNAME = SITE_URL;
let BASE_PATH = '';

try {
  const urlObj = new URL(SITE_URL);
  BASE_HOSTNAME = `${urlObj.protocol}//${urlObj.host}`;
  BASE_PATH = urlObj.pathname.replace(/\/$/, ''); // Remove trailing slash
} catch (error) {
  console.warn('Warning: Could not parse SITE_URL, using as-is:', error.message);
}

// Function to get all HTML files
function getHtmlFiles(dir, baseDir = dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      // Recursively get files from subdirectories
      results = results.concat(getHtmlFiles(filePath, baseDir));
    } else if (file.endsWith('.html') && file !== 'template.html' && file !== 'example.html') {
      // Get relative path from base directory
      const relativePath = path.relative(baseDir, filePath);
      results.push(relativePath);
    }
  });
  
  return results;
}

// Function to get last modified date of a file
function getLastModified(filePath) {
  try {
    const stat = fs.statSync(filePath);
    // Return ISO date format YYYY-MM-DD
    return stat.mtime.toISOString().split('T')[0];
  } catch (error) {
    return new Date().toISOString().split('T')[0];
  }
}

// Function to determine priority based on page type
function getPriority(url) {
  if (url === '' || url === 'index.html') return 1.0;
  if (url === 'artigos/' || url.startsWith('artigos/index')) return 0.9;
  if (url.startsWith('modelos/')) return 0.85;
  if (url.startsWith('artigos/')) return 0.8;
  if (url.startsWith('pages/')) return 0.6;
  return 0.7;
}

// Function to determine change frequency
function getChangeFreq(url) {
  if (url === '' || url === 'index.html') return 'weekly';
  if (url === 'artigos/' || url.startsWith('artigos/index')) return 'weekly';
  if (url.startsWith('modelos/')) return 'monthly';
  if (url.startsWith('artigos/')) return 'monthly';
  if (url.startsWith('pages/')) return 'monthly';
  return 'monthly';
}

async function generateSitemap() {
  try {
    const repoRoot = process.cwd();
    
    // Get all HTML files
    const htmlFiles = getHtmlFiles(repoRoot);
    
    // Create sitemap entries
    const links = htmlFiles.map(file => {
      // Convert file path to URL path
      let url = file.replace(/\\/g, '/');
      
      // Remove index.html from the end for cleaner URLs
      if (url.endsWith('/index.html')) {
        url = url.replace('/index.html', '/');
      } else if (url === 'index.html') {
        url = '';
      } else {
        // Remove .html extension for cleaner URLs
        url = url.replace('.html', '');
      }
      
      const fullPath = path.join(repoRoot, file);
      
      return {
        url: url ? `${BASE_PATH}/${url}` : `${BASE_PATH}/`,
        changefreq: getChangeFreq(url),
        priority: getPriority(url),
        lastmod: getLastModified(fullPath)
      };
    });
    
    // Sort by priority (highest first) and then by URL
    links.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return a.url.localeCompare(b.url);
    });
    
    // Create a stream to write to
    const stream = new SitemapStream({ hostname: BASE_HOSTNAME });
    
    // Generate sitemap XML
    let xmlString = await streamToPromise(Readable.from(links).pipe(stream)).then(data => data.toString());
    
    // Format XML with proper indentation
    xmlString = xmlString
      .replace(/<urlset([^>]*)>/, '<urlset$1>\n    ')
      .replace(/<url>/g, '<url>\n        ')
      .replace(/<\/loc>/g, '</loc>\n        ')
      .replace(/<\/lastmod>/g, '</lastmod>\n        ')
      .replace(/<\/changefreq>/g, '</changefreq>\n        ')
      .replace(/<\/priority>/g, '</priority>\n    ')
      .replace(/<\/url>/g, '</url>\n    ')
      .replace(/\n    <\/urlset>/, '\n</urlset>');
    
    // Write to sitemap.xml
    const sitemapPath = path.join(repoRoot, 'sitemap.xml');
    fs.writeFileSync(sitemapPath, xmlString);
    
    console.log(`✅ Sitemap generated successfully at ${sitemapPath}`);
    console.log(`📊 Total URLs: ${links.length}`);
    console.log('\n📄 Generated URLs:');
    links.forEach(link => {
      console.log(`  - ${BASE_HOSTNAME}${link.url} (priority: ${link.priority}, changefreq: ${link.changefreq})`);
    });
    
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

// Run the generator
generateSitemap();
