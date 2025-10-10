#!/usr/bin/env node

/**
 * Fix TypeScript errors in category pages by removing hardcoded conditionals
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🔧 Fixing TypeScript Errors in Category Pages\n');
console.log('='.repeat(70) + '\n');

const translations = {
  homeLabel: {
    it: 'Home',
    es: 'Inicio',
    fr: 'Accueil',
    en: 'Home'
  },
  professionalCalcs: {
    it: 'calcolatori professionali gratuiti per',
    es: 'calculadoras profesionales gratuitas para',
    fr: 'calculateurs professionnels gratuits pour',
    en: 'professional free calculators for'
  },
  availableTools: {
    it: 'Strumenti Disponibili',
    es: 'Herramientas Disponibles',
    fr: 'Outils Disponibles',
    en: 'Available Tools'
  },
  freeCalculator: {
    it: 'Calcolo gratuito',
    es: 'Cálculo gratuito',
    fr: 'Calcul gratuit',
    en: 'Free calculator'
  },
  open: {
    it: 'Apri',
    es: 'Abrir',
    fr: 'Ouvrir',
    en: 'Open'
  },
  noCalculators: {
    it: 'Nessun calcolatore disponibile in questa categoria.',
    es: 'No hay calculadoras disponibles en esta categoría.',
    fr: 'Aucun calculateur disponible dans cette catégorie.',
    en: 'No calculators available in this category.'
  }
};

const languages = ['it', 'es', 'fr', 'en'];
let fixed = 0;
let skipped = 0;
let errors = 0;

languages.forEach(lang => {
  const langDir = path.join(process.cwd(), 'app', lang);

  if (!fs.existsSync(langDir)) {
    return;
  }

  const entries = fs.readdirSync(langDir, { withFileTypes: true });

  entries.forEach(entry => {
    if (!entry.isDirectory()) return;
    if (entry.name.startsWith('[')) return;
    if (entry.name === 'search') return;

    const categorySlug = entry.name;
    const pagePath = path.join(langDir, categorySlug, 'page.tsx');

    if (!fs.existsSync(pagePath)) {
      return;
    }

    try {
      let content = fs.readFileSync(pagePath, 'utf-8');
      let modified = false;

      // Fix homeLabel conditional
      const homeLabelPattern = /{\s*name:\s*LANG\s*===\s*'it'\s*\?\s*'Home'\s*:\s*LANG\s*===\s*'es'\s*\?\s*'Inicio'\s*:\s*LANG\s*===\s*'fr'\s*\?\s*'Accueil'\s*:\s*'Home'\s*,\s*path:\s*`\/\$\{LANG\}`\s*}/;
      if (homeLabelPattern.test(content)) {
        content = content.replace(
          homeLabelPattern,
          `{ name: '${translations.homeLabel[lang]}', path: \`/\${LANG}\` }`
        );
        modified = true;
      }

      // Fix professional calculators text
      const profCalcsPattern = /{\s*calculators\.length\s*}\s*{\s*LANG\s*===\s*'it'\s*\?\s*'calcolatori professionali gratuiti per'\s*:\s*LANG\s*===\s*'es'\s*\?\s*'calculadoras profesionales gratuitas para'\s*:\s*LANG\s*===\s*'fr'\s*\?\s*'calculateurs professionnels gratuits pour'\s*:\s*'professional free calculators for'\s*}\s*{\s*categoryName\.toLowerCase\(\)\s*}/;
      if (profCalcsPattern.test(content)) {
        content = content.replace(
          profCalcsPattern,
          `{calculators.length} ${translations.professionalCalcs[lang]} {categoryName.toLowerCase()}`
        );
        modified = true;
      }

      // Fix available tools
      const availableToolsPattern = /{\s*calculators\.length\s*}\s*{\s*LANG\s*===\s*'it'\s*\?\s*'Strumenti Disponibili'\s*:\s*LANG\s*===\s*'es'\s*\?\s*'Herramientas Disponibles'\s*:\s*LANG\s*===\s*'fr'\s*\?\s*'Outils Disponibles'\s*:\s*'Available Tools'\s*}/;
      if (availableToolsPattern.test(content)) {
        content = content.replace(
          availableToolsPattern,
          `{calculators.length} ${translations.availableTools[lang]}`
        );
        modified = true;
      }

      // Fix free calculator
      const freeCalcPattern = /{\s*LANG\s*===\s*'it'\s*\?\s*'Calcolo gratuito'\s*:\s*LANG\s*===\s*'es'\s*\?\s*'Cálculo gratuito'\s*:\s*LANG\s*===\s*'fr'\s*\?\s*'Calcul gratuit'\s*:\s*'Free calculator'\s*}/;
      if (freeCalcPattern.test(content)) {
        content = content.replace(
          freeCalcPattern,
          `${translations.freeCalculator[lang]}`
        );
        modified = true;
      }

      // Fix open button
      const openPattern = /{\s*LANG\s*===\s*'it'\s*\?\s*'Apri'\s*:\s*LANG\s*===\s*'es'\s*\?\s*'Abrir'\s*:\s*LANG\s*===\s*'fr'\s*\?\s*'Ouvrir'\s*:\s*'Open'\s*}\s*→/;
      if (openPattern.test(content)) {
        content = content.replace(
          openPattern,
          `${translations.open[lang]} →`
        );
        modified = true;
      }

      // Fix no calculators message
      const noCalcsPattern = /{\s*LANG\s*===\s*'it'\s*\?\s*'Nessun calcolatore disponibile in questa categoria\.'\s*:\s*LANG\s*===\s*'es'\s*\?\s*'No hay calculadoras disponibles en esta categoría\.'\s*:\s*LANG\s*===\s*'fr'\s*\?\s*'Aucun calculateur disponible dans cette catégorie\.'\s*:\s*'No calculators available in this category\.'\s*}/;
      if (noCalcsPattern.test(content)) {
        content = content.replace(
          noCalcsPattern,
          `${translations.noCalculators[lang]}`
        );
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(pagePath, content, 'utf-8');
        console.log(`✅ ${lang}/${categorySlug}: Fixed TypeScript errors`);
        fixed++;
      } else {
        console.log(`⏭️  ${lang}/${categorySlug}: No changes needed`);
        skipped++;
      }

    } catch (error) {
      console.error(`❌ ${lang}/${categorySlug}: Error - ${error.message}`);
      errors++;
    }
  });
});

console.log('\n' + '='.repeat(70));
console.log('📊 FIX SUMMARY\n');
console.log(`Fixed: ${fixed} pages`);
console.log(`Skipped: ${skipped} pages`);
console.log(`Errors: ${errors} pages`);
console.log('='.repeat(70));
console.log('\n✅ TypeScript errors should be resolved!\n');
