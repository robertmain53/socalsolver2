#!/usr/bin/env bash
# bootstrap-calculators.sh
# Pipeline end-to-end: importa SPEC (opz.), valida, genera TSX, applica fix, ESLint (opz.), build, estrae e riassume errori.

set -euo pipefail

# ---------- Utilità ----------
log() { printf "%s\n" "$*"; }
section() { printf "\n%s\n" "$*"; }
fail() { printf "❌ %s\n" "$*" >&2; exit 1; }
exists() { command -v "$1" >/dev/null 2>&1; }

# ---------- Carica .env ----------
if [[ -f .env ]]; then
  section "📥 Carico variabili da .env"
  # shellcheck disable=SC1091
  set -a; source .env; set +a
fi

# ---------- Parametri ----------
SPECS_DIR="${SPECS_DIR:-specs}"
OUT_DIR="${OUT_DIR:-components/calculators}"
CONCURRENCY="${CONCURRENCY:-4}"
RETRIES="${RETRIES:-1}"
ESLINT_FIX="${ESLINT_FIX:-1}"
RUN_SHEET_IMPORT="${RUN_SHEET_IMPORT:-1}"  # 1 = prova a importare da Google Sheet, 0 = salta

# Argomenti CLI (es. --concurrency=8 --retries=2 --no-eslint --no-sheet)
for arg in "$@"; do
  case "$arg" in
    --specs=*)        SPECS_DIR="${arg#*=}";;
    --out=*)          OUT_DIR="${arg#*=}";;
    --concurrency=*)  CONCURRENCY="${arg#*=}";;
    --retries=*)      RETRIES="${arg#*=}";;
    --no-eslint)      ESLINT_FIX="0";;
    --no-sheet)       RUN_SHEET_IMPORT="0";;
    *) ;;
  esac
done

section "▶️  Bootstrap pipeline
   specs:       ${SPECS_DIR}
   out:         ${OUT_DIR}
   concurrency: ${CONCURRENCY}  retries: ${RETRIES}
   eslint fix:  $([[ "$ESLINT_FIX" == "1" ]] && echo "ON" || echo "OFF")"

# ---------- Pre-check ----------
exists node || fail "Node.js è richiesto"
exists npm  || fail "npm è richiesto"

# ---------- Dipendenze minime ----------
section "📦 Installo dipendenze minime…"
npm pkg get type >/dev/null 2>&1 || npm pkg set type=module >/dev/null
# Zod, expr-eval e prettier sono usati dagli script *.mjs
npm i -D zod expr-eval prettier >/dev/null 2>&1 || true

# ---------- Import SPEC dal Google Sheet (opzionale) ----------
if [[ "$RUN_SHEET_IMPORT" == "1" ]]; then
  if [[ -n "${SHEET_ID:-}" && -n "${SHEET_NAME:-}" ]]; then
    if [[ -f sheet2specs.mjs ]]; then
      section "🔄 Importo SPEC da Google Sheet (SHEET_ID=${SHEET_ID} SHEET_NAME=${SHEET_NAME})…"
      node sheet2specs.mjs --out "${SPECS_DIR}" --sheet "${SHEET_NAME}" --sheetId "${SHEET_ID}" || fail "Import SPEC fallito"
    else
      log "ℹ️  sheet2specs.mjs non trovato: salto import da Sheet."
    fi
  else
    log "ℹ️  Variabili SHEET_ID/SHEET_NAME mancanti: salto import da Sheet."
  fi
fi

# ---------- Codegen .tsx ----------
section "🧱 Codegen TSX da SPEC…"
[[ -f codegen.mjs ]] || fail "codegen.mjs non trovato"
node codegen.mjs --specs "${SPECS_DIR}" --out "${OUT_DIR}" --concurrency "${CONCURRENCY}" --retries "${RETRIES}" || fail "Codegen fallito"

# ---------- Fix TSX pre-salvataggio/avviso ----------
if [[ -f fix-tsx.mjs ]]; then
  section "🛠  fix-tsx.mjs: eseguo sui file generati…"
  # Se codegen ha creato un manifest, usiamolo; altrimenti passiamo la cartella
  MANIFEST_PATH=".gen_tmp/manifest.txt"
  if [[ -f "$MANIFEST_PATH" ]]; then
    node fix-tsx.mjs --path "${OUT_DIR}" --manifest "${MANIFEST_PATH}" || true
  else
    node fix-tsx.mjs --path "${OUT_DIR}" || true
  fi
else
  log "ℹ️  fix-tsx.mjs non trovato: salto pass di fixing."
fi

# ---------- ESLint (opzionale) ----------
if [[ "$ESLINT_FIX" == "1" ]]; then
  if npx --yes eslint -v >/dev/null 2>&1; then
    section "🧹 ESLint --fix sui file generati…"
    # Continuiamo anche se ESLint fallisce: il build e il triage ci daranno i dettagli
    npx --yes eslint "${OUT_DIR}" --ext .tsx --fix || true
  else
    log "ℹ️  ESLint non installato: salto --fix."
  fi
fi

# ---------- Build Next.js ----------
section "🏗  next build (log -> build-output.log)…"
# Puliamo log precedente
rm -f build-output.log build-health.json build-health.html build-health-summary.txt || true
if exists npx; then
  # Salviamo l’output
  npm run build | tee build-output.log || true
else
  log "⚠️  npx non disponibile, eseguo 'npm run build' senza tee"
  npm run build || true
fi

# ---------- Estrai errori in build-health.json/.html ----------
if [[ -f extract-build-health.mjs ]]; then
  section "🧾 Estraggo build health…"
  node extract-build-health.mjs build-output.log || true
else
  log "ℹ️  extract-build-health.mjs non trovato: salto estrazione."
fi

# ---------- Triage (riassunto) ----------
if [[ -f triage-build-health.mjs ]]; then
  section "🧪 Triage build health (riassunto sintetico)…"
  node triage-build-health.mjs build-health.json || true
else
  log "ℹ️  triage-build-health.mjs non trovato: salto triage."
fi

# ---------- Epilogo ----------
section "✅ Pipeline conclusa.
Output utili:
  • Log build:            build-output.log
  • Build health JSON:    build-health.json (se generato)
  • Build health HTML:    build-health.html (se generato)
  • Riassunto testuale:   build-health-summary.txt (se generato)

Suggerimenti:
  - Apri build-health-summary.txt per le 15 firme d'errore principali e i file più colpiti.
  - Itera su prompt e fix-tsx.mjs in base alle firme d'errore ricorrenti.
"
