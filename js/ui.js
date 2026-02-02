// ui.js - Gerenciamento de interface e interações do usuário

class UIHelper {
    constructor() {
        this.currentZoom = 100;
        this.notificationTimeout = null;
        this.loadingTimeouts = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initTooltips();
        this.initInputMasks();
        this.initAutoResizeTextareas();
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

        // Fechar notificações ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.notification') && !e.target.closest('.notification-close')) {
                this.hideNotification();
            }
        });

        // Fechar menus dropdown ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                document.querySelectorAll('.dropdown-content.show').forEach(dropdown => {
                    dropdown.classList.remove('show');
                });
            }
        });
    }

    // ========== NOTIFICAÇÕES ==========
    showNotification(message, type = 'info', duration = 5000) {
        // Remover notificação existente
        this.hideNotification();

        // Criar notificação
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Ícone baseado no tipo
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

        // Estilos dinâmicos
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

        // Botão de fechar
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
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = 'rgba(255,255,255,0.3)';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'rgba(255,255,255,0.2)';
        });

        // Adicionar ao DOM
        document.body.appendChild(notification);

        // Auto remoção
        this.notificationTimeout = setTimeout(() => {
            this.hideNotification();
        }, duration);

        // Animar entrada
        notification.style.animation = 'slideIn 0.3s ease';

        // Adicionar estilos de animação se não existirem
        if (!document.querySelector('#notification-styles')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'notification-styles';
            styleEl.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(styleEl);
        }
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
        // Remover tooltip existente
        this.hideTooltip();

        // Criar tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'custom-tooltip';
        tooltip.textContent = text;

        // Posicionar
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

        // Seta do tooltip
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

        // Adicionar ao DOM
        document.body.appendChild(tooltip);
        element._tooltip = tooltip;
    }

    hideTooltip() {
        const tooltip = document.querySelector('.custom-tooltip');
        if (tooltip) tooltip.remove();
    }

    // ========== LOADING STATES ==========
    showLoading(elementId, message = 'Processando...') {
        const element = document.getElementById(elementId);
        if (!element) return;

        // Remover loading anterior
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

        // Estilos
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

        // Adicionar estilos de animação se não existirem
        if (!document.querySelector('#loading-styles')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'loading-styles';
            styleEl.textContent = `
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(styleEl);
        }
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

        // Validações específicas
        const emailFields = form.querySelectorAll('input[type="email"]');
        emailFields.forEach(field => {
            if (field.value && !this.isValidEmail(field.value)) {
                errors.push({
                    field: field.id,
                    message: 'Email inválido'
                });
                this.highlightError(field);
            }
        });

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    highlightError(element) {
        element.style.borderColor = '#ef4444';
        element.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
        
        // Adicionar mensagem de erro
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
        errorMsg.textContent = 'Este campo é obrigatório';
    }

    removeError(element) {
        element.style.borderColor = '';
        element.style.boxShadow = '';
        
        const errorMsg = element.parentNode.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();
    }

    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
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
                value = (parseInt(value) / 100).toFixed(2);
                value = value.replace('.', ',');
                value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                
                if (value === '0,00') {
                    e.target.value = '';
                } else {
                    e.target.value = `R$ ${value}`;
                }
            });

            input.addEventListener('blur', (e) => {
                if (e.target.value === 'R$ ') {
                    e.target.value = '';
                }
            });
        });
    }

    // ========== TEXTAREA AUTO-RESIZE ==========
    initAutoResizeTextareas() {
        document.querySelectorAll('textarea.auto-resize').forEach(textarea => {
            textarea.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = (this.scrollHeight) + 'px';
            });
            
            // Trigger inicial
            textarea.dispatchEvent(new Event('input'));
        });
    }

    // ========== MODALS ==========
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Fechar ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideModal(modalId);
            }
        });

        // Fechar com ESC
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.hideModal(modalId);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    // ========== DROPDOWNS ==========
    toggleDropdown(dropdownId) {
        const dropdown = document.getElementById(dropdownId);
        if (!dropdown) return;

        dropdown.classList.toggle('show');
        
        // Fechar outros dropdowns
        document.querySelectorAll('.dropdown-content').forEach(other => {
            if (other !== dropdown && other.classList.contains('show')) {
                other.classList.remove('show');
            }
        });
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
        
        // Ajustar container para o zoom
        const container = element.parentElement;
        if (container) {
            container.style.height = `${element.scrollHeight * (this.currentZoom / 100)}px`;
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
            
            // Fallback para navegadores antigos
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

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.uiHelper = new UIHelper();
    
    // Adicionar estilos globais
    const styles = document.createElement('style');
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
        
        .dropdown-content {
            display: none;
            position: absolute;
            background: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border-radius: 8px;
            z-index: 1000;
            min-width: 200px;
        }
        
        .dropdown-content.show {
            display: block;
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
    `;
    document.head.appendChild(styles);
});

// Exportar para uso global
window.UIHelper = UIHelper;