import Link from 'next/link';
import Script from 'next/script';
import { getCalculatorsByLang } from '@/lib/calculator-registry';
import { CATEGORIES, Lang } from '@/lib/categories';
import { generateSEOMetadata } from '@/lib/seo';
import { translations } from '@/lib/i18n';

const LANG: Lang = 'en';

export async function generateMetadata() {
  const t = translations[LANG];
  return generateSEOMetadata({
    title: t.home.title,
    description: t.home.description,
    lang: LANG,
    path: `/${LANG}`,
  });
}

export default function HomePage() {
  const t = translations[LANG];
  const categories = CATEGORIES[LANG];
  const totalCalculators = getCalculatorsByLang(LANG).length;

  return (
    <>
      <div className="space-y-8 sm:space-y-12">
        {/* Hero Section */}
        <div className="text-center p-6 sm:p-8 md:p-12 bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 rounded-xl sm:rounded-2xl shadow-2xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            {t.home.h1}
          </h1>
          <p className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-gray-300">
            {t.home.subheading.replace('{count}', totalCalculators.toString())}
          </p>
        </div>

        {/* Categories Grid */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
            {t.home.exploreCategories}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/${LANG}/${category.slug}`}
                className="group block p-5 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 hover:border-blue-300"
              >
                <div className="flex items-center">
                  <div className="text-3xl mr-4">{category.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {getCalculatorsByLang(LANG).filter(c => c.category === category.slug).length} {t.common.calculators}
                    </p>
                  </div>
                  <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}