const fs = require('fs');
const path = require('path');
const https = require('https');

// ID del foglio Google Spreadsheet
const SPREADSHEET_ID = '1LZe2azm517V1CA4NT6wWklhQx5nysSr6xOQk82lCB0I';
const SHEET_ID = '1294515917';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${SHEET_ID}`;

// Funzione per scaricare il CSV (con gestione redirect)
function downloadCSV(url, maxRedirects = 5) {
    return new Promise((resolve, reject) => {
        console.log(`🌐 Tentativo di connessione a: ${url}`);
        
        https.get(url, (response) => {
            console.log(`📡 Status code: ${response.statusCode}`);
            console.log(`📋 Headers: ${JSON.stringify(response.headers, null, 2)}`);
            
            // Gestione redirect
            if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307) {
                const redirectUrl = response.headers.location;
                if (!redirectUrl) {
                    reject(new Error(`Redirect senza URL di destinazione`));
                    return;
                }
                
                if (maxRedirects <= 0) {
                    reject(new Error(`Troppi redirect`));
                    return;
                }
                
                console.log(`🔄 Redirect verso: ${redirectUrl}`);
                response.resume(); // Consuma la response corrente
                
                // Segui il redirect
                downloadCSV(redirectUrl, maxRedirects - 1)
                    .then(resolve)
                    .catch(reject);
                return;
            }
            
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
                return;
            }
            
            let data = '';
            let chunks = 0;
            
            response.on('data', (chunk) => {
                chunks++;
                data += chunk;
                if (chunks % 10 === 0) {
                    console.log(`📊 Ricevuti ${chunks} chunks, ${data.length} caratteri totali`);
                }
            });
            
            response.on('end', () => {
                console.log(`✅ Download completato: ${data.length} caratteri totali`);
                resolve(data);
            });
            
            response.on('error', (error) => {
                console.error(`❌ Errore response: ${error.message}`);
                reject(error);
            });
        }).on('error', (error) => {
            console.error(`❌ Errore request: ${error.message}`);
            reject(error);
        });
    });
}

// Funzione per parsare CSV semplice
function parseCSV(csvData) {
    console.log('🔄 Inizio parsing CSV...');
    console.log(`📊 Lunghezza dati: ${csvData.length} caratteri`);
    
    const lines = csvData.split('\n');
    console.log(`📄 Trovate ${lines.length} righe`);
    
    const result = [];
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim()) {
            // Parsing semplice CSV - gestisce virgole dentro le virgolette
            const row = [];
            let current = '';
            let inQuotes = false;
            
            for (let j = 0; j < lines[i].length; j++) {
                const char = lines[i][j];
                
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    row.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            row.push(current.trim());
            result.push(row);
            
            // Log delle prime righe per debug
            if (i < 5) {
                console.log(`📋 Riga ${i + 1}: ${row.length} colonne - [${row.slice(0, 3).join(', ')}...]`);
            }
        }
    }
    
    console.log(`✅ Parsing completato: ${result.length} righe valide`);
    return result;
}

// Funzione per creare directory se non esiste
function ensureDirectoryExists(dirPath) {
    console.log(`🔍 Verificando directory: ${dirPath}`);
    
    if (!fs.existsSync(dirPath)) {
        console.error(`❌ Directory mancante: ${dirPath}`);
        console.log(`📁 Contenuto directory padre:`);
        
        const parentDir = path.dirname(dirPath);
        if (fs.existsSync(parentDir)) {
            const contents = fs.readdirSync(parentDir);
            console.log(`📋 Contenuto di ${parentDir}:`, contents);
        } else {
            console.log(`❌ Directory padre non esiste: ${parentDir}`);
        }
        
        throw new Error(`Directory mancante: ${dirPath}`);
    }
    
    console.log(`✅ Directory trovata: ${dirPath}`);
}

// Funzione per creare il file .md (vuoto)
function createMdFile(filePath, fileName) {
    // File vuoto come richiesto
    const content = '';
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Creato: ${filePath}`);
}

// Funzione principale
async function main() {
    try {
        console.log('🔄 Inizio script...');
        console.log(`📁 Directory di lavoro: ${__dirname}`);
        
        console.log('🔄 Scaricando dati dal Google Spreadsheet...');
        console.log(`🌐 URL: ${CSV_URL}`);
        
        const csvData = await downloadCSV(CSV_URL);
        console.log(`📊 Dati scaricati: ${csvData.length} caratteri`);
        console.log(`📝 Prime 200 caratteri: ${csvData.substring(0, 200)}...`);
        
        console.log('🔄 Parsing dei dati CSV...');
        const rows = parseCSV(csvData);
        
        console.log(`📊 Trovate ${rows.length} righe nel foglio`);
        
        if (rows.length === 0) {
            console.error('❌ Nessuna riga trovata nel CSV!');
            return;
        }
        
        // Mostra le prime righe per debug
        console.log('\n📋 Prime 5 righe per debug:');
        for (let i = 0; i < Math.min(5, rows.length); i++) {
            console.log(`Riga ${i + 1}: [${rows[i].length} colonne] ${rows[i].slice(0, 3).join(' | ')}...`);
        }
        
        // Verifica che abbiamo abbastanza righe
        if (rows.length < 160) {
            console.error(`❌ Non ci sono abbastanza righe! Trovate: ${rows.length}, necessarie almeno: 160`);
            return;
        }
        
        console.log('\n🔄 Processando righe dalla 160 alla 1564...');
        console.log(`📊 Range di righe da processare: ${Math.min(186, rows.length) - 159} righe`);
        
        let createdFiles = 0;
        let errors = 0;
        let skipped = 0;
        
        // Processa dalle righe 160 a 1564 (indici array: 159 a 1563)
        for (let i = 159; i < Math.min(186, rows.length); i++) {
            const row = rows[i];
            const rowNumber = i + 1;
            
            console.log(`\n🔍 Processando riga ${rowNumber}...`);
            console.log(`📊 Colonne in questa riga: ${row.length}`);
            
            // Verifica che la riga abbia abbastanza colonne
            if (row.length < 21) { // Colonna U è la 21esima (indice 20)
                console.log(`⚠️  Riga ${rowNumber}: dati insufficienti (${row.length} colonne, necessarie 21), saltata`);
                skipped++;
                continue;
            }
            
            const fileName = row[0]?.trim(); // Colonna A (indice 0)
            const mainFolder = row[2]?.trim(); // Colonna C (indice 2)
            const subFolder = row[20]?.trim(); // Colonna U (indice 20)
            
            console.log(`📝 Dati estratti - A: "${fileName}", C: "${mainFolder}", U: "${subFolder}"`);
            
            // Verifica che tutti i valori necessari siano presenti
            if (!fileName || !mainFolder || !subFolder) {
                console.log(`⚠️  Riga ${rowNumber}: dati mancanti, saltata`);
                skipped++;
                continue;
            }
            
            try {
                // Costruisce il percorso
                const mainFolderPath = path.join(__dirname, 'content', mainFolder);
                const subFolderPath = path.join(mainFolderPath, subFolder);
                const filePath = path.join(subFolderPath, `${fileName}.md`);
                
                console.log(`📁 Percorso calcolato: ${filePath}`);
                
                // Verifica che le directory esistano
                console.log(`🔍 Verificando content directory: ${path.join(__dirname, 'content')}`);
                ensureDirectoryExists(path.join(__dirname, 'content'));
                
                console.log(`🔍 Verificando main folder: ${mainFolderPath}`);
                ensureDirectoryExists(mainFolderPath);
                
                console.log(`🔍 Verificando sub folder: ${subFolderPath}`);
                ensureDirectoryExists(subFolderPath);
                
                // Verifica se il file esiste già
                if (fs.existsSync(filePath)) {
                    console.log(`📄 File già esistente, verrà sovrascritto: ${filePath}`);
                }
                
                // Crea il file .md
                console.log(`🔨 Creando file: ${filePath}`);
                createMdFile(filePath, fileName);
                createdFiles++;
                
                // Verifica che il file sia stato creato
                if (fs.existsSync(filePath)) {
                    console.log(`✅ File verificato: ${filePath}`);
                } else {
                    console.error(`❌ File non creato: ${filePath}`);
                }
                
            } catch (error) {
                console.error(`❌ Errore riga ${rowNumber} (${fileName}): ${error.message}`);
                console.error(`🔍 Stack trace: ${error.stack}`);
                errors++;
                
                // Se è un errore di directory mancante, ferma l'esecuzione
                if (error.message.includes('Directory mancante')) {
                    console.error('\n🛑 Script fermato a causa di directory mancante.');
                    process.exit(1);
                }
            }
            
            // Pausa ogni 50 righe per non sovraccaricare i log
            if ((i - 159) % 50 === 0 && i > 159) {
                console.log(`\n📊 Progresso: ${i - 159 + 1}/${Math.min(1564, rows.length) - 159} righe processate`);
            }
        }
        
        console.log('\n📈 Riepilogo finale:');
        console.log(`✅ File creati: ${createdFiles}`);
        console.log(`⚠️  Righe saltate: ${skipped}`);
        console.log(`❌ Errori: ${errors}`);
        console.log('🎉 Script completato!');
        
    } catch (error) {
        console.error('❌ Errore generale:', error.message);
        console.error('🔍 Stack trace:', error.stack);
        process.exit(1);
    }
}

// Verifica che siamo nella directory corretta
if (!fs.existsSync(path.join(__dirname, 'content'))) {
    console.error('❌ Errore: cartella "content" non trovata. Assicurati di eseguire lo script dalla root del progetto.');
    process.exit(1);
}

// Avvia lo script
main();