/**
 * Preload Styles Helper
 * Loads stylesheets asynchronously without violating CSP by avoiding inline event handlers
 */
(function() {
    'use strict';
    
    /**
     * Convert preload links to stylesheets
     * This replaces the onload inline event handler approach with a CSP-compliant method
     */
    function loadPreloadedStyles() {
        // Find all preload links that should become stylesheets
        const preloadLinks = document.querySelectorAll('link[rel="preload"][as="style"]');
        
        preloadLinks.forEach(function(link) {
            // Create a new link element for the stylesheet
            const styleLink = document.createElement('link');
            styleLink.rel = 'stylesheet';
            styleLink.href = link.href;
            
            // Insert after the preload link
            link.parentNode.insertBefore(styleLink, link.nextSibling);
        });
    }
    
    // Execute when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadPreloadedStyles);
    } else {
        // DOM already loaded
        loadPreloadedStyles();
    }
})();
