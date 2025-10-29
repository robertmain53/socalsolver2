'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronRightIcon, CalculatorIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { getRelatedCalculators, type CalculatorMetadata } from '@/lib/calculator-registry';
import { CATEGORIES, type Lang } from '@/lib/categories';
import { t } from '@/lib/i18n';

interface RelatedCalculatorsProps {
  currentSlug: string;
  category: string;
  lang: Lang;
  maxItems?: number;
}

export default function RelatedCalculators({
  currentSlug,
  category,
  lang,
  maxItems = 6,
}: RelatedCalculatorsProps) {
  const [relatedCalculators, setRelatedCalculators] = useState<CalculatorMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRelatedCalculators = useCallback(() => {
    setIsLoading(true);

    try {
      // Use the registry to get actual related calculators
      const related = getRelatedCalculators(currentSlug, category, lang, maxItems);
      setRelatedCalculators(related);
    } catch (error) {
      console.error('Error loading related calculators:', error);
      setRelatedCalculators([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentSlug, category, lang, maxItems]);

  useEffect(() => {
    loadRelatedCalculators();
  }, [loadRelatedCalculators]);

  const refreshSuggestions = () => {
    loadRelatedCalculators();
  };

  // Get category icon and name
  const categories = CATEGORIES[lang] || CATEGORIES.it;
  const categoryInfo = categories.find((cat) => cat.slug === category);
  const categoryIcon = categoryInfo?.icon || '📊';
  const categoryName = categoryInfo?.name || category;

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (relatedCalculators.length === 0) {
    return null;
  }

  return (
    <div className="calculator-related bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-3 sm:p-5 md:p-8 mt-10 sm:mt-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-start sm:items-center">
          <div className="text-2xl sm:text-3xl mr-3">{categoryIcon}</div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
              {t('relatedCalculators.title', lang, 'Related Calculators')}
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              {t('relatedCalculators.subtitle', lang, 'Other useful tools in the category')}{' '}
              {categoryName}
            </p>
          </div>
        </div>

        <button
          onClick={refreshSuggestions}
          className="flex items-center px-3 sm:px-4 py-2 bg-white border-2 border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 font-medium text-sm"
        >
          <SparklesIcon className="w-4 h-4 mr-2" />
          {t('relatedCalculators.newSuggestions', lang, 'New Suggestions')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {relatedCalculators.map((calculator, index) => (
          <Link
            key={`${calculator.slug}-${index}`}
            href={`/${lang}/${calculator.category}/${calculator.slug}`}
            className="group block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 hover:border-blue-200"
          >
            <div className="p-3 sm:p-5">
              {/* Header con icona */}
              <div className="flex items-start mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl font-bold mr-3 sm:mr-4 group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
                  <CalculatorIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-base sm:text-lg text-gray-800 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">
                    {calculator.title}
                  </h4>
                </div>
              </div>

              {/* Descrizione */}
              {calculator.description && (
                <p className="text-gray-600 text-xs sm:text-sm mb-4 leading-relaxed line-clamp-3">
                  {calculator.description}
                </p>
              )}

              {/* Footer con call-to-action */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs sm:text-sm text-gray-500 font-medium">
                  {t('relatedCalculators.freeCalculator', lang, 'Free calculator')}
                </span>
                <div className="flex items-center text-blue-600 font-semibold text-xs sm:text-sm group-hover:text-blue-800 transition-colors">
                  <span>{t('relatedCalculators.calculateNow', lang, 'Calculate now')}</span>
                  <ChevronRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Link alla categoria completa */}
      <div className="mt-6 sm:mt-8 text-center">
        <Link
          href={`/${lang}/${category}`}
          className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
        >
          <span>{t('relatedCalculators.viewAll', lang, 'View all calculators in this category')}</span>
          <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
        </Link>
      </div>
    </div>
  );
}
