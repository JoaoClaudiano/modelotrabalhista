#!/usr/bin/env node

/**
 * Script de Migração para Cloudflare Pages
 * Atualiza todos os arquivos do site para o novo domínio modelotrabalhista.pages.dev
 * 
 * Funcionalidades:
 * 1. Atualiza robots.txt e sitemap.xml com novo domínio
 * 2. Atualiza HTML files com caminhos absolutos e canonical URLs
 * 3. Atualiza service-worker.js com caminhos absolutos
 * 4. Preserva links relativos dentro da mesma pasta (../)
 */

const fs = require('fs');
const path = require('path');

// Configuração
const NEW_DOMAIN = 'https://modelotrabalhista.pages.dev';
const OLD_DOMAIN = 'https://joaoclaudiano.github.io/modelotrabalhista';

// Contador de arquivos alterados
const filesChanged = {
    html: [],
    xml: [],
    txt: [],
    js: []
};

/**
 * Lê arquivo e retorna o conteúdo
 */
function readFile(filePath) {
    return fs.readFileSync(filePath, 'utf8');
}

/**
 * Escreve conteúdo em arquivo
 */
function writeFile(filePath, content) {
    fs.writeFileSync(filePath, content, 'utf8');
}

/**
 * Atualiza robots.txt
 */
function updateRobotsTxt(filePath) {
    console.log('\n📝 Atualizando robots.txt...');
    let content = readFile(filePath);
    const originalContent = content;
    
    // Atualiza URL do sitemap
    content = content.replace(
        /Sitemap: https:\/\/[^\s]+\/sitemap\.xml/g,
        `Sitemap: ${NEW_DOMAIN}/sitemap.xml`
    );
    
    if (content !== originalContent) {
        writeFile(filePath, content);
        filesChanged.txt.push(filePath);
        console.log('✅ robots.txt atualizado');
    } else {
        console.log('ℹ️  robots.txt já está atualizado');
    }
}

/**
 * Atualiza sitemap.xml
 */
function updateSitemapXml(filePath) {
    console.log('\n📝 Atualizando sitemap.xml...');
    let content = readFile(filePath);
    const originalContent = content;
    
    // Substitui todas as URLs do GitHub Pages pelo novo domínio
    content = content.replace(
        new RegExp(OLD_DOMAIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        NEW_DOMAIN
    );
    
    if (content !== originalContent) {
        writeFile(filePath, content);
        filesChanged.xml.push(filePath);
        console.log('✅ sitemap.xml atualizado');
    } else {
        console.log('ℹ️  sitemap.xml já está atualizado');
    }
}

/**
 * Atualiza service-worker.js
 */
function updateServiceWorker(filePath) {
    console.log('\n📝 Atualizando service-worker.js...');
    let content = readFile(filePath);
    const originalContent = content;
    
    // Lista de recursos essenciais - já estão com caminhos absolutos
    // Apenas verifica se há alguma referência ao domínio antigo
    content = content.replace(
        new RegExp(OLD_DOMAIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        NEW_DOMAIN
    );
    
    if (content !== originalContent) {
        writeFile(filePath, content);
        filesChanged.js.push(filePath);
        console.log('✅ service-worker.js atualizado');
    } else {
        console.log('ℹ️  service-worker.js já está com caminhos absolutos');
    }
}

/**
 * Atualiza arquivo HTML
 */
function updateHtmlFile(filePath) {
    let content = readFile(filePath);
    const originalContent = content;
    let changed = false;
    
    // 1. Atualiza canonical URLs para usar o novo domínio
    const canonicalRegex = /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/g;
    content = content.replace(canonicalRegex, (match, url) => {
        // Se a URL já começa com http, substitui pelo novo domínio
        if (url.startsWith('http')) {
            const newUrl = url.replace(OLD_DOMAIN, NEW_DOMAIN);
            changed = changed || (url !== newUrl);
            return `<link rel="canonical" href="${newUrl}"`;
        }
        // Se é um caminho relativo, adiciona o novo domínio
        else if (!url.startsWith('/')) {
            // Calcula o caminho absoluto baseado no arquivo
            const relativePath = path.relative(path.dirname(filePath), path.dirname('/'));
            const absolutePath = path.join(relativePath, url).replace(/\\/g, '/');
            changed = true;
            return `<link rel="canonical" href="${NEW_DOMAIN}${absolutePath}"`;
        }
        // Se já é absoluto (começa com /), adiciona o domínio
        else {
            changed = true;
            return `<link rel="canonical" href="${NEW_DOMAIN}${url}"`;
        }
    });
    
    // 2. Atualiza og:url para o novo domínio
    const ogUrlRegex = /<meta\s+property=["']og:url["']\s+content=["']([^"']+)["']/g;
    content = content.replace(ogUrlRegex, (match, url) => {
        if (url === '/' || url === '') {
            // Para a página principal, usa apenas /
            return match;
        } else if (url.startsWith('http')) {
            const newUrl = url.replace(OLD_DOMAIN, NEW_DOMAIN);
            changed = changed || (url !== newUrl);
            return `<meta property="og:url" content="${newUrl}"`;
        } else if (!url.startsWith('/')) {
            // Converte para caminho absoluto
            changed = true;
            return `<meta property="og:url" content="/${url}"`;
        }
        return match;
    });
    
    // 3. Atualiza links internos (<a href="...">)
    // Não atualiza links que já começam com /, http, https, #, ou ../
    const linkRegex = /<a\s+([^>]*?)href=["']([^"']+)["']([^>]*?)>/g;
    content = content.replace(linkRegex, (match, before, href, after) => {
        // Ignora links externos, âncoras, mailto, tel, e links relativos com ../
        if (href.startsWith('http') || href.startsWith('#') || 
            href.startsWith('mailto:') || href.startsWith('tel:') ||
            href.includes('../')) {
            return match;
        }
        
        // Se já começa com /, mantém
        if (href.startsWith('/')) {
            return match;
        }
        
        // Converte para caminho absoluto
        // Calcula o caminho relativo do arquivo atual para a raiz
        const fileDir = path.dirname(filePath);
        const rootDir = path.resolve('/home/runner/work/modelotrabalhista/modelotrabalhista');
        const relativeToRoot = path.relative(rootDir, fileDir);
        
        let absolutePath;
        if (relativeToRoot) {
            absolutePath = '/' + relativeToRoot.replace(/\\/g, '/') + '/' + href;
        } else {
            absolutePath = '/' + href;
        }
        
        changed = true;
        return `<a ${before}href="${absolutePath}"${after}>`;
    });
    
    // 4. Atualiza imagens (<img src="...">)
    const imgRegex = /<img\s+([^>]*?)src=["']([^"']+)["']([^>]*?)>/g;
    content = content.replace(imgRegex, (match, before, src, after) => {
        // Ignora URLs externas, data URIs, e caminhos relativos com ../
        if (src.startsWith('http') || src.startsWith('data:') || 
            src.startsWith('//') || src.includes('../')) {
            return match;
        }
        
        // Se já começa com /, mantém
        if (src.startsWith('/')) {
            return match;
        }
        
        // Converte para caminho absoluto
        const fileDir = path.dirname(filePath);
        const rootDir = path.resolve('/home/runner/work/modelotrabalhista/modelotrabalhista');
        const relativeToRoot = path.relative(rootDir, fileDir);
        
        let absolutePath;
        if (relativeToRoot) {
            absolutePath = '/' + relativeToRoot.replace(/\\/g, '/') + '/' + src;
        } else {
            absolutePath = '/' + src;
        }
        
        changed = true;
        return `<img ${before}src="${absolutePath}"${after}>`;
    });
    
    // 5. Atualiza CSS (<link href="...">)
    const cssRegex = /<link\s+([^>]*?)href=["']([^"']+\.css[^"']*)["']([^>]*?)>/g;
    content = content.replace(cssRegex, (match, before, href, after) => {
        // Ignora URLs externas e caminhos relativos com ../
        if (href.startsWith('http') || href.startsWith('//') || href.includes('../')) {
            return match;
        }
        
        // Se já começa com /, mantém
        if (href.startsWith('/')) {
            return match;
        }
        
        // Converte para caminho absoluto
        const fileDir = path.dirname(filePath);
        const rootDir = path.resolve('/home/runner/work/modelotrabalhista/modelotrabalhista');
        const relativeToRoot = path.relative(rootDir, fileDir);
        
        let absolutePath;
        if (relativeToRoot) {
            absolutePath = '/' + relativeToRoot.replace(/\\/g, '/') + '/' + href;
        } else {
            absolutePath = '/' + href;
        }
        
        changed = true;
        return `<link ${before}href="${absolutePath}"${after}>`;
    });
    
    // 6. Atualiza JavaScript (<script src="...">)
    const scriptRegex = /<script\s+([^>]*?)src=["']([^"']+)["']([^>]*?)>/g;
    content = content.replace(scriptRegex, (match, before, src, after) => {
        // Ignora URLs externas e caminhos relativos com ../
        if (src.startsWith('http') || src.startsWith('//') || src.includes('../')) {
            return match;
        }
        
        // Se já começa com /, mantém
        if (src.startsWith('/')) {
            return match;
        }
        
        // Converte para caminho absoluto
        const fileDir = path.dirname(filePath);
        const rootDir = path.resolve('/home/runner/work/modelotrabalhista/modelotrabalhista');
        const relativeToRoot = path.relative(rootDir, fileDir);
        
        let absolutePath;
        if (relativeToRoot) {
            absolutePath = '/' + relativeToRoot.replace(/\\/g, '/') + '/' + src;
        } else {
            absolutePath = '/' + src;
        }
        
        changed = true;
        return `<script ${before}src="${absolutePath}"${after}>`;
    });
    
    // 7. Atualiza JSON-LD URLs
    const jsonLdRegex = /"url":\s*"([^"]+)"/g;
    content = content.replace(jsonLdRegex, (match, url) => {
        if (url === '/') {
            // Página principal - atualiza para o novo domínio
            changed = true;
            return `"url": "${NEW_DOMAIN}/"`;
        } else if (url.startsWith('http')) {
            const newUrl = url.replace(OLD_DOMAIN, NEW_DOMAIN);
            changed = changed || (url !== newUrl);
            return `"url": "${newUrl}"`;
        }
        return match;
    });
    
    if (changed && content !== originalContent) {
        writeFile(filePath, content);
        filesChanged.html.push(filePath);
        return true;
    }
    
    return false;
}

/**
 * Processa todos os arquivos HTML recursivamente
 */
function processHtmlFiles(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            // Ignora node_modules e .git
            if (file !== 'node_modules' && file !== '.git' && file !== '.github') {
                processHtmlFiles(filePath);
            }
        } else if (file.endsWith('.html')) {
            // Ignora template.html e example.html
            if (file !== 'template.html' && file !== 'example.html') {
                updateHtmlFile(filePath);
            }
        }
    }
}

/**
 * Função principal
 */
function main() {
    console.log('🚀 Iniciando migração para Cloudflare Pages...');
    console.log(`📍 Novo domínio: ${NEW_DOMAIN}`);
    console.log(`📍 Domínio antigo: ${OLD_DOMAIN}\n`);
    
    const rootDir = '/home/runner/work/modelotrabalhista/modelotrabalhista';
    
    // Atualiza arquivos de configuração
    updateRobotsTxt(path.join(rootDir, 'robots.txt'));
    updateSitemapXml(path.join(rootDir, 'sitemap.xml'));
    updateServiceWorker(path.join(rootDir, 'service-worker.js'));
    
    // Atualiza todos os arquivos HTML
    console.log('\n📝 Atualizando arquivos HTML...');
    processHtmlFiles(rootDir);
    
    // Relatório final
    console.log('\n✨ Migração concluída!\n');
    console.log('📊 Arquivos alterados:');
    console.log(`   - HTML: ${filesChanged.html.length} arquivos`);
    console.log(`   - XML: ${filesChanged.xml.length} arquivos`);
    console.log(`   - TXT: ${filesChanged.txt.length} arquivos`);
    console.log(`   - JS: ${filesChanged.js.length} arquivos`);
    
    if (filesChanged.html.length > 0) {
        console.log('\n📄 Arquivos HTML atualizados:');
        filesChanged.html.forEach(f => {
            const relative = path.relative(rootDir, f);
            console.log(`   ✓ ${relative}`);
        });
    }
    
    if (filesChanged.xml.length > 0) {
        console.log('\n📄 Arquivos XML atualizados:');
        filesChanged.xml.forEach(f => {
            const relative = path.relative(rootDir, f);
            console.log(`   ✓ ${relative}`);
        });
    }
    
    if (filesChanged.txt.length > 0) {
        console.log('\n📄 Arquivos TXT atualizados:');
        filesChanged.txt.forEach(f => {
            const relative = path.relative(rootDir, f);
            console.log(`   ✓ ${relative}`);
        });
    }
    
    if (filesChanged.js.length > 0) {
        console.log('\n📄 Arquivos JS atualizados:');
        filesChanged.js.forEach(f => {
            const relative = path.relative(rootDir, f);
            console.log(`   ✓ ${relative}`);
        });
    }
    
    console.log('\n✅ Todos os arquivos foram atualizados com sucesso!');
    console.log('🌐 O site agora está configurado para: ' + NEW_DOMAIN);
}

// Executa o script
if (require.main === module) {
    main();
}

module.exports = { main };
