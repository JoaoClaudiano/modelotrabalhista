#!/usr/bin/env node
/**
 * Simple test script for export.js
 * 
 * This script verifies that export.js can be loaded and its main public methods
 * can be instantiated without runtime errors.
 * 
 * Usage: node test-export.js
 */

// Mock minimal browser environment
global.window = {
    documentExporter: null,
    DocumentExporter: null,
    jspdf: undefined,
    docx: undefined,
    app: undefined,
    ui: undefined
};

// Node type constants
global.Node = {
    ELEMENT_NODE: 1,
    TEXT_NODE: 3,
    COMMENT_NODE: 8
};

global.document = {
    createElement: (tag) => ({
        style: {},
        addEventListener: () => {},
        setAttribute: () => {},
        getAttribute: () => null,
        classList: {
            add: () => {},
            remove: () => {}
        },
        innerHTML: '',
        textContent: '',
        appendChild: () => {},
        remove: () => {},
        tagName: tag.toUpperCase(),
        nodeType: 1,
        childNodes: [],
        children: [],
        querySelector: () => null,
        querySelectorAll: () => [],
        previousSibling: null
    }),
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    getElementsByClassName: () => [],
    getElementsByTagName: () => [],
    body: {
        appendChild: () => {},
        style: {},
        innerHTML: ''
    },
    head: {
        appendChild: () => {},
        innerHTML: ''
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    readyState: 'complete',
    location: {
        href: 'http://localhost',
        hostname: 'localhost'
    }
};

global.MutationObserver = class MutationObserver {
    constructor(callback) {
        this.callback = callback;
    }
    observe() {}
    disconnect() {}
};

global.navigator = {
    clipboard: undefined
};

console.log('🧪 Starting export.js test suite...\n');

// Load export.js
try {
    console.log('📦 Loading export.js...');
    require('./js/export.js');
    console.log('✅ export.js loaded successfully\n');
} catch (error) {
    console.error('❌ Failed to load export.js:', error.message);
    process.exit(1);
}

// Test suite
const tests = [];
let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
    tests.push({ name, fn });
}

async function runTests() {
    console.log('🔍 Running tests...\n');
    
    for (const { name, fn } of tests) {
        try {
            await fn();
            console.log(`✅ ${name}`);
            passedTests++;
        } catch (error) {
            console.log(`❌ ${name}`);
            console.error(`   Error: ${error.message}`);
            failedTests++;
        }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`📊 Test Results: ${passedTests} passed, ${failedTests} failed`);
    console.log('='.repeat(60) + '\n');
    
    if (failedTests > 0) {
        process.exit(1);
    }
}

// Define tests
test('DocumentExporter class is exported to window', () => {
    if (typeof window.DocumentExporter !== 'function') {
        throw new Error('DocumentExporter class not found on window object');
    }
});

test('DocumentExporter can be instantiated', () => {
    const exporter = new window.DocumentExporter();
    if (!exporter) {
        throw new Error('Failed to create DocumentExporter instance');
    }
});

test('DocumentExporter instance has expected properties', () => {
    const exporter = new window.DocumentExporter();
    
    const requiredProperties = [
        'PDF_CONFIG',
        'FORMATTING',
        'VALIDATION',
        'PATTERNS',
        'MODEL_TITLES'
    ];
    
    for (const prop of requiredProperties) {
        if (!exporter.hasOwnProperty(prop)) {
            throw new Error(`Missing property: ${prop}`);
        }
    }
});

test('PDF_CONFIG has correct structure', () => {
    const exporter = new window.DocumentExporter();
    const config = exporter.PDF_CONFIG;
    
    if (config.PAGE_WIDTH !== 210) {
        throw new Error('PAGE_WIDTH should be 210mm (A4)');
    }
    
    if (config.PAGE_HEIGHT !== 297) {
        throw new Error('PAGE_HEIGHT should be 297mm (A4)');
    }
    
    if (typeof config.USABLE_WIDTH !== 'number') {
        throw new Error('USABLE_WIDTH should be calculated');
    }
});

test('FORMATTING has DOCX constants', () => {
    const exporter = new window.DocumentExporter();
    const formatting = exporter.FORMATTING;
    
    if (formatting.DOCX_TITLE_SIZE !== 28) {
        throw new Error('DOCX_TITLE_SIZE should be 28 (14pt)');
    }
    
    if (formatting.DOCX_BODY_SIZE !== 22) {
        throw new Error('DOCX_BODY_SIZE should be 22 (11pt)');
    }
});

test('MODEL_TITLES contains expected models', () => {
    const exporter = new window.DocumentExporter();
    const titles = exporter.MODEL_TITLES;
    
    const requiredModels = ['demissao', 'ferias', 'advertencia'];
    
    for (const model of requiredModels) {
        if (!titles[model]) {
            throw new Error(`Missing model title for: ${model}`);
        }
    }
});

test('sanitizeFilename method exists and works', () => {
    const exporter = new window.DocumentExporter();
    
    if (typeof exporter.sanitizeFilename !== 'function') {
        throw new Error('sanitizeFilename method not found');
    }
    
    const result = exporter.sanitizeFilename('test/file:name*?.txt');
    
    if (result.includes('/') || result.includes(':') || result.includes('*')) {
        throw new Error('sanitizeFilename should remove special characters');
    }
});

test('isTitleLine method exists and works', () => {
    const exporter = new window.DocumentExporter();
    
    if (typeof exporter.isTitleLine !== 'function') {
        throw new Error('isTitleLine method not found');
    }
    
    // Test uppercase title detection
    const isTitle = exporter.isTitleLine('TÍTULO DO DOCUMENTO');
    if (!isTitle) {
        throw new Error('Should detect uppercase text as title');
    }
    
    // Test lowercase not detected as title
    const notTitle = exporter.isTitleLine('texto normal');
    if (notTitle) {
        throw new Error('Should not detect lowercase text as title');
    }
});

test('parseDocumentToSemanticStructure method exists', () => {
    const exporter = new window.DocumentExporter();
    
    if (typeof exporter.parseDocumentToSemanticStructure !== 'function') {
        throw new Error('parseDocumentToSemanticStructure method not found');
    }
    
    // Just test that the method exists and returns something
    // Full DOM parsing would require a real DOM or jsdom
    try {
        const result = exporter.parseDocumentToSemanticStructure('');
        
        if (!Array.isArray(result)) {
            throw new Error('parseDocumentToSemanticStructure should return an array');
        }
    } catch (error) {
        // If it throws due to DOM limitations in Node.js, that's OK
        // We've verified the method exists and is callable
        if (!error.message.includes('not a function') && 
            !error.message.includes('is not iterable')) {
            throw error;
        }
    }
});

test('getDocumentContent method exists', () => {
    const exporter = new window.DocumentExporter();
    
    if (typeof exporter.getDocumentContent !== 'function') {
        throw new Error('getDocumentContent method not found');
    }
    
    // This will return default message since no DOM elements exist
    const content = exporter.getDocumentContent();
    
    if (typeof content !== 'string') {
        throw new Error('getDocumentContent should return a string');
    }
});

test('getDocumentHTML method exists', () => {
    const exporter = new window.DocumentExporter();
    
    if (typeof exporter.getDocumentHTML !== 'function') {
        throw new Error('getDocumentHTML method not found');
    }
    
    // This will return null since no DOM elements exist
    const html = exporter.getDocumentHTML();
    
    // Should return null when no elements found
    if (html !== null && typeof html !== 'string') {
        throw new Error('getDocumentHTML should return string or null');
    }
});

test('init method exists and can be called', () => {
    const exporter = new window.DocumentExporter();
    
    if (typeof exporter.init !== 'function') {
        throw new Error('init method not found');
    }
    
    // Should not throw error
    exporter.init();
});

test('cleanup method exists and can be called', () => {
    const exporter = new window.DocumentExporter();
    
    if (typeof exporter.cleanup !== 'function') {
        throw new Error('cleanup method not found');
    }
    
    // Should not throw error
    exporter.cleanup();
});

test('showNotification method exists', () => {
    const exporter = new window.DocumentExporter();
    
    if (typeof exporter.showNotification !== 'function') {
        throw new Error('showNotification method not found');
    }
    
    // Should not throw error even without real DOM
    exporter.showNotification('Test message', 'info');
});

test('VALIDATION constants are set correctly', () => {
    const exporter = new window.DocumentExporter();
    const validation = exporter.VALIDATION;
    
    if (validation.MIN_CONTENT_LENGTH !== 50) {
        throw new Error('MIN_CONTENT_LENGTH should be 50');
    }
    
    if (validation.LIBRARY_LOAD_TIMEOUT !== 10000) {
        throw new Error('LIBRARY_LOAD_TIMEOUT should be 10000ms');
    }
});

test('PATTERNS regex are correctly defined', () => {
    const exporter = new window.DocumentExporter();
    const patterns = exporter.PATTERNS;
    
    if (!(patterns.HEAVY_SEPARATOR instanceof RegExp)) {
        throw new Error('HEAVY_SEPARATOR should be a RegExp');
    }
    
    if (!(patterns.LIGHT_SEPARATOR instanceof RegExp)) {
        throw new Error('LIGHT_SEPARATOR should be a RegExp');
    }
    
    if (!(patterns.UPPERCASE_CHARS instanceof RegExp)) {
        throw new Error('UPPERCASE_CHARS should be a RegExp');
    }
});

test('async methods exist (exportPDF, exportToDOCX, copyToClipboard)', () => {
    const exporter = new window.DocumentExporter();
    
    const asyncMethods = ['exportPDF', 'exportToDOCX', 'copyToClipboard'];
    
    for (const method of asyncMethods) {
        if (typeof exporter[method] !== 'function') {
            throw new Error(`${method} method not found`);
        }
    }
});

test('library loading methods exist', () => {
    const exporter = new window.DocumentExporter();
    
    const loaderMethods = ['loadLibraries', 'loadJSPDF', 'loadDocxJS'];
    
    for (const method of loaderMethods) {
        if (typeof exporter[method] !== 'function') {
            throw new Error(`${method} method not found`);
        }
    }
});

test('Singleton pattern: window.documentExporter is created', () => {
    if (!window.documentExporter) {
        throw new Error('window.documentExporter should be auto-initialized');
    }
    
    if (!(window.documentExporter instanceof window.DocumentExporter)) {
        throw new Error('window.documentExporter should be instance of DocumentExporter');
    }
});

// Run all tests
runTests().then(() => {
    console.log('✨ All tests completed successfully!\n');
}).catch((error) => {
    console.error('💥 Test suite failed:', error.message);
    process.exit(1);
});
