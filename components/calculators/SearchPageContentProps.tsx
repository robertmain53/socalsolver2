'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { searchCalculators } from '@/lib/calculator-registry';
import { Lang } from '@/lib/categories';
import { translations } from '@/lib/i18n';

interface SearchPageContentProps {
  lang: Lang;
}

export default function SearchPageContent({ lang }: SearchPageContentProps) {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const searchResults = searchCalculators(query, lang);
  const t = (translations as any)[lang];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          {t.search.resultsTitle}: <span className="text-indigo-600">"{query}"</span>
        </h1>
        <p className="mt-2 text-gray-600">
          {searchResults.length} {searchResults.length === 1 ? t.search.resultFound : t.search.resultsFound}
        </p>
      </div>

      {searchResults.length > 0 ? (
        <div className="space-y-6">
          {searchResults.map((calc) => (
            <Link
              key={calc.slug}
              href={`/${lang}/${calc.category}/${calc.slug}`}
              className="block p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-indigo-200"
            >
              <h2 className="font-bold text-xl text-indigo-700 group-hover:underline">
                {calc.title}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {t.categories[calc.category as keyof typeof t.categories] || calc.category}
              </p>
              <p className="text-gray-700 mt-3 line-clamp-2">
                {calc.description}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-white rounded-xl shadow-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-gray-800">{t.search.noResultsTitle}</h3>
          <p className="mt-2 text-sm text-gray-500">{t.search.noResultsText}</p>
        </div>
      )}
    </div>
  );
}
