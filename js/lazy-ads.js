/**
 * Lazy Load AdSense Script
 * Loads AdSense scripts only after 3 seconds from the first scroll event
 * This prevents long tasks that block the main thread during initial page load
 */
(function() {
    'use strict';
    
    let adsLoaded = false;
    let scrollTimeout = null;
    
    /**
     * Load AdSense script
     */
    function loadAdSense() {
        if (adsLoaded) return;
        adsLoaded = true;
        
        // Load AdSense script
        const adsScript = document.createElement('script');
        adsScript.async = true;
        adsScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2518079690291956';
        adsScript.crossOrigin = 'anonymous';
        document.head.appendChild(adsScript);
        
        console.log('[Lazy Ads] AdSense script loaded');
    }
    
    /**
     * Load Google Analytics gtag.js
     */
    function loadGoogleAnalytics() {
        // Create dataLayer if not exists
        window.dataLayer = window.dataLayer || [];
        
        // Define gtag function before script loads using rest parameters
        window.gtag = function(...args) {
            window.dataLayer.push(args);
        };
        
        // Load gtag script
        const gtagScript = document.createElement('script');
        gtagScript.async = true;
        gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-TV6810LM29';
        document.head.appendChild(gtagScript);
        
        // Initialize gtag after script loads
        gtagScript.onload = function() {
            window.gtag('js', new Date());
            window.gtag('config', 'G-TV6810LM29');
            console.log('[Lazy Ads] Google Analytics loaded and configured');
        };
    }
    
    /**
     * Handle scroll event - loads scripts 3 seconds after FIRST scroll
     */
    function handleScroll() {
        // Only process the first scroll event
        if (scrollTimeout) {
            return; // Already started, ignore subsequent scrolls
        }
        
        // Set timeout to load ads 3 seconds after FIRST scroll
        scrollTimeout = setTimeout(function() {
            loadAdSense();
            loadGoogleAnalytics();
            
            // Remove scroll listener after loading
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('touchmove', handleScroll);
            
            console.log('[Lazy Ads] Scripts loaded 3 seconds after first scroll');
        }, 3000);
    }
    
    /**
     * Initialize lazy loading
     */
    function init() {
        // Listen for scroll events
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('touchmove', handleScroll, { passive: true });
        
        // Fallback: Load after 10 seconds even if no scroll
        setTimeout(function() {
            if (!adsLoaded) {
                loadAdSense();
                loadGoogleAnalytics();
                console.log('[Lazy Ads] Scripts loaded after 10 seconds (fallback)');
            }
        }, 10000);
        
        console.log('[Lazy Ads] Initialized - waiting for scroll');
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
