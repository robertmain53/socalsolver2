#!/usr/bin/env node

/**
 * Find calculators with components and content but not in registry
 * Generate registry entries to be added manually
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🔍 Finding Missing Registry Entries\n');
console.log('='.repeat(70) + '\n');

// Read CSV
const csvPath = path.join(process.cwd(), 'calculator-missing201-400.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  trim: true
});

// Read current registry
const registryPath = path.join(process.cwd(), 'lib', 'calculator-registry.ts');
const registryContent = fs.readFileSync(registryPath, 'utf-8');

// Category mapping
const CATEGORY_MAPPING = {
  'Famiglia e Vita Quotidiana': 'famiglia-e-vita-quotidiana',
  'Hobby e Tempo Libero': 'hobby-e-tempo-libero',
  'Auto e Trasporti': 'auto-e-trasporti',
  'Veicoli e Trasporti': 'veicoli-e-trasporti',
  'PMI e Impresa': 'pmi-e-impresa',
  'Fisco e Lavoro Autonomo': 'fisco-e-lavoro-autonomo',
  'Immobiliare e Casa': 'immobiliare-e-casa',
  'Risparmio e Investimenti': 'risparmio-e-investimenti',
  'Conversioni': 'conversioni',
  'Salute e Benessere': 'salute-e-benessere',
  'Vita Quotidiana': 'vita-quotidiana',
  'Matematica e Geometria': 'matematica-e-geometria',
  'Finanza Personale': 'finanza-personale',
  'Agricoltura e Cibo': 'agricoltura-e-cibo',
  'Impuestos y Trabajo Autónomo': 'impuestos-y-trabajo-autonomo',
  'Bienes Raíces y Vivienda': 'bienes-raices-y-vivienda',
  'Automóviles y Transporte': 'automoviles-y-transporte',
  'Legal y Administrativo': 'legal-y-administrativo',
  'Miscelánea y Vida Cotidiana': 'miscelanea-y-vida-cotidiana',
  'PYMEs y Empresas': 'pymes-y-empresas',
  'Salud y Bienestar': 'salud-y-bienestar',
  'Educación y Universidad': 'educacion-y-universidad',
  'Fiscalité et Travail Indépendant': 'fiscalite-et-travail-independant',
  'Immobilier et Maison': 'immobilier-et-maison',
  'Voitures et Transports': 'voitures-et-transports',
  'PME et Entreprises': 'pme-et-entreprises',
  'Agriculture et Alimentation': 'agriculture-et-alimentation',
  'Épargne et Investissements': 'epargne-et-investissements',
  'Loisirs et Temps Libre': 'loisirs-et-temps-libre',
  'Famille et Vie Quotidienne': 'famille-et-vie-quotidienne',
  'Tax and Freelance (UK/US/CA)': 'tax-and-freelance-uk-us-ca',
  'Real Estate and Housing': 'real-estate-and-housing',
  'SME and Business': 'sme-and-business',
  'Finance and Investment': 'finance-and-investment',
  'Savings and Investment': 'savings-and-investment',
  'Business and Marketing': 'business-and-marketing',
  'Education and Career': 'education-and-career',
  'Health and Wellness': 'health-and-wellness',
  'Professional and Specialized': 'professional-and-specialized',
  'Digital Health and Wellbeing': 'digital-health-and-wellbeing',
  'Smart Home and Technology': 'smart-home-and-technology',
  'Lifestyle and Entertainment': 'lifestyle-and-entertainment',
  'Lifestyle and Niche': 'lifestyle-and-niche',
  'Gaming and Esports': 'gaming-and-esports',
  'Sustainability and Environment': 'sustainability-and-environment',
  'Health and Sustainability': 'health-and-sustainability'
};

const missingEntries = [];
let inRegistry = 0;
let notInRegistry = 0;

for (const record of records) {
  const slug = record.slug;
  const title = record.title;
  const language = record.language;
  const categoryName = record.category;
  const categorySlug = CATEGORY_MAPPING[categoryName] || categoryName.toLowerCase().replace(/\s+/g, '-');

  // Check if exists in registry
  const inReg = registryContent.includes(`slug: '${slug}'`) || registryContent.includes(`slug: "${slug}"`);

  if (inReg) {
    inRegistry++;
  } else {
    // Check if component and content exist
    const componentName = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    const componentPath = path.join(process.cwd(), 'components', 'calculators', `${componentName}.tsx`);
    const contentPath = path.join(process.cwd(), 'content', language, categorySlug, `${slug}.md`);

    const componentExists = fs.existsSync(componentPath);
    const contentExists = fs.existsSync(contentPath);

    if (componentExists && contentExists) {
      notInRegistry++;
      missingEntries.push({
        slug,
        title,
        description: title,
        category: categorySlug,
        lang: language,
        component: componentName
      });
      console.log(`❌ Missing from registry: ${slug} (${language}) - has component + content`);
    }
  }
}

console.log('\n' + '='.repeat(70));
console.log('📊 REGISTRY CHECK SUMMARY\n');
console.log(`Total in CSV: ${records.length}`);
console.log(`Already in registry: ${inRegistry}`);
console.log(`Missing from registry: ${notInRegistry}`);
console.log('='.repeat(70));

if (missingEntries.length > 0) {
  // Generate TypeScript registry entries
  const tsEntries = missingEntries.map(entry => {
    return `  {
    slug: '${entry.slug}',
    title: '${entry.title.replace(/'/g, "\\'")}',
    description: '${entry.description.replace(/'/g, "\\'")}',
    category: '${entry.category}',
    lang: '${entry.lang}',
    component: lazy(() => import('@/components/calculators/${entry.component}'))
  }`;
  }).join(',\n');

  const outputPath = path.join(process.cwd(), 'REGISTRY_ENTRIES_TO_ADD.txt');
  fs.writeFileSync(outputPath, tsEntries, 'utf-8');

  console.log(`\n📝 Generated ${missingEntries.length} registry entries`);
  console.log(`💾 Saved to: REGISTRY_ENTRIES_TO_ADD.txt`);
  console.log(`\n⚠️  ACTION REQUIRED:`);
  console.log(`   1. Open lib/calculator-registry.ts`);
  console.log(`   2. Add the entries from REGISTRY_ENTRIES_TO_ADD.txt`);
  console.log(`   3. Save the file`);
  console.log(`   4. Run: npm run build\n`);
} else {
  console.log('\n✅ All calculators are already in the registry!\n');
}
