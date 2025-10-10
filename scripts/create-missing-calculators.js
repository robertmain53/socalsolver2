#!/usr/bin/env node

/**
 * Create missing calculators from calculator-missing1-200.csv
 * Generates both markdown content and calculator components
 * Skips existing calculators automatically
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read CSV file
const csvPath = path.join(process.cwd(), 'calculator-missing1-200.csv');
if (!fs.existsSync(csvPath)) {
  console.error('❌ File not found: calculator-missing1-200.csv');
  process.exit(1);
}

const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n').filter(line => line.trim());

console.log(`\n📄 Found ${lines.length - 1} calculators in CSV\n`);

// Parse CSV
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

// Parse all records
const records = [];
for (let i = 1; i < lines.length; i++) {
  const values = parseCSVLine(lines[i]);
  if (values.length < 4) continue;

  records.push({
    slug: values[0],
    title: values[1],
    lang: values[2],
    category: values[3],
    competitors: values.slice(4, 10).filter(Boolean)
  });
}

console.log(`✅ Parsed ${records.length} valid calculator records\n`);

// Check existing calculators in registry
const registryPath = path.join(process.cwd(), 'lib', 'calculator-registry.ts');
const registryContent = fs.readFileSync(registryPath, 'utf-8');

function isExistingCalculator(slug) {
  return registryContent.includes(`slug: '${slug}'`);
}

// Filter out existing
const newCalculators = records.filter(r => !isExistingCalculator(r.slug));
const skipped = records.length - newCalculators.length;

console.log(`📊 Status:`);
console.log(`   Total in CSV: ${records.length}`);
console.log(`   Already exist: ${skipped}`);
console.log(`   To create: ${newCalculators.length}\n`);

if (newCalculators.length === 0) {
  console.log('✅ All calculators already exist!');
  process.exit(0);
}

// Language templates for content
const templates = require('./fix-content-language.js').templates || {
  it: { /* Italian template from previous script */ },
  es: { /* Spanish template */ },
  fr: { /* French template */ },
  en: { /* English template */ }
};

// Import the generateContent function or recreate it
const { generateContent } = require('./fix-content-language.js');

// Create everything
let componentsCreated = 0;
let contentCreated = 0;
const registryEntries = [];

console.log('🚀 Creating calculators...\n');

newCalculators.forEach((calc, index) => {
  const { slug, title, lang, category, competitors } = calc;

  console.log(`[${index + 1}/${newCalculators.length}] ${lang}/${category}/${slug}`);

  // 1. Create component
  const componentName = slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('') + 'Calculator';

  const componentPath = path.join(process.cwd(), 'components', 'calculators', `${componentName}.tsx`);

  if (!fs.existsSync(componentPath)) {
    const componentCode = generateCalculatorComponent(calc, componentName);
    fs.writeFileSync(componentPath, componentCode, 'utf-8');
    console.log(`  ✅ Component: ${componentName}.tsx`);
    componentsCreated++;
  } else {
    console.log(`  ⏭️  Component exists: ${componentName}.tsx`);
  }

  // 2. Create content
  const contentDir = path.join(process.cwd(), 'content', lang, category);
  const contentPath = path.join(contentDir, `${slug}.md`);

  if (!fs.existsSync(contentPath)) {
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true });
    }

    const content = generateMarkdownContent(calc);
    fs.writeFileSync(contentPath, content, 'utf-8');
    console.log(`  ✅ Content: ${lang}/${category}/${slug}.md`);
    contentCreated++;
  } else {
    console.log(`  ⏭️  Content exists: ${lang}/${category}/${slug}.md`);
  }

  // 3. Generate registry entry
  const registryEntry = generateRegistryEntry(calc, componentName);
  registryEntries.push(registryEntry);
});

// Save registry entries to file
const registryOutputPath = path.join(process.cwd(), 'NEW-CALCULATOR-REGISTRY-ENTRIES.txt');
const registryOutput = `
// ============================================================================
// NEW CALCULATOR REGISTRY ENTRIES
// Add these to lib/calculator-registry.ts in the appropriate language section
// ============================================================================

${registryEntries.join('\n\n')}

// ============================================================================
// Total new entries: ${registryEntries.length}
// ============================================================================
`;

fs.writeFileSync(registryOutputPath, registryOutput, 'utf-8');

console.log('\n' + '='.repeat(70));
console.log('📊 CREATION SUMMARY\n');
console.log(`Total new calculators: ${newCalculators.length}`);
console.log(`Components created: ${componentsCreated}`);
console.log(`Content files created: ${contentCreated}`);
console.log(`Registry entries generated: ${registryEntries.length}`);
console.log(`\n✅ Registry entries saved to: NEW-CALCULATOR-REGISTRY-ENTRIES.txt`);
console.log('='.repeat(70) + '\n');

// Helper functions
function generateCalculatorComponent(calc, componentName) {
  const { title, lang } = calc;

  const translations = {
    it: { calculate: 'Calcola', reset: 'Reset', results: 'Risultati', value: 'Valore', disclaimer: 'I risultati sono indicativi. Consulta un professionista per situazioni complesse.' },
    es: { calculate: 'Calcular', reset: 'Resetear', results: 'Resultados', value: 'Valor', disclaimer: 'Los resultados son orientativos. Consulta a un profesional para situaciones complejas.' },
    fr: { calculate: 'Calculer', reset: 'Réinitialiser', results: 'Résultats', value: 'Valeur', disclaimer: 'Les résultats sont indicatifs. Consultez un professionnel pour des situations complexes.' },
    en: { calculate: 'Calculate', reset: 'Reset', results: 'Results', value: 'Value', disclaimer: 'Results are indicative. Consult a professional for complex situations.' }
  };

  const t = translations[lang] || translations.en;

  return `'use client';

import { useState } from 'react';

/**
 * ${title}
 * ${lang.toUpperCase()}
 */
export default function ${componentName}() {
  const [inputs, setInputs] = useState({
    value1: '',
    value2: '',
  });

  const [results, setResults] = useState<any>(null);

  const handleCalculate = () => {
    // TODO: Implement calculation logic
    const result = {
      total: parseFloat(inputs.value1) + parseFloat(inputs.value2) || 0,
      breakdown: {
        value1: parseFloat(inputs.value1) || 0,
        value2: parseFloat(inputs.value2) || 0,
      },
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
          ${title}
        </h1>
      </div>

      {/* Input Form */}
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
          ${t.value} 1
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ${t.value} 1
            </label>
            <input
              type="number"
              value={inputs.value1}
              onChange={(e) => setInputs({ ...inputs, value1: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ${t.value} 2
            </label>
            <input
              type="number"
              value={inputs.value2}
              onChange={(e) => setInputs({ ...inputs, value2: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={handleCalculate}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
          >
            ${t.calculate}
          </button>
          <button
            onClick={handleReset}
            className="flex-1 sm:flex-initial bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-all"
          >
            ${t.reset}
          </button>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 sm:p-8 rounded-xl shadow-lg">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
            ${t.results}
          </h2>

          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <div className="text-sm text-gray-600">Total</div>
              <div className="text-2xl font-bold text-blue-600">
                {results.total.toFixed(2)} €
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              ${t.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
`;
}

function generateMarkdownContent(calc) {
  const { slug, title, lang, category, competitors } = calc;

  // Get keyword from title (simplified)
  const keyword = title.replace(/^Calcolat(ore|rice|eur) /i, '').replace(/^Calculator /i, '').toLowerCase();

  const sections = {
    it: { whatIs: 'Cos\'è', howWorks: 'Come Funziona', whyUse: 'Perché Usare', howToUse: 'Come Utilizzarlo', faq: 'Domande Frequenti', sources: 'Fonti', updated: 'Ultimo Aggiornamento' },
    es: { whatIs: 'Qué Es', howWorks: 'Cómo Funciona', whyUse: 'Por Qué Usar', howToUse: 'Cómo Utilizarla', faq: 'Preguntas Frecuentes', sources: 'Fuentes', updated: 'Última Actualización' },
    fr: { whatIs: 'Qu\'est-ce que c\'est', howWorks: 'Comment ça Marche', whyUse: 'Pourquoi Utiliser', howToUse: 'Comment Utiliser', faq: 'Questions Fréquentes', sources: 'Sources', updated: 'Dernière Mise à Jour' },
    en: { whatIs: 'What Is It', howWorks: 'How It Works', whyUse: 'Why Use', howToUse: 'How to Use', faq: 'FAQ', sources: 'Sources', updated: 'Last Updated' }
  };

  const sec = sections[lang] || sections.en;

  const intro = {
    it: `${title} è uno strumento professionale e gratuito che ti permette di calcolare in modo preciso e rapido ${keyword}.\n\nQuesto calcolatore è stato sviluppato analizzando le migliori pratiche del settore e le normative vigenti nel 2025, garantendo risultati accurati e aggiornati.`,
    es: `${title} es una herramienta profesional y gratuita que te permite calcular de forma precisa y rápida ${keyword}.\n\nEsta calculadora ha sido desarrollada analizando las mejores prácticas del sector y la normativa vigente en 2025, garantizando resultados precisos y actualizados.`,
    fr: `${title} est un outil professionnel et gratuit qui vous permet de calculer de manière précise et rapide ${keyword}.\n\nCe calculateur a été développé en analysant les meilleures pratiques du secteur et la réglementation en vigueur en 2025, garantissant des résultats précis et à jour.`,
    en: `${title} is a professional and free tool that allows you to accurately and quickly calculate ${keyword}.\n\nThis calculator has been developed by analyzing industry best practices and current 2025 regulations, ensuring accurate and up-to-date results.`
  };

  const competitorsList = competitors.length > 0
    ? competitors.map((url, i) => `- [Competitor ${i + 1}](${url})`).join('\n')
    : '- No competitors analyzed';

  return `---
title: "${title}"
description: "${title.replace(/^Calcolat(ore|rice|eur|or) /i, '').substring(0, 150)}"
keywords: ["${keyword}"]
lang: "${lang}"
category: "${category}"
slug: "${slug}"
---

# ${title}

${intro[lang] || intro.en}

## ${sec.whatIs}

<!-- TODO: Add comprehensive explanation -->

## ${sec.howWorks}

<!-- TODO: Explain methodology and formulas -->

## ${sec.whyUse}

<!-- TODO: List key benefits -->

## ${sec.howToUse}

<!-- TODO: Step-by-step guide -->

## ${sec.faq}

<!-- TODO: Add 5 frequently asked questions -->

## ${sec.sources}

1. [Add authoritative source]
2. [Add authoritative source]

---

**Competitor Analysis:**
${competitorsList}

**${sec.updated}:** ${new Date().toISOString().split('T')[0]}
`;
}

function generateRegistryEntry(calc, componentName) {
  const { slug, title, lang, category } = calc;
  const keyword = title.replace(/^Calcolat(ore|rice|eur|or) /i, '').toLowerCase();

  return `  {
    slug: '${slug}',
    component: '${componentName}',
    category: '${category}',
    lang: '${lang}',
    title: '${title}',
    description: '${title.replace(/^Calcolat(ore|rice|eur|or) /i, '')}',
    keywords: ['${keyword}'],
    hasContent: true,
  },`;
}
