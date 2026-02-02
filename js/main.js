// Main Application Script for ModeloTrabalhista
class ModeloTrabalhistaApp {
    constructor() {
        this.currentModel = 'demissao';
        this.currentZoom = 100;
        
        // Inicializar módulos
        this.ui = window.uiHelper || new UIHelper();
        this.generator = window.DocumentGenerator ? new DocumentGenerator() : null;
        this.storage = window.StorageManager ? new StorageManager() : null;
        this.analytics = window.AnalyticsTracker ? new AnalyticsTracker() : null;
        this.accessibility = window.AcessibilidadeManager ? new AcessibilidadeManager() : null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setCurrentDate();
        this.setupMobileMenu();
        this.setupFAQ();
        this.setupSmoothScroll();
        this.loadDraft();
        this.setupAccessibility();
        this.trackPageView();
    }

    setupEventListeners() {
        // Model selection via cards
        document.querySelectorAll('.model-select-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const model = e.target.dataset.model || e.target.closest('[data-model]').dataset.model;
                this.selectModel(model);
                document.getElementById('gerador').scrollIntoView({ behavior: 'smooth' });
            });
        });

        // Document type change in select
        document.getElementById('documentType').addEventListener('change', (e) => {
            this.currentModel = e.target.value;
            this.updateDynamicFields();
            this.updateSelectedCard();
            this.saveDraft();
        });

        // Generate document button
        document.getElementById('generateBtn').addEventListener('click', () => {
            this.generateDocument();
        });

        // Load example button
        document.getElementById('loadExampleBtn').addEventListener('click', () => {
            this.loadExampleData();
        });

        // Clear form button
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.showClearConfirmation();
        });

        // Auto-save on input (with debounce)
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

        // Confirm clear modal (if exists)
        document.getElementById('confirmClearBtn')?.addEventListener('click', () => {
            this.clearForm();
            this.ui.hideModal('confirmClearModal');
        });

        document.getElementById('cancelClearBtn')?.addEventListener('click', () => {
            this.ui.hideModal('confirmClearModal');
        });

        // History controls (if exists)
        document.getElementById('exportHistoryBtn')?.addEventListener('click', () => {
            this.exportHistory();
        });

        document.getElementById('importHistoryBtn')?.addEventListener('click', () => {
            document.getElementById('historyFileInput')?.click();
        });

        document.getElementById('historyFileInput')?.addEventListener('change', (e) => {
            this.importHistory(e.target.files[0]);
        });

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    selectModel(model) {
        this.currentModel = model;
        document.getElementById('documentType').value = model;
        this.updateDynamicFields();
        this.updateSelectedCard();
        this.saveDraft();
        
        // Track analytics
        if (this.analytics) {
            this.analytics.trackModelSelected(model);
        }
    }

    updateSelectedCard() {
        // Remove selected class from all cards
        document.querySelectorAll('.model-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Add selected class to current model card
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
        if (this.ui.initInputMasks) {
            this.ui.initInputMasks();
        }
        if (this.ui.initAutoResizeTextareas) {
            this.ui.initAutoResizeTextareas();
        }
    }

    generateDocument() {
        if (!this.validateForm()) {
            this.ui.showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }

        // Show loading state
        this.ui.showLoading('generateBtn', 'Gerando documento...');

        setTimeout(() => {
            const data = this.collectFormData();
            const documentContent = this.generateDocumentContent(data);
            
            this.displayDocument(documentContent);
            this.enableActionButtons(true);
            this.ui.hideLoading('generateBtn');
            this.ui.showNotification('Documento gerado com sucesso!', 'success');
            
            // Save to history
            if (this.storage && this.storage.addToHistory) {
                this.storage.addToHistory({
                    model: this.currentModel,
                    data: data,
                    content: documentContent,
                    generatedAt: new Date().toISOString()
                });
            }
            
            // Track analytics
            if (this.analytics && this.analytics.trackDocumentGenerated) {
                this.analytics.trackDocumentGenerated(this.currentModel, data);
            }
        }, 500);
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
        if (this.generator && this.generator.generateDocument) {
            return this.generator.generateDocument(data);
        }
        
        // Fallback to built-in generator methods
        switch (this.currentModel) {
            case 'demissao':
                return this.generateResignationLetter(data);
            case 'ferias':
                return this.generateVacationRequest(data);
            case 'advertencia':
                return this.generateWarningLetter(data);
            case 'atestado':
                return this.generateCertificate(data);
            case 'rescisao':
                return this.generateSeveranceAgreement(data);
            case 'reuniao':
                return this.generateMeetingConvocation(data);
            default:
                return this.generateResignationLetter(data);
        }
    }

    // Built-in generator methods (fallback)
    generateResignationLetter(data) {
        const effectiveDate = data.effectiveDate ? this.formatDate(data.effectiveDate) : '(a definir)';
        const noticePeriodText = this.getNoticePeriodText(data.noticePeriod);

        return `${data.companyName.toUpperCase()}
${data.companyAddress}

${'='.repeat(80)}
                               PEDIDO DE DEMISSÃO
${'='.repeat(80)}

Eu, ${data.employeeName}, brasileiro(a), portador(a) do CPF [INFORME AQUI] 
e Carteira de Trabalho [INFORME AQUI], na função de ${data.employeePosition}, 
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

${'='.repeat(80)}

Data: ${data.documentDateFormatted}

${'_'.repeat(42)}
Assinatura do Funcionário

${'='.repeat(80)}

Recebido por: ${'_'.repeat(42)}
Cargo: ${'_'.repeat(48)}
Data: __/__/______`;
    }

    generateVacationRequest(data) {
        const period = data.vacationPeriod || '(período a ser definido)';
        const days = data.vacationDays || '30';

        return `${data.companyName.toUpperCase()}
${data.companyAddress}

${'='.repeat(80)}
                           SOLICITAÇÃO DE FÉRIAS
${'='.repeat(80)}

Eu, ${data.employeeName}, funcionário(a) desta empresa no cargo de 
${data.employeePosition}, venho por meio deste solicitar o gozo de minhas 
férias referentes ao período aquisitivo vigente.

Solicito que as férias sejam concedidas no seguinte período: ${period}
Quantidade de dias: ${days} dias

Declaro estar ciente de que, conforme legislação trabalhista:
1. As férias devem ser concedidas em até 12 meses após o período aquisitivo
2. Receberei o valor correspondente com o adicional de 1/3 constitucional
3. O período de férias pode ser dividido conforme acordo entre as partes

${'='.repeat(80)}

Data: ${data.documentDateFormatted}

${'_'.repeat(42)}
Assinatura do Funcionário

${'='.repeat(80)}

Parecer do Departamento Pessoal: ${'_'.repeat(42)}
Data de Agendamento: __/__/______`;
    }

    generateWarningLetter(data) {
        const severityText = this.getSeverityText(data.severity);
        const incidentDate = data.incidentDate ? this.formatDate(data.incidentDate) : data.documentDateFormatted;

        return `${data.companyName.toUpperCase()}
${data.companyAddress}

${'='.repeat(80)}
                             ADVERTÊNCIA FORMAL
${'='.repeat(80)}

Para: ${data.employeeName}
Cargo: ${data.employeePosition}
Data da Ocorrência: ${incidentDate}
Data do Documento: ${data.documentDateFormatted}
Gravidade: ${severityText}

${'='.repeat(80)}
                         COMUNICADO DE ADVERTÊNCIA
${'='.repeat(80)}

A direção da empresa vem, por meio deste documento, formalizar uma advertência 
por:

"${data.warningReason || 'Conduta inadequada no ambiente de trabalho.'}"

Esta advertência serve como medida disciplinar e tem como objetivo alertar 
sobre a necessidade de adequação de conduta, conforme estabelecido no 
regulamento interno da empresa e na legislação trabalhista vigente.

Consequências em caso de reincidência:
1. Suspensão temporária
2. Advertência formal gravíssima
3. Dispensa por justa causa

${'='.repeat(80)}

O funcionário está ciente das implicações desta advertência e deverá assinar 
este documento em duas vias, ficando uma com a empresa e outra em seu poder.

${'_'.repeat(42)}
Assinatura do Representante da Empresa
Cargo: ${'_'.repeat(40)}

${'='.repeat(80)}
                            CIÊNCIA DO FUNCIONÁRIO

Declaro ter recebido e compreendido o conteúdo desta advertência.

Data: __/__/______

${'_'.repeat(42)}
Assinatura do Funcionário`;
    }

    generateCertificate(data) {
        const startDate = this.formatDate(data.certificateStart);
        const endDate = this.formatDate(data.certificateEnd);
        const period = startDate === endDate 
            ? `na data de ${startDate}`
            : `no período de ${startDate} a ${endDate}`;

        return `${data.companyName.toUpperCase()}
${data.companyAddress}

${'='.repeat(80)}
                                  ATESTADO
${'='.repeat(80)}

Atesto para os devidos fins que o(a) Sr(a). ${data.employeeName}, 
ocupante do cargo de ${data.employeePosition} nesta empresa, não compareceu 
ao trabalho ${period} devido a:

"${data.certificateReason || 'Assuntos pessoais que impossibilitaram a presença no trabalho.'}"

Este documento serve como justificativa para a ausência e não implica em 
qualquer responsabilidade trabalhista adicional, exceto se estabelecido em 
acordo ou convenção coletiva.

${'='.repeat(80)}

Data: ${data.documentDateFormatted}

${'_'.repeat(42)}
Assinatura do Responsável

Cargo: ${'_'.repeat(42)}`;
    }

    generateSeveranceAgreement(data) {
        const value = data.severanceValue ? `R$ ${parseFloat(data.severanceValue).toFixed(2).replace('.', ',')}` : 'a ser definido';
        const paymentDate = data.paymentDate ? this.formatDate(data.paymentDate) : '(a definir)';
        const conditions = data.additionalConditions ? `6. ${data.additionalConditions}` : '';

        return `${data.companyName.toUpperCase()}
${data.companyAddress}

${'='.repeat(80)}
                       ACORDO DE RESCISÃO CONTRATUAL
${'='.repeat(80)}

Entre ${data.companyName}, com sede em ${data.companyAddress}, doravante 
denominada EMPRESA, e ${data.employeeName}, portador(a) do CPF [INFORME AQUI] 
e Carteira de Trabalho [INFORME AQUI], ocupante do cargo de 
${data.employeePosition}, doravante denominado(a) FUNCIONÁRIO(A), celebra-se 
o presente acordo de rescisão contratual, sob as seguintes condições:

1. As partes, de comum acordo, resolvem o contrato de trabalho vigente.
2. A EMPRESA pagará ao FUNCIONÁRIO(A) a importância de ${value}, 
   correspondente a todos os direitos trabalhistas decorrentes da rescisão.
3. Data para pagamento: ${paymentDate}
4. O FUNCIONÁRIO(A) declara estar ciente de que, com a assinatura deste 
   acordo, renuncia a qualquer ação trabalhista referente ao período 
   contratual.
5. O FUNCIONÁRIO(A) deverá devolver todos os bens da empresa em seu poder 
   até a data do desligamento.
${conditions}

As partes declaram estar cientes do teor deste acordo e assinam-no em duas 
vias de igual teor.

${'='.repeat(80)}

Data: ${data.documentDateFormatted}

${'_'.repeat(42)}
Representante Legal da Empresa
Cargo: ${'_'.repeat(40)}

${'_'.repeat(42)}
${data.employeeName}`;
    }

    generateMeetingConvocation(data) {
        const meetingDate = data.meetingDate ? this.formatDate(data.meetingDate) : '(a definir)';
        const time = data.meetingTime || '(horário a definir)';
        const location = data.meetingLocation || 'Sala de Reuniões';
        const agenda = data.meetingAgenda || 
            '1. Abertura e apresentação dos objetivos\n2. Discussão sobre metas trimestrais\n3. Ajustes de processos internos\n4. Feedbacks e sugestões\n5. Encerramento';

        return `${data.companyName.toUpperCase()}
${data.companyAddress}

${'='.repeat(80)}
                        CONVOCATÓRIA PARA REUNIÃO
${'='.repeat(80)}

Para: Todos os funcionários do departamento
De: ${data.employeeName} - ${data.employeePosition}
Data do Documento: ${data.documentDateFormatted}

${'='.repeat(80)}
                               CONVOCAÇÃO
${'='.repeat(80)}

Convocamos todos os membros do departamento para uma reunião que será 
realizada:

Data: ${meetingDate}
Hora: ${time}
Local: ${location}

Pauta da Reunião:
${agenda}

Solicitamos a confirmação de presença até 24 horas antes da reunião.

${'='.repeat(80)}

Atenciosamente,

${'_'.repeat(42)}
${data.employeeName}
${data.employeePosition}`;
    }

    // Helper methods for built-in generators
    getNoticePeriodText(type) {
        const texts = {
            trabalhado: 'Aviso prévio trabalhado',
            indenizado: 'Aviso prévio indenizado',
            dispensado: 'Aviso prévio dispensado pelo empregador'
        };
        return texts[type] || 'Aviso prévio (conforme acordo)';
    }

    getSeverityText(severity) {
        const texts = {
            leve: 'Leve',
            media: 'Média',
            grave: 'Grave'
        };
        return texts[severity] || 'Média';
    }

    displayDocument(content) {
        const preview = document.getElementById('documentPreview');
        preview.innerHTML = `<div class="document-content" tabindex="0">${content}</div>`;
        preview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Announce to screen readers
        if (this.accessibility && this.accessibility.announceToScreenReader) {
            this.accessibility.announceToScreenReader('Documento gerado com sucesso. Use Tab para navegar no conteúdo.');
        }
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
        
        if (this.analytics && this.analytics.trackEvent) {
            this.analytics.trackEvent('example_loaded', { model: this.currentModel });
        }
    }

    showClearConfirmation() {
        if (this.ui.showModal) {
            this.ui.showModal('confirmClearModal');
        } else {
            if (confirm('Tem certeza que deseja limpar todo o formulário? Todos os dados não salvos serão perdidos.')) {
                this.clearForm();
            }
        }
    }

    clearForm() {
        document.getElementById('documentForm').reset();
        this.setCurrentDate();
        
        const preview = document.getElementById('documentPreview');
        preview.innerHTML = `
            <div class="empty-preview" tabindex="0">
                <i class="fas fa-file-alt" aria-hidden="true"></i>
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
        if (this.storage && this.storage.clearDraft) {
            this.storage.clearDraft(this.currentModel);
        }
        
        this.ui.showNotification('Formulário limpo com sucesso!', 'info');
        
        // Announce to screen readers
        if (this.accessibility && this.accessibility.announceToScreenReader) {
            this.accessibility.announceToScreenReader('Formulário limpo. Todos os campos foram resetados.');
        }
    }

    saveDraft() {
        if (!this.storage || !this.storage.saveDraft) return;
        
        const data = this.collectFormData();
        this.storage.saveDraft(this.currentModel, data);
    }

    loadDraft() {
        if (!this.storage || !this.storage.loadDraft) return;
        
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
        if (!content) {
            this.ui.showNotification('Nenhum documento para imprimir. Gere um documento primeiro.', 'error');
            return;
        }

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>ModeloTrabalhista - Documento Gerado</title>
                <meta charset="UTF-8">
                <style>
                    body { 
                        font-family: 'Courier New', monospace; 
                        line-height: 1.6; 
                        margin: 2cm; 
                        font-size: 12pt;
                    }
                    @media print {
                        .no-print { display: none; }
                        @page { margin: 2cm; }
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
        
        if (this.analytics && this.analytics.trackEvent) {
            this.analytics.trackEvent('document_printed', { model: this.currentModel });
        }
    }

    saveAsPDF() {
        this.ui.showNotification('Para salvar como PDF, use a opção "Salvar como PDF" na janela de impressão.', 'info');
        this.printDocument();
    }

    async copyToClipboard() {
        const content = document.querySelector('#documentPreview .document-content')?.textContent;
        if (!content) {
            this.ui.showNotification('Nenhum documento para copiar. Gere um documento primeiro.', 'error');
            return;
        }

        const success = await this.ui.copyToClipboard(content);
        if (success && this.analytics && this.analytics.trackEvent) {
            this.analytics.trackEvent('document_copied', { model: this.currentModel });
        }
    }

    enableActionButtons(enabled) {
        const buttons = ['printBtn', 'pdfBtn', 'copyBtn'];
        buttons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.disabled = !enabled;
                btn.setAttribute('aria-disabled', !enabled);
            }
        });
    }

    setupMobileMenu() {
        const menuBtn = document.querySelector('.mobile-menu-btn');
        const nav = document.querySelector('.main-nav ul');

        if (menuBtn && nav) {
            menuBtn.addEventListener('click', () => {
                const isOpen = nav.classList.toggle('active');
                menuBtn.innerHTML = isOpen 
                    ? '<i class="fas fa-times" aria-label="Fechar menu"></i>' 
                    : '<i class="fas fa-bars" aria-label="Abrir menu"></i>';
                menuBtn.setAttribute('aria-expanded', isOpen);
            });

            document.addEventListener('click', (e) => {
                if (!nav.contains(e.target) && !menuBtn.contains(e.target)) {
                    nav.classList.remove('active');
                    menuBtn.innerHTML = '<i class="fas fa-bars" aria-label="Abrir menu"></i>';
                    menuBtn.setAttribute('aria-expanded', false);
                }
            });

            nav.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    nav.classList.remove('active');
                    menuBtn.innerHTML = '<i class="fas fa-bars" aria-label="Abrir menu"></i>';
                    menuBtn.setAttribute('aria-expanded', false);
                });
            });
        }
    }

    setupFAQ() {
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', () => {
                const answer = question.nextElementSibling;
                const icon = question.querySelector('i');
                const isOpening = !answer.classList.contains('active');
                
                // Close all other answers
                document.querySelectorAll('.faq-answer').forEach(otherAnswer => {
                    if (otherAnswer !== answer) {
                        otherAnswer.classList.remove('active');
                        otherAnswer.previousElementSibling.querySelector('i').style.transform = 'rotate(0deg)';
                        otherAnswer.previousElementSibling.setAttribute('aria-expanded', false);
                    }
                });
                
                // Toggle current answer
                answer.classList.toggle('active');
                if (isOpening) {
                    icon.style.transform = 'rotate(180deg)';
                    question.setAttribute('aria-expanded', true);
                    
                    // Announce to screen readers
                    if (this.accessibility && this.accessibility.announceToScreenReader) {
                        const answerText = answer.textContent.substring(0, 100) + '...';
                        this.accessibility.announceToScreenReader(`Resposta expandida: ${answerText}`);
                    }
                } else {
                    icon.style.transform = 'rotate(0deg)';
                    question.setAttribute('aria-expanded', false);
                }
            });
            
            // Add keyboard support
            question.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    question.click();
                }
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
                    
                    // Focus on target for keyboard users
                    setTimeout(() => {
                        if (targetElement.tabIndex >= 0) {
                            targetElement.focus();
                        }
                    }, 1000);
                }
            });
        });
    }

    setupAccessibility() {
        if (!this.accessibility) return;
        
        // Integrate with notifications
        const originalShowNotification = this.ui.showNotification;
        this.ui.showNotification = (message, type = 'info', duration = 5000) => {
            originalShowNotification.call(this.ui, message, type, duration);
            
            // Read notification with voice reader if active
            if (this.accessibility.currentSettings?.voiceReader && this.accessibility.speakText) {
                setTimeout(() => {
                    this.accessibility.speakText(message);
                }, 300);
            }
        };
        
        // Add ARIA labels to form elements
        this.addAriaLabels();
        
        // Set focus to first form element on page load
        setTimeout(() => {
            const firstInput = document.querySelector('#companyName, input[type="text"], input[type="date"]');
            if (firstInput) {
                firstInput.focus();
            }
        }, 500);
    }

    addAriaLabels() {
        // Add ARIA labels to form controls
        const labels = {
            'companyName': 'Nome da empresa',
            'employeeName': 'Nome do funcionário',
            'companyAddress': 'Endereço da empresa',
            'employeePosition': 'Cargo do funcionário',
            'documentDate': 'Data do documento',
            'generateBtn': 'Gerar documento com base nos dados preenchidos',
            'loadExampleBtn': 'Carregar dados de exemplo para teste',
            'clearBtn': 'Limpar todos os campos do formulário'
        };
        
        Object.entries(labels).forEach(([id, label]) => {
            const element = document.getElementById(id);
            if (element) {
                element.setAttribute('aria-label', label);
            }
        });
        
        // Add ARIA roles to document cards
        document.querySelectorAll('.model-card').forEach(card => {
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-pressed', card.classList.contains('selected') ? 'true' : 'false');
            
            // Add keyboard support
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
        });
    }

    formatDate(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR');
        } catch (e) {
            return dateString;
        }
    }

    exportHistory() {
        if (!this.storage || !this.storage.exportData) return;
        
        try {
            const exportData = this.storage.exportData({ includeHistory: true });
            const blob = new Blob([exportData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `modelotrabalhista_history_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.ui.showNotification('Histórico exportado com sucesso!', 'success');
        } catch (error) {
            this.ui.showNotification('Erro ao exportar histórico: ' + error.message, 'error');
        }
    }

    async importHistory(file) {
        if (!file || !this.storage || !this.storage.importData) return;
        
        try {
            const text = await file.text();
            const result = this.storage.importData(text);
            
            if (result.success) {
                this.ui.showNotification(`${result.importedCount || 0} documentos importados com sucesso!`, 'success');
            } else {
                throw new Error(result.error || 'Formato de arquivo inválido');
            }
        } catch (error) {
            this.ui.showNotification('Erro ao importar histórico: ' + error.message, 'error');
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter = Generate document
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.generateDocument();
            }
            
            // Ctrl/Cmd + S = Save draft
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveDraft();
                this.ui.showNotification('Rascunho salvo automaticamente', 'info', 2000);
            }
            
            // Ctrl/Cmd + E = Load example
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                this.loadExampleData();
            }
            
            // Ctrl/Cmd + L = Clear form
            if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
                e.preventDefault();
                this.showClearConfirmation();
            }
            
            // Ctrl/Cmd + P = Print
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                this.printDocument();
            }
            
            // Ctrl/Cmd + C = Copy (when in preview)
            if ((e.ctrlKey || e.metaKey) && e.key === 'c' && 
                document.activeElement.closest('#documentPreview')) {
                e.preventDefault();
                this.copyToClipboard();
            }
            
            // Escape key closes modals
            if (e.key === 'Escape') {
                const modal = document.querySelector('.modal[style*="display: flex"], .modal[style*="display: block"]');
                if (modal && this.ui.hideModal) {
                    const modalId = modal.id;
                    this.ui.hideModal(modalId);
                }
            }
        });
    }

    trackPageView() {
        if (this.analytics && this.analytics.trackPageView) {
            this.analytics.trackPageView();
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check for required modules
    if (typeof UIHelper === 'undefined') {
        console.warn('UIHelper não encontrado. Carregando fallback...');
        // Aqui você pode carregar dinamicamente se necessário
    }
    
    if (typeof DocumentGenerator === 'undefined') {
        console.warn('DocumentGenerator não encontrado. Usando geradores internos.');
    }
    
    // Initialize app
    window.app = new ModeloTrabalhistaApp();
    
    // Expose for debugging
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.debug = {
            app: window.app,
            storage: window.storageManager,
            analytics: window.analytics,
            accessibility: window.accessibilityManager
        };
    }
});