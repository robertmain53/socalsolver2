'use client';
import Link from 'next/link';
import { CATEGORIES, type Category, type Lang } from '@/lib/categories'; // ← nuovo import

interface FooterProps {
  /** Codice lingua, ad esempio "it", "en", ecc. */
  lang: Lang; // ← tipizzato sulle lingue supportate
}

/** Lingue supportate dal language-switcher. */
const LANGUAGES = [
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
] as const;

/**
 * Traduzioni per i testi del footer
 */
const TRANSLATIONS: Record<string, Record<string, string>> = {
  it: {
    title: 'Calcolatori professionali per ogni esigenza. Oltre 1.500 strumenti gratuiti sempre aggiornati.',
    changeLanguage: 'Cambia Lingua',
    mainCategories: 'Categorie Principali',
    specializedSectors: 'Settori Specializzati',
    usefulTools: 'Strumenti Utili',
    copyright: 'Tutti i diritti riservati.',
    description: 'Calcolatori professionali gratuiti per oltre 20 categorie specializzate.',
    calculators: 'Calcolatori',
    categories: 'Categorie',
    free: 'Gratuito'
  },
  en: {
    title: 'Professional calculators for every need. Over 1,500 free tools always updated.',
    changeLanguage: 'Change Language',
    mainCategories: 'Main Categories',
    specializedSectors: 'Specialized Sectors',
    usefulTools: 'Useful Tools',
    copyright: 'All rights reserved.',
    description: 'Professional free calculators for over 20 specialized categories.',
    calculators: 'Calculators',
    categories: 'Categories',
    free: 'Free'
  },
  es: {
    title: 'Calculadoras profesionales para cada necesidad. Más de 1.500 herramientas gratuitas siempre actualizadas.',
    changeLanguage: 'Cambiar Idioma',
    mainCategories: 'Categorías Principales',
    specializedSectors: 'Sectores Especializados',
    usefulTools: 'Herramientas Útiles',
    copyright: 'Todos los derechos reservados.',
    description: 'Calculadoras profesionales gratuitas para más de 20 categorías especializadas.',
    calculators: 'Calculadoras',
    categories: 'Categorías',
    free: 'Gratis'
  },
  fr: {
    title: 'Calculatrices professionnelles pour chaque besoin. Plus de 1.500 outils gratuits toujours mis à jour.',
    changeLanguage: 'Changer de Langue',
    mainCategories: 'Catégories Principales',
    specializedSectors: 'Secteurs Spécialisés',
    usefulTools: 'Outils Utiles',
    copyright: 'Tous droits réservés.',
    description: 'Calculatrices professionnelles gratuites pour plus de 20 catégories spécialisées.',
    calculators: 'Calculatrices',
    categories: 'Catégories',
    free: 'Gratuit'
  }
};

export default function Footer({ lang }: FooterProps) {
  // Se la lingua non è presente, ripieghiamo sull'italiano.
  const categories: Category[] = CATEGORIES[lang] ?? CATEGORIES.it;
  const t = TRANSLATIONS[lang] ?? TRANSLATIONS.it;

  const currentYear = new Date().getFullYear();

  const categoriesPerColumn = Math.ceil(categories.length / 3);
  const categoryColumns: Category[][] = [
    categories.slice(0, categoriesPerColumn),
    categories.slice(categoriesPerColumn, categoriesPerColumn * 2),
    categories.slice(categoriesPerColumn * 2),
  ];

  return (
    <footer className="bg-slate-800 text-slate-300 pt-16 pb-8 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href={`/${lang}`} className="text-2xl font-bold text-white mb-4 block">
              SoCalSolver
            </Link>
            <p className="text-lg opacity-90 mb-6">
              {t.title}
            </p>

            {/* Language Switcher */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold">{t.changeLanguage}</h4>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((language) => (
                  <Link
                    key={language.code}
                    href={`/${language.code}`}
                    className={`inline-flex items-center px-3 py-2 rounded-lg transition-colors ${
                      lang === language.code
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                    }`}
                  >
                    <span className="mr-2">{language.flag}</span>
                    <span className="text-sm font-medium">{language.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Categories Columns */}
          {categoryColumns.map((columnCategories, columnIndex) => (
            <div key={columnIndex} className="space-y-4">
              <h4 className="text-white font-semibold text-lg">
                {columnIndex === 0 && t.mainCategories}
                {columnIndex === 1 && t.specializedSectors}
                {columnIndex === 2 && t.usefulTools}
              </h4>
              <ul className="space-y-2">
                {columnCategories.map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={`/${lang}/${category.slug}`}
                      className="flex items-center text-slate-300 hover:text-white transition-colors group"
                    >
                      <span className="mr-2 group-hover:scale-110 transition-transform">
                        {category.icon}
                      </span>
                      <span className="text-sm">{category.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-sm">
                © {currentYear} SoCalSolver. {t.copyright}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {t.description}
              </p>
            </div>

            <div className="flex items-center space-x-6 text-sm">
              <div className="text-center">
                <div className="font-bold text-white">1.500+</div>
                <div className="text-xs text-slate-400">{t.calculators}</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-white">20+</div>
                <div className="text-xs text-slate-400">{t.categories}</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-white">100%</div>
                <div className="text-xs text-slate-400">{t.free}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
