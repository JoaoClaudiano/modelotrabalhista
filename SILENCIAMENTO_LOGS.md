# 🔇 Sistema de Silenciamento de Logs

## 📋 Visão Geral

O sistema de logging do ModeloTrabalhista agora possui um recurso de silenciamento inteligente que automaticamente desativa logs em produção, mantendo apenas mensagens de erro visíveis.

## ✨ Características

- ✅ **Detecção automática de ambiente**: Identifica automaticamente se está em produção ou desenvolvimento
- ✅ **Controle manual**: Permite override manual via localStorage
- ✅ **Preserva console.error**: Mensagens de erro NUNCA são silenciadas
- ✅ **API simples**: Métodos fáceis para ativar/desativar logs
- ✅ **Persistência**: Configuração salva no localStorage
- ✅ **Zero impacto**: Logs continuam sendo armazenados internamente para análise

## 🎯 Como Funciona

### Detecção Automática de Ambiente

O sistema detecta automaticamente o ambiente com base em:

```javascript
const isProduction = 
    window.location.hostname !== 'localhost' && 
    window.location.hostname !== '127.0.0.1' &&
    !window.location.hostname.includes('.local') &&
    window.location.protocol === 'https:';
```

**Logs são silenciados automaticamente quando:**
- ✅ Hostname NÃO é `localhost` ou `127.0.0.1`
- ✅ Hostname NÃO contém `.local`
- ✅ Protocolo é `https:`

**Logs são mostrados normalmente quando:**
- ❌ Hostname é `localhost` ou `127.0.0.1`
- ❌ Hostname contém `.local`
- ❌ Protocolo é `http:`

### O Que É Silenciado

Quando `SILENCIAR_LOGS = true`:

| Método | Silenciado? | Armazenado Internamente? |
|--------|-------------|--------------------------|
| `console.log()` | ✅ Sim | ✅ Sim |
| `console.info()` | ✅ Sim | ✅ Sim |
| `console.warn()` | ✅ Sim | ✅ Sim |
| `console.error()` | ❌ **NUNCA** | ✅ Sim |
| `appLogger.log()` | ✅ Sim | ✅ Sim |
| `appLogger.info()` | ✅ Sim | ✅ Sim |
| `appLogger.warning()` | ✅ Sim | ✅ Sim |
| `appLogger.error()` | ❌ **NUNCA** | ✅ Sim |

> **Importante**: Mesmo quando silenciados, todos os logs continuam sendo armazenados internamente e podem ser exportados para análise.

## 🎮 Como Usar

### 1. Controle Via Código

```javascript
// Verificar se logs estão silenciados
const isSilenced = window.appLogger.getSilenciarLogs();

// Silenciar logs manualmente
window.appLogger.setSilenciarLogs(true);

// Ativar logs manualmente
window.appLogger.setSilenciarLogs(false);

// Alternar entre ativo/silenciado
window.appLogger.toggleLogs();
```

### 2. Controle Via Console (Debug)

Para ambientes de desenvolvimento, use `window.debugApp`:

```javascript
// Verificar status atual
debugApp.getLogStatus();

// Alternar logs
debugApp.toggleLogs();

// Silenciar logs
debugApp.silenciarLogs(true);

// Ativar logs
debugApp.silenciarLogs(false);
```

### 3. Controle Via localStorage

Você pode configurar manualmente via localStorage:

```javascript
// Silenciar logs manualmente (override da detecção automática)
localStorage.setItem('SILENCIAR_LOGS', 'true');

// Ativar logs manualmente (override da detecção automática)
localStorage.setItem('SILENCIAR_LOGS', 'false');

// Remover override (volta à detecção automática)
localStorage.removeItem('SILENCIAR_LOGS');

// Aplicar mudanças (recarrega a página)
location.reload();
```

## 🧪 Testando o Sistema

### Teste Manual

1. Abra o arquivo `test-log-silencing.html` em um navegador
2. Abra o Console do navegador (F12)
3. Clique nos botões de teste para verificar o comportamento
4. Use o botão "Alternar Logs" para ligar/desligar

### Teste em Desenvolvimento

```bash
# Servir localmente (logs ATIVOS por padrão)
# Use qualquer servidor local, ex:
python -m http.server 8000
# ou
npx http-server
```

Acesse `http://localhost:8000/test-log-silencing.html`

### Teste em Produção

Para simular ambiente de produção localmente:

1. Configure o override manual:
```javascript
localStorage.setItem('SILENCIAR_LOGS', 'true');
location.reload();
```

2. Ou teste em um servidor HTTPS real

## 📊 Cenários de Uso

### Cenário 1: Debug em Produção

Você precisa debugar um problema em produção:

```javascript
// 1. Abrir console do navegador
// 2. Ativar logs temporariamente
debugApp.silenciarLogs(false);

// 3. Reproduzir o problema
// 4. Ver os logs no console

// 5. Desativar logs novamente
debugApp.silenciarLogs(true);
```

### Cenário 2: Análise de Logs Históricos

Você quer analisar todos os logs mesmo com silenciamento ativo:

```javascript
// Exportar todos os logs (funciona mesmo com silenciamento)
const logs = debugApp.export('json');
console.log(logs);

// Ver erros específicos
const errors = debugApp.errors();
console.log(errors);

// Ver warnings específicos
const warnings = debugApp.warnings();
console.log(warnings);
```

### Cenário 3: Health Check em Produção

Verificar saúde da aplicação sem poluir o console:

```javascript
// Health check retorna dados mas não polui console quando silenciado
const health = window.appLogger.checkHealth();

// Verificar status programaticamente
if (health.status === 'CRITICAL') {
    // Tomar ação apropriada
}
```

## 🔧 Integração com Código Existente

O sistema é 100% retrocompatível. Código existente continua funcionando:

```javascript
// Código antigo - continua funcionando
console.log('Minha mensagem');
console.warn('Meu warning');
console.error('Meu erro');

// AppLogger - continua funcionando
window.appLogger.info('Minha informação');
window.appLogger.warning('Meu warning');
window.appLogger.error('Meu erro');
```

A única diferença é que agora esses logs podem ser silenciados automaticamente em produção.

## 🎨 Personalização

### Alterar Critérios de Detecção

Se você quiser alterar os critérios de detecção automática, edite a constante `SILENCIAR_LOGS` em `js/log.js`:

```javascript
const SILENCIAR_LOGS = (() => {
    // Seus critérios personalizados aqui
    const isProduction = /* sua lógica */;
    
    // Permitir override manual
    const manualOverride = localStorage.getItem('SILENCIAR_LOGS');
    if (manualOverride !== null) {
        return manualOverride === 'true';
    }
    
    return isProduction;
})();
```

## 📈 Impacto em Performance

- **Overhead**: Mínimo (~0.1ms por log)
- **Memória**: Logs são armazenados em arrays internos
- **Console**: Não há chamadas ao console quando silenciado
- **Produção**: Performance ligeiramente melhor com logs silenciados

## 🐛 Troubleshooting

### Logs não aparecem em desenvolvimento

Verifique:
```javascript
// 1. Status atual
console.log(window.appLogger.getSilenciarLogs()); // deve ser false

// 2. Verificar localStorage
console.log(localStorage.getItem('SILENCIAR_LOGS')); // deve ser null ou 'false'

// 3. Forçar ativação
window.appLogger.setSilenciarLogs(false);
```

### Logs aparecem em produção

Verifique:
```javascript
// 1. Status atual
console.log(window.appLogger.getSilenciarLogs()); // deve ser true

// 2. Ambiente detectado
console.log({
    hostname: window.location.hostname,
    protocol: window.location.protocol
});

// 3. Forçar silenciamento
window.appLogger.setSilenciarLogs(true);
```

### Errors estão sendo silenciados

Isso não deveria acontecer. Verifique se você está usando `console.error()` e não `console.log()`:

```javascript
// ❌ Errado - será silenciado
console.log('Erro: algo deu errado');

// ✅ Correto - nunca será silenciado
console.error('Erro: algo deu errado');

// ✅ Correto - nunca será silenciado
window.appLogger.error('Erro: algo deu errado');
```

## 📚 Referência da API

### Métodos Públicos

```javascript
// AppLogger
window.appLogger.getSilenciarLogs()    // Retorna: boolean
window.appLogger.setSilenciarLogs(val) // Parâmetro: boolean, Retorna: boolean
window.appLogger.toggleLogs()          // Retorna: boolean (novo estado)

// Debug (apenas em desenvolvimento)
window.debugApp.getLogStatus()         // Retorna: boolean
window.debugApp.silenciarLogs(val)     // Parâmetro: boolean, Retorna: boolean
window.debugApp.toggleLogs()           // Retorna: boolean (novo estado)
```

## 📝 Notas Importantes

1. **console.error nunca é silenciado** - Esta é uma decisão de design para garantir que problemas críticos sempre sejam visíveis
2. **Logs são sempre armazenados** - Mesmo quando silenciados, logs são armazenados internamente para análise posterior
3. **localStorage tem prioridade** - Se definido, o valor em localStorage sobrescreve a detecção automática
4. **Mudanças são imediatas** - Não é necessário recarregar a página ao usar `setSilenciarLogs()` ou `toggleLogs()`

## 🎯 Melhores Práticas

1. **Use console.error para erros reais** - Não use console.log para erros
2. **Mantenha debug temporário** - Lembre-se de desativar o modo debug após terminar
3. **Limpe localStorage periodicamente** - Para evitar configurações antigas
4. **Documente configurações especiais** - Se você configurar manualmente em produção

## 📄 Licença

Este recurso faz parte do projeto ModeloTrabalhista e segue a mesma licença do projeto principal.
