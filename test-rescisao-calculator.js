/**
 * TESTES DO SIMULADOR DE RESCISÃO CLT 2026
 * Valida cálculos conforme legislação trabalhista brasileira vigente
 */

// Mock da função calculateScenario para testes
function calculateScenario(salary, start, end, vacVencidas, type, willWorkNotice = false) {
    const salaryPerDay = salary / 30;
    
    // 1. Saldo de Salário (dias trabalhados no mês da saída)
    const salaryBalance = end.getDate() * salaryPerDay;

    // 2. 13º Proporcional (Regra: 15 dias ou mais = +1/12)
    // CORRIGIDO: Conta meses trabalhados desde janeiro do ano corrente
    // Janeiro = mês 0, Fevereiro = mês 1, ..., Dezembro = mês 11
    // Para 13º: Janeiro completo = 1/12, Fevereiro completo = 2/12, etc.
    let months13 = end.getMonth() + 1; // Converte 0-11 para 1-12 (jan=1, dez=12)
    // Se trabalhou menos de 15 dias no mês de saída, não conta o mês
    if (end.getDate() < 15) months13--;
    const thirteenth = (salary / 12) * Math.max(0, Math.min(months13, 12));

    // 3. Férias Proporcionais
    const diffMonthsTotal = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    
    // CORRIGIDO: Lógica simplificada - se trabalhou 15+ dias no mês ou ultrapassou o dia de admissão, conta o mês
    let propMonthsVac = diffMonthsTotal % 12;
    if (end.getDate() >= 15) {
        propMonthsVac++;
    }
    
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
        const noticeValue = willWorkNotice ? 0 : (salaryPerDay * Math.min(noticeDays, 90));
        
        // FGTS (Simulação simplificada de acúmulo + multa 40%)
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
        // Justa causa: Perde quase tudo, recebe apenas saldo e férias vencidas
        // NÃO recebe férias proporcionais, 1/3 de férias proporcionais nem 13º
        total = salaryBalance + vacationDue + (vacationDue > 0 ? vacationDue / 3 : 0);
        breakdown.vacationProp = 0;
        breakdown.oneThird = vacationDue > 0 ? vacationDue / 3 : 0;
    }

    breakdown.total = total;
    return breakdown;
}

// ====================== CASOS DE TESTE ======================

console.log('=== TESTES DO SIMULADOR DE RESCISÃO CLT 2026 ===\n');

// Teste 1: Demissão sem justa causa - 1 ano completo
console.log('Teste 1: Demissão sem justa causa - 1 ano de trabalho');
const test1 = calculateScenario(
    3000, // salário R$ 3.000
    new Date('2025-01-15'), // admissão
    new Date('2026-01-15'), // demissão (1 ano depois, mesmo dia)
    0, // sem férias vencidas
    'withoutCause',
    false // aviso indenizado
);
console.log('Resultado:', test1);
console.log('13º esperado: R$ 250 (1 mês = jan/2026, <15 dias) =', (3000/12 * 1).toFixed(2));
console.log('13º calculado:', test1.thirteenth.toFixed(2));
console.log('Aviso prévio esperado: 30 + 3 dias (1 ano) = 33 dias =', (3000/30 * 33).toFixed(2));
console.log('Aviso prévio calculado:', test1.notice.toFixed(2));
console.log('✓ Teste 1 concluído\n');

// Teste 2: Pedido de demissão - 6 meses
console.log('Teste 2: Pedido de demissão - 6 meses trabalhados');
const test2 = calculateScenario(
    2500,
    new Date('2025-07-01'),
    new Date('2026-01-01'),
    0,
    'resignation',
    false
);
console.log('Resultado:', test2);
console.log('13º esperado: R$ 0 (saída em 01/jan com <15 dias) =', (2500/12 * 0).toFixed(2));
console.log('13º calculado:', test2.thirteenth.toFixed(2));
console.log('Deve receber: saldo + férias prop. + 1/3');
console.log('NÃO deve receber: 13º (não trabalhou 15+ dias), aviso prévio, multa FGTS');
console.log('✓ Teste 2 concluído\n');

// Teste 3: Demissão com justa causa
console.log('Teste 3: Demissão com justa causa - 2 anos');
const test3 = calculateScenario(
    4000,
    new Date('2024-03-10'),
    new Date('2026-02-10'),
    30, // 30 dias de férias vencidas
    'withCause',
    false
);
console.log('Resultado:', test3);
console.log('Deve receber APENAS: saldo + férias vencidas + 1/3 das férias vencidas');
console.log('NÃO deve receber: férias proporcionais, 1/3 prop., 13º, aviso, multa FGTS');
console.log('Férias vencidas:', test3.vacationDue.toFixed(2));
console.log('1/3 das férias vencidas:', test3.oneThird.toFixed(2));
console.log('✓ Teste 3 concluído\n');

// Teste 4: 13º proporcional - diferentes meses
console.log('Teste 4: Verificação do 13º proporcional em diferentes meses');
const scenarios = [
    { end: new Date('2026-01-20'), expected: 1 }, // Janeiro com ≥15 dias = 1 mês
    { end: new Date('2026-02-10'), expected: 1 }, // Janeiro completo, Fevereiro <15 dias = 1 mês
    { end: new Date('2026-06-20'), expected: 6 }, // Jan-Jun, junho com ≥15 dias = 6 meses
    { end: new Date('2026-12-10'), expected: 11 }, // Jan-Nov completos, Dez <15 dias = 11 meses
    { end: new Date('2026-12-20'), expected: 12 }, // Jan-Dez, dezembro com ≥15 dias = 12 meses
];

scenarios.forEach((scenario, index) => {
    const result = calculateScenario(
        3600,
        new Date('2026-01-01'),
        scenario.end,
        0,
        'withoutCause',
        false
    );
    const expectedValue = (3600 / 12) * scenario.expected;
    console.log(`  ${index + 1}. Saída: ${scenario.end.toLocaleDateString('pt-BR')}`);
    console.log(`     Meses esperados: ${scenario.expected} → R$ ${expectedValue.toFixed(2)}`);
    console.log(`     13º calculado: R$ ${result.thirteenth.toFixed(2)}`);
    console.log(`     ${Math.abs(result.thirteenth - expectedValue) < 0.01 ? '✓ OK' : '✗ ERRO'}`);
});
console.log('✓ Teste 4 concluído\n');

// Teste 5: Aviso prévio proporcional (Lei 12.506/2011)
console.log('Teste 5: Aviso prévio proporcional por tempo de serviço');
const noticeTests = [
    { years: 0, expectedDays: 30 },  // < 1 ano = 30 dias
    { years: 1, expectedDays: 33 },  // 1 ano = 33 dias
    { years: 5, expectedDays: 45 },  // 5 anos = 45 dias
    { years: 10, expectedDays: 60 }, // 10 anos = 60 dias
    { years: 20, expectedDays: 90 }, // 20 anos = 90 dias (máximo)
    { years: 25, expectedDays: 90 }, // 25 anos = 90 dias (limitado)
];

noticeTests.forEach((test, index) => {
    const startDate = new Date('2026-01-01');
    const endDate = new Date('2026-01-01');
    endDate.setFullYear(endDate.getFullYear() + test.years);
    
    const result = calculateScenario(
        3000,
        startDate,
        endDate,
        0,
        'withoutCause',
        false
    );
    
    const expectedValue = (3000 / 30) * test.expectedDays;
    console.log(`  ${index + 1}. ${test.years} ano(s) de serviço:`);
    console.log(`     Dias esperados: ${test.expectedDays}`);
    console.log(`     Valor esperado: R$ ${expectedValue.toFixed(2)}`);
    console.log(`     Valor calculado: R$ ${result.notice.toFixed(2)}`);
    console.log(`     ${Math.abs(result.notice - expectedValue) < 0.01 ? '✓ OK' : '✗ ERRO'}`);
});
console.log('✓ Teste 5 concluído\n');

// Teste 6: Férias proporcionais
console.log('Teste 6: Férias proporcionais - regra dos 15 dias');
const vacationTests = [
    { start: new Date('2025-01-01'), end: new Date('2025-02-10'), expectedMonths: 1 }, // 1 mês (<15 dias)
    { start: new Date('2025-01-01'), end: new Date('2025-02-20'), expectedMonths: 2 }, // 2 meses (≥15 dias)
    { start: new Date('2025-01-01'), end: new Date('2025-12-10'), expectedMonths: 11 }, // 11 meses
    { start: new Date('2025-01-01'), end: new Date('2025-12-20'), expectedMonths: 12 }, // 12 meses (≥15 dias)
];

vacationTests.forEach((test, index) => {
    const result = calculateScenario(
        3600,
        test.start,
        test.end,
        0,
        'withoutCause',
        false
    );
    
    const expectedValue = (3600 / 12) * test.expectedMonths;
    console.log(`  ${index + 1}. Período: ${test.start.toLocaleDateString('pt-BR')} - ${test.end.toLocaleDateString('pt-BR')}`);
    console.log(`     Meses esperados: ${test.expectedMonths}`);
    console.log(`     Valor esperado: R$ ${expectedValue.toFixed(2)}`);
    console.log(`     Valor calculado: R$ ${result.vacationProp.toFixed(2)}`);
    console.log(`     ${Math.abs(result.vacationProp - expectedValue) < 0.01 ? '✓ OK' : '✗ ERRO'}`);
});
console.log('✓ Teste 6 concluído\n');

console.log('=== TODOS OS TESTES CONCLUÍDOS ===');
