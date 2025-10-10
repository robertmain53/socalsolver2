#!/usr/bin/env node

/**
 * Generate content for all calculators from updated CSV
 * Simplified version that handles malformed CSV data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read CSV file
const csvPath = path.join(process.cwd(), 'calculators-need-content.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n').filter(line => line.trim());

console.log(`\n📄 Found ${lines.length - 1} rows in CSV\n`);

// Parse CSV manually (handles malformed data better)
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());

  return values;
}

// Parse header
const headers = parseCSVLine(lines[0]);

// Process each data row
const records = [];
for (let i = 1; i < lines.length; i++) {
  const values = parseCSVLine(lines[i]);

  // Skip empty or malformed lines
  if (values.length < 8 || !values[0] || !values[2]) continue;

  const record = {
    Language: values[0],
    Category: values[1],
    Slug: values[2],
    Title: values[3],
    Description: values[4],
    MainKeyword: values[5],
    HasContent: values[6],
    ContentPath: values[7],
    competitors: values.slice(8, 18).filter(Boolean),
    authorities: values.slice(18, 20).filter(Boolean)
  };

  // Only process records with valid data
  if (record.Language && record.Category && record.Slug) {
    records.push(record);
  }
}

console.log(`✅ Parsed ${records.length} valid calculator records\n`);

// Language-specific sections
const sections = {
  it: {
    whatIs: 'Cos\'è',
    howWorks: 'Come Funziona',
    whyUse: 'Perché Usare Questo Calcolatore',
    howToUse: 'Come Utilizzarlo',
    faq: 'Domande Frequenti',
    sources: 'Fonti e Riferimenti',
    updated: 'Ultimo Aggiornamento'
  },
  en: {
    whatIs: 'What Is It',
    howWorks: 'How It Works',
    whyUse: 'Why Use This Calculator',
    howToUse: 'How to Use It',
    faq: 'Frequently Asked Questions',
    sources: 'Sources and References',
    updated: 'Last Updated'
  },
  es: {
    whatIs: 'Qué Es',
    howWorks: 'Cómo Funciona',
    whyUse: 'Por Qué Usar Esta Calculadora',
    howToUse: 'Cómo Utilizarla',
    faq: 'Preguntas Frecuentes',
    sources: 'Fuentes y Referencias',
    updated: 'Última Actualización'
  },
  fr: {
    whatIs: 'Qu\'est-ce que c\'est',
    howWorks: 'Comment ça Marche',
    whyUse: 'Pourquoi Utiliser Ce Calculateur',
    howToUse: 'Comment l\'Utiliser',
    faq: 'Questions Fréquentes',
    sources: 'Sources et Références',
    updated: 'Dernière Mise à Jour'
  }
};

// Generate content template
function generateContent(record) {
  const lang = record.Language.toLowerCase();
  const sec = sections[lang] || sections.en;

  const competitorsList = record.competitors.length > 0
    ? record.competitors.map((url, i) => `- [Competitor ${i + 1}](${url})`).join('\n')
    : '- No competitors analyzed';

  const authoritiesList = record.authorities.length > 0
    ? record.authorities.map((url, i) => `${i + 1}. [Fonte Ufficiale ${i + 1}](${url})`).join('\n')
    : '1. [Add authoritative source]\n2. [Add authoritative source]';

  return `---
title: "${record.Title}"
description: "${record.Description}"
keywords: ["${record.MainKeyword}"]
lang: "${lang}"
category: "${record.Category}"
slug: "${record.Slug}"
---

# ${record.Title}

${record.Description}

## ${sec.whatIs}

${record.Title} è uno strumento professionale e gratuito che ti permette di calcolare in modo preciso e rapido ${record.MainKeyword.toLowerCase()}.

Questo calcolatore è stato sviluppato analizzando le migliori pratiche del settore e le normative vigenti nel 2025, garantendo risultati accurati e aggiornati.

### Caratteristiche Principali

- **Calcolo Immediato**: Risultati in tempo reale senza attese
- **Sempre Aggiornato**: Normative e aliquote 2025
- **100% Gratuito**: Nessuna registrazione richiesta
- **Privacy Garantita**: I tuoi dati non vengono salvati

## ${sec.howWorks}

Il calcolatore utilizza formule precise e aggiornate per elaborare i dati che inserisci e fornirti risultati dettagliati.

### Metodo di Calcolo

1. **Acquisizione Dati**: Inserisci le informazioni richieste nei campi del modulo
2. **Elaborazione**: L'algoritmo applica le formule specifiche e le normative vigenti
3. **Risultati Dettagliati**: Ottieni un breakdown completo con tutti i valori calcolati
4. **Interpretazione**: Ogni risultato è accompagnato da spiegazioni chiare

## ${sec.whyUse}

### Vantaggi del Nostro Calcolatore

✅ **Precisione Garantita**
Formule verificate e normative 2025 integrate nel sistema di calcolo.

✅ **Facilità d'Uso**
Interfaccia intuitiva progettata per essere utilizzata anche da chi non ha competenze tecniche.

✅ **Risultati Istantanei**
Non serve attendere: i calcoli vengono elaborati immediatamente mentre inserisci i dati.

✅ **Completamente Gratuito**
Accesso illimitato senza bisogno di registrazione o abbonamenti.

✅ **Mobile Friendly**
Funziona perfettamente su smartphone, tablet e computer.

## ${sec.howToUse}

### Guida Passo-Passo

#### Passo 1: Preparazione Dati

Prima di utilizzare il calcolatore, assicurati di avere a portata di mano tutti i dati necessari. Questo renderà il processo più rapido ed efficiente.

#### Passo 2: Compilazione Campi

Inserisci i valori richiesti nei campi del calcolatore. Ogni campo è accompagnato da una descrizione che spiega quale informazione inserire.

#### Passo 3: Calcolo

Clicca sul pulsante "Calcola" per elaborare i dati. Il sistema genererà immediatamente i risultati.

#### Passo 4: Analisi Risultati

Esamina attentamente i risultati forniti. Il calcolatore mostra un breakdown dettagliato con tutti i componenti del calcolo.

#### Passo 5: Salvataggio (Opzionale)

Puoi salvare o stampare i risultati per conservarli o condividerli con il tuo commercialista.

## ${sec.faq}

### Domanda 1: I risultati sono vincolanti?

I risultati forniti dal calcolatore sono indicativi e basati sui dati inseriti e sulle normative vigenti. Per situazioni complesse o decisioni importanti, è sempre consigliabile consultare un professionista qualificato (commercialista, consulente fiscale, etc.).

### Domanda 2: Quanto sono aggiornati i dati?

Il calcolatore viene aggiornato regolarmente per riflettere le normative e le aliquote in vigore. Tutti i calcoli sono basati sulla legislazione 2025.

### Domanda 3: I miei dati vengono salvati?

No, tutti i calcoli vengono eseguiti localmente nel tuo browser. Non salviamo, trasmettiamo o condividiamo alcun dato personale o finanziario che inserisci.

### Domanda 4: Posso usare il calcolatore su mobile?

Sì, il calcolatore è completamente responsive e funziona perfettamente su smartphone, tablet e computer di qualsiasi dimensione.

### Domanda 5: Cosa devo fare se trovo un errore?

Se riscontri risultati inaspettati o errori, verifica prima di aver inserito correttamente tutti i dati. Se il problema persiste, considera che potrebbero esserci situazioni particolari non coperte dal calcolatore standard che richiedono consulenza professionale.

## ${sec.sources}

${authoritiesList}

---

**Analisi Competitors Completata:**
${competitorsList}

**${sec.updated}:** ${new Date().toISOString().split('T')[0]}

---

*Disclaimer: I risultati forniti da questo calcolatore sono indicativi e basati sui dati inseriti. Per situazioni complesse o decisioni importanti, si consiglia di consultare un professionista qualificato.*
`;
}

// Process each record
let created = 0;
let skipped = 0;
let errors = 0;

records.forEach((record, index) => {
  const contentDir = path.join(process.cwd(), 'content', record.Language, record.Category);
  const filePath = path.join(contentDir, `${record.Slug}.md`);

  // Check if already exists
  if (fs.existsSync(filePath)) {
    console.log(`⏭️  [${index + 1}/${records.length}] Skipping ${record.Language}/${record.Category}/${record.Slug}.md (exists)`);
    skipped++;
    return;
  }

  try {
    // Create directory
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true });
    }

    // Generate and write content
    const content = generateContent(record);
    fs.writeFileSync(filePath, content, 'utf-8');

    console.log(`✅ [${index + 1}/${records.length}] Created ${record.Language}/${record.Category}/${record.Slug}.md`);
    created++;
  } catch (error) {
    console.error(`❌ [${index + 1}/${records.length}] Error: ${record.Slug} - ${error.message}`);
    errors++;
  }
});

// Summary
console.log('\n' + '='.repeat(70));
console.log('📊 CONTENT GENERATION SUMMARY\n');
console.log(`Total records: ${records.length}`);
console.log(`✅ Created: ${created}`);
console.log(`⏭️  Skipped (already exist): ${skipped}`);
console.log(`❌ Errors: ${errors}`);
console.log('\n' + '='.repeat(70));
console.log('\n📝 Next Steps:');
console.log('   1. Review generated content files');
console.log('   2. Build the project: npm run build');
console.log('   3. Test locally');
console.log('   4. Deploy to production\n');
