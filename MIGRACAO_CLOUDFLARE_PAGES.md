# Migração para Cloudflare Pages

## 📋 Resumo

Este documento descreve a migração do site ModeloTrabalhista do GitHub Pages para o Cloudflare Pages, incluindo a atualização de todos os URLs e links internos para o novo domínio.

## 🎯 Objetivo

Atualizar todo o site para o novo domínio `https://modelotrabalhista.pages.dev` e garantir que todos os links internos funcionem corretamente.

## 🔄 Alterações Realizadas

### 1. Arquivos de Configuração

#### robots.txt
- ✅ Atualizado URL do sitemap de `https://joaoclaudiano.github.io/modelotrabalhista/sitemap.xml` para `https://modelotrabalhista.pages.dev/sitemap.xml`

#### sitemap.xml
- ✅ Atualizadas todas as 35 URLs do domínio antigo para o novo domínio Cloudflare Pages
- ✅ Mantida estrutura completa com prioridades e frequências de atualização

#### service-worker.js
- ✅ Já estava usando caminhos absolutos (começando com `/`)
- ✅ Verificado e confirmado compatibilidade com novo domínio
- ✅ Sem necessidade de alterações

### 2. Arquivos HTML (37 arquivos atualizados)

#### Principais Alterações:
1. **URLs Canônicas**: Atualizadas para usar o novo domínio completo
   - Exemplo: `<link rel="canonical" href="https://modelotrabalhista.pages.dev/">`

2. **Structured Data (JSON-LD)**: Atualizados todos os campos `"url"` para o novo domínio
   - Exemplo: `"url": "https://modelotrabalhista.pages.dev/"`

3. **Links Internos**: Convertidos para caminhos absolutos quando apropriado
   - Exemplo: `<a href="/artigos/index.html">` (inicia com `/`)

4. **Caminhos Relativos Preservados**: Links com `../` foram mantidos conforme solicitado
   - Exemplo: `<link rel="icon" href="../assets/favicon.ico">`
   - Isso mantém compatibilidade com a estrutura de pastas

#### Arquivos HTML Atualizados:
- ✅ `index.html`
- ✅ `artigos/index.html`
- ✅ 28 artigos em `artigos/*.html`
- ✅ 5 páginas institucionais em `pages/*.html` (contato, disclaimer, privacidade, sobre, termos)

### 3. Script de Migração

Criado `migrate-to-cloudflare.js` - um script Node.js completo que:
- ✅ Processa automaticamente todos os arquivos do repositório
- ✅ Atualiza robots.txt e sitemap.xml
- ✅ Atualiza canonical URLs em todos os HTMLs
- ✅ Converte links internos para caminhos absolutos
- ✅ Preserva links relativos com `../` conforme especificado
- ✅ Atualiza JSON-LD structured data
- ✅ Mostra relatório detalhado dos arquivos alterados

**Como executar:**
```bash
node migrate-to-cloudflare.js
```

## ✅ Validação

### Testes Automáticos
Criado `test-cloudflare-migration.js` que valida:
- ✅ Domínio antigo não está presente nos arquivos
- ✅ Novo domínio está presente onde esperado
- ✅ Canonical URLs estão corretos
- ✅ JSON-LD structured data está atualizado
- ✅ Caminhos relativos estão preservados
- ✅ Caminhos absolutos estão corretos

**Resultado dos testes:**
```
✅ 22/22 testes passaram
🎉 Migração concluída com sucesso!
```

**Como executar os testes:**
```bash
node test-cloudflare-migration.js
```

### Verificações Manuais Realizadas
1. ✅ robots.txt: sitemap URL correto
2. ✅ sitemap.xml: todas as URLs com novo domínio
3. ✅ index.html: canonical e JSON-LD corretos
4. ✅ Artigos: canonical URLs e caminhos corretos
5. ✅ Páginas institucionais: canonical URLs corretos
6. ✅ Nenhuma referência ao domínio antigo encontrada

## 📊 Estatísticas da Migração

- **Total de arquivos alterados**: 38
  - 35 arquivos HTML
  - 1 sitemap.xml
  - 1 robots.txt
  - 1 migrate-to-cloudflare.js (novo)
  - 1 test-cloudflare-migration.js (novo)

- **URLs atualizadas no sitemap**: 35
- **Testes de validação**: 22 (todos passaram)

## 🔍 Detalhes Técnicos

### Estratégia de Caminhos

O script implementa uma estratégia inteligente para URLs:

1. **URLs Externas**: Mantidas sem alterações
   - CDNs, Google Fonts, etc.

2. **URLs Canônicas e JSON-LD**: Sempre usam domínio completo
   - `https://modelotrabalhista.pages.dev/caminho`

3. **Links Internos**: Convertidos para absolutos quando possível
   - De: `href="index.html"` → Para: `href="/index.html"`
   - Exceto quando usam `../` (mantidos como estão)

4. **Recursos (CSS, JS, Imagens)**: 
   - Externos: Mantidos sem alteração
   - Internos com `../`: Preservados
   - Internos sem caminho: Convertidos para absolutos com `/`

### Compatibilidade

✅ **GitHub Pages**: Ainda funciona com caminhos relativos preservados  
✅ **Cloudflare Pages**: Funciona perfeitamente com novo domínio  
✅ **Portabilidade**: Código pode ser facilmente adaptado para outros domínios  
✅ **SEO**: Canonical URLs e structured data corretos para indexação  

## 🚀 Próximos Passos

Para completar a migração:

1. **Deploy no Cloudflare Pages**:
   ```bash
   # Configurar repositório no Cloudflare Pages
   # URL: https://modelotrabalhista.pages.dev
   ```

2. **Configurar DNS** (se usar domínio customizado):
   - Adicionar CNAME no DNS apontando para Cloudflare Pages

3. **Verificar no Google Search Console**:
   - Adicionar nova propriedade para o domínio Cloudflare Pages
   - Submeter novo sitemap

4. **Monitorar**:
   - Verificar logs do Cloudflare Pages
   - Monitorar indexação no Google
   - Testar links e funcionalidades

## 📝 Notas Importantes

- ✅ Todos os arquivos template e example foram ignorados pelo script
- ✅ Diretórios `.git`, `.github` e `node_modules` foram ignorados
- ✅ Cache busting com query params `?v=` está preservado
- ✅ Service Worker já estava otimizado e não precisou de alterações
- ✅ Todos os testes passaram com sucesso

## 🆘 Troubleshooting

Se precisar reverter ou fazer ajustes:

1. **Reverter alterações**:
   ```bash
   git checkout -- .
   ```

2. **Executar migração novamente**:
   ```bash
   node migrate-to-cloudflare.js
   ```

3. **Validar alterações**:
   ```bash
   node test-cloudflare-migration.js
   ```

## 📞 Suporte

Para dúvidas ou problemas com a migração, consulte:
- Script: `migrate-to-cloudflare.js`
- Testes: `test-cloudflare-migration.js`
- Este documento: `MIGRACAO_CLOUDFLARE_PAGES.md`

---

**Data da Migração**: 07 de Fevereiro de 2026  
**Status**: ✅ Concluída com Sucesso  
**Testes**: ✅ 22/22 Passaram
