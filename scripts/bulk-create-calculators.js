#!/usr/bin/env node

/**
 * Bulk create calculators from Excel file
 * Creates calculator component stubs, registry entries, and content templates
 *
 * Expected CSV columns:
 * - Language
 * - Category
 * - Slug
 * - Title
 * - Description
 * - Main Keyword
 * - Component Name
 * - Competitor URL 1-10
 * - Authority Source 1-2
 * - Subcategories (optional)
 *
 * Usage: node scripts/bulk-create-calculators.js <csv-file> [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const CSV_FILE = process.argv[2] || 'new-calculators.csv';
const DRY_RUN = process.argv.includes('--dry-run');

if (!CSV_FILE) {
  console.error('❌ Usage: node scripts/bulk-create-calculators.js <csv-file> [--dry-run]');
  process.exit(1);
}

const csvPath = path.join(process.cwd(), CSV_FILE);
if (!fs.existsSync(csvPath)) {
  console.error(`❌ File not found: ${csvPath}`);
  process.exit(1);
}

const csvContent = fs.readFileSync(csvPath, 'utf-8');
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  trim: true
});

console.log(`\n📄 Loaded ${records.length} calculators from ${CSV_FILE}\n`);

// ==============================================================================
// 1. CALCULATOR COMPONENT TEMPLATE
// ==============================================================================

function generateCalculatorComponent(record) {
  const { 'Component Name': componentName, Title, Description, Language } = record;

  return `'use client';

import { useState } from 'react';

/**
 * ${Title}
 * ${Description}
 */
export default function ${componentName}() {
  const [inputs, setInputs] = useState({
    value1: '',
    value2: '',
  });

  const [results, setResults] = useState(null);

  const handleCalculate = () => {
    // TODO: Implement calculation logic
    const result = {
      total: 0,
      breakdown: {},
    };

    setResults(result);
  };

  const handleReset = () => {
    setInputs({ value1: '', value2: '' });
    setResults(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
          ${Title}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
          ${Description}
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
          ${Language === 'it' ? 'Inserisci i dati' : Language === 'es' ? 'Introduce los datos' : Language === 'fr' ? 'Entrez les données' : 'Enter Data'}
        </h2>

        <div className="space-y-4">
          {/* Input Field 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ${Language === 'it' ? 'Valore 1' : Language === 'es' ? 'Valor 1' : Language === 'fr' ? 'Valeur 1' : 'Value 1'}
            </label>
            <input
              type="number"
              value={inputs.value1}
              onChange={(e) => setInputs({ ...inputs, value1: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>

          {/* Input Field 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ${Language === 'it' ? 'Valore 2' : Language === 'es' ? 'Valor 2' : Language === 'fr' ? 'Valeur 2' : 'Value 2'}
            </label>
            <input
              type="number"
              value={inputs.value2}
              onChange={(e) => setInputs({ ...inputs, value2: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>

          {/* TODO: Add more input fields as needed */}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={handleCalculate}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
          >
            ${Language === 'it' ? 'Calcola' : Language === 'es' ? 'Calcular' : Language === 'fr' ? 'Calculer' : 'Calculate'}
          </button>
          <button
            onClick={handleReset}
            className="flex-1 sm:flex-initial bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-all"
          >
            ${Language === 'it' ? 'Reset' : Language === 'es' ? 'Resetear' : Language === 'fr' ? 'Réinitialiser' : 'Reset'}
          </button>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 sm:p-8 rounded-xl shadow-lg">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
            ${Language === 'it' ? 'Risultati' : Language === 'es' ? 'Resultados' : Language === 'fr' ? 'Résultats' : 'Results'}
          </h2>

          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <div className="text-sm text-gray-600">
                ${Language === 'it' ? 'Totale' : Language === 'es' ? 'Total' : Language === 'fr' ? 'Total' : 'Total'}
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {results.total.toFixed(2)} €
              </div>
            </div>

            {/* TODO: Add more result fields */}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              ${Language === 'it'
                ? 'I risultati sono indicativi. Per situazioni complesse consulta un professionista.'
                : Language === 'es'
                ? 'Los resultados son indicativos. Para situaciones complejas consulta a un profesional.'
                : Language === 'fr'
                ? 'Les résultats sont indicatifs. Pour des situations complexes, consultez un professionnel.'
                : 'Results are indicative. For complex situations consult a professional.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
`;
}

// ==============================================================================
// 2. REGISTRY ENTRY TEMPLATE
// ==============================================================================

function generateRegistryEntry(record) {
  const keywords = [record['Main Keyword']];
  if (record.Subcategories) {
    keywords.push(...record.Subcategories.split(',').map(k => k.trim()));
  }

  return `  {
    slug: '${record.Slug}',
    component: '${record['Component Name']}',
    category: '${record.Category}',
    lang: '${record.Language.toLowerCase()}',
    title: '${record.Title}',
    description: '${record.Description}',
    keywords: ${JSON.stringify(keywords)},
    hasContent: false, // Set to true once content is created
  },`;
}

// ==============================================================================
// 3. CONTENT TEMPLATE (from previous script)
// ==============================================================================

function generateContentTemplate(record) {
  const {
    Language,
    Category,
    Slug,
    Title,
    Description,
    'Main Keyword': mainKeyword,
    'Competitor URL 1': comp1,
    'Competitor URL 2': comp2,
    'Competitor URL 3': comp3,
    'Authority Source 1': auth1,
    'Authority Source 2': auth2
  } = record;

  const competitorUrls = [comp1, comp2, comp3].filter(url => url && url.trim());
  const authoritySources = [auth1, auth2].filter(url => url && url.trim());

  const sections = {
    it: { whatIs: 'Cos\'è', howWorks: 'Come Funziona', whyUse: 'Perché Usare', howToUse: 'Come Utilizzarlo', faq: 'FAQ', sources: 'Fonti' },
    en: { whatIs: 'What is it', howWorks: 'How It Works', whyUse: 'Why Use', howToUse: 'How to Use', faq: 'FAQ', sources: 'Sources' },
    es: { whatIs: 'Qué es', howWorks: 'Cómo Funciona', whyUse: 'Por Qué Usar', howToUse: 'Cómo Utilizar', faq: 'FAQ', sources: 'Fuentes' },
    fr: { whatIs: 'Qu\'est-ce que', howWorks: 'Comment ça Marche', whyUse: 'Pourquoi Utiliser', howToUse: 'Comment Utiliser', faq: 'FAQ', sources: 'Sources' }
  };

  const lang = Language.toLowerCase();
  const sec = sections[lang] || sections.en;

  return `---
title: "${Title}"
description: "${Description}"
keywords: ["${mainKeyword}"]
lang: "${lang}"
category: "${Category}"
slug: "${Slug}"
---

# ${Title}

${Description}

## ${sec.whatIs}

<!-- TODO: Comprehensive explanation. Research: ${competitorUrls.slice(0, 2).join(', ') || 'N/A'} -->

## ${sec.howWorks}

<!-- TODO: Methodology and formulas. Reference: ${authoritySources[0] || 'authority source'} -->

## ${sec.whyUse}

<!-- TODO: Unique benefits vs competitors: ${competitorUrls.join(', ') || 'competitors'} -->

## ${sec.howToUse}

<!-- TODO: Step-by-step guide -->

## ${sec.faq}

### Question 1?
Answer 1

### Question 2?
Answer 2

## ${sec.sources}

${authoritySources.length > 0 ? authoritySources.map((s, i) => `${i + 1}. [Source](${s})`).join('\n') : '1. [Authority source]\n2. [Authority source]'}
`;
}

// ==============================================================================
// MAIN EXECUTION
// ==============================================================================

const summary = {
  components: { created: 0, skipped: 0, errors: 0 },
  registry: { entries: [] },
  content: { created: 0, skipped: 0, errors: 0 }
};

console.log('🚀 Processing calculators...\n');

records.forEach((record, index) => {
  const lang = record.Language.toLowerCase();
  const category = record.Category;
  const slug = record.Slug;
  const componentName = record['Component Name'];

  console.log(`\n[${index + 1}/${records.length}] Processing: ${lang}/${category}/${slug}`);

  // ============================================================================
  // 1. CREATE CALCULATOR COMPONENT
  // ============================================================================

  const componentPath = path.join(process.cwd(), 'components', 'calculators', `${componentName}.tsx`);

  if (fs.existsSync(componentPath)) {
    console.log(`  ⏭️  Component exists: ${componentName}.tsx`);
    summary.components.skipped++;
  } else {
    try {
      const componentCode = generateCalculatorComponent(record);

      if (!DRY_RUN) {
        fs.writeFileSync(componentPath, componentCode, 'utf-8');
        console.log(`  ✅ Component created: ${componentName}.tsx`);
      } else {
        console.log(`  🔍 DRY RUN: Would create ${componentName}.tsx`);
      }

      summary.components.created++;
    } catch (error) {
      console.error(`  ❌ Component error:`, error.message);
      summary.components.errors++;
    }
  }

  // ============================================================================
  // 2. GENERATE REGISTRY ENTRY
  // ============================================================================

  const registryEntry = generateRegistryEntry(record);
  summary.registry.entries.push(registryEntry);
  console.log(`  ✅ Registry entry prepared`);

  // ============================================================================
  // 3. CREATE CONTENT FILE
  // ============================================================================

  const contentDir = path.join(process.cwd(), 'content', lang, category);
  const contentPath = path.join(contentDir, `${slug}.md`);

  if (fs.existsSync(contentPath)) {
    console.log(`  ⏭️  Content exists: ${lang}/${category}/${slug}.md`);
    summary.content.skipped++;
  } else {
    try {
      const content = generateContentTemplate(record);

      if (!DRY_RUN) {
        if (!fs.existsSync(contentDir)) {
          fs.mkdirSync(contentDir, { recursive: true });
        }
        fs.writeFileSync(contentPath, content, 'utf-8');
        console.log(`  ✅ Content created: ${lang}/${category}/${slug}.md`);
      } else {
        console.log(`  🔍 DRY RUN: Would create ${lang}/${category}/${slug}.md`);
      }

      summary.content.created++;
    } catch (error) {
      console.error(`  ❌ Content error:`, error.message);
      summary.content.errors++;
    }
  }
});

// ==============================================================================
// SAVE REGISTRY ENTRIES TO FILE
// ==============================================================================

const registryOutputPath = path.join(process.cwd(), 'NEW-REGISTRY-ENTRIES.txt');
const registryOutput = `
// ============================================================================
// NEW CALCULATOR REGISTRY ENTRIES
// Add these to lib/calculator-registry.ts
// ============================================================================

${summary.registry.entries.join('\n\n')}

// ============================================================================
// Total entries: ${summary.registry.entries.length}
// ============================================================================
`;

if (!DRY_RUN) {
  fs.writeFileSync(registryOutputPath, registryOutput, 'utf-8');
  console.log(`\n✅ Registry entries saved to: NEW-REGISTRY-ENTRIES.txt`);
}

// ==============================================================================
// SUMMARY
// ==============================================================================

console.log('\n' + '='.repeat(70));
console.log('📊 BULK CREATION SUMMARY\n');
console.log(`Total records processed: ${records.length}\n`);

console.log('📦 Components:');
console.log(`  Created: ${summary.components.created}`);
console.log(`  Skipped: ${summary.components.skipped}`);
console.log(`  Errors: ${summary.components.errors}\n`);

console.log('📝 Registry Entries:');
console.log(`  Generated: ${summary.registry.entries.length}`);
console.log(`  File: NEW-REGISTRY-ENTRIES.txt\n`);

console.log('📄 Content Files:');
console.log(`  Created: ${summary.content.created}`);
console.log(`  Skipped: ${summary.content.skipped}`);
console.log(`  Errors: ${summary.content.errors}\n`);

if (DRY_RUN) {
  console.log('⚠️  DRY RUN MODE - No files were created');
  console.log('   Remove --dry-run to create files\n');
}

console.log('📝 Next Steps:');
console.log('   1. Review generated components in components/calculators/');
console.log('   2. Copy entries from NEW-REGISTRY-ENTRIES.txt to lib/calculator-registry.ts');
console.log('   3. Review and fill content templates in content/');
console.log('   4. Implement calculator logic in each component');
console.log('   5. Test calculators locally');
console.log('   6. Build and deploy\n');
console.log('='.repeat(70) + '\n');
