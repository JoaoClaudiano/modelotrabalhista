/**
 * LÓGICA DO SIMULADOR DE RESCISÃO CLT - VERSÃO INTEGRADA
 * Focada em múltiplos cenários e visualização de dados
 */

let myChart = null;

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
        withoutCause: calculateScenario(salary, admissionDate, dismissalDate, vacationBalance, 'withoutCause'),
        resignation: calculateScenario(salary, admissionDate, dismissalDate, vacationBalance, 'resignation'),
        withCause: calculateScenario(salary, admissionDate, dismissalDate, vacationBalance, 'withCause')
    };

    updateUI(scenarios);
}

/**
 * Motor de Cálculo baseado na CLT vigente
 */
function calculateScenario(salary, start, end, vacVencidas, type) {
    const salaryPerDay = salary / 30;
    
    // 1. Saldo de Salário (dias trabalhados no mês da saída)
    const salaryBalance = end.getDate() * salaryPerDay;

    // 2. 13º Proporcional (Regra: 15 dias ou mais = +1/12)
    let months13 = end.getMonth(); 
    if (end.getDate() >= 15) months13++; 
    const thirteenth = (salary / 12) * months13;

    // 3. Férias Proporcionais
    const diffMonthsTotal = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const propMonthsVac = (end.getDate() >= start.getDate() || end.getDate() >= 15) ? (diffMonthsTotal % 12) + 1 : (diffMonthsTotal % 12);
    
    const vacationProp = (salary / 12) * Math.min(propMonthsVac, 12);
    const vacationDue = (vacVencidas / 30) * salary;
    const oneThird = (vacationProp + vacationDue) / 3;

    let total = salaryBalance + vacationDue + vacationProp + oneThird;

    // 4. Regras Específicas de cada Tipo de Demissão
    if (type === 'withoutCause') {
        // Aviso Prévio Lei 12.506 (3 dias por ano trabalhado)
        const years = Math.floor(diffMonthsTotal / 12);
        const noticeDays = 30 + (years * 3);
        const noticeValue = (salary / 30) * Math.min(noticeDays, 90);
        
        // FGTS (Simulação simplificada de acúmulo + multa 40%)
        const fgtsAccumulated = (salary * 0.08) * diffMonthsTotal;
        const fgtsFine = fgtsAccumulated * 0.40;
        
        total += thirteenth + noticeValue + fgtsFine;
    } 
    else if (type === 'resignation') {
        // Pedido de demissão: recebe 13º, mas não tem aviso nem multa FGTS
        total += thirteenth;
    }
    else if (type === 'withCause') {
        // Justa causa: Perde quase tudo, recebe apenas saldo e férias vencidas
        total = salaryBalance + vacationDue;
    }

    return total;
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

    // Destaque do valor principal (Sem Justa Causa)
    const highlight = document.getElementById('totalHighlight');
    if (highlight) {
        highlight.innerHTML = `
            Sem Justa Causa: <span style="color: #2563eb;">${formatCurrency(scenarios.withoutCause)}</span>
        `;
    }

    renderChart(scenarios);

    // Scroll suave para o resultado em dispositivos móveis
    if (window.innerWidth < 768) {
        resultArea.scrollIntoView({ behavior: 'smooth' });
    }
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
                data: [data.withoutCause, data.resignation, data.withCause],
                backgroundColor: ['#2563eb', '#64748b', '#ef4444'], // Azul, Cinza, Vermelho
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
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
            }
        }
    });
}

function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
