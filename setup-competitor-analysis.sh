#!/bin/bash

echo "🔧 Setup SoCalSolver Competitor Analysis"
echo "========================================"

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Funzione per step con colori
print_step() {
    echo -e "${BLUE}📋 STEP $1:${NC} $2"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${PURPLE}💡 $1${NC}"
}

# Verifica file .env esistente
if [ ! -f ".env" ]; then
    print_error ".env file not found"
    echo "Copying from .env.example..."
    cp .env.example .env 2>/dev/null || {
        echo "Creating .env file..."
        touch .env
    }
fi

print_step "1" "Verificando configurazione esistente..."

# Controlla variabili esistenti
check_env_var() {
    local var_name=$1
    local var_value=$(grep "^$var_name=" .env 2>/dev/null | cut -d'=' -f2)
    
    if [ -n "$var_value" ] && [ "$var_value" != "your_${var_name,,}_here" ]; then
        print_success "$var_name già configurato"
        return 0
    else
        print_warning "$var_name non configurato"
        return 1
    fi
}

# Controlla tutte le variabili necessarie
GEMINI_OK=false
SHEET_OK=false
CSE_KEY_OK=false
CSE_ID_OK=false

if check_env_var "GEMINI_API_KEY"; then GEMINI_OK=true; fi
if check_env_var "SHEET_ID"; then SHEET_OK=true; fi
if check_env_var "GOOGLE_CSE_API_KEY"; then CSE_KEY_OK=true; fi
if check_env_var "GOOGLE_CSE_ID"; then CSE_ID_OK=true; fi

echo ""

# Setup Google Custom Search Engine
if [ "$CSE_KEY_OK" = false ] || [ "$CSE_ID_OK" = false ]; then
    print_step "2" "Setup Google Custom Search Engine"
    echo "Per l'analisi competitiva serve Google Custom Search API"
    echo ""
    
    print_info "SETUP GUIDATO:"
    echo "1. Vai su: https://console.developers.google.com/"
    echo "2. Crea un nuovo progetto o selezionane uno esistente"
    echo "3. Abilita 'Custom Search JSON API'"
    echo "4. Crea credenziali API Key"
    echo "5. Vai su: https://cse.google.com/"
    echo "6. Crea un nuovo Custom Search Engine"
    echo "7. Nel campo 'Sites to search' inserisci: '*' (asterisco)"
    echo "8. Nelle impostazioni avanzate abilita 'Search the entire web'"
    echo ""
    
    if [ "$CSE_KEY_OK" = false ]; then
        echo -n "📝 Inserisci la tua Google API Key: "
        read -r google_api_key
        
        if [ -n "$google_api_key" ]; then
            # Rimuovi vecchia entry se esiste
            sed -i '/^GOOGLE_CSE_API_KEY=/d' .env
            echo "GOOGLE_CSE_API_KEY=$google_api_key" >> .env
            print_success "Google API Key salvata"
        else
            print_error "API Key non inserita"
        fi
    fi
    
    if [ "$CSE_ID_OK" = false ]; then
        echo -n "📝 Inserisci il tuo Custom Search Engine ID: "
        read -r cse_id
        
        if [ -n "$cse_id" ]; then
            # Rimuovi vecchia entry se esiste
            sed -i '/^GOOGLE_CSE_ID=/d' .env
            echo "GOOGLE_CSE_ID=$cse_id" >> .env
            print_success "Custom Search Engine ID salvato"
        else
            print_error "CSE ID non inserito"
        fi
    fi
    
    echo ""
fi

# Verifica altre configurazioni necessarie
if [ "$GEMINI_OK" = false ]; then
    print_step "3" "Gemini API Key mancante"
    print_warning "Serve GEMINI_API_KEY per l'analisi AI"
    echo "Ottienila da: https://makersuite.google.com/app/apikey"
    echo -n "📝 Inserisci Gemini API Key (o premi ENTER per saltare): "
    read -r gemini_key
    
    if [ -n "$gemini_key" ]; then
        sed -i '/^GEMINI_API_KEY=/d' .env
        echo "GEMINI_API_KEY=$gemini_key" >> .env
        print_success "Gemini API Key salvata"
    fi
    echo ""
fi

if [ "$SHEET_OK" = false ]; then
    print_step "4" "Google Sheet ID mancante"
    print_warning "Serve SHEET_ID per leggere i calcolatori"
    echo "Usa l'ID del tuo Google Sheet 'calculators'"
    echo -n "📝 Inserisci Sheet ID (o premi ENTER per saltare): "
    read -r sheet_id
    
    if [ -n "$sheet_id" ]; then
        sed -i '/^SHEET_ID=/d' .env
        echo "SHEET_ID=$sheet_id" >> .env
        print_success "Sheet ID salvato"
    fi
    echo ""
fi

# Test configurazione
print_step "5" "Test configurazione..."

# Crea script di test rapido
cat > test-competitor-config.js << 'EOF'
import 'dotenv/config';

const required = {
    'GEMINI_API_KEY': process.env.GEMINI_API_KEY,
    'SHEET_ID': process.env.SHEET_ID,
    'GOOGLE_CSE_API_KEY': process.env.GOOGLE_CSE_API_KEY,
    'GOOGLE_CSE_ID': process.env.GOOGLE_CSE_ID
};

console.log('🧪 Test Configurazione Competitor Analysis');
console.log('==========================================');

let allOk = true;
for (const [key, value] of Object.entries(required)) {
    if (value && value !== `your_${key.toLowerCase()}_here`) {
        console.log(`✅ ${key}: Configurato`);
    } else {
        console.log(`❌ ${key}: Mancante`);
        allOk = false;
    }
}

console.log('');
if (allOk) {
    console.log('🎉 Configurazione completa! Puoi lanciare:');
    console.log('   node competitor-analysis.js');
} else {
    console.log('⚠️  Configurazione incompleta. Completa il setup con:');
    console.log('   ./setup-competitor-analysis.sh');
}

// Test rapido Google Custom Search API
if (required.GOOGLE_CSE_API_KEY && required.GOOGLE_CSE_ID) {
    console.log('\n🧪 Test rapido Google Search API...');
    
    const testUrl = `https://www.googleapis.com/customsearch/v1?key=${required.GOOGLE_CSE_API_KEY}&cx=${required.GOOGLE_CSE_ID}&q=test&num=1`;
    
    fetch(testUrl)
        .then(response => {
            if (response.ok) {
                console.log('✅ Google Search API: Funzionante');
            } else {
                console.log(`❌ Google Search API: Errore ${response.status}`);
                if (response.status === 403) {
                    console.log('   💡 Verifica che Custom Search JSON API sia abilitata');
                }
            }
        })
        .catch(error => {
            console.log('❌ Google Search API: Errore connessione');
        });
}
EOF

# Esegui test
node test-competitor-config.js

# Cleanup
rm test-competitor-config.js

echo ""
print_step "6" "Installazione dipendenze..."

# Verifica se node_modules esiste
if [ ! -d "node_modules" ]; then
    print_info "Installando dipendenze npm..."
    npm install
    print_success "Dipendenze installate"
else
    print_success "Dipendenze già installate"
fi

echo ""
print_step "7" "Creazione directory reports..."

mkdir -p competitor-reports
print_success "Directory competitor-reports creata"

echo ""
print_step "8" "Setup completato!"

echo ""
echo -e "${GREEN}🎉 SETUP COMPLETATO${NC}"
echo "==================="
echo ""
echo -e "${BLUE}📋 PROSSIMI PASSI:${NC}"
echo "1. Verifica che tutte le API Key siano corrette"
echo "2. Assicurati che il Google Sheet 'calculators' sia accessibile"
echo "3. Lancia l'analisi competitiva:"
echo "   ${YELLOW}node competitor-analysis.js${NC}"
echo ""
echo -e "${PURPLE}💡 COMANDI UTILI:${NC}"
echo "   ${YELLOW}node competitor-analysis.js${NC}     # Analisi completa"
echo "   ${YELLOW}./setup-competitor-analysis.sh${NC}  # Rilancia setup"
echo ""
echo -e "${BLUE}📊 OUTPUT ATTESO:${NC}"
echo "   • Report per ogni calcolatore: competitor-reports/[lingua]/[categoria]/[slug]-analysis.md"
echo "   • Summary report: competitor-reports/summary-[timestamp].md"
echo "   • Log dettagliato: competitor_analysis_[data].log"
echo ""
echo -e "${YELLOW}⚠️  RATE LIMITS:${NC}"
echo "   • Google Search API: 100 ricerche/giorno (gratis)"
echo "   • Gemini API: 1500 requests/giorno (gratis)"
echo "   • Per volumi maggiori considera upgrade a piano paid"
echo ""

# Verifica finale
echo -e "${GREEN}✅ Setup completato con successo!${NC}"
