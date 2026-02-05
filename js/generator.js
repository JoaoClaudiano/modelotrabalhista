// generator.js - Geração específica de documentos para ModeloTrabalhista

class DocumentGenerator {
    constructor() {
        this.templates = {
            demissao: this.generateResignationLetter.bind(this),
            ferias: this.generateVacationRequest.bind(this),
            advertencia: this.generateWarningLetter.bind(this),
            atestado: this.generateCertificate.bind(this),
            rescisao: this.generateSeveranceAgreement.bind(this),
            reuniao: this.generateMeetingConvocation.bind(this)
        };
    }

    // Escapa caracteres HTML para prevenir XSS
    escapeHtml(text) {
        if (typeof text !== 'string') return text;
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Gerador principal
    generateDocument(data) {
        if (!data || !data.model) {
            throw new Error('Dados incompletos para gerar documento');
        }
        
        const generator = this.templates[data.model];
        if (!generator) {
            throw new Error('Tipo de documento não suportado');
        }
        
        try {
            return generator(data);
        } catch (error) {
            console.error('Erro ao gerar documento:', error);
            throw new Error(`Falha ao gerar documento: ${error.message}`);
        }
    }

    // 1. PEDIDO DE DEMISSÃO
    generateResignationLetter(data) {
        const effectiveDate = data.effectiveDate ? this.formatDate(data.effectiveDate) : '(a definir)';
        const noticePeriodText = this.getNoticePeriodText(data.noticePeriod);

        return `${data.companyName ? data.companyName.toUpperCase() : '[NOME DA EMPRESA]'}
${data.companyAddress || '[ENDEREÇO DA EMPRESA]'}

${'='.repeat(80)}
                               PEDIDO DE DEMISSÃO
${'='.repeat(80)}

Eu, ${data.employeeName || '[NOME DO FUNCIONÁRIO]'}, brasileiro(a), portador(a) do CPF [INFORME AQUI] 
e Carteira de Trabalho [INFORME AQUI], na função de ${data.employeePosition || '[CARGO]'}, 
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

Data: ${data.documentDateFormatted || this.formatDate(new Date())}

${'_'.repeat(42)}
Assinatura do Funcionário

${'='.repeat(80)}

Recebido por: ${'_'.repeat(42)}
Cargo: ${'_'.repeat(48)}
Data: __/__/______`;
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

        return `${data.companyName ? data.companyName.toUpperCase() : '[NOME DA EMPRESA]'}
${data.companyAddress || '[ENDEREÇO DA EMPRESA]'}

${'='.repeat(80)}
                       ACORDO DE RESCISÃO CONTRATUAL
${'='.repeat(80)}

Entre ${data.companyName || '[NOME DA EMPRESA]'}, com sede em ${data.companyAddress || '[ENDEREÇO DA EMPRESA]'}, doravante 
denominada EMPRESA, e ${data.employeeName || '[NOME DO FUNCIONÁRIO]'}, portador(a) do CPF [INFORME AQUI] 
e Carteira de Trabalho [INFORME AQUI], ocupante do cargo de 
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
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? dateString : date.toLocaleDateString('pt-BR');
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
