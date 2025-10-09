#!/bin/bash

case "$1" in
  "single")
    if [ -z "$2" ]; then
      echo "Usage: ./scripts/review.sh single <calculator-name>"
      exit 1
    fi
    node review-engine.js review "$2"
    ;;
  "all")
    node review-engine.js review-all
    ;;
  "reports")
    echo "📊 Aprendo cartella reports..."
    if [ -d "audit-reports" ]; then
      ls -la audit-reports/
    else
      echo "Nessun report trovato. Esegui prima un audit."
    fi
    ;;
  *)
    echo "Usage:"
    echo "  ./scripts/review.sh single <calculator-name>  # Review singolo calcolatore"
    echo "  ./scripts/review.sh all                       # Review tutti i calcolatori"
    echo "  ./scripts/review.sh reports                   # Mostra reports esistenti"
    ;;
esac
