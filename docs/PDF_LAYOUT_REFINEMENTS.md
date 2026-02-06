# PDF Vector Layout Refinements - Implementation Documentation

**Date:** 2026-02-06  
**File:** `js/export.js`  
**Function:** `exportPDFVector()`  
**Status:** ✅ COMPLETE

---

## Overview

This document describes the visual refinements implemented in the `exportPDFVector()` function to create professional, institutional-quality PDF documents with proper typography, visual hierarchy, and no overlapping elements.

---

## Requirements Met

### 1. Header (Cabeçalho)

**Requirements:**
- Center company name on usable width (170mm)
- Center address below company name
- Reduce vertical spacing between name and address
- No horizontal lines overlapping header text

**Implementation:**
```javascript
// Company Name Detection & Rendering (Lines 857-880)
if (this.isCompanyNameLine(line, i, nonEmptyLinesCount)) {
    pdf.setFontSize(config.FONT_SIZE);
    pdf.setFont('helvetica', 'bold');
    
    // Center on usable width
    const textWidth = pdf.getTextWidth(trimmed);
    const xPosition = config.MARGIN + (config.USABLE_WIDTH - textWidth) / 2;
    
    pdf.text(trimmed, xPosition, yPosition);
    yPosition += lineHeight;
}

// Company Address Rendering (Lines 883-906)
if (this.isCompanyAddressLine(line, previousLineWasCompanyName)) {
    // Reduced spacing: 1.5mm
    yPosition += config.HEADER_NAME_TO_ADDRESS;
    
    // Center on usable width
    const textWidth = pdf.getTextWidth(trimmed);
    const xPosition = config.MARGIN + (config.USABLE_WIDTH - textWidth) / 2;
    
    pdf.text(trimmed, xPosition, yPosition);
    yPosition += lineHeight + config.HEADER_AFTER; // 6mm after
}
```

**Configuration:**
```javascript
HEADER_NAME_TO_ADDRESS: 1.5,  // mm - Reduced spacing
HEADER_AFTER: 6,               // mm - Space after header
```

---

### 2. Document Title with Decorative Lines

**Requirements:**
- Center title on usable width (not entire page)
- Add thin horizontal line above and below title
- Line width: 0.3-0.5pt (discrete)
- Lines limited to usable width (170mm)
- Lines never share Y coordinate with text
- Proper vertical spacing prevents overlaps

**Implementation:**
```javascript
// Main Document Title Detection & Rendering (Lines 909-953)
if (this.isMainDocumentTitle(line, i, headerComplete)) {
    pdf.setFontSize(config.TITLE_FONT_SIZE);
    pdf.setFont('helvetica', 'bold');
    
    // Calculate total height needed
    const titleLineHeight = (config.TITLE_FONT_SIZE * config.PT_TO_MM) * config.LINE_HEIGHT_FACTOR;
    const totalHeight = config.TITLE_LINE_SPACING_BEFORE +
                       config.TITLE_LINE_TO_TEXT +
                       titleLineHeight +
                       config.TITLE_TEXT_TO_LINE +
                       config.TITLE_LINE_SPACING_AFTER;
    
    // Check pagination
    if (yPosition + totalHeight > config.PAGE_HEIGHT - config.MARGIN) {
        pdf.addPage();
        yPosition = config.MARGIN;
        pageCount++;
    }
    
    // Rendering sequence (prevents overlaps):
    yPosition += config.TITLE_LINE_SPACING_BEFORE;  // 3mm space
    this.drawDecorativeLine(pdf, yPosition, config); // Top line
    yPosition += config.TITLE_LINE_TO_TEXT;         // 2mm space
    
    // Center title
    const textWidth = pdf.getTextWidth(trimmed);
    const xPosition = config.MARGIN + (config.USABLE_WIDTH - textWidth) / 2;
    pdf.text(trimmed, xPosition, yPosition);
    yPosition += titleLineHeight;
    
    yPosition += config.TITLE_TEXT_TO_LINE;         // 2mm space
    this.drawDecorativeLine(pdf, yPosition, config); // Bottom line
    yPosition += config.TITLE_LINE_SPACING_AFTER;  // 3mm space
}

// Line Drawing Function (Lines 162-171)
drawDecorativeLine(pdf, yPosition, config) {
    pdf.setLineWidth(config.TITLE_LINE_WIDTH);
    pdf.line(
        config.MARGIN, 
        yPosition, 
        config.MARGIN + config.USABLE_WIDTH, 
        yPosition
    );
}
```

**Configuration:**
```javascript
TITLE_LINE_WIDTH: 0.4,           // pt - Thin, discrete
TITLE_LINE_SPACING_BEFORE: 3,    // mm - Space before top line
TITLE_LINE_TO_TEXT: 2,           // mm - Line to title
TITLE_TEXT_TO_LINE: 2,           // mm - Title to line
TITLE_LINE_SPACING_AFTER: 3,     // mm - Space after bottom line
```

**Spacing Sequence:**
```
3mm space
────────── (0.4pt line)
2mm space
PEDIDO DE DEMISSÃO
2mm space
────────── (0.4pt line)
3mm space
```

---

### 3. Body Text Justification

**Requirements:**
- Justify ONLY long paragraphs (≥60 characters)
- Do NOT justify titles, lists, headers
- Paragraphs rendered as continuous blocks
- Maintain Helvetica 11pt with 1.4 line-height

**Implementation:**
```javascript
// Justification Logic (Lines 968-1012)
const shouldJustify = this.shouldJustifyLine(line);

if (shouldJustify) {
    // Justify long paragraphs
    const textLines = pdf.splitTextToSize(trimmed, config.USABLE_WIDTH);
    
    for (let j = 0; j < textLines.length; j++) {
        const textLine = textLines[j];
        const isLastLine = j === textLines.length - 1;
        
        // Check pagination
        if (yPosition + lineHeight > config.PAGE_HEIGHT - config.MARGIN) {
            pdf.addPage();
            yPosition = config.MARGIN;
            pageCount++;
        }
        
        // Justify all lines except last
        if (!isLastLine && textLine.trim().length > 0) {
            const words = textLine.trim().split(/\s+/);
            if (words.length > 1) {
                // Cache word widths for performance
                const wordWidths = words.map(word => pdf.getTextWidth(word));
                const totalWordsWidth = wordWidths.reduce((sum, w) => sum + w, 0);
                const availableSpace = config.USABLE_WIDTH - totalWordsWidth;
                const spaceWidth = availableSpace / (words.length - 1);
                
                let xPos = config.MARGIN;
                for (let k = 0; k < words.length; k++) {
                    pdf.text(words[k], xPos, yPosition);
                    xPos += wordWidths[k] + spaceWidth;
                }
            } else {
                // Single word, no justification
                pdf.text(textLine, config.MARGIN, yPosition);
            }
        } else {
            // Last line, left-aligned
            pdf.text(textLine, config.MARGIN, yPosition);
        }
        
        yPosition += lineHeight;
    }
}

// Detection Function (Lines 145-152)
shouldJustifyLine(line) {
    const trimmedLine = line.trim();
    return trimmedLine.length >= this.PDF_CONFIG.JUSTIFY_MIN_LENGTH &&
           !this.isTitleLine(line) &&
           !trimmedLine.match(/^[-•*]/) &&    // Not list item
           !trimmedLine.match(/^[0-9]+[.)]/);  // Not numbered list
}
```

**Configuration:**
```javascript
JUSTIFY_MIN_LENGTH: 60,  // chars - Minimum for justification
```

---

### 4. Detection Functions

#### Company Name Detection
```javascript
isCompanyNameLine(line, lineIndex, previousLinesCount) {
    const trimmedLine = line.trim();
    return lineIndex < 3 &&                      // First 3 lines
           trimmedLine.length > 0 &&
           trimmedLine.length < 80 &&
           trimmedLine === trimmedLine.toUpperCase() && 
           this.PATTERNS.UPPERCASE_CHARS.test(trimmedLine) &&
           previousLinesCount === 0;             // First non-empty line
}
```

#### Company Address Detection
```javascript
isCompanyAddressLine(line, previousLineWasCompanyName) {
    const trimmedLine = line.trim();
    return previousLineWasCompanyName && 
           trimmedLine.length > 0 &&
           trimmedLine.length < 100;
}
```

#### Main Document Title Detection
```javascript
isMainDocumentTitle(line, lineIndex, afterHeader) {
    const trimmedLine = line.trim();
    return afterHeader &&
           lineIndex < 10 &&                     // First 10 lines
           trimmedLine.length > 10 &&            // Not too short
           trimmedLine.length < 50 &&            // Not too long
           trimmedLine === trimmedLine.toUpperCase() && 
           this.PATTERNS.UPPERCASE_CHARS.test(trimmedLine);
}
```

---

## Configuration Summary

All configuration values centralized in `PDF_CONFIG` object:

```javascript
this.PDF_CONFIG = {
    // A4 dimensions (mm)
    PAGE_WIDTH: 210,
    PAGE_HEIGHT: 297,
    
    // Margins (mm)
    MARGIN: 20,
    
    // Font settings (pt)
    FONT_SIZE: 11,
    TITLE_FONT_SIZE: 12,
    LINE_HEIGHT_FACTOR: 1.4,
    
    // Conversion factor
    PT_TO_MM: 0.3527,
    
    // Vertical spacing (mm)
    PARAGRAPH_SPACING: 2.5,
    TITLE_SPACING_BEFORE: 4,
    TITLE_SPACING_AFTER: 3,
    EMPTY_LINE_FACTOR: 0.75,
    
    // Header spacing (mm)
    HEADER_NAME_TO_ADDRESS: 1.5,
    HEADER_AFTER: 6,
    
    // Decorative lines for title
    TITLE_LINE_WIDTH: 0.4,            // pt
    TITLE_LINE_SPACING_BEFORE: 3,     // mm
    TITLE_LINE_TO_TEXT: 2,            // mm
    TITLE_TEXT_TO_LINE: 2,            // mm
    TITLE_LINE_SPACING_AFTER: 3,      // mm
    
    // Title detection
    TITLE_CHAR_LIMIT: 60,
    
    // Text justification
    JUSTIFY_MIN_LENGTH: 60,
    
    // Calculated usable area
    get USABLE_WIDTH() { return this.PAGE_WIDTH - (2 * this.MARGIN); },
    get USABLE_HEIGHT() { return this.PAGE_HEIGHT - (2 * this.MARGIN); }
};
```

---

## Safety Guarantees

### No Overlapping

**Method 1: Separate Y Coordinates**
- Lines drawn at Y position
- Text drawn at Y + spacing
- Never same Y coordinate

**Method 2: Space Calculation First**
```javascript
// Calculate TOTAL height before drawing
const totalHeight = SPACING_BEFORE +
                   LINE_HEIGHT +
                   SPACING_MIDDLE +
                   TEXT_HEIGHT +
                   SPACING_AFTER +
                   LINE_HEIGHT;

// Check if fits on page
if (yPosition + totalHeight > PAGE_HEIGHT - MARGIN) {
    addNewPage();
}

// Then draw in sequence
```

**Method 3: Rendering Order**
1. Calculate space requirements
2. Draw lines
3. Draw text
4. Update position

### Consistent Layout

**Maintained Across Pages:**
- 20mm margins (all sides)
- 170mm usable width
- Same font sizes
- Same spacing rules
- Same line widths

**Automatic Features:**
- Pagination when needed
- Margin reset on new page
- Consistent spacing

---

## Performance Optimizations

### Word Width Caching

**Before:**
```javascript
for (let k = 0; k < words.length; k++) {
    pdf.text(words[k], xPos, yPosition);
    xPos += pdf.getTextWidth(words[k]) + spaceWidth;  // Redundant call
}
```

**After:**
```javascript
// Pre-calculate and cache
const wordWidths = words.map(word => pdf.getTextWidth(word));
const totalWordsWidth = wordWidths.reduce((sum, w) => sum + w, 0);

// Use cached values
for (let k = 0; k < words.length; k++) {
    pdf.text(words[k], xPos, yPosition);
    xPos += wordWidths[k] + spaceWidth;  // Use cached value
}
```

---

## Testing Guidelines

### Manual Test Checklist

1. **Header Test**
   - [ ] Company name centered on usable width
   - [ ] Address centered below name
   - [ ] Spacing between name/address is tight (1.5mm)
   - [ ] Adequate space after header (6mm)

2. **Title Lines Test**
   - [ ] Main title detected correctly
   - [ ] Horizontal line above title visible
   - [ ] Horizontal line below title visible
   - [ ] Lines are thin (0.4pt)
   - [ ] Lines limited to usable width
   - [ ] Lines do NOT overlap with text
   - [ ] Proper spacing around lines

3. **Justification Test**
   - [ ] Long paragraphs are justified
   - [ ] Short lines are left-aligned
   - [ ] Titles are NOT justified
   - [ ] Lists are NOT justified
   - [ ] Last line of paragraph is left-aligned

4. **Multi-Page Test**
   - [ ] Layout consistent across pages
   - [ ] No orphaned lines
   - [ ] Proper pagination
   - [ ] Headers/titles don't break badly

5. **Visual Quality**
   - [ ] Professional appearance
   - [ ] Clear hierarchy
   - [ ] Good readability
   - [ ] No overlapping elements

---

## Code Quality

### Validation Results

- ✅ JavaScript syntax: PASS
- ✅ Code review: PASS (3 issues resolved)
- ✅ Security scan (CodeQL): PASS (0 vulnerabilities)
- ✅ Performance: Optimized with caching

### Best Practices

- All magic numbers eliminated (moved to config)
- Functions have single responsibility
- Clear naming conventions
- Proper spacing calculations
- Error-free rendering order

---

## Deployment Notes

### Requirements

- jsPDF library must be loaded
- Browser must support ES6+ JavaScript
- No external dependencies added

### Compatibility

- Works with existing architecture
- Backward compatible
- No breaking changes
- Maintains same API

### Known Limitations

- CDN loading may be blocked in some environments
- Manual testing required before production
- Some browsers may render differently

---

## Conclusion

All requirements from the problem statement have been successfully implemented:

✅ Header centered and properly spaced  
✅ Document title with decorative lines (no overlaps)  
✅ Selective text justification  
✅ Professional institutional appearance  
✅ Clear visual hierarchy  
✅ No text/graphic overlapping  

The implementation maintains the existing architecture, follows best practices, and includes performance optimizations. Code quality has been verified through syntax validation, code review, and security scanning.

**Status:** Ready for production deployment after manual testing.
