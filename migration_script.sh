#!/bin/bash

# ==============================================================================
# SCRIPT DI MIGRAZIONE SOCALSOLVER v1 → v2
# Migra contenuti dal vecchio sistema al nuovo sistema enterprise
# ==============================================================================

echo "🚀 MIGRAZIONE SOCALSOLVER v1 → v2"
echo "=================================="

# Verifica che siamo nella directory corretta
if [ ! -f "package.json" ]; then
    echo "❌ Errore: Esegui questo script dalla directory del nuovo progetto v2"
    exit 1
fi

# Verifica presenza del vecchio progetto
OLD_PROJECT_PATH="../socalsolver-v1"
if [ ! -d "$OLD_PROJECT_PATH" ]; then
    echo "📂 Inserisci il path del vecchio progetto:"
    read -r OLD_PROJECT_PATH
    if [ ! -d "$OLD_PROJECT_PATH" ]; then
        echo "❌ Directory non trovata: $OLD_PROJECT_PATH"
        exit 1
    fi
fi

echo "📂 Vecchio progetto: $OLD_PROJECT_PATH"
echo "📂 Nuovo progetto: $(pwd)"
echo ""

# ========================================
# FASE 1: MIGRAZIONE FILE DI CONFIGURAZIONE
# ========================================
echo "🔧 FASE 1: Migrazione configurazioni..."

# .env file
if [ -f "$OLD_PROJECT_PATH/.env" ]; then
    echo "  ✅ Copia .env"
    cp "$OLD_PROJECT_PATH/.env" .env
else
    echo "  ⚠️  File .env non trovato nel vecchio progetto"
fi

# credentials.json
if [ -f "$OLD_PROJECT_PATH/credentials.json" ]; then
    echo "  ✅ Copia credentials.json"
    cp "$OLD_PROJECT_PATH/credentials.json" credentials.json
else
    echo "  ⚠️  File credentials.json non trovato"
fi

# automation_state.json
if [ -f "$OLD_PROJECT_PATH/automation_state.json" ]; then
    echo "  ✅ Copia automation_state.json"
    cp "$OLD_PROJECT_PATH/automation_state.json" automation_state.json
else
    echo "  📝 Creazione automation_state.json pulito"
    echo '{"lastProcessedIndex": -1}' > automation_state.json
fi

echo "✅ FASE 1 completata"
echo ""

# ========================================
# FASE 2: MIGRAZIONE CONTENUTI
# ========================================
echo "📄 FASE 2: Migrazione contenuti..."

# Conta i file da migrare
OLD_CONTENT_COUNT=$(find "$OLD_PROJECT_PATH/content" -name "*.md" 2>/dev/null | wc -l)
OLD_COMPONENTS_COUNT=$(find "$OLD_PROJECT_PATH/components/calculators" -name "*.tsx" 2>/dev/null | wc -l)

echo "  📊 Contenuti trovati:"
echo "    - File Markdown: $OLD_CONTENT_COUNT"
echo "    - Componenti: $OLD_COMPONENTS_COUNT"

# Migra contenuti markdown
if [ -d "$OLD_PROJECT_PATH/content" ]; then
    echo "  🔄 Migrazione contenuti markdown..."
    cp -r "$OLD_PROJECT_PATH/content"/* content/ 2>/dev/null || true
    echo "  ✅ Contenuti markdown migrati"
else
    echo "  ⚠️  Directory content non trovata nel vecchio progetto"
fi

# Migra componenti calcolatori (con backup)
if [ -d "$OLD_PROJECT_PATH/components/calculators" ]; then
    echo "  🔄 Migrazione componenti calcolatori..."
    
    # Crea backup dei componenti esistenti
    if [ -d "components/calculators" ] && [ "$(ls -A components/calculators)" ]; then
        echo "  💾 Backup componenti esistenti..."
        mv components/calculators components/calculators.backup.$(date +%Y%m%d_%H%M%S)
        mkdir -p components/calculators
    fi
    
    cp -r "$OLD_PROJECT_PATH/components/calculators"/* components/calculators/ 2>/dev/null || true
    echo "  ✅ Componenti calcolatori migrati"
else
    echo "  ⚠️  Directory components/calculators non trovata"
fi

echo "✅ FASE 2 completata"
echo ""

# ========================================
# FASE 3: AGGIORNAMENTO COMPONENTI
# ========================================
echo "🔧 FASE 3: Aggiornamento componenti per v2..."

# Script per aggiornare i componenti vecchi con le nuove funzionalità
# Questo è un esempio - potresti dover personalizzarlo
if [ -d "components/calculators" ]; then
    COMPONENTS_TO_UPDATE=$(find components/calculators -name "*.tsx" | wc -l)
    echo "  📊 Componenti da aggiornare: $COMPONENTS_TO_UPDATE"
    
    # Crea lista dei componenti che potrebbero aver bisogno di aggiornamento
    echo "  📝 Creazione lista componenti da rivedere..."
    find components/calculators -name "*.tsx" > components_to_review.txt
    
    echo "  ⚠️  NOTA: I componenti migrati potrebbero richiedere aggiornamenti manuali"
    echo "  📄 Vedi: components_to_review.txt per la lista completa"
fi

echo "✅ FASE 3 completata"
echo ""

# ========================================
# FASE 4: VALIDAZIONE E TEST
# ========================================
echo "🧪 FASE 4: Validazione migrazione..."

# Controlla che i file essenziali siano presenti
VALIDATION_PASSED=true

echo "  🔍 Controlli di validazione:"

# Verifica .env
if [ -f ".env" ]; then
    echo "    ✅ .env presente"
else
    echo "    ❌ .env mancante"
    VALIDATION_PASSED=false
fi

# Verifica credentials.json
if [ -f "credentials.json" ]; then
    echo "    ✅ credentials.json presente"
else
    echo "    ❌ credentials.json mancante"
    VALIDATION_PASSED=false
fi

# Verifica contenuti
MIGRATED_CONTENT=$(find content -name "*.md" 2>/dev/null | wc -l)
echo "    📊 Contenuti migrati: $MIGRATED_CONTENT file markdown"

# Verifica componenti
MIGRATED_COMPONENTS=$(find components/calculators -name "*.tsx" 2>/dev/null | wc -l)
echo "    📊 Componenti migrati: $MIGRATED_COMPONENTS file tsx"

if [ "$VALIDATION_PASSED" = true ]; then
    echo "  ✅ Validazione superata!"
else
    echo "  ❌ Validazione fallita - controlla i file mancanti"
fi

echo ""

# ========================================
# FASE 5: REPORT FINALE E RACCOMANDAZIONI
# ========================================
echo "📋 REPORT MIGRAZIONE"
echo "===================="
echo ""
echo "📊 STATISTICHE:"
echo "  - Contenuti markdown migrati: $MIGRATED_CONTENT"
echo "  - Componenti migrati: $MIGRATED_COMPONENTS"
echo "  - Configurazioni migrate: $([ -f .env ] && echo "✅" || echo "❌") .env | $([ -f credentials.json ] && echo "✅" || echo "❌") credentials"
echo ""

echo "🚀 PROSSIMI PASSI:"
echo "1. npm install                    # Installa le nuove dipendenze"
echo "2. npm run dev                    # Testa il nuovo sistema"
echo "3. Controlla components_to_review.txt per i componenti da aggiornare"
echo "4. node automation.js            # Testa la generazione"
echo "5. npm run build                 # Build di produzione"
echo ""

echo "⚠️  IMPORTANTE:"
echo "- I componenti migrati potrebbero richiedere aggiornamenti manuali"
echo "- Testa accuratamente ogni calcolatore prima del deploy"
echo "- Mantieni un backup del vecchio sistema fino a completa verifica"
echo ""

if [ "$VALIDATION_PASSED" = true ]; then
    echo "🎉 MIGRAZIONE COMPLETATA CON SUCCESSO!"
    echo ""
    echo "Vuoi installare le dipendenze ora? (y/n)"
    read -r INSTALL_DEPS
    if [ "$INSTALL_DEPS" = "y" ] || [ "$INSTALL_DEPS" = "Y" ]; then
        echo "📦 Installazione dipendenze..."
        npm install
        echo "✅ Dipendenze installate!"
        echo ""
        echo "🚀 Avvia il server di sviluppo con: npm run dev"
    fi
else
    echo "❌ MIGRAZIONE COMPLETATA CON ERRORI"
    echo "Controlla i file mancanti prima di procedere."
fi