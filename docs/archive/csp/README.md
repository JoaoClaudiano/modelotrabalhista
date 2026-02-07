# Arquivo CSP (Content Security Policy)

## 📁 Sobre Este Diretório

Este diretório contém a documentação arquivada relacionada ao Content Security Policy (CSP) que foi removido do projeto em 07/02/2026.

## 🗂️ Conteúdo

Os seguintes documentos CSP foram movidos para este arquivo:

- `CSP_DOCUMENTATION.md` - Documentação completa do CSP
- `CSP_IMPLEMENTATION_SUMMARY.md` - Resumo da implementação
- `CSP_REPORTING_GUIDE.md` - Guia de relatórios de violação
- `CSP_REPORT_ONLY_SUMMARY.md` - Modo Report-Only
- `CSP_SUMMARY_PT.md` - Resumo em português
- `CSP_TESTING.md` - Guia de testes
- `CSP_IMPROVEMENTS.md` - Melhorias implementadas
- `CSP_ERROR_ANALYSIS.md` - Análise de erro que levou à remoção
- `CSP_VERIFICATION_COMPLETE.md` - Verificação de completude

## 🔄 Histórico

### Por que foi removido?

O CSP foi removido do projeto porque estava causando bloqueios no carregamento do plugin de acessibilidade VLibras, que é um recurso importante para tornar o site acessível a pessoas com deficiência auditiva.

**Erro identificado:**
```
Connecting to 'https://vlibras.gov.br/app/vlibras-plugin.js' violates the following 
Content Security Policy directive: "connect-src 'self' https://fonts.googleapis.com 
https://fonts.gstatic.com https://cdnjs.cloudflare.com"
```

### O que foi removido?

1. **Headers HTTP**: Removido de `_headers` e `firebase.json`
2. **Código JavaScript**: Removido `js/csp-reporter.js` (264 linhas)
3. **Comentários**: Atualizados em arquivos de código
4. **Documentação**: Movida para este diretório de arquivo

### Itens Mantidos

Os seguintes security headers foram **mantidos** para proteção básica:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`

## 🔮 Futuro

Uma nova implementação de CSP está planejada que incluirá suporte adequado para:
- VLibras (plugin de acessibilidade)
- Outros recursos externos necessários
- Monitoramento de violações sem bloqueios

## 📚 Referência

Para implementar CSP no futuro, consulte a documentação arquivada neste diretório.

---
**Data de Arquivamento**: 07 de Fevereiro de 2026  
**Motivo**: Remoção temporária para corrigir bloqueio do VLibras  
**Status**: Aguardando reimplementação com configuração corrigida
