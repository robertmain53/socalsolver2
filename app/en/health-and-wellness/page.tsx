import Link from 'next/link';
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

import { getRequestOrigin } from '@/lib/request-context';
const CATEGORY = 'health-and-wellness';
const LANG = 'en';

export async function generateMetadata() {
  const origin = getRequestOrigin();
  const categoryInfo = CATEGORIES[LANG].find((cat) => cat.slug === CATEGORY);
  const calculators = getCalculatorsByCategory(CATEGORY, LANG);

  return generateSEOMetadata({
    title: `${categoryInfo?.name || 'Category'} - Professional Calculators`,
    description: `${calculators.length} free calculators for ${categoryInfo?.name.toLowerCase() || 'category'}`,
    keywords: ['calculator', categoryInfo?.name || 'tools'],
    lang: LANG,
    path: `/${LANG}/${CATEGORY}`,
    type: 'website',
    origin,
  });
}

export default function CategoryPage() {
  const calculators = getCalculatorsByCategory(CATEGORY, LANG);
  const categoryInfo = CATEGORIES[LANG].find((cat) => cat.slug === CATEGORY);
  const categoryName = categoryInfo?.name || 'Category';
  const categoryIcon = categoryInfo?.icon || '📊';

  const crumbs = [
    { name: 'Home', path: `/${LANG}` },
    { name: categoryName },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(crumbs, LANG);
  const collectionSchema = generateCollectionSchema({
    name: categoryName,
    description: `Professional calculators for ${categoryName.toLowerCase()}`,
    url: `https://socalsolver.com/${LANG}/${CATEGORY}`,
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
            {calculators.length} professional free calculators for {categoryName.toLowerCase()}
          </p>
        </div>

        <div className="flex justify-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-semibold text-sm">
            <CalculatorIcon className="w-5 h-5 mr-2" />
            {calculators.length} Available Tools
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {calculators.map((calc) => (
            <Link
              key={calc.slug}
              href={`/${LANG}/${CATEGORY}/${calc.slug}`}
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
                  Free calculator
                </span>
                <span className="text-xs sm:text-sm text-blue-600 font-semibold group-hover:text-blue-800">
                  Open →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {calculators.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <p className="text-gray-600 text-lg">
              No calculators available in this category.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
