# Automação de Versões e Cache-Busting

## 📋 Visão Geral

Este repositório possui automação completa para atualização de versões e cache-busting, garantindo que os usuários sempre recebam a versão mais recente dos arquivos.

## 🤖 Automações Implementadas

### 1. Service Worker - Atualização Automática de Versão ✅

**Script**: `scripts/update-service-worker-version.js`

O Service Worker é automaticamente versionado a cada deploy:
- Incrementa a versão minor automaticamente (ex: v1.3 → v1.4 → v1.5)
- Atualiza o `CACHE_NAME` para forçar invalidação de cache antigo
- Atualiza mensagens de log com a nova versão

**Como funciona**:
```javascript
// Antes
const CACHE_NAME = 'modelotrabalhista-v1.3';

// Depois (automaticamente)
const CACHE_NAME = 'modelotrabalhista-v1.4';
```

### 2. Cache-Busting HTML - Atualização Automática ✅

**Script**: `scripts/update-cache-busting.js`

Todos os arquivos HTML têm suas versões de cache-busting atualizadas:
- Atualiza todos os `?v=TIMESTAMP` em arquivos HTML
- Usa timestamp Unix atual para garantir unicidade
- Processa arquivos em: `.`, `artigos/`, `pages/`, `exemplos-documentos/`

**Como funciona**:
```html
<!-- Antes -->
<script src="js/main.js?v=1770389835"></script>

<!-- Depois (automaticamente) -->
<script src="js/main.js?v=1770454479"></script>
```

### 3. Sitemap.xml - Geração Automática ✅

**Script**: `scripts/generate-sitemap.js`

O sitemap é automaticamente regenerado quando:
- Arquivos HTML são adicionados ou modificados
- Um commit é feito na branch `main` com mudanças em HTML
- Deploy é executado

**Workflow**: `.github/workflows/update-seo.yml`

### 4. Robots.txt - Geração Automática ✅

**Script**: `scripts/generate-robots.js`

O robots.txt é automaticamente regenerado junto com o sitemap.

**Workflow**: `.github/workflows/update-seo.yml`

## 🔄 Workflows do GitHub Actions

### Workflow 1: Auto Update Versions

**Arquivo**: `.github/workflows/auto-update-versions.yml`

**Trigger**: Push para `main` com mudanças em arquivos HTML, JS, CSS

**Ações**:
1. Detecta mudanças em arquivos relevantes
2. Executa `npm run update-versions`
3. Commita automaticamente as mudanças
4. Push das atualizações de volta para o repositório

**Evita loops infinitos**: Verifica se o commit já contém atualizações de versão antes de executar.

### Workflow 2: Auto Update Sitemap and Robots.txt

**Arquivo**: `.github/workflows/update-seo.yml`

**Trigger**: Push para `main` com mudanças em arquivos HTML

**Ações**:
1. Gera novo sitemap.xml
2. Gera novo robots.txt
3. Commita se houver mudanças
4. Push automático

### Workflow 3: Firebase Hosting Deploy

**Arquivo**: `.github/workflows/deploy.yml`

**Trigger**: Push para `main`

**Ações**:
1. Instala dependências
2. **NOVO**: Executa `npm run build` (atualiza versões e gera SEO files)
3. Deploy para Firebase Hosting

### Workflow 4: Deploy to GitHub Pages

**Arquivo**: `.github/workflows/deploy-github-pages.yml`

**Trigger**: Push para `main`

**Ações**:
1. Instala dependências
2. Gera sitemap e robots.txt
3. Deploy para GitHub Pages

## 📦 Scripts NPM Disponíveis

```json
{
  "scripts": {
    "test": "node test-export.js",
    "update-sw": "node scripts/update-service-worker-version.js",
    "update-cache": "node scripts/update-cache-busting.js",
    "update-versions": "node scripts/update-versions.js",
    "generate-sitemap": "node scripts/generate-sitemap.js",
    "generate-robots": "node scripts/generate-robots.js",
    "generate-all": "npm run generate-sitemap && npm run generate-robots",
    "build": "npm run update-versions && npm run generate-all",
    "deploy": "npm run build",
    "deploy:firebase": "npm run deploy && firebase deploy"
  }
}
```

### Comandos Individuais

- `npm run update-sw` - Atualiza apenas a versão do Service Worker
- `npm run update-cache` - Atualiza apenas cache-busting dos HTML
- `npm run update-versions` - **Atualiza TUDO** (SW + cache-busting)
- `npm run generate-sitemap` - Gera sitemap.xml
- `npm run generate-robots` - Gera robots.txt
- `npm run generate-all` - Gera sitemap e robots
- `npm run build` - Build completo (versões + SEO)
- `npm run deploy` - Alias para build
- `npm run deploy:firebase` - Build + deploy Firebase manual

## 🚀 Fluxo de Deploy Automático

### Quando você faz um commit na branch `main`:

```
1. Push para main
   ↓
2. Workflow "Auto Update Versions" detecta mudanças
   ↓
3. Executa npm run update-versions
   - Incrementa versão do Service Worker
   - Atualiza cache-busting em todos os HTML
   ↓
4. Commita automaticamente: "🔄 Auto-update: Service Worker e cache-busting"
   ↓
5. Workflow "Update SEO" detecta mudanças em HTML
   ↓
6. Gera sitemap.xml e robots.txt
   ↓
7. Commita automaticamente: "🤖 Auto-update sitemap.xml and robots.txt"
   ↓
8. Workflow "Firebase Deploy" é acionado
   ↓
9. Executa npm run build (atualiza versões novamente se necessário)
   ↓
10. Deploy para Firebase Hosting
    ↓
11. Workflow "GitHub Pages Deploy" é acionado
    ↓
12. Deploy para GitHub Pages
    ↓
13. ✅ Deploy completo com versões atualizadas!
```

## ⚡ Garantias de Atualização

### ✅ O que É Automatizado

1. **Service Worker Version**: ✅ Atualiza automaticamente a cada deploy
2. **Cache-Busting HTML**: ✅ Atualiza automaticamente em todos os arquivos
3. **Sitemap.xml**: ✅ Regenerado automaticamente quando HTML muda
4. **Robots.txt**: ✅ Regenerado automaticamente quando HTML muda
5. **Firebase Deploy**: ✅ Build automático antes do deploy
6. **GitHub Pages Deploy**: ✅ Geração de SEO antes do deploy

### 🔒 Proteções Contra Loops

- **Auto Update Versions**: Verifica mensagem de commit para evitar loop infinito
- **Update SEO**: Só commita se houver mudanças reais nos arquivos

## 📝 Uso Manual

Se você quiser atualizar versões manualmente (não recomendado):

```bash
# Atualizar tudo
npm run update-versions

# Ou individualmente
npm run update-sw        # Service Worker
npm run update-cache     # Cache-busting HTML
npm run generate-all     # Sitemap + Robots

# Depois commitar
git add .
git commit -m "🔄 Manual update: versões"
git push
```

## 🎯 Resultado Esperado

### Antes da Automação

- ❌ Versão do Service Worker hardcoded (manual)
- ❌ Cache-busting com timestamp fixo (manual)
- ⚠️ Sitemap/robots gerados em alguns workflows mas não em todos
- ⚠️ Firebase deploy sem build step

### Depois da Automação

- ✅ Service Worker incrementa versão automaticamente
- ✅ Cache-busting atualiza timestamp em cada deploy
- ✅ Sitemap/robots sempre sincronizados com arquivos HTML
- ✅ Todos os workflows executam build antes do deploy
- ✅ Commits automáticos de atualizações
- ✅ Zero intervenção manual necessária

## 🔍 Como Verificar

### Service Worker

```bash
# Ver versão atual
head -5 service-worker.js

# Deverá mostrar versão incrementada após cada deploy
```

### Cache-Busting

```bash
# Ver versões em HTML
grep "?v=" index.html | head -5

# Timestamp deverá mudar em cada deploy
```

### Sitemap e Robots

```bash
# Ver data de modificação
ls -la sitemap.xml robots.txt

# Deverão ter data recente após commits em HTML
```

## 🎉 Benefícios

1. **Zero Manutenção**: Tudo atualiza automaticamente
2. **Sempre Atualizado**: Usuários sempre recebem versão mais recente
3. **SEO Otimizado**: Sitemap sempre sincronizado
4. **Cache Controlado**: Service Worker força atualização quando necessário
5. **Developer Friendly**: Basta fazer commit, o resto é automático
6. **Auditável**: Commits automáticos documentam cada atualização

## 🐛 Troubleshooting

### Service Worker não atualiza

```bash
# Execute manualmente
npm run update-sw

# Verifique a versão
grep CACHE_NAME service-worker.js
```

### Cache-busting não atualiza

```bash
# Execute manualmente
npm run update-cache

# Verifique um arquivo
grep "?v=" index.html | head -1
```

### Workflows não executam

1. Verifique permissões do GitHub Actions
2. Verifique se workflows estão habilitados no repositório
3. Verifique logs dos workflows no GitHub Actions tab

## 📚 Referências

- [Service Workers MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Cache-Busting Best Practices](https://www.keycdn.com/support/what-is-cache-busting)
- [Sitemap Protocol](https://www.sitemaps.org/protocol.html)
- [GitHub Actions](https://docs.github.com/en/actions)

---

**Última Atualização**: 7 de fevereiro de 2026  
**Versão da Documentação**: 1.0.0
