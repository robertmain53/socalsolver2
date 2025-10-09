// debug-automation.js - Per diagnosticare i problemi

import fs from 'fs/promises';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 SoCalSolver - Debug Automation Script');
console.log('==========================================');

// Step 1: Verifica variabili ambiente
console.log('\n📝 Step 1: Controllo variabili ambiente...');
const SHEET_ID = process.env.SHEET_ID;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log('SHEET_ID:', SHEET_ID ? '✅ Presente' : '❌ Mancante');
console.log('GEMINI_API_KEY:', GEMINI_API_KEY ? '✅ Presente' : '❌ Mancante');
console.log('OPENAI_API_KEY:', OPENAI_API_KEY ? '✅ Presente' : '❌ Mancante');

if (!SHEET_ID) {
    console.log('\n❌ SHEET_ID mancante nel file .env');
    console.log('Aggiungi: SHEET_ID=1LZe2azm517V1CA4NT6wWklhQx5nysSr6xOQk82lCB0I');
    process.exit(1);
}

if (!GEMINI_API_KEY) {
    console.log('\n❌ GEMINI_API_KEY mancante nel file .env');
    console.log('Ottieni la chiave da: https://makersuite.google.com/app/apikey');
    process.exit(1);
}

// Step 2: Verifica file necessari
console.log('\n📁 Step 2: Controllo file necessari...');
const requiredFiles = [
    'credentials.json',
    'prompt_component.txt', 
    'prompt_content.txt',
    '.env'
];

for (const file of requiredFiles) {
    try {
        await fs.access(file);
        console.log(`${file}: ✅ Presente`);
    } catch {
        console.log(`${file}: ❌ Mancante`);
        
        if (file === 'credentials.json') {
            console.log('  → Scarica le credenziali da Google Cloud Console');
        } else if (file === '.env') {
            console.log('  → Crea il file .env dalla template .env.example');
        } else if (file.includes('prompt')) {
            console.log(`  → Crea il file ${file} con il template fornito`);
        }
    }
}

// Step 3: Test connessione Google Sheets
console.log('\n📊 Step 3: Test connessione Google Sheets...');
try {
    const { google } = await import('googleapis');
    
    const auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json',
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    
    console.log('🔑 Autenticazione Google... ', { timeout: 10000 });
    
    const client = await Promise.race([
        auth.getClient(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
    ]);
    
    console.log('✅ Autenticazione Google riuscita');
    
    const sheets = google.sheets({ version: 'v4', auth: client });
    
    console.log('📋 Test lettura Google Sheet...');
    const res = await Promise.race([
        sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: 'calculators!A1:E5', // Solo prime 5 righe per test
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout lettura sheet')), 15000))
    ]);
    
    const rows = res.data.values;
    console.log(`✅ Google Sheet letto: ${rows ? rows.length : 0} righe trovate`);
    
    if (rows && rows.length > 0) {
        console.log('📋 Header trovato:', rows[0]);
        console.log('📋 Prima riga dati:', rows[1] || 'Nessuna riga dati');
    }
    
} catch (error) {
    console.log('❌ Errore Google Sheets:', error.message);
    
    if (error.message.includes('credentials')) {
        console.log('  → Verifica che credentials.json sia valido');
    } else if (error.message.includes('permission')) {
        console.log('  → Verifica i permessi del Google Sheet');
    } else if (error.message.includes('Timeout')) {
        console.log('  → Connessione lenta o problemi di rete');
    }
}

// Step 4: Test API Gemini
console.log('\n🤖 Step 4: Test API Gemini...');
try {
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    
    const testPrompt = 'Rispondi solo con "TEST OK"';
    
    console.log('🔗 Chiamata di test a Gemini...');
    const response = await Promise.race([
        fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: testPrompt }] }],
                generationConfig: { maxOutputTokens: 50 }
            }),
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout Gemini')), 15000))
    ]);
    
    console.log('📡 Status Gemini:', response.status);
    
    if (response.ok) {
        const data = await response.json();
        const result = data.candidates[0].content.parts[0].text;
        console.log('✅ Gemini risposta:', result.substring(0, 50));
    } else {
        const errorText = await response.text();
        console.log('❌ Errore Gemini:', response.status, errorText.substring(0, 200));
        
        if (response.status === 400) {
            console.log('  → Verifica formato della richiesta API');
        } else if (response.status === 403) {
            console.log('  → Verifica validità GEMINI_API_KEY');
        } else if (response.status === 429) {
            console.log('  → Rate limit raggiunto, riprova più tardi');
        }
    }
    
} catch (error) {
    console.log('❌ Errore test Gemini:', error.message);
}

// Step 5: Verifica struttura directory
console.log('\n📁 Step 5: Verifica struttura directory...');
const directories = [
    'components/calculators',
    'content/it',
    'app/it'
];

for (const dir of directories) {
    try {
        await fs.access(dir);
        console.log(`${dir}: ✅ Presente`);
    } catch {
        console.log(`${dir}: ❌ Mancante - creazione...`);
        try {
            await fs.mkdir(dir, { recursive: true });
            console.log(`${dir}: ✅ Creato`);
        } catch (err) {
            console.log(`${dir}: ❌ Errore creazione:`, err.message);
        }
    }
}

// Step 6: Test creazione file di prova
console.log('\n🧪 Step 6: Test creazione file...');
try {
    const testContent = `// Test component
export default function TestCalculator() {
  return <div>Test</div>;
}`;

    const testPath = path.join('components', 'calculators', 'TestCalculator.tsx');
    await fs.writeFile(testPath, testContent);
    console.log('✅ Test scrittura file riuscito');
    
    // Pulizia
    await fs.unlink(testPath);
    console.log('✅ Test pulizia file riuscito');
    
} catch (error) {
    console.log('❌ Errore test file:', error.message);
}

// Step 7: Controlla stato automazione
console.log('\n📊 Step 7: Controlla stato automazione...');
try {
    const stateFile = 'automation_state.json';
    const stateData = await fs.readFile(stateFile, 'utf8');
    const state = JSON.parse(stateData);
    console.log('✅ Stato automazione trovato:', state);
} catch {
    console.log('ℹ️  Nessuno stato automazione precedente (normale per primo avvio)');
}

console.log('\n🎯 RISULTATO DIAGNOSI:');
console.log('======================');

// Suggerimenti basati sui risultati
const fixes = [];

if (!SHEET_ID) fixes.push('❌ Configura SHEET_ID nel .env');
if (!GEMINI_API_KEY) fixes.push('❌ Configura GEMINI_API_KEY nel .env');

console.log('\n📋 AZIONI RICHIESTE:');
if (fixes.length > 0) {
    fixes.forEach(fix => console.log(fix));
} else {
    console.log('✅ Configurazione sembra corretta');
    console.log('✅ Prova a lanciare: node automation.js');
}

console.log('\n💡 DEBUG COMPLETATO');

// Genera un report di debug
const debugReport = {
    timestamp: new Date().toISOString(),
    environment: {
        SHEET_ID: !!SHEET_ID,
        GEMINI_API_KEY: !!GEMINI_API_KEY,
        OPENAI_API_KEY: !!OPENAI_API_KEY
    },
    nodeVersion: process.version,
    platform: process.platform
};

await fs.writeFile('debug-report.json', JSON.stringify(debugReport, null, 2));
console.log('📄 Report salvato in: debug-report.json');
