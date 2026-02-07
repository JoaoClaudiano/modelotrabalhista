#!/usr/bin/env node

/**
 * Test Suite para Migração Cloudflare Pages
 * Verifica se todas as URLs foram corretamente atualizadas
 */

const fs = require('fs');
const path = require('path');

const NEW_DOMAIN = 'https://modelotrabalhista.pages.dev';
const OLD_DOMAIN = 'https://joaoclaudiano.github.io/modelotrabalhista';

let passed = 0;
let failed = 0;

function test(description, condition) {
    if (condition) {
        console.log(`✅ ${description}`);
        passed++;
    } else {
        console.log(`❌ ${description}`);
        failed++;
    }
}

console.log('\n🧪 TESTE DE MIGRAÇÃO PARA CLOUDFLARE PAGES\n');

// Test 1: robots.txt
console.log('📝 Testando robots.txt...');
const robotsTxt = fs.readFileSync('robots.txt', 'utf8');
test('robots.txt não contém domínio antigo', !robotsTxt.includes(OLD_DOMAIN));
test('robots.txt contém novo domínio', robotsTxt.includes(NEW_DOMAIN));
test('robots.txt tem sitemap correto', robotsTxt.includes(`Sitemap: ${NEW_DOMAIN}/sitemap.xml`));

// Test 2: sitemap.xml
console.log('\n📝 Testando sitemap.xml...');
const sitemapXml = fs.readFileSync('sitemap.xml', 'utf8');
test('sitemap.xml não contém domínio antigo', !sitemapXml.includes(OLD_DOMAIN));
test('sitemap.xml contém novo domínio', sitemapXml.includes(NEW_DOMAIN));
const sitemapUrlCount = (sitemapXml.match(new RegExp(NEW_DOMAIN, 'g')) || []).length;
test(`sitemap.xml tem múltiplas URLs com novo domínio (${sitemapUrlCount})`, sitemapUrlCount > 20);

// Test 3: index.html
console.log('\n📝 Testando index.html...');
const indexHtml = fs.readFileSync('index.html', 'utf8');
test('index.html não contém domínio antigo', !indexHtml.includes(OLD_DOMAIN));
test('index.html contém novo domínio', indexHtml.includes(NEW_DOMAIN));
test('index.html tem canonical com novo domínio', indexHtml.includes(`<link rel="canonical" href="${NEW_DOMAIN}/"`));
test('index.html tem JSON-LD com novo domínio', indexHtml.includes(`"url": "${NEW_DOMAIN}/"`));

// Test 4: Verificar páginas de artigos
console.log('\n📝 Testando artigos...');
const artigoPath = 'artigos/banco-horas-vs-extras-2026.html';
if (fs.existsSync(artigoPath)) {
    const artigoHtml = fs.readFileSync(artigoPath, 'utf8');
    test('Artigo não contém domínio antigo', !artigoHtml.includes(OLD_DOMAIN));
    test('Artigo tem canonical com novo domínio', artigoHtml.includes(`<link rel="canonical" href="${NEW_DOMAIN}/`));
    test('Artigo preserva caminhos relativos ../', artigoHtml.includes('../assets/') || artigoHtml.includes('../css/'));
    test('Artigo tem caminhos absolutos com /', artigoHtml.includes('href="/artigos/'));
}

// Test 5: Verificar páginas institucionais
console.log('\n📝 Testando páginas institucionais...');
const paginaPath = 'pages/contato.html';
if (fs.existsSync(paginaPath)) {
    const paginaHtml = fs.readFileSync(paginaPath, 'utf8');
    test('Página não contém domínio antigo', !paginaHtml.includes(OLD_DOMAIN));
    test('Página tem canonical com novo domínio', paginaHtml.includes(`<link rel="canonical" href="${NEW_DOMAIN}/`));
    test('Página preserva caminhos relativos ../', paginaHtml.includes('../assets/') || paginaHtml.includes('../css/'));
}

// Test 6: service-worker.js
console.log('\n📝 Testando service-worker.js...');
const serviceWorker = fs.readFileSync('service-worker.js', 'utf8');
test('Service Worker não contém domínio antigo', !serviceWorker.includes(OLD_DOMAIN));
test('Service Worker usa caminhos absolutos', serviceWorker.includes("'/") || serviceWorker.includes('"/'));

// Test 7: Verificar script de migração
console.log('\n📝 Testando script de migração...');
test('Script de migração existe', fs.existsSync('migrate-to-cloudflare.js'));
if (fs.existsSync('migrate-to-cloudflare.js')) {
    const script = fs.readFileSync('migrate-to-cloudflare.js', 'utf8');
    test('Script tem novo domínio configurado', script.includes(NEW_DOMAIN));
    test('Script tem domínio antigo para substituição', script.includes(OLD_DOMAIN));
}

// Resumo final
console.log('\n' + '='.repeat(60));
console.log(`✅ Testes Passados: ${passed}`);
console.log(`❌ Testes Falhou: ${failed}`);
console.log('='.repeat(60));

if (failed === 0) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ Migração para Cloudflare Pages concluída com sucesso!\n');
    process.exit(0);
} else {
    console.log('\n⚠️  ALGUNS TESTES FALHARAM!');
    console.log('Por favor, revise os itens marcados acima.\n');
    process.exit(1);
}
