# Correção de Problemas de Caminho nos Artigos

## Problema Identificado

Durante a verificação de todos os códigos na pasta `artigos/`, foram encontrados **29 arquivos HTML** com referências incorretas ao arquivo `contato.html`.

### Tipos de Erros Encontrados

1. **href="contato.html"** (24 arquivos)
   - Apontava para o mesmo diretório `/artigos/`
   - Arquivo correto está em `/pages/contato.html`
   - ❌ Causava erro 404

2. **href="../contato.html"** (5 arquivos)
   - Apontava para o diretório raiz
   - Arquivo correto está em `/pages/contato.html`
   - ❌ Causava erro 404

### Arquivos Afetados

Todos os 29 arquivos HTML na pasta artigos foram corrigidos:

1. acidente-trabalho-pericia-inss-2026.html
2. adicional-noturno-2026.html
3. adicional-periculosidade-motoboy.html
4. aviso-previo-indenizado-e-trabalhado.html
5. banco-horas-vs-extras-2026.html
6. burnout-doenca-ocupacional.html
7. clt-pj-calculadora-2026.html
8. demissao-comum-acordo.html
9. esocial-domestico-2026.html
10. estabilidade-gestante-2026.html
11. fgts-digital-2026.html
12. hora-extra-home-office-2026.html
13. horas-extras-2026.html
14. index.html
15. intervalo-intrajornada-2026.html
16. jovem-aprendiz-vs-estagiario-2026.html
17. licenca-paternidade-2026.html
18. motorista-app-clt-stf-2026.html
19. multa-40-fgts.html
20. pedido-demissao.html
21. pericia-inss-2026.html
22. pis-pasep-2026.html
23. recisao-indireta-justa-causa-aplicada-pelo-empregado.html
24. salario-familia-2026.html
25. saque-aniversario-vs-rescisao.html
26. seguro-desemprego-2026.html
27. tabela-inss-2026.html
28. teletrabalho-híbrido-custos-2026.html
29. trabalho-feriados.html

## Solução Implementada

### Correção Automática

Foi criado o script `fix-artigos-paths.js` que:
- Identifica todas as referências incorretas
- Substitui automaticamente pelo caminho correto
- Processa todos os arquivos HTML da pasta artigos

```javascript
// Antes (INCORRETO)
<a href="contato.html">Fale Conosco</a>
<a href="../contato.html">Fale Conosco</a>

// Depois (CORRETO)
<a href="../pages/contato.html">Fale Conosco</a>
```

### Onde Apareciam os Erros

Os links incorretos apareciam na seção de informações do autor, geralmente próximo ao final de cada artigo:

```html
<div class="author-links">
    <a href="index.html">Mais Artigos</a> • 
    <a href="../index.html#modelos">Modelos de Documentos</a> • 
    <a href="../pages/contato.html">Fale Conosco</a>  <!-- ✅ CORRIGIDO -->
</div>
```

## Testes Criados

### Script de Teste: `test-artigos-paths.js`

Criado um conjunto completo de testes que valida:

1. ✅ Nenhuma referência `href="contato.html"` (sem caminho)
2. ✅ Nenhuma referência `href="../contato.html"` (caminho errado)
3. ✅ Todos os assets usam prefixo `../` correto
4. ✅ Todas as referências de favicon estão corretas
5. ✅ Todos os arquivos CSS usam caminhos corretos
6. ✅ Todos os arquivos JS usam caminhos corretos

Para executar os testes:
```bash
node test-artigos-paths.js
```

Resultado:
```
✅ All tests passed! All paths are correct.
   Files tested: 29
```

## Estrutura de Caminhos Correta

### Para arquivos na pasta `/artigos/`

| Destino | Caminho Correto | ❌ Errado |
|---------|----------------|-----------|
| Contato | `../pages/contato.html` | `contato.html` ou `../contato.html` |
| Index principal | `../index.html` | `index.html` (este está correto para artigos/index.html) |
| CSS | `../css/style.css` | `css/style.css` |
| Assets | `../assets/favicon.ico` | `assets/favicon.ico` |
| JS | `../js/script.js` | `js/script.js` |
| Template local | `template.css` | ✅ Correto (está na mesma pasta) |

## Execução da Correção

```bash
# 1. Executar script de correção
node fix-artigos-paths.js

# Resultado:
# ✅ Complete!
#    Files processed: 29
#    Files changed: 29
#    Total changes: 29

# 2. Executar testes de validação
node test-artigos-paths.js

# Resultado:
# ✅ All tests passed!
```

## Impacto

✅ **Antes da correção:**
- Clicar em "Fale Conosco" nos artigos → Erro 404

✅ **Depois da correção:**
- Clicar em "Fale Conosco" nos artigos → Página de contato carrega corretamente

## Verificação Pós-Deploy

Após o deploy, você pode verificar em qualquer artigo:

1. Acesse um artigo: `https://modelotrabalhista-2026.web.app/artigos/demissao-comum-acordo.html`
2. Role até o final da página
3. Clique no link "Fale Conosco"
4. Deve redirecionar para: `https://modelotrabalhista-2026.web.app/pages/contato.html`
5. Página deve carregar corretamente (não mais 404)

## Arquivos Criados

1. **fix-artigos-paths.js** - Script de correção automática
2. **test-artigos-paths.js** - Suite de testes para validação
3. **docs/FIX_ARTIGOS_PATHS.md** - Esta documentação

## Revisão de Código e Segurança

✅ **Code Review:** Nenhum problema encontrado
✅ **CodeQL Security Scan:** Nenhuma vulnerabilidade encontrada

## Resumo

- ✅ 29 arquivos corrigidos
- ✅ 29 referências incorretas consertadas
- ✅ 100% dos testes passando
- ✅ Sem problemas de segurança
- ✅ Documentação completa criada
