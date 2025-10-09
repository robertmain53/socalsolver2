#!/bin/bash

# log-viewer.sh - Script per visualizzare e monitorare i log dell'automazione

echo "📊 SoCalSolver - Log Viewer"
echo "============================"

# Trova tutti i file di log
LOG_FILES=($(ls automation_log_*.log 2>/dev/null))

if [ ${#LOG_FILES[@]} -eq 0 ]; then
    echo "❌ Nessun file di log trovato"
    echo "💡 I log vengono creati quando lanci automation.js"
    exit 1
fi

echo "📁 File di log trovati:"
for i in "${!LOG_FILES[@]}"; do
    echo "  $((i+1)). ${LOG_FILES[$i]} ($(wc -l < "${LOG_FILES[$i]}") righe)"
done

echo ""
echo "🤔 Cosa vuoi fare?"
echo "1) Visualizza log più recente"
echo "2) Visualizza log specifico"
echo "3) Monitora log in tempo reale (tail -f)"
echo "4) Cerca errori nei log"
echo "5) Mostra statistiche log"
echo "6) Pulisci vecchi log"
read -p "Scegli opzione (1-6): " choice

case $choice in
    1)
        # Log più recente
        LATEST_LOG=$(ls -t automation_log_*.log 2>/dev/null | head -1)
        if [ -n "$LATEST_LOG" ]; then
            echo ""
            echo "📄 Visualizzazione log più recente: $LATEST_LOG"
            echo "----------------------------------------"
            cat "$LATEST_LOG" | while IFS= read -r line; do
                # Colora i diversi tipi di log
                if [[ $line == *"ERROR"* ]]; then
                    echo -e "\033[31m$line\033[0m"  # Rosso
                elif [[ $line == *"SUCCESS"* ]]; then
                    echo -e "\033[32m$line\033[0m"  # Verde
                elif [[ $line == *"WARNING"* ]]; then
                    echo -e "\033[33m$line\033[0m"  # Giallo
                elif [[ $line == *"PROGRESS"* ]]; then
                    echo -e "\033[36m$line\033[0m"  # Cyan
                else
                    echo "$line"
                fi
            done
        fi
        ;;
    2)
        # Log specifico
        echo ""
        echo "📋 Seleziona file di log:"
        for i in "${!LOG_FILES[@]}"; do
            echo "  $((i+1)). ${LOG_FILES[$i]}"
        done
        read -p "Inserisci numero: " file_num
        
        if [[ $file_num -ge 1 && $file_num -le ${#LOG_FILES[@]} ]]; then
            SELECTED_LOG="${LOG_FILES[$((file_num-1))]}"
            echo ""
            echo "📄 Visualizzazione: $SELECTED_LOG"
            echo "----------------------------------------"
            cat "$SELECTED_LOG"
        else
            echo "❌ Numero non valido"
        fi
        ;;
    3)
        # Monitoring in tempo reale
        LATEST_LOG=$(ls -t automation_log_*.log 2>/dev/null | head -1)
        if [ -n "$LATEST_LOG" ]; then
            echo ""
            echo "📡 Monitoraggio in tempo reale: $LATEST_LOG"
            echo "   (Premi Ctrl+C per interrompere)"
            echo "----------------------------------------"
            tail -f "$LATEST_LOG" | while IFS= read -r line; do
                timestamp=$(date '+%H:%M:%S')
                if [[ $line == *"ERROR"* ]]; then
                    echo -e "[$timestamp] \033[31m$line\033[0m"
                elif [[ $line == *"SUCCESS"* ]]; then
                    echo -e "[$timestamp] \033[32m$line\033[0m"
                elif [[ $line == *"WARNING"* ]]; then
                    echo -e "[$timestamp] \033[33m$line\033[0m"
                elif [[ $line == *"PROGRESS"* ]]; then
                    echo -e "[$timestamp] \033[36m$line\033[0m"
                else
                    echo "[$timestamp] $line"
                fi
            done
        else
            echo "❌ Nessun log da monitorare"
        fi
        ;;
    4)
        # Cerca errori
        echo ""
        echo "🔍 Ricerca errori nei log..."
        echo "=============================="
        
        ERROR_COUNT=0
        for log_file in "${LOG_FILES[@]}"; do
            ERRORS=$(grep -i "error\|failed\|exception" "$log_file" | head -10)
            if [ -n "$ERRORS" ]; then
                echo ""
                echo "📄 Errori in $log_file:"
                echo "$ERRORS" | while IFS= read -r line; do
                    echo -e "  \033[31m$line\033[0m"
                done
                ERROR_COUNT=$((ERROR_COUNT + $(echo "$ERRORS" | wc -l)))
            fi
        done
        
        if [ $ERROR_COUNT -eq 0 ]; then
            echo "✅ Nessun errore trovato nei log!"
        else
            echo ""
            echo "📊 Totale errori trovati: $ERROR_COUNT"
        fi
        ;;
    5)
        # Statistiche
        echo ""
        echo "📊 Statistiche Log"
        echo "=================="
        
        for log_file in "${LOG_FILES[@]}"; do
            echo ""
            echo "📄 File: $log_file"
            echo "   Righe totali: $(wc -l < "$log_file")"
            echo "   Successi: $(grep -c "SUCCESS" "$log_file" 2>/dev/null || echo 0)"
            echo "   Errori: $(grep -c "ERROR" "$log_file" 2>/dev/null || echo 0)"
            echo "   Warnings: $(grep -c "WARNING" "$log_file" 2>/dev/null || echo 0)"
            echo "   Dimensione: $(du -h "$log_file" | cut -f1)"
            
            # Timestamp primo e ultimo
            FIRST_LINE=$(head -1 "$log_file" | grep -o '\[[0-9:]*' | tr -d '[')
            LAST_LINE=$(tail -1 "$log_file" | grep -o '\[[0-9:]*' | tr -d '[')
            if [ -n "$FIRST_LINE" ] && [ -n "$LAST_LINE" ]; then
                echo "   Periodo: $FIRST_LINE - $LAST_LINE"
            fi
        done
        ;;
    6)
        # Pulizia log
        echo ""
        echo "🗑️  Pulizia Log"
        echo "==============="
        echo "File di log esistenti:"
        
        TOTAL_SIZE=0
        for log_file in "${LOG_FILES[@]}"; do
            SIZE=$(du -k "$log_file" | cut -f1)
            TOTAL_SIZE=$((TOTAL_SIZE + SIZE))
            echo "  - $log_file ($(du -h "$log_file" | cut -f1))"
        done
        
        echo ""
        echo "Spazio totale occupato: $(echo "scale=2; $TOTAL_SIZE/1024" | bc 2>/dev/null || echo "$TOTAL_SIZE KB")"
        echo ""
        echo "Opzioni pulizia:"
        echo "1) Elimina log più vecchi di 7 giorni"
        echo "2) Elimina tutti i log tranne l'ultimo"
        echo "3) Elimina log specifico"
        echo "4) Annulla"
        
        read -p "Scegli: " clean_choice
        
        case $clean_choice in
            1)
                echo "🗑️  Eliminazione log > 7 giorni..."
                find . -name "automation_log_*.log" -mtime +7 -delete
                echo "✅ Pulizia completata"
                ;;
            2)
                echo "🗑️  Mantengo solo il log più recente..."
                LATEST=$(ls -t automation_log_*.log | head -1)
                for log_file in "${LOG_FILES[@]}"; do
                    if [ "$log_file" != "$LATEST" ]; then
                        rm "$log_file"
                        echo "🗑️  Eliminato: $log_file"
                    fi
                done
                echo "✅ Pulizia completata, mantenuto: $LATEST"
                ;;
            3)
                echo "📋 Seleziona log da eliminare:"
                for i in "${!LOG_FILES[@]}"; do
                    echo "  $((i+1)). ${LOG_FILES[$i]}"
                done
                read -p "Inserisci numero: " del_num
                
                if [[ $del_num -ge 1 && $del_num -le ${#LOG_FILES[@]} ]]; then
                    DEL_LOG="${LOG_FILES[$((del_num-1))]}"
                    rm "$DEL_LOG"
                    echo "🗑️  Eliminato: $DEL_LOG"
                else
                    echo "❌ Numero non valido"
                fi
                ;;
            4)
                echo "❌ Operazione annullata"
                ;;
        esac
        ;;
    *)
        echo "❌ Opzione non valida"
        exit 1
        ;;
esac

echo ""
echo "💡 Script completato"
