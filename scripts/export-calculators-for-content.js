#!/usr/bin/env node

/**
 * Export calculators to CSV for content generation
 * Generates a list of calculators with their metadata for content expansion
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read and parse the TypeScript registry file directly
const registryPath = path.join(__dirname, '..', 'lib', 'calculator-registry.ts');
const registryContent = fs.readFileSync(registryPath, 'utf-8');

// Extract calculator entries using regex
const registryMatch = registryContent.match(/export const CALCULATOR_REGISTRY[^=]*=\s*\[([\s\S]*)\];/);
if (!registryMatch) {
  console.error('❌ Could not parse calculator registry');
  process.exit(1);
}

// Simple parser for the calculator entries
function parseCalculatorEntries(content) {
  const calculators = [];
  const entryRegex = /\{[\s\S]*?slug:\s*'([^']*)',[\s\S]*?component:\s*'([^']*)',[\s\S]*?category:\s*'([^']*)',[\s\S]*?lang:\s*'([^']*)',[\s\S]*?title:\s*'([^']*)',[\s\S]*?description:\s*'([^']*)',[\s\S]*?keywords:\s*\[([\s\S]*?)\][\s\S]*?\}/g;

  let match;
  while ((match = entryRegex.exec(content)) !== null) {
    const keywords = match[7].match(/'([^']*)'/g)?.map(k => k.replace(/'/g, '')) || [];
    calculators.push({
      slug: match[1],
      component: match[2],
      category: match[3],
      lang: match[4],
      title: match[5],
      description: match[6],
      keywords: keywords
    });
  }

  return calculators;
}

const CALCULATOR_REGISTRY = parseCalculatorEntries(registryMatch[1]);

// Check if content file exists
function hasContentFile(lang, category, slug) {
  const contentPath = path.join(process.cwd(), 'content', lang, category, `${slug}.md`);
  return fs.existsSync(contentPath);
}

// Escape CSV fields
function escapeCsv(field) {
  if (field === null || field === undefined) return '';
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Generate CSV
const calculators = CALCULATOR_REGISTRY.map(calc => {
  const contentExists = hasContentFile(calc.lang, calc.category, calc.slug);
  const mainKeyword = calc.keywords?.[0] || calc.title;

  return {
    language: calc.lang,
    category: calc.category,
    slug: calc.slug,
    title: calc.title,
    description: calc.description,
    mainKeyword: mainKeyword,
    hasContent: contentExists ? 'YES' : 'NO',
    contentPath: `content/${calc.lang}/${calc.category}/${calc.slug}.md`,
    // Placeholder columns for competitor research
    competitor1: '',
    competitor2: '',
    competitor3: '',
    competitor4: '',
    competitor5: '',
    competitor6: '',
    competitor7: '',
    competitor8: '',
    competitor9: '',
    competitor10: '',
    authoritySource1: '',
    authoritySource2: '',
    notes: ''
  };
});

// Create CSV header
const headers = [
  'Language',
  'Category',
  'Slug',
  'Title',
  'Description',
  'Main Keyword',
  'Has Content',
  'Content Path',
  'Competitor URL 1',
  'Competitor URL 2',
  'Competitor URL 3',
  'Competitor URL 4',
  'Competitor URL 5',
  'Competitor URL 6',
  'Competitor URL 7',
  'Competitor URL 8',
  'Competitor URL 9',
  'Competitor URL 10',
  'Authority Source 1',
  'Authority Source 2',
  'Notes'
];

// Generate CSV content
const csvRows = [headers.join(',')];

calculators.forEach(calc => {
  const row = [
    escapeCsv(calc.language),
    escapeCsv(calc.category),
    escapeCsv(calc.slug),
    escapeCsv(calc.title),
    escapeCsv(calc.description),
    escapeCsv(calc.mainKeyword),
    escapeCsv(calc.hasContent),
    escapeCsv(calc.contentPath),
    escapeCsv(calc.competitor1),
    escapeCsv(calc.competitor2),
    escapeCsv(calc.competitor3),
    escapeCsv(calc.competitor4),
    escapeCsv(calc.competitor5),
    escapeCsv(calc.competitor6),
    escapeCsv(calc.competitor7),
    escapeCsv(calc.competitor8),
    escapeCsv(calc.competitor9),
    escapeCsv(calc.competitor10),
    escapeCsv(calc.authoritySource1),
    escapeCsv(calc.authoritySource2),
    escapeCsv(calc.notes)
  ];
  csvRows.push(row.join(','));
});

// Write to file
const outputPath = path.join(process.cwd(), 'content-expansion-template.csv');
fs.writeFileSync(outputPath, csvRows.join('\n'), 'utf-8');

// Also create a version with only calculators WITHOUT content
const needsContent = calculators.filter(c => c.hasContent === 'NO');
const needsContentCsv = [headers.join(',')];
needsContent.forEach(calc => {
  const row = [
    escapeCsv(calc.language),
    escapeCsv(calc.category),
    escapeCsv(calc.slug),
    escapeCsv(calc.title),
    escapeCsv(calc.description),
    escapeCsv(calc.mainKeyword),
    escapeCsv(calc.hasContent),
    escapeCsv(calc.contentPath),
    escapeCsv(calc.competitor1),
    escapeCsv(calc.competitor2),
    escapeCsv(calc.competitor3),
    escapeCsv(calc.competitor4),
    escapeCsv(calc.competitor5),
    escapeCsv(calc.competitor6),
    escapeCsv(calc.competitor7),
    escapeCsv(calc.competitor8),
    escapeCsv(calc.competitor9),
    escapeCsv(calc.competitor10),
    escapeCsv(calc.authoritySource1),
    escapeCsv(calc.authoritySource2),
    escapeCsv(calc.notes)
  ];
  needsContentCsv.push(row.join(','));
});

const needsContentPath = path.join(process.cwd(), 'calculators-need-content.csv');
fs.writeFileSync(needsContentPath, needsContentCsv.join('\n'), 'utf-8');

// Summary statistics
const total = calculators.length;
const withContent = calculators.filter(c => c.hasContent === 'YES').length;
const withoutContent = total - withContent;

const byLang = {};
calculators.forEach(c => {
  if (!byLang[c.language]) {
    byLang[c.language] = { total: 0, withContent: 0 };
  }
  byLang[c.language].total++;
  if (c.hasContent === 'YES') {
    byLang[c.language].withContent++;
  }
});

console.log('\n📊 Content Export Summary\n');
console.log(`Total calculators: ${total}`);
console.log(`With content: ${withContent} (${Math.round(withContent/total*100)}%)`);
console.log(`Without content: ${withoutContent} (${Math.round(withoutContent/total*100)}%)`);
console.log('\nBy language:');
Object.entries(byLang).forEach(([lang, stats]) => {
  console.log(`  ${lang.toUpperCase()}: ${stats.withContent}/${stats.total} (${Math.round(stats.withContent/stats.total*100)}%)`);
});

console.log('\n✅ Files created:');
console.log(`  1. ${outputPath} (all ${total} calculators)`);
console.log(`  2. ${needsContentPath} (${withoutContent} calculators needing content)`);
console.log('\n📋 Next steps:');
console.log('  1. Open the CSV files in Excel/Google Sheets');
console.log('  2. For each calculator, add competitor URLs (columns I-R)');
console.log('  3. Add 2 authority sources for citations (columns S-T)');
console.log('  4. Save and use with content generation script\n');
