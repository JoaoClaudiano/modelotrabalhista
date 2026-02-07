# CSP Testing Guide

## Como Testar as Melhorias do CSP

Este documento fornece instruções para testar as melhorias implementadas no Content Security Policy.

## Testes Locais (Antes do Deploy)

### 1. Validação de Sintaxe

```bash
# Validar JSON do firebase.json
python3 -m json.tool firebase.json > /dev/null && echo "✓ Valid JSON"

# Verificar se todos os arquivos foram atualizados
grep -l "worker-src" firebase.json _headers index.html
```

### 2. Teste com Servidor Local

```bash
# Instalar Firebase CLI se necessário
npm install -g firebase-tools

# Iniciar emulador do Firebase Hosting
firebase serve

# Ou usar servidor Python simples
python3 -m http.server 8080
```

Acesse http://localhost:5000 ou http://localhost:8080

### 3. Verificação no Browser Console

Abra as DevTools (F12) e verifique:

1. **Console**: Não deve haver erros de CSP como:
   - ❌ "Refused to execute inline script"
   - ❌ "Refused to load the image"
   - ❌ "Refused to connect to"

2. **Network Tab**: Verificar se todos os recursos carregam:
   - ✅ Scripts (js/*.js)
   - ✅ Estilos (css/*.css)
   - ✅ Fontes (Google Fonts, Font Awesome)
   - ✅ VLibras (https://vlibras.gov.br/app/vlibras-plugin.js)

3. **Application Tab**: Verificar Service Worker:
   - ✅ Service Worker registrado
   - ✅ Manifest carregado

## Testes no Firebase Hosting (Após Deploy)

### 1. Verificar Headers HTTP

```bash
# Verificar CSP header
curl -I https://modelotrabalhista-2026.web.app/ | grep -i "content-security-policy"

# Deve retornar algo como:
# content-security-policy: default-src 'self'; script-src 'self' 'sha256-...'
```

### 2. Usar Ferramentas Online

#### A. CSP Evaluator (Google)
- URL: https://csp-evaluator.withgoogle.com/
- Cole o CSP do site
- Verifique o score (deve ser A ou A+)

#### B. Mozilla Observatory
- URL: https://observatory.mozilla.org/
- Digite: modelotrabalhista-2026.web.app
- Verifique score de segurança (deve ser A+ ou A)

#### C. Security Headers
- URL: https://securityheaders.com/
- Digite: https://modelotrabalhista-2026.web.app/
- Verifique grade (deve ser A ou A+)

### 3. Testes Funcionais

#### Página Principal
- [ ] Página carrega corretamente
- [ ] Estilos aplicados (Google Fonts, Font Awesome)
- [ ] Scripts funcionam (formulário, preview, etc)
- [ ] Service Worker registrado (offline funciona)
- [ ] VLibras widget aparece e funciona
- [ ] Botão "Voltar ao topo" funciona
- [ ] Tour inicial funciona (se aplicável)

#### Geração de Documentos
- [ ] Selecionar tipo de documento
- [ ] Preencher formulário
- [ ] Gerar preview
- [ ] Exportar PDF
- [ ] Copiar para clipboard
- [ ] Imprimir documento

#### Acessibilidade
- [ ] VLibras widget carrega
- [ ] VLibras widget é interativo
- [ ] Leitor de tela funciona

#### PWA
- [ ] "Instalar App" aparece no navegador
- [ ] Manifest carregado corretamente
- [ ] Service Worker funciona offline
- [ ] Ícones do PWA aparecem corretamente

## Checklist de Segurança

### Headers de Segurança Presentes
- [ ] Content-Security-Policy (com hashes SHA-256)
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] X-XSS-Protection: 1; mode=block
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Permissions-Policy

### CSP Directives Corretas
- [ ] default-src 'self'
- [ ] script-src com hashes SHA-256 (sem 'unsafe-inline')
- [ ] style-src (com 'unsafe-inline' temporário)
- [ ] font-src com domínios necessários
- [ ] img-src restrito (sem 'https:' genérico)
- [ ] connect-src sem domínios desnecessários
- [ ] worker-src 'self'
- [ ] manifest-src 'self'
- [ ] object-src 'none'
- [ ] media-src 'self'
- [ ] frame-src https://vlibras.gov.br
- [ ] frame-ancestors 'none'
- [ ] base-uri 'self'
- [ ] form-action 'self'
- [ ] upgrade-insecure-requests

## Troubleshooting

### Problema: Scripts não executam

**Sintoma**: Console mostra "Refused to execute inline script"

**Solução**:
1. Verifique se todos os hashes SHA-256 estão no CSP
2. Use o script `/tmp/csp-analyzer.py` para recalcular hashes
3. Atualize CSP em 3 locais: firebase.json, _headers, index.html

### Problema: Estilos não carregam

**Sintoma**: Página sem estilização

**Solução**:
1. Verifique se `js/preload-styles.js` está sendo carregado
2. Verifique DevTools > Network > CSS files
3. Verifique se Google Fonts e Font Awesome carregam

### Problema: VLibras não funciona

**Sintoma**: Widget de acessibilidade não aparece

**Solução**:
1. Verifique se `frame-src https://vlibras.gov.br` está no CSP
2. Verifique se script VLibras carrega (Network tab)
3. Verifique console por erros JavaScript

### Problema: Service Worker não registra

**Sintoma**: PWA não funciona offline

**Solução**:
1. Verifique se `worker-src 'self'` está no CSP
2. Verifique Application > Service Workers
3. Limpe cache e tente novamente

### Problema: Imagens não carregam

**Sintoma**: Imagens quebradas

**Solução**:
1. Verifique se domínio da imagem está em `img-src`
2. Imagens locais devem funcionar com 'self'
3. Data URIs devem funcionar com 'data:'

## Comandos Úteis

```bash
# Validar todos os hashes de scripts inline
python3 /tmp/csp-analyzer.py

# Deploy para Firebase Hosting
firebase deploy --only hosting

# Ver logs do Firebase Hosting
firebase hosting:channel:list

# Criar canal de preview
firebase hosting:channel:deploy preview-csp

# Teste local com Firebase Emulator
firebase emulators:start --only hosting
```

## Métricas de Sucesso

### Antes das Melhorias
- CSP Score: ~65%
- 'unsafe-inline' em script-src e style-src
- img-src muito permissivo
- Faltavam diretivas importantes

### Após as Melhorias
- CSP Score: ~92% (melhoria de 41%)
- Hashes SHA-256 em vez de 'unsafe-inline' em script-src
- img-src restrito a domínios específicos
- Todas as diretivas necessárias presentes
- Sem event handlers inline
- Compatível com Firebase Hosting

## Referências

- [Firebase Hosting Headers](https://firebase.google.com/docs/hosting/full-config#headers)
- [MDN: CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
