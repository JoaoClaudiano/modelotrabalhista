// storage.js - Gerenciamento de armazenamento local para ModeloTrabalhista

class StorageManager {
    constructor() {
        this.prefix = 'modelotrabalhista_';
        this.maxHistoryItems = 50;
        this.maxDrafts = 10;
        this.init();
    }

    init() {
        // Inicializar estruturas se não existirem
        if (!this.getHistory()) {
            this.setHistory([]);
        }
        
        if (!this.getSettings()) {
            this.setDefaultSettings();
        }
        
        // Limpeza inicial de dados antigos
        this.cleanupOldItems();
    }

    // ========== DADOS DO FORMULÁRIO ==========
    saveDraft(model, data) {
        const key = `${this.prefix}draft_${model}`;
        try {
            localStorage.setItem(key, JSON.stringify({
                data,
                savedAt: new Date().toISOString(),
                model
            }));
            return true;
        } catch (e) {
            // Tratar erro de quota excedida
            if (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014) {
                console.warn('Armazenamento local cheio. Tentando limpar itens antigos...');
                this.cleanupOldItems();
                try {
                    localStorage.setItem(key, JSON.stringify({
                        data,
                        savedAt: new Date().toISOString(),
                        model
                    }));
                    return true;
                } catch (retryError) {
                    console.error('Erro ao salvar rascunho após limpeza:', retryError);
                    return false;
                }
            }
            console.error('Erro ao salvar rascunho:', e);
            return false;
        }
    }

    loadDraft(model) {
        const key = `${this.prefix}draft_${model}`;
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Erro ao carregar rascunho:', e);
            return null;
        }
    }

    clearDraft(model) {
        const key = `${this.prefix}draft_${model}`;
        localStorage.removeItem(key);
        return true;
    }

    getAllDrafts() {
        const drafts = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            // Adicionar verificação de null para prevenir erros
            if (key && key.startsWith(`${this.prefix}draft_`)) {
                try {
                    const draft = JSON.parse(localStorage.getItem(key));
                    drafts.push({
                        ...draft,
                        key: key.replace(`${this.prefix}draft_`, '')
                    });
                } catch (e) {
                    console.error('Erro ao parsear rascunho:', e);
                }
            }
        }
        return drafts;
    }

    // ========== HISTÓRICO DE DOCUMENTOS ==========
    addToHistory(documentData) {
        const history = this.getHistory();
        
        // Adicionar metadados
        const enrichedData = {
            ...documentData,
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            savedAt: new Date().toISOString(),
            preview: this.generatePreview(documentData.content)
        };
        
        // Adicionar no início
        history.unshift(enrichedData);
        
        // Limitar histórico
        if (history.length > this.maxHistoryItems) {
            history.splice(this.maxHistoryItems);
        }
        
        this.setHistory(history);
        return enrichedData.id;
    }

    getHistory() {
        try {
            const history = localStorage.getItem(`${this.prefix}history`);
            return history ? JSON.parse(history) : [];
        } catch (e) {
            console.error('Erro ao carregar histórico:', e);
            return [];
        }
    }

    getHistoryItem(id) {
        const history = this.getHistory();
        return history.find(item => item.id === id);
    }

    updateHistoryItem(id, updates) {
        const history = this.getHistory();
        const index = history.findIndex(item => item.id === id);
        
        if (index !== -1) {
            history[index] = { ...history[index], ...updates };
            this.setHistory(history);
            return true;
        }
        return false;
    }

    removeFromHistory(id) {
        const history = this.getHistory();
        const filtered = history.filter(item => item.id !== id);
        this.setHistory(filtered);
        return filtered.length !== history.length;
    }

    clearHistory() {
        localStorage.removeItem(`${this.prefix}history`);
        return true;
    }

    setHistory(history) {
        try {
            localStorage.setItem(`${this.prefix}history`, JSON.stringify(history));
            return true;
        } catch (e) {
            console.error('Erro ao salvar histórico:', e);
            return false;
        }
    }

    // ========== CONFIGURAÇÕES ==========
    setDefaultSettings() {
        const defaultSettings = {
            autoSave: true,
            theme: 'light',
            language: 'pt-BR',
            notifications: true,
            defaultModel: 'demissao',
            fontSize: 'medium',
            saveDrafts: true,
            saveHistory: true,
            analytics: true
        };
        
        this.saveSettings(defaultSettings);
        return defaultSettings;
    }

    saveSettings(settings) {
        try {
            localStorage.setItem(`${this.prefix}settings`, JSON.stringify(settings));
            return true;
        } catch (e) {
            console.error('Erro ao salvar configurações:', e);
            return false;
        }
    }

    getSettings() {
        try {
            const settings = localStorage.getItem(`${this.prefix}settings`);
            if (settings) {
                return JSON.parse(settings);
            }
        } catch (e) {
            console.error('Erro ao carregar configurações:', e);
        }
        return null;
    }

    updateSetting(key, value) {
        const settings = this.getSettings() || this.setDefaultSettings();
        settings[key] = value;
        return this.saveSettings(settings);
    }

    // ========== EXPORTAÇÃO/IMPORTAÇÃO ==========
    exportData(options = {}) {
        const data = {
            version: '2.0',
            exportedAt: new Date().toISOString(),
            app: 'ModeloTrabalhista'
        };
        
        if (options.includeHistory) {
            data.history = this.getHistory();
        }
        
        if (options.includeDrafts) {
            data.drafts = this.getAllDrafts();
        }
        
        if (options.includeSettings) {
            data.settings = this.getSettings();
        }
        
        return JSON.stringify(data, null, 2);
    }

    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            if (!data.version || !data.app || data.app !== 'ModeloTrabalhista') {
                throw new Error('Formato de arquivo inválido');
            }
            
            let importedCount = 0;
            
            // Importar histórico
            if (data.history && Array.isArray(data.history)) {
                const currentHistory = this.getHistory();
                const mergedHistory = [...data.history, ...currentHistory];
                
                // Remover duplicados baseado no ID
                const uniqueHistory = mergedHistory.filter((item, index, self) =>
                    index === self.findIndex((t) => t.id === item.id)
                );
                
                // Limitar ao máximo
                if (uniqueHistory.length > this.maxHistoryItems) {
                    uniqueHistory.splice(this.maxHistoryItems);
                }
                
                this.setHistory(uniqueHistory);
                importedCount += data.history.length;
            }
            
            // Importar configurações
            if (data.settings && typeof data.settings === 'object') {
                const currentSettings = this.getSettings() || this.setDefaultSettings();
                const mergedSettings = { ...currentSettings, ...data.settings };
                this.saveSettings(mergedSettings);
            }
            
            return {
                success: true,
                importedCount,
                message: `Importados ${importedCount} itens com sucesso`
            };
            
        } catch (e) {
            console.error('Erro ao importar dados:', e);
            return {
                success: false,
                error: e.message
            };
        }
    }

    // ========== ESTATÍSTICAS ==========
    getStatistics() {
        const history = this.getHistory();
        const drafts = this.getAllDrafts();
        const settings = this.getSettings();
        
        // Contar modelos usados
        const modelCount = {};
        history.forEach(doc => {
            if (doc.model) {
                modelCount[doc.model] = (modelCount[doc.model] || 0) + 1;
            }
        });
        
        // Encontrar modelo mais usado
        let favoriteModel = null;
        let maxCount = 0;
        Object.entries(modelCount).forEach(([model, count]) => {
            if (count > maxCount) {
                maxCount = count;
                favoriteModel = model;
            }
        });
        
        // Calcular tempo total de uso (aproximado)
        let totalUsageTime = 0;
        if (history.length > 0) {
            const firstDoc = new Date(history[history.length - 1].savedAt);
            const lastDoc = new Date(history[0].savedAt);
            totalUsageTime = lastDoc - firstDoc;
        }
        
        return {
            totalDocuments: history.length,
            totalDrafts: drafts.length,
            favoriteModel,
            modelUsage: modelCount,
            firstDocument: history.length > 0 ? history[history.length - 1].savedAt : null,
            lastDocument: history.length > 0 ? history[0].savedAt : null,
            totalUsageDays: Math.floor(totalUsageTime / (1000 * 60 * 60 * 24)),
            settings
        };
    }

    // ========== BACKUP E RECUPERAÇÃO ==========
    createBackup() {
        const backup = {
            history: this.getHistory(),
            settings: this.getSettings(),
            version: '2.0',
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        return URL.createObjectURL(blob);
    }

    restoreBackup(backupData) {
        try {
            const data = typeof backupData === 'string' ? JSON.parse(backupData) : backupData;
            
            if (data.history) {
                this.setHistory(data.history);
            }
            
            if (data.settings) {
                this.saveSettings(data.settings);
            }
            
            return true;
        } catch (e) {
            console.error('Erro ao restaurar backup:', e);
            return false;
        }
    }

    // ========== UTILITÁRIOS ==========
    generatePreview(content, maxLength = 100) {
        if (!content) return '';
        
        const text = content.replace(/[=\-_]/g, ' ').replace(/\s+/g, ' ').trim();
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    getStorageUsage() {
        let total = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            // Adicionar verificação de null
            if (key && key.startsWith(this.prefix)) {
                const value = localStorage.getItem(key);
                total += (key.length + value.length) * 2; // Aproximação em bytes
            }
        }
        
        return {
            bytes: total,
            kilobytes: (total / 1024).toFixed(2),
            megabytes: (total / (1024 * 1024)).toFixed(4),
            percentage: ((total / (5 * 1024 * 1024)) * 100).toFixed(2) // 5MB é o limite comum
        };
    }

    cleanupOldItems() {
        const history = this.getHistory();
        if (history.length > this.maxHistoryItems) {
            history.splice(this.maxHistoryItems);
            this.setHistory(history);
        }
        
        // Limpar rascunhos antigos (mais de 30 dias)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const drafts = this.getAllDrafts();
        drafts.forEach(draft => {
            if (new Date(draft.savedAt) < thirtyDaysAgo) {
                localStorage.removeItem(`${this.prefix}draft_${draft.key}`);
            }
        });
    }

    clearAll() {
        // Remover apenas os dados do aplicativo
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            // Adicionar verificação de null
            if (key && key.startsWith(this.prefix)) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });
        
        return keysToRemove.length;
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    if (!window.storageManager) {
        window.storageManager = new StorageManager();
        
        // Limpeza automática periódica com armazenamento do ID para limpeza
        const cleanupIntervalId = setInterval(() => {
            window.storageManager.cleanupOldItems();
        }, 24 * 60 * 60 * 1000); // Diariamente
        
        // Limpar interval quando a página for descarregada
        window.addEventListener('beforeunload', () => {
            clearInterval(cleanupIntervalId);
        });
    }
});

// Exportar para uso global
window.StorageManager = StorageManager;
