import fs from 'fs/promises';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
            skipped: 0
        };
    }

    timestamp() {
        return new Date().toISOString().substring(11, 19);
    }

    async log(level, category, message, data = null) {
        const ts = this.timestamp();
        const elapsed = Math.round((Date.now() - this.startTime) / 1000);
        
        // Colori console
        const colors = {
            INFO: '\x1b[36m',    // Cyan
            SUCCESS: '\x1b[32m', // Green
            WARNING: '\x1b[33m', // Yellow
            ERROR: '\x1b[31m',   // Red
            DEBUG: '\x1b[35m',   // Magenta
            RESET: '\x1b[0m'     // Reset
        };

        // Icone per categoria
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
            WARNING: '⚠️'
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

        // Salva anche su file
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
    }

    showStats() {
        const elapsed = Math.round((Date.now() - this.startTime) / 1000);
        console.log(`\n\x1b[36m📊 STATISTICHE\x1b[0m:`);
        console.log(`   ⏱️  Tempo trascorso: ${elapsed}s`);
        console.log(`   ✅ Completati: ${this.stats.successful}`);
        console.log(`   ❌ Falliti: ${this.stats.failed}`);
        console.log(`   ⏭️  Saltati: ${this.stats.skipped}`);
        console.log(`   📊 Totale processati: ${this.stats.totalProcessed}`);
    }

    incrementStat(type) {
        this.stats[type]++;
        this.stats.totalProcessed++;
    }
}

const logger = new Logger();

// ========================================
// CONFIGURAZIONE
// ========================================

console.log('\x1b[35m');
console.log('╔══════════════════════════════════════════════════╗');
console.log('║        🤖 SoCalSolver Professional v2.0         ║');
console.log('║           Script Automazione Avanzato           ║');
console.log('╚══════════════════════════════════════════════════╝');
console.log('\x1b[0m');

await logger.info('INIT', 'Avvio sistema di automazione...');
await logger.info('INIT', `Log salvato in: ${logger.logFile}`);

const SHEET_ID = process.env.SHEET_ID;
const SHEET_NAME = process.env.SHEET_NAME || 'calculators';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const COMPONENTS_DIR = path.join(__dirname, 'components', 'calculators');
const CONTENT_DIR = path.join(__dirname, 'content');
const PROMPT_COMPONENT_FILE = path.join(__dirname, 'prompt_component.txt');
const PROMPT_CONTENT_FILE = path.join(__dirname, 'prompt_content.txt');
const CREDENTIALS_FILE = path.join(__dirname, 'credentials.json');
const STATE_FILE = path.join(__dirname, 'automation_state.json');

const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 60000;

// ========================================
// VALIDAZIONE CONFIGURAZIONE
// ========================================
async function validateConfiguration() {
    await logger.info('CONFIG', 'Inizio validazione configurazione...');
    const errors = [];
    
    // Controllo variabili ambiente
    await logger.debug('CONFIG', 'Controllo variabili ambiente...');
    const envVars = {
        SHEET_ID: !!SHEET_ID,
        GEMINI_API_KEY: !!GEMINI_API_KEY,
        OPENAI_API_KEY: !!OPENAI_API_KEY
    };
    
    await logger.info('CONFIG', 'Variabili ambiente', envVars);
    
    if (!SHEET_ID) {
        errors.push('SHEET_ID mancante in .env');
        await logger.error('CONFIG', 'SHEET_ID mancante');
    }
    
    if (!GEMINI_API_KEY) {
        errors.push('GEMINI_API_KEY mancante in .env');
        await logger.error('CONFIG', 'GEMINI_API_KEY mancante');
    }
    
    // Controllo file necessari
    await logger.debug('CONFIG', 'Controllo file necessari...');
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
        console.error('\n❌ ERRORI DI CONFIGURAZIONE:');
        errors.forEach(error => console.error(`  • ${error}`));
        console.log('\n🔧 RISOLUZIONE:');
        console.log('  node debug-automation.js    # Per diagnosi dettagliata');
        console.log('  ./quick-fixes.sh           # Per fix automatici');
        process.exit(1);
    }
    
    await logger.success('CONFIG', 'Validazione completata con successo');
    return true;
}

// ========================================
// UTILITY FUNCTIONS
// ========================================
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

// ========================================
// GOOGLE SHEETS INTEGRATION
// ========================================
async function readGoogleSheet() {
    await logger.info('SHEETS', 'Connessione a Google Sheets in corso...');
    
    try {
        await logger.debug('SHEETS', 'Configurazione autenticazione...');
        const auth = new google.auth.GoogleAuth({
            keyFile: CREDENTIALS_FILE,
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });
        
        await logger.debug('SHEETS', 'Ottenimento client autenticato...');
        const client = await auth.getClient();
        
        await logger.debug('SHEETS', 'Inizializzazione client Sheets...');
        const sheets = google.sheets({ version: 'v4', auth: client });
        
        await logger.info('SHEETS', `Lettura dati da range: ${SHEET_NAME}!A:E`);
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: `${SHEET_NAME}!A:E`,
        });

        const rows = res.data.values;
        
        if (!rows || rows.length < 2) {
            await logger.error('SHEETS', 'Nessun dato trovato nel Google Sheet', { 
                rows: rows?.length || 0 
            });
            return [];
        }

        const header = rows[0].map(h => h.trim());
        const dataRows = rows.slice(1);
        
        await logger.success('SHEETS', `Dati caricati con successo`, {
            header,
            righe_dati: dataRows.length,
            totale_righe: rows.length
        });
        
        const data = dataRows.map((row, index) => {
            let obj = { _rowIndex: index };
            header.forEach((key, colIndex) => { 
                obj[key] = row[colIndex] || ''; 
            });
            return obj;
        });
        
        // Mostra anteprima primi 3 calcolatori
        if (data.length > 0) {
            await logger.debug('SHEETS', 'Anteprima primi calcolatori:', 
                data.slice(0, 3).map(item => ({
                    titolo: item.Titolo,
                    slug: item.Slug,
                    categoria: item.Categoria
                }))
            );
        }
        
        return data;
        
    } catch (error) {
        await logger.error('SHEETS', 'Errore connessione Google Sheets', {
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
}

// ========================================
// AI GENERATION FUNCTIONS
// ========================================

function cleanAndParseJSON(text) {
    // Rimuovi markdown code blocks
    let cleaned = text.replace(/^```json\s*|```\s*$/gm, '').trim();
    
    // Cerca contenuto tra { }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    
    try {
        return JSON.parse(cleaned);
    } catch (firstError) {
        // Correzioni progressive
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
            // Ricostruzione manuale
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

async function generateWithGemini(prompt, expectJson = false) {
    await logger.debug('AI', `Inizio generazione Gemini (JSON: ${expectJson})`);
    
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            await logger.info('AI', `Tentativo ${attempt + 1}/${MAX_RETRIES} con Gemini...`);
            
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

            await logger.debug('AI', `Risposta Gemini: Status ${response.status}`);

            if (response.ok) {
                const data = await response.json();
                const textContent = data.candidates[0].content.parts[0].text;
                
                await logger.debug('AI', 'Contenuto ricevuto', { 
                    lunghezza: textContent.length,
                    preview: textContent.substring(0, 100) + '...'
                });
                
                if (expectJson) {
                    const parsed = cleanAndParseJSON(textContent);
                    if (parsed && parsed.componentCode) {
                        await logger.success('AI', 'JSON parsato con successo');
                        return parsed;
                    } else {
                        throw new Error('JSON parsing fallito: componentCode mancante');
                    }
                }
                
                return textContent;
            }
            
            if (response.status === 429) {
                const delay = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
                await logger.warning('AI', `Rate limit Gemini, pausa ${delay / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                const errorText = await response.text();
                throw new Error(`Errore API Gemini: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            await logger.error('AI', `Errore tentativo ${attempt + 1}`, { error: error.message });
            
            if (attempt === MAX_RETRIES - 1) {
                await logger.error('AI', 'Tutti i tentativi con Gemini falliti');
                return null;
            }
            
            const delay = 5000 * (attempt + 1);
            await logger.warning('AI', `Pausa ${delay/1000}s prima del prossimo tentativo...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    return null;
}

async function attemptGeneration(prompt, expectJson = false) {
    let result = await generateWithGemini(prompt, expectJson);
    if (result) return result;

    await logger.warning('AI', 'Fallback su OpenAI non implementato');
    return null;
}

// ========================================
// FILE OPERATIONS
// ========================================
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
// MAIN AUTOMATION LOGIC
// ========================================
async function main() {
    try {
        await logger.info('INIT', 'Inizio processo principale...');
        
        // Validazione configurazione
        await validateConfiguration();
        
        // Carica prompt
        await logger.info('CONFIG', 'Caricamento prompt...');
        const componentPrompt = await fs.readFile(PROMPT_COMPONENT_FILE, 'utf8');
        const contentPrompt = await fs.readFile(PROMPT_CONTENT_FILE, 'utf8');
        await logger.success('CONFIG', 'Prompt caricati', { 
            component_chars: componentPrompt.length,
            content_chars: contentPrompt.length 
        });
        
        // Carica dati da Google Sheets
        const calculators = await readGoogleSheet();
        if (calculators.length === 0) {
            await logger.error('SHEETS', 'Nessun calcolatore da processare');
            return;
        }
        
        // Carica stato precedente
        const state = await readState();
        const startIndex = state.lastProcessedIndex + 1;

        if (startIndex >= calculators.length) {
            await logger.warning('PROGRESS', 'Tutti i calcolatori già processati', {
                startIndex,
                total: calculators.length,
                lastProcessed: state.lastProcessedIndex
            });
            console.log('\n✅ Tutti i calcolatori sono già stati processati');
            console.log(`📊 Statistiche: ${calculators.length} calcolatori nel Google Sheet`);
            console.log(`📈 Ultimo processato: indice ${state.lastProcessedIndex}`);
            console.log('\n💡 Per riprocessare tutto: rm automation_state.json');
            return;
        }

        const remainingCount = calculators.length - startIndex;
        await logger.info('PROGRESS', 'Inizio generazione batch', {
            totale: calculators.length,
            startIndex,
            rimanenti: remainingCount
        });

        console.log(`\n🚀 AVVIO GENERAZIONE BATCH`);
        console.log(`📊 Calcolatori totali: ${calculators.length}`);
        console.log(`🎯 Ripresa da indice: ${startIndex}`);
        console.log(`⏳ Rimanenti da processare: ${remainingCount}`);
        console.log(`⏱️  Tempo stimato: ~${Math.round(remainingCount * 2)}min (120s per calcolatore)`);
        console.log('');

        // Loop di generazione con progress tracking
        for (let index = startIndex; index < calculators.length; index++) {
            const calculator = calculators[index];
            const current = index - startIndex + 1;
            
            logger.showProgress(current, remainingCount, `${calculator.Titolo}`);
            
            await logger.info('PROGRESS', `Processando ${index + 1}/${calculators.length}: "${calculator.Titolo}"`);
            
            // Validazione dati calcolatore
            if (!calculator.Titolo || !calculator.Slug || !calculator.Categoria || !calculator.Lingua) {
                await logger.warning('PROGRESS', 'Calcolatore saltato - dati mancanti', {
                    titolo: calculator.Titolo || 'MANCANTE',
                    slug: calculator.Slug || 'MANCANTE',
                    categoria: calculator.Categoria || 'MANCANTE',
                    lingua: calculator.Lingua || 'MANCANTE'
                });
                logger.incrementStat('skipped');
                continue;
            }

            // Generazione componente
            await logger.info('AI', 'Generazione componente React...');
            const componentPromptFull = `${componentPrompt}\n\nINPUT STRUTTURATO (JSON):\n\`\`\`json\n${JSON.stringify(calculator, null, 2)}\n\`\`\``;
            const componentResult = await attemptGeneration(componentPromptFull, true);
            
            if (!componentResult || !componentResult.componentCode) {
                await logger.error('AI', 'Generazione componente fallita');
                logger.incrementStat('failed');
                continue;
            }

            const componentName = `${toPascalCase(calculator.Slug)}Calculator`;
            await saveComponentToFile(componentName, componentResult.componentCode);

            // Generazione contenuto
            await logger.info('AI', 'Generazione contenuto markdown...');
            const contentPromptFull = `${contentPrompt}\n\nTitolo del Calcolatore: \`${calculator.Titolo}\``;
            const contentResult = await attemptGeneration(contentPromptFull, false);
            
            if (!contentResult) {
                await logger.warning('AI', 'Generazione contenuto fallita - salvo solo componente');
            } else {
                const categorySlug = slugify(calculator.Categoria);
                await saveContentToFile(calculator.Lingua, categorySlug, calculator.Slug, contentResult);
            }

            // Salva stato
            await saveState({ lastProcessedIndex: index });
            logger.incrementStat('successful');
            
            await logger.success('PROGRESS', `Completato: ${componentName}`);

            // Mostra statistiche intermedie ogni 5 elementi
            if (current % 5 === 0) {
                logger.showStats();
            }

            // Pausa tra generazioni
            if (index < calculators.length - 1) {
                await logger.debug('PROGRESS', 'Pausa 60s per rate limiting...');
                console.log('⏳ Pausa 60 secondi per evitare rate limiting...');
                
                // Countdown visuale
                for (let i = 60; i > 0; i -= 10) {
                    await new Promise(resolve => setTimeout(resolve, 10000));
                    if (i > 10) process.stdout.write(`⏳ ${i-10}s `);
                }
                console.log('✅ Pausa completata\n');
            }
        }

        // Statistiche finali
        console.log('\n🎉 GENERAZIONE COMPLETATA!');
        logger.showStats();
        
        await logger.success('INIT', 'Processo completato con successo', {
            tempo_totale: Math.round((Date.now() - logger.startTime) / 1000),
            log_salvato: logger.logFile
        });

    } catch (error) {
        await logger.error('INIT', 'ERRORE CRITICO', { 
            error: error.message, 
            stack: error.stack 
        });
        
        console.error('\n❌ ERRORE CRITICO:', error.message);
        console.log('\n🔧 DEBUG:');
        console.log(`📄 Log dettagliato salvato in: ${logger.logFile}`);
        console.log('🔍 Per diagnosi: node debug-automation.js');
        
        process.exit(1);
    }
}

// ========================================
// AVVIO SCRIPT
// ========================================
await logger.info('INIT', 'Sistema inizializzato, avvio processo...');
main();
