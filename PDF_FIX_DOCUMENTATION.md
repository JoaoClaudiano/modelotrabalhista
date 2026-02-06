# Correção do Problema de Texto Pequeno no PDF

## Problema Original

O PDF gerado apresentava texto extremamente pequeno, como se o conteúdo HTML tivesse sido reduzido via scale/zoom para caber na página A4.

### Causa Raiz

O código estava usando uma abordagem de "captura grande e redução":

1. **html2canvas com `scale: 2`**: Capturava o elemento em resolução 2x, criando um canvas muito grande
2. **`PDF_CONTENT_SCALE = 0.95`**: Aplicava 95% da página
3. **Cálculo de ratio**: `Math.min(pageWidth / imgWidth, pageHeight / imgHeight) * PDF_CONTENT_SCALE`

Isso resultava em:
- Canvas muito grande (ex: 1500x3000 pixels)
- Redução drástica para caber em A4 (210x297mm)
- Texto ficando ilegível

## Solução Implementada

### 1. Reflow em vez de Scale

A nova abordagem **reflui o conteúdo** para A4 em vez de escalá-lo:

```javascript
// A4 dimensions at 96 DPI: 210mm = 794px, 297mm = 1123px
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;
const PDF_MARGIN_MM = 15;
```

### 2. Aplicação de Estilos A4 Antes da Captura

Antes de capturar com html2canvas, aplicamos estilos que forçam o conteúdo a se reorganizar para A4:

```javascript
element.style.width = `${A4_WIDTH_PX}px`;
element.style.maxWidth = `${A4_WIDTH_PX}px`;
element.style.fontSize = '11pt'; // Tamanho legível
element.style.lineHeight = '1.4'; // Espaçamento confortável
element.style.padding = '40px'; // Margens internas
element.style.boxSizing = 'border-box';
```

### 3. html2canvas com Scale 1

Mudamos de `scale: 2` para `scale: 1`:

```javascript
canvas = await html2canvas(element, {
    scale: 1, // Sem escala excessiva - usa tamanho natural
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: A4_WIDTH_PX,
    height: element.scrollHeight // Altura natural
});
```

### 4. Conversão Direta Pixel-para-Milímetro

Calculamos dimensões sem escala adicional:

```javascript
// Converter pixels do canvas para mm (assumindo 96 DPI)
const pxToMm = 25.4 / 96;
const imgWidthMm = canvas.width * pxToMm;
const imgHeightMm = canvas.height * pxToMm;

// Apenas reduz SE necessário
if (imgWidthMm > usableWidth || imgHeightMm > usableHeight) {
    const ratio = Math.min(usableWidth / imgWidthMm, usableHeight / imgHeightMm);
    finalWidth = imgWidthMm * ratio;
    finalHeight = imgHeightMm * ratio;
}
```

## Benefícios

✅ **Texto Legível**: Font-size mínimo de 11pt mantido  
✅ **Sem Escala Global**: Conteúdo reflui naturalmente  
✅ **Mantém 1 Página A4**: Objetivo preservado  
✅ **Layout Apropriado**: Line-height, padding e margins corretos  
✅ **Compatibilidade**: Restaura estilos originais após captura  

## Fluxo Atualizado

1. **Salvar estilos originais** do elemento
2. **Aplicar estilos A4**: largura fixa, font-size, line-height, padding
3. **Aguardar reflow**: 50ms para DOM atualizar
4. **Capturar com html2canvas**: scale: 1, largura A4 fixa
5. **Converter para PDF**: dimensões diretas sem escala excessiva
6. **Restaurar estilos originais**: elemento volta ao normal
7. **Salvar PDF**: conteúdo legível em 1 página A4

## Arquivos Modificados

- **js/export.js**: Método `exportToPDFAuto()` completamente refatorado
- **assets/css/print.css**: Ajustes para consistência (font-size 11pt, line-height 1.4, width 210mm)

## Testes Recomendados

1. Gerar PDF com conteúdo pequeno (< 1 página)
2. Gerar PDF com conteúdo médio (~1 página)
3. Verificar legibilidade do texto
4. Confirmar que está em 1 página A4
5. Testar em diferentes navegadores (Chrome, Firefox, Safari)

## Nota Técnica

A conversão pixel-para-milímetro assume 96 DPI (padrão web):
- At 96 DPI: 96 pixels = 1 inch = 25.4mm
- Therefore: 1 pixel = 25.4mm / 96 = 0.2645833mm
- A4 width: 210mm = 794.4px ≈ 794px
- A4 height: 297mm = 1123.2px ≈ 1123px
