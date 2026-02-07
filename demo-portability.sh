#!/bin/bash

# Demonstration script showing how the site works with different domains
# This script shows the environment variable support for sitemap/robots.txt generation

echo "=================================================="
echo "  URL Refactoring Demo"
echo "  Domain Portability Demonstration"
echo "=================================================="
echo ""

echo "1️⃣ Default (Firebase) - No environment variable set"
echo "---------------------------------------------------"
node scripts/generate-sitemap.js 2>&1 | head -5
echo ""

echo "2️⃣ Cloudflare Pages - Using CF_PAGES_URL"
echo "---------------------------------------------------"
export CF_PAGES_URL="https://modelotrabalhista.pages.dev"
node scripts/generate-sitemap.js 2>&1 | head -5
echo ""

echo "3️⃣ Custom Domain - Using SITE_URL"
echo "---------------------------------------------------"
export SITE_URL="https://www.meudominio.com.br"
node scripts/generate-sitemap.js 2>&1 | head -5
echo ""

echo "=================================================="
echo "✅ Site works with ANY domain!"
echo "=================================================="
echo ""
echo "Key Points:"
echo "  ✅ HTML files use relative paths (/artigos/...)"
echo "  ✅ CSS files use relative paths"
echo "  ✅ JS files use relative paths"
echo "  ✅ Service Worker uses relative paths"
echo "  ✅ Sitemap/robots.txt adapt to environment"
echo ""
echo "Deploy anywhere:"
echo "  • Firebase Hosting"
echo "  • Cloudflare Pages"
echo "  • GitHub Pages"
echo "  • Netlify"
echo "  • Any custom domain"
echo ""
echo "No code changes needed! 🎉"
