# Análise Profunda do Erro CSP - VLibras

## 📋 Resumo do Problema

O console do navegador apresentava múltiplos erros relacionados ao Content Security Policy (CSP) que impediam o carregamento correto do plugin VLibras de acessibilidade.

## 🔍 Erros Identificados

### 1. Erro Principal - Violação CSP
```
service-worker.js:160 Connecting to 'https://vlibras.gov.br/app/vlibras-plugin.js?v=1770389835' 
violates the following Content Security Policy directive: 
"connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com https://cdnjs.cloudflare.com". 
The action has been blocked.
```

### 2. Erro de Fetch
```
service-worker.js:160 Fetch API cannot load https://vlibras.gov.br/app/vlibras-plugin.js?v=1770389835. 
Refused to connect because it violates the document's Content Security Policy.
```

### 3. Erro de Network
```
The FetchEvent for "https://vlibras.gov.br/app/vlibras-plugin.js?v=1770389835" 
resulted in a network error response: the promise was rejected.
```

### 4. Erro não capturado
```
Uncaught (in promise) TypeError: Failed to fetch. 
Refused to connect because it violates the document's Content Security Policy.
```

### 5. Erro de carregamento de recurso
```
artigos:1092 GET https://vlibras.gov.br/app/vlibras-plugin.js?v=1770389835 net::ERR_FAILED
```

### 6. Erro de Widget VLibras
```
artigos:1096 Uncaught TypeError: Cannot read properties of undefined (reading 'Widget')
    at artigos:1096:28
```

## 🔬 Análise das Causas

### Causa Raiz
O Content Security Policy (CSP) estava configurado nos arquivos de hosting (`_headers` e `firebase.json`) com a diretiva `connect-src` que **não incluía** o domínio `https://vlibras.gov.br`.

### Cadeia de Eventos

1. **Carregamento da Página**
   - A página HTML carrega normalmente
   - O Service Worker é registrado e ativo

2. **Tentativa de Fetch do VLibras**
   - O código tenta carregar: `https://vlibras.gov.br/app/vlibras-plugin.js?v=1770389835`
   - O Service Worker intercepta a requisição (linha 160 do service-worker.js)

3. **Bloqueio pelo CSP**
   - O CSP verifica a diretiva `connect-src`
   - Encontra: `connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com https://cdnjs.cloudflare.com`
   - **Não encontra**: `https://vlibras.gov.br`
   - **Resultado**: Requisição bloqueada

4. **Falha em Cascata**
   - Script VLibras não carrega
   - `window.VLibras` não é definido
   - Tentativa de instanciar `new window.VLibras.Widget()` falha
   - Erro: "Cannot read properties of undefined (reading 'Widget')"

### Onde o CSP Estava Configurado

#### Arquivo: `_headers`
```
/*
  Content-Security-Policy: default-src 'self'; 
    script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://vlibras.gov.br; 
    style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; 
    font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com; 
    img-src 'self' data: https:; 
    connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com https://cdnjs.cloudflare.com; 
    frame-ancestors 'none'; 
    base-uri 'self'; 
    form-action 'self'; 
    upgrade-insecure-requests
```

#### Arquivo: `firebase.json`
```json
{
  "key": "Content-Security-Policy",
  "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://vlibras.gov.br; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com https://cdnjs.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests"
}
```

### Diretivas CSP Analisadas

| Diretiva | Domínios Permitidos | VLibras Incluído? |
|----------|---------------------|-------------------|
| `script-src` | 'self', 'unsafe-inline', cdnjs, **vlibras.gov.br** | ✅ SIM |
| `style-src` | 'self', 'unsafe-inline', cdnjs, fonts.googleapis.com | ❌ NÃO |
| `connect-src` | 'self', fonts.googleapis.com, fonts.gstatic.com, cdnjs | ❌ NÃO |

**Problema**: Mesmo com `script-src` permitindo VLibras, a diretiva `connect-src` bloqueava as **conexões de fetch/xhr** para o domínio.

## 💡 Solução Adotada

### Decisão: Remoção Completa do CSP

Baseado no requisito do usuário de remover o CSP de todo o repositório, a solução implementada foi:

1. ✅ Removido header `Content-Security-Policy` do arquivo `_headers`
2. ✅ Removido header `Content-Security-Policy` do arquivo `firebase.json`
3. ✅ Verificado que não há meta tags CSP em arquivos HTML
4. ✅ Mantidos outros security headers importantes

### Headers de Segurança Mantidos

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## 🎯 Resultado Esperado

Após a remoção do CSP:

- ✅ VLibras deve carregar sem bloqueios
- ✅ `window.VLibras.Widget` será definido corretamente
- ✅ Widget de acessibilidade funcionará normalmente
- ✅ Nenhum erro CSP no console do navegador
- ✅ Todos os recursos externos (CDNs, Google Fonts, etc.) carregarão livremente

## 📚 Lições Aprendidas

### Por que o CSP Bloqueou o VLibras?

1. **Service Worker Interceptação**: O Service Worker intercepta requisições, e o CSP é aplicado a essas requisições
2. **connect-src é Restritivo**: A diretiva `connect-src` controla fetch(), XMLHttpRequest, WebSocket, EventSource
3. **Não Basta script-src**: Mesmo permitindo o script em `script-src`, o `connect-src` ainda controla o download

### Alternativas Consideradas (Não Implementadas)

Se no futuro for necessário reativar o CSP, as seguintes mudanças seriam necessárias:

```
connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com https://cdnjs.cloudflare.com https://vlibras.gov.br;
style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com https://vlibras.gov.br;
```

## 🔒 Impacto na Segurança

### Sem CSP
- ❌ Menor proteção contra XSS (Cross-Site Scripting)
- ❌ Menor controle sobre recursos externos
- ✅ Outros headers de segurança ainda ativos
- ✅ X-Frame-Options previne clickjacking
- ✅ X-Content-Type-Options previne MIME sniffing

### Recomendações
- Monitorar carregamento de recursos externos
- Considerar reimplementar CSP no futuro com VLibras incluído
- Manter firewall de aplicação web (WAF) ativo se disponível

## ✅ Verificação Final

Status dos arquivos após correção:

- `_headers`: ✅ CSP removido
- `firebase.json`: ✅ CSP removido
- `service-worker.js`: ✅ Sem alterações necessárias
- Arquivos HTML: ✅ Sem meta tags CSP
- CodeQL: ✅ Sem vulnerabilidades detectadas

---

**Data da Análise**: 2026-02-07  
**Status**: ✅ Resolvido  
**Método**: Remoção completa do CSP
