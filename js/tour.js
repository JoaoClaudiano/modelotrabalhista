// tour.js - Sistema de tour guiado para ModeloTrabalhista
class AppTour {
    constructor() {
        this.steps = [
            {
                element: '.model-cards',
                title: 'Selecione um Modelo',
                content: 'Escolha entre os 6 tipos de documentos trabalhistas disponíveis',
                position: 'bottom'
            },
            {
                element: '#documentForm',
                title: 'Preencha os Dados',
                content: 'Insira as informações necessárias para gerar seu documento',
                position: 'right'
            },
            {
                element: '#generateBtn',
                title: 'Gere o Documento',
                content: 'Clique aqui para criar seu documento com base nos dados fornecidos',
                position: 'top'
            },
            {
                element: '#documentPreview',
                title: 'Visualize e Edite',
                content: 'Seu documento aparecerá aqui. Você pode copiar, imprimir ou salvar como PDF',
                position: 'left'
            }
        ];
        
        this.currentStep = 0;
        this.isActive = false;
        this.overlay = null;
        this.tooltip = null;
        this.skipButton = null;
        this.nextButton = null;
        this.prevButton = null;
        this.autoCloseTimer = null;
        
        this.init();
    }
    
    init() {
        // Verificar se já completou o tour
        if (localStorage.getItem('modelotrabalhista_tour_completed')) {
            return;
        }
        
        // Aguardar um pouco para iniciar
        setTimeout(() => {
            this.showWelcomeModal();
        }, 1000);
    }
    
    showWelcomeModal() {
        const modalHTML = `
            <div class="tour-welcome-modal">
                <div class="tour-modal-content">
                    <h3>👋 Bem-vindo ao ModeloTrabalhista!</h3>
                    <p>Quer aprender a usar todas as funcionalidades do sistema?</p>
                    <p>Vamos fazer um tour rápido para mostrar como gerar seus documentos trabalhistas.</p>
                    <div class="tour-modal-actions">
                        <button class="tour-btn tour-btn-primary" id="startTourBtn">
                            <i class="fas fa-play-circle"></i> Iniciar Tour
                        </button>
                        <button class="tour-btn tour-btn-secondary" id="skipTourBtn">
                            <i class="fas fa-times"></i> Pular Tour
                        </button>
                    </div>
                    <div class="tour-modal-footer">
                        <label>
                            <input type="checkbox" id="dontShowAgain"> Não mostrar novamente
                        </label>
                    </div>
                </div>
            </div>
        `;
        
        // Adicionar estilos
        this.addTourStyles();
        
        // Adicionar modal ao corpo
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer.firstElementChild);
        
        // Event listeners
        document.getElementById('startTourBtn').addEventListener('click', () => {
            this.clearAutoCloseTimer();
            this.start();
            this.hideWelcomeModal();
        });
        
        document.getElementById('skipTourBtn').addEventListener('click', () => {
            this.clearAutoCloseTimer();
            this.complete();
            this.hideWelcomeModal();
        });
        
        const dontShowCheckbox = document.getElementById('dontShowAgain');
        dontShowCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                localStorage.setItem('modelotrabalhista_tour_disabled', 'true');
            } else {
                localStorage.removeItem('modelotrabalhista_tour_disabled');
            }
        });
        
        // Auto-close após 10 segundos
        this.autoCloseTimer = setTimeout(() => {
            this.hideWelcomeModal();
            // Não marca como completo, apenas fecha o modal
        }, 10000);
    }
    
    hideWelcomeModal() {
        this.clearAutoCloseTimer();
        const modal = document.querySelector('.tour-welcome-modal');
        if (modal) {
            modal.remove();
        }
    }
    
    clearAutoCloseTimer() {
        if (this.autoCloseTimer) {
            clearTimeout(this.autoCloseTimer);
            this.autoCloseTimer = null;
        }
    }
    
    addTourStyles() {
        if (document.getElementById('tour-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'tour-styles';
        styles.textContent = `
            .tour-welcome-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            }
            
            .tour-modal-content {
                background: white;
                padding: 2rem;
                border-radius: 12px;
                max-width: 500px;
                width: 90%;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            
            .tour-modal-content h3 {
                color: #3b82f6;
                margin-bottom: 1rem;
                font-size: 1.5rem;
            }
            
            .tour-modal-content p {
                color: #64748b;
                margin-bottom: 1rem;
                line-height: 1.6;
            }
            
            .tour-modal-actions {
                display: flex;
                gap: 1rem;
                justify-content: center;
                margin: 2rem 0;
            }
            
            .tour-btn {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                transition: all 0.2s;
            }
            
            .tour-btn-primary {
                background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                color: white;
            }
            
            .tour-btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
            }
            
            .tour-btn-secondary {
                background: #f1f5f9;
                color: #64748b;
            }
            
            .tour-btn-secondary:hover {
                background: #e2e8f0;
            }
            
            .tour-modal-footer {
                margin-top: 1rem;
                padding-top: 1rem;
                border-top: 1px solid #e2e8f0;
                font-size: 0.9rem;
                color: #94a3b8;
            }
            
            .tour-modal-footer label {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                cursor: pointer;
            }
            
            .tour-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                z-index: 9998;
                animation: fadeIn 0.3s ease;
            }
            
            .tour-tooltip {
                position: fixed;
                background: white;
                border-radius: 12px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                z-index: 9999;
                max-width: 350px;
                min-width: 300px;
                animation: slideIn 0.3s ease;
            }
            
            .tour-tooltip-header {
                padding: 1.5rem 1.5rem 0.5rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .tour-tooltip-title {
                font-weight: 600;
                color: #1e293b;
                font-size: 1.1rem;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .tour-tooltip-close {
                background: none;
                border: none;
                color: #94a3b8;
                cursor: pointer;
                font-size: 1.2rem;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background 0.2s;
            }
            
            .tour-tooltip-close:hover {
                background: #f1f5f9;
                color: #64748b;
            }
            
            .tour-tooltip-content {
                padding: 0 1.5rem 1.5rem;
                color: #64748b;
                line-height: 1.6;
            }
            
            .tour-tooltip-footer {
                padding: 1rem 1.5rem;
                background: #f8fafc;
                border-top: 1px solid #e2e8f0;
                border-radius: 0 0 12px 12px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .tour-step-indicator {
                display: flex;
                gap: 0.5rem;
            }
            
            .tour-step-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #cbd5e1;
                transition: background 0.2s;
            }
            
            .tour-step-dot.active {
                background: #3b82f6;
                transform: scale(1.2);
            }
            
            .tour-navigation {
                display: flex;
                gap: 0.5rem;
            }
            
            .tour-btn-sm {
                padding: 0.5rem 1rem;
                font-size: 0.9rem;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideIn {
                from { 
                    opacity: 0;
                    transform: translateY(20px);
                }
                to { 
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .tour-highlight {
                position: relative;
                z-index: 9999 !important;
                box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3) !important;
                border-radius: 8px !important;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
                100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
            }
        `;
        
        document.head.appendChild(styles);
    }
    
    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.currentStep = 0;
        this.showStep(0);
    }
    
    showStep(index) {
        if (index < 0 || index >= this.steps.length) {
            this.complete();
            return;
        }
        
        this.currentStep = index;
        const step = this.steps[index];
        const element = document.querySelector(step.element);
        
        if (!element) {
            this.next();
            return;
        }
        
        // Criar overlay e tooltip
        this.createOverlay();
        this.createTooltip(element, step);
        this.highlightElement(element);
    }
    
    createOverlay() {
        // Remover overlay existente
        if (this.overlay) {
            this.overlay.remove();
        }
        
        // Criar novo overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'tour-overlay';
        document.body.appendChild(this.overlay);
        
        // Fechar tour ao clicar no overlay
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.complete();
            }
        });
    }
    
    createTooltip(element, step) {
        // Remover tooltip existente
        if (this.tooltip) {
            this.tooltip.remove();
        }
        
        // Criar tooltip
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'tour-tooltip';
        
        // Calcular posição
        const rect = element.getBoundingClientRect();
        const positions = {
            top: { top: rect.top - 20, left: rect.left + rect.width / 2, transform: 'translate(-50%, -100%)' },
            bottom: { top: rect.bottom + 20, left: rect.left + rect.width / 2, transform: 'translate(-50%, 0)' },
            left: { top: rect.top + rect.height / 2, left: rect.left - 20, transform: 'translate(-100%, -50%)' },
            right: { top: rect.top + rect.height / 2, left: rect.right + 20, transform: 'translate(0, -50%)' }
        };
        
        const position = positions[step.position] || positions.bottom;
        Object.assign(this.tooltip.style, position);
        
        // Conteúdo do tooltip
        this.tooltip.innerHTML = `
            <div class="tour-tooltip-header">
                <h4 class="tour-tooltip-title">
                    <i class="fas fa-${this.getStepIcon(step.title)}"></i>
                    ${step.title}
                </h4>
                <button class="tour-tooltip-close" aria-label="Fechar tour">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="tour-tooltip-content">
                ${step.content}
            </div>
            <div class="tour-tooltip-footer">
                <div class="tour-step-indicator">
                    ${this.steps.map((_, i) => 
                        `<div class="tour-step-dot ${i === this.currentStep ? 'active' : ''}"></div>`
                    ).join('')}
                </div>
                <div class="tour-navigation">
                    ${this.currentStep > 0 ? 
                        `<button class="tour-btn tour-btn-secondary tour-btn-sm" id="tourPrevBtn">
                            <i class="fas fa-arrow-left"></i> Anterior
                        </button>` : ''
                    }
                    <button class="tour-btn tour-btn-primary tour-btn-sm" id="tourNextBtn">
                        ${this.currentStep === this.steps.length - 1 ? 'Concluir' : 'Próximo'} 
                        <i class="fas fa-${this.currentStep === this.steps.length - 1 ? 'check' : 'arrow-right'}"></i>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.tooltip);
        
        // Event listeners
        this.tooltip.querySelector('.tour-tooltip-close').addEventListener('click', () => this.complete());
        
        if (this.currentStep > 0) {
            document.getElementById('tourPrevBtn').addEventListener('click', () => this.prev());
        }
        
        document.getElementById('tourNextBtn').addEventListener('click', () => {
            if (this.currentStep === this.steps.length - 1) {
                this.complete();
            } else {
                this.next();
            }
        });
        
        // Atalhos de teclado
        document.addEventListener('keydown', this.handleKeydown.bind(this));
    }
    
    getStepIcon(title) {
        const icons = {
            'Selecione': 'mouse-pointer',
            'Preencha': 'edit',
            'Gere': 'file-contract',
            'Visualize': 'eye'
        };
        
        for (const [key, icon] of Object.entries(icons)) {
            if (title.includes(key)) {
                return icon;
            }
        }
        
        return 'info-circle';
    }
    
    highlightElement(element) {
        // Remover destaque anterior
        document.querySelectorAll('.tour-highlight').forEach(el => {
            el.classList.remove('tour-highlight');
        });
        
        // Adicionar destaque ao elemento atual
        element.classList.add('tour-highlight');
        
        // Scroll para o elemento
        element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'center'
        });
    }
    
    handleKeydown(e) {
        if (!this.isActive) return;
        
        switch(e.key) {
            case 'Escape':
                e.preventDefault();
                this.complete();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                if (this.currentStep > 0) {
                    this.prev();
                }
                break;
            case 'ArrowRight':
            case 'Enter':
                e.preventDefault();
                if (this.currentStep < this.steps.length - 1) {
                    this.next();
                } else {
                    this.complete();
                }
                break;
        }
    }
    
    next() {
        this.showStep(this.currentStep + 1);
    }
    
    prev() {
        this.showStep(this.currentStep - 1);
    }
    
    complete() {
        this.isActive = false;
        localStorage.setItem('modelotrabalhista_tour_completed', 'true');
        
        // Remover elementos do tour
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
        
        if (this.tooltip) {
            this.tooltip.remove();
            this.tooltip = null;
        }
        
        // Remover destaque
        document.querySelectorAll('.tour-highlight').forEach(el => {
            el.classList.remove('tour-highlight');
        });
        
        // Remover listener de teclado
        document.removeEventListener('keydown', this.handleKeydown);
        
        // Mostrar mensagem de conclusão
        this.showCompletionMessage();
    }
    
    showCompletionMessage() {
        const message = document.createElement('div');
        message.className = 'tour-completion-message';
        message.innerHTML = `
            <div class="tour-completion-content">
                <i class="fas fa-check-circle" style="color: #10b981; font-size: 3rem; margin-bottom: 1rem;"></i>
                <h3>Tour Concluído!</h3>
                <p>Agora você está pronto para criar seus documentos trabalhistas.</p>
                <button class="tour-btn tour-btn-primary" id="tourCloseBtn" style="margin-top: 1rem;">
                    <i class="fas fa-rocket"></i> Começar a Usar
                </button>
            </div>
        `;
        
        // Estilos para mensagem
        message.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;
        
        const content = message.querySelector('.tour-completion-content');
        content.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 12px;
            text-align: center;
            max-width: 400px;
            width: 90%;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(message);
        
        document.getElementById('tourCloseBtn').addEventListener('click', () => {
            message.remove();
        });
        
        // Auto-remover após 5 segundos
        setTimeout(() => {
            if (document.body.contains(message)) {
                message.remove();
            }
        }, 5000);
    }
    
    // Método para reiniciar o tour (para debugging)
    reset() {
        localStorage.removeItem('modelotrabalhista_tour_completed');
        localStorage.removeItem('modelotrabalhista_tour_disabled');
        this.init();
    }
    
    // Método para forçar exibição do tour
    forceStart() {
        localStorage.removeItem('modelotrabalhista_tour_completed');
        this.start();
    }
}

// Exportar para uso global
window.AppTour = AppTour;
