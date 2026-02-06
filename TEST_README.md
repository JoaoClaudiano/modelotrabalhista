# Test Script for export.js

## Overview

This is a simple test script (`test-export.js`) that verifies the `export.js` module can be loaded and its main public methods can be instantiated without runtime errors.

## Purpose

The test script ensures:
- ✅ The export.js module loads without syntax errors
- ✅ The DocumentExporter class is properly exported
- ✅ All main public methods exist and are callable
- ✅ Configuration objects are properly initialized
- ✅ Utility methods work as expected
- ✅ No runtime errors occur during basic operations

## Running the Tests

### Using Node.js directly:
```bash
node test-export.js
```

### Using npm script:
```bash
npm test
```

## Test Coverage

The test script verifies the following:

### Class and Instantiation
- ✅ DocumentExporter class is exported to window
- ✅ DocumentExporter can be instantiated
- ✅ Singleton pattern works correctly

### Configuration Objects
- ✅ PDF_CONFIG has correct structure (A4 dimensions, margins, fonts)
- ✅ FORMATTING has DOCX constants
- ✅ VALIDATION constants are set correctly
- ✅ PATTERNS regex are correctly defined
- ✅ MODEL_TITLES contains expected models

### Public Methods
- ✅ sanitizeFilename - removes special characters from filenames
- ✅ isTitleLine - detects uppercase titles
- ✅ parseDocumentToSemanticStructure - exists and is callable
- ✅ getDocumentContent - returns string content
- ✅ getDocumentHTML - returns HTML or null
- ✅ init - initializes the exporter
- ✅ cleanup - cleans up resources
- ✅ showNotification - displays notifications

### Async Methods
- ✅ exportPDF - PDF export method exists
- ✅ exportToDOCX - DOCX export method exists
- ✅ copyToClipboard - clipboard method exists

### Library Loading
- ✅ loadLibraries - library loader exists
- ✅ loadJSPDF - jsPDF loader exists
- ✅ loadDocxJS - docx.js loader exists

## Limitations

This is a **simple smoke test** that runs in Node.js with minimal DOM mocking. It does not:
- ❌ Test the full DOM integration (requires browser or jsdom)
- ❌ Test actual PDF/DOCX generation (requires browser environment)
- ❌ Test file download functionality
- ❌ Test clipboard operations with real APIs
- ❌ Test library loading from CDN

For comprehensive testing of browser-specific features, use a browser-based testing framework like Selenium, Playwright, or Cypress.

## Test Environment

The test script creates a minimal mock environment with:
- `window` object with basic properties
- `document` object with createElement, querySelector, etc.
- `Node` constants (ELEMENT_NODE, TEXT_NODE, COMMENT_NODE)
- `MutationObserver` class
- `navigator` object

## Expected Output

When all tests pass, you should see:

```
🧪 Starting export.js test suite...

📦 Loading export.js...
✅ export.js loaded successfully

🔍 Running tests...

✅ [Test name 1]
✅ [Test name 2]
...
✅ [Test name N]

============================================================
📊 Test Results: 19 passed, 0 failed
============================================================

✨ All tests completed successfully!
```

## Troubleshooting

### If tests fail:
1. Check that `export.js` exists in the `js/` directory
2. Ensure Node.js is installed (version 12 or higher recommended)
3. Verify the export.js file has no syntax errors
4. Check the error message for specific failure details

### Common Issues:
- **Module not found**: Ensure you're running the test from the project root
- **Syntax errors**: Check export.js for JavaScript syntax issues
- **Missing methods**: A method might have been renamed or removed

## Adding New Tests

To add new tests, follow this pattern:

```javascript
test('Description of what is being tested', () => {
    const exporter = new window.DocumentExporter();
    
    // Your test logic here
    if (/* condition that should be true */) {
        throw new Error('Descriptive error message');
    }
});
```

Tests are run sequentially, and the first failure will stop execution for that test but continue with others.

## Integration with CI/CD

This test can be easily integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Test export.js
  run: node test-export.js
```

The test script exits with code 0 on success and code 1 on failure, making it suitable for automated testing.

## Maintenance

When adding new public methods or changing the API of export.js:
1. Add corresponding tests to `test-export.js`
2. Update this README with new test coverage
3. Ensure backward compatibility or update tests accordingly

## Author

Created as part of the ModeloTrabalhista project to ensure code quality and prevent runtime errors.
