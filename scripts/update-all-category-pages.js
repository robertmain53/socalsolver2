#!/usr/bin/env node

/**
 * Update ALL category pages to use getCalculatorsByCategory()
 * This ensures all calculators from the registry are displayed automatically
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🔄 Updating All Category Pages to Use getCalculatorsByCategory()\n');
console.log('='.repeat(70) + '\n');

// Translation helper for breadcrumbs
function getHomeTranslation(lang) {
  const translations = {
    it: 'Home',
    es: 'Inicio',
    fr: 'Accueil',
    en: 'Home'
  };
  return translations[lang] || 'Home';
}

function getAvailableToolsTranslation(lang) {
  const translations = {
    it: 'Strumenti Disponibili',
    es: 'Herramientas Disponibles',
    fr: 'Outils Disponibles',
    en: 'Available Tools'
  };
  return translations[lang] || 'Available Tools';
}

function getFreeCalculatorTranslation(lang) {
  const translations = {
    it: 'Calcolo gratuito',
    es: 'Cálculo gratuito',
    fr: 'Calcul gratuit',
    en: 'Free calculator'
  };
  return translations[lang] || 'Free calculator';
}

function getOpenTranslation(lang) {
  const translations = {
    it: 'Apri',
    es: 'Abrir',
    fr: 'Ouvrir',
    en: 'Open'
  };
  return translations[lang] || 'Open';
}

function getNoCalculatorsTranslation(lang) {
  const translations = {
    it: 'Nessun calcolatore disponibile in questa categoria.',
    es: 'No hay calculadoras disponibles en esta categoría.',
    fr: 'Aucun calculateur disponible dans cette catégorie.',
    en: 'No calculators available in this category.'
  };
  return translations[lang] || 'No calculators available in this category.';
}

function getProfessionalCalculatorsTranslation(lang) {
  const translations = {
    it: 'calcolatori professionali gratuiti per',
    es: 'calculadoras profesionales gratuitas para',
    fr: 'calculateurs professionnels gratuits pour',
    en: 'professional free calculators for'
  };
  return translations[lang] || 'professional free calculators for';
}

// Standard category page template that uses getCalculatorsByCategory
const TEMPLATE = `import Link from 'next/link';
import Script from 'next/script';
import { CalculatorIcon } from '@heroicons/react/24/outline';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { getCalculatorsByCategory } from '@/lib/calculator-registry';
import { CATEGORIES } from '@/lib/categories';
import {
  generateSEOMetadata,
  generateBreadcrumbSchema,
  generateCollectionSchema,
} from '@/lib/seo';

const CATEGORY = '__CATEGORY__';
const LANG = '__LANG__';

export async function generateMetadata() {
  const categoryInfo = CATEGORIES[LANG].find((cat) => cat.slug === CATEGORY);
  const calculators = getCalculatorsByCategory(CATEGORY, LANG);

  return generateSEOMetadata({
    title: \`\${categoryInfo?.name || 'Category'} - Professional Calculators\`,
    description: \`\${calculators.length} free calculators for \${categoryInfo?.name.toLowerCase() || 'category'}\`,
    keywords: ['calculator', categoryInfo?.name || 'tools'],
    lang: LANG,
    path: \`/\${LANG}/\${CATEGORY}\`,
    type: 'website',
  });
}

export default function CategoryPage() {
  const calculators = getCalculatorsByCategory(CATEGORY, LANG);
  const categoryInfo = CATEGORIES[LANG].find((cat) => cat.slug === CATEGORY);
  const categoryName = categoryInfo?.name || 'Category';
  const categoryIcon = categoryInfo?.icon || '📊';

  const homeLabel = '__HOME_LABEL__';
  const crumbs = [
    { name: homeLabel, path: \`/\${LANG}\` },
    { name: categoryName },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(crumbs, LANG);
  const collectionSchema = generateCollectionSchema({
    name: categoryName,
    description: \`Professional calculators for \${categoryName.toLowerCase()}\`,
    url: \`https://www.socalsolver.com/\${LANG}/\${CATEGORY}\`,
    numberOfItems: calculators.length,
  });

  return (
    <>
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="collection-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      <div className="space-y-6 sm:space-y-8">
        <Breadcrumb crumbs={crumbs} />

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 sm:p-8 md:p-12 rounded-xl sm:rounded-2xl text-center shadow-xl">
          <div className="flex items-center justify-center mb-4">
            <span className="text-5xl sm:text-6xl mr-3">{categoryIcon}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            {categoryName}
          </h1>
          <p className="text-base sm:text-lg md:text-xl opacity-90 max-w-3xl mx-auto">
            {calculators.length} __PROFESSIONAL_CALCULATORS__ {categoryName.toLowerCase()}
          </p>
        </div>

        <div className="flex justify-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-semibold text-sm">
            <CalculatorIcon className="w-5 h-5 mr-2" />
            {calculators.length} __AVAILABLE_TOOLS__
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {calculators.map((calc) => (
            <Link
              key={calc.slug}
              href={\`/\${LANG}/\${CATEGORY}/\${calc.slug}\`}
              className="group block p-4 sm:p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 hover:border-blue-200"
            >
              <div className="flex items-start mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white mr-3 sm:mr-4 group-hover:scale-110 transition-transform flex-shrink-0">
                  <CalculatorIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-base sm:text-lg md:text-xl text-slate-800 mb-2 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">
                    {calc.title}
                  </h2>
                </div>
              </div>

              {calc.description && (
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-3 mb-3">
                  {calc.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-xs sm:text-sm text-gray-500 font-medium">
                  __FREE_CALCULATOR__
                </span>
                <span className="text-xs sm:text-sm text-blue-600 font-semibold group-hover:text-blue-800">
                  __OPEN__ →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {calculators.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <p className="text-gray-600 text-lg">
              __NO_CALCULATORS__
            </p>
          </div>
        )}
      </div>
    </>
  );
}
`;

// Find all category pages
const languages = ['it', 'es', 'fr', 'en'];
let updated = 0;
let skipped = 0;
let errors = 0;

languages.forEach(lang => {
  const langDir = path.join(process.cwd(), 'app', lang);

  if (!fs.existsSync(langDir)) {
    console.log(`⏭️  Language ${lang} directory not found`);
    return;
  }

  const entries = fs.readdirSync(langDir, { withFileTypes: true });

  entries.forEach(entry => {
    if (!entry.isDirectory()) return;
    if (entry.name.startsWith('[')) return; // Skip dynamic routes
    if (entry.name === 'search') return; // Skip search page

    const categorySlug = entry.name;
    const pagePath = path.join(langDir, categorySlug, 'page.tsx');

    if (!fs.existsSync(pagePath)) {
      console.log(`⏭️  ${lang}/${categorySlug}: No page.tsx found`);
      return;
    }

    try {
      // Check if already uses getCalculatorsByCategory
      const currentContent = fs.readFileSync(pagePath, 'utf-8');

      if (currentContent.includes('getCalculatorsByCategory')) {
        console.log(`✅ ${lang}/${categorySlug}: Already uses getCalculatorsByCategory`);
        skipped++;
        return;
      }

      // Backup original
      const backupPath = pagePath + '.backup';
      if (!fs.existsSync(backupPath)) {
        fs.writeFileSync(backupPath, currentContent, 'utf-8');
      }

      // Generate new content with translations
      const newContent = TEMPLATE
        .replace(/__CATEGORY__/g, categorySlug)
        .replace(/__LANG__/g, lang)
        .replace(/__HOME_LABEL__/g, getHomeTranslation(lang))
        .replace(/__PROFESSIONAL_CALCULATORS__/g, getProfessionalCalculatorsTranslation(lang))
        .replace(/__AVAILABLE_TOOLS__/g, getAvailableToolsTranslation(lang))
        .replace(/__FREE_CALCULATOR__/g, getFreeCalculatorTranslation(lang))
        .replace(/__OPEN__/g, getOpenTranslation(lang))
        .replace(/__NO_CALCULATORS__/g, getNoCalculatorsTranslation(lang));

      // Write updated page
      fs.writeFileSync(pagePath, newContent, 'utf-8');
      console.log(`✅ ${lang}/${categorySlug}: Updated to use getCalculatorsByCategory`);
      updated++;

    } catch (error) {
      console.error(`❌ ${lang}/${categorySlug}: Error - ${error.message}`);
      errors++;
    }
  });
});

console.log('\n' + '='.repeat(70));
console.log('📊 UPDATE SUMMARY\n');
console.log(`Updated: ${updated} category pages`);
console.log(`Already correct: ${skipped} pages`);
console.log(`Errors: ${errors} pages`);
console.log('\n💾 Backups saved as page.tsx.backup');
console.log('='.repeat(70));
console.log('\n✅ All category pages now use getCalculatorsByCategory()!');
console.log('\nNext step: npm run build\n');
