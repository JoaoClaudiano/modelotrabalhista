/**
 * Icon Fallback System
 * Detects when Font Awesome fails to load and provides Unicode fallbacks
 * Resolves: "Node cannot be found in the current page" error
 */
(function() {
    'use strict';
    
    // Unicode fallback symbols for Font Awesome icons
    const iconFallbacks = {
        'fa-home': '🏠',
        'fa-newspaper': '📰',
        'fa-file-alt': '📄',
        'fa-calculator': '🧮',
        'fa-magic': '✨',
        'fa-question-circle': '❓',
        'fa-file-contract': '📋',
        'fa-bars': '☰',
        'fa-check': '✓',
        'fa-times': '✕',
        'fa-search-plus': '🔍+',
        'fa-search-minus': '🔍−',
        'fa-sync-alt': '🔄',
        'fa-exclamation-triangle': '⚠️',
        'fa-info-circle': 'ℹ️',
        'fa-lock': '🔒',
        'fa-eye': '👁️',
        'fa-mobile-alt': '📱',
        'fa-history': '⏱️',
        'fa-chevron-up': '▲',
        'fa-chevron-down': '▼',
        'fa-download': '⬇️',
        'fa-file-pdf': '📕',
        'fa-file-word': '📘',
        'fa-copy': '📋',
        'fa-print': '🖨️',
        'fa-bolt': '⚡',
        'fa-shield-alt': '🛡️',
        'fa-check-circle': '✅',
        'fa-zap': '⚡',
        'fa-facebook-f': 'f',
        'fa-twitter': '🐦',
        'fa-instagram': '📷',
        'fa-linkedin-in': 'in'
    };
    
    /**
     * Check if Font Awesome is loaded by testing for specific font-family
     */
    function isFontAwesomeLoaded() {
        try {
            // Create a test element with Font Awesome class
            const testElement = document.createElement('span');
            testElement.className = 'fas fa-check';
            testElement.style.position = 'absolute';
            testElement.style.visibility = 'hidden';
            testElement.style.fontSize = '16px';
            document.body.appendChild(testElement);
            
            // Get computed style
            const computedStyle = window.getComputedStyle(testElement);
            const fontFamily = computedStyle.getPropertyValue('font-family');
            
            // Clean up
            document.body.removeChild(testElement);
            
            // Font Awesome uses "Font Awesome 6 Free" or similar
            return fontFamily && (
                fontFamily.toLowerCase().includes('font awesome') ||
                fontFamily.toLowerCase().includes('fontawesome')
            );
        } catch (error) {
            console.warn('Error checking Font Awesome status:', error);
            return false;
        }
    }
    
    /**
     * Apply fallback symbols to icons
     */
    function applyIconFallbacks() {
        const icons = document.querySelectorAll('i[class*="fa-"]');
        let fallbackCount = 0;
        
        icons.forEach(icon => {
            // Get all classes that start with 'fa-'
            const classList = Array.from(icon.classList);
            const iconClass = classList.find(cls => cls.startsWith('fa-') && cls !== 'fas' && cls !== 'far' && cls !== 'fab' && cls !== 'fal');
            
            if (iconClass && iconFallbacks[iconClass]) {
                // Replace with Unicode symbol
                icon.textContent = iconFallbacks[iconClass];
                icon.style.fontFamily = 'inherit';
                icon.style.fontStyle = 'normal';
                icon.setAttribute('data-fallback-applied', 'true');
                fallbackCount++;
            } else if (iconClass) {
                // Icon not in fallback map - use descriptive generic symbol
                icon.textContent = '⚙️';
                icon.style.fontFamily = 'inherit';
                icon.style.fontStyle = 'normal';
                icon.setAttribute('data-fallback-applied', 'true');
                icon.setAttribute('title', 'Icon: ' + iconClass);
                fallbackCount++;
            }
        });
        
        if (fallbackCount > 0) {
            console.info(`Applied ${fallbackCount} icon fallbacks`);
        }
    }
    
    /**
     * Check and apply fallbacks if needed
     * Uses Font Awesome stylesheet load event for better timing
     */
    function checkAndApplyFallbacks() {
        // Check if Font Awesome stylesheet is loaded
        const fontAwesomeLinks = Array.from(document.querySelectorAll('link[href*="font-awesome"]'));
        
        if (fontAwesomeLinks.length > 0) {
            // Font Awesome link found - wait for it to load
            let loaded = false;
            const timeout = setTimeout(() => {
                if (!loaded) {
                    checkFontAwesome();
                }
            }, 2000); // 2 second timeout
            
            fontAwesomeLinks.forEach(link => {
                if (link.sheet) {
                    // Already loaded
                    clearTimeout(timeout);
                    loaded = true;
                    checkFontAwesome();
                } else {
                    link.addEventListener('load', () => {
                        clearTimeout(timeout);
                        loaded = true;
                        checkFontAwesome();
                    });
                    link.addEventListener('error', () => {
                        clearTimeout(timeout);
                        loaded = true;
                        console.warn('Font Awesome failed to load from CDN - applying fallback icons');
                        applyIconFallbacks();
                        document.body.classList.add('icon-fallback-active');
                    });
                }
            });
        } else {
            // No Font Awesome link found - check immediately
            checkFontAwesome();
        }
    }
    
    /**
     * Check Font Awesome and apply fallbacks if needed
     */
    function checkFontAwesome() {
        if (!isFontAwesomeLoaded()) {
            console.warn('Font Awesome not detected - applying fallback icons');
            applyIconFallbacks();
            document.body.classList.add('icon-fallback-active');
        } else {
            console.info('Font Awesome loaded successfully');
        }
    }
    
    // Execute when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAndApplyFallbacks);
    } else {
        checkAndApplyFallbacks();
    }
})();
