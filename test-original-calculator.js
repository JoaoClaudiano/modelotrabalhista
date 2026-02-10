/**
 * TEST WITH ORIGINAL (BUGGY) CALCULATION
 */

function calculateScenarioOriginal(salary, start, end, vacVencidas, type, willWorkNotice = false) {
    const salaryPerDay = salary / 30;
    
    // 1. Saldo de Salário (dias trabalhados no mês da saída)
    const salaryBalance = end.getDate() * salaryPerDay;

    // 2. 13º Proporcional (Regra: 15 dias ou mais = +1/12)
    // ORIGINAL BUGGY CODE
    let months13 = end.getMonth(); 
    if (end.getDate() >= 15) months13++; 
    const thirteenth = (salary / 12) * months13;

    const breakdown = {
        salaryBalance: salaryBalance,
        thirteenth: 0,
        notice: 0,
        fgtsFine: 0,
        total: 0
    };

    const diffMonthsTotal = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    
    if (type === 'withoutCause') {
        const years = Math.floor(diffMonthsTotal / 12);
        const noticeDays = 30 + (years * 3);
        const noticeValue = willWorkNotice ? 0 : (salaryPerDay * Math.min(noticeDays, 90));
        
        const fgtsAccumulated = (salary * 0.08) * diffMonthsTotal;
        const fgtsFine = fgtsAccumulated * 0.40;
        
        breakdown.thirteenth = thirteenth;
        breakdown.notice = noticeValue;
        breakdown.fgtsFine = fgtsFine;
        breakdown.total = salaryBalance + thirteenth + noticeValue + fgtsFine;
    } 
    else if (type === 'resignation') {
        breakdown.thirteenth = thirteenth;
        breakdown.total = salaryBalance + thirteenth;
    }

    return breakdown;
}

console.log('=== TESTE COM CÓDIGO ORIGINAL (BUGGY) ===\n');

// Demissão em Janeiro (mês 0)
const test1 = calculateScenarioOriginal(3000, new Date('2025-01-15'), new Date('2026-01-20'), 0, 'withoutCause', false);
console.log('Teste 1: Saída em 20/Janeiro/2026');
console.log('  Mês: 0 (janeiro), Dia: 20 (≥15)');
console.log('  months13 = 0, depois 0+1 = 1');
console.log('  13º calculado:', test1.thirteenth.toFixed(2), '(esperado: 300.00)');
console.log('  Diferença:', (300 - test1.thirteenth).toFixed(2));
console.log();

// Demissão em Fevereiro (mês 1)
const test2 = calculateScenarioOriginal(3000, new Date('2025-01-15'), new Date('2026-02-20'), 0, 'withoutCause', false);
console.log('Teste 2: Saída em 20/Fevereiro/2026');
console.log('  Mês: 1 (fevereiro), Dia: 20 (≥15)');
console.log('  months13 = 1, depois 1+1 = 2');
console.log('  13º calculado:', test2.thirteenth.toFixed(2), '(esperado: 500.00)');
console.log('  Diferença:', (500 - test2.thirteenth).toFixed(2));
console.log();

// Demissão em Dezembro (mês 11)
const test3 = calculateScenarioOriginal(3000, new Date('2025-01-15'), new Date('2026-12-20'), 0, 'withoutCause', false);
console.log('Teste 3: Saída em 20/Dezembro/2026');
console.log('  Mês: 11 (dezembro), Dia: 20 (≥15)');
console.log('  months13 = 11, depois 11+1 = 12');
console.log('  13º calculado:', test3.thirteenth.toFixed(2), '(esperado: 3000.00)');
console.log('  Diferença:', (3000 - test3.thirteenth).toFixed(2));
console.log();

// Demissão em Dezembro dia 10 (mês 11)
const test4 = calculateScenarioOriginal(3000, new Date('2025-01-15'), new Date('2026-12-10'), 0, 'withoutCause', false);
console.log('Teste 4: Saída em 10/Dezembro/2026');
console.log('  Mês: 11 (dezembro), Dia: 10 (<15)');
console.log('  months13 = 11 (sem incremento)');
console.log('  13º calculado:', test4.thirteenth.toFixed(2), '(esperado: 2750.00 - 11 meses)');
console.log('  Diferença:', (2750 - test4.thirteenth).toFixed(2));

console.log('\n=== CONCLUSÃO ===');
console.log('O código original usa end.getMonth() que retorna 0-11 para Jan-Dez.');
console.log('Isso causa cálculo incorreto do 13º salário em todos os cenários!');
