/**
 * LÓGICA DO SIMULADOR DE RESCISÃO CLT - VERSÃO INTEGRADA
 * Focada em múltiplos cenários e visualização de dados
 */

let myChart = null;
let currentScenarios = null; // Store scenarios globally for chart interaction
let selectedScenario = 'withoutCause'; // Default selected scenario

document.addEventListener('DOMContentLoaded', function() {
    // 1. Configurar datas padrão (Admissão há 1 ano, Saída hoje)
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    const admissionInput = document.getElementById('admissionDate');
    const dismissalInput = document.getElementById('dismissalDate');
    
    if (admissionInput) admissionInput.valueAsDate = oneYearAgo;
    if (dismissalInput) dismissalInput.valueAsDate = today;
    
    // 2. Listener do Botão de Calcular
    document.getElementById('calculateBtn')?.addEventListener('click', calculateSeverance);
});

/**
 * Função principal que dispara os cálculos e atualiza o gráfico
 */
function calculateSeverance() {
    const salary = parseFloat(document.getElementById('salary').value);
    const admissionDate = new Date(document.getElementById('admissionDate').value);
    const dismissalDate = new Date(document.getElementById('dismissalDate').value);
    const vacationBalance = parseInt(document.getElementById('vacationBalance').value) || 0;
    const willWorkNotice = document.getElementById('noticeToggle')?.checked ?? false;

    // Validação básica
    if (!salary || isNaN(admissionDate) || isNaN(dismissalDate)) {
        alert("Por favor, preencha o salário e as datas corretamente.");
        return;
    }

    if (dismissalDate <= admissionDate) {
        alert("A data de saída deve ser posterior à data de admissão.");
        return;
    }

    // Calculamos os 3 cenários simultaneamente para o gráfico
    const scenarios = {
        withoutCause: calculateScenario(salary, admissionDate, dismissalDate, vacationBalance, 'withoutCause', willWorkNotice),
        resignation: calculateScenario(salary, admissionDate, dismissalDate, vacationBalance, 'resignation', willWorkNotice),
        withCause: calculateScenario(salary, admissionDate, dismissalDate, vacationBalance, 'withCause', willWorkNotice)
    };
    
    // Store scenarios globally for chart interaction
    currentScenarios = scenarios;
    
    // Reset to default scenario
    selectedScenario = 'withoutCause';

    updateUI(scenarios);
}

/**
 * Motor de Cálculo baseado na CLT vigente
 */
function calculateScenario(salary, start, end, vacVencidas, type, willWorkNotice = false) {
    const salaryPerDay = salary / 30;
    
    // 1. Saldo de Salário (dias trabalhados no mês da saída)
    const salaryBalance = end.getDate() * salaryPerDay;

    // 2. 13º Proporcional (Regra: 15 dias ou mais = +1/12)
    // Corrigido: Janeiro = mês 0, mas para cálculo do 13º contamos como 1/12
    // Se trabalhou 15+ dias no mês, conta o mês completo
    let months13 = end.getMonth() + 1; // Converte 0-11 para 1-12 (jan=1, dez=12)
    if (end.getDate() < 15) months13--; // Se trabalhou <15 dias no mês de saída, não conta
    const thirteenth = (salary / 12) * Math.max(0, Math.min(months13, 12));

    // 3. Férias Proporcionais
    const diffMonthsTotal = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    // Corrigido: Conta avos de férias no período aquisitivo atual (máx 12/12)
    // Se trabalhou 15+ dias no mês, conta como mês completo
    let propMonthsVac = diffMonthsTotal % 12;
    if (end.getDate() >= 15) propMonthsVac++;
    
    const vacationProp = (salary / 12) * Math.min(propMonthsVac, 12);
    const vacationDue = (vacVencidas / 30) * salary;
    const oneThird = (vacationProp + vacationDue) / 3;

    // Initialize breakdown object
    const breakdown = {
        salaryBalance: salaryBalance,
        vacationDue: vacationDue,
        vacationProp: vacationProp,
        oneThird: oneThird,
        thirteenth: 0,
        notice: 0,
        fgtsFine: 0,
        total: 0
    };

    let total = salaryBalance + vacationDue + vacationProp + oneThird;

    // 4. Regras Específicas de cada Tipo de Demissão
    if (type === 'withoutCause') {
        // Aviso Prévio Lei 12.506 (3 dias por ano trabalhado)
        const years = Math.floor(diffMonthsTotal / 12);
        const noticeDays = 30 + (years * 3);
        // If employee will work the notice, add the aviso prévio value to the calculation
        // If not working notice, don't add it
        const noticeValue = willWorkNotice ? (salaryPerDay * Math.min(noticeDays, 90)) : 0;
        
        // FGTS (Simulação simplificada de acúmulo + multa 40%)
        // Nota: Este é um cálculo aproximado. Valores reais podem variar
        const fgtsAccumulated = (salary * 0.08) * diffMonthsTotal;
        const fgtsFine = fgtsAccumulated * 0.40;
        
        breakdown.thirteenth = thirteenth;
        breakdown.notice = noticeValue;
        breakdown.noticeWorked = willWorkNotice;
        breakdown.fgtsFine = fgtsFine;
        total += thirteenth + noticeValue + fgtsFine;
    } 
    else if (type === 'resignation') {
        // Pedido de demissão: recebe 13º, mas não tem aviso nem multa FGTS
        breakdown.thirteenth = thirteenth;
        total += thirteenth;
    }
    else if (type === 'withCause') {
        // Justa causa: Perde quase tudo
        // Recebe apenas: saldo de salário + férias vencidas (se houver) + 1/3 das férias vencidas
        // NÃO recebe: férias proporcionais, 13º, aviso prévio, multa FGTS
        breakdown.vacationProp = 0;
        breakdown.oneThird = vacationDue > 0 ? vacationDue / 3 : 0;
        total = salaryBalance + vacationDue + breakdown.oneThird;
    }

    breakdown.total = total;
    return breakdown;
}

/**
 * Atualiza os elementos da tela e renderiza o gráfico
 */
function updateUI(scenarios) {
    // Alterna visibilidade da mensagem inicial para o resultado
    const initialMsg = document.getElementById('initial-message');
    const resultArea = document.getElementById('resultArea');
    
    if (initialMsg) initialMsg.style.display = 'none';
    if (resultArea) resultArea.style.display = 'block';

    // Mostra o detalhamento do cenário Sem Justa Causa por padrão
    const highlight = document.getElementById('totalHighlight');
    if (highlight) {
        highlight.innerHTML = generateDetailedBreakdown(scenarios.withoutCause, 'Demissão sem Justa Causa');
    }

    renderChart(scenarios);

    // Scroll suave para o resultado em dispositivos móveis
    if (window.innerWidth < 768) {
        resultArea.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Gera o HTML do detalhamento completo do cálculo
 */
function generateDetailedBreakdown(breakdown, title) {
    let items = [];
    
    if (breakdown.salaryBalance > 0) {
        items.push({ label: 'Saldo de Salário', value: breakdown.salaryBalance });
    }
    if (breakdown.vacationDue > 0) {
        items.push({ label: 'Férias Vencidas', value: breakdown.vacationDue });
    }
    if (breakdown.vacationProp > 0) {
        items.push({ label: 'Férias Proporcionais', value: breakdown.vacationProp });
    }
    if (breakdown.oneThird > 0) {
        items.push({ label: '1/3 de Férias', value: breakdown.oneThird });
    }
    if (breakdown.thirteenth > 0) {
        items.push({ label: '13º Salário Proporcional', value: breakdown.thirteenth });
    }
    if (breakdown.notice > 0) {
        items.push({ label: 'Aviso Prévio', value: breakdown.notice });
    }
    if (breakdown.noticeWorked === false && breakdown.notice === 0) {
        items.push({ label: 'Aviso Prévio', value: 0, note: 'Não será cumprido' });
    }
    if (breakdown.fgtsFine > 0) {
        items.push({ label: 'Multa 40% FGTS', value: breakdown.fgtsFine });
    }

    let html = `
        <div class="breakdown-header">
            <h4>${title}</h4>
        </div>
        <div class="breakdown-items">
    `;
    
    items.forEach(item => {
        const valueDisplay = item.note ? `<span style="color: #64748b; font-size: 0.85rem;">${item.note}</span>` : formatCurrency(item.value);
        html += `
            <div class="breakdown-item">
                <span class="breakdown-label">${item.label}</span>
                <span class="breakdown-value">${valueDisplay}</span>
            </div>
        `;
    });
    
    html += `
        </div>
        <div class="breakdown-total">
            <span class="breakdown-label">Total a Receber</span>
            <span class="breakdown-value">${formatCurrency(breakdown.total)}</span>
        </div>
    `;
    
    return html;
}

/**
 * Gerenciamento do Gráfico de Barras (Chart.js)
 */
function renderChart(data) {
    const canvas = document.getElementById('comparisonChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destrói gráfico anterior para evitar sobreposição ao recalcular
    if (myChart) myChart.destroy();

    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Sem Justa Causa', 'Pedido', 'Justa Causa'],
            datasets: [{
                label: 'Total a Receber',
                data: [data.withoutCause.total, data.resignation.total, data.withCause.total],
                backgroundColor: ['#2563eb', '#64748b', '#ef4444'], // Azul, Cinza, Vermelho
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            layout: {
                padding: {
                    top: 30
                }
            },
            plugins: {
                legend: { display: false },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    formatter: function(value) {
                        return formatCurrency(value);
                    },
                    color: '#1e293b',
                    font: {
                        weight: 'bold',
                        size: 12
                    }
                }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    }
                }
            },
            onClick: function(event, activeElements) {
                if (activeElements.length > 0) {
                    const index = activeElements[0].index;
                    updateSelectedScenario(index);
                }
            },
            onHover: function(event, activeElements) {
                const canvas = event.native.target;
                if (activeElements.length > 0) {
                    canvas.classList.add('interactive');
                } else {
                    canvas.classList.remove('interactive');
                }
            }
        }
    });
}

/**
 * Update the selected scenario based on chart click
 */
function updateSelectedScenario(index) {
    if (!currentScenarios) return;
    
    const scenarioMap = {
        0: { key: 'withoutCause', title: 'Demissão sem Justa Causa' },
        1: { key: 'resignation', title: 'Pedido de Demissão' },
        2: { key: 'withCause', title: 'Demissão com Justa Causa' }
    };
    
    const scenario = scenarioMap[index];
    if (!scenario) return;
    
    selectedScenario = scenario.key;
    
    // Update the breakdown card
    const highlight = document.getElementById('totalHighlight');
    if (highlight) {
        highlight.innerHTML = generateDetailedBreakdown(currentScenarios[scenario.key], scenario.title);
    }
}

function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
