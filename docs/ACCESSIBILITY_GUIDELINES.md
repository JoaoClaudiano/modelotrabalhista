# Diretrizes de Acessibilidade para Tabelas e Listas

## Tabelas Acessíveis (WCAG 2.1 AA)

### Estrutura Básica de Tabela Acessível

```html
<div class="styled-table">
    <table role="table" aria-label="Tabela de Contribuição do INSS 2026">
        <caption>Tabela de Alíquotas do INSS para 2026</caption>
        <thead>
            <tr>
                <th scope="col">Faixa do Salário de Contribuição (R$)</th>
                <th scope="col">Alíquota (%)</th>
                <th scope="col">Parcela a Deduzir (R$)</th>
                <th scope="col">Alíquota Efetiva Máxima da Faixa</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <th scope="row">Até 1.621,00</th>
                <td>7,5%</td>
                <td>–</td>
                <td>7,50%</td>
            </tr>
            <!-- Mais linhas... -->
        </tbody>
    </table>
</div>
```

### Elementos Essenciais

1. **Caption**: Sempre adicione um `<caption>` como primeiro elemento da tabela
   - Descreve o propósito da tabela
   - Ajuda usuários de leitores de tela a entender o contexto

2. **Scope**: Use `scope` em todos os `<th>`
   - `scope="col"` para cabeçalhos de coluna
   - `scope="row"` para cabeçalhos de linha

3. **ARIA Labels**: 
   - `role="table"` (opcional, mas recomendado para compatibilidade)
   - `aria-label` para descrição curta da tabela
   - `aria-describedby` para descrições mais longas (se necessário)

### Tabelas de Cálculo

```html
<div class="calculation-table">
    <table role="table" aria-label="Cálculo detalhado do desconto INSS">
        <caption>Exemplo de cálculo: Salário de R$ 3.000,00</caption>
        <tbody>
            <tr>
                <th scope="row">1ª Faixa (7,5% sobre R$ 1.621,00):</th>
                <td>R$ 121,57</td>
            </tr>
            <tr>
                <th scope="row">2ª Faixa (9% sobre R$ 1.281,84):</th>
                <td>R$ 115,36</td>
            </tr>
            <tr>
                <th scope="row">Total de desconto:</th>
                <td><strong>R$ 248,60</strong></td>
            </tr>
        </tbody>
    </table>
</div>
```

## Listas Acessíveis

### Listas Ordenadas e Não Ordenadas

```html
<!-- Lista de etapas/passos -->
<ol aria-label="Passos para calcular o INSS">
    <li>Identifique seu salário bruto</li>
    <li>Aplique a alíquota de cada faixa</li>
    <li>Some os valores calculados</li>
</ol>

<!-- Lista de itens -->
<ul aria-label="Documentos necessários">
    <li>RG ou CNH</li>
    <li>CPF</li>
    <li>Comprovante de residência</li>
</ul>
```

### Listas de Definição

```html
<dl aria-label="Glossário de termos trabalhistas">
    <dt>Alíquota</dt>
    <dd>Percentual aplicado sobre o salário para calcular a contribuição</dd>
    
    <dt>Teto do INSS</dt>
    <dd>Valor máximo sobre o qual incide a contribuição previdenciária</dd>
</dl>
```

## Formulários Acessíveis

### Labels e Inputs

```html
<div class="form-group">
    <label for="salario-bruto">
        Salário Bruto:
        <span class="required" aria-label="campo obrigatório">*</span>
    </label>
    <input 
        type="number" 
        id="salario-bruto" 
        name="salario-bruto"
        aria-required="true"
        aria-describedby="salario-help"
    >
    <small id="salario-help">Digite o valor em reais, sem pontos ou vírgulas</small>
</div>
```

### Mensagens de Erro

```html
<div class="form-group error">
    <label for="email">E-mail:</label>
    <input 
        type="email" 
        id="email" 
        name="email"
        aria-invalid="true"
        aria-describedby="email-error"
    >
    <span id="email-error" class="error-message" role="alert">
        Por favor, insira um e-mail válido
    </span>
</div>
```

## Botões e Links

### Botões com Ícones

```html
<!-- Botão com ícone decorativo -->
<button type="submit" aria-label="Salvar documento">
    <i class="fas fa-save" aria-hidden="true"></i>
    Salvar
</button>

<!-- Botão apenas com ícone -->
<button type="button" aria-label="Fechar janela">
    <i class="fas fa-times" aria-hidden="true"></i>
</button>
```

### Links Descritivos

```html
<!-- Evite: -->
<a href="/artigos">Clique aqui</a>

<!-- Prefira: -->
<a href="/artigos">Leia nossos artigos sobre direito trabalhista</a>
```

## Navegação

### Menu de Navegação

```html
<nav role="navigation" aria-label="Navegação principal">
    <ul>
        <li><a href="/" aria-current="page">Início</a></li>
        <li><a href="/artigos">Artigos</a></li>
        <li><a href="/calculadora">Calculadora</a></li>
    </ul>
</nav>
```

### Breadcrumbs

```html
<nav aria-label="Breadcrumb">
    <ol>
        <li><a href="/">Início</a></li>
        <li><a href="/artigos">Artigos</a></li>
        <li aria-current="page">Tabela INSS 2026</li>
    </ol>
</nav>
```

## Imagens e Ícones

### Imagens Informativas

```html
<img 
    src="/images/tabela-inss.png" 
    alt="Tabela progressiva do INSS 2026 mostrando as 4 faixas de contribuição"
>
```

### Imagens Decorativas

```html
<img src="/images/decoration.svg" alt="" role="presentation">
<!-- ou -->
<img src="/images/decoration.svg" alt="">
```

### Ícones Decorativos

```html
<i class="fas fa-check" aria-hidden="true"></i>
```

## Regiões ARIA

```html
<header role="banner">
    <!-- Cabeçalho do site -->
</header>

<main role="main">
    <!-- Conteúdo principal -->
</main>

<aside role="complementary" aria-label="Informações relacionadas">
    <!-- Barra lateral -->
</aside>

<footer role="contentinfo">
    <!-- Rodapé -->
</footer>
```

## Checklist de Acessibilidade

- [ ] Todas as imagens têm texto alternativo apropriado
- [ ] Todos os ícones decorativos têm `aria-hidden="true"`
- [ ] Tabelas têm `<caption>` e atributos `scope`
- [ ] Formulários têm labels associados
- [ ] Links têm texto descritivo
- [ ] Botões têm labels claros
- [ ] Navegação tem `aria-label`
- [ ] Cores têm contraste adequado (mínimo 4.5:1)
- [ ] Site é navegável por teclado
- [ ] Foco do teclado é visível

## Ferramentas de Teste

1. **WAVE**: Extensão de navegador para avaliar acessibilidade
2. **axe DevTools**: Extensão Chrome/Firefox
3. **NVDA/JAWS**: Leitores de tela para testar
4. **Lighthouse**: Auditoria de acessibilidade automatizada
5. **Keyboard Navigation**: Testar com Tab, Shift+Tab, Enter, Space

## Referências

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
