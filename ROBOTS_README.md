# Robots.txt Generator

Este script automaticamente gera o arquivo `robots.txt` baseado na estrutura do site e nas boas práticas de SEO.

## Como usar

### Gerar robots.txt

```bash
npm run generate-robots
```

### Gerar sitemap e robots.txt juntos

```bash
npm run generate-all
```

## O que o script faz

1. Escaneia recursivamente todos os arquivos do repositório
2. Identifica automaticamente arquivos técnicos que não devem ser indexados:
   - Arquivos `.js`, `.css`, `.json`
   - Arquivos `template.html` e `example.html`
   - Diretórios administrativos (`/admin/`, `/login/`, `/config/`)
   - Diretórios ocultos (`.git/`, `node_modules/`)
3. Gera diretivas `Disallow:` apropriadas para proteger esses arquivos
4. Inclui referência ao `sitemap.xml`
5. Configura permissões para os principais crawlers (Googlebot, Bingbot, etc.)

## Estrutura do robots.txt gerado

O arquivo gerado inclui:
- **User-agent: \*** - Regras gerais para todos os crawlers
- **Allow: /** - Permite acesso a todas as páginas públicas
- **Sitemap:** - Referência ao sitemap.xml
- **Disallow:** - Lista de arquivos e diretórios que não devem ser indexados
- **User-agents específicos** - Configurações para Googlebot, Bingbot, etc.

## Vantagens da geração automática

- ✅ **Sempre atualizado**: Reflete automaticamente a estrutura atual do site
- ✅ **Sem erros manuais**: Elimina o risco de esquecer de atualizar o arquivo
- ✅ **Consistente**: Segue sempre as mesmas regras e boas práticas
- ✅ **Protege arquivos técnicos**: Identifica e protege automaticamente arquivos que não devem ser indexados

## Quando executar

Execute o script sempre que:
- Adicionar novos arquivos técnicos (templates, scripts)
- Reorganizar a estrutura de diretórios
- Quiser atualizar as regras de crawling
- Antes de fazer deploy para produção

## Integração com CI/CD

Para garantir que o robots.txt esteja sempre atualizado, adicione este comando ao seu processo de build:

```bash
npm run generate-all
```

Isso garantirá que tanto o sitemap quanto o robots.txt sejam regenerados automaticamente antes de cada deploy.
