// tour.js - Novo arquivo
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
    }
    
    start() {
        if (localStorage.getItem('modelotrabalhista_tour_completed')) {
            return;
        }
        
        this.currentStep = 0;
        this.showStep(0);
    }
    
    showStep(index) {
        const step = this.steps[index];
        const element = document.querySelector(step.element);
        
        if (!element) {
            this.next();
            return;
        }
        
        // Criar overlay e tooltip
        this.createOverlay(element);
        this.createTooltip(element, step);
    }
    
    createTooltip(element, step) {
        // Implementar tooltip guiado
    }
    
    complete() {
        localStorage.setItem('modelotrabalhista_tour_completed', 'true');
    }
}