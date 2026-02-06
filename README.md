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
  - Content Security Policy (CSP) implementado
  - CSP Report-Only para monitoramento de violações
  - Console-based violation reporter
  - Proteção contra XSS, clickjacking e outros ataques
  - Headers de segurança configurados
  - Compatível com GitHub Pages e Firebase Hosting

## 🚀 Como Usar

### Opção 1: Online
Acesse o site [modelotrabalhista.com.br](https://joaoclaudiano.github.io/modelotrabalhista/#home) e comece a usar!

## 🔧 Desenvolvimento

### Deploy Automático para GitHub Pages

O site é automaticamente implantado no GitHub Pages sempre que há um push para o branch `main`. O workflow de CI/CD:

1. **Instalação de dependências** - Instala as dependências do Node.js
2. **Geração de arquivos SEO** - Gera automaticamente sitemap.xml e robots.txt
3. **Build e Deploy** - Faz upload dos arquivos e implanta no GitHub Pages

O site fica disponível em: [https://joaoclaudiano.github.io/modelotrabalhista/](https://joaoclaudiano.github.io/modelotrabalhista/)

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
- [SITEMAP_README.md](SITEMAP_README.md) - Documentação do gerador de sitemap
- [ROBOTS_README.md](ROBOTS_README.md) - Documentação do gerador de robots.txt
- [CSP_DOCUMENTATION.md](CSP_DOCUMENTATION.md) - Documentação do Content Security Policy
- [CSP_REPORTING_GUIDE.md](CSP_REPORTING_GUIDE.md) - Guia de monitoramento de violações CSP


# arvore

modelotrabalhista/
├── index.html                 # Página principal
├── style.css                  # Estilos principais
├── script.js                  # Lógica JavaScript
├── README.md                  # Este arquivo
├── LICENSE                    # Licença MIT
├── .gitignore                 # Arquivos ignorados pelo Git
├── robots.txt                 # Instruções para motores de busca
├── sitemap.xml                # Mapa do site para SEO
│
├── assets/                    # Recursos estáticos
│   ├── css/
│   │   └── print.css          # Estilos para impressão
│   ├── icons/                 # Ícones do site
│   └── images/                # Imagens do site
│
└── models/                    # Modelos de documento
    └── templates.json         # Templates em JSON
