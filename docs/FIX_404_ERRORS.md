# Solução para Erros 404

## Problema
Ocorreram erros 404 ao tentar acessar:
- `https://modelotrabalhista-2026.web.app/demissao-comum-acordo.html`
- `https://modelotrabalhista-2026.web.app/favicon.ico`

## Causa
Os arquivos existem no repositório, mas em subdiretórios:
- `demissao-comum-acordo.html` está em `/artigos/`
- `favicon.ico` está em `/assets/`

Quando alguém tentava acessar esses arquivos diretamente na raiz do site, o Firebase Hosting não conseguia encontrá-los porque não havia regras de redirecionamento configuradas.

## Solução Implementada

Adicionada uma seção `rewrites` no arquivo `firebase.json` com 29 regras de redirecionamento:

1. **Redirecionamento do favicon:**
   - `/favicon.ico` → `/assets/favicon.ico`

2. **Redirecionamento dos artigos (28 artigos):**
   - `/demissao-comum-acordo.html` → `/artigos/demissao-comum-acordo.html`
   - `/acidente-trabalho-pericia-inss-2026.html` → `/artigos/acidente-trabalho-pericia-inss-2026.html`
   - E todos os outros 26 artigos...

### Padrão de Rewrite
As regras usam o padrão `{.html,}` que permite acessar tanto com quanto sem a extensão `.html`:
- ✅ `https://modelotrabalhista-2026.web.app/demissao-comum-acordo`
- ✅ `https://modelotrabalhista-2026.web.app/demissao-comum-acordo.html`

Ambos redirecionam para `/artigos/demissao-comum-acordo.html`

## Testes

Foi criado o script `test-firebase-config.js` que valida:
- ✅ Seção de rewrites existe
- ✅ Rewrite do favicon está correto
- ✅ Rewrite do demissao-comum-acordo está correto
- ✅ Todos os 28 artigos têm rewrites configurados
- ✅ Todos os arquivos de destino existem
- ✅ cleanUrls está habilitado

Para executar os testes:
```bash
node test-firebase-config.js
```

## Como o Firebase Hosting Funciona

O Firebase Hosting agora segue esta ordem de precedência:

1. **Arquivos exatos**: Se o arquivo existir no caminho exato, ele é servido
2. **Rewrites**: Se houver uma regra de rewrite que corresponda, ela é aplicada
3. **cleanUrls**: Se `cleanUrls: true`, tenta remover `.html` da URL
4. **404**: Se nada corresponder, retorna 404

Com as configurações atuais:
- Requests para `/demissao-comum-acordo.html` ou `/demissao-comum-acordo` → `/artigos/demissao-comum-acordo.html`
- Requests para `/favicon.ico` → `/assets/favicon.ico`

## Arquivos Modificados

- ✅ `firebase.json` - Adicionadas 29 regras de rewrite
- ✅ `test-firebase-config.js` - Criado script de testes

## Deploy

Após o deploy no Firebase Hosting, os erros 404 serão resolvidos automaticamente.

Para fazer o deploy:
```bash
npm run deploy:firebase
```

## Verificação Pós-Deploy

Após o deploy, você pode verificar se está funcionando acessando:
- https://modelotrabalhista-2026.web.app/demissao-comum-acordo.html (deve funcionar)
- https://modelotrabalhista-2026.web.app/demissao-comum-acordo (deve funcionar)
- https://modelotrabalhista-2026.web.app/favicon.ico (deve funcionar)

Todos devem retornar status 200 OK em vez de 404.
