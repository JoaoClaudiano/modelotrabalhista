// analytics.js - Sistema de analytics aprimorado para ModeloTrabalhista

class AnalyticsTracker {
    constructor() {
        this.storageKey = 'modelotrabalhista_analytics_v3';
        this.sessionId = this.generateSessionId();
        this.userId = this.getUserId();
        this.pageStartTime = Date.now();
        this.eventsQueue = [];
        this.isSending = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.trackSessionStart();
        this.trackPageView();
        this.loadQueue();
        this.processQueue();
        
        // Enviar eventos pendentes periodicamente
        setInterval(() => this.processQueue(), 30000); // A cada 30 segundos
    }

    // ========== TRACKING DE EVENTOS ==========
    trackEvent(eventName, properties = {}, options = {}) {
        // Verificar opt-out
        if (this.isOptedOut()) {
            return null;
        }

        const event = {
            event: eventName,
            properties: {
                ...properties,
                session_id: this.sessionId,
                user_id: this.userId,
                page: window.location.pathname,
                url: window.location.href,
                title: document.title,
                referrer: document.referrer || 'direct',
                screen_resolution: `${window.screen.width}x${window.screen.height}`,
                viewport: `${window.innerWidth}x${window.innerHeight}`,
                user_agent: navigator.userAgent,
                language: navigator.language,
                timestamp: new Date().toISOString()
            },
            options: {
                immediate: false,
                ...options
            }
        };

        // Adicionar à fila
        this.addToQueue(event);

        // Se for imediato, processar agora
        if (event.options.immediate) {
            this.sendEvent(event);
        }

        // Log em desenvolvimento
        if (this.isDevelopment()) {
            console.log(`[Analytics] ${eventName}:`, event.properties);
        }

        return event;
    }

    trackPageView() {
        const pageLoadTime = Date.now() - this.pageStartTime;
        
        this.trackEvent('page_view', {
            page_load_time: pageLoadTime,
            previous_page: sessionStorage.getItem('last_page') || null
        }, { immediate: true });

        // Salvar página atual para próximo acesso
        sessionStorage.setItem('last_page', window.location.pathname);
    }

    trackDocumentGenerated(model, data) {
        const fieldCount = Object.keys(data).filter(key => data[key]).length;
        
        this.trackEvent('document_generated', {
            model,
            field_count: fieldCount,
            has_company: !!data.companyName,
            has_employee: !!data.employeeName,
            character_count: JSON.stringify(data).length
        }, { immediate: true });
    }

    trackModelSelected(model) {
        this.trackEvent('model_selected', { model });
    }

    trackFormInteraction(action, fieldCount) {
        this.trackEvent('form_interaction', {
            action,
            field_count: fieldCount
        });
    }

    trackError(error, context = {}) {
        this.trackEvent('error_occurred', {
            error_message: error.message,
            error_type: error.name,
            error_stack: error.stack,
            ...context
        }, { immediate: true });
    }

    trackUserAction(action, details = {}) {
        this.trackEvent('user_action', {
            action,
            ...details
        });
    }

    // ========== SESSÕES ==========
    generateSessionId() {
        let sessionId = sessionStorage.getItem('modelotrabalhista_session_id');
        
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('modelotrabalhista_session_id', sessionId);
            sessionStorage.setItem('modelotrabalhista_session_start', Date.now());
        }
        
        return sessionId;
    }

    getSessionDuration() {
        const sessionStart = sessionStorage.getItem('modelotrabalhista_session_start');
        return sessionStart ? Date.now() - parseInt(sessionStart) : 0;
    }

    trackSessionStart() {
        this.trackEvent('session_start', {
            session_duration: 0,
            returning_user: !!localStorage.getItem('modelotrabalhista_user_id')
        }, { immediate: true });
    }

    trackSessionEnd() {
        const duration = this.getSessionDuration();
        this.trackEvent('session_end', {
            session_duration: duration,
            page_count: parseInt(sessionStorage.getItem('page_views') || '1')
        }, { immediate: true });
    }

    // ========== USUÁRIOS ==========
    getUserId() {
        let userId = localStorage.getItem('modelotrabalhista_user_id');
        
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 16);
            localStorage.setItem('modelotrabalhista_user_id', userId);
            
            // Primeira visita
            this.trackEvent('first_visit', {}, { immediate: true });
        }
        
        return userId;
    }

    identifyUser(traits = {}) {
        const userData = {
            id: this.userId,
            ...traits,
            identified_at: new Date().toISOString()
        };
        
        localStorage.setItem('modelotrabalhista_user_profile', JSON.stringify(userData));
        this.trackEvent('user_identified', traits, { immediate: true });
    }

    getUserProfile() {
        try {
            const profile = localStorage.getItem('modelotrabalhista_user_profile');
            return profile ? JSON.parse(profile) : null;
        } catch (e) {
            return null;
        }
    }

    // ========== FILA DE EVENTOS ==========
    addToQueue(event) {
        this.eventsQueue.push(event);
        
        // Limitar fila a 100 eventos
        if (this.eventsQueue.length > 100) {
            this.eventsQueue = this.eventsQueue.slice(-100);
        }
        
        // Salvar fila no localStorage
        this.saveQueue();
    }

    loadQueue() {
        try {
            const queue = localStorage.getItem(`${this.storageKey}_queue`);
            if (queue) {
                this.eventsQueue = JSON.parse(queue);
            }
        } catch (e) {
            console.error('Erro ao carregar fila de eventos:', e);
            this.eventsQueue = [];
        }
    }

    saveQueue() {
        try {
            localStorage.setItem(`${this.storageKey}_queue`, JSON.stringify(this.eventsQueue));
        } catch (e) {
            console.error('Erro ao salvar fila de eventos:', e);
        }
    }

    async processQueue() {
        if (this.isSending || this.eventsQueue.length === 0) return;
        
        this.isSending = true;
        
        try {
            // Enviar eventos pendentes
            const eventsToSend = [...this.eventsQueue];
            this.eventsQueue = [];
            
            for (const event of eventsToSend) {
                await this.sendEvent(event);
            }
            
            this.saveQueue();
        } catch (error) {
            console.error('Erro ao processar fila de eventos:', error);
            // Restaurar eventos não enviados
            this.loadQueue();
        } finally {
            this.isSending = false;
        }
    }

    // ========== ENVIO DE EVENTOS ==========
    async sendEvent(event) {
        // Salvar localmente
        this.saveEventLocally(event);
        
        // Enviar para servidor externo (se configurado)
        if (this.hasExternalEndpoint()) {
            await this.sendToExternalEndpoint(event);
        }
        
        // Google Analytics (se disponível)
        this.sendToGoogleAnalytics(event);
        
        // Facebook Pixel (se disponível)
        this.sendToFacebookPixel(event);
    }

    saveEventLocally(event) {
        try {
            const analytics = this.getLocalAnalytics();
            
            // Adicionar evento
            analytics.events.push({
                ...event,
                saved_at: new Date().toISOString()
            });
            
            // Limitar a 1000 eventos
            if (analytics.events.length > 1000) {
                analytics.events = analytics.events.slice(-1000);
            }
            
            // Atualizar estatísticas
            analytics.stats.total_events = analytics.events.length;
            analytics.stats.last_event = new Date().toISOString();
            
            // Contar por tipo de evento
            if (!analytics.stats.event_counts[event.event]) {
                analytics.stats.event_counts[event.event] = 0;
            }
            analytics.stats.event_counts[event.event]++;
            
            localStorage.setItem(this.storageKey, JSON.stringify(analytics));
        } catch (e) {
            console.error('Erro ao salvar evento localmente:', e);
        }
    }

    getLocalAnalytics() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                return JSON.parse(data);
            }
        } catch (e) {
            console.error('Erro ao carregar analytics local:', e);
        }
        
        // Estrutura inicial
        return {
            version: '3.0',
            user_id: this.userId,
            first_seen: new Date().toISOString(),
            last_seen: new Date().toISOString(),
            events: [],
            stats: {
                total_events: 0,
                unique_sessions: 1,
                event_counts: {},
                last_event: null
            }
        };
    }

    // ========== INTEGRAÇÕES EXTERNAS ==========
    hasExternalEndpoint() {
        return !!window.MODELOTRABALHISTA_ANALYTICS_ENDPOINT;
    }

    async sendToExternalEndpoint(event) {
        if (!this.hasExternalEndpoint()) return;
        
        try {
            const response = await fetch(window.MODELOTRABALHISTA_ANALYTICS_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('Erro ao enviar para endpoint externo:', error);
        }
    }

    sendToGoogleAnalytics(event) {
        if (typeof gtag !== 'undefined') {
            gtag('event', event.event, {
                ...event.properties,
                event_category: 'ModeloTrabalhista',
                event_label: event.event,
                value: 1
            });
        }
        
        if (typeof ga !== 'undefined') {
            ga('send', 'event', 'ModeloTrabalhista', event.event, event.event, 1);
        }
    }

    sendToFacebookPixel(event) {
        if (typeof fbq !== 'undefined') {
            fbq('track', event.event, event.properties);
        }
    }

    // ========== CONFIGURAÇÃO ==========
    setupEventListeners() {
        // Rastrear cliques em links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link) {
                this.trackEvent('link_click', {
                    url: link.href,
                    text: link.textContent.substring(0, 100),
                    is_external: !link.href.includes(window.location.hostname)
                });
            }
        });

        // Rastrear envio de formulários
        document.addEventListener('submit', (e) => {
            this.trackEvent('form_submit', {
                form_id: e.target.id,
                form_action: e.target.action,
                field_count: e.target.elements.length
            });
        });

        // Rastrear erros JavaScript
        window.addEventListener('error', (e) => {
            this.trackError(e.error, {
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno
            });
        });

        // Rastrear beforeunload
        window.addEventListener('beforeunload', () => {
            this.trackSessionEnd();
            this.processQueue(); // Tentar enviar eventos pendentes
        });

        // Rastrear mudanças de visibilidade
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.trackEvent('page_hidden', {
                    time_on_page: Date.now() - this.pageStartTime
                });
            } else {
                this.pageStartTime = Date.now();
                this.trackEvent('page_visible');
            }
        });
    }

    // ========== RELATÓRIOS E ESTATÍSTICAS ==========
    getReports(options = {}) {
        const analytics = this.getLocalAnalytics();
        const events = analytics.events;
        
        // Filtrar por período
        let filteredEvents = events;
        if (options.startDate || options.endDate) {
            filteredEvents = events.filter(event => {
                const eventDate = new Date(event.properties.timestamp);
                if (options.startDate && eventDate < options.startDate) return false;
                if (options.endDate && eventDate > options.endDate) return false;
                return true;
            });
        }
        
        // Estatísticas básicas
        const totalEvents = filteredEvents.length;
        const uniqueEventTypes = [...new Set(filteredEvents.map(e => e.event))];
        
        // Contagem por tipo
        const eventCounts = {};
        filteredEvents.forEach(event => {
            eventCounts[event.event] = (eventCounts[event.event] || 0) + 1;
        });
        
        // Documentos gerados
        const documentEvents = filteredEvents.filter(e => e.event === 'document_generated');
        const modelsUsed = {};
        documentEvents.forEach(event => {
            const model = event.properties.model;
            modelsUsed[model] = (modelsUsed[model] || 0) + 1;
        });
        
        // Sessões
        const sessionStarts = filteredEvents.filter(e => e.event === 'session_start').length;
        const sessionEnds = filteredEvents.filter(e => e.event === 'session_end').length;
        
        // Tempo médio de sessão
        let avgSessionDuration = 0;
        if (sessionEnds > 0) {
            const sessionDurations = filteredEvents
                .filter(e => e.event === 'session_end')
                .map(e => e.properties.session_duration || 0);
            
            avgSessionDuration = sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length;
        }
        
        // Engajamento
        const pageViews = filteredEvents.filter(e => e.event === 'page_view').length;
        const userActions = filteredEvents.filter(e => e.event === 'user_action').length;
        
        return {
            summary: {
                total_events: totalEvents,
                unique_event_types: uniqueEventTypes.length,
                total_sessions: sessionStarts,
                avg_session_duration: Math.round(avgSessionDuration / 1000), // em segundos
                page_views: pageViews,
                user_actions: userActions
            },
            events: eventCounts,
            documents: {
                total: documentEvents.length,
                by_model: modelsUsed,
                most_popular: Object.entries(modelsUsed).sort((a, b) => b[1] - a[1])[0] || null
            },
            user: {
                id: this.userId,
                first_seen: analytics.first_seen,
                last_seen: analytics.last_seen,
                total_visits: sessionStarts
            },
            timeline: this.generateTimeline(filteredEvents)
        };
    }

    generateTimeline(events, maxItems = 50) {
        return events
            .sort((a, b) => new Date(b.properties.timestamp) - new Date(a.properties.timestamp))
            .slice(0, maxItems)
            .map(event => ({
                event: event.event,
                timestamp: event.properties.timestamp,
                properties: event.properties
            }));
    }

    // ========== PRIVACIDADE ==========
    isOptedOut() {
        return localStorage.getItem('modelotrabalhista_analytics_opt_out') === 'true' ||
               localStorage.getItem('modelotrabalhista_do_not_track') === 'true';
    }

    optOut() {
        localStorage.setItem('modelotrabalhista_analytics_opt_out', 'true');
        this.clearUserData();
    }

    optIn() {
        localStorage.removeItem('modelotrabalhista_analytics_opt_out');
        localStorage.removeItem('modelotrabalhista_do_not_track');
    }

    clearUserData() {
        // Remover dados específicos do usuário
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(`${this.storageKey}_queue`);
        localStorage.removeItem('modelotrabalhista_user_profile');
        
        // Manter apenas o ID do usuário para reconhecimento
        // Remover eventos específicos
        const analytics = this.getLocalAnalytics();
        analytics.events = [];
        analytics.stats = {
            total_events: 0,
            unique_sessions: 1,
            event_counts: {},
            last_event: null
        };
        
        localStorage.setItem(this.storageKey, JSON.stringify(analytics));
    }

    // ========== UTILITÁRIOS ==========
    isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.hostname.includes('dev');
    }

    // ========== HEALTH CHECK ==========
    checkHealth() {
        const analytics = this.getLocalAnalytics();
        const now = new Date();
        const lastEvent = new Date(analytics.stats.last_event || analytics.first_seen);
        const hoursSinceLastEvent = (now - lastEvent) / (1000 * 60 * 60);
        
        return {
            status: 'healthy',
            last_event: analytics.stats.last_event,
            hours_since_last_event: Math.round(hoursSinceLastEvent),
            total_events: analytics.stats.total_events,
            queue_size: this.eventsQueue.length,
            user_id_present: !!this.userId,
            session_active: !!this.sessionId,
            opted_out: this.isOptedOut()
        };
    }
}

// Inicializar automaticamente (com opt-out check)
document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('modelotrabalhista_analytics_opt_out')) {
        window.analytics = new AnalyticsTracker();
        
        // Expor métodos globais para debugging
        if (window.location.hostname === 'localhost') {
            window.debugAnalytics = {
                getReports: () => window.analytics.getReports(),
                getHealth: () => window.analytics.checkHealth(),
                clearData: () => window.analytics.clearUserData(),
                optOut: () => window.analytics.optOut(),
                optIn: () => window.analytics.optIn()
            };
        }
    }
});

// Exportar para uso global
window.AnalyticsTracker = AnalyticsTracker;
