#!/usr/bin/env node

/**
 * Update all category pages to include description and FAQ sections
 * This script adds dynamic content from lib/category-content.ts
 */

import fs from 'fs';
import path from 'path';

const LANGUAGES = ['it', 'en', 'es', 'fr'];

const ENHANCED_TEMPLATE = `import Link from 'next/link';
import Script from 'next/script';
import { CalculatorIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { getCalculatorsByCategory } from '@/lib/calculator-registry';
import { CATEGORIES } from '@/lib/categories';
import { getCategoryContent } from '@/lib/category-content';
import {
  generateSEOMetadata,
  generateBreadcrumbSchema,
  generateCollectionSchema,
  generateFAQSchema,
} from '@/lib/seo';

const CATEGORY = '__CATEGORY_SLUG__';
const LANG = '__LANG__';

export async function generateMetadata() {
  const categoryInfo = CATEGORIES[LANG].find((cat) => cat.slug === CATEGORY);
  const calculators = getCalculatorsByCategory(CATEGORY, LANG);
  const content = getCategoryContent(CATEGORY, LANG);

  return generateSEOMetadata({
    title: \`\${categoryInfo?.name || 'Category'} - Professional Calculators\`,
    description: content?.description || \`\${calculators.length} free calculators for \${categoryInfo?.name.toLowerCase() || 'category'}\`,
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
  const content = getCategoryContent(CATEGORY, LANG);

  const crumbs = [
    { name: LANG === 'it' ? 'Home' : LANG === 'es' ? 'Inicio' : LANG === 'fr' ? 'Accueil' : 'Home', path: \`/\${LANG}\` },
    { name: categoryName },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(crumbs, LANG);
  const collectionSchema = generateCollectionSchema({
    name: categoryName,
    description: content?.description || \`Professional calculators for \${categoryName.toLowerCase()}\`,
    url: \`https://socalsolver.com/\${LANG}/\${CATEGORY}\`,
    numberOfItems: calculators.length,
  });

  // Generate FAQ Schema if FAQs exist
  const faqSchema = content?.faqs ? generateFAQSchema(content.faqs) : null;

  return (
    <>
      {/* JSON-LD Schemas */}
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
      {faqSchema && (
        <Script
          id="faq-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <div className="space-y-6 sm:space-y-8">
        <Breadcrumb crumbs={crumbs} />

        {/* Hero Category */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 sm:p-8 md:p-12 rounded-xl sm:rounded-2xl text-center shadow-xl">
          <div className="flex items-center justify-center mb-4">
            <span className="text-5xl sm:text-6xl mr-3">{categoryIcon}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            {categoryName}
          </h1>
          <p className="text-base sm:text-lg md:text-xl opacity-90 max-w-3xl mx-auto">
            {content?.description || \`\${calculators.length} professional calculators for \${categoryName.toLowerCase()}\`}
          </p>
        </div>

        {/* Category Description */}
        {content?.longDescription && (
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
            <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
              {content.longDescription}
            </p>
          </div>
        )}

        {/* Calculators Count Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-semibold text-sm">
            <CalculatorIcon className="w-5 h-5 mr-2" />
            {calculators.length} {LANG === 'it' ? 'Strumenti Disponibili' : LANG === 'es' ? 'Herramientas Disponibles' : LANG === 'fr' ? 'Outils Disponibles' : 'Available Tools'}
          </div>
        </div>

        {/* Calculators Grid */}
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
                  {LANG === 'it' ? 'Calcolo gratuito' : LANG === 'es' ? 'Cálculo gratuito' : LANG === 'fr' ? 'Calcul gratuit' : 'Free calculator'}
                </span>
                <span className="text-xs sm:text-sm text-blue-600 font-semibold group-hover:text-blue-800">
                  {LANG === 'it' ? 'Apri' : LANG === 'es' ? 'Abrir' : LANG === 'fr' ? 'Ouvrir' : 'Open'} →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {calculators.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <p className="text-gray-600 text-lg">
              {LANG === 'it' ? 'Nessun calcolatore disponibile in questa categoria al momento.' :
               LANG === 'es' ? 'No hay calculadoras disponibles en esta categoría en este momento.' :
               LANG === 'fr' ? 'Aucun calculateur disponible dans cette catégorie pour le moment.' :
               'No calculators available in this category at the moment.'}
            </p>
          </div>
        )}

        {/* FAQ Section */}
        {content?.faqs && content.faqs.length > 0 && (
          <div className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
              {LANG === 'it' ? 'Domande Frequenti' :
               LANG === 'es' ? 'Preguntas Frecuentes' :
               LANG === 'fr' ? 'Questions Fréquentes' :
               'Frequently Asked Questions'}
            </h2>
            <div className="space-y-4">
              {content.faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group bg-gray-50 rounded-lg p-4 sm:p-6 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <summary className="flex justify-between items-center font-semibold text-gray-800 text-sm sm:text-base">
                    <span className="pr-4">{faq.question}</span>
                    <ChevronDownIcon className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform flex-shrink-0" />
                  </summary>
                  <div className="mt-4 text-gray-600 text-sm sm:text-base leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* SEO Content Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 sm:p-8 rounded-xl sm:rounded-2xl">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
            {LANG === 'it' ? \`Calcolatori per \${categoryName}\` :
             LANG === 'es' ? \`Calculadoras para \${categoryName}\` :
             LANG === 'fr' ? \`Calculateurs pour \${categoryName}\` :
             \`Calculators for \${categoryName}\`}
          </h2>
          <div className="prose prose-sm sm:prose max-w-none text-gray-600">
            <p>
              {LANG === 'it'
                ? \`La nostra collezione di calcolatori per \${categoryName.toLowerCase()} ti aiuta a gestire in modo professionale e preciso tutti gli aspetti della categoria. Tutti i nostri strumenti sono gratuiti, sempre aggiornati con le ultime normative e non richiedono registrazione.\`
                : LANG === 'es'
                ? \`Nuestra colección de calculadoras para \${categoryName.toLowerCase()} te ayuda a gestionar de forma profesional y precisa todos los aspectos de la categoría. Todas nuestras herramientas son gratuitas, siempre actualizadas y no requieren registro.\`
                : LANG === 'fr'
                ? \`Notre collection de calculateurs pour \${categoryName.toLowerCase()} vous aide à gérer de manière professionnelle et précise tous les aspects de la catégorie. Tous nos outils sont gratuits, toujours à jour et ne nécessitent pas d'inscription.\`
                : \`Our collection of calculators for \${categoryName.toLowerCase()} helps you manage all aspects professionally and accurately. All our tools are free, always up-to-date, and require no registration.\`}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
`;

console.log('🔄 Updating category pages with FAQ and description sections...\n');

// Find all category page.tsx files
const appDir = path.join(process.cwd(), 'app');
let updated = 0;
let skipped = 0;

LANGUAGES.forEach(lang => {
  const langDir = path.join(appDir, lang);

  if (!fs.existsSync(langDir)) {
    console.log(`⏭️  Skipping ${lang} (directory doesn't exist)`);
    return;
  }

  const categories = fs.readdirSync(langDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && !entry.name.startsWith('[') && entry.name !== 'search')
    .map(entry => entry.name);

  categories.forEach(category => {
    const pagePath = path.join(langDir, category, 'page.tsx');

    if (!fs.existsSync(pagePath)) {
      console.log(`⏭️  Skipping ${lang}/${category} (page.tsx doesn't exist)`);
      skipped++;
      return;
    }

    // Generate enhanced template
    const enhancedContent = ENHANCED_TEMPLATE
      .replace(/__CATEGORY_SLUG__/g, category)
      .replace(/__LANG__/g, lang);

    // Backup original
    const backupPath = path.join(langDir, category, 'page.tsx.backup');
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(pagePath, backupPath);
    }

    // Write enhanced version
    fs.writeFileSync(pagePath, enhancedContent, 'utf-8');
    console.log(`✅ Updated: ${lang}/${category}/page.tsx`);
    updated++;
  });
});

console.log('\n' + '='.repeat(60));
console.log('📊 Summary\n');
console.log(`Updated: ${updated} category pages`);
console.log(`Skipped: ${skipped} pages`);
console.log('\n💡 Backups created as page.tsx.backup');
console.log('\n📝 Next steps:');
console.log('   1. Review the updated pages');
console.log('   2. Add more content to lib/category-content.ts for other categories');
console.log('   3. Test the FAQ sections');
console.log('   4. Build and deploy\n');
