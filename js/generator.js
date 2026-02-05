// generator.js - Geração específica de documentos para ModeloTrabalhista

class DocumentGenerator {
    constructor() {
        // Constantes para validação de tamanho de campos
        this.MAX_SHORT_TEXT_LENGTH = 500;
        this.MAX_LONG_TEXT_LENGTH = 2000;
        this.LONG_TEXT_FIELDS = ['Reason', 'Agenda', 'Conditions', 'Description'];
        
        // Array de meses em português para formatação de datas
        this.MONTHS_PT = [
            'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
            'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
        ];
        
        this.templates = {
            demissao: this.generateResignationLetter.bind(this),
            ferias: this.generateVacationRequest.bind(this),
            advertencia: this.generateWarningLetter.bind(this),
            atestado: this.generateCertificate.bind(this),
            rescisao: this.generateSeveranceAgreement.bind(this),
            reuniao: this.generateMeetingConvocation.bind(this)
        };
        
        // Campos obrigatórios por tipo de documento
        this.REQUIRED_FIELDS = {
            demissao: ['employeeName', 'employeePosition', 'companyName', 'effectiveDate', 'noticePeriod', 'CPF', 'CTPS'],
            ferias: ['employeeName', 'employeePosition', 'vacationPeriod', 'vacationDays'],
            advertencia: ['employeeName', 'employeePosition', 'incidentDate', 'warningReason', 'severity'],
            atestado: ['employeeName', 'employeePosition', 'certificateStart', 'certificateEnd', 'certificateReason'],
            rescisao: ['employeeName', 'employeePosition', 'companyName', 'severanceValue', 'paymentDate', 'CPF', 'CTPS'],
            reuniao: ['meetingDate', 'meetingTime', 'meetingLocation', 'meetingAgenda']
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
            atestado: {
                name: 'Atestado Informal',
                description: 'Documento para atestar ausência ou justificar falta ao trabalho.',
                instructions: 'Informe o período de ausência e o motivo. Este é um documento informal e não substitui atestados médicos quando necessário.',
                legalNotice: 'Atestados médicos têm validade legal específica. Este documento serve apenas para registro interno de ausências justificadas não médicas.'
            },
            rescisao: {
                name: 'Acordo de Rescisão',
                description: 'Documento para formalizar acordo de rescisão contratual entre empregado e empregador.',
                instructions: 'Informe todos os valores e condições do acordo. Ambas as partes devem estar cientes dos termos. Este documento não substitui assessoria jurídica.',
                legalNotice: 'A rescisão por acordo possui regras específicas na CLT. Recomenda-se sempre consultar um advogado trabalhista para garantir que todos os direitos sejam respeitados.'
            },
            reuniao: {
                name: 'Convocatória de Reunião',
                description: 'Documento para convocar formalmente reuniões com a equipe.',
                instructions: 'Informe data, hora, local e pauta da reunião. Solicite confirmação de presença dos participantes.',
                legalNotice: 'Este é um documento de comunicação interna. A presença em reuniões pode ser obrigatória conforme regras da empresa.'
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
                certificateStart: 'Data de Início',
                certificateEnd: 'Data de Término',
                certificateReason: 'Motivo do Atestado',
                severanceValue: 'Valor da Rescisão',
                paymentDate: 'Data de Pagamento',
                meetingDate: 'Data da Reunião',
                meetingTime: 'Horário',
                meetingLocation: 'Local',
                meetingAgenda: 'Pauta da Reunião'
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

        return `<div style="font-family: Arial, sans-serif; line-height: 1.4; width: 100%; margin: 0; padding: 20px; box-sizing: border-box; page-break-inside: avoid;">
    <div style="text-align: center; margin-bottom: 15px;">
        <div style="font-weight: bold; font-size: 11pt;">${companyName}</div>
        <div style="font-weight: bold; font-size: 10pt;">${companyAddress}</div>
    </div>
    
    <div style="text-align: center; margin: 20px 0 15px 0;">
        <div style="border-top: 2px solid #000; margin-bottom: 10px;"></div>
        <h2 style="margin: 10px 0; font-size: 16px; font-weight: bold;">PEDIDO DE DEMISSÃO</h2>
        <div style="border-bottom: 2px solid #000; margin-top: 10px;"></div>
    </div>
    
    <div style="text-align: justify; margin: 15px 0; line-height: 1.5;">
        <p style="margin: 0 0 10px 0;">Eu, <strong>${employeeName}</strong>, brasileiro(a), portador(a) do CPF <strong>${cpf}</strong> 
        e Carteira de Trabalho <strong>${ctps}</strong>, na função de <strong>${employeePosition}</strong>, 
        venho por meio deste comunicar minha decisão de pedir demissão do cargo que 
        ocupo nesta empresa.</p>
    </div>
    
    <div style="text-align: justify; margin: 12px 0; line-height: 1.5;">
        <p style="margin: 0 0 5px 0;">Solicito que sejam calculados os valores devidos referentes a:</p>
        <ul style="margin: 5px 0 0 20px; padding: 0;">
            <li style="margin: 3px 0;">Saldo de salário</li>
            <li style="margin: 3px 0;">Férias proporcionais + 1/3 constitucional</li>
            <li style="margin: 3px 0;">13º salário proporcional</li>
            <li style="margin: 3px 0;">${noticePeriodText}</li>
        </ul>
    </div>
    
    <div style="text-align: justify; margin: 12px 0; line-height: 1.5;">
        <p style="margin: 0;">Data efetiva do desligamento: <strong>${effectiveDate}</strong></p>
    </div>
    
    <div style="text-align: justify; margin: 12px 0; line-height: 1.5;">
        <p style="margin: 0;">Declaro estar ciente de que, no pedido de demissão por iniciativa do empregado,
        não há direito à multa de 40% do FGTS nem ao seguro-desemprego, conforme 
        legislação trabalhista vigente. Os direitos trabalhistas limitam-se às verbas 
        mencionadas acima, salvo disposições específicas em convenção coletiva ou 
        acordo individual.</p>
    </div>
    
    <div style="text-align: justify; margin: 12px 0; line-height: 1.5;">
        <p style="margin: 0;">Estou disponível para os procedimentos de desligamento conforme estabelecido 
        pela legislação trabalhista e normas internas da empresa.</p>
    </div>
    
    <div style="border-top: 2px solid #000; margin: 20px 0;"></div>
    
    <div style="margin: 15px 0;">
        <p style="margin: 0;">${locationAndDate}</p>
    </div>
    
    <div style="margin: 35px 0 20px 0;">
        <div style="border-top: 1px solid #000; width: 300px; margin: 0 auto;"></div>
        <p style="text-align: center; margin-top: 5px;">Assinatura do Funcionário</p>
    </div>
    
    <div style="border-top: 2px solid #000; margin: 20px 0;"></div>
    
    <div style="margin: 15px 0;">
        <p style="margin: 3px 0;">Recebido por: ___________________________________________</p>
        <p style="margin: 3px 0;">Cargo: ___________________________________________________</p>
        <p style="margin: 3px 0;">Data: __/__/______</p>
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

        return `${data.companyName ? data.companyName.toUpperCase() : '[NOME DA EMPRESA]'}
${data.companyAddress || '[ENDEREÇO DA EMPRESA]'}

${'='.repeat(80)}
                           SOLICITAÇÃO DE FÉRIAS
${'='.repeat(80)}

Eu, ${data.employeeName || '[NOME DO FUNCIONÁRIO]'}, funcionário(a) desta empresa no cargo de 
${data.employeePosition || '[CARGO]'}, venho por meio deste solicitar o gozo de minhas 
férias referentes ao período aquisitivo vigente.

Solicito que as férias sejam concedidas no seguinte período: ${period}
Quantidade de dias: ${days} dias

Declaro estar ciente de que, conforme legislação trabalhista:
1. As férias devem ser concedidas em até 12 meses após o período aquisitivo
2. Receberei o valor correspondente com o adicional de 1/3 constitucional
3. O período de férias pode ser dividido conforme acordo entre as partes

${'='.repeat(80)}

Data: ${data.documentDateFormatted || this.formatDate(new Date())}

${'_'.repeat(42)}
Assinatura do Funcionário

${'='.repeat(80)}

Parecer do Departamento Pessoal: ${'_'.repeat(42)}
Data de Agendamento: __/__/______`;
    }

    // 3. ADVERTÊNCIA FORMAL
    generateWarningLetter(data) {
        const severityText = this.getSeverityText(data.severity);
        const incidentDate = data.incidentDate ? this.formatDate(data.incidentDate) : data.documentDateFormatted || this.formatDate(new Date());

        return `${data.companyName ? data.companyName.toUpperCase() : '[NOME DA EMPRESA]'}
${data.companyAddress || '[ENDEREÇO DA EMPRESA]'}

${'='.repeat(80)}
                             ADVERTÊNCIA FORMAL
${'='.repeat(80)}

Para: ${data.employeeName || '[NOME DO FUNCIONÁRIO]'}
Cargo: ${data.employeePosition || '[CARGO]'}
Data da Ocorrência: ${incidentDate}
Data do Documento: ${data.documentDateFormatted || this.formatDate(new Date())}
Gravidade: ${severityText}

${'='.repeat(80)}
                         COMUNICADO DE ADVERTÊNCIA
${'='.repeat(80)}

A direção da empresa vem, por meio deste documento, formalizar uma advertência 
por:

"${data.warningReason || 'Conduta inadequada no ambiente de trabalho.'}"

Esta advertência é emitida com base no regulamento interno da empresa e na 
legislação trabalhista vigente (CLT, art. 482). O objetivo desta medida 
disciplinar é alertar sobre a necessidade de adequação de conduta e registrar 
formalmente a ocorrência.

Esta advertência não implica automaticamente em demissão por justa causa, mas 
serve como registro formal que poderá ser considerado em caso de reincidência 
ou agravamento de conduta inadequada.

Medidas disciplinares progressivas previstas no regulamento interno:
1. Advertência verbal (orientação)
2. Advertência escrita formal
3. Suspensão temporária
4. Em casos graves ou reincidências, possibilidade de dispensa por justa causa,
   conforme análise específica e respaldo legal

${'='.repeat(80)}

O funcionário está ciente do conteúdo desta advertência e das disposições do
regulamento interno da empresa. Este documento deverá ser assinado em duas 
vias, ficando uma com a empresa e outra em poder do funcionário.

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

    // 4. ATESTADO
    generateCertificate(data) {
        const startDate = this.formatDate(data.certificateStart);
        const endDate = this.formatDate(data.certificateEnd);
        const period = startDate === endDate 
            ? `na data de ${startDate}`
            : `no período de ${startDate} a ${endDate}`;

        return `${data.companyName ? data.companyName.toUpperCase() : '[NOME DA EMPRESA]'}
${data.companyAddress || '[ENDEREÇO DA EMPRESA]'}

${'='.repeat(80)}
                                  ATESTADO
${'='.repeat(80)}

Atesto para os devidos fins que o(a) Sr(a). ${data.employeeName || '[NOME DO FUNCIONÁRIO]'}, 
ocupante do cargo de ${data.employeePosition || '[CARGO]'} nesta empresa, não compareceu 
ao trabalho ${period} devido a:

"${data.certificateReason || 'Assuntos pessoais que impossibilitaram a presença no trabalho.'}"

Este documento serve como justificativa para a ausência e não implica em 
qualquer responsabilidade trabalhista adicional, exceto se estabelecido em 
acordo ou convenção coletiva.

${'='.repeat(80)}

Data: ${data.documentDateFormatted || this.formatDate(new Date())}

${'_'.repeat(42)}
Assinatura do Responsável

Cargo: ${'_'.repeat(42)}`;
    }

    // 5. ACORDO DE RESCISÃO
    generateSeveranceAgreement(data) {
        const value = data.severanceValue ? `R$ ${parseFloat(data.severanceValue).toFixed(2).replace('.', ',')}` : 'a ser definido';
        const paymentDate = data.paymentDate ? this.formatDate(data.paymentDate) : '(a definir)';
        const conditions = data.additionalConditions ? `\n6. ${data.additionalConditions}` : '';
        const cpf = data.CPF || '[INFORME CPF]';
        const ctps = data.CTPS || '[INFORME CTPS]';

        return `${data.companyName ? data.companyName.toUpperCase() : '[NOME DA EMPRESA]'}
${data.companyAddress || '[ENDEREÇO DA EMPRESA]'}

${'='.repeat(80)}
                       ACORDO DE RESCISÃO CONTRATUAL
${'='.repeat(80)}

Entre ${data.companyName || '[NOME DA EMPRESA]'}, com sede em ${data.companyAddress || '[ENDEREÇO DA EMPRESA]'}, doravante 
denominada EMPRESA, e ${data.employeeName || '[NOME DO FUNCIONÁRIO]'}, portador(a) do CPF ${cpf} 
e Carteira de Trabalho ${ctps}, ocupante do cargo de 
${data.employeePosition || '[CARGO]'}, doravante denominado(a) FUNCIONÁRIO(A), celebra-se 
o presente acordo de rescisão contratual, sob as seguintes condições:

1. As partes, de comum acordo, resolvem o contrato de trabalho vigente.
2. A EMPRESA pagará ao FUNCIONÁRIO(A) a importância de ${value}, 
   correspondente a todos os direitos trabalhistas decorrentes da rescisão.
3. Data para pagamento: ${paymentDate}
4. O FUNCIONÁRIO(A) declara estar ciente de que, com a assinatura deste 
   acordo, renuncia a qualquer ação trabalhista referente ao período 
   contratual.
5. O FUNCIONÁRIO(A) deverá devolver todos os bens da empresa em seu poder 
   até a data do desligamento.${conditions}

As partes declaram estar cientes do teor deste acordo e assinam-no em duas 
vias de igual teor.

${'='.repeat(80)}

Data: ${data.documentDateFormatted || this.formatDate(new Date())}

${'_'.repeat(42)}
Representante Legal da Empresa
Cargo: ${'_'.repeat(40)}

${'_'.repeat(42)}
${data.employeeName || '[NOME DO FUNCIONÁRIO]'}`;
    }

    // 6. CONVOCATÓRIA DE REUNIÃO
    generateMeetingConvocation(data) {
        const meetingDate = data.meetingDate ? this.formatDate(data.meetingDate) : '(a definir)';
        const time = data.meetingTime || '(horário a definir)';
        const location = data.meetingLocation || 'Sala de Reuniões';
        const agenda = data.meetingAgenda || 
            '1. Abertura e apresentação dos objetivos\n2. Discussão sobre metas trimestrais\n3. Ajustes de processos internos\n4. Feedbacks e sugestões\n5. Encerramento';

        return `${data.companyName ? data.companyName.toUpperCase() : '[NOME DA EMPRESA]'}
${data.companyAddress || '[ENDEREÇO DA EMPRESA]'}

${'='.repeat(80)}
                        CONVOCATÓRIA PARA REUNIÃO
${'='.repeat(80)}

Para: Todos os funcionários do departamento
De: ${data.employeeName || '[NOME DO FUNCIONÁRIO]'} - ${data.employeePosition || '[CARGO]'}
Data do Documento: ${data.documentDateFormatted || this.formatDate(new Date())}

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
${data.employeeName || '[NOME DO FUNCIONÁRIO]'}
${data.employeePosition || '[CARGO]'}`;
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
            case 'atestado':
                examples.certificateReason = 'Consulta médica agendada com urgência.';
                examples.certificateStart = new Date().toISOString().split('T')[0];
                examples.certificateEnd = new Date().toISOString().split('T')[0];
                break;
            case 'rescisao':
                examples.severanceValue = '5000.00';
                examples.paymentDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                examples.additionalConditions = 'O funcionário se compromete a manter sigilo sobre informações confidenciais da empresa.';
                examples.CPF = '123.456.789-00';
                examples.CTPS = '12345 - Série 0001';
                break;
            case 'reuniao':
                examples.meetingDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                examples.meetingTime = '14:00';
                examples.meetingLocation = 'Sala de Reuniões Principal';
                examples.meetingAgenda = '1. Abertura e boas-vindas\n2. Apresentação dos resultados do trimestre\n3. Discussão sobre novas metas\n4. Feedbacks da equipe\n5. Encerramento';
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
