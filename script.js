// script.js - Lógica principal do ModeloTrabalhista

// ===== CONFIGURAÇÃO INICIAL =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('ModeloTrabalhista - Carregado com sucesso!');
    
    // Configurar data atual como padrão
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('data').value = today;
    
    // Inicializar componentes
    initDocumentCards();
    initForm();
    initPreviewControls();
    initFAQ();
    initMobileMenu();
    
    // Carregar exemplos de dados para teste
    loadExampleData();
});

// ===== GERENCIAMENTO DE CARTÕES DE DOCUMENTO =====
function initDocumentCards() {
    const cards = document.querySelectorAll('.document-card');
    
    cards.forEach(card => {
        card.addEventListener('click', function() {
            // Remover seleção anterior
            cards.forEach(c => c.classList.remove('selected'));
            
            // Selecionar card atual
            this.classList.add('selected');
            
            // Obter tipo de documento
            const docType = this.getAttribute('data-doc-type');
            
            // Atualizar select do formulário
            const select = document.getElementById('docType');
            select.value = docType;
            
            // Atualizar campos específicos
            updateSpecificFields(docType);
            
            // Rolar até o formulário
            document.getElementById('gerador').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        });
    });
}

// ===== GERENCIAMENTO DO FORMULÁRIO =====
function initForm() {
    const docTypeSelect = document.getElementById('docType');
    const btnGerar = document.getElementById('btnGerar');
    const btnLimpar = document.getElementById('btnLimpar');
    const btnExemplo = document.getElementById('btnExemplo');
    
    // Atualizar campos quando mudar o tipo de documento
    docTypeSelect.addEventListener('change', function() {
        updateSpecificFields(this.value);
        
        // Desselecionar cartões
        document.querySelectorAll('.document-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Selecionar cartão correspondente
        const card = document.querySelector(`.document-card[data-doc-type="${this.value}"]`);
        if (card) card.classList.add('selected');
    });
    
    // Gerar documento
    btnGerar.addEventListener('click', generateDocument);
    
    // Limpar formulário
    btnLimpar.addEventListener('click', clearForm);
    
    // Carregar dados de exemplo
    btnExemplo.addEventListener('click', loadExampleData);
    
    // Atualizar campos inicialmente
    updateSpecificFields(docTypeSelect.value);
}

function updateSpecificFields(docType) {
    const container = document.querySelector('.doc-specific-fields');
    container.innerHTML = '';
    
    let fieldsHTML = '';
    
    switch(docType) {
        case 'ferias':
            fieldsHTML = `
                <div class="form-group">
                    <label for="periodoFerias">
                        <i class="fas fa-calendar-check"></i> Período de Férias:
                    </label>
                    <input type="text" id="periodoFerias" class="form-control" 
                           placeholder="Ex: 01/12/2023 a 31/12/2023">
                    <small class="form-text">Informe o período desejado para as férias</small>
                </div>
                
                <div class="form-group">
                    <label for="diasFerias">
                        <i class="fas fa-sun"></i> Quantidade de Dias:
                    </label>
                    <input type="number" id="diasFerias" class="form-control" 
                           placeholder="Ex: 30" min="1" max="30">
                </div>
            `;
            break;
            
        case 'advertencia':
            fieldsHTML = `
                <div class="form-group">
                    <label for="motivoAdvertencia">
                        <i class="fas fa-exclamation-circle"></i> Motivo da Advertência:
                    </label>
                    <textarea id="motivoAdvertencia" class="form-control" rows="4"
                              placeholder="Descreva detalhadamente o motivo da advertência..."></textarea>
                    <small class="form-text">Seja claro e objetivo na descrição</small>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="dataOcorrencia">
                            <i class="fas fa-calendar-times"></i> Data da Ocorrência:
                        </label>
                        <input type="date" id="dataOcorrencia" class="form-control">
                    </div>
                    
                    <div class="form-group">
                        <label for="gravidade">
                            <i class="fas fa-balance-scale"></i> Gravidade:
                        </label>
                        <select id="gravidade" class="form-control">
                            <option value="leve">Leve</option>
                            <option value="media">Média</option>
                            <option value="grave">Grave</option>
                        </select>
                    </div>
                </div>
            `;
            break;
            
        case 'reuniao':
            const hoje = new Date();
            const amanha = new Date(hoje);
            amanha.setDate(amanha.getDate() + 1);
            
            fieldsHTML = `
                <div class="form-row">
                    <div class="form-group">
                        <label for="dataReuniao">
                            <i class="fas fa-calendar"></i> Data da Reunião:
                        </label>
                        <input type="date" id="dataReuniao" class="form-control" 
                               value="${amanha.toISOString().split('T')[0]}">
                    </div>
                    
                    <div class="form-group">
                        <label for="horaReuniao">
                            <i class="fas fa-clock"></i> Hora da Reunião:
                        </label>
                        <input type="time" id="horaReuniao" class="form-control" value="14:00">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="localReuniao">
                        <i class="fas fa-map-marker-alt"></i> Local da Reunião:
                    </label>
                    <input type="text" id="localReuniao" class="form-control" 
                           placeholder="Ex: Sala de Reuniões 1">
                </div>
                
                <div class="form-group">
                    <label for="pautaReuniao">
                        <i class="fas fa-list-alt"></i> Pauta da Reunião:
                    </label>
                    <textarea id="pautaReuniao" class="form-control" rows="4"
                              placeholder="Liste os tópicos que serão discutidos..."></textarea>
                </div>
            `;
            break;
            
        case 'demissao':
        default:
            fieldsHTML = `
                <div class="form-group">
                    <label for="dataEfetiva">
                        <i class="fas fa-calendar-check"></i> Data Efetiva da Demissão:
                    </label>
                    <input type="date" id="dataEfetiva" class="form-control">
                    <small class="form-text">Data em que deseja efetivamente se desligar</small>
                </div>
                
                <div class="form-group">
                    <label for="avisoPrevio">
                        <i class="fas fa-bell"></i> Aviso Prévio:
                    </label>
                    <select id="avisoPrevio" class="form-control">
                        <option value="trabalhado">Trabalhado</option>
                        <option value="indenizado">Indenizado</option>
                        <option value="dispensado">Dispensado pelo empregador</option>
                    </select>
                </div>
            `;
    }
    
    container.innerHTML = fieldsHTML;
}

// ===== GERAÇÃO DE DOCUMENTO =====
function generateDocument() {
    // Validar formulário
    if (!validateForm()) {
        showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }
    
    // Coletar dados do formulário
    const formData = collectFormData();
    
    // Gerar documento baseado no tipo
    let documento = '';
    
    switch(formData.docType) {
        case 'demissao':
            documento = generateDemissao(formData);
            break;
        case 'ferias':
            documento = generateFerias(formData);
            break;
        case 'advertencia':
            documento = generateAdvertencia(formData);
            break;
        case 'reuniao':
            documento = generateReuniao(formData);
            break;
        default:
            documento = "Tipo de documento não reconhecido.";
    }
    
    // Exibir documento na pré-visualização
    const preview = document.getElementById('preview');
    preview.textContent = documento;
    preview.classList.remove('preview-placeholder');
    
    // Habilitar botões de ação
    enableActionButtons(true);
    
    // Mostrar notificação de sucesso
    showNotification('Documento gerado com sucesso!', 'success');
    
    // Rolar até a pré-visualização
    preview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function collectFormData() {
    const docType = document.getElementById('docType').value;
    
    // Dados básicos
    const data = {
        docType: docType,
        empresaNome: document.getElementById('empresaNome').value,
        empresaEndereco: document.getElementById('empresaEndereco').value,
        funcionarioNome: document.getElementById('funcionarioNome').value,
        funcionarioCargo: document.getElementById('funcionarioCargo').value,
        data: document.getElementById('data').value,
        dataFormatada: formatDate(document.getElementById('data').value)
    };
    
    // Dados específicos por tipo
    switch(docType) {
        case 'demissao':
            data.dataEfetiva = document.getElementById('dataEfetiva')?.value || '';
            data.avisoPrevio = document.getElementById('avisoPrevio')?.value || '';
            break;
        case 'ferias':
            data.periodoFerias = document.getElementById('periodoFerias')?.value || '';
            data.diasFerias = document.getElementById('diasFerias')?.value || '30';
            break;
        case 'advertencia':
            data.motivoAdvertencia = document.getElementById('motivoAdvertencia')?.value || '';
            data.dataOcorrencia = document.getElementById('dataOcorrencia')?.value || '';
            data.gravidade = document.getElementById('gravidade')?.value || 'media';
            break;
        case 'reuniao':
            data.dataReuniao = document.getElementById('dataReuniao')?.value || '';
            data.horaReuniao = document.getElementById('horaReuniao')?.value || '';
            data.localReuniao = document.getElementById('localReuniao')?.value || '';
            data.pautaReuniao = document.getElementById('pautaReuniao')?.value || '';
            break;
    }
    
    return data;
}

function validateForm() {
    const requiredFields = [
        'empresaNome',
        'funcionarioNome',
        'data'
    ];
    
    for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
            field?.classList.add('error');
            return false;
        }
        field?.classList.remove('error');
    }
    
    return true;
}

// ===== GERADORES DE DOCUMENTO =====
function generateDemissao(data) {
    const dataEfetivaFormatada = data.dataEfetiva ? formatDate(data.dataEfetiva) : '(a definir)';
    const avisoPrevioText = getAvisoPrevioText(data.avisoPrevio);
    
    return `
${data.empresaNome.toUpperCase()}
${data.empresaEndereco}

================================================================================
                               PEDIDO DE DEMISSÃO
================================================================================

Eu, ${data.funcionarioNome}, brasileiro(a), portador(a) do CPF (informar número) 
e Carteira de Trabalho (informar número), na função de ${data.funcionarioCargo}, 
venho por meio deste comunicar minha decisão de pedir demissão do cargo que 
ocupo nesta empresa.

Solicito que sejam calculados todos os meus direitos trabalhistas, incluindo:
- Saldo de salário
- Férias proporcionais
- 13º salário proporcional
- ${avisoPrevioText}
- Multa de 40% do FGTS (se aplicável)

Data efetiva do desligamento: ${dataEfetivaFormatada}

Declaro que estou ciente das implicações legais deste pedido e que estarei 
disponível para os procedimentos de desligamento conforme estabelecido pela 
legislação trabalhista e normas internas da empresa.

Agradeço pelas oportunidades concedidas durante o período de trabalho.

================================================================================

Data: ${data.dataFormatada}

__________________________________________
Assinatura do Funcionário

================================================================================

Recebido por: __________________________________________
Cargo: _________________________________________________
Data: ____/____/______
    `;
}

function generateFerias(data) {
    const periodo = data.periodoFerias || '(período a ser definido)';
    const dias = data.diasFerias || '30';
    
    return `
${data.empresaNome.toUpperCase()}
${data.empresaEndereco}

================================================================================
                           SOLICITAÇÃO DE FÉRIAS
================================================================================

Eu, ${data.funcionarioNome}, funcionário(a) desta empresa no cargo de 
${data.funcionarioCargo}, venho por meio deste solicitar o gozo de minhas 
férias referentes ao período aquisitivo vigente.

Solicito que as férias sejam concedidas no seguinte período: ${periodo}
Quantidade de dias: ${dias} dias

Declaro estar ciente de que, conforme legislação trabalhista:
1. As férias devem ser concedidas em até 12 meses após o período aquisitivo
2. Receberei o valor correspondente com o adicional de 1/3 constitucional
3. O período de férias pode ser dividido conforme acordo entre as partes

Aguardo o devido agendamento e aprovação.

================================================================================

Data: ${data.dataFormatada}

__________________________________________
Assinatura do Funcionário

================================================================================

Parecer do Departamento Pessoal: __________________________________________

Data de Agendamento: ____/____/______
Setor Responsável: ______________________________________
    `;
}

function generateAdvertencia(data) {
    const gravidadeText = getGravidadeText(data.gravidade);
    const dataOcorrencia = data.dataOcorrencia ? formatDate(data.dataOcorrencia) : data.dataFormatada;
    
    return `
${data.empresaNome.toUpperCase()}
${data.empresaEndereco}

================================================================================
                             ADVERTÊNCIA FORMAL
================================================================================

Para: ${data.funcionarioNome}
Cargo: ${data.funcionarioCargo}
Data da Ocorrência: ${dataOcorrencia}
Data do Documento: ${data.dataFormatada}
Gravidade: ${gravidadeText}

================================================================================
                         COMUNICADO DE ADVERTÊNCIA
================================================================================

A direção da empresa vem, por meio deste documento, formalizar uma advertência 
por:

"${data.motivoAdvertencia || 'Conduta inadequada no ambiente de trabalho.'}"

Esta advertência serve como medida disciplinar e tem como objetivo alertar 
sobre a necessidade de adequação de conduta, conforme estabelecido no 
regulamento interno da empresa e na legislação trabalhista vigente.

Consequências em caso de reincidência:
1. Suspensão temporária
2. Advertência formal gravíssima
3. Dispensa por justa causa

================================================================================

O funcionário está ciente das implicações desta advertência e deverá assinar 
este documento em duas vias, ficando uma com a empresa e outra em seu poder.

__________________________________________
Assinatura do Representante da Empresa
Cargo: __________________________________

================================================================================

                            CIÊNCIA DO FUNCIONÁRIO

Declaro ter recebido e compreendido o conteúdo desta advertência.

Data: ____/____/______

__________________________________________
Assinatura do Funcionário
    `;
}

function generateReuniao(data) {
    const dataReuniaoFormatada = data.dataReuniao ? formatDate(data.dataReuniao) : '(a definir)';
    const hora = data.horaReuniao || '(horário a definir)';
    const local = data.localReuniao || 'Sala de Reuniões';
    
    let pauta = '1. Abertura e apresentação dos objetivos\n2. Discussão sobre metas trimestrais\n3. Ajustes de processos internos\n4. Feedbacks e sugestões\n5. Encerramento';
    
    if (data.pautaReuniao) {
        pauta = data.pautaReuniao;
    }
    
    return `
${data.empresaNome.toUpperCase()}
${data.empresaEndereco}

================================================================================
                        CONVOCATÓRIA PARA REUNIÃO
================================================================================

Para: Todos os funcionários do departamento
De: ${data.funcionarioNome} - ${data.funcionarioCargo}
Data do Documento: ${data.dataFormatada}

================================================================================
                               CONVOCAÇÃO
================================================================================

Convocamos todos os membros do departamento para uma reunião que será 
realizada:

Data: ${dataReuniaoFormatada}
Hora: ${hora}
Local: ${local}

Pauta da Reunião:
${pauta}

Solicitamos a confirmação de presença até 24 horas antes da reunião.

================================================================================

Atenciosamente,

__________________________________________
${data.funcionarioNome}
${data.funcionarioCargo}
    `;
}

// ===== FUNÇÕES AUXILIARES =====
function formatDate(dateString) {
    if (!dateString) return '(data não informada)';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    } catch (e) {
        return dateString;
    }
}

function getAvisoPrevioText(tipo) {
    switch(tipo) {
        case 'trabalhado': return 'Aviso prévio trabalhado';
        case 'indenizado': return 'Aviso prévio indenizado';
        case 'dispensado': return 'Aviso prévio dispensado pelo empregador';
        default: return 'Aviso prévio (conforme acordo)';
    }
}

function getGravidadeText(gravidade) {
    switch(gravidade) {
        case 'leve': return 'Leve';
        case 'media': return 'Média';
        case 'grave': return 'Grave';
        default: return 'Média';
    }
}

// ===== CONTROLES DE PRÉ-VISUALIZAÇÃO =====
function initPreviewControls() {
    const btnImprimir = document.getElementById('btnImprimir');
    const btnPDF = document.getElementById('btnPDF');
    const btnCopiar = document.getElementById('btnCopiar');
    const btnZoomIn = document.getElementById('btnZoomIn');
    const btnZoomOut = document.getElementById('btnZoomOut');
    const btnResetZoom = document.getElementById('btnResetZoom');
    
    btnImprimir.addEventListener('click', printDocument);
    btnPDF.addEventListener('click', saveAsPDF);
    btnCopiar.addEventListener('click', copyToClipboard);
    btnZoomIn.addEventListener('click', zoomIn);
    btnZoomOut.addEventListener('click', zoomOut);
    btnResetZoom.addEventListener('click', resetZoom);
}

function enableActionButtons(enabled) {
    const buttons = ['btnImprimir', 'btnPDF', 'btnCopiar'];
    buttons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) btn.disabled = !enabled;
    });
}

function printDocument() {
    const previewContent = document.getElementById('preview').textContent;
    const originalTitle = document.title;
    
    // Criar uma nova janela para impressão
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${originalTitle} - Documento</title>
            <style>
                body { font-family: 'Courier New', monospace; line-height: 1.6; margin: 2cm; }
                .header { text-align: center; margin-bottom: 2cm; }
                .content { white-space: pre-wrap; }
                .footer { margin-top: 2cm; text-align: center; font-size: 0.9em; color: #666; }
                @media print {
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="content">${previewContent}</div>
            <div class="footer">
                <p>Gerado por ModeloTrabalhista - ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            <button class="no-print" onclick="window.print()">Imprimir</button>
        </body>
        </html>
    `);
    printWindow.document.close();
}

function saveAsPDF() {
    showNotification('Para salvar como PDF, use a opção "Salvar como PDF" na janela de impressão do navegador.', 'info');
    printDocument();
}

function copyToClipboard() {
    const previewContent = document.getElementById('preview').textContent;
    
    navigator.clipboard.writeText(previewContent)
        .then(() => {
            showNotification('Texto copiado para a área de transferência!', 'success');
        })
        .catch(err => {
            console.error('Erro ao copiar texto:', err);
            showNotification('Erro ao copiar texto. Tente novamente.', 'error');
        });
}

let currentZoom = 100;

function zoomIn() {
    currentZoom += 10;
    updateZoom();
}

function zoomOut() {
    if (currentZoom > 70) {
        currentZoom -= 10;
        updateZoom();
    }
}

function resetZoom() {
    currentZoom = 100;
    updateZoom();
}

function updateZoom() {
    const preview = document.getElementById('preview');
    preview.style.fontSize = `${currentZoom}%`;
}

// ===== FAQ =====
function initFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const icon = this.querySelector('i');
            
            // Alternar classe active
            answer.classList.toggle('active');
            
            // Rotacionar ícone
            if (answer.classList.contains('active')) {
                icon.style.transform = 'rotate(180deg)';
            } else {
                icon.style.transform = 'rotate(0deg)';
            }
            
            // Fechar outras respostas
            faqQuestions.forEach(otherQuestion => {
                if (otherQuestion !== this) {
                    otherQuestion.nextElementSibling.classList.remove('active');
                    otherQuestion.querySelector('i').style.transform = 'rotate(0deg)';
                }
            });
        });
    });
}

// ===== MENU MOBILE =====
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav ul');
    
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function() {
            nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
            
            if (nav.style.display === 'flex') {
                nav.style.flexDirection = 'column';
                nav.style.position = 'absolute';
                nav.style.top = '100%';
                nav.style.left = '0';
                nav.style.right = '0';
                nav.style.backgroundColor = 'var(--primary)';
                nav.style.padding = 'var(--space-lg)';
                nav.style.gap = 'var(--space-md)';
            }
        });
        
        // Fechar menu ao clicar em um link
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    nav.style.display = 'none';
                }
            });
        });
        
        // Ajustar menu na redimensionamento
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                nav.style.display = 'flex';
                nav.style.position = 'static';
                nav.style.flexDirection = 'row';
                nav.style.backgroundColor = 'transparent';
                nav.style.padding = '0';
            } else {
                nav.style.display = 'none';
            }
        });
    }
}

// ===== DADOS DE EXEMPLO =====
function loadExampleData() {
    // Dados de exemplo para preencher automaticamente
    const exampleData = {
        empresaNome: 'Tech Solutions Ltda',
        empresaEndereco: 'Av. Paulista, 1000 - São Paulo/SP',
        funcionarioNome: 'João da Silva',
        funcionarioCargo: 'Analista de Sistemas',
        periodoFerias: '01/12/2023 a 31/12/2023',
        diasFerias: '30',
        motivoAdvertencia: 'Atrasos recorrentes no horário de entrada durante o mês de outubro.',
        dataOcorrencia: new Date().toISOString().split('T')[0],
        gravidade: 'media',
        dataReuniao: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        horaReuniao: '14:00',
        localReuniao: 'Sala de Reuniões Principal',
        pautaReuniao: '1. Abertura e boas-vindas\n2. Apresentação dos resultados do trimestre\n3. Discussão sobre novas metas\n4. Feedbacks da equipe\n5. Encerramento',
        dataEfetiva: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        avisoPrevio: 'trabalhado'
    };
    
    // Preencher campos básicos
    document.getElementById('empresaNome').value = exampleData.empresaNome;
    document.getElementById('empresaEndereco').value = exampleData.empresaEndereco;
    document.getElementById('funcionarioNome').value = exampleData.funcionarioNome;
    document.getElementById('funcionarioCargo').value = exampleData.funcionarioCargo;
    
    // Preencher campos específicos baseados no tipo selecionado
    const docType = document.getElementById('docType').value;
    updateSpecificFields(docType);
    
    // Aguardar um pouco para garantir que os campos específicos foram criados
    setTimeout(() => {
        switch(docType) {
            case 'ferias':
                if (document.getElementById('periodoFerias')) 
                    document.getElementById('periodoFerias').value = exampleData.periodoFerias;
                if (document.getElementById('diasFerias')) 
                    document.getElementById('diasFerias').value = exampleData.diasFerias;
                break;
            case 'advertencia':
                if (document.getElementById('motivoAdvertencia')) 
                    document.getElementById('motivoAdvertencia').value = exampleData.motivoAdvertencia;
                if (document.getElementById('dataOcorrencia')) 
                    document.getElementById('dataOcorrencia').value = exampleData.dataOcorrencia;
                if (document.getElementById('gravidade')) 
                    document.getElementById('gravidade').value = exampleData.gravidade;
                break;
            case 'reuniao':
                if (document.getElementById('dataReuniao')) 
                    document.getElementById('dataReuniao').value = exampleData.dataReuniao;
                if (document.getElementById('horaReuniao')) 
                    document.getElementById('horaReuniao').value = exampleData.horaReuniao;
                if (document.getElementById('localReuniao')) 
                    document.getElementById('localReuniao').value = exampleData.localReuniao;
                if (document.getElementById('pautaReuniao')) 
                    document.getElementById('pautaReuniao').value = exampleData.pautaReuniao;
                break;
            case 'demissao':
                if (document.getElementById('dataEfetiva')) 
                    document.getElementById('dataEfetiva').value = exampleData.dataEfetiva;
                if (document.getElementById('avisoPrevio')) 
                    document.getElementById('avisoPrevio').value = exampleData.avisoPrevio;
                break;
        }
        
        showNotification('Dados de exemplo carregados com sucesso!', 'success');
    }, 100);
}

function clearForm() {
    // Resetar formulário
    document.getElementById('docForm').reset();
    
    // Restaurar data atual
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('data').value = today;
    
    // Limpar pré-visualização
    const preview = document.getElementById('preview');
    preview.innerHTML = `
        <div class="preview-placeholder">
            <i class="fas fa-file-alt"></i>
            <h3>Seu documento aparecerá aqui</h3>
            <p>Preencha o formulário ao lado e clique em "Gerar Documento" para visualizar.</p>
        </div>
    `;
    preview.classList.add('preview-placeholder');
    
    // Desabilitar botões de ação
    enableActionButtons(false);
    
    // Desselecionar cartões
    document.querySelectorAll('.document-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Redefinir zoom
    resetZoom();
    
    showNotification('Formulário limpo com sucesso!', 'info');
}

// ===== NOTIFICAÇÕES =====
function showNotification(message, type = 'info') {
    // Remover notificação anterior se existir
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Estilos da notificação
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        max-width: 400px;
        animation: slideIn 0.3s ease;
        font-weight: 500;
    `;
    
    // Cores por tipo
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        info: '#3498db',
        warning: '#f39c12'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    notification.style.color = 'white';
    
    // Botão de fechar
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        margin-left: 15px;
        padding: 0;
        line-height: 1;
    `;
    
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
    
    // Adicionar ao corpo
    document.body.appendChild(notification);
    
    // Adicionar estilos de animação
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// ===== ANALYTICS SIMPLES =====
function trackEvent(eventName, eventData = {}) {
    // Em uma implementação real, aqui você enviaria dados para o Google Analytics
    console.log(`Evento: ${eventName}`, eventData);
    
    // Salvar no localStorage para analytics básico
    try {
        const analytics = JSON.parse(localStorage.getItem('modelotrabalhista_analytics') || '{"events":[]}');
        analytics.events.push({
            event: eventName,
            data: eventData,
            timestamp: new Date().toISOString()
        });
        
        // Manter apenas os últimos 100 eventos
        if (analytics.events.length > 100) {
            analytics.events = analytics.events.slice(-100);
        }
        
        localStorage.setItem('modelotrabalhista_analytics', JSON.stringify(analytics));
    } catch (e) {
        console.error('Erro ao salvar analytics:', e);
    }
}

// Rastrear geração de documento
window.addEventListener('load', function() {
    trackEvent('page_view', {
        path: window.location.pathname,
        referrer: document.referrer
    });
});
