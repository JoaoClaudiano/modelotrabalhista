# Checklist de Deploy - Cloudflare Pages

## ✅ Pré-Deploy (COMPLETO)

- [x] ✅ Domínio antigo removido de todos os arquivos
- [x] ✅ Novo domínio configurado em 37 arquivos
- [x] ✅ robots.txt atualizado
- [x] ✅ sitemap.xml atualizado (35 URLs)
- [x] ✅ Canonical URLs corretas em todos os HTMLs
- [x] ✅ JSON-LD structured data atualizado
- [x] ✅ Links internos usando caminhos absolutos
- [x] ✅ Links relativos ../ preservados
- [x] ✅ Service Worker verificado
- [x] ✅ Testes automatizados criados (22 testes)
- [x] ✅ Todos os testes passaram (100%)
- [x] ✅ Análise de segurança completa
- [x] ✅ Documentação completa criada
- [x] ✅ Código revisado e otimizado

## 📋 Deploy no Cloudflare Pages

### Passo 1: Configurar Cloudflare Pages
- [ ] Acessar [Cloudflare Dashboard](https://dash.cloudflare.com)
- [ ] Ir para "Pages" > "Create a project"
- [ ] Conectar ao repositório GitHub: `JoaoClaudiano/modelotrabalhista`
- [ ] Selecionar branch: `main` (ou branch de produção)

### Passo 2: Configurações de Build
```
Build command: (deixar vazio - site estático)
Build output directory: / (raiz do projeto)
Root directory: (deixar vazio)
```

### Passo 3: Variáveis de Ambiente
```
NODE_VERSION: 18 (ou versão atual do Node.js)
```

### Passo 4: Deploy
- [ ] Clicar em "Save and Deploy"
- [ ] Aguardar build e deploy (1-3 minutos)
- [ ] Verificar URL: https://modelotrabalhista.pages.dev

## 🧪 Pós-Deploy: Testes

### Teste 1: Acesso ao Site
- [ ] Acessar https://modelotrabalhista.pages.dev
- [ ] Verificar que a página principal carrega corretamente
- [ ] Verificar que os estilos CSS estão aplicados
- [ ] Verificar que JavaScript está funcionando

### Teste 2: Navegação
- [ ] Testar link "Artigos" no menu
- [ ] Abrir um artigo qualquer
- [ ] Verificar que o artigo carrega com formatação correta
- [ ] Testar links "voltar" e navegação entre artigos

### Teste 3: Páginas Institucionais
- [ ] Acessar /pages/sobre.html
- [ ] Acessar /pages/contato.html
- [ ] Acessar /pages/privacidade.html
- [ ] Acessar /pages/termos.html
- [ ] Acessar /pages/disclaimer.html

### Teste 4: Assets
- [ ] Verificar que imagens carregam
- [ ] Verificar que ícones carregam
- [ ] Verificar que favicon aparece
- [ ] Verificar fontes externas (Google Fonts)

### Teste 5: Service Worker
- [ ] Abrir DevTools > Application > Service Workers
- [ ] Verificar que Service Worker está registrado
- [ ] Verificar cache funcionando

### Teste 6: Mobile/Responsivo
- [ ] Testar em dispositivo móvel ou DevTools mobile view
- [ ] Verificar menu mobile
- [ ] Verificar layout responsivo

## 🔍 SEO e Indexação

### Google Search Console
- [ ] Adicionar nova propriedade: https://modelotrabalhista.pages.dev
- [ ] Verificar propriedade
- [ ] Submeter sitemap: https://modelotrabalhista.pages.dev/sitemap.xml
- [ ] Solicitar indexação da página principal

### Validações SEO
- [ ] Testar structured data: [Rich Results Test](https://search.google.com/test/rich-results)
- [ ] Verificar canonical URLs
- [ ] Validar robots.txt: https://modelotrabalhista.pages.dev/robots.txt
- [ ] Validar sitemap.xml: https://modelotrabalhista.pages.dev/sitemap.xml

### Meta Tags
- [ ] Usar [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [ ] Usar [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [ ] Verificar Open Graph tags

## 📊 Monitoramento

### Métricas Cloudflare
- [ ] Configurar analytics no Cloudflare Pages
- [ ] Monitorar tempo de resposta
- [ ] Verificar taxa de erro
- [ ] Acompanhar tráfego

### Google Analytics (se configurado)
- [ ] Verificar tracking code
- [ ] Confirmar eventos sendo registrados
- [ ] Validar páginas mais visitadas

## 🆘 Troubleshooting

### Problema: Site não carrega
**Solução**: 
1. Verificar status do deploy no Cloudflare Dashboard
2. Checar logs de erro
3. Confirmar branch correto

### Problema: Assets não carregam (404)
**Solução**:
1. Verificar caminhos no código (devem começar com `/`)
2. Confirmar que arquivos existem no repositório
3. Verificar caso de letras (case-sensitive)

### Problema: Service Worker não funciona
**Solução**:
1. Limpar cache do navegador
2. Unregister service worker antigo
3. Recarregar página com Ctrl+Shift+R

### Problema: Canonical URLs incorretas
**Solução**:
1. Re-executar script: `node migrate-to-cloudflare.js`
2. Verificar com testes: `node test-cloudflare-migration.js`
3. Fazer commit e push

## 📝 Documentação Adicional

### Arquivos de Referência
- `FINAL_SUMMARY.md` - Resumo completo da migração
- `MIGRACAO_CLOUDFLARE_PAGES.md` - Documentação técnica
- `SECURITY_SUMMARY.md` - Análise de segurança
- `VERIFICATION_SUMMARY.txt` - Resumo de verificação

### Scripts Úteis
```bash
# Re-executar migração (se necessário)
node migrate-to-cloudflare.js

# Executar testes
node test-cloudflare-migration.js

# Verificar URLs portáveis
node test-url-refactoring.js
```

## ✅ Checklist de Conclusão

- [ ] Site deployado com sucesso
- [ ] Todos os testes pós-deploy passaram
- [ ] SEO configurado no Google Search Console
- [ ] Sitemap submetido
- [ ] Métricas configuradas
- [ ] Documentação revisada
- [ ] Equipe notificada

---

**Status**: 🟢 Pronto para Deploy  
**Última Atualização**: 07 de Fevereiro de 2026
