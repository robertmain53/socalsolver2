#!/bin/bash

# run-competitor-analysis.sh - Script Master per Analisi Competitiva
echo "🚀 SoCalSolver Competitor Analysis - Script Master"
echo "=================================================="

# Colori
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}$1${NC}"
    echo "$(printf '=%.0s' {1..50})"
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

show_menu() {
    echo ""
    print_header "📋 MENU PRINCIPALE"
    echo "1. 🔧 Setup iniziale (configurazione API)"
    echo "2. 🧪 Test configurazione (verifica singolo calcolatore)"  
    echo "3. 🔍 Analisi competitiva completa"
    echo "4. 📊 Analisi limitata (primi N calcolatori)"
    echo "5. 📄 Visualizza reports esistenti"
    echo "6. 🗑️  Pulisci cache e reports"
    echo "7. ❓ Aiuto e documentazione"
    echo "8. 🚪 Esci"
    echo ""
    echo -n "Scegli un'opzione (1-8): "
}

setup_configuration() {
    print_header "🔧 SETUP CONFIGURAZIONE"
    
    if [ ! -f "setup-competitor-analysis.sh" ]; then
        print_error "File setup-competitor-analysis.sh non trovato"
        return 1
    fi
    
    chmod +x setup-competitor-analysis.sh
    ./setup-competitor-analysis.sh
}

test_configuration() {
    print_header "🧪 TEST CONFIGURAZIONE"
    
    if [ ! -f "test-single-calculator.js" ]; then
        print_error "File test-single-calculator.js non trovato"
        return 1
    fi
    
    node test-single-calculator.js
}

run_full_analysis() {
    print_header "🔍 ANALISI COMPETITIVA COMPLETA"
    
    if [ ! -f "competitor-analysis.js" ]; then
        print_error "File competitor-analysis.js non trovato"
        return 1
    fi
    
    echo "⚠️  ATTENZIONE: L'analisi completa può richiedere molte ore"
    echo "📊 Verranno analizzati tutti i calcolatori nel Google Sheet"
    echo "🔥 Consumo stimato: ~14 API calls per calcolatore"
    echo ""
    echo -n "Sei sicuro di voler procedere? (y/N): "
    read -r confirm
    
    if [[ $confirm =~ ^[Yy]$ ]]; then
        print_success "Avvio analisi completa..."
        node competitor-analysis.js
    else
        print_warning "Analisi annullata"
    fi
}

run_limited_analysis() {
    print_header "📊 ANALISI LIMITATA"
    
    if [ ! -f "competitor-analysis.js" ]; then
        print_error "File competitor-analysis.js non trovato"
        return 1
    fi
    
    echo -n "Quanti calcolatori vuoi analizzare? (es: 5): "
    read -r limit
    
    if [[ $limit =~ ^[0-9]+$ ]] && [ $limit -gt 0 ]; then
        print_success "Avvio analisi per i primi $limit calcolatori..."
        
        # Modifica temporaneamente lo script per limitare l'analisi
        # (Questo richiederebbe una modifica del competitor-analysis.js per accettare parametri)
        node competitor-analysis.js --limit=$limit 2>/dev/null || {
            print_warning "Parametro --limit non supportato, modifico lo script temporaneamente..."
            
            # Backup originale
            cp competitor-analysis.js competitor-analysis.js.backup
            
            # Modifica per limitare a N calcolatori
            sed "s/for (let index = startIndex; index < calculators.length; index++)/for (let index = startIndex; index < Math.min(startIndex + $limit, calculators.length); index++)/" competitor-analysis.js > competitor-analysis-limited.js
            
            node competitor-analysis-limited.js
            
            # Ripristina originale
            mv competitor-analysis.js.backup competitor-analysis.js
            rm competitor-analysis-limited.js
        }
    else
        print_error "Numero non valido"
    fi
}

view_reports() {
    print_header "📄 REPORTS ESISTENTI"
    
    if [ ! -d "competitor-reports" ]; then
        print_warning "Directory competitor-reports non trovata"
        return 1
    fi
    
    echo "📂 Directory reports: competitor-reports/"
    echo ""
    
    # Mostra summary reports
    echo "📋 Summary Reports:"
    find competitor-reports -name "summary-*.md" -type f 2>/dev/null | sort -r | head -5 | while read -r file; do
        local date=$(basename "$file" | sed 's/summary-//g' | sed 's/.md//g')
        local size=$(wc -l < "$file" 2>/dev/null || echo "0")
        echo "   📄 $(basename "$file") ($size righe)"
    done
    
    echo ""
    echo "📊 Reports per lingua:"
    for lang in it en es fr; do
        local count=$(find competitor-reports/$lang -name "*-analysis.md" -type f 2>/dev/null | wc -l)
        if [ $count -gt 0 ]; then
            echo "   🌍 $lang: $count reports"
        fi
    done
    
    echo ""
    echo "🔍 Ultimi 5 reports generati:"
    find competitor-reports -name "*-analysis.md" -type f -printf '%T@ %p\n' 2>/dev/null | sort -nr | head -5 | while read -r timestamp file; do
        local date=$(date -d "@$timestamp" '+%Y-%m-%d %H:%M' 2>/dev/null || echo "Unknown")
        echo "   📝 $(basename "$file") - $date"
    done
    
    echo ""
    echo -n "Vuoi aprire un report specifico? (y/N): "
    read -r open_report
    
    if [[ $open_report =~ ^[Yy]$ ]]; then
        echo -n "Inserisci il nome del file (senza path): "
        read -r filename
        
        local filepath=$(find competitor-reports -name "$filename" -type f 2>/dev/null | head -1)
        if [ -n "$filepath" ]; then
            echo "📖 Aprendo: $filepath"
            less "$filepath" || cat "$filepath"
        else
            print_error "File non trovato: $filename"
        fi
    fi
}

clean_cache() {
    print_header "🗑️  PULIZIA CACHE E REPORTS"
    
    echo "⚠️  ATTENZIONE: Questa operazione eliminerà:"
    echo "   • Tutti i reports in competitor-reports/"
    echo "   • File di stato competitor_analysis_state.json"
    echo "   • Log files competitor_analysis_*.log"
    echo ""
    echo -n "Sei sicuro di voler procedere? (y/N): "
    read -r confirm
    
    if [[ $confirm =~ ^[Yy]$ ]]; then
        print_success "Avvio pulizia..."
        
        # Rimuovi reports
        if [ -d "competitor-reports" ]; then
            rm -rf competitor-reports/*
            print_success "Reports eliminati"
        fi
        
        # Rimuovi stato
        if [ -f "competitor_analysis_state.json" ]; then
            rm competitor_analysis_state.json
            print_success "File di stato eliminato"
        fi
        
        # Rimuovi log files
        rm -f competitor_analysis_*.log
        print_success "Log files eliminati"
        
        print_success "Pulizia completata"
    else
        print_warning "Pulizia annullata"
    fi
}

show_help() {
    print_header "❓ AIUTO E DOCUMENTAZIONE"
    
    echo "🔍 ANALISI COMPETITIVA SOCALSOLVER"
    echo ""
    echo "📋 OVERVIEW:"
    echo "Questo sistema analizza i competitor per ogni calcolatore nel tuo Google Sheet,"
    echo "verifica l'allineamento dei contenuti e fornisce suggerimenti di miglioramento."
    echo ""
    echo "🔧 SETUP RICHIESTO:"
    echo "1. Google Sheets API (credentials.json)"
    echo "2. Google Custom Search API (GOOGLE_CSE_API_KEY + GOOGLE_CSE_ID)"
    echo "3. Gemini API (GEMINI_API_KEY)"
    echo ""
    echo "📊 PROCESSO ANALISI:"
    echo "1. Legge calcolatori dal Google Sheet"
    echo "2. Cerca primi 7 risultati su Google per ogni calcolatore"
    echo "3. Scrapa contenuto delle pagine competitor"
    echo "4. Usa AI per verificare allineamento contenuti"
    echo "5. Se allineato, fa analisi competitiva approfondita"
    echo "6. Genera report dettagliati in Markdown"
    echo ""
    echo "📄 OUTPUT:"
    echo "• competitor-reports/[lingua]/[categoria]/[slug]-analysis.md"
    echo "• competitor-reports/summary-[timestamp].md"
    echo "• competitor_analysis_[data].log"
    echo ""
    echo "⚠️  RATE LIMITS:"
    echo "• Google Search API: 100 ricerche/giorno (gratis)"
    echo "• Gemini API: 1500 requests/giorno (gratis)"
    echo ""
    echo "🚀 COMANDI DIRETTI:"
    echo "• node competitor-analysis.js        # Analisi completa"
    echo "• node test-single-calculator.js     # Test veloce"
    echo "• ./setup-competitor-analysis.sh     # Setup configurazione"
    echo ""
    echo "🐛 TROUBLESHOOTING:"
    echo "1. Verifica configurazione con test (opzione 2)"
    echo "2. Controlla log files per errori dettagliati"
    echo "3. Verifica quote API su Google Cloud Console"
    echo "4. Per rate limits, aspetta 24h o usa API key diverse"
}

# Loop principale
while true; do
    show_menu
    read -r choice
    
    case $choice in
        1)
            setup_configuration
            ;;
        2)
            test_configuration
            ;;
        3)
            run_full_analysis
            ;;
        4)
            run_limited_analysis
            ;;
        5)
            view_reports
            ;;
        6)
            clean_cache
            ;;
        7)
            show_help
            ;;
        8)
            print_success "Arrivederci!"
            exit 0
            ;;
        *)
            print_error "Opzione non valida. Scegli un numero da 1 a 8."
            ;;
    esac
    
    echo ""
    echo -n "Premi ENTER per continuare..."
    read -r
done
