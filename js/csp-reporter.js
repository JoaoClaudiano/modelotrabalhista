// csp-reporter.js - Console-based CSP Violation Reporter
// This module captures and logs Content Security Policy violations to the browser console
// for monitoring and debugging purposes without blocking any resources.

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        enabled: true,
        consoleLogging: true,
        detailedLogging: true,
        storageKey: 'csp-violations',
        maxStoredViolations: 50
    };

    // Violation storage
    let violations = [];

    /**
     * Initialize the CSP violation reporter
     */
    function init() {
        if (!CONFIG.enabled) {
            return;
        }

        // Listen for CSP violations
        document.addEventListener('securitypolicyviolation', handleViolation);

        // Load stored violations from sessionStorage
        loadStoredViolations();

        // Log initialization
        if (CONFIG.consoleLogging) {
            console.log('%c[CSP Reporter] Initialized', 'color: #2196F3; font-weight: bold;');
            console.log('%c[CSP Reporter] Monitoring for Content Security Policy violations...', 'color: #2196F3;');
        }

        // Expose global API for accessing violations
        window.CSPReporter = {
            getViolations: getViolations,
            clearViolations: clearViolations,
            getStats: getStats,
            exportViolations: exportViolations,
            config: CONFIG
        };
    }

    /**
     * Handle CSP violation events
     * @param {SecurityPolicyViolationEvent} event - The violation event
     */
    function handleViolation(event) {
        const violation = {
            timestamp: new Date().toISOString(),
            blockedURI: event.blockedURI || 'inline',
            violatedDirective: event.violatedDirective,
            effectiveDirective: event.effectiveDirective,
            originalPolicy: event.originalPolicy,
            disposition: event.disposition, // 'enforce' or 'report'
            documentURI: event.documentURI,
            sourceFile: event.sourceFile || 'unknown',
            lineNumber: event.lineNumber || 0,
            columnNumber: event.columnNumber || 0,
            statusCode: event.statusCode || 0,
            sample: event.sample || ''
        };

        // Store violation
        violations.push(violation);
        
        // Limit stored violations
        if (violations.length > CONFIG.maxStoredViolations) {
            violations = violations.slice(-CONFIG.maxStoredViolations);
        }

        // Save to sessionStorage
        saveViolations();

        // Log to console
        if (CONFIG.consoleLogging) {
            logViolationToConsole(violation);
        }
    }

    /**
     * Log violation to console with formatting
     * @param {Object} violation - The violation object
     */
    function logViolationToConsole(violation) {
        const isReportOnly = violation.disposition === 'report';
        const color = isReportOnly ? '#FF9800' : '#F44336';
        const prefix = isReportOnly ? '[CSP Report-Only]' : '[CSP Enforced]';

        console.group(`%c${prefix} Violation Detected`, `color: ${color}; font-weight: bold;`);
        
        // Basic info
        console.log('%cType:', 'font-weight: bold;', violation.effectiveDirective);
        console.log('%cBlocked:', 'font-weight: bold;', violation.blockedURI);
        console.log('%cViolated Directive:', 'font-weight: bold;', violation.violatedDirective);
        
        // Location info
        if (violation.sourceFile && violation.sourceFile !== 'unknown') {
            console.log('%cLocation:', 'font-weight: bold;', 
                `${violation.sourceFile}:${violation.lineNumber}:${violation.columnNumber}`);
        }

        // Sample code if available
        if (violation.sample) {
            console.log('%cCode Sample:', 'font-weight: bold;', violation.sample);
        }

        // Detailed logging
        if (CONFIG.detailedLogging) {
            console.log('%cFull Details:', 'font-weight: bold;');
            console.table({
                'Timestamp': violation.timestamp,
                'Document URI': violation.documentURI,
                'Disposition': violation.disposition,
                'Status Code': violation.statusCode
            });
        }

        // Actionable advice
        console.log('%c💡 How to fix:', 'color: #4CAF50; font-weight: bold;');
        console.log(getFixSuggestion(violation));

        console.groupEnd();
    }

    /**
     * Get suggestion for fixing a violation
     * @param {Object} violation - The violation object
     * @returns {string} Suggestion text
     */
    function getFixSuggestion(violation) {
        const directive = violation.effectiveDirective;
        const blockedURI = violation.blockedURI;

        const suggestions = {
            'script-src': `Add the script source to script-src directive: ${blockedURI}`,
            'script-src-elem': `Add the script source to script-src directive: ${blockedURI}`,
            'script-src-attr': 'Avoid inline event handlers (onclick, onload, etc.). Use addEventListener instead.',
            'style-src': `Add the style source to style-src directive: ${blockedURI}`,
            'style-src-elem': `Add the style source to style-src directive: ${blockedURI}`,
            'style-src-attr': 'Avoid inline styles. Move CSS to external stylesheet or use style element.',
            'img-src': `Add the image source to img-src directive: ${blockedURI}`,
            'font-src': `Add the font source to font-src directive: ${blockedURI}`,
            'connect-src': `Add the connection source to connect-src directive: ${blockedURI}`,
            'frame-src': `Add the frame source to frame-src directive: ${blockedURI}`,
            'media-src': `Add the media source to media-src directive: ${blockedURI}`,
            'object-src': `Add the object source to object-src directive: ${blockedURI}`,
            'base-uri': 'Remove or restrict the base tag in your HTML.',
            'form-action': 'Ensure form submissions are to allowed origins.',
            'frame-ancestors': 'Check if the page is being embedded from an unauthorized origin.'
        };

        return suggestions[directive] || 
            `Review the ${directive} directive in your CSP and add: ${blockedURI}`;
    }

    /**
     * Load violations from sessionStorage
     */
    function loadStoredViolations() {
        try {
            const stored = sessionStorage.getItem(CONFIG.storageKey);
            if (stored) {
                violations = JSON.parse(stored);
            }
        } catch (e) {
            console.warn('[CSP Reporter] Failed to load stored violations:', e);
        }
    }

    /**
     * Save violations to sessionStorage
     */
    function saveViolations() {
        try {
            sessionStorage.setItem(CONFIG.storageKey, JSON.stringify(violations));
        } catch (e) {
            console.warn('[CSP Reporter] Failed to save violations:', e);
        }
    }

    /**
     * Get all stored violations
     * @returns {Array} Array of violation objects
     */
    function getViolations() {
        return violations.slice(); // Return copy
    }

    /**
     * Clear all stored violations
     */
    function clearViolations() {
        violations = [];
        try {
            sessionStorage.removeItem(CONFIG.storageKey);
        } catch (e) {
            console.warn('[CSP Reporter] Failed to clear violations:', e);
        }
        if (CONFIG.consoleLogging) {
            console.log('%c[CSP Reporter] Violations cleared', 'color: #4CAF50; font-weight: bold;');
        }
    }

    /**
     * Get statistics about violations
     * @returns {Object} Statistics object
     */
    function getStats() {
        const stats = {
            total: violations.length,
            byDirective: {},
            reportOnly: 0,
            enforced: 0,
            uniqueBlockedURIs: new Set()
        };

        violations.forEach(v => {
            // Count by directive
            stats.byDirective[v.effectiveDirective] = 
                (stats.byDirective[v.effectiveDirective] || 0) + 1;
            
            // Count by disposition
            if (v.disposition === 'report') {
                stats.reportOnly++;
            } else {
                stats.enforced++;
            }

            // Collect unique blocked URIs
            stats.uniqueBlockedURIs.add(v.blockedURI);
        });

        stats.uniqueBlockedURIs = Array.from(stats.uniqueBlockedURIs);

        return stats;
    }

    /**
     * Export violations as JSON
     * @returns {string} JSON string of violations
     */
    function exportViolations() {
        return JSON.stringify({
            exported: new Date().toISOString(),
            total: violations.length,
            violations: violations
        }, null, 2);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
