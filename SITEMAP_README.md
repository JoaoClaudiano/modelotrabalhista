# Sitemap Generator

Este script automaticamente gera o arquivo `sitemap.xml` baseado em todos os arquivos HTML encontrados no repositório.

## Como usar

### Instalar dependências

```bash
npm install
```

### Gerar sitemap

```bash
npm run generate-sitemap
```

## O que o script faz

1. Busca recursivamente todos os arquivos `.html` no repositório
2. Exclui arquivos template e exemplo (`template.html`, `example.html`)
3. Gera URLs limpas removendo extensões `.html` e lidando com arquivos `index.html`
4. Aplica prioridades e frequências de mudança baseadas no tipo de página:
   - Página principal (`/`): prioridade 1.0, atualização semanal
   - Índice de artigos: prioridade 0.8, atualização mensal
   - Artigos: prioridade 0.8, atualização mensal
   - Páginas institucionais: prioridade 0.6, atualização mensal
5. Usa a data de modificação do arquivo para `lastmod`
6. Gera um arquivo `sitemap.xml` formatado e válido

## Tecnologias

- [sitemap](https://www.npmjs.com/package/sitemap) - Biblioteca para gerar sitemaps XML
- Node.js - Runtime JavaScript

## Estrutura do sitemap gerado

O sitemap segue o protocolo XML [Sitemaps 0.9](https://www.sitemaps.org/protocol.html) e inclui:
- `<loc>` - URL da página
- `<lastmod>` - Data da última modificação
- `<changefreq>` - Frequência estimada de mudança
- `<priority>` - Prioridade relativa na estrutura do site

## Manutenção

Execute o script toda vez que:
- Adicionar novos arquivos HTML
- Remover arquivos HTML
- Quiser atualizar as datas de modificação no sitemap
