# Fix para Erros de MIME Type em Páginas de Artigos

## Problema Identificado

Ao acessar páginas de artigos através de URLs "limpas" (sem extensão .html), o navegador apresentava erros no console:

```
Refused to apply style from 'https://modelotrabalhista-2026.web.app/template.css?v=1770389835' 
because its MIME type ('text/html') is not a supported stylesheet MIME type, and strict MIME checking is enabled.

Failed to load resource: the server responded with a status of 404 ()

Refused to execute script from 'https://modelotrabalhista-2026.web.app/template.js?v=1770389835' 
because its MIME type ('text/html') is not executable, and strict MIME type checking is enabled.
```

## Causa Raiz

### Configuração do Firebase Hosting

O arquivo `firebase.json` está configurado com:
```json
{
  "hosting": {
    "cleanUrls": true,
    "trailingSlash": false
  }
}
```

A opção `cleanUrls: true` permite acessar páginas HTML sem a extensão `.html`:
- URL original: `https://site.com/artigos/banco-horas-vs-extras-2026.html`
- URL limpa: `https://site.com/artigos/banco-horas-vs-extras-2026`

### Problema com Caminhos Relativos

Quando o navegador acessa uma URL limpa como `/artigos/banco-horas-vs-extras-2026`:

1. **O navegador trata a URL como um arquivo**, não como um diretório
2. **Caminhos relativos** como `template.css` são resolvidos a partir da URL base
3. **A URL base é `/artigos/`**, mas sem trailing slash, o navegador resolve de `/`
4. **Resultado**: `template.css` → `/template.css` (ERRADO ❌)
5. **Firebase retorna 404** (página não encontrada em HTML)
6. **O navegador recebe HTML** ao invés de CSS/JS → **erro de MIME type**

### Fluxo do Erro

```
Usuário acessa: /artigos/banco-horas-vs-extras-2026
                          ↓
Navegador carrega: banco-horas-vs-extras-2026.html
                          ↓
HTML referencia: href="template.css"
                          ↓
Navegador resolve: /template.css (RAIZ)
                          ↓
Firebase não encontra /template.css
                          ↓
Firebase retorna página 404 em HTML
                          ↓
Navegador recebe HTML (text/html)
                          ↓
ERRO: MIME type incorreto!
```

## Solução Implementada

### Mudança de Caminhos Relativos para Absolutos

Alteramos todos os 29 arquivos HTML em `/artigos/` para usar caminhos absolutos:

**Antes (Relativo):**
```html
<link rel="stylesheet" href="template.css?v=1770389835">
<script src="template.js?v=1770389835"></script>
```

**Depois (Absoluto):**
```html
<link rel="stylesheet" href="/artigos/template.css?v=1770389835">
<script src="/artigos/template.js?v=1770389835"></script>
```

### Vantagens da Solução

✅ **Funciona com qualquer estrutura de URL**
- URLs limpas: `/artigos/banco-horas-vs-extras-2026` ✓
- URLs com .html: `/artigos/banco-horas-vs-extras-2026.html` ✓
- URLs com trailing slash: `/artigos/banco-horas-vs-extras-2026/` ✓

✅ **Sem mudanças no Firebase Hosting**
- Mantém `cleanUrls: true` para SEO
- Não requer configuração adicional

✅ **Mínimas alterações**
- Apenas mudança de `"template.` para `"/artigos/template.`
- Não afeta funcionalidade existente

## Alternativas Consideradas (Não Implementadas)

### 1. Adicionar Tag `<base>`
```html
<base href="/artigos/">
```
**Por que não foi usada:**
- Afeta TODOS os links relativos na página
- Pode quebrar links internos e âncoras
- Menos explícito e mais difícil de debugar

### 2. Desabilitar `cleanUrls`
```json
{
  "hosting": {
    "cleanUrls": false
  }
}
```
**Por que não foi usada:**
- Pior para SEO (URLs ficam com .html)
- Experiência do usuário inferior
- Não resolve o problema fundamental

### 3. Mudar para Caminhos Relativos com `./`
```html
<link rel="stylesheet" href="./template.css">
```
**Por que não foi usada:**
- Ainda pode ter problemas dependendo da URL
- Menos confiável que caminhos absolutos

## Recomendações para Futuro Desenvolvimento

### 1. Sempre Use Caminhos Absolutos para Recursos Compartilhados
```html
<!-- BOM ✓ -->
<link rel="stylesheet" href="/artigos/template.css">
<link rel="stylesheet" href="/css/style.css">
<script src="/js/script.js"></script>

<!-- EVITE ✗ -->
<link rel="stylesheet" href="template.css">
<link rel="stylesheet" href="../css/style.css">
```

### 2. Use Caminhos Relativos Apenas para Recursos no Mesmo Diretório
```html
<!-- Aceitável para recursos locais -->
<img src="./imagem-local.jpg" alt="Local">
```

### 3. Teste com Diferentes Estruturas de URL
Ao desenvolver novas páginas, teste com:
- URL limpa: `/artigos/novo-artigo`
- URL com extensão: `/artigos/novo-artigo.html`
- URL com trailing slash: `/artigos/novo-artigo/`

### 4. Considere um Sistema de Build
Para projetos maiores, considere usar:
- **Webpack/Vite**: Para bundling e resolução automática de caminhos
- **Templates/Componentes**: Para evitar repetição de código
- **Static Site Generator**: Como Hugo, Jekyll, ou Next.js

### 5. Documentação de Padrões
Mantenha um guia de estilo com:
- Convenções de caminhos (absolutos vs relativos)
- Estrutura de diretórios
- Nomenclatura de arquivos

## Verificação da Correção

Para verificar se a correção está funcionando:

1. **Acesse uma página de artigo** (ex: `/artigos/banco-horas-vs-extras-2026`)
2. **Abra o DevTools** (F12)
3. **Verifique a aba Console** → Não deve haver erros de MIME type
4. **Verifique a aba Network** → `template.css` e `template.js` devem retornar:
   - Status: `200 OK`
   - Content-Type: `text/css` e `application/javascript` (ou `text/javascript`)

## Arquivos Modificados

Total de 29 arquivos HTML atualizados em `/artigos/`:

- acidente-trabalho-pericia-inss-2026.html
- adicional-noturno-2026.html
- adicional-periculosidade-motoboy.html
- aviso-previo-indenizado-e-trabalhado.html
- banco-horas-vs-extras-2026.html
- burnout-doenca-ocupacional.html
- clt-pj-calculadora-2026.html
- demissao-comum-acordo.html
- esocial-domestico-2026.html
- estabilidade-gestante-2026.html
- fgts-digital-2026.html
- hora-extra-home-office-2026.html
- horas-extras-2026.html
- index.html
- intervalo-intrajornada-2026.html
- jovem-aprendiz-vs-estagiario-2026.html
- licenca-paternidade-2026.html
- motorista-app-clt-stf-2026.html
- multa-40-fgts.html
- pedido-demissao.html
- pericia-inss-2026.html
- pis-pasep-2026.html
- recisao-indireta-justa-causa-aplicada-pelo-empregado.html
- salario-familia-2026.html
- saque-aniversario-vs-rescisao.html
- seguro-desemprego-2026.html
- tabela-inss-2026.html
- teletrabalho-híbrido-custos-2026.html
- trabalho-feriados.html

## Data da Correção

**Data:** 07 de Fevereiro de 2026  
**Commit:** Fix MIME type errors by using absolute paths for template.css and template.js

---

## Melhorias Adicionais Sugeridas

### 1. Monitoramento de Erros
Considere implementar monitoramento de erros no frontend:
```javascript
// Adicionar ao template.js ou script principal
window.addEventListener('error', function(e) {
  if (e.target.tagName === 'LINK' || e.target.tagName === 'SCRIPT') {
    console.error('Failed to load resource:', e.target.href || e.target.src);
    // Enviar para serviço de monitoramento (Sentry, LogRocket, etc.)
  }
});
```

### 2. Fallback para CDN
Para recursos críticos, considere ter um fallback:
```html
<link rel="stylesheet" href="/artigos/template.css?v=1770389835" 
      onerror="this.href='https://cdn.example.com/backup/template.css'">
```

### 3. Pré-carregamento de Recursos
Adicione preload para recursos críticos:
```html
<link rel="preload" href="/artigos/template.css" as="style">
<link rel="preload" href="/artigos/template.js" as="script">
```

### 4. Validação Automatizada
Crie um teste automatizado para verificar caminhos:
```javascript
// test/paths.test.js
test('All template paths should be absolute', () => {
  const htmlFiles = glob.sync('artigos/*.html');
  htmlFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    expect(content).not.toMatch(/href="template\./);
    expect(content).not.toMatch(/src="template\./);
    expect(content).toMatch(/href="\/artigos\/template\./);
    expect(content).toMatch(/src="\/artigos\/template\./);
  });
});
```

---

**Autor:** GitHub Copilot Agent  
**Referência:** Issue #TBD - Investigate console errors in artigos pages
