#!/usr/bin/env node

/**
 * Format registry entries in the correct format matching the existing registry
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read CSV
const csvPath = path.join(process.cwd(), 'calculator-missing400-700.csv');
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

for (const record of records) {
  const slug = record.slug;
  const title = record.title;
  const language = record.language;
  const categoryName = record.category;
  const categorySlug = CATEGORY_MAPPING[categoryName] || categoryName.toLowerCase().replace(/\s+/g, '-');

  // Check if exists in registry
  const inReg = registryContent.includes(`slug: '${slug}'`) || registryContent.includes(`slug: "${slug}"`);

  if (!inReg) {
    // Check if component and content exist
    const componentName = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    const componentPath = path.join(process.cwd(), 'components', 'calculators', `${componentName}.tsx`);
    const contentPath = path.join(process.cwd(), 'content', language, categorySlug, `${slug}.md`);

    const componentExists = fs.existsSync(componentPath);
    const contentExists = fs.existsSync(contentPath);

    if (componentExists && contentExists) {
      missingEntries.push({
        slug,
        title,
        description: title,
        category: categorySlug,
        lang: language,
        component: componentName
      });
    }
  }
}

console.log(`Found ${missingEntries.length} missing entries`);

// Generate properly formatted entries matching the existing style
const formattedEntries = missingEntries.map(entry => {
  return `  {
    slug: '${entry.slug}',
    component: '${entry.component}',
    category: '${entry.category}',
    lang: '${entry.lang}',
    title: '${entry.title.replace(/'/g, "\\'")}',
    description: '${entry.description.replace(/'/g, "\\'")}',
    hasContent: true,
  }`;
}).join(',\n\n');

const outputPath = path.join(process.cwd(), 'FORMATTED_REGISTRY_ENTRIES_400-700.txt');
fs.writeFileSync(outputPath, formattedEntries, 'utf-8');

console.log(`✅ Saved formatted entries to: FORMATTED_REGISTRY_ENTRIES_400-700.txt`);
console.log(`\nTo add to registry:`);
console.log(`1. Open lib/calculator-registry.ts`);
console.log(`2. Find line 919 (before the closing "];")`);
console.log(`3. Add a comma after the last entry`);
console.log(`4. Paste the contents of FORMATTED_REGISTRY_ENTRIES.txt`);
console.log(`5. Save and run: npm run build\n`);
