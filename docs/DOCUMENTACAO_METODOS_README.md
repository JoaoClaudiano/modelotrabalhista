# 📚 Documentação de Métodos - ModeloTrabalhista

Esta pasta contém documentação completa sobre os métodos utilizados no sistema de exportação do ModeloTrabalhista.

---

## 📄 Documentos Disponíveis

### 1. [METODOS_UTILIZADOS.md](./METODOS_UTILIZADOS.md)
**Análise Completa de Métodos**

Documento principal com análise detalhada de todos os métodos:
- ✅ Métodos ativamente usados
- ❌ Métodos não utilizados
- ⚠️ Métodos fallback
- 📊 Estatísticas de uso
- 🔍 Recomendações de limpeza

**Use quando:** Precisar entender profundamente cada método e seu status

---

### 2. [DIAGRAMA_METODOS.md](./DIAGRAMA_METODOS.md)
**Diagramas e Fluxos Visuais**

Visualizações da arquitetura e fluxos de execução:
- 🎯 Arquitetura geral
- 📱 Fluxo de interação do usuário
- 🔄 Hierarquia de métodos
- ⚡ Diagramas de sequência
- 🎨 Estados dos botões

**Use quando:** Precisar visualizar como os métodos se relacionam

---

### 3. [GUIA_RAPIDO_EXPORTACAO.md](./GUIA_RAPIDO_EXPORTACAO.md)
**Guia de Referência Rápida**

Referência prática para desenvolvedores:
- 🚀 API pública documentada
- 💻 Exemplos de código
- 🐛 Debugging e troubleshooting
- ⚠️ Erros comuns e soluções
- 📝 Checklist de desenvolvimento

**Use quando:** Precisar implementar ou debugar funcionalidades rapidamente

---

## 🎯 Como Usar Esta Documentação

### Para Desenvolvedores Novos
1. Comece com **GUIA_RAPIDO_EXPORTACAO.md** para entender o básico
2. Consulte **DIAGRAMA_METODOS.md** para visualizar a estrutura
3. Aprofunde-se em **METODOS_UTILIZADOS.md** quando necessário

### Para Manutenção
1. Consulte **METODOS_UTILIZADOS.md** seção "Métodos NÃO UTILIZADOS"
2. Veja recomendações de cleanup
3. Use **DIAGRAMA_METODOS.md** para entender impacto de mudanças

### Para Debugging
1. Vá direto para **GUIA_RAPIDO_EXPORTACAO.md** seção "Debugging"
2. Consulte "Erros Comuns e Soluções"
3. Use exemplos práticos como referência

---

## 🔍 Resumo Executivo

### Métodos Principais Ativos (3)
| Método | Função | Arquivo |
|--------|--------|---------|
| `exportToPDFAuto()` | Exportar PDF | export.js:652 |
| `exportToDOCX()` | Exportar DOCX | export.js:1036 |
| `copyToClipboard()` | Copiar texto | export.js:1324 |

### Botões da Interface (3)
| ID | Label | Método Chamado |
|----|-------|----------------|
| #pdfBtn | Salvar como PDF | exportToPDFAuto() |
| #printBtn | Gerar DOCX | exportToDOCX() |
| #copyBtn | Copiar Texto | copyToClipboard() |

### Estatísticas
- **Total de métodos:** ~50
- **Ativamente usados:** 15 (30%)
- **Fallback:** 5 (10%)
- **Não usados:** 4 (8%)
- **Podem ser removidos:** 4 métodos

---

## 📊 Status da Documentação

| Documento | Linhas | Status | Última Atualização |
|-----------|--------|--------|-------------------|
| METODOS_UTILIZADOS.md | ~450 | ✅ Completo | 2026-02-05 |
| DIAGRAMA_METODOS.md | ~500 | ✅ Completo | 2026-02-05 |
| GUIA_RAPIDO_EXPORTACAO.md | ~400 | ✅ Completo | 2026-02-05 |

---

## 🛠️ Manutenção da Documentação

### Quando Atualizar
- ✏️ Ao adicionar novos métodos de exportação
- 🔄 Ao modificar métodos existentes
- ❌ Ao remover métodos
- 🔧 Ao alterar a arquitetura do sistema

### Como Atualizar
1. Edite o documento relevante
2. Atualize data de "Última Atualização"
3. Execute análise de impacto em outros documentos
4. Atualize exemplos de código se necessário

---

## 🔗 Links Relacionados

### Código Fonte
- [js/export.js](./js/export.js) - Implementação principal
- [js/main.js](./js/main.js) - Integração com UI
- [index.html](./index.html) - Interface do usuário

### Issues Relacionadas
- [#1] Correção de seletores PDF (Resolvido)
- [#2] Documentação de métodos (Este PR)

---

## 💡 Dicas Importantes

### Para Novos Desenvolvedores
1. **Sempre use `window.exporter`** - Instância global
2. **Métodos são assíncronos** - Use `await`
3. **Valide conteúdo** - Mínimo 50 caracteres
4. **Use try-catch** - Tratamento de erros

### Para Code Review
1. Verificar se novos métodos estão documentados
2. Confirmar que métodos seguem padrões existentes
3. Validar que fallbacks estão implementados
4. Testar em múltiplos navegadores

---

## 📞 Contato

Para dúvidas sobre a documentação ou sugestões de melhoria, abra uma issue no repositório.

---

## 📜 Changelog

### 2026-02-05 - Versão 1.0
- ✨ Criação inicial da documentação
- 📊 Análise completa de métodos
- 🎨 Diagramas visuais criados
- 📚 Guia rápido para desenvolvedores
- 🔍 Identificação de métodos não utilizados
- 💡 Recomendações de cleanup

---

**Documentação gerada por:** Análise Automatizada  
**Versão:** 1.0  
**Data:** 2026-02-05  
**Status:** ✅ Completa e Atualizada
