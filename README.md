# ModeloTrabalhista - Gerador de Documentos Trabalhistas

![ModeloTrabalhista Logo](https://img.shields.io/badge/ModeloTrabalhista-Gerador%20de%20Documentos-blue)
![Versão](https://img.shields.io/badge/Versão-1.0.0-green)
![Licença](https://img.shields.io/badge/Licença-MIT-yellow)

Uma aplicação web completa para geração automática de documentos trabalhistas com modelos prontos e válidos. Desenvolvido para ser rápido, simples e eficiente.

## ✨ Funcionalidades

- **Modelos de Documentos**:
  - Pedido de Demissão
  - Solicitação de Férias
  - Advertência Formal
  - Convocatória de Reunião
  - Pedido de Alteração de Jornada ou Turno
  - Pedido de Reembolso de Despesas
  - Solicitação de Benefícios
  - Pedido de Licença Maternidade/Paternidade ou Prorrogação
  - Pedido de Flexibilização de Jornada por Motivo Familiar
  - Solicitação de Intervalo para Amamentação
  - Pedido de Licença ou Ajuste de Horário para Pais/Responsáveis

- **Características**:
  - Interface intuitiva e responsiva
  - Formulário dinâmico com campos específicos
  - Pré-visualização em tempo real
  - Opções de impressão e exportação para PDF
  - Cópia para área de transferência
  - Exemplos pré-carregados
  - Design moderno e profissional

- **SEO Otimizado**:
  - Geração automática de sitemap.xml
  - Geração automática de robots.txt
  - Atualização automática via GitHub Actions quando o site muda

- **Segurança**:
  - Proteção contra XSS, clickjacking e outros ataques
  - Headers de segurança configurados
  - Compatível com Cloudflare Pages e GitHub Pages

## 🚀 Como Usar

### Opção 1: Online
Acesse o site [ModeloTrabalhista](https://modelotrabalhista.pages.dev/) e comece a usar!

## 🔧 Desenvolvimento

### Deploy Automático

O site é automaticamente implantado sempre que há um push para o branch `main`:

- **Cloudflare Pages** - Deploy principal em produção
- **GitHub Pages** - Deploy alternativo para compatibilidade

O site principal fica disponível em: [https://modelotrabalhista.pages.dev/](https://modelotrabalhista.pages.dev/)

O site alternativo (GitHub Pages) fica disponível em: [https://joaoclaudiano.github.io/modelotrabalhista/](https://joaoclaudiano.github.io/modelotrabalhista/)

### Gerar Sitemap e Robots.txt

O projeto inclui scripts para gerar automaticamente o sitemap.xml e robots.txt:

```bash
# Instalar dependências
npm install

# Gerar apenas o sitemap
npm run generate-sitemap

# Gerar apenas o robots.txt
npm run generate-robots

# Gerar ambos
npm run generate-all
```

Esses arquivos são atualizados automaticamente via GitHub Actions sempre que arquivos HTML são modificados no branch principal.

Para mais detalhes, veja:
- [docs/SITEMAP_README.md](docs/SITEMAP_README.md) - Documentação do gerador de sitemap
- [docs/ROBOTS_README.md](docs/ROBOTS_README.md) - Documentação do gerador de robots.txt


## 📁 Estrutura do Projeto

```
modelotrabalhista/
├── index.html                 # Página principal
├── service-worker.js          # Service Worker para PWA
├── robots.txt                 # Instruções para motores de busca
├── sitemap.xml                # Mapa do site para SEO
├── ads.txt                    # Google AdSense configuration
├── _headers                   # HTTP headers para Cloudflare Pages
├── _redirects                 # Redirects/rewrites para Cloudflare Pages
├── package.json               # Dependências e scripts NPM
├── LICENSE                    # Licença MIT
├── README.md                  # Este arquivo
│
├── .github/                   # Configurações do GitHub
│   └── workflows/             # GitHub Actions workflows
│       ├── deploy-github-pages.yml
│       └── update-seo.yml
│
├── assets/                    # Recursos estáticos
│   ├── css/
│   │   └── print.css          # Estilos para impressão
│   ├── *.png, *.svg, *.ico    # Ícones e favicons
│   └── manifest.json          # Manifest PWA
│
├── artigos/                   # Artigos e conteúdo educacional
│   ├── *.html                 # Artigos sobre direitos trabalhistas
│   ├── index.html             # Página índice dos artigos
│   ├── template.html          # Template base para artigos
│   ├── template.css           # Estilos dos artigos
│   └── template.js            # Lógica dos artigos
│
├── css/                       # Folhas de estilo
│   ├── style.css              # Estilos principais
│   └── responsive.css         # Estilos responsivos
│
├── docs/                      # Documentação técnica
│   ├── README.md              # Índice da documentação
│   ├── *.md                   # Documentação de arquitetura, segurança, performance
│   ├── legacy/                # Arquivos legados mantidos para referência
│   └── *.png, *.txt           # Recursos de documentação
│
├── exemplos-documentos/       # Exemplos de documentos gerados
│   ├── README.md              # Descrição dos exemplos
│   └── *.txt                  # Exemplos de documentos em texto
│
├── js/                        # Scripts JavaScript
│   ├── main.js                # Script principal
│   ├── ui.js                  # Interface do usuário
│   ├── generator.js           # Geração de documentos
│   ├── export.js              # Exportação (PDF/DOCX)
│   ├── export-handlers.js     # Manipuladores de exportação
│   ├── storage.js             # Armazenamento local
│   ├── analytics.js           # Analytics e tracking
│   ├── acessibilidade.js      # Recursos de acessibilidade
│   ├── tour.js                # Tour guiado
│   ├── log.js                 # Sistema de logs
│   └── utils/
│       └── lazy-loading.js    # Utilitário de lazy loading
│
├── models/                    # Modelos de documentos
│   └── templates.json         # Templates JSON dos documentos
│
├── pages/                     # Páginas institucionais
│   ├── *.html                 # Páginas sobre, contato, etc.
│   └── institucional.css      # Estilos das páginas institucionais
│
└── scripts/                   # Scripts de build e deploy
    ├── generate-sitemap.js    # Gerador de sitemap.xml
    └── generate-robots.js     # Gerador de robots.txt
```
