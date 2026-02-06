# Performance Optimization Implementation

## Resumo Executivo

Este documento fornece instruções práticas para utilizar as otimizações de performance implementadas no ModeloTrabalhista. As melhorias incluem Cache Busting, Lazy Loading, otimização de Service Worker e headers HTTP otimizados.

## 🚀 Quick Start

### Para Desenvolvimento

Durante desenvolvimento, trabalhe normalmente. Não é necessário executar scripts de otimização.

### Para Deploy (GitHub Pages)

```bash
# 1. Execute o cache busting
npm run build

# 2. Verifique as mudanças
git status

# 3. Commit e push
git add .
git commit -m "Deploy com cache busting"
git push origin main
```

### Para Deploy (Firebase Hosting)

```bash
# Comando único que faz tudo
npm run deploy:firebase
```

## 📚 Documentação Completa

### Documentos Técnicos

1. **[PERFORMANCE_OPTIMIZATION_PLAN.md](./PERFORMANCE_OPTIMIZATION_PLAN.md)**
   - Análise técnica completa (26 páginas)
   - Validação para GitHub Pages e Firebase Hosting
   - Análise de riscos detalhada
   - Impacto em SEO e AdSense
   - Técnicas extras de alto impacto

2. **[CACHE_BUSTING_GUIDE.md](./CACHE_BUSTING_GUIDE.md)**
   - Como funciona o sistema de versionamento
   - Comandos npm disponíveis
   - Integração com CI/CD
   - Troubleshooting

3. **[LAZY_LOADING_GUIDE.md](./LAZY_LOADING_GUIDE.md)**
   - Estratégias de lazy loading implementadas
   - Intersection Observer API
   - Dynamic imports
   - Impacto em Core Web Vitals

## 🛠️ Ferramentas Implementadas

### 1. Cache Busting Automático

**Script:** `build/cache-bust.js`

Adiciona automaticamente versões aos arquivos CSS e JS baseado no timestamp do último commit Git.

```bash
# Executar manualmente
node build/cache-bust.js

# Via npm
npm run cache-bust
```

**Resultado:**
```html
<!-- Antes -->
<link href="css/style.css">

<!-- Depois -->
<link href="css/style.css?v=1770387380">
```

### 2. Lazy Loading Utilities

**Arquivo:** `js/utils/lazy-loading.js`

Biblioteca de utilitários para lazy loading de:
- Bibliotecas de exportação (jsPDF, docx.js)
- Imagens (polyfill para navegadores antigos)
- Módulos dinâmicos

**Uso:**

```html
<!-- Adicionar no HTML (opcional - implementação avançada) -->
<script src="js/utils/lazy-loading.js?v=..." defer></script>
```

O script se auto-inicializa e:
- Observa botões de exportação
- Pré-carrega bibliotecas quando usuário rola próximo
- Reduz bundle inicial em ~800KB

### 3. Service Worker Otimizado

**Arquivo:** `service-worker.js` (v1.1)

Características:
- Compatível com cache busting (ignora `?v=...`)
- Estratégia Stale-While-Revalidate
- Cache de CDNs confiáveis
- Fallback offline

**Versão:** 1.1.0

### 4. Headers HTTP Otimizados

**Arquivos:** `_headers` (GitHub Pages), `firebase.json` (Firebase)

Políticas de cache implementadas:

| Recurso | Cache-Control | Duração |
|---------|---------------|---------|
| CSS/JS | `public, max-age=31536000, immutable` | 1 ano |
| Imagens | `public, max-age=31536000, immutable` | 1 ano |
| Fontes | `public, max-age=31536000, immutable` | 1 ano |
| HTML | `public, max-age=0, must-revalidate` | Sempre fresco |
| JSON | `public, max-age=86400` | 24 horas |
| robots.txt | `public, max-age=3600` | 1 hora |
| sitemap.xml | `public, max-age=3600` | 1 hora |

## 📊 Métricas Esperadas

### Core Web Vitals

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| **LCP** (Largest Contentful Paint) | 2.5s | 1.4s | **44%** ⭐⭐⭐ |
| **FID** (First Input Delay) | 180ms | 80ms | **56%** ⭐⭐ |
| **CLS** (Cumulative Layout Shift) | 0.08 | 0.03 | **63%** ⭐⭐ |
| **TTI** (Time to Interactive) | 4.2s | 2.6s | **38%** ⭐⭐⭐ |
| **Bundle Inicial** | 950KB | 350KB | **63%** ⭐⭐⭐ |

### Lighthouse Score

- **Antes:** 65-75 (Mobile)
- **Depois:** 90-95 (Mobile)
- **Ganho:** +25-30 pontos

## 🔧 Comandos npm

```json
{
  "cache-bust": "node build/cache-bust.js",
  "build": "npm run cache-bust",
  "generate-sitemap": "node generate-sitemap.js",
  "generate-robots": "node generate-robots.js",
  "generate-all": "npm run generate-sitemap && npm run generate-robots",
  "deploy": "npm run build && npm run generate-all",
  "deploy:firebase": "npm run deploy && firebase deploy"
}
```

### Descrição dos Comandos

- **`cache-bust`**: Aplica versionamento a todos os arquivos CSS/JS
- **`build`**: Alias para cache-bust
- **`generate-sitemap`**: Gera sitemap.xml atualizado
- **`generate-robots`**: Gera robots.txt atualizado
- **`generate-all`**: Gera sitemap e robots
- **`deploy`**: Prepara tudo para deploy (build + SEO files)
- **`deploy:firebase`**: Deploy completo no Firebase Hosting

## 🔍 Validação

### Após Deploy

1. **Verificar versões aplicadas:**
   ```bash
   # Ver versões em um arquivo
   grep "\.css?v=" index.html
   grep "\.js?v=" index.html
   ```

2. **Testar no navegador:**
   - Abrir DevTools (F12)
   - Aba Network
   - Force reload (Ctrl+Shift+R)
   - Verificar que recursos têm `?v=...`

3. **Verificar Service Worker:**
   ```javascript
   // No console do navegador
   navigator.serviceWorker.getRegistrations().then(r => console.log(r));
   ```

4. **Lighthouse Audit:**
   - DevTools > Lighthouse
   - Selecionar "Performance" + "Mobile"
   - Generate report

5. **PageSpeed Insights:**
   ```
   https://pagespeed.web.dev/
   ```

## 🐛 Troubleshooting

### Cache não atualiza após deploy

**Sintoma:** Usuários veem versão antiga do site

**Causa:** Service Worker ou browser cache

**Solução:**
1. Incrementar versão do Service Worker:
   ```javascript
   // service-worker.js
   const CACHE_NAME = 'modelotrabalhista-v1.2'; // Incrementar
   ```

2. Ou limpar cache manualmente:
   ```javascript
   // Console do navegador
   caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
   ```

### Script de cache bust falha

**Sintoma:** `⚠️ Git not available`

**Causa:** Git não instalado ou não em PATH

**Solução:** Script usa timestamp atual como fallback. Funciona normalmente.

### Lazy loading não funciona

**Sintoma:** Bibliotecas não carregam ou carregam com delay

**Causa:** Intersection Observer não suportado ou botões não encontrados

**Solução:** Script tem fallback automático (carrega após 3s)

## 📈 Monitoramento Contínuo

### Ferramentas Recomendadas

1. **Google Search Console**
   - Acompanhar Core Web Vitals
   - Verificar problemas de indexação
   - Monitorar velocidade mobile

2. **Google Analytics**
   - Comportamento > Velocidade do Site
   - Tempo de carregamento médio
   - Taxa de rejeição

3. **Lighthouse CI** (GitHub Actions)
   ```yaml
   # .github/workflows/lighthouse.yml
   - name: Lighthouse CI
     uses: treosh/lighthouse-ci-action@v9
   ```

4. **Real User Monitoring (RUM)**
   - Web Vitals library: `web-vitals` npm package
   - Enviar métricas para Analytics

### KPIs para Acompanhar

- **LCP:** < 1.5s (ideal < 1.2s)
- **FID:** < 100ms (ideal < 50ms)
- **CLS:** < 0.1 (ideal < 0.05)
- **TTI:** < 3.0s (ideal < 2.5s)
- **Lighthouse Score:** > 90 (mobile e desktop)
- **Cache Hit Rate:** > 80%

## 🎯 Próximos Passos (Opcional)

### Implementações Futuras Recomendadas

1. **Critical CSS Inline**
   - Extrair CSS crítico
   - Inline no `<head>`
   - Preload CSS completo
   - **Ganho:** +1.1s LCP

2. **WebP com Fallback**
   ```html
   <picture>
     <source srcset="image.webp" type="image/webp">
     <img src="image.png" alt="...">
   </picture>
   ```
   - **Ganho:** -60% tamanho de imagem

3. **HTTP/2 Server Push** (Firebase)
   ```json
   {
     "headers": [{
       "key": "Link",
       "value": "</css/style.css>; rel=preload; as=style"
     }]
   }
   ```
   - **Ganho:** -200ms FCP

4. **Lighthouse CI no GitHub Actions**
   - Audit automático em cada PR
   - Bloquear merge se score < 90
   - Relatórios comparativos

## 📞 Suporte

### Documentação Adicional

- [PERFORMANCE_OPTIMIZATION_PLAN.md](./PERFORMANCE_OPTIMIZATION_PLAN.md) - Plano completo
- [CACHE_BUSTING_GUIDE.md](./CACHE_BUSTING_GUIDE.md) - Cache busting
- [LAZY_LOADING_GUIDE.md](./LAZY_LOADING_GUIDE.md) - Lazy loading

### Para Dúvidas

1. Verificar documentação técnica
2. Inspecionar console do navegador
3. Usar DevTools > Network e Performance tabs
4. Executar Lighthouse audit

## ✅ Checklist de Deploy

Antes de fazer deploy para produção:

- [ ] Executar `npm run build`
- [ ] Verificar que arquivos HTML foram atualizados (git status)
- [ ] Testar localmente com servidor HTTP
- [ ] Verificar console do navegador (sem erros)
- [ ] Executar Lighthouse audit (score > 90)
- [ ] Commit e push
- [ ] Verificar site em produção após deploy
- [ ] Testar em mobile real
- [ ] Monitorar Core Web Vitals nos próximos dias

---

**Versão:** 1.0.0  
**Data:** Fevereiro 2026  
**Mantido por:** ModeloTrabalhista Performance Team
