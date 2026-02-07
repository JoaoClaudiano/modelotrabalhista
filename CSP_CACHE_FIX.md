# Fix para Erros de CSP (Content Security Policy)

## Problema Identificado

Alguns usuários estão experimentando erros relacionados ao Content Security Policy (CSP) que bloqueiam o carregamento do VLibras:

```
Connecting to 'https://vlibras.gov.br/app/vlibras-plugin.js?v=1770389835' violates the following Content Security Policy directive: "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com https://cdnjs.cloudflare.com"
```

## Causa Raiz

O CSP foi **completamente removido** da configuração do site nos commits anteriores. No entanto, usuários que visitaram o site antes da remoção do CSP têm **caches antigos** em seus navegadores que ainda contêm as políticas CSP antigas.

## Solução Implementada

### 1. Atualização do Service Worker (v1.3.0)

- **Versão do cache atualizada**: De `modelotrabalhista-v1.2` para `modelotrabalhista-v1.3`
- **VLibras adicionado aos domínios confiáveis**: O domínio `vlibras.gov.br` foi adicionado à lista de domínios confiáveis para cache
- **Limpeza explícita de caches antigos**: Quando o novo Service Worker é ativado, ele remove automaticamente todos os caches antigos que podem conter headers CSP

### 2. Como a Correção Funciona

Quando os usuários visitarem o site após o deploy desta correção:

1. O navegador detectará a nova versão do Service Worker (v1.3)
2. O novo Service Worker será instalado em segundo plano
3. Após a instalação, o Service Worker será ativado
4. Durante a ativação, todos os caches antigos (incluindo os com CSP) serão removidos
5. O novo cache será criado sem nenhuma política CSP
6. O VLibras carregará normalmente sem bloqueios

## Para Usuários Finais

Se você ainda estiver vendo erros de CSP após o deploy desta correção:

### Opção 1: Aguardar (Recomendado)
- Simplesmente feche e reabra o navegador
- A próxima vez que você visitar o site, o Service Worker será atualizado automaticamente

### Opção 2: Hard Refresh
- **Windows/Linux**: Pressione `Ctrl + Shift + R` ou `Ctrl + F5`
- **Mac**: Pressione `Cmd + Shift + R`

### Opção 3: Limpar Cache Manualmente
1. Abra as Ferramentas do Desenvolvedor (F12)
2. Vá para a aba "Application" (Chrome) ou "Armazenamento" (Firefox)
3. Clique em "Clear storage" ou "Limpar dados do site"
4. Recarregue a página

## Verificação

Para verificar se o problema foi resolvido:

1. Abra o Console do Desenvolvedor (F12)
2. Procure por mensagens como:
   - `[Service Worker] Activating v1.3...`
   - `[Service Worker] Old CSP-affected caches have been cleared`
3. Verifique se não há mais erros relacionados a CSP
4. O VLibras deve carregar corretamente

## Status Atual da Configuração

### ✅ CSP Removido de:
- `firebase.json` - Sem headers CSP
- `_headers` - Sem headers CSP
- Arquivos HTML - Sem meta tags CSP

### ✅ Security Headers Mantidos:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`

## Arquivos Modificados

- `service-worker.js`:
  - Versão atualizada para v1.3.0
  - Cache name atualizado para `modelotrabalhista-v1.3`
  - Domínio `vlibras.gov.br` adicionado aos domínios confiáveis
  - Mensagem explícita de limpeza de caches CSP na ativação

## Data da Correção

**Data**: 7 de fevereiro de 2026  
**Commit**: [a ser preenchido após commit]

---

## Notas Técnicas

### Por que isso aconteceu?

O Service Worker é projetado para melhorar a performance do site, cacheando recursos. No entanto, quando headers HTTP são cacheados junto com os recursos, eles podem persistir mesmo após mudanças na configuração do servidor.

### Por que precisamos atualizar o Service Worker?

Atualizar a versão do Service Worker força o navegador a:
1. Detectar que há uma nova versão disponível
2. Instalar a nova versão
3. Ativar a nova versão, o que permite executar código de limpeza
4. Remover caches antigos durante a ativação

### Prevenção Futura

Para evitar problemas similares no futuro:
- Sempre incremente a versão do Service Worker ao fazer mudanças significativas
- Use nomes de cache versionados para facilitar a limpeza
- Implemente estratégias de cache que não cacheem headers HTTP desnecessários
