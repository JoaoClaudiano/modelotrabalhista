// generator.js - Geração específica de documentos para ModeloTrabalhista

class DocumentGenerator {
    constructor() {
        // Constantes para validação de tamanho de campos
        this.MAX_SHORT_TEXT_LENGTH = 500;
        this.MAX_LONG_TEXT_LENGTH = 2000;
        this.LONG_TEXT_FIELDS = ['Reason', 'Agenda', 'Conditions', 'Description'];
        
        // Estilos base para container do documento (otimizado para PDF de 1 página A4 e captura com html2canvas)
        // box-sizing: border-box - garante que padding não aumenta dimensões totais
        // page-break-inside: avoid - evita quebra dentro do container
        // line-height: 1.5 - espaçamento padrão para corpo do texto
        // padding: 20px - ajustado para melhor captura em PDF
        // background-color: white - garante fundo branco na captura
        // color: black - garante texto preto para melhor legibilidade
        this.DOCUMENT_CONTAINER_STYLE = 'font-family: Arial, sans-serif; line-height: 1.5; width: 100%; margin: 0; padding: 20px; box-sizing: border-box; background-color: white; color: black;';
        
        // Array de meses em português para formatação de datas
        this.MONTHS_PT = [
            'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
            'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
        ];
        
        this.templates = {
            demissao: this.generateResignationLetter.bind(this),
            ferias: this.generateVacationRequest.bind(this),
            advertencia: this.generateWarningLetter.bind(this),
            reuniao: this.generateMeetingConvocation.bind(this),
            alteracao_jornada: this.generateShiftChangeRequest.bind(this),
            reembolso: this.generateExpenseReimbursement.bind(this),
            beneficios: this.generateBenefitsRequest.bind(this),
            licenca_maternidade: this.generateMaternityLeave.bind(this),
            flexibilizacao_jornada: this.generateFlexibleSchedule.bind(this),
            intervalo_amamentacao: this.generateBreastfeedingInterval.bind(this),
            ajuste_horario_pais: this.generateParentScheduleAdjustment.bind(this)
        };
        
        // Campos obrigatórios por tipo de documento
        this.REQUIRED_FIELDS = {
            demissao: ['employeeName', 'employeePosition', 'companyName', 'effectiveDate', 'noticePeriod', 'CPF', 'CTPS'],
            ferias: ['employeeName', 'employeePosition', 'vacationPeriod', 'vacationDays'],
            advertencia: ['employeeName', 'employeePosition', 'incidentDate', 'warningReason', 'severity'],
            reuniao: ['meetingDate', 'meetingTime', 'meetingLocation', 'meetingAgenda'],
            alteracao_jornada: ['employeeName', 'employeePosition', 'sector', 'currentShift', 'desiredShift', 'justification', 'startDate'],
            reembolso: ['employeeName', 'employeePosition', 'sector', 'expenseType', 'expenseDate', 'expenseValue', 'expenseReason'],
            beneficios: ['employeeName', 'employeePosition', 'sector', 'benefitType', 'justification', 'startDate'],
            licenca_maternidade: ['employeeName', 'employeePosition', 'sector', 'startDate', 'duration', 'leaveType'],
            flexibilizacao_jornada: ['employeeName', 'employeePosition', 'sector', 'reason', 'period', 'flexibilizationType'],
            intervalo_amamentacao: ['employeeName', 'employeePosition', 'sector', 'intervalPeriod'],
            ajuste_horario_pais: ['employeeName', 'employeePosition', 'sector', 'adjustmentType', 'dates', 'reason']
        };
        
        // Metadados e instruções de preenchimento por documento
        this.DOCUMENT_METADATA = {
            demissao: {
                name: 'Pedido de Demissão',
                description: 'Este documento serve para formalizar a manifestação de vontade do empregado em se desligar da empresa.',
                instructions: 'Preencha todos os campos obrigatórios. Informe o período de aviso prévio desejado (trabalhado, indenizado ou dispensado). Este documento não substitui assessoria jurídica especializada.',
                legalNotice: 'Alguns direitos trabalhistas variam conforme o tipo de desligamento e convenções coletivas da categoria. Consulte sempre um advogado trabalhista para orientação específica.'
            },
            ferias: {
                name: 'Solicitação de Férias',
                description: 'Documento para solicitar formalmente o período de férias remuneradas.',
                instructions: 'Informe o período desejado e a quantidade de dias. As férias devem ser concedidas em até 12 meses após o período aquisitivo.',
                legalNotice: 'O empregador tem a prerrogativa de definir o período de férias. Este documento é apenas uma solicitação e não garante automaticamente a concessão no período desejado.'
            },
            advertencia: {
                name: 'Advertência Formal',
                description: 'Documento para formalizar advertência disciplinar ao empregado.',
                instructions: 'Descreva claramente a conduta inadequada, a data da ocorrência e a gravidade. A advertência deve estar vinculada ao regulamento interno da empresa.',
                legalNotice: 'A advertência é uma medida disciplinar que não implica automaticamente em demissão por justa causa. Serve como registro formal de conduta inadequada.'
            },
            reuniao: {
                name: 'Convocatória de Reunião',
                description: 'Documento para convocar formalmente reuniões com a equipe.',
                instructions: 'Informe data, hora, local e pauta da reunião. Solicite confirmação de presença dos participantes.',
                legalNotice: 'Este é um documento de comunicação interna. A presença em reuniões pode ser obrigatória conforme regras da empresa.'
            },
            alteracao_jornada: {
                name: 'Pedido de Alteração de Jornada ou Turno',
                description: 'Documento para solicitar mudança de turno ou jornada de trabalho.',
                instructions: 'Informe o turno atual, o turno desejado, a justificativa e a data de início pretendida.',
                legalNotice: 'A alteração de jornada depende de aprovação da empresa e deve respeitar os limites da CLT.'
            },
            reembolso: {
                name: 'Pedido de Reembolso de Despesas',
                description: 'Documento para solicitar reembolso de despesas administrativas ou profissionais.',
                instructions: 'Informe o tipo de despesa, valor, data e anexe comprovantes quando possível.',
                legalNotice: 'O reembolso está sujeito à política interna da empresa e à comprovação das despesas.'
            },
            beneficios: {
                name: 'Solicitação de Benefícios',
                description: 'Documento para solicitar benefícios como vale-refeição, transporte ou cursos.',
                instructions: 'Especifique o tipo de benefício desejado, a justificativa e a data de início.',
                legalNotice: 'A concessão de benefícios está sujeita à política da empresa e disponibilidade orçamentária.'
            },
            licenca_maternidade: {
                name: 'Pedido de Licença Maternidade/Paternidade ou Prorrogação',
                description: 'Documento para solicitar licença maternidade, paternidade ou prorrogação conforme CLT.',
                instructions: 'Informe o tipo de licença, data de início e duração prevista conforme legislação.',
                legalNotice: 'Licença maternidade: 120 dias (prorrogável para 180 dias). Licença paternidade: 5 dias (prorrogável para 20 dias no Programa Empresa Cidadã). Direitos garantidos pela CLT.'
            },
            flexibilizacao_jornada: {
                name: 'Pedido de Flexibilização de Jornada por Motivo Familiar',
                description: 'Documento para solicitar ajuste de horário por razões familiares.',
                instructions: 'Descreva o motivo familiar, o período necessário e o tipo de flexibilização desejada.',
                legalNotice: 'A flexibilização é uma solicitação administrativa e depende de aprovação da empresa.'
            },
            intervalo_amamentacao: {
                name: 'Solicitação de Intervalo para Amamentação',
                description: 'Documento para formalizar direito ao intervalo para amamentação.',
                instructions: 'Informe o período do intervalo desejado. A mãe lactante tem direito a dois descansos especiais de meia hora cada.',
                legalNotice: 'Direito garantido pelo art. 396 da CLT até que a criança complete 6 meses de idade.'
            },
            ajuste_horario_pais: {
                name: 'Pedido de Licença ou Ajuste de Horário para Pais/Responsáveis',
                description: 'Documento para solicitar ajuste de horário para acompanhamento de filhos.',
                instructions: 'Especifique o tipo de ajuste necessário, as datas e o motivo relacionado aos filhos.',
                legalNotice: 'Esta é uma solicitação administrativa que depende de aprovação da empresa.'
            }
        };
    }
    
    // Validar campos obrigatórios por tipo de documento
    validateRequiredFields(data) {
        if (!data || !data.model) {
            return {
                valid: false,
                missingFields: ['model'],
                message: 'Tipo de documento não especificado.'
            };
        }
        
        const requiredFields = this.REQUIRED_FIELDS[data.model];
        if (!requiredFields) {
            return {
                valid: false,
                missingFields: [],
                message: 'Tipo de documento não suportado.'
            };
        }
        
        const missingFields = [];
        for (const field of requiredFields) {
            if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
                missingFields.push(field);
            }
        }
        
        if (missingFields.length > 0) {
            const fieldNames = {
                employeeName: 'Nome do Funcionário',
                employeePosition: 'Cargo',
                companyName: 'Nome da Empresa',
                effectiveDate: 'Data Efetiva',
                noticePeriod: 'Período de Aviso Prévio',
                CPF: 'CPF',
                CTPS: 'CTPS',
                vacationPeriod: 'Período de Férias',
                vacationDays: 'Dias de Férias',
                incidentDate: 'Data da Ocorrência',
                warningReason: 'Motivo da Advertência',
                severity: 'Gravidade',
                meetingDate: 'Data da Reunião',
                meetingTime: 'Horário',
                meetingLocation: 'Local',
                meetingAgenda: 'Pauta da Reunião',
                sector: 'Setor',
                currentShift: 'Turno Atual',
                desiredShift: 'Turno Desejado',
                justification: 'Justificativa',
                startDate: 'Data de Início',
                expenseType: 'Tipo de Despesa',
                expenseDate: 'Data da Despesa',
                expenseValue: 'Valor',
                expenseReason: 'Motivo',
                benefitType: 'Tipo de Benefício',
                duration: 'Duração',
                leaveType: 'Tipo de Licença',
                reason: 'Motivo',
                period: 'Período',
                flexibilizationType: 'Tipo de Flexibilização',
                intervalPeriod: 'Período de Intervalo',
                adjustmentType: 'Tipo de Ajuste',
                dates: 'Datas'
            };
            
            const missingFieldNames = missingFields.map(f => fieldNames[f] || f).join(', ');
            return {
                valid: false,
                missingFields: missingFields,
                message: `Campos obrigatórios não preenchidos: ${missingFieldNames}`
            };
        }
        
        return {
            valid: true,
            missingFields: [],
            message: 'Todos os campos obrigatórios foram preenchidos.'
        };
    }
    
    // Verificar se um campo é de texto longo
    isLongTextField(fieldName) {
        return this.LONG_TEXT_FIELDS.some(suffix => fieldName.includes(suffix));
    }

    // Sanitizar string para prevenir injeção de comandos/scripts
    sanitizeInput(text, maxLength = null) {
        if (typeof text !== 'string') return '';
        // Remover caracteres de controle perigosos mas manter quebras de linha
        text = text.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
        // Limitar comprimento
        const limit = maxLength || this.MAX_SHORT_TEXT_LENGTH;
        if (text.length > limit) {
            text = text.substring(0, limit);
        }
        return text.trim();
    }

    // Gerador principal
    generateDocument(data) {
        if (!data || !data.model) {
            throw new Error('Dados incompletos para gerar documento');
        }
        
        // Validar campos obrigatórios
        const validation = this.validateRequiredFields(data);
        if (!validation.valid) {
            throw new Error(validation.message);
        }
        
        // Sanitizar todos os campos de texto do objeto data
        const sanitizedData = {};
        for (const key in data) {
            if (typeof data[key] === 'string') {
                const maxLength = this.isLongTextField(key) ? this.MAX_LONG_TEXT_LENGTH : this.MAX_SHORT_TEXT_LENGTH;
                sanitizedData[key] = this.sanitizeInput(data[key], maxLength);
            } else {
                sanitizedData[key] = data[key];
            }
        }
        
        const generator = this.templates[sanitizedData.model];
        if (!generator) {
            throw new Error('Tipo de documento não suportado');
        }
        
        try {
            return generator(sanitizedData);
        } catch (error) {
            console.error('Erro ao gerar documento:', error);
            throw new Error(`Falha ao gerar documento: ${error.message}`);
        }
    }

    // 1. PEDIDO DE DEMISSÃO
    generateResignationLetter(data) {
        const effectiveDate = data.effectiveDate ? this.formatDate(data.effectiveDate) : '(a definir)';
        const noticePeriodText = this.getNoticePeriodText(data.noticePeriod);
        // Sanitizar dados para prevenir XSS - escapar HTML em campos de usuário
        const cpf = this.escapeHtml(data.CPF || '[INFORME CPF]');
        const ctps = this.escapeHtml(data.CTPS || '[INFORME CTPS]');
        const employeeName = this.escapeHtml(data.employeeName || '[NOME DO FUNCIONÁRIO]');
        const employeePosition = this.escapeHtml(data.employeePosition || '[CARGO]');
        const companyName = this.escapeHtml(data.companyName ? data.companyName.toUpperCase() : '[NOME DA EMPRESA]');
        const companyAddress = this.escapeHtml(data.companyAddress || '[ENDEREÇO DA EMPRESA]');
        
        // Gerar local e data formatada
        const locationAndDate = this.formatLocationAndDate(data.companyAddress, data.documentDateFormatted);

        // Template otimizado para caber em EXATAMENTE 1 página A4
        return `<div style="${this.DOCUMENT_CONTAINER_STYLE}">
    <!-- Cabeçalho da empresa - margin-bottom reduzido de 15px para 8px -->
    <div style="text-align: center; margin-bottom: 8px; box-sizing: border-box;">
        <div style="font-weight: bold; font-size: 10pt; margin: 0; line-height: 1.2;">${companyName}</div>
        <div style="font-weight: bold; font-size: 9pt; margin: 0; line-height: 1.2;">${companyAddress}</div>
    </div>
    
    <!-- Título - margins reduzidos (20px->12px top, 15px->8px bottom), font-size 16pt->14pt -->
    <div style="text-align: center; margin: 12px 0 8px 0; box-sizing: border-box;">
        <div style="border-top: 2px solid #000; margin-bottom: 6px;"></div>
        <h2 style="margin: 6px 0; font-size: 12pt; font-weight: bold; line-height: 1.2;">PEDIDO DE DEMISSÃO</h2>
        <div style="border-bottom: 2px solid #000; margin-top: 6px;"></div>
    </div>
    
    <!-- Parágrafo de identificação - line-height 1.5->1.3, margin 15px->8px -->
    <div style="text-align: justify; margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 0 0 6px 0; line-height: 1.5;">Eu, <strong>${employeeName}</strong>, brasileiro(a), portador(a) do CPF <strong>${cpf}</strong> 
        e Carteira de Trabalho <strong>${ctps}</strong>, na função de <strong>${employeePosition}</strong>, 
        venho por meio deste comunicar minha decisão de pedir demissão do cargo que 
        ocupo nesta empresa.</p>
    </div>
    
    <!-- Lista de valores devidos - margins reduzidos (12px->8px), line-height 1.5->1.3 -->
    <div style="text-align: justify; margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 0 0 4px 0; line-height: 1.5;">Solicito que sejam calculados os valores devidos referentes a:</p>
        <ul style="margin: 4px 0 0 18px; padding: 0; line-height: 1.5;">
            <li style="margin: 2px 0; line-height: 1.5;">Saldo de salário</li>
            <li style="margin: 2px 0; line-height: 1.5;">Férias proporcionais + 1/3 constitucional</li>
            <li style="margin: 2px 0; line-height: 1.5;">13º salário proporcional</li>
            <li style="margin: 2px 0; line-height: 1.5;">${noticePeriodText}</li>
        </ul>
    </div>
    
    <!-- Data de desligamento - margin 12px->8px -->
    <div style="text-align: justify; margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 0; line-height: 1.5;">Data efetiva do desligamento: <strong>${effectiveDate}</strong></p>
    </div>
    
    <!-- Declaração FGTS - margin 12px->8px, line-height 1.5->1.3 -->
    <div style="text-align: justify; margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 0; line-height: 1.5;">Declaro estar ciente de que, no pedido de demissão por iniciativa do empregado,
        não há direito à multa de 40% do FGTS nem ao seguro-desemprego, conforme 
        legislação trabalhista vigente. Os direitos trabalhistas limitam-se às verbas 
        mencionadas acima, salvo disposições específicas em convenção coletiva ou 
        acordo individual.</p>
    </div>
    
    <!-- Disponibilidade - margin 12px->8px -->
    <div style="text-align: justify; margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 0; line-height: 1.5;">Estou disponível para os procedimentos de desligamento conforme estabelecido 
        pela legislação trabalhista e normas internas da empresa.</p>
    </div>
    
    <!-- Separador - increased margin to prevent overlap -->
    <div style="border-top: 2px solid #000; margin: 18px 0;"></div>
    
    <!-- Local e data - increased margin for better spacing -->
    <div style="margin: 12px 0; box-sizing: border-box;">
        <p style="margin: 0; line-height: 1.5;">${locationAndDate}</p>
    </div>
    
    <!-- Assinatura do funcionário - increased margins for better centering, page-break-inside: avoid -->
    <div style="margin: 28px 0 16px 0; page-break-inside: avoid; box-sizing: border-box;">
        <div style="border-top: 1px solid #000; width: 280px; margin: 0 auto;"></div>
        <p style="text-align: center; margin-top: 4px; line-height: 1.2;">Assinatura do Funcionário</p>
    </div>
    
    <!-- Separador - increased margin to prevent overlap -->
    <div style="border-top: 2px solid #000; margin: 18px 0;"></div>
    
    <!-- Seção de recebimento - increased margin for better spacing below separator, page-break-inside: avoid -->
    <div style="margin: 14px 0; page-break-inside: avoid; box-sizing: border-box;">
        <p style="margin: 2px 0; line-height: 1.5;">Recebido por: ___________________________________________</p>
        <p style="margin: 2px 0; line-height: 1.5;">Cargo: ___________________________________________________</p>
        <p style="margin: 2px 0; line-height: 1.5;">Data: __/__/______</p>
    </div>
</div>`;
    }
    
    // Escapar HTML para prevenir XSS
    escapeHtml(text) {
        if (typeof text !== 'string') return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    // 2. SOLICITAÇÃO DE FÉRIAS
    generateVacationRequest(data) {
        const period = data.vacationPeriod || '(período a ser definido)';
        const days = data.vacationDays || '30';
        const companyName = this.escapeHtml(data.companyName ? data.companyName.toUpperCase() : '[NOME DA EMPRESA]');
        const companyAddress = this.escapeHtml(data.companyAddress || '[ENDEREÇO DA EMPRESA]');
        const employeeName = this.escapeHtml(data.employeeName || '[NOME DO FUNCIONÁRIO]');
        const employeePosition = this.escapeHtml(data.employeePosition || '[CARGO]');
        const locationAndDate = this.formatLocationAndDate(data.companyAddress, data.documentDateFormatted);

        // Template otimizado para caber em EXATAMENTE 1 página A4
        return `<div style="${this.DOCUMENT_CONTAINER_STYLE}">
    <!-- Cabeçalho da empresa -->
    <div style="text-align: center; margin-bottom: 8px; box-sizing: border-box;">
        <div style="font-weight: bold; font-size: 10pt; margin: 0; line-height: 1.2;">${companyName}</div>
        <div style="font-weight: bold; font-size: 9pt; margin: 0; line-height: 1.2;">${companyAddress}</div>
    </div>
    
    <!-- Título -->
    <div style="text-align: center; margin: 12px 0 8px 0; box-sizing: border-box;">
        <div style="border-top: 2px solid #000; margin-bottom: 6px;"></div>
        <h2 style="margin: 6px 0; font-size: 12pt; font-weight: bold; line-height: 1.2;">SOLICITAÇÃO DE FÉRIAS</h2>
        <div style="border-bottom: 2px solid #000; margin-top: 6px;"></div>
    </div>
    
    <!-- Texto principal -->
    <div style="text-align: justify; margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 0 0 6px 0; line-height: 1.5;">Eu, <strong>${employeeName}</strong>, funcionário(a) desta empresa no cargo de 
        <strong>${employeePosition}</strong>, venho por meio deste solicitar o gozo de minhas 
        férias referentes ao período aquisitivo vigente.</p>
    </div>
    
    <!-- Período e dias -->
    <div style="text-align: justify; margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 0 0 4px 0; line-height: 1.5;">Solicito que as férias sejam concedidas no seguinte período: <strong>${period}</strong></p>
        <p style="margin: 0; line-height: 1.5;">Quantidade de dias: <strong>${days} dias</strong></p>
    </div>
    
    <!-- Declaração -->
    <div style="text-align: justify; margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 0 0 4px 0; line-height: 1.5;">Declaro estar ciente de que, conforme legislação trabalhista:</p>
        <ul style="margin: 4px 0 0 18px; padding: 0; line-height: 1.5;">
            <li style="margin: 2px 0; line-height: 1.5;">As férias devem ser concedidas em até 12 meses após o período aquisitivo</li>
            <li style="margin: 2px 0; line-height: 1.5;">Receberei o valor correspondente com o adicional de 1/3 constitucional</li>
            <li style="margin: 2px 0; line-height: 1.5;">O período de férias pode ser dividido conforme acordo entre as partes</li>
        </ul>
    </div>
    
    <!-- Separador - increased margin to prevent overlap -->
    <div style="border-top: 2px solid #000; margin: 18px 0;"></div>
    
    <!-- Data - increased margin for better spacing -->
    <div style="margin: 12px 0; box-sizing: border-box;">
        <p style="margin: 0; line-height: 1.5;">${locationAndDate}</p>
    </div>
    
    <!-- Assinatura do funcionário - increased margins for better centering -->
    <div style="margin: 28px 0 16px 0; page-break-inside: avoid; box-sizing: border-box;">
        <div style="border-top: 1px solid #000; width: 280px; margin: 0 auto;"></div>
        <p style="text-align: center; margin-top: 4px; line-height: 1.2;">Assinatura do Funcionário</p>
    </div>
    
    <!-- Separador - increased margin to prevent overlap -->
    <div style="border-top: 2px solid #000; margin: 18px 0;"></div>
    
    <!-- Parecer departamento - increased margin for better spacing below separator -->
    <div style="margin: 14px 0; page-break-inside: avoid; box-sizing: border-box;">
        <p style="margin: 2px 0; line-height: 1.5;">Parecer do Departamento Pessoal: ___________________________________</p>
        <p style="margin: 2px 0; line-height: 1.5;">Data de Agendamento: __/__/______</p>
    </div>
</div>`;
    }

    // 3. ADVERTÊNCIA FORMAL
    generateWarningLetter(data) {
        const severityText = this.getSeverityText(data.severity);
        const incidentDate = data.incidentDate ? this.formatDate(data.incidentDate) : data.documentDateFormatted || this.formatDate(new Date());
        const companyName = this.escapeHtml(data.companyName ? data.companyName.toUpperCase() : '[NOME DA EMPRESA]');
        const companyAddress = this.escapeHtml(data.companyAddress || '[ENDEREÇO DA EMPRESA]');
        const employeeName = this.escapeHtml(data.employeeName || '[NOME DO FUNCIONÁRIO]');
        const employeePosition = this.escapeHtml(data.employeePosition || '[CARGO]');
        const warningReason = this.escapeHtml(data.warningReason || 'Conduta inadequada no ambiente de trabalho.');
        const locationAndDate = this.formatLocationAndDate(data.companyAddress, data.documentDateFormatted);

        // Template otimizado para caber em EXATAMENTE 1 página A4
        return `<div style="${this.DOCUMENT_CONTAINER_STYLE}">
    <!-- Cabeçalho da empresa -->
    <div style="text-align: center; margin-bottom: 8px; box-sizing: border-box;">
        <div style="font-weight: bold; font-size: 10pt; margin: 0; line-height: 1.2;">${companyName}</div>
        <div style="font-weight: bold; font-size: 9pt; margin: 0; line-height: 1.2;">${companyAddress}</div>
    </div>
    
    <!-- Título -->
    <div style="text-align: center; margin: 12px 0 8px 0; box-sizing: border-box;">
        <div style="border-top: 2px solid #000; margin-bottom: 6px;"></div>
        <h2 style="margin: 6px 0; font-size: 12pt; font-weight: bold; line-height: 1.2;">ADVERTÊNCIA FORMAL</h2>
        <div style="border-bottom: 2px solid #000; margin-top: 6px;"></div>
    </div>
    
    <!-- Dados do funcionário -->
    <div style="margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 2px 0; line-height: 1.5;">Para: <strong>${employeeName}</strong></p>
        <p style="margin: 2px 0; line-height: 1.5;">Cargo: <strong>${employeePosition}</strong></p>
        <p style="margin: 2px 0; line-height: 1.5;">Data da Ocorrência: <strong>${incidentDate}</strong></p>
        <p style="margin: 2px 0; line-height: 1.5;">Gravidade: <strong>${severityText}</strong></p>
    </div>
    
    <!-- Subtítulo -->
    <div style="text-align: center; margin: 10px 0 8px 0; box-sizing: border-box;">
        <div style="border-top: 2px solid #000; margin-bottom: 4px;"></div>
        <h3 style="margin: 4px 0; font-size: 12pt; font-weight: bold; line-height: 1.2;">COMUNICADO DE ADVERTÊNCIA</h3>
        <div style="border-bottom: 2px solid #000; margin-top: 4px;"></div>
    </div>
    
    <!-- Texto principal -->
    <div style="text-align: justify; margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 0 0 6px 0; line-height: 1.5;">A direção da empresa vem, por meio deste documento, formalizar uma advertência por:</p>
        <p style="margin: 6px 0; line-height: 1.5; font-style: italic;">"${warningReason}"</p>
        <p style="margin: 6px 0 0 0; line-height: 1.5;">Esta advertência é emitida com base no regulamento interno da empresa e na 
        legislação trabalhista vigente (CLT, art. 482). O objetivo desta medida 
        disciplinar é alertar sobre a necessidade de adequação de conduta e registrar 
        formalmente a ocorrência.</p>
    </div>
    
    <!-- Medidas disciplinares -->
    <div style="text-align: justify; margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 0 0 4px 0; line-height: 1.5;">Medidas disciplinares progressivas previstas no regulamento interno:</p>
        <ul style="margin: 4px 0 0 18px; padding: 0; line-height: 1.5;">
            <li style="margin: 2px 0; line-height: 1.5;">Advertência verbal (orientação)</li>
            <li style="margin: 2px 0; line-height: 1.5;">Advertência escrita formal</li>
            <li style="margin: 2px 0; line-height: 1.5;">Suspensão temporária</li>
            <li style="margin: 2px 0; line-height: 1.5;">Em casos graves ou reincidências, possibilidade de dispensa por justa causa</li>
        </ul>
    </div>
    
    <!-- Separador - increased margin to prevent overlap -->
    <div style="border-top: 2px solid #000; margin: 18px 0;"></div>
    
    <!-- Ciência - increased margin for better spacing -->
    <div style="text-align: justify; margin: 12px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 0; line-height: 1.5;">O funcionário está ciente do conteúdo desta advertência. Este documento deverá ser assinado em duas vias.</p>
    </div>
    
    <!-- Assinatura empresa - increased margins for better spacing -->
    <div style="margin: 20px 0 12px 0; page-break-inside: avoid; box-sizing: border-box;">
        <div style="border-top: 1px solid #000; width: 280px; margin: 0 auto;"></div>
        <p style="text-align: center; margin-top: 4px; line-height: 1.2;">Assinatura do Representante da Empresa</p>
        <p style="text-align: center; margin: 2px 0; line-height: 1.2; font-size: 9pt;">Cargo: ____________________________</p>
    </div>
    
    <!-- Separador - increased margin to prevent overlap -->
    <div style="border-top: 2px solid #000; margin: 18px 0;"></div>
    
    <!-- Subtítulo ciência - increased margin for better spacing below separator -->
    <div style="text-align: center; margin: 12px 0; box-sizing: border-box;">
        <h3 style="margin: 4px 0; font-size: 11pt; font-weight: bold; line-height: 1.2;">CIÊNCIA DO FUNCIONÁRIO</h3>
    </div>
    
    <!-- Declaração de ciência -->
    <div style="text-align: justify; margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 0; line-height: 1.5;">Declaro ter recebido e compreendido o conteúdo desta advertência.</p>
    </div>
    
    <!-- Data e assinatura funcionário -->
    <div style="margin: 8px 0; box-sizing: border-box;">
        <p style="margin: 2px 0; line-height: 1.5;">Data: __/__/______</p>
    </div>
    
    <div style="margin: 15px 0 8px 0; page-break-inside: avoid; box-sizing: border-box;">
        <div style="border-top: 1px solid #000; width: 280px; margin: 0 auto;"></div>
        <p style="text-align: center; margin-top: 4px; line-height: 1.2;">Assinatura do Funcionário</p>
    </div>
</div>`;
    }

    // 4. CONVOCATÓRIA DE REUNIÃO
    generateMeetingConvocation(data) {
        const meetingDate = data.meetingDate ? this.formatDate(data.meetingDate) : '(a definir)';
        const time = data.meetingTime || '(horário a definir)';
        const location = data.meetingLocation || 'Sala de Reuniões';
        const agenda = data.meetingAgenda || 
            '1. Abertura e apresentação dos objetivos\n2. Discussão sobre metas trimestrais\n3. Ajustes de processos internos\n4. Feedbacks e sugestões\n5. Encerramento';
        const companyName = this.escapeHtml(data.companyName ? data.companyName.toUpperCase() : '[NOME DA EMPRESA]');
        const companyAddress = this.escapeHtml(data.companyAddress || '[ENDEREÇO DA EMPRESA]');
        const employeeName = this.escapeHtml(data.employeeName || '[NOME DO FUNCIONÁRIO]');
        const employeePosition = this.escapeHtml(data.employeePosition || '[CARGO]');
        const locationAndDate = this.formatLocationAndDate(data.companyAddress, data.documentDateFormatted);
        
        // Converter agenda em lista HTML
        const agendaItems = agenda.split('\n').map(item => {
            const trimmed = item.trim();
            if (trimmed) {
                // Remove numeração/bullets (números, letras, hífen, asterisco, bullet)
                const content = trimmed.replace(/^[\d\w]+\.\s*|^[-*•]\s*/, '');
                return `<li style="margin: 2px 0; line-height: 1.5;">${this.escapeHtml(content)}</li>`;
            }
            return '';
        }).filter(item => item).join('');

        // Template otimizado para caber em EXATAMENTE 1 página A4
        return `<div style="${this.DOCUMENT_CONTAINER_STYLE}">
    <!-- Cabeçalho da empresa -->
    <div style="text-align: center; margin-bottom: 8px; box-sizing: border-box;">
        <div style="font-weight: bold; font-size: 10pt; margin: 0; line-height: 1.2;">${companyName}</div>
        <div style="font-weight: bold; font-size: 9pt; margin: 0; line-height: 1.2;">${companyAddress}</div>
    </div>
    
    <!-- Título -->
    <div style="text-align: center; margin: 12px 0 8px 0; box-sizing: border-box;">
        <div style="border-top: 2px solid #000; margin-bottom: 6px;"></div>
        <h2 style="margin: 6px 0; font-size: 12pt; font-weight: bold; line-height: 1.2;">CONVOCATÓRIA PARA REUNIÃO</h2>
        <div style="border-bottom: 2px solid #000; margin-top: 6px;"></div>
    </div>
    
    <!-- Cabeçalho do documento -->
    <div style="margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 2px 0; line-height: 1.5;">Para: Todos os funcionários do departamento</p>
        <p style="margin: 2px 0; line-height: 1.5;">De: <strong>${employeeName}</strong> - <strong>${employeePosition}</strong></p>
        <p style="margin: 2px 0; line-height: 1.5;">Data do Documento: ${locationAndDate}</p>
    </div>
    
    <!-- Subtítulo -->
    <div style="text-align: center; margin: 10px 0 8px 0; box-sizing: border-box;">
        <div style="border-top: 2px solid #000; margin-bottom: 4px;"></div>
        <h3 style="margin: 4px 0; font-size: 12pt; font-weight: bold; line-height: 1.2;">CONVOCAÇÃO</h3>
        <div style="border-bottom: 2px solid #000; margin-top: 4px;"></div>
    </div>
    
    <!-- Texto principal -->
    <div style="text-align: justify; margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 0; line-height: 1.5;">Convocamos todos os membros do departamento para uma reunião que será realizada:</p>
    </div>
    
    <!-- Detalhes da reunião -->
    <div style="margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 2px 0; line-height: 1.5;">Data: <strong>${meetingDate}</strong></p>
        <p style="margin: 2px 0; line-height: 1.5;">Hora: <strong>${time}</strong></p>
        <p style="margin: 2px 0; line-height: 1.5;">Local: <strong>${location}</strong></p>
    </div>
    
    <!-- Pauta da reunião -->
    <div style="margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 0 0 4px 0; line-height: 1.5;">Pauta da Reunião:</p>
        <ul style="margin: 4px 0 0 18px; padding: 0; line-height: 1.5;">
            ${agendaItems}
        </ul>
    </div>
    
    <!-- Confirmação -->
    <div style="text-align: justify; margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 0; line-height: 1.5;">Solicitamos a confirmação de presença até 24 horas antes da reunião.</p>
    </div>
    
    <!-- Separador - increased margin to prevent overlap -->
    <div style="border-top: 2px solid #000; margin: 18px 0;"></div>
    
    <!-- Assinatura - increased margin for better spacing -->
    <div style="margin: 14px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 0 0 4px 0; line-height: 1.5;">Atenciosamente,</p>
    </div>
    
    <div style="margin: 20px 0 12px 0; page-break-inside: avoid; box-sizing: border-box;">
        <div style="border-top: 1px solid #000; width: 280px; margin: 0 auto;"></div>
        <p style="text-align: center; margin-top: 4px; line-height: 1.2;">${employeeName}</p>
        <p style="text-align: center; margin: 2px 0; line-height: 1.2; font-size: 9pt;">${employeePosition}</p>
    </div>
</div>`;
    }

    // 5. PEDIDO DE ALTERAÇÃO DE JORNADA OU TURNO
    generateShiftChangeRequest(data) {
        const companyName = this.escapeHtml(data.companyName ? data.companyName.toUpperCase() : '[NOME DA EMPRESA]');
        const companyAddress = this.escapeHtml(data.companyAddress || '[ENDEREÇO DA EMPRESA]');
        const employeeName = this.escapeHtml(data.employeeName || '[NOME DO FUNCIONÁRIO]');
        const employeePosition = this.escapeHtml(data.employeePosition || '[CARGO]');
        const sector = this.escapeHtml(data.sector || '[SETOR]');
        const currentShift = this.escapeHtml(data.currentShift || '[TURNO ATUAL]');
        const desiredShift = this.escapeHtml(data.desiredShift || '[TURNO DESEJADO]');
        const justification = this.escapeHtml(data.justification || '[JUSTIFICATIVA]');
        const startDate = this.formatDate(data.startDate);
        const locationAndDate = this.formatLocationAndDate(data.companyAddress, data.documentDateFormatted);

        return `<div style="${this.DOCUMENT_CONTAINER_STYLE}">
    <div style="text-align: center; margin-bottom: 8px; box-sizing: border-box;">
        <div style="font-weight: bold; font-size: 10pt; margin: 0; line-height: 1.2;">${companyName}</div>
        <div style="font-weight: bold; font-size: 9pt; margin: 0; line-height: 1.2;">${companyAddress}</div>
    </div>
    
    <div style="text-align: center; margin: 12px 0 8px 0; box-sizing: border-box;">
        <div style="border-top: 2px solid #000; margin-bottom: 6px;"></div>
        <h2 style="margin: 6px 0; font-size: 12pt; font-weight: bold; line-height: 1.2;">PEDIDO DE ALTERAÇÃO DE JORNADA OU TURNO</h2>
        <div style="border-bottom: 2px solid #000; margin-top: 6px;"></div>
    </div>
    
    <div style="text-align: justify; margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 0 0 6px 0; line-height: 1.5;">Eu, <strong>${employeeName}</strong>, ocupante do cargo de <strong>${employeePosition}</strong>, 
        lotado(a) no setor <strong>${sector}</strong>, venho por meio deste solicitar alteração de jornada de trabalho conforme detalhado abaixo:</p>
    </div>
    
    <div style="margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 2px 0; line-height: 1.5;">Turno Atual: <strong>${currentShift}</strong></p>
        <p style="margin: 2px 0; line-height: 1.5;">Turno Desejado: <strong>${desiredShift}</strong></p>
        <p style="margin: 2px 0; line-height: 1.5;">Data de Início Desejada: <strong>${startDate}</strong></p>
    </div>
    
    <div style="text-align: justify; margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 0 0 4px 0; line-height: 1.5;">Justificativa:</p>
        <p style="margin: 0; line-height: 1.5; font-style: italic;">"${justification}"</p>
    </div>
    
    <div style="border-top: 2px solid #000; margin: 18px 0;"></div>
    
    <div style="margin: 12px 0; box-sizing: border-box;">
        <p style="margin: 0; line-height: 1.5;">${locationAndDate}</p>
    </div>
    
    <div style="margin: 28px 0 16px 0; page-break-inside: avoid; box-sizing: border-box;">
        <div style="border-top: 1px solid #000; width: 280px; margin: 0 auto;"></div>
        <p style="text-align: center; margin-top: 4px; line-height: 1.2;">${employeeName}</p>
        <p style="text-align: center; margin: 2px 0; line-height: 1.2; font-size: 9pt;">${employeePosition}</p>
    </div>
</div>`;
    }

    // 6. PEDIDO DE REEMBOLSO DE DESPESAS
    generateExpenseReimbursement(data) {
        const companyName = this.escapeHtml(data.companyName ? data.companyName.toUpperCase() : '[NOME DA EMPRESA]');
        const companyAddress = this.escapeHtml(data.companyAddress || '[ENDEREÇO DA EMPRESA]');
        const employeeName = this.escapeHtml(data.employeeName || '[NOME DO FUNCIONÁRIO]');
        const employeePosition = this.escapeHtml(data.employeePosition || '[CARGO]');
        const sector = this.escapeHtml(data.sector || '[SETOR]');
        const expenseType = this.escapeHtml(data.expenseType || '[TIPO DE DESPESA]');
        const expenseDate = this.formatDate(data.expenseDate);
        const expenseValue = data.expenseValue ? `R$ ${parseFloat(data.expenseValue).toFixed(2).replace('.', ',')}` : '[VALOR]';
        const expenseReason = this.escapeHtml(data.expenseReason || '[MOTIVO]');
        const locationAndDate = this.formatLocationAndDate(data.companyAddress, data.documentDateFormatted);

        return `<div style="${this.DOCUMENT_CONTAINER_STYLE}">
    <div style="text-align: center; margin-bottom: 8px; box-sizing: border-box;">
        <div style="font-weight: bold; font-size: 10pt; margin: 0; line-height: 1.2;">${companyName}</div>
        <div style="font-weight: bold; font-size: 9pt; margin: 0; line-height: 1.2;">${companyAddress}</div>
    </div>
    
    <div style="text-align: center; margin: 12px 0 8px 0; box-sizing: border-box;">
        <div style="border-top: 2px solid #000; margin-bottom: 6px;"></div>
        <h2 style="margin: 6px 0; font-size: 12pt; font-weight: bold; line-height: 1.2;">PEDIDO DE REEMBOLSO DE DESPESAS</h2>
        <div style="border-bottom: 2px solid #000; margin-top: 6px;"></div>
    </div>
    
    <div style="text-align: justify; margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 0 0 6px 0; line-height: 1.5;">Eu, <strong>${employeeName}</strong>, ocupante do cargo de <strong>${employeePosition}</strong>, 
        lotado(a) no setor <strong>${sector}</strong>, venho solicitar o reembolso de despesas conforme detalhado abaixo:</p>
    </div>
    
    <div style="margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 2px 0; line-height: 1.5;">Tipo de Despesa: <strong>${expenseType}</strong></p>
        <p style="margin: 2px 0; line-height: 1.5;">Data da Despesa: <strong>${expenseDate}</strong></p>
        <p style="margin: 2px 0; line-height: 1.5;">Valor: <strong>${expenseValue}</strong></p>
    </div>
    
    <div style="text-align: justify; margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 0 0 4px 0; line-height: 1.5;">Motivo:</p>
        <p style="margin: 0; line-height: 1.5; font-style: italic;">"${expenseReason}"</p>
    </div>
    
    <div style="text-align: justify; margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 0; line-height: 1.5;">Declaro que a despesa foi realizada em benefício da empresa e que possuo os comprovantes necessários.</p>
    </div>
    
    <div style="border-top: 2px solid #000; margin: 18px 0;"></div>
    
    <div style="margin: 12px 0; box-sizing: border-box;">
        <p style="margin: 0; line-height: 1.5;">${locationAndDate}</p>
    </div>
    
    <div style="margin: 28px 0 16px 0; page-break-inside: avoid; box-sizing: border-box;">
        <div style="border-top: 1px solid #000; width: 280px; margin: 0 auto;"></div>
        <p style="text-align: center; margin-top: 4px; line-height: 1.2;">${employeeName}</p>
        <p style="text-align: center; margin: 2px 0; line-height: 1.2; font-size: 9pt;">${employeePosition}</p>
    </div>
</div>`;
    }

    // 7. SOLICITAÇÃO DE BENEFÍCIOS
    generateBenefitsRequest(data) {
        const companyName = this.escapeHtml(data.companyName ? data.companyName.toUpperCase() : '[NOME DA EMPRESA]');
        const companyAddress = this.escapeHtml(data.companyAddress || '[ENDEREÇO DA EMPRESA]');
        const employeeName = this.escapeHtml(data.employeeName || '[NOME DO FUNCIONÁRIO]');
        const employeePosition = this.escapeHtml(data.employeePosition || '[CARGO]');
        const sector = this.escapeHtml(data.sector || '[SETOR]');
        const benefitType = this.escapeHtml(data.benefitType || '[TIPO DE BENEFÍCIO]');
        const justification = this.escapeHtml(data.justification || '[JUSTIFICATIVA]');
        const startDate = this.formatDate(data.startDate);
        const locationAndDate = this.formatLocationAndDate(data.companyAddress, data.documentDateFormatted);

        return `<div style="${this.DOCUMENT_CONTAINER_STYLE}">
    <div style="text-align: center; margin-bottom: 8px; box-sizing: border-box;">
        <div style="font-weight: bold; font-size: 10pt; margin: 0; line-height: 1.2;">${companyName}</div>
        <div style="font-weight: bold; font-size: 9pt; margin: 0; line-height: 1.2;">${companyAddress}</div>
    </div>
    
    <div style="text-align: center; margin: 12px 0 8px 0; box-sizing: border-box;">
        <div style="border-top: 2px solid #000; margin-bottom: 6px;"></div>
        <h2 style="margin: 6px 0; font-size: 12pt; font-weight: bold; line-height: 1.2;">SOLICITAÇÃO DE BENEFÍCIOS</h2>
        <div style="border-bottom: 2px solid #000; margin-top: 6px;"></div>
    </div>
    
    <div style="text-align: justify; margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 0 0 6px 0; line-height: 1.5;">Eu, <strong>${employeeName}</strong>, ocupante do cargo de <strong>${employeePosition}</strong>, 
        lotado(a) no setor <strong>${sector}</strong>, venho solicitar o benefício conforme detalhado abaixo:</p>
    </div>
    
    <div style="margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 2px 0; line-height: 1.5;">Tipo de Benefício: <strong>${benefitType}</strong></p>
        <p style="margin: 2px 0; line-height: 1.5;">Data de Início Desejada: <strong>${startDate}</strong></p>
    </div>
    
    <div style="text-align: justify; margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 0 0 4px 0; line-height: 1.5;">Justificativa:</p>
        <p style="margin: 0; line-height: 1.5; font-style: italic;">"${justification}"</p>
    </div>
    
    <div style="border-top: 2px solid #000; margin: 18px 0;"></div>
    
    <div style="margin: 12px 0; box-sizing: border-box;">
        <p style="margin: 0; line-height: 1.5;">${locationAndDate}</p>
    </div>
    
    <div style="margin: 28px 0 16px 0; page-break-inside: avoid; box-sizing: border-box;">
        <div style="border-top: 1px solid #000; width: 280px; margin: 0 auto;"></div>
        <p style="text-align: center; margin-top: 4px; line-height: 1.2;">${employeeName}</p>
        <p style="text-align: center; margin: 2px 0; line-height: 1.2; font-size: 9pt;">${employeePosition}</p>
    </div>
</div>`;
    }

    // 8. PEDIDO DE LICENÇA MATERNIDADE/PATERNIDADE
    generateMaternityLeave(data) {
        const companyName = this.escapeHtml(data.companyName ? data.companyName.toUpperCase() : '[NOME DA EMPRESA]');
        const companyAddress = this.escapeHtml(data.companyAddress || '[ENDEREÇO DA EMPRESA]');
        const employeeName = this.escapeHtml(data.employeeName || '[NOME DO FUNCIONÁRIO]');
        const employeePosition = this.escapeHtml(data.employeePosition || '[CARGO]');
        const sector = this.escapeHtml(data.sector || '[SETOR]');
        const startDate = this.formatDate(data.startDate);
        const duration = this.escapeHtml(data.duration || '[DURAÇÃO]');
        const leaveType = this.escapeHtml(data.leaveType || '[TIPO DE LICENÇA]');
        const justification = data.justification ? this.escapeHtml(data.justification) : '';
        const locationAndDate = this.formatLocationAndDate(data.companyAddress, data.documentDateFormatted);

        return `<div style="${this.DOCUMENT_CONTAINER_STYLE}">
    <div style="text-align: center; margin-bottom: 8px; box-sizing: border-box;">
        <div style="font-weight: bold; font-size: 10pt; margin: 0; line-height: 1.2;">${companyName}</div>
        <div style="font-weight: bold; font-size: 9pt; margin: 0; line-height: 1.2;">${companyAddress}</div>
    </div>
    
    <div style="text-align: center; margin: 12px 0 8px 0; box-sizing: border-box;">
        <div style="border-top: 2px solid #000; margin-bottom: 6px;"></div>
        <h2 style="margin: 6px 0; font-size: 12pt; font-weight: bold; line-height: 1.2;">PEDIDO DE LICENÇA MATERNIDADE/PATERNIDADE</h2>
        <div style="border-bottom: 2px solid #000; margin-top: 6px;"></div>
    </div>
    
    <div style="text-align: justify; margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 0 0 6px 0; line-height: 1.5;">Eu, <strong>${employeeName}</strong>, ocupante do cargo de <strong>${employeePosition}</strong>, 
        lotado(a) no setor <strong>${sector}</strong>, venho solicitar licença conforme previsto na CLT:</p>
    </div>
    
    <div style="margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 2px 0; line-height: 1.5;">Tipo de Licença: <strong>${leaveType}</strong></p>
        <p style="margin: 2px 0; line-height: 1.5;">Data de Início: <strong>${startDate}</strong></p>
        <p style="margin: 2px 0; line-height: 1.5;">Duração: <strong>${duration}</strong></p>
    </div>
    ${justification ? `
    <div style="text-align: justify; margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 0 0 4px 0; line-height: 1.5;">Observações:</p>
        <p style="margin: 0; line-height: 1.5; font-style: italic;">"${justification}"</p>
    </div>` : ''}
    
    <div style="text-align: justify; margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 0; line-height: 1.5; font-size: 9pt;">Conforme CLT: Licença-maternidade 120 dias (prorrogável para 180); Licença-paternidade 5 dias (prorrogável para 20 no Programa Empresa Cidadã).</p>
    </div>
    
    <div style="border-top: 2px solid #000; margin: 18px 0;"></div>
    
    <div style="margin: 12px 0; box-sizing: border-box;">
        <p style="margin: 0; line-height: 1.5;">${locationAndDate}</p>
    </div>
    
    <div style="margin: 28px 0 16px 0; page-break-inside: avoid; box-sizing: border-box;">
        <div style="border-top: 1px solid #000; width: 280px; margin: 0 auto;"></div>
        <p style="text-align: center; margin-top: 4px; line-height: 1.2;">${employeeName}</p>
        <p style="text-align: center; margin: 2px 0; line-height: 1.2; font-size: 9pt;">${employeePosition}</p>
    </div>
</div>`;
    }

    // 9. PEDIDO DE FLEXIBILIZAÇÃO DE JORNADA POR MOTIVO FAMILIAR
    generateFlexibleSchedule(data) {
        const companyName = this.escapeHtml(data.companyName ? data.companyName.toUpperCase() : '[NOME DA EMPRESA]');
        const companyAddress = this.escapeHtml(data.companyAddress || '[ENDEREÇO DA EMPRESA]');
        const employeeName = this.escapeHtml(data.employeeName || '[NOME DO FUNCIONÁRIO]');
        const employeePosition = this.escapeHtml(data.employeePosition || '[CARGO]');
        const sector = this.escapeHtml(data.sector || '[SETOR]');
        const reason = this.escapeHtml(data.reason || '[MOTIVO]');
        const period = this.escapeHtml(data.period || '[PERÍODO]');
        const flexibilizationType = this.escapeHtml(data.flexibilizationType || '[TIPO DE FLEXIBILIZAÇÃO]');
        const locationAndDate = this.formatLocationAndDate(data.companyAddress, data.documentDateFormatted);

        return `<div style="${this.DOCUMENT_CONTAINER_STYLE}">
    <div style="text-align: center; margin-bottom: 8px; box-sizing: border-box;">
        <div style="font-weight: bold; font-size: 10pt; margin: 0; line-height: 1.2;">${companyName}</div>
        <div style="font-weight: bold; font-size: 9pt; margin: 0; line-height: 1.2;">${companyAddress}</div>
    </div>
    
    <div style="text-align: center; margin: 12px 0 8px 0; box-sizing: border-box;">
        <div style="border-top: 2px solid #000; margin-bottom: 6px;"></div>
        <h2 style="margin: 6px 0; font-size: 12pt; font-weight: bold; line-height: 1.2;">PEDIDO DE FLEXIBILIZAÇÃO DE JORNADA</h2>
        <div style="border-bottom: 2px solid #000; margin-top: 6px;"></div>
    </div>
    
    <div style="text-align: justify; margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 0 0 6px 0; line-height: 1.5;">Eu, <strong>${employeeName}</strong>, ocupante do cargo de <strong>${employeePosition}</strong>, 
        lotado(a) no setor <strong>${sector}</strong>, venho solicitar flexibilização de jornada por motivo familiar:</p>
    </div>
    
    <div style="margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 2px 0; line-height: 1.5;">Tipo de Flexibilização: <strong>${flexibilizationType}</strong></p>
        <p style="margin: 2px 0; line-height: 1.5;">Período: <strong>${period}</strong></p>
    </div>
    
    <div style="text-align: justify; margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 0 0 4px 0; line-height: 1.5;">Motivo Familiar:</p>
        <p style="margin: 0; line-height: 1.5; font-style: italic;">"${reason}"</p>
    </div>
    
    <div style="border-top: 2px solid #000; margin: 18px 0;"></div>
    
    <div style="margin: 12px 0; box-sizing: border-box;">
        <p style="margin: 0; line-height: 1.5;">${locationAndDate}</p>
    </div>
    
    <div style="margin: 28px 0 16px 0; page-break-inside: avoid; box-sizing: border-box;">
        <div style="border-top: 1px solid #000; width: 280px; margin: 0 auto;"></div>
        <p style="text-align: center; margin-top: 4px; line-height: 1.2;">${employeeName}</p>
        <p style="text-align: center; margin: 2px 0; line-height: 1.2; font-size: 9pt;">${employeePosition}</p>
    </div>
</div>`;
    }

    // 10. SOLICITAÇÃO DE INTERVALO PARA AMAMENTAÇÃO
    generateBreastfeedingInterval(data) {
        const companyName = this.escapeHtml(data.companyName ? data.companyName.toUpperCase() : '[NOME DA EMPRESA]');
        const companyAddress = this.escapeHtml(data.companyAddress || '[ENDEREÇO DA EMPRESA]');
        const employeeName = this.escapeHtml(data.employeeName || '[NOME DO FUNCIONÁRIO]');
        const employeePosition = this.escapeHtml(data.employeePosition || '[CARGO]');
        const sector = this.escapeHtml(data.sector || '[SETOR]');
        const intervalPeriod = this.escapeHtml(data.intervalPeriod || '[PERÍODO DE INTERVALO]');
        const observations = data.observations ? this.escapeHtml(data.observations) : '';
        const locationAndDate = this.formatLocationAndDate(data.companyAddress, data.documentDateFormatted);

        return `<div style="${this.DOCUMENT_CONTAINER_STYLE}">
    <div style="text-align: center; margin-bottom: 8px; box-sizing: border-box;">
        <div style="font-weight: bold; font-size: 10pt; margin: 0; line-height: 1.2;">${companyName}</div>
        <div style="font-weight: bold; font-size: 9pt; margin: 0; line-height: 1.2;">${companyAddress}</div>
    </div>
    
    <div style="text-align: center; margin: 12px 0 8px 0; box-sizing: border-box;">
        <div style="border-top: 2px solid #000; margin-bottom: 6px;"></div>
        <h2 style="margin: 6px 0; font-size: 12pt; font-weight: bold; line-height: 1.2;">SOLICITAÇÃO DE INTERVALO PARA AMAMENTAÇÃO</h2>
        <div style="border-bottom: 2px solid #000; margin-top: 6px;"></div>
    </div>
    
    <div style="text-align: justify; margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 0 0 6px 0; line-height: 1.5;">Eu, <strong>${employeeName}</strong>, ocupante do cargo de <strong>${employeePosition}</strong>, 
        lotado(a) no setor <strong>${sector}</strong>, venho solicitar intervalo para amamentação conforme previsto no art. 396 da CLT:</p>
    </div>
    
    <div style="margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 2px 0; line-height: 1.5;">Período de Intervalo: <strong>${intervalPeriod}</strong></p>
    </div>
    ${observations ? `
    <div style="text-align: justify; margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 0 0 4px 0; line-height: 1.5;">Observações:</p>
        <p style="margin: 0; line-height: 1.5; font-style: italic;">"${observations}"</p>
    </div>` : ''}
    
    <div style="text-align: justify; margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 0; line-height: 1.5; font-size: 9pt;">Art. 396 da CLT: Para amamentar seu filho até 6 meses de idade, a mulher terá direito, durante a jornada de trabalho, a dois descansos especiais de meia hora cada um.</p>
    </div>
    
    <div style="border-top: 2px solid #000; margin: 18px 0;"></div>
    
    <div style="margin: 12px 0; box-sizing: border-box;">
        <p style="margin: 0; line-height: 1.5;">${locationAndDate}</p>
    </div>
    
    <div style="margin: 28px 0 16px 0; page-break-inside: avoid; box-sizing: border-box;">
        <div style="border-top: 1px solid #000; width: 280px; margin: 0 auto;"></div>
        <p style="text-align: center; margin-top: 4px; line-height: 1.2;">${employeeName}</p>
        <p style="text-align: center; margin: 2px 0; line-height: 1.2; font-size: 9pt;">${employeePosition}</p>
    </div>
</div>`;
    }

    // 11. PEDIDO DE AJUSTE DE HORÁRIO PARA PAIS/RESPONSÁVEIS
    generateParentScheduleAdjustment(data) {
        const companyName = this.escapeHtml(data.companyName ? data.companyName.toUpperCase() : '[NOME DA EMPRESA]');
        const companyAddress = this.escapeHtml(data.companyAddress || '[ENDEREÇO DA EMPRESA]');
        const employeeName = this.escapeHtml(data.employeeName || '[NOME DO FUNCIONÁRIO]');
        const employeePosition = this.escapeHtml(data.employeePosition || '[CARGO]');
        const sector = this.escapeHtml(data.sector || '[SETOR]');
        const adjustmentType = this.escapeHtml(data.adjustmentType || '[TIPO DE AJUSTE]');
        const dates = this.escapeHtml(data.dates || '[DATAS]');
        const reason = this.escapeHtml(data.reason || '[MOTIVO]');
        const locationAndDate = this.formatLocationAndDate(data.companyAddress, data.documentDateFormatted);

        return `<div style="${this.DOCUMENT_CONTAINER_STYLE}">
    <div style="text-align: center; margin-bottom: 8px; box-sizing: border-box;">
        <div style="font-weight: bold; font-size: 10pt; margin: 0; line-height: 1.2;">${companyName}</div>
        <div style="font-weight: bold; font-size: 9pt; margin: 0; line-height: 1.2;">${companyAddress}</div>
    </div>
    
    <div style="text-align: center; margin: 12px 0 8px 0; box-sizing: border-box;">
        <div style="border-top: 2px solid #000; margin-bottom: 6px;"></div>
        <h2 style="margin: 6px 0; font-size: 12pt; font-weight: bold; line-height: 1.2;">PEDIDO DE AJUSTE DE HORÁRIO PARA PAIS/RESPONSÁVEIS</h2>
        <div style="border-bottom: 2px solid #000; margin-top: 6px;"></div>
    </div>
    
    <div style="text-align: justify; margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 0 0 6px 0; line-height: 1.5;">Eu, <strong>${employeeName}</strong>, ocupante do cargo de <strong>${employeePosition}</strong>, 
        lotado(a) no setor <strong>${sector}</strong>, venho solicitar ajuste de horário para acompanhamento de filhos:</p>
    </div>
    
    <div style="margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 2px 0; line-height: 1.5;">Tipo de Ajuste: <strong>${adjustmentType}</strong></p>
        <p style="margin: 2px 0; line-height: 1.5;">Datas: <strong>${dates}</strong></p>
    </div>
    
    <div style="text-align: justify; margin: 8px 0; line-height: 1.5; box-sizing: border-box;">
        <p style="margin: 0 0 4px 0; line-height: 1.5;">Motivo:</p>
        <p style="margin: 0; line-height: 1.5; font-style: italic;">"${reason}"</p>
    </div>
    
    <div style="border-top: 2px solid #000; margin: 18px 0;"></div>
    
    <div style="margin: 12px 0; box-sizing: border-box;">
        <p style="margin: 0; line-height: 1.5;">${locationAndDate}</p>
    </div>
    
    <div style="margin: 28px 0 16px 0; page-break-inside: avoid; box-sizing: border-box;">
        <div style="border-top: 1px solid #000; width: 280px; margin: 0 auto;"></div>
        <p style="text-align: center; margin-top: 4px; line-height: 1.2;">${employeeName}</p>
        <p style="text-align: center; margin: 2px 0; line-height: 1.2; font-size: 9pt;">${employeePosition}</p>
    </div>
</div>`;
    }

    // FUNÇÕES AUXILIARES
    formatDate(dateString) {
        if (!dateString || dateString === '(a definir)') return dateString || '';
        
        try {
            // Se já está no formato DD/MM/AAAA, retornar como está
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
                return dateString;
            }
            
            let date;
            
            // Tentar parsear ISO string (YYYY-MM-DD ou formato completo)
            if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
                date = new Date(dateString);
            }
            // Tentar parsear formato DD-MM-YYYY
            else if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
                const [day, month, year] = dateString.split('-');
                date = new Date(year, month - 1, day);
            }
            // Tentar criar Date object diretamente para outros formatos
            else {
                date = new Date(dateString);
            }
            
            // Verificar se a data é válida
            if (isNaN(date.getTime())) {
                return dateString;
            }
            
            // Formatar para DD/MM/AAAA em pt-BR
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    }

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
    
    // Formatar data por extenso em português
    formatDateExtended(dateString) {
        if (!dateString) {
            dateString = new Date();
        }
        
        try {
            let date;
            
            // Se já for um objeto Date
            if (dateString instanceof Date) {
                date = dateString;
            }
            // Tentar parsear ISO string (YYYY-MM-DD ou formato completo)
            else if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
                date = new Date(dateString);
            }
            // Tentar parsear formato DD/MM/YYYY
            else if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
                const [day, month, year] = dateString.split('/');
                date = new Date(year, month - 1, day);
            }
            // Tentar criar Date object diretamente para outros formatos
            else {
                date = new Date(dateString);
            }
            
            // Verificar se a data é válida
            if (isNaN(date.getTime())) {
                date = new Date();
            }
            
            const day = String(date.getDate()).padStart(2, '0');
            const month = this.MONTHS_PT[date.getMonth()];
            const year = date.getFullYear();
            
            return `${day} de ${month} de ${year}`;
        } catch (e) {
            const now = new Date();
            const day = String(now.getDate()).padStart(2, '0');
            const month = this.MONTHS_PT[now.getMonth()];
            const year = now.getFullYear();
            return `${day} de ${month} de ${year}`;
        }
    }
    
    // Extrair cidade do endereço
    extractCity(address) {
        if (!address || address === '[ENDEREÇO DA EMPRESA]') {
            return 'São Paulo';
        }
        
        // Tentar extrair cidade do formato: "Rua X, 123 - Cidade/Estado"
        // ou "Av. Y, 456 - Cidade - Estado"
        // Suporta tanto hífen ASCII (-) quanto en-dash (–) para compatibilidade
        const patterns = [
            /[-–]\s*([A-Za-zÀ-ÿ\s]+)\s*[\/\-]/,  // Cidade antes de / ou -
            /[-–]\s*([A-Za-zÀ-ÿ\s]+)\s*$/,        // Cidade no final
        ];
        
        for (const pattern of patterns) {
            const match = address.match(pattern);
            if (match && match[1]) {
                return match[1].trim();
            }
        }
        
        // Se não conseguir extrair, retornar São Paulo como padrão
        return 'São Paulo';
    }
    
    // Formatar local e data no padrão brasileiro
    formatLocationAndDate(address, documentDate) {
        const city = this.extractCity(address);
        const dateExtended = this.formatDateExtended(documentDate);
        return `${city}, ${dateExtended}`;
    }

    // Geração de exemplo para cada tipo
    generateExample(modelType) {
        const examples = {
            companyName: 'Tech Solutions Ltda',
            companyAddress: 'Av. Paulista, 1000 - São Paulo/SP',
            employeeName: 'João da Silva',
            employeePosition: 'Analista de Sistemas',
            documentDate: new Date().toISOString().split('T')[0],
            documentDateFormatted: new Date().toLocaleDateString('pt-BR'),
            model: modelType
        };

        switch(modelType) {
            case 'demissao':
                examples.effectiveDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                examples.noticePeriod = 'trabalhado';
                examples.CPF = '123.456.789-00';
                examples.CTPS = '12345 - Série 0001';
                break;
            case 'ferias':
                examples.vacationPeriod = '01/12/2023 a 31/12/2023';
                examples.vacationDays = '30';
                break;
            case 'advertencia':
                examples.warningReason = 'Atrasos recorrentes no horário de entrada durante o mês de outubro.';
                examples.incidentDate = new Date().toISOString().split('T')[0];
                examples.severity = 'media';
                break;
            case 'reuniao':
                examples.meetingDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                examples.meetingTime = '14:00';
                examples.meetingLocation = 'Sala de Reuniões Principal';
                examples.meetingAgenda = '1. Abertura e boas-vindas\n2. Apresentação dos resultados do trimestre\n3. Discussão sobre novas metas\n4. Feedbacks da equipe\n5. Encerramento';
                break;
            case 'alteracao_jornada':
                examples.sector = 'Administrativo';
                examples.currentShift = 'Matutino (8h-12h e 14h-18h)';
                examples.desiredShift = 'Vespertino (14h-22h)';
                examples.justification = 'Necessidade de acompanhar filho em escola no período da manhã.';
                examples.startDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                break;
            case 'reembolso':
                examples.sector = 'Vendas';
                examples.expenseType = 'Combustível';
                examples.expenseDate = new Date().toISOString().split('T')[0];
                examples.expenseValue = '250.00';
                examples.expenseReason = 'Visita a clientes fora da cidade conforme orientação do gestor.';
                break;
            case 'beneficios':
                examples.sector = 'TI';
                examples.benefitType = 'Vale-refeição';
                examples.justification = 'Solicitação de inclusão no programa de benefícios da empresa.';
                examples.startDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                break;
            case 'licenca_maternidade':
                examples.sector = 'Recursos Humanos';
                examples.startDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                examples.duration = '120 dias';
                examples.leaveType = 'Licença Maternidade';
                examples.justification = 'Previsão de parto para o início do período solicitado.';
                break;
            case 'flexibilizacao_jornada':
                examples.sector = 'Marketing';
                examples.reason = 'Necessidade de levar filho(a) a tratamento médico regular.';
                examples.period = '3 meses';
                examples.flexibilizationType = 'Entrada às 9h e saída às 18h';
                break;
            case 'intervalo_amamentacao':
                examples.sector = 'Financeiro';
                examples.intervalPeriod = 'Dois intervalos de 30 minutos (10h e 15h)';
                examples.observations = 'Bebê com 3 meses de idade.';
                break;
            case 'ajuste_horario_pais':
                examples.sector = 'Operações';
                examples.adjustmentType = 'Saída antecipada às quintas-feiras';
                examples.dates = 'Todas as quintas-feiras até dezembro/2026';
                examples.reason = 'Acompanhamento de filho em sessões de terapia.';
                break;
            default:
                examples.effectiveDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                examples.noticePeriod = 'trabalhado';
        }

        return this.generateDocument(examples);
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    if (!window.documentGenerator) {
        window.documentGenerator = new DocumentGenerator();
    }
});

// Exportar para uso global
window.DocumentGenerator = DocumentGenerator;
