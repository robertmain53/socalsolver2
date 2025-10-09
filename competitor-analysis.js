// competitor-analysis.js - Script di Analisi Competitiva Intelligente
import fs from 'fs/promises';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ========================================
// CONFIGURAZIONE
// ========================================

const SHEET_ID = process.env.SHEET_ID;
const SHEET_NAME = process.env.SHEET_NAME || 'calculators';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GOOGLE_CSE_API_KEY = process.env.GOOGLE_CSE_API_KEY; // Custom Search Engine API
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID; // Custom Search Engine ID

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${GEMINI_API_KEY}`;
const GOOGLE_SEARCH_URL = 'https://www.googleapis.com/customsearch/v1';

const CREDENTIALS_FILE = path.join(__dirname, 'credentials.json');
const REPORTS_DIR = path.join(__dirname, 'competitor-reports');
const ANALYSIS_STATE_FILE = path.join(__dirname, 'competitor_analysis_state.json');

// Configurazione domini di ricerca per lingua
const SEARCH_DOMAINS = {
    'it': 'google.it',
    'en': 'google.com', 
    'es': 'google.es',
    'fr': 'google.fr'
};

// Rate limiting
const SEARCH_DELAY_MS = 2000; // 2 secondi tra ricerche Google
const AI_DELAY_MS = 3000;     // 3 secondi tra chiamate Gemini
const SCRAPING_DELAY_MS = 1000; // 1 secondo tra scraping

// ========================================
// SISTEMA DI LOGGING AVANZATO
// ========================================

class AnalysisLogger {
    constructor() {
        this.startTime = Date.now();
        this.logFile = path.join(__dirname, `competitor_analysis_${new Date().toISOString().substring(0, 10)}.log`);
        this.stats = {
            calculatorsAnalyzed: 0,
            searchesPerformed: 0,
            pagesScraped: 0,
            aiAnalyses: 0,
            alignedCalculators: 0,
            misalignedCalculators: 0,
            errors: 0
        };
    }

    timestamp() {
        return new Date().toISOString().substring(11, 19);
    }

    async log(level, category, message, data = null) {
        const ts = this.timestamp();
        const elapsed = Math.round((Date.now() - this.startTime) / 1000);
        
        const colors = {
            INFO: '\x1b[36m',     // Cyan
            SUCCESS: '\x1b[32m',  // Green
            WARNING: '\x1b[33m',  // Yellow
            ERROR: '\x1b[31m',    // Red
            ANALYSIS: '\x1b[35m', // Magenta
            RESET: '\x1b[0m'      // Reset
        };

        const icons = {
            INIT: '🚀',
            CONFIG: '⚙️',
            SHEETS: '📊',
            SEARCH: '🔍',
            SCRAPE: '🕷️',
            AI: '🤖',
            ANALYSIS: '📋',
            REPORT: '📄',
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
    analysis(category, message, data) { return this.log('ANALYSIS', category, message, data); }

    showProgress(current, total, item = '') {
        const percentage = Math.round((current / total) * 100);
        const progressBar = '█'.repeat(Math.round(percentage / 5)) + '░'.repeat(20 - Math.round(percentage / 5));
        const eta = current > 0 ? Math.round(((Date.now() - this.startTime) / current) * (total - current) / 1000) : 0;
        
        console.log(`\x1b[36m📈 PROGRESS\x1b[0m: [${progressBar}] ${percentage}% (${current}/${total}) ETA: ${eta}s ${item ? '| ' + item : ''}`);
        console.log(`\x1b[35m📊 STATS\x1b[0m: Searches: ${this.stats.searchesPerformed} | Pages: ${this.stats.pagesScraped} | AI: ${this.stats.aiAnalyses} | Errors: ${this.stats.errors}`);
    }

    showFinalStats() {
        const elapsed = Math.round((Date.now() - this.startTime) / 1000);
        console.log(`\n\x1b[36m📊 STATISTICHE FINALI\x1b[0m:`);
        console.log(`   ⏱️  Tempo totale: ${elapsed}s (${Math.round(elapsed/60)}min)`);
        console.log(`   🧮 Calcolatori analizzati: ${this.stats.calculatorsAnalyzed}`);
        console.log(`   🔍 Ricerche Google: ${this.stats.searchesPerformed}`);
        console.log(`   🕷️  Pagine scrapate: ${this.stats.pagesScraped}`);
        console.log(`   🤖 Analisi AI: ${this.stats.aiAnalyses}`);
        console.log(`   ✅ Calcolatori allineati: ${this.stats.alignedCalculators}`);
        console.log(`   ❌ Calcolatori disallineati: ${this.stats.misalignedCalculators}`);
        console.log(`   🐛 Errori: ${this.stats.errors}`);
    }

    incrementStat(type) {
        this.stats[type]++;
    }
}

const logger = new AnalysisLogger();

// ========================================
// SETUP E VALIDAZIONE
// ========================================

console.log('\x1b[35m');
console.log('╔══════════════════════════════════════════════════╗');
console.log('║        🔍 SoCalSolver Competitor Analysis       ║');
console.log('║          Analisi Competitiva Intelligente       ║');
console.log('╚══════════════════════════════════════════════════╝');
console.log('\x1b[0m');

await logger.info('INIT', 'Avvio sistema di analisi competitiva...');

async function validateConfiguration() {
    await logger.info('CONFIG', 'Validazione configurazione...');
    const errors = [];
    
    if (!SHEET_ID) errors.push('SHEET_ID mancante in .env');
    if (!GEMINI_API_KEY) errors.push('GEMINI_API_KEY mancante in .env');
    if (!GOOGLE_CSE_API_KEY) errors.push('GOOGLE_CSE_API_KEY mancante in .env');
    if (!GOOGLE_CSE_ID) errors.push('GOOGLE_CSE_ID mancante in .env');
    
    const requiredFiles = [CREDENTIALS_FILE];
    for (const file of requiredFiles) {
        try {
            await fs.access(file);
        } catch {
            errors.push(`${path.basename(file)} non trovato`);
        }
    }
    
    if (errors.length > 0) {
        await logger.error('CONFIG', 'Errori di configurazione', { errori: errors });
        console.error('\n❌ CONFIGURAZIONE MANCANTE:');
        errors.forEach(error => console.error(`  • ${error}`));
        console.log('\n🔧 SETUP RICHIESTO:');
        console.log('  1. Crea Google Custom Search Engine: https://cse.google.com/');
        console.log('  2. Ottieni API Key: https://console.developers.google.com/');
        console.log('  3. Aggiungi nel .env:');
        console.log('     GOOGLE_CSE_API_KEY=your_api_key');
        console.log('     GOOGLE_CSE_ID=your_cse_id');
        process.exit(1);
    }
    
    await logger.success('CONFIG', 'Configurazione validata');
}

// ========================================
// GOOGLE SHEETS INTEGRATION
// ========================================

async function readCalculatorsFromSheet() {
    await logger.info('SHEETS', 'Lettura calcolatori dal Google Sheet...');
    
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
            throw new Error('Nessun dato trovato nel Google Sheet');
        }

        const header = rows[0].map(h => h.trim());
        const dataRows = rows.slice(1);
        
        const calculators = dataRows.map((row, index) => {
            let obj = { _rowIndex: index };
            header.forEach((key, colIndex) => { 
                obj[key] = row[colIndex] || ''; 
            });
            return obj;
        });
        
        await logger.success('SHEETS', `${calculators.length} calcolatori caricati`, {
            sample: calculators.slice(0, 3).map(c => ({ 
                titolo: c.Titolo, 
                lingua: c.Lingua,
                categoria: c.Categoria 
            }))
        });
        
        return calculators;
        
    } catch (error) {
        await logger.error('SHEETS', 'Errore lettura Google Sheet', { error: error.message });
        throw error;
    }
}

// ========================================
// GOOGLE SEARCH FUNCTIONS
// ========================================

async function performGoogleSearch(query, language, numResults = 7) {
    await logger.info('SEARCH', `Ricerca Google per: "${query}" (${language})`);
    logger.stats.searchesPerformed++;
    
    try {
        const domain = SEARCH_DOMAINS[language] || 'google.com';
        const searchParams = new URLSearchParams({
            key: GOOGLE_CSE_API_KEY,
            cx: GOOGLE_CSE_ID,
            q: query,
            num: numResults.toString(),
            gl: language.toUpperCase(),
            hl: language,
            googlehost: domain
        });
        
        const response = await fetch(`${GOOGLE_SEARCH_URL}?${searchParams}`);
        
        if (!response.ok) {
            throw new Error(`Google Search API error: ${response.status}`);
        }
        
        const data = await response.json();
        const results = data.items || [];
        
        await logger.success('SEARCH', `${results.length} risultati trovati`);
        
        return results.map(item => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
            domain: new URL(item.link).hostname
        }));
        
    } catch (error) {
        await logger.error('SEARCH', 'Errore ricerca Google', { 
            query, 
            language, 
            error: error.message 
        });
        return [];
    }
}

// ========================================
// WEB SCRAPING FUNCTIONS
// ========================================

async function scrapePageContent(url) {
    await logger.info('SCRAPE', `Scraping: ${url}`);
    logger.stats.pagesScraped++;
    
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const html = await response.text();
        
        // Estrai contenuto testuale principale (rimuovi HTML, script, style)
        const cleanText = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        
        // Estrai i primi 2000 caratteri per l'analisi
        const excerpt = cleanText.substring(0, 2000);
        
        await logger.success('SCRAPE', `Contenuto estratto: ${excerpt.length} caratteri`);
        
        return {
            url,
            content: excerpt,
            wordCount: cleanText.split(' ').length,
            hasCalculator: /calcul|calculator|compute|tool|form|input/i.test(html.toLowerCase())
        };
        
    } catch (error) {
        await logger.warning('SCRAPE', `Errore scraping ${url}`, { error: error.message });
        logger.stats.errors++;
        return {
            url,
            content: '',
            wordCount: 0,
            hasCalculator: false,
            error: error.message
        };
    }
}

// ========================================
// AI ANALYSIS FUNCTIONS
// ========================================

async function analyzeWithGemini(prompt, analysisType) {
    await logger.info('AI', `Analisi AI: ${analysisType}`);
    logger.stats.aiAnalyses++;
    
    try {
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ text: prompt }] 
                }],
                generationConfig: { 
                    maxOutputTokens: 4096,
                    temperature: 0.3,
                    topP: 0.8,
                    topK: 40
                }
            }),
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const result = data.candidates[0].content.parts[0].text;
        
        await logger.success('AI', `Analisi completata: ${result.length} caratteri`);
        
        return result;
        
    } catch (error) {
        await logger.error('AI', `Errore analisi ${analysisType}`, { error: error.message });
        logger.stats.errors++;
        return null;
    }
}

async function checkCalculatorAlignment(myCalculator, competitorData) {
    const prompt = `
TASK: Verifica se il calcolatore competitor è allineato con il mio calcolatore.

MIO CALCOLATORE:
- Titolo: ${myCalculator.Titolo}
- Categoria: ${myCalculator.Categoria}
- Descrizione: ${myCalculator.Descrizione || 'Non disponibile'}

COMPETITOR DATA:
${competitorData.map((comp, i) => `
COMPETITOR ${i+1}:
URL: ${comp.url}
Titolo: ${comp.title}
Snippet: ${comp.snippet}
Contenuto: ${comp.content.substring(0, 500)}...
`).join('\n')}

ISTRUZIONI:
1. Analizza se questi competitor trattano lo stesso argomento/tipo di calcolo del mio calcolatore
2. Rispondi con un JSON strutturato così:

{
  "aligned": true/false,
  "confidence": 0-100,
  "reasoning": "Spiegazione del perché sono/non sono allineati",
  "relevantCompetitors": [0, 1, 2...], // Indici dei competitor più rilevanti
  "suggestedFocus": "Aspetto specifico su cui concentrarsi se allineati"
}

Sii rigoroso: considera allineati solo calcolatori che trattano ESATTAMENTE lo stesso tipo di calcolo.
`;

    const result = await analyzeWithGemini(prompt, 'alignment_check');
    if (!result) return null;
    
    try {
        // Estrai JSON dalla risposta
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        } else {
            throw new Error('No JSON found in response');
        }
    } catch (error) {
        await logger.warning('AI', 'Errore parsing JSON alignment', { error: error.message });
        return null;
    }
}

async function performCompetitiveAnalysis(myCalculator, competitorData, alignmentData) {
    const relevantCompetitors = alignmentData.relevantCompetitors.map(i => competitorData[i]);
    
    const prompt = `
TASK: Analisi competitiva approfondita per migliorare il mio calcolatore.

MIO CALCOLATORE:
- Titolo: ${myCalculator.Titolo}
- Categoria: ${myCalculator.Categoria}
- Descrizione: ${myCalculator.Descrizione || 'Non disponibile'}

COMPETITOR ANALIZZATI:
${relevantCompetitors.map((comp, i) => `
COMPETITOR ${i+1}:
URL: ${comp.url}
Titolo: ${comp.title}
Snippet: ${comp.snippet}
Contenuto: ${comp.content}
Ha Calcolatore Interattivo: ${comp.hasCalculator}
Numero Parole: ${comp.wordCount}
`).join('\n')}

FORNISCI UN'ANALISI STRUTTURATA CON:

## 1. CARATTERISTICHE DI SPICCO DEI COMPETITOR
[Per ogni competitor, elenca le funzionalità principali e caratteristiche uniche]

## 2. ASPETTI INFORMATIVI TRATTATI
[Quali argomenti, guide, esempi, FAQ vengono coperti dai competitor]

## 3. TIPO DI UTILIZZATORE TARGET
[Analizza se si rivolgono a utenti privati o professionali, scopo d'uso]

## 4. PUNTI DI FORZA DEI COMPETITOR
[Cosa fanno bene che potrei adottare]

## 5. OPPORTUNITÀ DI MIGLIORAMENTO
[Come posso rendere il mio calcolatore più utile e completo]

## 6. STRATEGIA CONSIGLIATA
[Raccomandazioni specifiche per battere la concorrenza]

Sii specifico e operativo nelle raccomandazioni.
`;

    const result = await analyzeWithGemini(prompt, 'competitive_analysis');
    return result;
}

// ========================================
// STATE MANAGEMENT
// ========================================

async function readAnalysisState() {
    try {
        const data = await fs.readFile(ANALYSIS_STATE_FILE, 'utf8');
        return JSON.parse(data);
    } catch {
        return { lastAnalyzedIndex: -1, reports: [] };
    }
}

async function saveAnalysisState(state) {
    await fs.writeFile(ANALYSIS_STATE_FILE, JSON.stringify(state, null, 2));
}

// ========================================
// REPORT GENERATION
// ========================================

async function generateCalculatorReport(calculator, analysis) {
    const reportDir = path.join(REPORTS_DIR, calculator.Lingua, 
        calculator.Categoria.toLowerCase().replace(/\s+/g, '-'));
    await fs.mkdir(reportDir, { recursive: true });
    
    const reportFile = path.join(reportDir, `${calculator.Slug}-analysis.md`);
    
    const report = `# Analisi Competitiva: ${calculator.Titolo}

**Data Analisi:** ${new Date().toISOString().split('T')[0]}
**Categoria:** ${calculator.Categoria}
**Lingua:** ${calculator.Lingua}
**Status:** ${analysis.aligned ? 'ALLINEATO' : 'NON ALLINEATO'}

## Informazioni Calcolatore

- **Titolo:** ${calculator.Titolo}
- **Slug:** ${calculator.Slug}
- **Descrizione:** ${calculator.Descrizione || 'Non disponibile'}

## Risultati Ricerca

${analysis.searchResults.map((result, i) => `
### Competitor ${i+1}: ${result.title}
- **URL:** ${result.link}
- **Dominio:** ${result.domain}
- **Snippet:** ${result.snippet}
`).join('\n')}

## Allineamento Analisi

${analysis.alignmentResult ? `
- **Allineato:** ${analysis.alignmentResult.aligned ? 'SÌ' : 'NO'}
- **Confidenza:** ${analysis.alignmentResult.confidence}%
- **Reasoning:** ${analysis.alignmentResult.reasoning}
- **Focus Suggerito:** ${analysis.alignmentResult.suggestedFocus || 'N/A'}
` : 'Analisi allineamento non disponibile'}

## Analisi Competitiva

${analysis.competitiveAnalysis || 'Analisi competitiva non disponibile - calcolatore non allineato o errore nell\'analisi'}

---
*Report generato automaticamente da SoCalSolver Competitor Analysis*
`;

    await fs.writeFile(reportFile, report);
    await logger.success('REPORT', `Report salvato: ${reportFile}`);
}

// ========================================
// MAIN ANALYSIS LOGIC
// ========================================

async function analyzeCalculator(calculator) {
    await logger.info('ANALYSIS', `Analisi calcolatore: ${calculator.Titolo}`);
    
    const analysis = {
        calculator: calculator,
        searchQuery: `${calculator.Titolo} calcolatore calculator`,
        searchResults: [],
        scrapedData: [],
        alignmentResult: null,
        competitiveAnalysis: null,
        aligned: false
    };
    
    try {
        // 1. Ricerca Google
        await logger.info('ANALYSIS', 'Step 1: Ricerca Google...');
        analysis.searchResults = await performGoogleSearch(
            analysis.searchQuery, 
            calculator.Lingua, 
            7
        );
        
        if (analysis.searchResults.length === 0) {
            await logger.warning('ANALYSIS', 'Nessun risultato trovato per la ricerca');
            return analysis;
        }
        
        await new Promise(resolve => setTimeout(resolve, SEARCH_DELAY_MS));
        
        // 2. Scraping contenuti
        await logger.info('ANALYSIS', 'Step 2: Scraping contenuti...');
        for (const result of analysis.searchResults) {
            const scrapedContent = await scrapePageContent(result.link);
            analysis.scrapedData.push({
                ...result,
                ...scrapedContent
            });
            await new Promise(resolve => setTimeout(resolve, SCRAPING_DELAY_MS));
        }
        
        // 3. Check allineamento
        await logger.info('ANALYSIS', 'Step 3: Verifica allineamento...');
        analysis.alignmentResult = await checkCalculatorAlignment(
            calculator, 
            analysis.scrapedData
        );
        
        if (!analysis.alignmentResult) {
            await logger.warning('ANALYSIS', 'Errore verifica allineamento');
            return analysis;
        }
        
        analysis.aligned = analysis.alignmentResult.aligned;
        await new Promise(resolve => setTimeout(resolve, AI_DELAY_MS));
        
        // 4. Analisi competitiva (solo se allineato)
        if (analysis.aligned) {
            await logger.info('ANALYSIS', 'Step 4: Analisi competitiva approfondita...');
            analysis.competitiveAnalysis = await performCompetitiveAnalysis(
                calculator,
                analysis.scrapedData,
                analysis.alignmentResult
            );
            await new Promise(resolve => setTimeout(resolve, AI_DELAY_MS));
            logger.stats.alignedCalculators++;
        } else {
            await logger.warning('ANALYSIS', 'Calcolatore non allineato - skip analisi competitiva');
            logger.stats.misalignedCalculators++;
        }
        
        // 5. Genera report
        await generateCalculatorReport(calculator, analysis);
        
        return analysis;
        
    } catch (error) {
        await logger.error('ANALYSIS', `Errore analisi calcolatore: ${calculator.Titolo}`, { 
            error: error.message 
        });
        logger.stats.errors++;
        return analysis;
    }
}

async function generateSummaryReport(allAnalyses) {
    await logger.info('REPORT', 'Generazione report di riepilogo...');
    
    const summaryFile = path.join(REPORTS_DIR, `summary-${Date.now()}.md`);
    
    const alignedCalculators = allAnalyses.filter(a => a.aligned);
    const misalignedCalculators = allAnalyses.filter(a => !a.aligned);
    
    const summary = `# SoCalSolver - Report Analisi Competitiva

**Data:** ${new Date().toISOString().split('T')[0]}
**Calcolatori Analizzati:** ${allAnalyses.length}
**Calcolatori Allineati:** ${alignedCalculators.length}
**Calcolatori Non Allineati:** ${misalignedCalculators.length}

## Statistiche Generali

${logger.stats.calculatorsAnalyzed} calcolatori analizzati
${logger.stats.searchesPerformed} ricerche Google eseguite
${logger.stats.pagesScraped} pagine web analizzate
${logger.stats.aiAnalyses} analisi AI completate

## Calcolatori Allineati (${alignedCalculators.length})

${alignedCalculators.map(calc => `
### ${calc.calculator.Titolo}
- **Categoria:** ${calc.calculator.Categoria}
- **Lingua:** ${calc.calculator.Lingua}
- **Confidenza Allineamento:** ${calc.alignmentResult?.confidence || 'N/A'}%
- **Competitor Rilevanti:** ${calc.alignmentResult?.relevantCompetitors?.length || 0}
- **Report:** \`${calc.calculator.Slug}-analysis.md\`
`).join('\n')}

## Calcolatori Non Allineati (${misalignedCalculators.length})

${misalignedCalculators.map(calc => `
### ${calc.calculator.Titolo}
- **Categoria:** ${calc.calculator.Categoria}
- **Lingua:** ${calc.calculator.Lingua}
- **Motivo:** ${calc.alignmentResult?.reasoning || 'Analisi non completata'}
`).join('\n')}

## Azioni Raccomandate

1. **Priorità Alta:** Revisiona i ${misalignedCalculators.length} calcolatori non allineati
2. **Implementazioni:** Applica i miglioramenti suggeriti nei ${alignedCalculators.length} calcolatori allineati
3. **Monitoraggio:** Ripeti l'analisi periodicamente per nuovi competitor

---
*Report generato da SoCalSolver Competitor Analysis v1.0*
`;

    await fs.writeFile(summaryFile, summary);
    await logger.success('REPORT', `Summary report salvato: ${summaryFile}`);
}

// ========================================
// MAIN FUNCTION
// ========================================

async function main() {
    try {
        await validateConfiguration();
        await fs.mkdir(REPORTS_DIR, { recursive: true });
        
        const calculators = await readCalculatorsFromSheet();
        const state = await readAnalysisState();
        const startIndex = state.lastAnalyzedIndex + 1;
        
        if (startIndex >= calculators.length) {
            await logger.info('ANALYSIS', 'Tutti i calcolatori già analizzati');
            logger.showFinalStats();
            return;
        }
        
        const remainingCount = calculators.length - startIndex;
        
        console.log(`\n🔍 ANALISI COMPETITIVA BATCH`);
        console.log('============================');
        console.log(`📊 Calcolatori totali: ${calculators.length}`);
        console.log(`🎯 Ripresa da indice: ${startIndex}`);
        console.log(`⏳ Rimanenti: ${remainingCount}`);
        console.log(`⏱️  Tempo stimato: ~${Math.round(remainingCount * 2)}min`);
        console.log('');
        
        const allAnalyses = state.reports || [];
        
        for (let index = startIndex; index < calculators.length; index++) {
            const calculator = calculators[index];
            const current = index - startIndex + 1;
            
            logger.showProgress(current, remainingCount, calculator.Titolo);
            
            if (!calculator.Titolo || !calculator.Lingua || !calculator.Categoria) {
                await logger.warning('ANALYSIS', 'Calcolatore saltato - dati mancanti');
                continue;
            }
            
            const analysis = await analyzeCalculator(calculator);
            allAnalyses.push(analysis);
            
            logger.stats.calculatorsAnalyzed++;
            
            // Salva stato ogni 5 calcolatori
            if (current % 5 === 0) {
                await saveAnalysisState({ 
                    lastAnalyzedIndex: index, 
                    reports: allAnalyses 
                });
            }
        }
        
        // Genera report finale
        await generateSummaryReport(allAnalyses);
        await saveAnalysisState({ 
            lastAnalyzedIndex: calculators.length - 1, 
            reports: allAnalyses 
        });
        
        console.log('\n🎉 ANALISI COMPETITIVA COMPLETATA!');
        logger.showFinalStats();
        
        console.log(`\n📄 REPORTS GENERATI:`);
        console.log(`   📂 Directory: ${REPORTS_DIR}`);
        console.log(`   📋 Summary: summary-*.md`);
        console.log(`   📝 Dettaglio: [lingua]/[categoria]/[slug]-analysis.md`);
        
    } catch (error) {
        await logger.error('INIT', 'Errore critico', { 
            error: error.message, 
            stack: error.stack 
        });
        process.exit(1);
    }
}

// ========================================
// AVVIO SCRIPT
// ========================================
await logger.info('INIT', 'Sistema di analisi competitiva inizializzato');
main();
