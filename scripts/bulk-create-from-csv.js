#!/usr/bin/env node

/**
 * Bulk create missing calculators from calculator-missing1-200.csv
 * Creates components + content + registry entries
 * Automatically skips existing calculators
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🚀 Bulk Calculator Creation Script\n');
console.log('='.repeat(70) + '\n');

// Read CSV
const csvPath = path.join(process.cwd(), 'calculator-missing1-200.csv');
if (!fs.existsSync(csvPath)) {
  console.error('❌ File not found: calculator-missing1-200.csv');
  process.exit(1);
}

const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n').filter(line => line.trim());

console.log(`📄 CSV file loaded: ${lines.length - 1} calculators found\n`);

// Parse CSV manually
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

// Parse records
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

console.log(`✅ Parsed ${records.length} valid records\n`);

// Check existing calculators
const registryPath = path.join(process.cwd(), 'lib', 'calculator-registry.ts');
const registryContent = fs.readFileSync(registryPath, 'utf-8');

const existingSlugs = new Set();
const slugMatches = registryContent.matchAll(/slug:\s*'([^']+)'/g);
for (const match of slugMatches) {
  existingSlugs.add(match[1]);
}

const newCalculators = records.filter(r => !existingSlugs.has(r.slug));
const skipped = records.length - newCalculators.length;

console.log(`📊 Status:`);
console.log(`   Total in CSV: ${records.length}`);
console.log(`   Already exist: ${skipped}`);
console.log(`   To create: ${newCalculators.length}\n`);

if (newCalculators.length === 0) {
  console.log('✅ All calculators already exist!\n');
  process.exit(0);
}

// Statistics
const stats = {
  components: { created: 0, skipped: 0 },
  content: { created: 0, skipped: 0 },
  registry: []
};

console.log('🔨 Creating calculators...\n');

newCalculators.forEach((calc, index) => {
  const { slug, title, lang, category, competitors } = calc;

  console.log(`[${index + 1}/${newCalculators.length}] ${slug}`);

  // 1. CREATE COMPONENT
  const componentName = slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('') + 'Calculator';

  const componentPath = path.join(process.cwd(), 'components', 'calculators', `${componentName}.tsx`);

  if (!fs.existsSync(componentPath)) {
    const component = generateComponent(calc, componentName);
    fs.writeFileSync(componentPath, component, 'utf-8');
    console.log(`  ✅ Component: ${componentName}.tsx`);
    stats.components.created++;
  } else {
    console.log(`  ⏭️  Component exists`);
    stats.components.skipped++;
  }

  // 2. CREATE CONTENT
  const contentDir = path.join(process.cwd(), 'content', lang, category);
  const contentPath = path.join(contentDir, `${slug}.md`);

  if (!fs.existsSync(contentPath)) {
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true });
    }
    const content = generateContent(calc);
    fs.writeFileSync(contentPath, content, 'utf-8');
    console.log(`  ✅ Content: ${lang}/${category}/${slug}.md`);
    stats.content.created++;
  } else {
    console.log(`  ⏭️  Content exists`);
    stats.content.skipped++;
  }

  // 3. REGISTRY ENTRY
  const entry = generateRegistryEntry(calc, componentName);
  stats.registry.push(entry);
});

// Save registry entries
const registryOutputPath = path.join(process.cwd(), 'NEW-CALCULATOR-REGISTRY-ENTRIES.txt');
const registryOutput = `
// =====================================================================
// NEW CALCULATOR REGISTRY ENTRIES
// Add these to lib/calculator-registry.ts
// =====================================================================

${stats.registry.join('\n\n')}

// =====================================================================
// Total: ${stats.registry.length} new entries
// =====================================================================
`;

fs.writeFileSync(registryOutputPath, registryOutput, 'utf-8');

// Summary
console.log('\n' + '='.repeat(70));
console.log('📊 CREATION SUMMARY\n');
console.log(`New calculators processed: ${newCalculators.length}`);
console.log(`\nComponents:`);
console.log(`  Created: ${stats.components.created}`);
console.log(`  Skipped: ${stats.components.skipped}`);
console.log(`\nContent files:`);
console.log(`  Created: ${stats.content.created}`);
console.log(`  Skipped: ${stats.content.skipped}`);
console.log(`\nRegistry entries: ${stats.registry.length}`);
console.log(`  Saved to: NEW-CALCULATOR-REGISTRY-ENTRIES.txt`);
console.log('\n' + '='.repeat(70));
console.log('\n📝 Next steps:');
console.log('  1. Add registry entries to lib/calculator-registry.ts');
console.log('  2. Implement calculator logic in components');
console.log('  3. Fill content TODO sections');
console.log('  4. Build: npm run build\n');

// =====================================================================
// GENERATOR FUNCTIONS
// =====================================================================

function generateComponent(calc, componentName) {
  const { title, lang } = calc;

  const t = {
    it: { calc: 'Calcola', reset: 'Reset', results: 'Risultati', value: 'Valore', disc: 'I risultati sono indicativi. Consulta un professionista.' },
    es: { calc: 'Calcular', reset: 'Resetear', results: 'Resultados', value: 'Valor', disc: 'Los resultados son orientativos. Consulta a un profesional.' },
    fr: { calc: 'Calculer', reset: 'Réinitialiser', results: 'Résultats', value: 'Valeur', disc: 'Les résultats sont indicatifs. Consultez un professionnel.' },
    en: { calc: 'Calculate', reset: 'Reset', results: 'Results', value: 'Value', disc: 'Results are indicative. Consult a professional.' }
  }[lang] || { calc: 'Calculate', reset: 'Reset', results: 'Results', value: 'Value', disc: 'Results are indicative.' };

  return `'use client';

import { useState } from 'react';

/**
 * ${title}
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
      total: (parseFloat(inputs.value1) || 0) + (parseFloat(inputs.value2) || 0),
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
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
          ${title}
        </h1>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
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
            ${t.calc}
          </button>
          <button
            onClick={handleReset}
            className="flex-1 sm:flex-initial bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-all"
          >
            ${t.reset}
          </button>
        </div>
      </div>

      {results && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 sm:p-8 rounded-xl shadow-lg">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
            ${t.results}
          </h2>
          <div className="bg-white p-4 rounded-lg">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-2xl font-bold text-blue-600">
              {results.total.toFixed(2)} €
            </div>
          </div>
        </div>
      )}

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">${t.disc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
`;
}

function generateContent(calc) {
  const { slug, title, lang, category, competitors } = calc;
  const keyword = title.replace(/^Calcolat(ore|rice|eur|or) /i, '').toLowerCase();

  const sec = {
    it: { what: 'Cos\'è', how: 'Come Funziona', why: 'Perché Usare', use: 'Come Utilizzarlo', faq: 'FAQ', src: 'Fonti', upd: 'Ultimo Aggiornamento' },
    es: { what: 'Qué Es', how: 'Cómo Funciona', why: 'Por Qué Usar', use: 'Cómo Utilizarla', faq: 'FAQ', src: 'Fuentes', upd: 'Última Actualización' },
    fr: { what: 'Qu\'est-ce', how: 'Comment Marche', why: 'Pourquoi Utiliser', use: 'Comment Utiliser', faq: 'FAQ', src: 'Sources', upd: 'Mise à Jour' },
    en: { what: 'What Is', how: 'How Works', why: 'Why Use', use: 'How to Use', faq: 'FAQ', src: 'Sources', upd: 'Updated' }
  }[lang] || { what: 'What', how: 'How', why: 'Why', use: 'Use', faq: 'FAQ', src: 'Sources', upd: 'Updated' };

  const compList = competitors.length > 0
    ? competitors.map((url, i) => `- [Competitor ${i + 1}](${url})`).join('\n')
    : '- No competitors';

  return `---
title: "${title}"
description: "${title.substring(0, 155)}"
keywords: ["${keyword}"]
lang: "${lang}"
category: "${category}"
slug: "${slug}"
---

# ${title}

<!-- TODO: Add introduction -->

## ${sec.what}

<!-- TODO: Explain what this calculator does -->

## ${sec.how}

<!-- TODO: Explain methodology -->

## ${sec.why}

<!-- TODO: List benefits -->

## ${sec.use}

<!-- TODO: Step-by-step guide -->

## ${sec.faq}

### Question 1?
Answer 1

### Question 2?
Answer 2

### Question 3?
Answer 3

### Question 4?
Answer 4

### Question 5?
Answer 5

## ${sec.src}

1. [Authority source]
2. [Authority source]

---

**Competitors:**
${compList}

**${sec.upd}:** ${new Date().toISOString().split('T')[0]}
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
