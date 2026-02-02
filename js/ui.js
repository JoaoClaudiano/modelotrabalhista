// ui.js - Gerenciamento de interface e interações do usuário

class UIHelper {
    constructor() {
        this.currentZoom = 100;
        this.notificationTimeout = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initTooltips();
        this.initInputMasks();
        this.initAutoResizeTextareas();
        this.setupGlobalStyles();
    }

    setupEventListeners() {
        // Tooltips dinâmicos
        document.addEventListener('mouseover', (e) => {
            const target = e.target.closest('[data-tooltip]');
            if (target) {
                this.showTooltip(target, target.dataset.tooltip);
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.closest('[data-tooltip]')) {
                this.hideTooltip();
            }
        });

        // Fechar notificações
        document.addEventListener('click', (e) => {
            if (e.target.closest('.notification-close')) {
                this.hideNotification();
            }
        });
    }

    setupGlobalStyles() {
        if (!document.querySelector('#ui-global-styles')) {
            const styles = document.createElement('style');
            styles.id = 'ui-global-styles';
            styles.textContent = `
                .loading-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(255,255,255,0.9);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    border-radius: inherit;
                }
                
                .loading-spinner {
                    text-align: center;
                }
                
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid #f3f4f6;
                    border-top-color: #3b82f6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 16px;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                .error-message {
                    color: #ef4444;
                    font-size: 0.85rem;
                    margin-top: 4px;
                }
                
                .custom-tooltip {
                    position: fixed;
                    background: #1f2937;
                    color: white;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    z-index: 10001;
                    pointer-events: none;
                    max-width: 250px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                
                .modal {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .modal-content {
                    background: white;
                    padding: 2rem;
                    border-radius: 12px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                }
                
                .progress-bar {
                    width: 100%;
                    height: 8px;
                    background: #f3f4f6;
                    border-radius: 4px;
                    overflow: hidden;
                }
                
                .progress-bar-fill {
                    height: 100%;
                    background: #3b82f6;
                    transition: width 0.3s ease;
                }
                
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(styles);
        }
    }

    // ========== NOTIFICAÇÕES ==========
    showNotification(message, type = 'info', duration = 5000) {
        this.hideNotification();

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };

        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${icons[type] || 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        const styles = {
            success: { bg: '#10b981', icon: '#059669' },
            error: { bg: '#ef4444', icon: '#dc2626' },
            info: { bg: '#3b82f6', icon: '#2563eb' },
            warning: { bg: '#f59e0b', icon: '#d97706' }
        };

        const style = styles[type] || styles.info;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 20px;
            background: ${style.bg};
            color: white;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-width: 300px;
            max-width: 400px;
            animation: slideIn 0.3s ease;
            font-weight: 500;
        `;

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            margin-left: 15px;
            transition: background 0.2s;
        `;

        closeBtn.addEventListener('click', () => this.hideNotification());

        document.body.appendChild(notification);

        this.notificationTimeout = setTimeout(() => {
            this.hideNotification();
        }, duration);
    }

    hideNotification() {
        const notification = document.querySelector('.notification');
        if (notification) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
        if (this.notificationTimeout) {
            clearTimeout(this.notificationTimeout);
            this.notificationTimeout = null;
        }
    }

    // ========== TOOLTIPS ==========
    showTooltip(element, text) {
        this.hideTooltip();

        const tooltip = document.createElement('div');
        tooltip.className = 'custom-tooltip';
        tooltip.textContent = text;

        const rect = element.getBoundingClientRect();
        tooltip.style.cssText = `
            position: fixed;
            background: #1f2937;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.85rem;
            z-index: 10001;
            pointer-events: none;
            max-width: 250px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            left: ${rect.left + (rect.width / 2)}px;
            top: ${rect.top - 10}px;
            transform: translateX(-50%) translateY(-100%);
            white-space: nowrap;
        `;

        tooltip.innerHTML += `
            <div style="
                position: absolute;
                top: 100%;
                left: 50%;
                transform: translateX(-50%);
                border: 5px solid transparent;
                border-top-color: #1f2937;
            "></div>
        `;

        document.body.appendChild(tooltip);
        element._tooltip = tooltip;
    }

    hideTooltip() {
        const tooltip = document.querySelector('.custom-tooltip');
        if (tooltip) tooltip.remove();
    }

    initTooltips() {
        // Inicialização automática de tooltips
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            element.addEventListener('mouseenter', () => {
                this.showTooltip(element, element.dataset.tooltip);
            });
            element.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }

    // ========== LOADING STATES ==========
    showLoading(elementId, message = 'Processando...') {
        const element = document.getElementById(elementId);
        if (!element) return;

        this.hideLoading(elementId);

        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-overlay';
        loadingDiv.id = `${elementId}-loading`;
        loadingDiv.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;

        loadingDiv.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255,255,255,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            border-radius: inherit;
        `;

        const spinner = loadingDiv.querySelector('.spinner');
        spinner.style.cssText = `
            width: 40px;
            height: 40px;
            border: 3px solid #f3f4f6;
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
        `;

        element.style.position = 'relative';
        element.appendChild(loadingDiv);
    }

    hideLoading(elementId) {
        const loading = document.getElementById(`${elementId}-loading`);
        if (loading) loading.remove();
    }

    // ========== FORM VALIDATION ==========
    validateForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return { isValid: false, errors: [] };

        const requiredFields = form.querySelectorAll('[required]');
        const errors = [];

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                errors.push({
                    field: field.id || field.name,
                    message: `O campo "${field.labels[0]?.textContent || field.placeholder}" é obrigatório`
                });
                this.highlightError(field);
            } else {
                this.removeError(field);
            }
        });

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    highlightError(element) {
        if (!element) return;
        
        element.style.borderColor = '#ef4444';
        element.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
        
        let errorMsg = element.parentNode.querySelector('.error-message');
        if (!errorMsg) {
            errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.style.cssText = `
                color: #ef4444;
                font-size: 0.85rem;
                margin-top: 4px;
            `;
            element.parentNode.appendChild(errorMsg);
        }
        errorMsg.textContent = element.validationMessage || 'Este campo é obrigatório';
    }

    removeError(element) {
        if (!element) return;
        
        element.style.borderColor = '';
        element.style.boxShadow = '';
        
        const errorMsg = element.parentNode.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();
    }

    // ========== INPUT MASKS ==========
    initInputMasks() {
        // CPF
        document.querySelectorAll('[data-mask="cpf"]').forEach(input => {
            input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 11) value = value.substring(0, 11);
                
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                
                e.target.value = value;
            });
        });

        // Telefone
        document.querySelectorAll('[data-mask="phone"]').forEach(input => {
            input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 11) value = value.substring(0, 11);
                
                if (value.length <= 10) {
                    value = value.replace(/(\d{2})(\d)/, '($1) $2');
                    value = value.replace(/(\d{4})(\d)/, '$1-$2');
                } else {
                    value = value.replace(/(\d{2})(\d)/, '($1) $2');
                    value = value.replace(/(\d{5})(\d)/, '$1-$2');
                }
                
                e.target.value = value;
            });
        });

        // Data
        document.querySelectorAll('[data-mask="date"]').forEach(input => {
            input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 8) value = value.substring(0, 8);
                
                if (value.length > 4) {
                    value = value.replace(/(\d{2})(\d{2})(\d)/, '$1/$2/$3');
                } else if (value.length > 2) {
                    value = value.replace(/(\d{2})(\d)/, '$1/$2');
                }
                
                e.target.value = value;
            });
        });

        // Dinheiro
        document.querySelectorAll('[data-mask="money"]').forEach(input => {
            input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value === '') {
                    e.target.value = '';
                    return;
                }
                
                value = (parseInt(value) / 100).toFixed(2);
                value = value.replace('.', ',');
                value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                
                e.target.value = `R$ ${value}`;
            });

            input.addEventListener('blur', (e) => {
                if (e.target.value === 'R$ 0,00' || e.target.value === 'R$ ') {
                    e.target.value = '';
                }
            });
        });
    }

    // ========== TEXTAREA AUTO-RESIZE ==========
    initAutoResizeTextareas() {
        document.querySelectorAll('textarea.auto-resize').forEach(textarea => {
            const resize = () => {
                textarea.style.height = 'auto';
                textarea.style.height = (textarea.scrollHeight) + 'px';
            };
            
            textarea.addEventListener('input', resize);
            resize(); // Initial resize
        });
    }

    // ========== MODALS ==========
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.warn(`Modal ${modalId} não encontrado`);
            return;
        }

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        const closeHandler = (e) => {
            if (e.target === modal || e.target.closest('.modal-close')) {
                this.hideModal(modalId);
            }
        };
        
        modal._closeHandler = closeHandler;
        modal.addEventListener('click', closeHandler);

        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.hideModal(modalId);
            }
        };
        
        modal._escHandler = escHandler;
        document.addEventListener('keydown', escHandler);
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            
            if (modal._closeHandler) {
                modal.removeEventListener('click', modal._closeHandler);
            }
            
            if (modal._escHandler) {
                document.removeEventListener('keydown', modal._escHandler);
            }
        }
    }

    // ========== ZOOM CONTROLS ==========
    zoomIn(previewId) {
        const preview = document.getElementById(previewId);
        if (!preview || this.currentZoom >= 200) return;

        this.currentZoom += 10;
        this.applyZoom(preview);
    }

    zoomOut(previewId) {
        const preview = document.getElementById(previewId);
        if (!preview || this.currentZoom <= 50) return;

        this.currentZoom -= 10;
        this.applyZoom(preview);
    }

    resetZoom(previewId) {
        const preview = document.getElementById(previewId);
        if (!preview) return;

        this.currentZoom = 100;
        this.applyZoom(preview);
    }

    applyZoom(element) {
        element.style.transform = `scale(${this.currentZoom / 100})`;
        element.style.transformOrigin = 'top left';
        
        const container = element.parentElement;
        if (container) {
            const originalHeight = element.scrollHeight;
            container.style.height = `${originalHeight * (this.currentZoom / 100)}px`;
        }
    }

    // ========== FILE HANDLING ==========
    downloadFile(content, filename, type = 'text/plain') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('Texto copiado para a área de transferência!', 'success');
            return true;
        } catch (err) {
            console.error('Erro ao copiar:', err);
            
            // Fallback
            try {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                this.showNotification('Texto copiado para a área de transferência!', 'success');
                return true;
            } catch (fallbackErr) {
                this.showNotification('Erro ao copiar texto. Tente selecionar e copiar manualmente (Ctrl+C).', 'error');
                return false;
            }
        }
    }

    // ========== PROGRESS BARS ==========
    showProgress(progressId, value, max = 100) {
        const progress = document.getElementById(progressId);
        if (!progress) return;

        const percentage = (value / max) * 100;
        progress.style.width = `${percentage}%`;
        progress.setAttribute('aria-valuenow', value);
        
        const label = progress.querySelector('.progress-label');
        if (label) {
            label.textContent = `${Math.round(percentage)}%`;
        }
    }

    // ========== ANIMATIONS ==========
    animateValue(elementId, start, end, duration = 1000) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const startTime = performance.now();
        const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.floor(start + (end - start) * progress);
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };
        
        requestAnimationFrame(step);
    }

    // ========== RESPONSIVE HELPERS ==========
    isMobile() {
        return window.innerWidth <= 768;
    }

    isTablet() {
        return window.innerWidth > 768 && window.innerWidth <= 1024;
    }

    isDesktop() {
        return window.innerWidth > 1024;
    }

    // ========== ACCESSIBILITY ==========
    setFocus(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.focus();
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.cssText = `
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        `;
        announcement.textContent = message;
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            announcement.remove();
        }, 1000);
    }
}

// Adicionar ao ui.js
validateAdvanced(formId) {
    const form = document.getElementById(formId);
    const errors = [];
    
    // Validar datas
    const dateFields = form.querySelectorAll('input[type="date"]');
    dateFields.forEach(field => {
        if (field.value) {
            const date = new Date(field.value);
            const today = new Date();
            today.setHours(0,0,0,0);
            
            if (date < today) {
                errors.push(`A data "${field.labels[0]?.textContent}" não pode ser no passado`);
                this.highlightError(field);
            }
        }
    });
    
    // Validar emails
    const emailFields = form.querySelectorAll('input[type="email"]');
    emailFields.forEach(field => {
        if (field.value && !this.isValidEmail(field.value)) {
            errors.push(`Email inválido: ${field.value}`);
            this.highlightError(field);
        }
    });
    
    // Validar CPF (se houver)
    const cpfFields = form.querySelectorAll('[data-mask="cpf"]');
    cpfFields.forEach(field => {
        if (field.value && !this.isValidCPF(field.value)) {
            errors.push('CPF inválido');
            this.highlightError(field);
        }
    });
    
    return { isValid: errors.length === 0, errors };
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.uiHelper = new UIHelper();
});

// Exportar para uso global
window.UIHelper = UIHelper;