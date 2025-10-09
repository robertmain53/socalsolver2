// test-single-calculator.js - Test rapido per un singolo calcolatore
import fs from 'fs/promises';
import 'dotenv/config';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GOOGLE_CSE_API_KEY = process.env.GOOGLE_CSE_API_KEY;
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;

// Test calculator data
const TEST_CALCULATOR = {
    Titolo: "Calcolatore Tasse Regime Forfettario",
    Slug: "tasse-regime-forfettario", 
    Categoria: "Fisco e Lavoro Autonomo",
    Lingua: "it",
    Descrizione: "Calcola tasse, acconti e saldi per il regime forfettario"
};

console.log('🧪 Test Singolo Calcolatore - Analisi Competitiva');
console.log('================================================');
console.log(`📊 Calcolatore: ${TEST_CALCULATOR.Titolo}`);
console.log(`🏷️  Categoria: ${TEST_CALCULATOR.Categoria}`);
console.log(`🌍 Lingua: ${TEST_CALCULATOR.Lingua}`);
console.log('');

async function testGoogleSearch() {
    console.log('🔍 Test Google Search API...');
    
    if (!GOOGLE_CSE_API_KEY || !GOOGLE_CSE_ID) {
        console.log('❌ Google Search API non configurato');
        return false;
    }
    
    try {
        const query = `${TEST_CALCULATOR.Titolo} calcolatore`;
        const searchParams = new URLSearchParams({
            key: GOOGLE_CSE_API_KEY,
            cx: GOOGLE_CSE_ID,
            q: query,
            num: '3',
            gl: 'IT',
            hl: 'it'
        });
        
        const response = await fetch(`https://www.googleapis.com/customsearch/v1?${searchParams}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        const results = data.items || [];
        
        console.log(`✅ Google Search: ${results.length} risultati trovati`);
        
        results.forEach((result, i) => {
            console.log(`   ${i+1}. ${result.title}`);
            console.log(`      ${result.link}`);
        });
        
        return true;
        
    } catch (error) {
        console.log(`❌ Google Search Error: ${error.message}`);
        return false;
    }
}

async function testGeminiAnalysis() {
    console.log('\n🤖 Test Gemini Analysis API...');
    
    if (!GEMINI_API_KEY) {
        console.log('❌ Gemini API non configurato');
        return false;
    }
    
    try {
        const testPrompt = `
Analizza questo calcolatore:

CALCOLATORE:
- Titolo: ${TEST_CALCULATOR.Titolo}
- Categoria: ${TEST_CALCULATOR.Categoria}
- Descrizione: ${TEST_CALCULATOR.Descrizione}

COMPETITOR SIMULATO:
- URL: https://example.com/calcolo-tasse-forfettario
- Titolo: Calcolo Tasse Regime Forfettario Online
- Contenuto: Calcolatore per regime forfettario, calcola imposte sostitutive e acconti

TASK: Verifica se questo competitor è allineato con il mio calcolatore.
Rispondi con un breve JSON: {"aligned": true, "confidence": 85, "reasoning": "Spiegazione"}
`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: testPrompt }] }],
                generationConfig: { maxOutputTokens: 512, temperature: 0.3 }
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const result = data.candidates[0].content.parts[0].text;
        
        console.log('✅ Gemini API: Risposta ricevuta');
        console.log('📝 Esempio risposta:');
        console.log(result.substring(0, 200) + '...');
        
        return true;
        
    } catch (error) {
        console.log(`❌ Gemini Error: ${error.message}`);
        return false;
    }
}

async function testWebScraping() {
    console.log('\n🕷️  Test Web Scraping...');
    
    try {
        const testUrl = 'https://httpbin.org/html';
        const response = await fetch(testUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; SoCalSolver-Analysis/1.0)'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const html = await response.text();
        const textContent = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        
        console.log('✅ Web Scraping: Funzionante');
        console.log(`📄 Contenuto estratto: ${textContent.length} caratteri`);
        
        return true;
        
    } catch (error) {
        console.log(`❌ Web Scraping Error: ${error.message}`);
        return false;
    }
}

async function runTests() {
    const results = {
        googleSearch: await testGoogleSearch(),
        geminiAnalysis: await testGeminiAnalysis(), 
        webScraping: await testWebScraping()
    };
    
    console.log('\n📊 RISULTATI TEST');
    console.log('=================');
    console.log(`🔍 Google Search API: ${results.googleSearch ? '✅ OK' : '❌ FAIL'}`);
    console.log(`🤖 Gemini Analysis: ${results.geminiAnalysis ? '✅ OK' : '❌ FAIL'}`);
    console.log(`🕷️  Web Scraping: ${results.webScraping ? '✅ OK' : '❌ FAIL'}`);
    
    const allPassed = Object.values(results).every(r => r);
    
    console.log('\n🎯 RISULTATO GENERALE');
    console.log('=====================');
    
    if (allPassed) {
        console.log('🎉 TUTTI I TEST SUPERATI!');
        console.log('✅ Il sistema è pronto per l\'analisi competitiva completa');
        console.log('\n🚀 Comandi prossimi:');
        console.log('   node competitor-analysis.js          # Analisi completa');
        console.log('   node competitor-analysis.js --limit=5 # Solo primi 5 calcolatori');
    } else {
        console.log('⚠️  ALCUNI TEST FALLITI');
        console.log('🔧 Controlla la configurazione e rilancia:');
        console.log('   ./setup-competitor-analysis.sh');
        console.log('\n💡 TROUBLESHOOTING:');
        
        if (!results.googleSearch) {
            console.log('   • Verifica GOOGLE_CSE_API_KEY e GOOGLE_CSE_ID nel .env');
            console.log('   • Controlla che Custom Search JSON API sia abilitata');
        }
        
        if (!results.geminiAnalysis) {
            console.log('   • Verifica GEMINI_API_KEY nel .env');
            console.log('   • Controlla quota e rate limits su Google AI Studio');
        }
        
        if (!results.webScraping) {
            console.log('   • Verifica connessione internet');
            console.log('   • Alcuni siti potrebbero bloccare il scraping');
        }
    }
    
    console.log('\n📋 NEXT STEPS:');
    console.log(`   1. Se tutto OK: node competitor-analysis.js`);
    console.log(`   2. Se problemi: ./setup-competitor-analysis.sh`);
    console.log(`   3. Per supporto: controlla i log dettagliati`);
}

// Esegui tutti i test
runTests().catch(error => {
    console.error('❌ Errore durante i test:', error.message);
    process.exit(1);
});
