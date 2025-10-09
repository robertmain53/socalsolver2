#!/bin/bash

echo "🌍 Espansione struttura multilingue per SoCalSolver"
echo "=================================================="

# Funzione per creare la struttura di una categoria
create_category_structure() {
    local lang=$1
    local category_slug=$2
    local category_name=$3
    
    # Crea directory categoria
    mkdir -p "app/$lang/$category_slug"
    
    # Crea page.tsx per lista calcolatori
    cat > "app/$lang/$category_slug/page.tsx" << EOF
import Link from 'next/link';
import fs from 'fs/promises';
import path from 'path';
import Breadcrumb from '@/components/layout/Breadcrumb';

async function getCalculators() {
    const calculatorsPath = path.join(process.cwd(), 'content', '$lang', '$category_slug');
    try {
        const entries = await fs.readdir(calculatorsPath, { withFileTypes: true });
        return entries
            .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
            .map(entry => {
                const slug = entry.name.replace('.md', '');
                const name = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                return { name, slug };
            });
    } catch (error) { return []; }
}

export default async function CategoryPage() {
  const calculators = await getCalculators();
  const categoryName = "$category_name";
  const crumbs = [{ name: "Home", path: "/$lang" }, { name: categoryName }];

  return (
    <div className="space-y-8">
      <Breadcrumb crumbs={crumbs} />
      
      {/* Hero Category */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-12 rounded-2xl text-center">
        <h1 className="text-4xl font-bold mb-4">{categoryName}</h1>
        <p className="text-xl opacity-90">Professional calculators for {categoryName.toLowerCase()}</p>
      </div>

      {/* Calculators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {calculators.map((calc) => (
            <Link 
              key={calc.slug} 
              href={\`/$lang/$category_slug/\${calc.slug}\`} 
              className="block p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <h2 className="font-bold text-xl text-slate-800 mb-2 hover:text-blue-600 transition-colors">
                {calc.name}
              </h2>
              <p className="text-gray-600">Professional calculation for {calc.name.toLowerCase()}</p>
            </Link>
        ))}
      </div>
    </div>
  );
}
EOF

    # Crea directory per calcolatori specifici
    mkdir -p "app/$lang/$category_slug/[slug]"
    
    # Crea page.tsx per calcolatore specifico
    cat > "app/$lang/$category_slug/[slug]/page.tsx" << EOF
import { notFound } from 'next/navigation';
import fs from 'fs/promises';
import path from 'path';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import Breadcrumb from '@/components/layout/Breadcrumb';

type Props = { params: { slug: string } };

async function getCalculatorComponent(slug: string) {
  try {
    const componentName = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
    return (await import(\`@/components/calculators/\${componentName}\`)).default;
  } catch (error) { return null; }
}

async function getContent(slug: string) {
  try {
    const contentPath = path.join(process.cwd(), 'content', '$lang', '$category_slug', \`\${slug}.md\`);
    return await fs.readFile(contentPath, 'utf8');
  } catch (error) { return null; }
}

export default async function CalculatorPage({ params }: Props) {
  const CalculatorComponent = await getCalculatorComponent(params.slug);
  const content = await getContent(params.slug);

  if (!CalculatorComponent) notFound();
  
  const calculatorName = params.slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const crumbs = [
      { name: "Home", path: "/$lang" },
      { name: "$category_name", path: "/$lang/$category_slug" },
      { name: calculatorName }
  ];

  return (
    <div className="space-y-8">
        <Breadcrumb crumbs={crumbs} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calculator */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg">
                <CalculatorComponent />
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
                <div className="p-6 bg-white rounded-2xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Tools</h3>
                    <div className="space-y-2">
                        <button className="w-full p-3 text-left rounded-lg hover:bg-gray-100 transition-colors">
                            📊 Save Result
                        </button>
                        <button className="w-full p-3 text-left rounded-lg hover:bg-gray-100 transition-colors">
                            📄 Export PDF
                        </button>
                        <button className="w-full p-3 text-left rounded-lg hover:bg-gray-100 transition-colors">
                            🔗 Share
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Content */}
        {content && (
            <article className="prose lg:prose-xl max-w-none bg-white p-8 rounded-2xl shadow-lg">
                <ReactMarkdown>{content}</ReactMarkdown>
            </article>
        )}
    </div>
  );
}
EOF

    # Crea directory content
    mkdir -p "content/$lang/$category_slug"
    
    echo "✅ Created structure for $lang/$category_slug ($category_name)"
}

# Crea layout per ogni lingua
create_language_layout() {
    local lang=$1
    local site_title=$2
    local site_description=$3
    
    mkdir -p "app/$lang"
    
    cat > "app/$lang/layout.tsx" << EOF
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"], display: 'swap' });

export const metadata: Metadata = {
  title: {
    default: "$site_title",
    template: "%s | SoCalSolver",
  },
  description: "$site_description",
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={inter.className}>
      <Header lang="$lang" />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer lang="$lang" />
    </div>
  );
}
EOF
}

# Crea homepage per ogni lingua
create_language_homepage() {
    local lang=$1
    shift
    local categories=("$@")
    
    cat > "app/$lang/page.tsx" << EOF
import Link from 'next/link';
import fs from 'fs/promises';
import path from 'path';

async function getCategories() {
    const categoriesPath = path.join(process.cwd(), 'app', '$lang');
    try {
        const entries = await fs.readdir(categoriesPath, { withFileTypes: true });
        return entries
            .filter(entry => entry.isDirectory() && !entry.name.startsWith('[') && !entry.name.startsWith('('))
            .map(entry => {
                const name = entry.name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                return { name, slug: entry.name };
            });
    } catch (error) {
        return [];
    }
}

export default async function HomePage() {
  const categories = await getCategories();

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-r from-ocean-teal-dark to-ocean-teal text-white rounded-2xl">

        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          SoCalSolver Professional
        </h1>
        <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto mb-8">
          Professional calculators for business, finance, real estate and much more
        </p>
        <div className="flex justify-center space-x-4">
          <span className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm">
            ✨ 1500+ Calculators
          </span>
          <span className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm">
            📊 Interactive Charts
          </span>
          <span className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm">
            🎯 Precise Results
          </span>
        </div>
      </section>
      
      {/* Categories Grid */}
      <section>
        <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">Browse by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
                 <Link 
                   key={cat.slug} 
                   href={\`/$lang/\${cat.slug}\`} 
                   className="group block p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                 >
                    <div className="text-center">
                      <div className="text-4xl mb-4">📊</div>
                      <h3 className="font-bold text-xl text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                        {cat.name}
                      </h3>
                      <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    </div>
                </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
EOF
}

echo "🔧 Creating language structures..."

# INGLESE (16 categorie)
echo "🇬🇧 Creating English structure..."
create_language_layout "en" "SoCalSolver - Professional Online Calculators" "Professional online calculators for business, finance, health and much more."

categories_en=(
    "business-and-marketing:Business & Marketing"
    "digital-health-and-wellbeing:Digital Health & Wellbeing"
    "education-and-career:Education & Career"
    "finance-and-investment:Finance & Investment"
    "gaming-and-esports:Gaming & eSports"
    "health-and-sustainability:Health & Sustainability"
    "health-and-wellness:Health & Wellness"
    "lifestyle-and-entertainment:Lifestyle & Entertainment"
    "lifestyle-and-niche:Lifestyle & Niche"
    "professional-and-specialized:Professional & Specialized"
    "real-estate-and-housing:Real Estate & Housing"
    "sme-and-business:SME & Business"
    "savings-and-investment:Savings & Investment"
    "smart-home-and-technology:Smart Home & Technology"
    "sustainability-and-environment:Sustainability & Environment"
    "tax-and-freelance-uk-us-ca:Tax & Freelance (UK/US/CA)"
)

for category in "${categories_en[@]}"; do
    IFS=':' read -r slug name <<< "$category"
    create_category_structure "en" "$slug" "$name"
done

create_language_homepage "en" "${categories_en[@]}"

# SPAGNOLO (9 categorie)
echo "🇪🇸 Creating Spanish structure..."
create_language_layout "es" "SoCalSolver - Calculadoras Profesionales Online" "Calculadoras profesionales online para negocios, finanzas, salud y mucho más."

categories_es=(
    "automoviles-y-transporte:Automóviles y transporte"
    "bienes-raices-y-vivienda:Bienes Raíces y Vivienda"
    "educacion-y-universidad:Educación y Universidad"
    "impuestos-y-trabajo-autonomo:Impuestos y trabajo autónomo"
    "impuestos-y-trabajo-autonomo-avanzado:Impuestos y trabajo autónomo (avanzado)"
    "legal-y-administrativo:Legal y Administrativo"
    "miscelanea-y-vida-cotidiana:Miscelánea y vida cotidiana"
    "pymes-y-empresas:PYMES y Empresas"
    "salud-y-bienestar:Salud y bienestar"
)

for category in "${categories_es[@]}"; do
    IFS=':' read -r slug name <<< "$category"
    create_category_structure "es" "$slug" "$name"
done

create_language_homepage "es" "${categories_es[@]}"

# FRANCESE (9 categorie)
echo "🇫🇷 Creating French structure..."
create_language_layout "fr" "SoCalSolver - Calculatrices Professionnelles en Ligne" "Calculatrices professionnelles en ligne pour business, finance, santé et bien plus."

categories_fr=(
    "agriculture-et-alimentation:Agriculture et alimentation"
    "famille-et-vie-quotidienne:Famille et vie quotidienne"
    "fiscalite-et-emploi-independants:Fiscalité et emploi indépendants"
    "fiscalite-et-travail-independant:Fiscalité et travail indépendant"
    "immobilier-et-maison:Immobilier et maison"
    "loisirs-et-temps-libre:Loisirs et temps libre"
    "pme-et-entreprises:PME et entreprises"
    "voitures-et-transports:Voitures et transports"
    "epargne-et-investissements:Épargne et investissements"
)

for category in "${categories_fr[@]}"; do
    IFS=':' read -r slug name <<< "$category"
    create_category_structure "fr" "$slug" "$name"
done

create_language_homepage "fr" "${categories_fr[@]}"

# Aggiorna Footer.tsx per supportare traduzioni
echo "🔧 Updating Footer.tsx with multilingual support..."

cat > "components/layout/Footer.tsx" << 'EOF'
'use client';
import Link from 'next/link';

interface FooterProps {
  /** Codice lingua, ad esempio "it", "en", ecc. */
  lang: string;
}

/** Singola categoria mostrata nel footer. */
interface Category {
  name: string;
  slug: string;
  icon: string;
}

/** Lingue supportate dal language‑switcher. */
const LANGUAGES = [
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
] as const;

/**
 * Mappa delle categorie per lingua.
 */
const CATEGORIES: Record<string, Category[]> = {
  it: [
    { name: 'Fisco e Lavoro Autonomo', slug: 'fisco-e-lavoro-autonomo', icon: '💼' },
    { name: 'Immobiliare e Casa', slug: 'immobiliare-e-casa', icon: '🏠' },
    { name: 'Finanza Personale', slug: 'finanza-personale', icon: '💰' },
    { name: 'Veicoli e Trasporti', slug: 'veicoli-e-trasporti', icon: '🚗' },
    { name: 'Salute e Benessere', slug: 'salute-e-benessere', icon: '🏥' },
    { name: 'PMI e Impresa', slug: 'pmi-e-impresa', icon: '🏢' },
    { name: 'Risparmio e Investimenti', slug: 'risparmio-e-investimenti', icon: '📈' },
    { name: 'Matematica e Geometria', slug: 'matematica-e-geometria', icon: '📊' },
    { name: 'Conversioni', slug: 'conversioni', icon: '🔄' },
    { name: 'Famiglia e Vita Quotidiana', slug: 'famiglia-e-vita-quotidiana', icon: '👨‍👩‍👧‍👦' },
    { name: 'Agricoltura e Cibo', slug: 'agricoltura-e-cibo', icon: '🌾' },
    { name: 'Vita Quotidiana', slug: 'vita-quotidiana', icon: '📱' },
  ],
  en: [
    { name: 'Business & Marketing', slug: 'business-and-marketing', icon: '💼' },
    { name: 'Digital Health & Wellbeing', slug: 'digital-health-and-wellbeing', icon: '🏥' },
    { name: 'Education & Career', slug: 'education-and-career', icon: '🎓' },
    { name: 'Finance & Investment', slug: 'finance-and-investment', icon: '💰' },
    { name: 'Gaming & eSports', slug: 'gaming-and-esports', icon: '🎮' },
    { name: 'Health & Sustainability', slug: 'health-and-sustainability', icon: '🌱' },
    { name: 'Health & Wellness', slug: 'health-and-wellness', icon: '🏥' },
    { name: 'Lifestyle & Entertainment', slug: 'lifestyle-and-entertainment', icon: '🎭' },
    { name: 'Lifestyle & Niche', slug: 'lifestyle-and-niche', icon: '✨' },
    { name: 'Professional & Specialized', slug: 'professional-and-specialized', icon: '🔧' },
    { name: 'Real Estate & Housing', slug: 'real-estate-and-housing', icon: '🏠' },
    { name: 'SME & Business', slug: 'sme-and-business', icon: '🏢' },
    { name: 'Savings & Investment', slug: 'savings-and-investment', icon: '📈' },
    { name: 'Smart Home & Technology', slug: 'smart-home-and-technology', icon: '🏠' },
    { name: 'Sustainability & Environment', slug: 'sustainability-and-environment', icon: '🌍' },
    { name: 'Tax & Freelance (UK/US/CA)', slug: 'tax-and-freelance-uk-us-ca', icon: '💼' },
  ],
  es: [
    { name: 'Automóviles y transporte', slug: 'automoviles-y-transporte', icon: '🚗' },
    { name: 'Bienes Raíces y Vivienda', slug: 'bienes-raices-y-vivienda', icon: '🏠' },
    { name: 'Educación y Universidad', slug: 'educacion-y-universidad', icon: '🎓' },
    { name: 'Impuestos y trabajo autónomo', slug: 'impuestos-y-trabajo-autonomo', icon: '💼' },
    { name: 'Impuestos y trabajo autónomo (avanzado)', slug: 'impuestos-y-trabajo-autonomo-avanzado', icon: '💼' },
    { name: 'Legal y Administrativo', slug: 'legal-y-administrativo', icon: '⚖️' },
    { name: 'Miscelánea y vida cotidiana', slug: 'miscelanea-y-vida-cotidiana', icon: '📱' },
    { name: 'PYMES y Empresas', slug: 'pymes-y-empresas', icon: '🏢' },
    { name: 'Salud y bienestar', slug: 'salud-y-bienestar', icon: '🏥' },
  ],
  fr: [
    { name: 'Agriculture et alimentation', slug: 'agriculture-et-alimentation', icon: '🌾' },
    { name: 'Famille et vie quotidienne', slug: 'famille-et-vie-quotidienne', icon: '👨‍👩‍👧‍👦' },
    { name: 'Fiscalité et emploi indépendants', slug: 'fiscalite-et-emploi-independants', icon: '💼' },
    { name: 'Fiscalité et travail indépendant', slug: 'fiscalite-et-travail-independant', icon: '💼' },
    { name: 'Immobilier et maison', slug: 'immobilier-et-maison', icon: '🏠' },
    { name: 'Loisirs et temps libre', slug: 'loisirs-et-temps-libre', icon: '🎭' },
    { name: 'PME et entreprises', slug: 'pme-et-entreprises', icon: '🏢' },
    { name: 'Voitures et transports', slug: 'voitures-et-transports', icon: '🚗' },
    { name: 'Épargne et investissements', slug: 'epargne-et-investissements', icon: '📈' },
  ],
};

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
EOF

# Crea pagine di ricerca per ogni lingua
echo "🔍 Creating search pages for each language..."

for lang in en es fr; do
    mkdir -p "app/$lang/search"
    
    # Copia e adatta SearchClient.tsx
    cp "app/it/search/SearchClient.tsx" "app/$lang/search/SearchClient.tsx"
    sed -i "s|'/it'|'/$lang'|g" "app/$lang/search/SearchClient.tsx"
    
    # Copia page.tsx
    cp "app/it/search/page.tsx" "app/$lang/search/page.tsx"
done

echo ""
echo "✅ COMPLETATO! Struttura multilingue creata con successo"
echo "📁 Strutture create:"
echo "   🇮🇹 Italiano: 12 categorie (già esistente)"
echo "   🇬🇧 Inglese: 16 categorie"
echo "   🇪🇸 Spagnolo: 9 categorie" 
echo "   🇫🇷 Francese: 9 categorie"
echo ""
echo "🔧 Footer.tsx aggiornato con traduzioni complete"
echo "🔍 Pagine di ricerca create per tutte le lingue"
echo ""
echo "🚀 Prossimi passi:"
echo "   1. Testa la navigazione: npm run dev"
echo "   2. Popola le cartelle content/ con i contenuti"
echo "   3. Crea i componenti calcolatori per ogni lingua"
echo "   4. Aggiorna next.config.mjs se necessario"
EOF
