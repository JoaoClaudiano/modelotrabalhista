// Main Application Script for ModeloTrabalhista
class ModeloTrabalhistaApp {
    constructor() {
        this.currentModel = 'demissao';
        this.ui = window.uiHelper || new UIHelper();
        this.generator = window.DocumentGenerator ? new DocumentGenerator() : null;
        this.storage = window.StorageManager ? new StorageManager() : null;
        this.analytics = window.analytics || null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setCurrentDate();
        this.setupMobileMenu();
        this.setupFAQ();
        this.setupSmoothScroll();
        this.loadDraft();
        this.trackPageView();
    }

    setupEventListeners() {
        // Model selection
        document.querySelectorAll('.model-select-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const model = e.target.dataset.model;
                this.selectModel(model);
                document.getElementById('gerador').scrollIntoView({ behavior: 'smooth' });
            });
        });

        // Document type change
        document.getElementById('documentType').addEventListener('change', (e) => {
            this.currentModel = e.target.value;
            this.updateDynamicFields();
            this.updateSelectedCard();
            this.saveDraft();
        });

        // Generate document
        document.getElementById('generateBtn').addEventListener('click', () => {
            this.generateDocument();
        });

        // Load example
        document.getElementById('loadExampleBtn').addEventListener('click', () => {
            this.loadExampleData();
        });

        // Clear form
        document.getElementById('clearBtn').addEventListener('click', () => {
            if (this.ui.showModal) {
                this.ui.showModal('confirmClearModal');
            } else {
                this.clearForm();
            }
        });

        // Auto-save on input
        const form = document.getElementById('documentForm');
        let saveTimeout;
        form.addEventListener('input', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                this.saveDraft();
            }, 1500);
        });

        // Preview controls
        document.getElementById('zoomInBtn').addEventListener('click', () => {
            this.ui.zoomIn('documentPreview');
        });
        document.getElementById('zoomOutBtn').addEventListener('click', () => {
            this.ui.zoomOut('documentPreview');
        });
        document.getElementById('resetZoomBtn').addEventListener('click', () => {
            this.ui.resetZoom('documentPreview');
        });

        // Action buttons
        document.getElementById('printBtn').addEventListener('click', () => this.printDocument());
        document.getElementById('pdfBtn').addEventListener('click', () => this.saveAsPDF());
        document.getElementById('copyBtn').addEventListener('click', () => this.copyToClipboard());

        // Footer model links
        document.querySelectorAll('footer a[data-model]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const model = e.target.dataset.model;
                this.selectModel(model);
                document.getElementById('gerador').scrollIntoView({ behavior: 'smooth' });
            });
        });

        // Confirm clear modal
        document.getElementById('confirmClearBtn')?.addEventListener('click', () => {
            this.clearForm();
            this.ui.hideModal('confirmClearModal');
        });

        document.getElementById('cancelClearBtn')?.addEventListener('click', () => {
            this.ui.hideModal('confirmClearModal');
        });

        // Export history button
        document.getElementById('exportHistoryBtn')?.addEventListener('click', () => {
            this.exportHistory();
        });

        // Import history button
        document.getElementById('importHistoryBtn')?.addEventListener('click', () => {
            document.getElementById('historyFileInput')?.click();
        });

        document.getElementById('historyFileInput')?.addEventListener('change', (e) => {
            this.importHistory(e.target.files[0]);
        });
    }

    selectModel(model) {
        this.currentModel = model;
        document.getElementById('documentType').value = model;
        this.updateDynamicFields();
        this.updateSelectedCard();
        this.saveDraft();
        
        if (this.analytics) {
            this.analytics.trackModelSelected(model);
        }
    }

    updateSelectedCard() {
        document.querySelectorAll('.model-card').forEach(card => {
            card.classList.remove('selected');
        });

        const selectedCard = document.querySelector(`.model-card[data-model="${this.currentModel}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
    }

    updateDynamicFields() {
        const container = document.getElementById('dynamicFields');
        let html = '';

        switch (this.currentModel) {
            case 'ferias':
                html = `
                    <div class="form-group">
                        <label for="vacationPeriod" data-tooltip="Informe o período desejado para as férias">
                            <i class="fas fa-calendar-check"></i> Período de Férias *
                        </label>
                        <input type="text" id="vacationPeriod" class="form-control" 
                               placeholder="Ex: 01/12/2023 a 31/12/2023" required>
                    </div>
                    <div class="form-group">
                        <label for="vacationDays">
                            <i class="fas fa-sun"></i> Quantidade de Dias
                        </label>
                        <input type="number" id="vacationDays" class="form-control" 
                               placeholder="30" min="1" max="30">
                    </div>
                `;
                break;

            case 'advertencia':
                html = `
                    <div class="form-group">
                        <label for="warningReason" data-tooltip="Descreva detalhadamente o motivo da advertência">
                            <i class="fas fa-exclamation-circle"></i> Motivo da Advertência *
                        </label>
                        <textarea id="warningReason" class="form-control auto-resize" rows="4"
                                  placeholder="Descreva detalhadamente o motivo da advertência..." required></textarea>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="incidentDate">
                                <i class="fas fa-calendar-times"></i> Data da Ocorrência
                            </label>
                            <input type="date" id="incidentDate" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="severity">
                                <i class="fas fa-balance-scale"></i> Gravidade
                            </label>
                            <select id="severity" class="form-control">
                                <option value="leve">Leve</option>
                                <option value="media" selected>Média</option>
                                <option value="grave">Grave</option>
                            </select>
                        </div>
                    </div>
                `;
                break;

            case 'atestado':
                html = `
                    <div class="form-group">
                        <label for="certificateReason" data-tooltip="Informe o motivo da ausência">
                            <i class="fas fa-stethoscope"></i> Motivo do Atestado *
                        </label>
                        <textarea id="certificateReason" class="form-control auto-resize" rows="3"
                                  placeholder="Informe o motivo da ausência..." required></textarea>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="certificateStart">
                                <i class="fas fa-calendar-day"></i> Data de Início
                            </label>
                            <input type="date" id="certificateStart" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="certificateEnd">
                                <i class="fas fa-calendar-day"></i> Data de Término
                            </label>
                            <input type="date" id="certificateEnd" class="form-control">
                        </div>
                    </div>
                `;
                break;

            case 'rescisao':
                html = `
                    <div class="form-group">
                        <label for="severanceValue">
                            <i class="fas fa-money-bill-wave"></i> Valor da Rescisão (R$)
                        </label>
                        <input type="number" id="severanceValue" class="form-control" 
                               placeholder="Ex: 5000.00" step="0.01" min="0" data-mask="money">
                    </div>
                    <div class="form-group">
                        <label for="paymentDate">
                            <i class="fas fa-calendar-alt"></i> Data para Pagamento
                        </label>
                        <input type="date" id="paymentDate" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="additionalConditions">
                            <i class="fas fa-clipboard-list"></i> Condições Adicionais
                        </label>
                        <textarea id="additionalConditions" class="form-control auto-resize" rows="3"
                                  placeholder="Informe condições adicionais do acordo..."></textarea>
                    </div>
                `;
                break;

            case 'reuniao':
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);

                html = `
                    <div class="form-row">
                        <div class="form-group">
                            <label for="meetingDate">
                                <i class="fas fa-calendar"></i> Data da Reunião
                            </label>
                            <input type="date" id="meetingDate" class="form-control" 
                                   value="${tomorrow.toISOString().split('T')[0]}">
                        </div>
                        <div class="form-group">
                            <label for="meetingTime">
                                <i class="fas fa-clock"></i> Hora da Reunião
                            </label>
                            <input type="time" id="meetingTime" class="form-control" value="14:00">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="meetingLocation">
                            <i class="fas fa-map-marker-alt"></i> Local da Reunião
                        </label>
                        <input type="text" id="meetingLocation" class="form-control" 
                               placeholder="Ex: Sala de Reuniões 1">
                    </div>
                    <div class="form-group">
                        <label for="meetingAgenda" data-tooltip="Liste os tópicos que serão discutidos">
                            <i class="fas fa-list-alt"></i> Pauta da Reunião
                        </label>
                        <textarea id="meetingAgenda" class="form-control auto-resize" rows="4"
                                  placeholder="Liste os tópicos que serão discutidos..."></textarea>
                    </div>
                `;
                break;

            case 'demissao':
            default:
                const nextMonth = new Date();
                nextMonth.setMonth(nextMonth.getMonth() + 1);

                html = `
                    <div class="form-group">
                        <label for="effectiveDate">
                            <i class="fas fa-calendar-check"></i> Data Efetiva da Demissão
                        </label>
                        <input type="date" id="effectiveDate" class="form-control" 
                               value="${nextMonth.toISOString().split('T')[0]}">
                        <small class="form-text">Data em que deseja efetivamente se desligar</small>
                    </div>
                    <div class="form-group">
                        <label for="noticePeriod">
                            <i class="fas fa-bell"></i> Aviso Prévio
                        </label>
                        <select id="noticePeriod" class="form-control">
                            <option value="trabalhado">Trabalhado</option>
                            <option value="indenizado">Indenizado</option>
                            <option value="dispensado">Dispensado pelo empregador</option>
                        </select>
                    </div>
                `;
        }

        container.innerHTML = html;
        
        // Initialize UI components for new fields
        this.ui.initInputMasks();
        this.ui.initAutoResizeTextareas();
    }

    generateDocument() {
        if (!this.validateForm()) {
            this.ui.showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }

        const data = this.collectFormData();
        const documentContent = this.generateDocumentContent(data);
        
        this.displayDocument(documentContent);
        this.enableActionButtons(true);
        this.ui.showNotification('Documento gerado com sucesso!', 'success');
        
        // Save to history
        if (this.storage) {
            this.storage.addToHistory({
                model: this.currentModel,
                data: data,
                content: documentContent,
                generatedAt: new Date().toISOString()
            });
        }
        
        // Track analytics
        if (this.analytics) {
            this.analytics.trackDocumentGenerated(this.currentModel, data);
        }
    }

    collectFormData() {
        const data = {
            model: this.currentModel,
            companyName: document.getElementById('companyName').value,
            employeeName: document.getElementById('employeeName').value,
            companyAddress: document.getElementById('companyAddress').value,
            employeePosition: document.getElementById('employeePosition').value,
            documentDate: document.getElementById('documentDate').value,
            documentDateFormatted: this.formatDate(document.getElementById('documentDate').value)
        };

        // Add model-specific fields
        switch (this.currentModel) {
            case 'demissao':
                data.effectiveDate = document.getElementById('effectiveDate')?.value || '';
                data.noticePeriod = document.getElementById('noticePeriod')?.value || 'trabalhado';
                break;
            case 'ferias':
                data.vacationPeriod = document.getElementById('vacationPeriod')?.value || '';
                data.vacationDays = document.getElementById('vacationDays')?.value || '30';
                break;
            case 'advertencia':
                data.warningReason = document.getElementById('warningReason')?.value || '';
                data.incidentDate = document.getElementById('incidentDate')?.value || '';
                data.severity = document.getElementById('severity')?.value || 'media';
                break;
            case 'atestado':
                data.certificateReason = document.getElementById('certificateReason')?.value || '';
                data.certificateStart = document.getElementById('certificateStart')?.value || data.documentDate;
                data.certificateEnd = document.getElementById('certificateEnd')?.value || data.documentDate;
                break;
            case 'rescisao':
                data.severanceValue = document.getElementById('severanceValue')?.value || '';
                data.paymentDate = document.getElementById('paymentDate')?.value || '';
                data.additionalConditions = document.getElementById('additionalConditions')?.value || '';
                break;
            case 'reuniao':
                data.meetingDate = document.getElementById('meetingDate')?.value || '';
                data.meetingTime = document.getElementById('meetingTime')?.value || '';
                data.meetingLocation = document.getElementById('meetingLocation')?.value || '';
                data.meetingAgenda = document.getElementById('meetingAgenda')?.value || '';
                break;
        }

        return data;
    }

    generateDocumentContent(data) {
        if (this.generator) {
            return this.generator.generateDocument(data);
        }
        
        // Fallback to built-in generator
        const generators = {
            demissao: this.generateResignationLetter,
            ferias: this.generateVacationRequest,
            advertencia: this.generateWarningLetter,
            atestado: this.generateCertificate,
            rescisao: this.generateSeveranceAgreement,
            reuniao: this.generateMeetingConvocation
        };

        const generator = generators[this.currentModel] || this.generateResignationLetter;
        return generator.call(this, data);
    }

    generateResignationLetter(data) {
        const effectiveDate = data.effectiveDate ? this.formatDate(data.effectiveDate) : '(a definir)';
        const noticePeriodText = this.getNoticePeriodText(data.noticePeriod);

        return `
${data.companyName.toUpperCase()}
${data.companyAddress}

================================================================================
                               PEDIDO DE DEMISSÃO
================================================================================

Eu, ${data.employeeName}, brasileiro(a), portador(a) do CPF (informar número) 
e Carteira de Trabalho (informar número), na função de ${data.employeePosition}, 
venho por meio deste comunicar minha decisão de pedir demissão do cargo que 
ocupo nesta empresa.

Solicito que sejam calculados todos os meus direitos trabalhistas, incluindo:
- Saldo de salário
- Férias proporcionais
- 13º salário proporcional
- ${noticePeriodText}
- Multa de 40% do FGTS (se aplicável)

Data efetiva do desligamento: ${effectiveDate}

Declaro que estou ciente das implicações legais deste pedido e que estarei 
disponível para os procedimentos de desligamento conforme estabelecido pela 
legislação trabalhista e normas internas da empresa.

================================================================================

Data: ${data.documentDateFormatted}

__________________________________________
Assinatura do Funcionário

================================================================================

Recebido por: __________________________________________
Cargo: _________________________________________________
Data: ____/____/______
`;
    }

    generateVacationRequest(data) {
        const period = data.vacationPeriod || '(período a ser definido)';
        const days = data.vacationDays || '30';

        return `
${data.companyName.toUpperCase()}
${data.companyAddress}

================================================================================
                           SOLICITAÇÃO DE FÉRIAS
================================================================================

Eu, ${data.employeeName}, funcionário(a) desta empresa no cargo de 
${data.employeePosition}, venho por meio deste solicitar o gozo de minhas 
férias referentes ao período aquisitivo vigente.

Solicito que as férias sejam concedidas no seguinte período: ${period}
Quantidade de dias: ${days} dias

Declaro estar ciente de que, conforme legislação trabalhista:
1. As férias devem ser concedidas em até 12 meses após o período aquisitivo
2. Receberei o valor correspondente com o adicional de 1/3 constitucional
3. O período de férias pode ser dividido conforme acordo entre as partes

================================================================================

Data: ${data.documentDateFormatted}

__________________________________________
Assinatura do Funcionário

================================================================================

Parecer do Departamento Pessoal: __________________________________________
Data de Agendamento: ____/____/______
`;
    }

    getNoticePeriodText(type) {
        const texts = {
            trabalhado: 'Aviso prévio trabalhado',
            indenizado: 'Aviso prévio indenizado',
            dispensado: 'Aviso prévio dispensado pelo empregador'
        };
        return texts[type] || 'Aviso prévio (conforme acordo)';
    }

    displayDocument(content) {
        const preview = document.getElementById('documentPreview');
        preview.innerHTML = `<div class="document-content">${content}</div>`;
        preview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    validateForm() {
        const requiredFields = ['companyName', 'employeeName', 'documentDate'];
        
        for (const fieldId of requiredFields) {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                this.ui.highlightError(field);
                return false;
            }
            this.ui.removeError(field);
        }

        // Validate model-specific required fields
        switch (this.currentModel) {
            case 'ferias':
                const periodField = document.getElementById('vacationPeriod');
                if (periodField && !periodField.value.trim()) {
                    this.ui.highlightError(periodField);
                    return false;
                }
                break;
            case 'advertencia':
                const reasonField = document.getElementById('warningReason');
                if (reasonField && !reasonField.value.trim()) {
                    this.ui.highlightError(reasonField);
                    return false;
                }
                break;
            case 'atestado':
                const certReasonField = document.getElementById('certificateReason');
                if (certReasonField && !certReasonField.value.trim()) {
                    this.ui.highlightError(certReasonField);
                    return false;
                }
                break;
        }

        return true;
    }

    loadExampleData() {
        const examples = {
            companyName: 'Tech Solutions Ltda',
            companyAddress: 'Av. Paulista, 1000 - São Paulo/SP',
            employeeName: 'João da Silva',
            employeePosition: 'Analista de Sistemas',
            vacationPeriod: '01/12/2023 a 31/12/2023',
            vacationDays: '30',
            warningReason: 'Atrasos recorrentes no horário de entrada durante o mês de outubro.',
            certificateReason: 'Consulta médica agendada com urgência.',
            severanceValue: '5000.00',
            meetingLocation: 'Sala de Reuniões Principal',
            meetingAgenda: '1. Abertura e boas-vindas\n2. Apresentação dos resultados do trimestre\n3. Discussão sobre novas metas\n4. Feedbacks da equipe\n5. Encerramento'
        };

        // Fill basic fields
        Object.keys(examples).forEach(key => {
            const element = document.getElementById(key);
            if (element) element.value = examples[key];
        });

        // Set dates
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        document.getElementById('documentDate').value = today.toISOString().split('T')[0];
        
        if (document.getElementById('effectiveDate')) {
            document.getElementById('effectiveDate').value = nextMonth.toISOString().split('T')[0];
        }
        
        if (document.getElementById('incidentDate')) {
            document.getElementById('incidentDate').value = today.toISOString().split('T')[0];
        }
        
        if (document.getElementById('certificateStart')) {
            document.getElementById('certificateStart').value = today.toISOString().split('T')[0];
            document.getElementById('certificateEnd').value = today.toISOString().split('T')[0];
        }
        
        if (document.getElementById('paymentDate')) {
            const paymentDate = new Date(today);
            paymentDate.setDate(paymentDate.getDate() + 7);
            document.getElementById('paymentDate').value = paymentDate.toISOString().split('T')[0];
        }
        
        if (document.getElementById('meetingDate')) {
            document.getElementById('meetingDate').value = tomorrow.toISOString().split('T')[0];
        }

        this.ui.showNotification('Dados de exemplo carregados com sucesso!', 'success');
        
        if (this.analytics) {
            this.analytics.trackEvent('example_loaded', { model: this.currentModel });
        }
    }

    clearForm() {
        document.getElementById('documentForm').reset();
        this.setCurrentDate();
        
        const preview = document.getElementById('documentPreview');
        preview.innerHTML = `
            <div class="empty-preview">
                <i class="fas fa-file-alt"></i>
                <h4>Seu documento aparecerá aqui</h4>
                <p>Preencha o formulário ao lado e clique em "Gerar Documento"</p>
            </div>
        `;
        
        this.enableActionButtons(false);
        this.ui.resetZoom('documentPreview');
        
        document.querySelectorAll('.model-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Clear draft
        if (this.storage) {
            this.storage.clearDraft(this.currentModel);
        }
        
        this.ui.showNotification('Formulário limpo com sucesso!', 'info');
    }

    saveDraft() {
        if (!this.storage) return;
        
        const data = this.collectFormData();
        this.storage.saveDraft(this.currentModel, data);
        
        // Show autosave notification (only first time)
        if (!localStorage.getItem('modelotrabalhista_autosave_notified')) {
            this.ui.showNotification('Rascunho salvo automaticamente', 'info', 2000);
            localStorage.setItem('modelotrabalhista_autosave_notified', 'true');
        }
    }

    loadDraft() {
        if (!this.storage) return;
        
        const draft = this.storage.loadDraft(this.currentModel);
        if (draft && draft.data) {
            // Fill form fields with draft data
            Object.keys(draft.data).forEach(key => {
                const element = document.getElementById(key);
                if (element && draft.data[key]) {
                    element.value = draft.data[key];
                }
            });
        }
    }

    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('documentDate').value = today;
    }

    printDocument() {
        const content = document.querySelector('#documentPreview .document-content')?.innerHTML;
        if (!content) return;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>ModeloTrabalhista - Documento Gerado</title>
                <style>
                    body { 
                        font-family: 'Courier New', monospace; 
                        line-height: 1.6; 
                        margin: 2cm; 
                        font-size: 12pt;
                    }
                    @media print {
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div>${content}</div>
                <div class="footer no-print">
                    <hr>
                    <p><small>Gerado por ModeloTrabalhista - ${new Date().toLocaleDateString('pt-BR')}</small></p>
                    <button onclick="window.print()" class="no-print">Imprimir</button>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        
        if (this.analytics) {
            this.analytics.trackEvent('document_printed', { model: this.currentModel });
        }
    }

    saveAsPDF() {
        this.ui.showNotification('Para salvar como PDF, use a opção "Salvar como PDF" na janela de impressão.', 'info');
        this.printDocument();
    }

    async copyToClipboard() {
        const content = document.querySelector('#documentPreview .document-content')?.textContent;
        if (!content) return;

        const success = await this.ui.copyToClipboard(content);
        if (success && this.analytics) {
            this.analytics.trackEvent('document_copied', { model: this.currentModel });
        }
    }

    enableActionButtons(enabled) {
        const buttons = ['printBtn', 'pdfBtn', 'copyBtn'];
        buttons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) btn.disabled = !enabled;
        });
    }

    setupMobileMenu() {
        const menuBtn = document.querySelector('.mobile-menu-btn');
        const nav = document.querySelector('.main-nav ul');

        if (menuBtn && nav) {
            menuBtn.addEventListener('click', () => {
                nav.classList.toggle('active');
                menuBtn.innerHTML = nav.classList.contains('active') 
                    ? '<i class="fas fa-times"></i>' 
                    : '<i class="fas fa-bars"></i>';
            });

            document.addEventListener('click', (e) => {
                if (!nav.contains(e.target) && !menuBtn.contains(e.target)) {
                    nav.classList.remove('active');
                    menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                }
            });

            nav.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    nav.classList.remove('active');
                    menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                });
            });
        }
    }

    setupFAQ() {
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', () => {
                const answer = question.nextElementSibling;
                const icon = question.querySelector('i');
                
                answer.classList.toggle('active');
                icon.style.transform = answer.classList.contains('active') 
                    ? 'rotate(180deg)' 
                    : 'rotate(0deg)';
                
                document.querySelectorAll('.faq-answer').forEach(otherAnswer => {
                    if (otherAnswer !== answer) {
                        otherAnswer.classList.remove('active');
                        otherAnswer.previousElementSibling.querySelector('i').style.transform = 'rotate(0deg)';
                    }
                });
            });
        });
    }

    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    exportHistory() {
        if (!this.storage) return;
        
        const history = this.storage.getHistory();
        const exportData = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            documents: history
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `modelotrabalhista_history_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.ui.showNotification('Histórico exportado com sucesso!', 'success');
    }

    async importHistory(file) {
        if (!file || !this.storage) return;
        
        try {
            const text = await file.text();
            const importData = JSON.parse(text);
            
            if (importData.documents && Array.isArray(importData.documents)) {
                importData.documents.forEach(doc => {
                    this.storage.addToHistory(doc);
                });
                
                this.ui.showNotification(`${importData.documents.length} documentos importados com sucesso!`, 'success');
            } else {
                throw new Error('Formato de arquivo inválido');
            }
        } catch (error) {
            this.ui.showNotification('Erro ao importar histórico: ' + error.message, 'error');
        }
    }

    trackPageView() {
        if (this.analytics) {
            this.analytics.trackPageView();
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ModeloTrabalhistaApp();
});