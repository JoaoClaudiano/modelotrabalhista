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
                // Icon not in fallback map - use generic symbol
                icon.textContent = '•';
                icon.style.fontFamily = 'inherit';
                icon.style.fontStyle = 'normal';
                icon.setAttribute('data-fallback-applied', 'true');
                fallbackCount++;
            }
        });
        
        if (fallbackCount > 0) {
            console.info(`Applied ${fallbackCount} icon fallbacks`);
        }
    }
    
    /**
     * Check and apply fallbacks if needed
     */
    function checkAndApplyFallbacks() {
        // Wait a bit for Font Awesome to load
        setTimeout(() => {
            if (!isFontAwesomeLoaded()) {
                console.warn('Font Awesome not detected - applying fallback icons');
                applyIconFallbacks();
                
                // Add a class to body for CSS adjustments if needed
                document.body.classList.add('icon-fallback-active');
            } else {
                console.info('Font Awesome loaded successfully');
            }
        }, 1000);
    }
    
    // Execute when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAndApplyFallbacks);
    } else {
        checkAndApplyFallbacks();
    }
    
    // Also check on window load (in case Font Awesome loads late)
    window.addEventListener('load', () => {
        // Only recheck if fallbacks were not already applied
        if (!document.body.classList.contains('icon-fallback-active')) {
            setTimeout(checkAndApplyFallbacks, 500);
        }
    });
})();
