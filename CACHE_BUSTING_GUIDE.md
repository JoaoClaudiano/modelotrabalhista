# Guia de Implementação - Cache Busting

## Visão Geral

Este guia documenta o sistema de Cache Busting implementado para o ModeloTrabalhista, que automaticamente adiciona versões aos arquivos estáticos (CSS e JavaScript) para garantir que usuários sempre recebam a versão mais recente dos recursos.

## Como Funciona

### 1. Script de Cache Busting

O script `build/cache-bust.js` adiciona automaticamente query strings de versão a todas as referências de CSS e JS nos arquivos HTML.

**Exemplo de transformação:**
```html
<!-- Antes -->
<link rel="stylesheet" href="css/style.css">
<script src="js/main.js"></script>

<!-- Depois -->
<link rel="stylesheet" href="css/style.css?v=1770387380">
<script src="js/main.js?v=1770387380">
```

### 2. Versionamento Baseado em Git

O script usa o timestamp do último commit Git como versão:
- **Vantagem:** Garante que a versão muda apenas quando há commit real
- **Consistência:** Todos os arquivos em um deploy têm a mesma versão
- **Rastreabilidade:** Versão corresponde a um commit específico

### 3. Compatibilidade com Service Worker

O Service Worker foi atualizado para ignorar query strings de versão ao cachear recursos:
- Usa estratégia "Stale-While-Revalidate"
- Retorna cache imediatamente enquanto busca atualização em background
- Compatível com HTTP Cache headers

## Uso

### Desenvolvimento Local

Durante desenvolvimento, você pode trabalhar normalmente sem executar o cache busting. Os arquivos serão referenciados sem versão.

### Antes de Fazer Deploy

Execute o comando de build que aplica o cache busting:

```bash
npm run build
```

Ou execute diretamente:

```bash
node build/cache-bust.js
```

### Deploy Completo (com sitemap e robots.txt)

```bash
npm run deploy
```

Este comando executa:
1. Cache busting em todos os HTML
2. Geração do sitemap.xml
3. Geração do robots.txt

### Deploy para Firebase

```bash
npm run deploy:firebase
```

Este comando executa todo o processo de build e faz deploy no Firebase Hosting.

## Comandos npm Disponíveis

```json
{
  "cache-bust": "node build/cache-bust.js",
  "build": "npm run cache-bust",
  "deploy": "npm run build && npm run generate-all",
  "deploy:firebase": "npm run deploy && firebase deploy"
}
```

## Configuração

### Arquivos Processados

O script processa automaticamente todos os arquivos `.html` no projeto, exceto:
- `node_modules/`
- `.git/`
- `dist/`
- `build/`
- `exemplos-documentos/`

### Padrões Reconhecidos

O script identifica e atualiza:

1. **CSS:**
   - `href="path/to/style.css"`
   - `href="path/to/style.css?v=old"`
   - Caminhos relativos e absolutos

2. **JavaScript:**
   - `src="path/to/script.js"`
   - `src="path/to/script.js?v=old"`
   - Caminhos relativos e absolutos

### Recursos Externos (CDN)

Recursos externos não são versionados:
```html
<!-- Não são versionados (CDN já tem versionamento) -->
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<script src="https://cdn.jsdelivr.net/npm/docx@7.8.0/+esm"></script>
```

## Integração com CI/CD

### GitHub Actions (Exemplo)

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build (cache busting)
        run: npm run build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

## Verificação

### Após executar o build

1. **Verifique os arquivos HTML:**
   ```bash
   grep -n "\.css?v=" index.html
   grep -n "\.js?v=" index.html
   ```

2. **Verifique a versão aplicada:**
   O script exibe um resumo:
   ```
   ✨ Total files processed: 37
   ✨ Total references updated: 255
   ✨ Cache version: ?v=1770387380
   ```

3. **Teste no navegador:**
   - Abra DevTools (F12)
   - Aba Network
   - Force reload (Ctrl+Shift+R)
   - Verifique que recursos têm `?v=...` na URL

## Troubleshooting

### Problema: Git não está disponível

**Sintoma:**
```
⚠️  Git not available, using current timestamp
```

**Solução:**
O script usa timestamp atual como fallback. Funciona normalmente, mas cada execução gera versão diferente.

### Problema: Versão não muda após commit

**Causa:** Cache do navegador ou Service Worker

**Solução:**
1. Hard reload: Ctrl+Shift+R
2. Ou limpe cache do Service Worker:
   ```javascript
   // No console do navegador
   navigator.serviceWorker.getRegistrations().then(registrations => {
     registrations.forEach(r => r.unregister());
   });
   ```

### Problema: Alguns arquivos não foram atualizados

**Causa:** Arquivo HTML em diretório excluído ou padrão não reconhecido

**Solução:**
1. Verifique se o diretório não está em `excludeDirs`
2. Verifique se o padrão do `href` ou `src` é válido

### Problema: Service Worker não atualiza recursos

**Causa:** Versão do SW não mudou

**Solução:**
O SW tem versão própria (`modelotrabalhista-v1.1`). Se precisar forçar atualização:
1. Incremente `CACHE_NAME` no service-worker.js
2. Redeploy

## Boas Práticas

### ✅ DO

1. **Execute `npm run build` antes de todo deploy**
2. **Commit os arquivos HTML atualizados**
3. **Teste localmente após build**
4. **Mantenha Service Worker atualizado**

### ❌ DON'T

1. **Não edite manualmente as query strings `?v=`**
2. **Não versione recursos externos (CDN)**
3. **Não execute build múltiplas vezes sem commit**
4. **Não ignore erros do script**

## Monitoramento

### Métricas para Acompanhar

1. **Cache Hit Rate:**
   - Google Analytics: Comportamento > Velocidade do Site
   - Espera-se: >80% hit rate após implementação

2. **Lighthouse Score:**
   - Deve melhorar especialmente em "Serve static assets with efficient cache policy"

3. **Time to Interactive (TTI):**
   - Com cache busting + HTTP cache longo, TTI deve reduzir em 30-40% em visitas repetidas

## Próximos Passos

### Melhorias Futuras

1. **Hash no nome do arquivo** (em vez de query string)
   - Requer bundler (Webpack, Vite)
   - Mais confiável em alguns proxies antigos

2. **Source Maps versionados**
   - Útil para debug de produção

3. **Preload de recursos críticos**
   - Combinar com cache busting para máxima performance

## Suporte

Para dúvidas ou problemas:
1. Verifique logs do script: `node build/cache-bust.js`
2. Inspecione Network tab do DevTools
3. Verifique console do Service Worker

---

**Última atualização:** Fevereiro 2026  
**Versão do sistema:** 1.0.0
