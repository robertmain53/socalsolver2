#!/bin/bash

echo "🔧 Adding automatic rate limit pre-check to automation.js"
echo "======================================================="

# Backup del file corrente
cp automation.js automation.js.backup.$(date +%Y%m%d_%H%M%S)
echo "📄 Backup created: automation.js.backup.$(date +%Y%m%d_%H%M%S)"

# Crea la versione migliorata con pre-check automatico
cat > automation_with_precheck.js << 'EOF'
import fs from 'fs/promises';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ========================================
// CONFIGURAZIONE RATE LIMITING MIGLIORATA
// ========================================

const MAX_RETRIES = 2;
const INITIAL_BACKOFF_MS = 30000;
const REQUEST_DELAY_MS = 45000; // 45 secondi tra OGNI chiamata API
const BATCH_DELAY_MS = 120000; // 2 minuti tra calcolatori completi
const PRECHECK_RETRY_DELAY_MS = 300000; // 5 minuti tra tentativi pre-check

// ========================================
// SISTEMA DI LOGGING AVANZATO
// ========================================

class Logger {
    constructor() {
        this.startTime = Date.now();
        this.logFile = path.join(__dirname, `automation_log_${new Date().toISOString().substring(0, 10)}.log`);
        this.stats = {
            totalProcessed: 0,
            successful: 0,
            failed: 0,
            skipped: 0,
            apiCalls: 0,
            rateLimitHits: 0,
            precheckAttempts: 0
        };
    }

    timestamp() {
        return new Date().toISOString().substring(11, 19);
    }

    async log(level, category, message, data = null) {
        const ts = this.timestamp();
        const elapsed = Math.round((Date.now() - this.startTime) / 1000);
        
        const colors = {
            INFO: '\x1b[36m',    // Cyan
            SUCCESS: '\x1b[32m', // Green
            WARNING: '\x1b[33m', // Yellow
            ERROR: '\x1b[31m',   // Red
            DEBUG: '\x1b[35m',   // Magenta
            RESET: '\x1b[0m'     // Reset
        };

        const icons = {
            INIT: '🚀',
            CONFIG: '⚙️',
            SHEETS: '📊',
            AI: '🤖',
            FILE: '📄',
            PROGRESS: '📈',
            STATS: '📊',
            ERROR: '❌',
            SUCCESS: '✅',
            WARNING: '⚠️',
            RATE_LIMIT: '⏰',
            PRECHECK: '🧪'
        };

        const color = colors[level] || colors.INFO;
        const icon = icons[category] || '📝';
        const prefix = `${color}[${ts}|${elapsed}s] ${icon} ${category}${colors.RESET}`;
        
        console.log(`${prefix}: ${message}`);
        
        if (data) {
            if (typeof data === 'object') {
                console.log(`${color}   └─ Data:${colors.RESET}`, JSON.stringify(data, null, 2));
            } else {
                console.log(`${color}   └─ ${data}${colors.RESET}`);
            }
        }

        const logEntry = `[${ts}|${elapsed}s] ${category}: ${message}${data ? ' | Data: ' + JSON.stringify(data) : ''}\n`;
        try {
            await fs.appendFile(this.logFile, logEntry);
        } catch (e) {
            // Ignora errori di scrittura log
        }
    }

    info(category, message, data) { return this.log('INFO', category, message, data); }
    success(category, message, data) { return this.log('SUCCESS', category, message, data); }
    warning(category, message, data) { return this.log('WARNING', category, message, data); }
    error(category, message, data) { return this.log('ERROR', category, message, data); }
    debug(category, message, data) { return this.log('DEBUG', category, message, data); }

    showProgress(current, total, item = '') {
        const percentage = Math.round((current / total) * 100);
        const progressBar = '█'.repeat(Math.round(percentage / 5)) + '░'.repeat(20 - Math.round(percentage / 5));
        const eta = current > 0 ? Math.round(((Date.now() - this.startTime) / current) * (total - current) / 1000) : 0;
        
        console.log(`\x1b[36m📈 PROGRESS\x1b[0m: [${progressBar}] ${percentage}% (${current}/${total}) ETA: ${eta}s ${item ? '| ' + item : ''}`);
        console.log(`\x1b[35m📊 API Stats\x1b[0m: Calls: ${this.stats.apiCalls} | Rate Limits: ${this.stats.rateLimitHits} | Prechecks: ${this.stats.precheckAttempts}`);
    }

    showStats() {
        const elapsed = Math.round((Date.now() - this.startTime) / 1000);
        console.log(`\n\x1b[36m📊 STATISTICHE\x1b[0m:`);
        console.log(`   ⏱️  Tempo trascorso: ${elapsed}s`);
        console.log(`   ✅ Completati: ${this.stats.successful}`);
        console.log(`   ❌ Falliti: ${this.stats.failed}`);
        console.log(`   ⏭️  Saltati: ${this.stats.skipped}`);
        console.log(`   📊 Totale processati: ${this.stats.totalProcessed}`);
        console.log(`   🤖 Chiamate API: ${this.stats.apiCalls}`);
        console.log(`   ⏰ Rate limit hits: ${this.stats.rateLimitHits}`);
        console.log(`   🧪 Pre-check attempts: ${this.stats.precheckAttempts}`);
    }

    incrementStat(type) {
        this.stats[type]++;
        if (type !== 'apiCalls' && type !== 'rateLimitHits' && type !== 'precheckAttempts') {
            this.stats.totalProcessed++;
        }
    }
}

const logger = new Logger();

// ========================================
// CONFIGURAZIONE
// ========================================

console.log('\x1b[35m');
console.log('╔══════════════════════════════════════════════════╗');
console.log('║        🤖 SoCalSolver Professional v2.2         ║');
console.log('║     Script con Pre-Check Rate Limit Automatico  ║');
console.log('╚══════════════════════════════════════════════════╝');
console.log('\x1b[0m');

await logger.info('INIT', 'Avvio sistema con pre-check automatico rate limit...');

const SHEET_ID = process.env.SHEET_ID;
const SHEET_NAME = process.env.SHEET_NAME || 'calculators';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

const COMPONENTS_DIR = path.join(__dirname, 'components', 'calculators');
const CONTENT_DIR = path.join(__dirname, 'content');
const PROMPT_COMPONENT_FILE = path.join(__dirname, 'prompt_component.txt');
const PROMPT_CONTENT_FILE = path.join(__dirname, 'prompt_content.txt');
const CREDENTIALS_FILE = path.join(__dirname, 'credentials.json');
const STATE_FILE = path.join(__dirname, 'automation_state.json');

// ========================================
// PRE-CHECK GEMINI RATE LIMIT
// ========================================

async function precheckGeminiStatus() {
    await logger.info('PRECHECK', 'Verifica stato rate limit Gemini...');
    logger.stats.precheckAttempts++;
    
    const testPrompt = {
        contents: [{ 
            parts: [{ text: "test" }] 
        }],
        generationConfig: { 
            maxOutputTokens: 5,
            temperature: 0.1
        }
    };

    try {
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testPrompt)
        });

        await logger.debug('PRECHECK', `Pre-check response: ${response.status}`);

        if (response.ok) {
            await logger.success('PRECHECK', 'Gemini API ready - No rate limit detected!');
            return true;
        } else if (response.status === 429) {
            await logger.warning('PRECHECK', 'Rate limit detected - Gemini API currently blocked');
            return false;
        } else if (response.status === 403) {
            const errorData = await response.text();
            await logger.error('PRECHECK', 'API Key error or quota exceeded', { 
                status: response.status, 
                error: errorData.substring(0, 200) 
            });
            throw new Error(`API Key problem: ${response.status} - ${errorData}`);
        } else {
            const errorData = await response.text();
            await logger.error('PRECHECK', 'Unexpected API error', { 
                status: response.status, 
                error: errorData.substring(0, 200) 
            });
            throw new Error(`Unexpected error: ${response.status} - ${errorData}`);
        }
    } catch (error) {
        if (error.message.includes('API Key problem') || error.message.includes('Unexpected error')) {
            throw error;
        }
        await logger.error('PRECHECK', 'Network error during pre-check', { error: error.message });
        return false;
    }
}

async function waitForRateLimitClearance() {
    await logger.warning('RATE_LIMIT', 'Avvio procedura attesa rate limit...');
    
    let attempts = 0;
    const maxAttempts = 20; // Max 20 tentativi = ~100 minuti
    
    while (attempts < maxAttempts) {
        attempts++;
        
        const isReady = await precheckGeminiStatus();
        if (isReady) {
            await logger.success('RATE_LIMIT', `Rate limit cleared dopo ${attempts} tentativ${attempts === 1 ? 'o' : 'i'}!`);
            return true;
        }
        
        if (attempts >= maxAttempts) {
            await logger.error('RATE_LIMIT', `Rate limit non risolto dopo ${maxAttempts} tentativi`);
            return false;
        }
        
        await logger.info('RATE_LIMIT', `Tentativo ${attempts}/${maxAttempts} - Rate limit ancora attivo`);
        await logger.info('RATE_LIMIT', `Prossimo tentativo tra ${PRECHECK_RETRY_DELAY_MS/1000/60} minuti...`);
        
        // Countdown visuale per 5 minuti
        const delayMinutes = PRECHECK_RETRY_DELAY_MS / 60000;
        const steps = Math.floor(delayMinutes);
        
        for (let i = 0; i < steps; i++) {
            const remaining = (steps - i);
            process.stdout.write(`⏳ ${remaining}min `);
            await new Promise(resolve => setTimeout(resolve, 60000));
        }
        console.log('');
    }
    
    return false;
}

// ========================================
// RESTO DEL CODICE (identico alla versione precedente)
// ========================================

async function validateConfiguration() {
    await logger.info('CONFIG', 'Inizio validazione configurazione...');
    const errors = [];
    
    if (!SHEET_ID) {
        errors.push('SHEET_ID mancante in .env');
        await logger.error('CONFIG', 'SHEET_ID mancante');
    }
    
    if (!GEMINI_API_KEY) {
        errors.push('GEMINI_API_KEY mancante in .env');
        await logger.error('CONFIG', 'GEMINI_API_KEY mancante');
    }
    
    const requiredFiles = [
        { path: CREDENTIALS_FILE, name: 'credentials.json' },
        { path: PROMPT_COMPONENT_FILE, name: 'prompt_component.txt' },
        { path: PROMPT_CONTENT_FILE, name: 'prompt_content.txt' }
    ];
    
    for (const file of requiredFiles) {
        try {
            await fs.access(file.path);
            await logger.success('CONFIG', `${file.name} trovato`);
        } catch {
            errors.push(`${file.name} non trovato`);
            await logger.error('CONFIG', `${file.name} mancante`);
        }
    }
    
    if (errors.length > 0) {
        await logger.error('CONFIG', 'Validazione fallita', { errori: errors });
        process.exit(1);
    }
    
    await logger.success('CONFIG', 'Validazione completata con successo');
    return true;
}

function slugify(text) {
    if (!text) return '';
    return text.toString()
        .normalize('NFD')
        .replace(/[\u0300-\u030f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
}

function toPascalCase(text) {
    if (!text) return '';
    return text.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
}

async function readState() {
    try {
        const data = await fs.readFile(STATE_FILE, 'utf8');
        const state = JSON.parse(data);
        await logger.info('CONFIG', 'Stato precedente caricato', state);
        return state;
    } catch {
        await logger.info('CONFIG', 'Nessuno stato precedente - primo avvio');
        return { lastProcessedIndex: -1 };
    }
}

async function saveState(state) {
    await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2));
    await logger.debug('FILE', 'Stato salvato', state);
}

async function rateLimitedDelay(reason = 'standard') {
    const delays = {
        standard: REQUEST_DELAY_MS,
        batch: BATCH_DELAY_MS,
        retry: INITIAL_BACKOFF_MS
    };
    
    const delayMs = delays[reason] || REQUEST_DELAY_MS;
    await logger.info('RATE_LIMIT', `Pausa ${reason}: ${delayMs/1000}s per rispettare rate limits`);
    
    const steps = Math.floor(delayMs / 10000);
    for (let i = 0; i < steps; i++) {
        const remaining = (steps - i) * 10;
        if (remaining > 10) {
            process.stdout.write(`⏳ ${remaining}s `);
        }
        await new Promise(resolve => setTimeout(resolve, 10000));
    }
    
    const remainingMs = delayMs % 10000;
    if (remainingMs > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingMs));
    }
    
    console.log('✅ Pausa completata');
}

function cleanAndParseJSON(text) {
    let cleaned = text.replace(/^```json\s*|```\s*$/gm, '').trim();
    
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    
    try {
        return JSON.parse(cleaned);
    } catch (firstError) {
        let fixed = cleaned
            .replace(/,\s*}/g, '}')
            .replace(/,\s*]/g, ']')
            .replace(/:\s*,/g, ': null,')
            .replace(/:\s*}/g, ': null}')
            .replace(/\\\\n/g, '\\n')
            .replace(/\\\\"/g, '\\"')
            .replace(/\\\\t/g, '\\t')
            .replace(/\\\\r/g, '\\r')
            .replace(/\\\\\\/g, '\\')
            .replace(/\n\s*/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t');
        
        try {
            return JSON.parse(fixed);
        } catch (secondError) {
            const codeMatch = fixed.match(/"componentCode"\s*:\s*"([^"]*(?:\\.[^"]*)*?)"/);
            if (codeMatch) {
                const componentCode = codeMatch[1]
                    .replace(/\\"/g, '"')
                    .replace(/\\n/g, '\n')
                    .replace(/\\t/g, '\t')
                    .replace(/\\r/g, '\r')
                    .replace(/\\\\/g, '\\');
                
                return { componentCode };
            }
            return null;
        }
    }
}

async function generateWithGemini(prompt, expectJson = false, requestType = 'unknown') {
    logger.stats.apiCalls++;
    await logger.debug('AI', `Inizio generazione Gemini (JSON: ${expectJson}, Type: ${requestType})`);
    
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            await logger.info('AI', `Tentativo ${attempt + 1}/${MAX_RETRIES} con Gemini per ${requestType}...`);
            
            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ 
                        parts: [{ 
                            text: expectJson ? 
                                `${prompt}\n\nIMPORTANTE: Restituisci SOLO JSON valido, senza markdown.` : 
                                prompt 
                        }] 
                    }],
                    generationConfig: { 
                        responseMimeType: expectJson ? "application/json" : "text/plain",
                        maxOutputTokens: 8192,
                        temperature: 0.1,
                        topP: 0.8,
                        topK: 10
                    }
                }),
            });

            await logger.debug('AI', `Risposta Gemini per ${requestType}: Status ${response.status}`);

            if (response.ok) {
                const data = await response.json();
                const textContent = data.candidates[0].content.parts[0].text;
                
                if (expectJson) {
                    const parsed = cleanAndParseJSON(textContent);
                    if (parsed && parsed.componentCode) {
                        await logger.success('AI', `JSON parsato con successo per ${requestType}`);
                        return parsed;
                    } else {
                        throw new Error('JSON parsing fallito: componentCode mancante');
                    }
                }
                
                await logger.success('AI', `Generazione completata per ${requestType}`);
                return textContent;
            }
            
            if (response.status === 429) {
                logger.stats.rateLimitHits++;
                await logger.error('AI', `Rate limit durante produzione per ${requestType}! Script necessita restart.`);
                await logger.error('AI', 'Rate limit non dovrebbe accadere dopo pre-check - possibile race condition');
                process.exit(1);
            } else {
                const errorText = await response.text();
                throw new Error(`Errore API Gemini: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            await logger.error('AI', `Errore tentativo ${attempt + 1} per ${requestType}`, { error: error.message });
            
            if (attempt === MAX_RETRIES - 1) {
                await logger.error('AI', `Tutti i tentativi con Gemini falliti per ${requestType}`);
                return null;
            }
            
            const delay = 5000 * (attempt + 1);
            await logger.warning('AI', `Pausa ${delay/1000}s prima del prossimo tentativo...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    return null;
}

async function readGoogleSheet() {
    await logger.info('SHEETS', 'Connessione a Google Sheets in corso...');
    
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: CREDENTIALS_FILE,
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });
        
        const client = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: client });
        
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: `${SHEET_NAME}!A:E`,
        });

        const rows = res.data.values;
        
        if (!rows || rows.length < 2) {
            await logger.error('SHEETS', 'Nessun dato trovato nel Google Sheet');
            return [];
        }

        const header = rows[0].map(h => h.trim());
        const dataRows = rows.slice(1);
        
        await logger.success('SHEETS', `Dati caricati con successo`, {
            righe_dati: dataRows.length
        });
        
        const data = dataRows.map((row, index) => {
            let obj = { _rowIndex: index };
            header.forEach((key, colIndex) => { 
                obj[key] = row[colIndex] || ''; 
            });
            return obj;
        });
        
        return data;
        
    } catch (error) {
        await logger.error('SHEETS', 'Errore connessione Google Sheets', {
            error: error.message
        });
        throw error;
    }
}

async function saveComponentToFile(componentName, componentCode) {
    await fs.mkdir(COMPONENTS_DIR, { recursive: true });
    const filePath = path.join(COMPONENTS_DIR, `${componentName}.tsx`);
    await fs.writeFile(filePath, componentCode);
    await logger.success('FILE', `Componente salvato: ${componentName}.tsx`);
}

async function saveContentToFile(lang, categorySlug, slug, content) {
    const contentDir = path.join(CONTENT_DIR, lang, categorySlug);
    await fs.mkdir(contentDir, { recursive: true });
    const filePath = path.join(contentDir, `${slug}.md`);
    await fs.writeFile(filePath, content);
    await logger.success('FILE', `Contenuto salvato: ${lang}/${categorySlug}/${slug}.md`);
}

// ========================================
// MAIN AUTOMATION LOGIC CON PRE-CHECK
// ========================================
async function main() {
    try {
        await logger.info('INIT', 'Inizio processo principale con pre-check...');
        
        // STEP 1: Pre-check rate limit
        console.log('\n🧪 PHASE 1: GEMINI API PRE-CHECK');
        console.log('================================');
        
        const isGeminiReady = await precheckGeminiStatus();
        if (!isGeminiReady) {
            await logger.warning('PRECHECK', 'Rate limit detected - Starting wait procedure...');
            console.log('\n⏰ RATE LIMIT DETECTED');
            console.log('=====================');
            console.log('🔍 Previous script runs may have exhausted your Gemini quota');
            console.log('⏳ Automatically waiting for rate limit to clear...');
            
            const cleared = await waitForRateLimitClearance();
            if (!cleared) {
                await logger.error('PRECHECK', 'Rate limit non risolto dopo attesa prolungata');
                console.log('\n❌ RATE LIMIT PERSISTENTE');
                console.log('=========================');
                console.log('💡 Possibili soluzioni:');
                console.log('   • Aspetta fino a domani (quota giornaliera)');
                console.log('   • Usa una chiave API diversa');
                console.log('   • Considera l\'upgrade a Gemini Pro');
                console.log('\n🔄 Riprova più tardi con: node automation.js');
                process.exit(1);
            }
        }
        
        // STEP 2: Procedi con validazione e processing
        console.log('\n⚙️  PHASE 2: CONFIGURATION & PROCESSING');
        console.log('=======================================');
        
        await validateConfiguration();
        
        const componentPrompt = await fs.readFile(PROMPT_COMPONENT_FILE, 'utf8');
        const contentPrompt = await fs.readFile(PROMPT_CONTENT_FILE, 'utf8');
        await logger.success('CONFIG', 'Prompt caricati');
        
        const calculators = await readGoogleSheet();
        if (calculators.length === 0) {
            await logger.error('SHEETS', 'Nessun calcolatore da processare');
            return;
        }
        
        const state = await readState();
        const startIndex = state.lastProcessedIndex + 1;

        if (startIndex >= calculators.length) {
            await logger.warning('PROGRESS', 'Tutti i calcolatori già processati');
            logger.showStats();
            return;
        }

        const remainingCount = calculators.length - startIndex;
        
        console.log(`\n🚀 PHASE 3: BATCH GENERATION`);
        console.log('============================');
        console.log(`📊 Calcolatori totali: ${calculators.length}`);
        console.log(`🎯 Ripresa da indice: ${startIndex}`);
        console.log(`⏳ Rimanenti: ${remainingCount}`);
        console.log(`⏱️  Tempo stimato: ~${Math.round(remainingCount * 3)}min`);
        console.log('');

        // Loop di generazione
        for (let index = startIndex; index < calculators.length; index++) {
            const calculator = calculators[index];
            const current = index - startIndex + 1;
            
            logger.showProgress(current, remainingCount, `${calculator.Titolo}`);
            
            if (!calculator.Titolo || !calculator.Slug || !calculator.Categoria || !calculator.Lingua) {
                logger.incrementStat('skipped');
                continue;
            }

            // Generazione componente
            const componentPromptFull = `${componentPrompt}\n\nINPUT STRUTTURATO (JSON):\n\`\`\`json\n${JSON.stringify(calculator, null, 2)}\n\`\`\``;
            const componentResult = await generateWithGemini(componentPromptFull, true, 'component');
            
            if (!componentResult || !componentResult.componentCode) {
                logger.incrementStat('failed');
                continue;
            }

            const componentName = `${toPascalCase(calculator.Slug)}Calculator`;
            await saveComponentToFile(componentName, componentResult.componentCode);

            // Pausa tra chiamate API
            await rateLimitedDelay('standard');

            // Generazione contenuto
            const contentPromptFull = `${contentPrompt}\n\nTitolo del Calcolatore: \`${calculator.Titolo}\``;
            const contentResult = await generateWithGemini(contentPromptFull, false, 'content');
            
            if (contentResult) {
                const categorySlug = slugify(calculator.Categoria);
                await saveContentToFile(calculator.Lingua, categorySlug, calculator.Slug, contentResult);
            }

            await saveState({ lastProcessedIndex: index });
            logger.incrementStat('successful');

            // Pausa tra calcolatori
            if (index < calculators.length - 1) {
                await rateLimitedDelay('batch');
            }
        }

        console.log('\n🎉 GENERAZIONE COMPLETATA!');
        logger.showStats();
        
        await logger.success('INIT', 'Processo completato con successo');

    } catch (error) {
        await logger.error('INIT', 'ERRORE CRITICO', { 
            error: error.message, 
            stack: error.stack 
        });
        console.error('\n❌ ERRORE CRITICO:', error.message);
        process.exit(1);
    }
}

// ========================================
// AVVIO SCRIPT
// ========================================
await logger.info('INIT', 'Sistema inizializzato con pre-check automatico');
main();
EOF

# Sostituisci il file originale
mv automation_with_precheck.js automation.js
echo "✅ automation.js updated with automatic pre-check"

echo ""
echo "🔧 AUTOMATION.JS UPGRADED:"
echo "   🧪 Pre-check automatico del rate limit all'avvio"
echo "   ⏰ Attesa automatica fino a clearance del rate limit"
echo "   📊 Statistiche dettagliate inclusi pre-check attempts"
echo "   🚀 Avvio automatico quando Gemini è pronto"
echo ""
echo "✅ Ora l'automation script gestisce automaticamente:"
echo "   1. Testa se Gemini è disponibile"
echo "   2. Se rate limited, aspetta fino al reset"
echo "   3. Procede solo quando sicuro"
echo ""
echo "🚀 Run: node automation.js (gestirà tutto automaticamente)"
