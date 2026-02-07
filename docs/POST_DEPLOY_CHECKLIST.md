# ✅ Checklist de Validação Pós-Deploy

Use este checklist após fazer o deploy para Firebase Hosting para validar que todas as melhorias de CSP estão funcionando corretamente.

## 🚀 Deploy

```bash
# 1. Fazer deploy
firebase deploy

# 2. Ou criar ambiente de preview primeiro (recomendado)
firebase hosting:channel:deploy preview-csp

# 3. Verificar que deploy foi bem-sucedido
firebase hosting:channel:list
```

## 📋 Checklist de Validação

### 1. Verificar Headers HTTP ✅

```bash
# Verificar se CSP está nos headers
curl -I https://modelotrabalhista-2026.web.app/ | grep -i "content-security"

# Deve mostrar:
# content-security-policy: default-src 'self'; script-src 'self' 'sha256-...
```

**Status**: [ ] Verificado

---

### 2. Testar Página Principal ✅

Abrir: https://modelotrabalhista-2026.web.app/

- [ ] Página carrega sem erros
- [ ] Estilos aplicados corretamente (fontes, cores, layout)
- [ ] Logo e imagens aparecem
- [ ] Ícones Font Awesome aparecem
- [ ] Console (F12) sem erros de CSP

**Status**: [ ] Verificado

---

### 3. Testar Console do Browser 🔍

Abrir DevTools (F12) > Console

- [ ] ❌ Não há erros vermelhos
- [ ] ❌ Não há mensagens "Refused to execute inline script"
- [ ] ❌ Não há mensagens "Refused to load"
- [ ] ✅ Service Worker registrado com sucesso

**Status**: [ ] Verificado

---

### 4. Testar Network Tab 🌐

Abrir DevTools (F12) > Network > Recarregar página

Verificar que carregam com sucesso (status 200):
- [ ] `js/*.js` - Scripts locais
- [ ] `css/*.css` - Estilos locais
- [ ] `https://cdnjs.cloudflare.com/.../font-awesome/` - Ícones
- [ ] `https://fonts.googleapis.com/css2` - Google Fonts
- [ ] `https://fonts.gstatic.com/` - Arquivos de fonte
- [ ] `https://vlibras.gov.br/app/vlibras-plugin.js` - VLibras

**Status**: [ ] Verificado

---

### 5. Testar VLibras (Acessibilidade) ♿

- [ ] Widget VLibras aparece no canto inferior direito
- [ ] Clicar no widget abre a interface
- [ ] Interface é interativa e responsiva
- [ ] Não há erros no console relacionados ao VLibras

**Status**: [ ] Verificado

---

### 6. Testar Service Worker (PWA) 📱

Abrir DevTools (F12) > Application > Service Workers

- [ ] Service Worker aparece como "activated and running"
- [ ] Status: ✅ (verde)
- [ ] Scope: / 
- [ ] Sem erros

**Teste Offline**:
- [ ] Desconectar internet (ou marcar "Offline" nas DevTools)
- [ ] Recarregar página
- [ ] Página ainda funciona (carregada do cache)

**Status**: [ ] Verificado

---

### 7. Testar Manifest (PWA) 📲

Abrir DevTools (F12) > Application > Manifest

- [ ] Manifest carregado (assets/manifest.json)
- [ ] Nome: "ModeloTrabalhista"
- [ ] Ícones aparecem
- [ ] Sem erros

**Teste de Instalação**:
- [ ] Botão "Instalar" aparece na barra de endereços (Chrome/Edge)
- [ ] Clicar em instalar abre prompt
- [ ] App pode ser instalado

**Status**: [ ] Verificado

---

### 8. Testar Funcionalidades da Aplicação 🔧

#### Geração de Documentos
- [ ] Selecionar tipo de documento funciona
- [ ] Formulário aparece e é preenchível
- [ ] Prévia é gerada corretamente
- [ ] Botão "Gerar Documento" funciona

#### Exportação
- [ ] Exportar para PDF funciona
- [ ] Copiar para clipboard funciona
- [ ] Imprimir funciona

#### Navegação
- [ ] Links do menu funcionam
- [ ] Botão "Voltar ao topo" funciona
- [ ] Links externos abrem corretamente

**Status**: [ ] Verificado

---

### 9. Testar Ferramentas de Segurança Online 🔒

#### A. CSP Evaluator (Google)
1. Ir para: https://csp-evaluator.withgoogle.com/
2. Colar o CSP da página ou URL
3. Verificar resultado

**Esperado**: Score A ou A-
- [ ] Score obtido: _______

#### B. Mozilla Observatory
1. Ir para: https://observatory.mozilla.org/
2. Digite: modelotrabalhista-2026.web.app
3. Clicar em "Scan Me"

**Esperado**: Score A+ ou A
- [ ] Score obtido: _______

#### C. Security Headers
1. Ir para: https://securityheaders.com/
2. Digite: https://modelotrabalhista-2026.web.app/
3. Clicar em "Scan"

**Esperado**: Grade A ou A+
- [ ] Grade obtida: _______

**Status**: [ ] Verificado

---

### 10. Testar em Diferentes Navegadores 🌍

- [ ] ✅ Google Chrome/Edge (Chromium)
- [ ] ✅ Firefox
- [ ] ✅ Safari (se disponível)
- [ ] ✅ Mobile Chrome (Android)
- [ ] ✅ Mobile Safari (iOS, se disponível)

**Verificar em cada navegador**:
- Página carrega
- Estilos aplicados
- Scripts funcionam
- VLibras aparece
- Sem erros no console

**Status**: [ ] Verificado

---

### 11. Testar Performance ⚡

Abrir DevTools (F12) > Lighthouse > Gerar relatório

**Scores Esperados**:
- [ ] Performance: 90+ (verde)
- [ ] Accessibility: 90+ (verde)
- [ ] Best Practices: 90+ (verde)
- [ ] SEO: 90+ (verde)
- [ ] PWA: ✅ (installable)

**Status**: [ ] Verificado

---

## 🐛 Troubleshooting

### Se algo não funcionar:

1. **Scripts não executam**
   - Abrir console, verificar erro específico
   - Consultar `docs/CSP_TESTING.md` seção Troubleshooting

2. **VLibras não aparece**
   - Verificar se frame-src permite vlibras.gov.br
   - Verificar se script carregou (Network tab)

3. **Service Worker não registra**
   - Verificar se worker-src está no CSP
   - Limpar cache e tentar novamente

4. **Estilos não carregam**
   - Verificar se js/preload-styles.js está carregando
   - Verificar Network tab por erros 404

### Contato com Suporte
Se problemas persistirem:
1. Documentar erro específico (screenshot do console)
2. Verificar `docs/CSP_TESTING.md`
3. Abrir issue no GitHub com detalhes

---

## ✅ Aprovação Final

Após completar todos os itens acima:

**Funcionalidade**: [ ] ✅ Tudo funciona  
**Segurança**: [ ] ✅ Sem vulnerabilidades  
**Performance**: [ ] ✅ Scores altos  
**Compatibilidade**: [ ] ✅ Funciona em todos navegadores  

**Deploy Aprovado**: [ ] ✅ SIM

---

## 📊 Resumo dos Resultados

Preencher após testes:

| Teste | Status | Observações |
|-------|--------|-------------|
| Headers HTTP | [ ] | |
| Página Principal | [ ] | |
| Console Limpo | [ ] | |
| Network OK | [ ] | |
| VLibras | [ ] | |
| Service Worker | [ ] | |
| Manifest | [ ] | |
| Funcionalidades | [ ] | |
| CSP Evaluator | [ ] | Score: ____ |
| Mozilla Observatory | [ ] | Score: ____ |
| Security Headers | [ ] | Grade: ____ |
| Multi-Browser | [ ] | |
| Lighthouse | [ ] | |

---

## 📝 Notas Adicionais

(Espaço para anotações durante validação)

---

**Data da Validação**: _______________  
**Validado por**: _______________  
**Ambiente**: [ ] Produção [ ] Preview  
**Resultado**: [ ] ✅ Aprovado [ ] ⚠️ Aprovado com ressalvas [ ] ❌ Reprovado
