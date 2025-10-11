#!/usr/bin/env node
/**
 * Script to generate calculator page.tsx files for all categories and languages
 * This ensures all calculator pages have proper SEO metadata
 */

const fs = require('fs');
const path = require('path');

// Define all language/category combinations
const ROUTES = [
  // Italian
  { lang: 'it', category: 'fisco-e-lavoro-autonomo', name: 'Fisco e Lavoro Autonomo' },
  { lang: 'it', category: 'immobiliare-e-casa', name: 'Immobiliare e Casa' },
  { lang: 'it', category: 'finanza-personale', name: 'Finanza Personale' },
  { lang: 'it', category: 'veicoli-e-trasporti', name: 'Veicoli e Trasporti' },
  { lang: 'it', category: 'salute-e-benessere', name: 'Salute e Benessere' },
  { lang: 'it', category: 'pmi-e-impresa', name: 'PMI e Impresa' },
  { lang: 'it', category: 'risparmio-e-investimenti', name: 'Risparmio e Investimenti' },
  { lang: 'it', category: 'matematica-e-geometria', name: 'Matematica e Geometria' },
  { lang: 'it', category: 'conversioni', name: 'Conversioni' },
  { lang: 'it', category: 'famiglia-e-vita-quotidiana', name: 'Famiglia e Vita Quotidiana' },
  { lang: 'it', category: 'agricoltura-e-cibo', name: 'Agricoltura e Cibo' },
  { lang: 'it', category: 'vita-quotidiana', name: 'Vita Quotidiana' },
  { lang: 'it', category: 'hobby-e-tempo-libero', name: 'Hobby e Tempo Libero' },
  { lang: 'it', category: 'auto-e-trasporti', name: 'Auto e Trasporti' },

  // English
  { lang: 'en', category: 'business-and-marketing', name: 'Business & Marketing' },
  { lang: 'en', category: 'digital-health-and-wellbeing', name: 'Digital Health & Wellbeing' },
  { lang: 'en', category: 'education-and-career', name: 'Education & Career' },
  { lang: 'en', category: 'finance-and-investment', name: 'Finance & Investment' },
  { lang: 'en', category: 'gaming-and-esports', name: 'Gaming & eSports' },
  { lang: 'en', category: 'health-and-sustainability', name: 'Health & Sustainability' },
  { lang: 'en', category: 'health-and-wellness', name: 'Health & Wellness' },
  { lang: 'en', category: 'lifestyle-and-entertainment', name: 'Lifestyle & Entertainment' },
  { lang: 'en', category: 'lifestyle-and-niche', name: 'Lifestyle & Niche' },
  { lang: 'en', category: 'professional-and-specialized', name: 'Professional & Specialized' },
  { lang: 'en', category: 'real-estate-and-housing', name: 'Real Estate & Housing' },
  { lang: 'en', category: 'sme-and-business', name: 'SME & Business' },
  { lang: 'en', category: 'savings-and-investment', name: 'Savings & Investment' },
  { lang: 'en', category: 'smart-home-and-technology', name: 'Smart Home & Technology' },
  { lang: 'en', category: 'sustainability-and-environment', name: 'Sustainability & Environment' },
  { lang: 'en', category: 'tax-and-freelance-uk-us-ca', name: 'Tax & Freelance (UK/US/CA)' },

  // Spanish
  { lang: 'es', category: 'automoviles-y-transporte', name: 'Automóviles y transporte' },
  { lang: 'es', category: 'bienes-raices-y-vivienda', name: 'Bienes Raíces y Vivienda' },
  { lang: 'es', category: 'educacion-y-universidad', name: 'Educación y Universidad' },
  { lang: 'es', category: 'impuestos-y-trabajo-autonomo', name: 'Impuestos y trabajo autónomo' },
  { lang: 'es', category: 'legal-y-administrativo', name: 'Legal y Administrativo' },
  { lang: 'es', category: 'miscelanea-y-vida-cotidiana', name: 'Miscelánea y vida cotidiana' },
  { lang: 'es', category: 'pymes-y-empresas', name: 'PYMES y Empresas' },
  { lang: 'es', category: 'salud-y-bienestar', name: 'Salud y bienestar' },

  // French
  { lang: 'fr', category: 'agriculture-et-alimentation', name: 'Agriculture et alimentation' },
  { lang: 'fr', category: 'famille-et-vie-quotidienne', name: 'Famille et vie quotidienne' },
  { lang: 'fr', category: 'fiscalite-et-travail-independant', name: 'Fiscalité et travail indépendant' },
  { lang: 'fr', category: 'immobilier-et-maison', name: 'Immobilier et maison' },
  { lang: 'fr', category: 'loisirs-et-temps-libre', name: 'Loisirs et temps libre' },
  { lang: 'fr', category: 'pme-et-entreprises', name: 'PME et entreprises' },
  { lang: 'fr', category: 'voitures-et-transports', name: 'Voitures et transports' },
  { lang: 'fr', category: 'epargne-et-investissements', name: 'Épargne et investissements' },
];

// Template for calculator pages
const getCalculatorPageTemplate = (lang, category, categoryName) => `import { notFound } from 'next/navigation';
import fs from 'fs/promises';
import path from 'path';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import Script from 'next/script';
import Breadcrumb from '@/components/layout/Breadcrumb';
import RelatedCalculators from '@/components/calculator/RelatedCalculators';
import { getCalculator } from '@/lib/calculator-registry';
import { CATEGORIES } from '@/lib/categories';
import {
  generateSEOMetadata,
  generateBreadcrumbSchema,
  generateCalculatorSchema,
  generateArticleSchema,
} from '@/lib/seo';

type Props = { params: { slug: string } };

const CATEGORY = '${category}';
const LANG = '${lang}';

async function getCalculatorComponent(slug: string) {
  try {
    const componentName =
      slug.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('') +
      'Calculator';
    return (await import(\`@/components/calculators/\${componentName}\`)).default;
  } catch (error) {
    return null;
  }
}

async function getContent(slug: string) {
  try {
    const contentPath = path.join(process.cwd(), 'content', LANG, CATEGORY, \`\${slug}.md\`);
    return await fs.readFile(contentPath, 'utf8');
  } catch (error) {
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props) {
  const calcMeta = getCalculator(params.slug, LANG);

  if (!calcMeta) {
    return {
      title: 'Calculator Not Found',
      robots: 'noindex',
    };
  }

  return generateSEOMetadata({
    title: calcMeta.title,
    description: calcMeta.description,
    keywords: calcMeta.keywords,
    lang: LANG,
    path: \`/\${LANG}/\${CATEGORY}/\${params.slug}\`,
    type: 'article',
    author: calcMeta.author,
  });
}

export default async function CalculatorPage({ params }: Props) {
  const CalculatorComponent = await getCalculatorComponent(params.slug);
  const content = await getContent(params.slug);
  const calcMeta = getCalculator(params.slug, LANG);

  if (!CalculatorComponent || !calcMeta) {
    notFound();
  }

  // Get category info
  const categories = CATEGORIES[LANG];
  const categoryInfo = categories.find((cat) => cat.slug === CATEGORY);
  const categoryName = categoryInfo?.name || '${categoryName}';

  // Breadcrumbs
  const crumbs = [
    { name: 'Home', path: \`/\${LANG}\` },
    { name: categoryName, path: \`/\${LANG}/\${CATEGORY}\` },
    { name: calcMeta.title },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(crumbs, LANG);
  const calculatorSchema = generateCalculatorSchema({
    name: calcMeta.title,
    description: calcMeta.description,
    url: \`https://socalsolver.com/\${LANG}/\${CATEGORY}/\${params.slug}\`,
    category: CATEGORY,
    lang: LANG,
  });

  const articleSchema = content
    ? generateArticleSchema({
        headline: calcMeta.title,
        description: calcMeta.description,
        url: \`https://socalsolver.com/\${LANG}/\${CATEGORY}/\${params.slug}\`,
        datePublished: new Date().toISOString(),
        dateModified: new Date().toISOString(),
      })
    : null;

  return (
    <>
      {/* JSON-LD Schemas */}
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="calculator-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }}
      />
      {articleSchema && (
        <Script
          id="article-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
      )}

      <div className="space-y-6 sm:space-y-8">
        <Breadcrumb crumbs={crumbs} />

        {/* Calculator */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
          <CalculatorComponent />
        </div>

        {/* Content */}
        {content && (
          <article className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-lg">
            <ReactMarkdown>{content}</ReactMarkdown>
          </article>
        )}

        {/* Related Calculators */}
        <RelatedCalculators
          currentSlug={params.slug}
          category={CATEGORY}
          lang={LANG}
          maxItems={6}
        />
      </div>
    </>
  );
}
`;

// Main execution
function main() {
  let created = 0;
  let skipped = 0;
  let errors = 0;

  console.log('🚀 Starting calculator page generation...\n');

  ROUTES.forEach(({ lang, category, name }) => {
    const dirPath = path.join(process.cwd(), 'app', lang, category, '[slug]');
    const filePath = path.join(dirPath, 'page.tsx');

    try {
      // Create directory if it doesn't exist
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`📁 Created directory: ${dirPath}`);
      }

      // Check if file already exists
      if (fs.existsSync(filePath)) {
        console.log(`⏭️  Skipped (exists): ${lang}/${category}/[slug]/page.tsx`);
        skipped++;
        return;
      }

      // Write the template
      const template = getCalculatorPageTemplate(lang, category, name);
      fs.writeFileSync(filePath, template, 'utf8');
      console.log(`✅ Created: ${lang}/${category}/[slug]/page.tsx`);
      created++;

    } catch (error) {
      console.error(`❌ Error creating ${lang}/${category}/[slug]/page.tsx:`, error.message);
      errors++;
    }
  });

  console.log(`\n📊 Summary:`);
  console.log(`   Created: ${created}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Errors:  ${errors}`);
  console.log(`   Total:   ${created + skipped + errors}`);
  console.log(`\n✨ Done!`);
}

main();
