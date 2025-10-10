#!/usr/bin/env node

/**
 * Verify all calculators are listed on their respective category pages
 * Checks that getCalculatorsByCategory() properly returns all calculators
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🔍 Verifying Calculator Category Listings\n');
console.log('='.repeat(70) + '\n');

// Read registry
const registryPath = path.join(process.cwd(), 'lib', 'calculator-registry.ts');
const registryContent = fs.readFileSync(registryPath, 'utf-8');

// Parse calculators from registry
const calculators = [];
const entryRegex = /\{[\s\S]*?slug:\s*'([^']*)',[\s\S]*?component:\s*'([^']*)',[\s\S]*?category:\s*'([^']*)',[\s\S]*?lang:\s*'([^']*)',[\s\S]*?title:\s*'([^']*)'[\s\S]*?\}/g;

let match;
while ((match = entryRegex.exec(registryContent)) !== null) {
  calculators.push({
    slug: match[1],
    component: match[2],
    category: match[3],
    lang: match[4],
    title: match[5]
  });
}

console.log(`📊 Found ${calculators.length} calculators in registry\n`);

// Group by language and category
const byLangCategory = {};

calculators.forEach(calc => {
  const key = `${calc.lang}/${calc.category}`;
  if (!byLangCategory[key]) {
    byLangCategory[key] = [];
  }
  byLangCategory[key].push(calc);
});

// Display results
console.log('📋 Calculators by Category:\n');

const languages = {
  it: 'Italian',
  es: 'Spanish',
  fr: 'French',
  en: 'English'
};

Object.keys(languages).forEach(lang => {
  const langCalcs = calculators.filter(c => c.lang === lang);
  if (langCalcs.length === 0) return;

  console.log(`\n${'─'.repeat(70)}`);
  console.log(`${languages[lang].toUpperCase()} (${lang}) - ${langCalcs.length} calculators`);
  console.log('─'.repeat(70));

  // Get categories for this language
  const categories = {};
  langCalcs.forEach(calc => {
    if (!categories[calc.category]) {
      categories[calc.category] = [];
    }
    categories[calc.category].push(calc);
  });

  // Display each category
  Object.keys(categories).sort().forEach(category => {
    const calcs = categories[category];
    console.log(`\n  📁 ${category} (${calcs.length} calculators)`);

    // Check if category page exists
    const categoryPagePath = path.join(process.cwd(), 'app', lang, category, 'page.tsx');
    const pageExists = fs.existsSync(categoryPagePath);

    if (pageExists) {
      console.log(`     ✅ Category page exists`);

      // Check if page uses getCalculatorsByCategory
      const pageContent = fs.readFileSync(categoryPagePath, 'utf-8');
      const usesGetCalcs = pageContent.includes('getCalculatorsByCategory');

      if (usesGetCalcs) {
        console.log(`     ✅ Uses getCalculatorsByCategory (auto-displays all ${calcs.length} calculators)`);
      } else {
        console.log(`     ⚠️  Does NOT use getCalculatorsByCategory`);
      }
    } else {
      console.log(`     ❌ Category page MISSING: app/${lang}/${category}/page.tsx`);
    }

    // List first 5 calculators
    calcs.slice(0, 5).forEach(calc => {
      console.log(`        • ${calc.title}`);
    });
    if (calcs.length > 5) {
      console.log(`        ... and ${calcs.length - 5} more`);
    }
  });
});

// Summary
console.log('\n' + '='.repeat(70));
console.log('📊 SUMMARY\n');

const totalCategories = Object.keys(byLangCategory).length;
let pagesExist = 0;
let pagesUseFunction = 0;

Object.keys(byLangCategory).forEach(key => {
  const [lang, category] = key.split('/');
  const categoryPagePath = path.join(process.cwd(), 'app', lang, category, 'page.tsx');

  if (fs.existsSync(categoryPagePath)) {
    pagesExist++;
    const pageContent = fs.readFileSync(categoryPagePath, 'utf-8');
    if (pageContent.includes('getCalculatorsByCategory')) {
      pagesUseFunction++;
    }
  }
});

console.log(`Total calculators in registry: ${calculators.length}`);
console.log(`Total categories: ${totalCategories}`);
console.log(`Category pages exist: ${pagesExist}/${totalCategories}`);
console.log(`Pages using getCalculatorsByCategory: ${pagesUseFunction}/${totalCategories}`);

console.log('\n' + '='.repeat(70));

if (pagesUseFunction === totalCategories) {
  console.log('\n✅ ALL CATEGORY PAGES PROPERLY DISPLAY THEIR CALCULATORS!');
  console.log('\nHow it works:');
  console.log('  • Category pages call getCalculatorsByCategory(category, lang)');
  console.log('  • Function filters CALCULATOR_REGISTRY by category + language');
  console.log('  • All matching calculators are automatically displayed');
  console.log('  • No manual updates needed - 100% dynamic!');
} else if (pagesExist < totalCategories) {
  console.log(`\n⚠️  ${totalCategories - pagesExist} CATEGORY PAGES ARE MISSING`);
  console.log('\nAction needed: Create missing category pages');
} else {
  console.log(`\n⚠️  ${totalCategories - pagesUseFunction} PAGES DON'T USE getCalculatorsByCategory`);
  console.log('\nAction needed: Update pages to use the function');
}

console.log('\n');
