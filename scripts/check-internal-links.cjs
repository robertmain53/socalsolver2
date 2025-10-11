#!/usr/bin/env node

/**
 * Check for internal 404 errors in the codebase
 * Validates:
 * - Internal links in components
 * - Registry entries match actual files
 * - Content files exist for calculators marked with hasContent: true
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Category mapping for different languages
const CATEGORY_MAP = {
  en: {
    'personal-finance': 'personal-finance',
    'real-estate-&-housing': 'real-estate-&-housing',
    'health-&-wellness': 'health-&-wellness',
    'automotive-&-transportation': 'automotive-&-transportation',
    'business-&-marketing': 'business-&-marketing',
    'professional-&-specialized': 'professional-&-specialized',
    'legal-&-administrative': 'legal-&-administrative',
    'education-&-university': 'education-&-university',
    'miscellaneous-&-daily-life': 'miscellaneous-&-daily-life',
    'conversions': 'conversions'
  },
  it: {
    'finanza-personale': 'finanza-personale',
    'immobiliare-e-casa': 'immobiliare-e-casa',
    'salute-e-benessere': 'salute-e-benessere',
    'auto-e-trasporti': 'auto-e-trasporti',
    'pmi-e-impresa': 'pmi-e-impresa',
    'fisco-e-lavoro-autonomo': 'fisco-e-lavoro-autonomo',
    'veicoli-e-trasporti': 'veicoli-e-trasporti',
    'famiglia-e-vita-quotidiana': 'famiglia-e-vita-quotidiana',
    'hobby-e-tempo-libero': 'hobby-e-tempo-libero',
    'risparmio-e-investimenti': 'risparmio-e-investimenti',
    'vita-quotidiana': 'vita-quotidiana',
    'agricoltura-e-cibo': 'agricoltura-e-cibo',
    'matematica-e-geometria': 'matematica-e-geometria',
    'conversioni': 'conversioni'
  },
  es: {
    'finanzas-personales': 'finanzas-personales',
    'bienes-raices-y-vivienda': 'bienes-raices-y-vivienda',
    'salud-y-bienestar': 'salud-y-bienestar',
    'automoviles-y-transporte': 'automoviles-y-transporte',
    'pymes-y-empresas': 'pymes-y-empresas',
    'impuestos-y-trabajo-autonomo': 'impuestos-y-trabajo-autonomo',
    'legal-y-administrativo': 'legal-y-administrativo',
    'educacion-y-universidad': 'educacion-y-universidad',
    'miscelanea-y-vida-cotidiana': 'miscelanea-y-vida-cotidiana'
  },
  fr: {
    'epargne-et-investissements': 'epargne-et-investissements',
    'immobilier-et-maison': 'immobilier-et-maison',
    'voitures-et-transports': 'voitures-et-transports',
    'fiscalite-et-travail-independant': 'fiscalite-et-travail-independant',
    'fiscalité-et-travail-indépendant': 'fiscalite-et-travail-independant', // Map accented to non-accented
    'pme-et-entreprises': 'pme-et-entreprises',
    'famille-et-vie-quotidienne': 'famille-et-vie-quotidienne',
    'loisirs-et-temps-libre': 'loisirs-et-temps-libre',
    'agriculture-et-alimentation': 'agriculture-et-alimentation'
  }
};

let errors = [];
let warnings = [];

// Load registry
const registryPath = path.join(process.cwd(), 'lib/calculator-registry.ts');
const registryContent = fs.readFileSync(registryPath, 'utf8');

// Extract registry entries using regex
const registryEntriesMatch = registryContent.match(/export const CALCULATOR_REGISTRY[\s\S]*?\[([\s\S]*?)\];/);
if (!registryEntriesMatch) {
  console.error('❌ Could not parse calculator registry');
  process.exit(1);
}

// Parse registry entries
const entriesText = registryEntriesMatch[1];
const slugMatches = [...entriesText.matchAll(/slug:\s*['"]([^'"]+)['"]/g)];
const componentMatches = [...entriesText.matchAll(/component:\s*['"]([^'"]+)['"]/g)];
const categoryMatches = [...entriesText.matchAll(/category:\s*['"]([^'"]+)['"]/g)];
const langMatches = [...entriesText.matchAll(/lang:\s*['"]([^'"]+)['"]/g)];
const hasContentMatches = [...entriesText.matchAll(/hasContent:\s*(true|false)/g)];

console.log('\n🔍 Checking Internal Links and Files...\n');
console.log(`Found ${slugMatches.length} calculators in registry\n`);

// Check each calculator
for (let i = 0; i < slugMatches.length; i++) {
  const slug = slugMatches[i][1];
  const component = componentMatches[i][1];
  const category = categoryMatches[i][1];
  const lang = langMatches[i][1];
  const hasContent = hasContentMatches[i][1] === 'true';

  // 1. Check if component file exists
  const componentPath = path.join(process.cwd(), 'components/calculators', `${component}.tsx`);
  if (!fs.existsSync(componentPath)) {
    errors.push(`❌ Missing component: ${component}.tsx for calculator "${slug}"`);
  }

  // 2. Check if content file exists (if hasContent is true)
  if (hasContent) {
    const categorySlug = CATEGORY_MAP[lang]?.[category] || category;
    const contentPath = path.join(process.cwd(), 'content', lang, categorySlug, `${slug}.md`);

    if (!fs.existsSync(contentPath)) {
      errors.push(`❌ Missing content: ${lang}/${categorySlug}/${slug}.md`);
    }
  }

  // 3. Check if app route exists
  const categorySlug = CATEGORY_MAP[lang]?.[category] || category;
  const appPath = path.join(process.cwd(), 'app', lang, categorySlug, '[slug]', 'page.tsx');

  if (!fs.existsSync(appPath)) {
    warnings.push(`⚠️  Missing app route: app/${lang}/${categorySlug}/[slug]/page.tsx for calculator "${slug}"`);
  }
}

// Check for orphaned component files
console.log('\n🔍 Checking for orphaned component files...\n');
const componentsDir = path.join(process.cwd(), 'components/calculators');
const componentFiles = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));
const registryComponents = componentMatches.map(m => m[1]);

for (const file of componentFiles) {
  const componentName = file.replace('.tsx', '');
  if (!registryComponents.includes(componentName)) {
    warnings.push(`⚠️  Orphaned component (not in registry): ${file}`);
  }
}

// Check for orphaned content files
console.log('🔍 Checking for orphaned content files...\n');
const contentDir = path.join(process.cwd(), 'content');
const languages = ['en', 'it', 'es', 'fr'];

for (const lang of languages) {
  const langDir = path.join(contentDir, lang);
  if (!fs.existsSync(langDir)) continue;

  const categories = fs.readdirSync(langDir).filter(f => {
    const stat = fs.statSync(path.join(langDir, f));
    return stat.isDirectory();
  });

  for (const category of categories) {
    const categoryDir = path.join(langDir, category);
    const contentFiles = fs.readdirSync(categoryDir).filter(f => f.endsWith('.md'));

    for (const file of contentFiles) {
      const slug = file.replace('.md', '');
      const registrySlugs = slugMatches.map(m => m[1]);

      if (!registrySlugs.includes(slug)) {
        warnings.push(`⚠️  Orphaned content file (not in registry): ${lang}/${category}/${file}`);
      }
    }
  }
}

// Print results
console.log('\n' + '='.repeat(60));
console.log('📊 RESULTS');
console.log('='.repeat(60) + '\n');

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ No issues found! All internal links are valid.\n');
  process.exit(0);
}

if (errors.length > 0) {
  console.log(`\n🚨 ERRORS (${errors.length}):\n`);
  errors.forEach(err => console.log(err));
}

if (warnings.length > 0) {
  console.log(`\n⚠️  WARNINGS (${warnings.length}):\n`);
  warnings.forEach(warn => console.log(warn));
}

console.log('\n' + '='.repeat(60) + '\n');

// Exit with error code if there are errors
if (errors.length > 0) {
  process.exit(1);
}

process.exit(0);
