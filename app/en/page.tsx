import Link from 'next/link';
import Script from 'next/script';
import { CalculatorIcon, SparklesIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { CATEGORIES } from '@/lib/categories';
import { getCalculatorsByLang } from '@/lib/calculator-registry';
import { generateSEOMetadata, SITE_CONFIG } from '@/lib/seo';
import { getRequestOrigin } from '@/lib/request-context';

const LANG = 'en';

// Generate metadata for SEO
export async function generateMetadata() {
  const origin = getRequestOrigin();
  return generateSEOMetadata({
    title: 'SoCalSolver - Professional Free Online Calculators',
    description: SITE_CONFIG.description.en,
    keywords: SITE_CONFIG.keywords.en,
    lang: LANG,
    path: `/${LANG}`,
    type: 'website',
    origin,
  });
}

export default function HomePage() {
  const categories = CATEGORIES[LANG];
  const allCalculators = getCalculatorsByLang(LANG);
  const totalCalculators = allCalculators.length;

  // WebSite Schema for homepage
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SoCalSolver',
    url: `https://socalsolver.com/${LANG}`,
    description: SITE_CONFIG.description.en,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `https://socalsolver.com/${LANG}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: 'en-US',
  };

  return (
    <>
      {/* WebSite Schema */}
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      <div className="space-y-12 sm:space-y-16">
        {/* Hero Section */}
        <section className="text-center py-12 sm:py-16 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-400 text-white rounded-xl sm:rounded-2xl shadow-2xl px-4">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <CalculatorIcon className="w-12 h-12 sm:w-14 sm:h-14" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
            SoCalSolver Professional
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl opacity-90 max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed">
            Professional free calculators for taxes, finance, real estate and business
          </p>

          {/* Features Badges */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <span className="inline-flex items-center px-3 sm:px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm sm:text-base font-medium">
              <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {totalCalculators}+ Calculators
            </span>
            <span className="inline-flex items-center px-3 sm:px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm sm:text-base font-medium">
              <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Interactive Charts
            </span>
            <span className="inline-flex items-center px-3 sm:px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm sm:text-base font-medium">
              100% Free
            </span>
          </div>
        </section>

        {/* Value Propositions */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg text-center">
            <div className="text-3xl sm:text-4xl mb-3">&#9889;</div>
            <h3 className="font-bold text-base sm:text-lg mb-2">Instant Results</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Immediate calculations without waiting
            </p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg text-center">
            <div className="text-3xl sm:text-4xl mb-3">&#128274;</div>
            <h3 className="font-bold text-base sm:text-lg mb-2">Privacy Guaranteed</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              No data saved or shared
            </p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg text-center">
            <div className="text-3xl sm:text-4xl mb-3">&#128241;</div>
            <h3 className="font-bold text-base sm:text-lg mb-2">Mobile First</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Optimized for every device
            </p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg text-center">
            <div className="text-3xl sm:text-4xl mb-3">&#127381;</div>
            <h3 className="font-bold text-base sm:text-lg mb-2">Always Updated</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              2025 regulations included
            </p>
          </div>
        </section>

        {/* Categories Grid */}
        <section>
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3 sm:mb-4">
              Explore by Category
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
              Choose the category that interests you and discover all the professional calculators
              available
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((cat) => {
              const categoryCalcs = allCalculators.filter((calc) => calc.category === cat.slug);
              return (
                <Link
                  key={cat.slug}
                  href={`/${LANG}/${cat.slug}`}
                  className="group block p-4 sm:p-6 md:p-8 bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 hover:border-blue-200"
                >
                  <div className="text-center">
                    <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                      {cat.icon}
                    </div>
                    <h3 className="font-bold text-base sm:text-lg md:text-xl text-slate-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {cat.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3">
                      {categoryCalcs.length} calculators
                    </p>
                    <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Popular Calculators Section */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 sm:p-8 md:p-12 rounded-xl sm:rounded-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6 sm:mb-8 text-center">
            Most Popular Calculators
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {allCalculators.slice(0, 6).map((calc) => (
              <Link
                key={calc.slug}
                href={`/${LANG}/${calc.category}/${calc.slug}`}
                className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <div className="flex items-start mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white mr-3 flex-shrink-0">
                    <CalculatorIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-gray-800 line-clamp-2">
                    {calc.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                  {calc.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 sm:p-12 rounded-xl sm:rounded-2xl text-center shadow-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to get started?
          </h2>
          <p className="text-base sm:text-lg opacity-90 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Choose a category and discover our professional free calculators
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href={`/${LANG}/${categories[0]?.slug || 'business-and-marketing'}`}
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg text-sm sm:text-base"
            >
              Get Started &rarr;
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
