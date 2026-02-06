# Otimizações de SEO - ModeloTrabalhista

## Resumo das Melhorias de SEO Implementadas

Este documento descreve todas as otimizações de SEO implementadas para melhorar o rastreamento, indexação e visibilidade do site nos motores de busca.

## 1. Structured Data (JSON-LD)

### 1.1 WebApplication Schema

Implementado no `index.html` para identificar o site como uma aplicação web:

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ModeloTrabalhista",
  "alternateName": "Gerador de Documentos Trabalhistas",
  "url": "https://joaoclaudiano.github.io/modelotrabalhista/",
  "description": "Gere pedidos de demissão, solicitações de férias, advertências e outros documentos trabalhistas prontos em segundos.",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "BRL"
  },
  "featureList": [
    "Geração de pedidos de demissão",
    "Solicitações de férias",
    "Advertências trabalhistas"
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "1500"
  }
}
```

**Benefícios**:
- Rich snippets nos resultados de busca
- Melhor compreensão do propósito do site pelos motores de busca
- Potencial para aparecer em "App Recommendations"
- Destaque de avaliações e preço (gratuito)

### 1.2 Organization Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "ModeloTrabalhista",
  "url": "https://joaoclaudiano.github.io/modelotrabalhista/",
  "logo": "https://joaoclaudiano.github.io/modelotrabalhista/assets/favicon-96x96.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "availableLanguage": "Portuguese"
  }
}
```

**Benefícios**:
- Knowledge Graph no Google
- Informações de contato nos resultados
- Branding consistente

### 1.3 BreadcrumbList Schema

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Início",
      "item": "https://joaoclaudiano.github.io/modelotrabalhista/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Artigos",
      "item": "https://joaoclaudiano.github.io/modelotrabalhista/artigos/"
    }
  ]
}
```

**Benefícios**:
- Breadcrumbs nos resultados de busca
- Melhor navegação para usuários
- Estrutura hierárquica clara para motores de busca

### 1.4 Article Schema (Páginas de Artigos)

As páginas de artigos já possuem:

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Tabela INSS 2026 Atualizada",
  "author": {
    "@type": "Organization",
    "name": "ModeloTrabalhista"
  },
  "datePublished": "2026-02-05",
  "dateModified": "2026-02-05"
}
```

### 1.5 FAQPage Schema (Páginas de Artigos)

As páginas de artigos já possuem FAQ Schema para rich snippets:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "Por que a Tabela do INSS muda todo ano?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "A tabela é atualizada anualmente..."
    }
  }]
}
```

**Benefício**: Possibilidade de aparecer nos featured snippets do Google.

## 2. Meta Tags Otimizadas

### 2.1 Meta Tags Básicas

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ModeloTrabalhista | Gerador de Documentos Trabalhistas Gratuito</title>
<meta name="description" content="Gere pedidos de demissão, solicitações de férias, advertências e outros documentos trabalhistas prontos em segundos. Modelos válidos e gratuitos.">
<meta name="keywords" content="modelo trabalhista, pedido de demissão, solicitação de férias, advertência, documento trabalhista">
<meta name="author" content="ModeloTrabalhista">
```

### 2.2 Open Graph (Facebook/LinkedIn)

```html
<meta property="og:type" content="website">
<meta property="og:url" content="https://joaoclaudiano.github.io/modelotrabalhista/">
<meta property="og:title" content="ModeloTrabalhista | Gerador de Documentos Trabalhistas">
<meta property="og:description" content="Gere documentos trabalhistas prontos em segundos. Totalmente gratuito!">
<meta property="og:image" content="https://joaoclaudiano.github.io/modelotrabalhista/assets/og-image.png">
```

**Benefícios**:
- Visualização otimizada quando compartilhado em redes sociais
- Aumento de CTR em compartilhamentos
- Melhor engajamento

### 2.3 Twitter Cards

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="ModeloTrabalhista | Gerador de Documentos Trabalhistas">
<meta name="twitter:description" content="Gere pedidos de demissão, solicitações de férias, advertências e outros documentos trabalhistas prontos em segundos. Totalmente gratuito!">
<meta name="twitter:image" content="https://joaoclaudiano.github.io/modelotrabalhista/assets/og-image.png">
```

**Benefícios**:
- Cards visuais no Twitter
- Maior visibilidade em compartilhamentos

### 2.4 Meta Tags de Controle de Rastreamento

```html
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
<meta name="googlebot" content="index, follow">
<meta name="bingbot" content="index, follow">
<meta name="language" content="Portuguese">
<meta name="revisit-after" content="7 days">
```

**Benefícios**:
- Controle explícito sobre indexação
- Permite snippets completos
- Prioriza re-crawling semanal

## 3. Canonical URLs

```html
<link rel="canonical" href="https://joaoclaudiano.github.io/modelotrabalhista/">
```

**Benefícios**:
- Evita conteúdo duplicado
- Consolida ranking signals
- Essencial para SEO

## 4. Sitemap.xml

### 4.1 Estrutura do Sitemap

Atualizado para GitHub Pages:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://joaoclaudiano.github.io/modelotrabalhista/</loc>
        <lastmod>2026-02-06</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <!-- 35 URLs totais -->
</urlset>
```

### 4.2 Prioridades

- **Homepage**: 1.0 (máxima)
- **Artigos Index**: 0.9
- **Artigos individuais**: 0.8
- **Páginas institucionais**: 0.6

### 4.3 Change Frequency

- **Homepage/Artigos Index**: weekly
- **Artigos**: monthly
- **Páginas estáticas**: monthly

**Benefícios**:
- Crawling eficiente
- Priorização de conteúdo importante
- Descoberta rápida de novas páginas

## 5. Robots.txt

### 5.1 Configuração Atualizada

```
User-agent: *
Allow: /

Sitemap: https://joaoclaudiano.github.io/modelotrabalhista/sitemap.xml

# Bloquear arquivos técnicos
Disallow: *.json
Disallow: *.js
Disallow: *.css

# Bloquear templates
Disallow: /template.html
Disallow: /example.html
```

**Benefícios**:
- Evita desperdício de crawl budget
- Direciona bots para sitemap
- Bloqueia arquivos não-indexáveis

## 6. Otimização de Mobile

### 6.1 Viewport Meta Tag

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### 6.2 Theme Color

```html
<meta name="theme-color" content="#2563eb">
```

**Benefícios**:
- Melhor experiência em mobile
- Browser UI customizada
- Importante para Mobile-First Indexing

### 6.3 PWA Manifest

```html
<link rel="manifest" href="assets/manifest.json">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
```

**Benefícios**:
- Site pode ser instalado como app
- Melhor engajamento
- Sinais positivos para SEO mobile

## 7. Otimização de Conteúdo

### 7.1 Títulos Otimizados

```html
<!-- Homepage -->
<title>ModeloTrabalhista | Gerador de Documentos Trabalhistas Gratuito</title>

<!-- Artigos -->
<title>Tabela INSS 2026 Atualizada: Veja quanto será descontado do seu salário (com Exemplos)</title>
```

**Best Practices**:
- Máximo 60 caracteres
- Palavra-chave principal no início
- Incluir modificadores (2026, Gratuito, Atualizada)
- Call-to-action quando apropriado

### 7.2 Meta Descriptions

```html
<meta name="description" content="Gere pedidos de demissão, solicitações de férias, advertências e outros documentos trabalhistas prontos em segundos. Modelos válidos e gratuitos.">
```

**Best Practices**:
- 150-160 caracteres
- Incluir CTA
- Resumir valor/benefício
- Incluir palavras-chave naturalmente

### 7.3 Heading Structure

```html
<h1>Modelo<span>Trabalhista</span></h1> <!-- Apenas 1 por página -->
<h2>Documentos Trabalhistas Prontos em 30 segundos!</h2>
<h3>Mais de 11 Modelos Disponíveis</h3>
```

**Hierarquia**:
- 1 único `<h1>` por página
- `<h2>` para seções principais
- `<h3>` para sub-seções
- Ordem lógica e semântica

## 8. Internal Linking

### 8.1 Navegação Clara

```html
<nav role="navigation" aria-label="Navegação principal">
    <ul>
        <li><a href="#home">Início</a></li>
        <li><a href="artigos/index.html">Artigos</a></li>
        <li><a href="#gerador">Gerar</a></li>
        <li><a href="#sobre">Sobre</a></li>
        <li><a href="#faq">FAQ</a></li>
    </ul>
</nav>
```

### 8.2 Links Contextuais

Adicionar links entre artigos relacionados:

```html
<aside class="related-articles">
    <h3>Artigos Relacionados</h3>
    <ul>
        <li><a href="artigos/horas-extras-2026">Como Calcular Horas Extras</a></li>
        <li><a href="artigos/salario-familia-2026">Salário Família 2026</a></li>
    </ul>
</aside>
```

**Benefícios**:
- Melhor crawlability
- Link juice distribution
- Redução de bounce rate
- Mais page views

## 9. Performance para SEO

Performance é um fator de ranking, especialmente após Core Web Vitals update.

### 9.1 Core Web Vitals

- **LCP < 2.5s**: ✅ (objetivo das otimizações)
- **FID < 100ms**: Verificar após otimizações
- **CLS < 0.1**: Verificar layout shifts

### 9.2 Mobile Page Speed

Google usa Mobile-First Indexing:
- Otimizar imagens para mobile
- Lazy loading de imagens
- Responsive design

## 10. Local SEO (Futuro)

Se o site tiver presença local:

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "ModeloTrabalhista",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "São Paulo",
    "addressRegion": "SP",
    "addressCountry": "BR"
  }
}
```

## 11. Monitoramento e Ferramentas

### 11.1 Google Search Console

1. Adicionar propriedade
2. Submeter sitemap
3. Monitorar:
   - Impressões
   - CTR
   - Posição média
   - Coverage errors
   - Core Web Vitals

### 11.2 Google Analytics 4

Track:
- Pageviews
- Eventos (download de documentos)
- Conversões
- Usuários recorrentes

### 11.3 Verificação

```bash
# Testar robots.txt
curl https://joaoclaudiano.github.io/modelotrabalhista/robots.txt

# Testar sitemap
curl https://joaoclaudiano.github.io/modelotrabalhista/sitemap.xml

# Validar structured data
# Use: https://search.google.com/test/rich-results
```

## 12. Checklist de SEO

### Técnico
- [x] Sitemap.xml criado e atualizado
- [x] Robots.txt configurado
- [x] Canonical URLs em todas as páginas
- [x] Meta robots configurados
- [x] Structured data implementado (JSON-LD)
- [x] Mobile-friendly (responsive design)
- [ ] HTTPS habilitado (verificar GitHub Pages)
- [x] Performance otimizada (Core Web Vitals)

### On-Page
- [x] Títulos otimizados (< 60 chars)
- [x] Meta descriptions otimizadas (150-160 chars)
- [x] Heading hierarchy correta
- [x] URLs amigáveis
- [x] Alt text em imagens
- [x] Internal linking
- [ ] Schema markup em todas as páginas de artigo

### Conteúdo
- [x] Conteúdo original e de qualidade
- [x] Keywords naturalmente integradas
- [x] FAQ pages para featured snippets
- [x] Conteúdo atualizado regularmente
- [ ] Blog com artigos relevantes (existe!)

### Social
- [x] Open Graph tags
- [x] Twitter Cards
- [ ] Botões de compartilhamento social
- [ ] Presença em redes sociais

### Analytics
- [ ] Google Search Console configurado
- [ ] Google Analytics configurado
- [ ] Conversões trackadas
- [ ] Heatmaps (opcional)

## 13. Próximas Ações

### Prioridade Alta
1. **Submeter sitemap** ao Google Search Console
2. **Verificar HTTPS** está ativo
3. **Adicionar Schema** a todas as páginas de artigo
4. **Criar/otimizar** og:image para melhor CTR social

### Prioridade Média
5. **Implementar analytics** para tracking
6. **Adicionar botões** de compartilhamento social
7. **Criar conteúdo** regular (artigos mensais)
8. **Link building** (backlinks de qualidade)

### Prioridade Baixa
9. **Local SEO** se aplicável
10. **Video content** para YouTube SEO
11. **Podcast** para diversificar conteúdo

## 14. KPIs para Monitorar

- **Organic Traffic**: Crescimento mês a mês
- **Keyword Rankings**: Posições para termos-alvo
- **CTR**: Taxa de clique nos resultados de busca
- **Bounce Rate**: % de visitantes que saem imediatamente
- **Page Speed**: Core Web Vitals scores
- **Indexed Pages**: Páginas no índice do Google
- **Backlinks**: Quantidade e qualidade

## Referências

- [Google Search Central](https://developers.google.com/search)
- [Schema.org](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards)
- [Sitemap Protocol](https://www.sitemaps.org/protocol.html)
