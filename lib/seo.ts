// lib/seo.ts
import { Metadata } from 'next';
import { Lang } from './categories';

export const SITE_CONFIG = {
  name: 'SoCalSolver',
  url: 'https://www.socalsolver.com',
  description: {
    it: 'Calcolatori online gratuiti per fisco, finanza, immobiliare e business. Strumenti professionali per liberi professionisti e imprese.',
    en: 'Free online calculators for taxes, finance, real estate and business. Professional tools for freelancers and companies.',
    es: 'Calculadoras online gratuitas para impuestos, finanzas, inmobiliaria y negocios. Herramientas profesionales para autónomos y empresas.',
    fr: 'Calculateurs en ligne gratuits pour fiscalité, finance, immobilier et entreprise. Outils professionnels pour indépendants et sociétés.',
  },
  author: 'SoCalSolver Team',
  keywords: {
    it: ['calcolatori online', 'calcolo tasse', 'partita iva', 'regime forfettario', 'investimenti', 'immobiliare'],
    en: ['online calculators', 'tax calculator', 'freelance', 'investment calculator', 'real estate'],
    es: ['calculadoras online', 'calculadora impuestos', 'autónomos', 'inversiones', 'inmobiliaria'],
    fr: ['calculateurs en ligne', 'calcul impôts', 'auto-entrepreneur', 'investissements', 'immobilier'],
  },
  social: {
    twitter: '@socalsolver',
    facebook: 'https://facebook.com/socalsolver',
  },
};

interface GenerateMetadataParams {
  title: string;
  description: string;
  keywords?: string[];
  lang: Lang;
  path: string;
  image?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
}

/**
 * Generate complete metadata for a page with SEO best practices
 */
export function generateSEOMetadata({
  title,
  description,
  keywords = [],
  lang,
  path,
  image,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  noindex = false,
}: GenerateMetadataParams): Metadata {
  const url = `${SITE_CONFIG.url}${path}`;
  const fullTitle = `${title} | ${SITE_CONFIG.name}`;
  const ogImage = image || `${SITE_CONFIG.url}/og-image.png`;

  // Combine page-specific keywords with site-wide keywords
  const allKeywords = [...keywords, ...SITE_CONFIG.keywords[lang]];

  return {
    title: fullTitle,
    description,
    keywords: allKeywords.join(', '),
    authors: [{ name: author || SITE_CONFIG.author }],
    creator: SITE_CONFIG.author,
    publisher: SITE_CONFIG.name,
    robots: noindex
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    alternates: {
      canonical: url,
      languages: {
        'it-IT': `${SITE_CONFIG.url}/it${path.replace(`/${lang}`, '')}`,
        'en-US': `${SITE_CONFIG.url}/en${path.replace(`/${lang}`, '')}`,
        'es-ES': `${SITE_CONFIG.url}/es${path.replace(`/${lang}`, '')}`,
        'fr-FR': `${SITE_CONFIG.url}/fr${path.replace(`/${lang}`, '')}`,
      },
    },
    openGraph: {
      type,
      locale: getLocale(lang),
      url,
      title: fullTitle,
      description,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      site: SITE_CONFIG.social.twitter,
      creator: SITE_CONFIG.social.twitter,
      title: fullTitle,
      description,
      images: [ogImage],
    },
    other: {
      'application-name': SITE_CONFIG.name,
      'apple-mobile-web-app-title': SITE_CONFIG.name,
      'msapplication-TileColor': '#F26B2E',
      'theme-color': '#F9F5E9',
    },
  };
}

/**
 * Get locale string from Lang
 */
function getLocale(lang: Lang): string {
  const localeMap: Record<Lang, string> = {
    it: 'it_IT',
    en: 'en_US',
    es: 'es_ES',
    fr: 'fr_FR',
  };
  return localeMap[lang];
}

/**
 * Generate breadcrumb schema for SEO
 */
export function generateBreadcrumbSchema(
  crumbs: Array<{ name: string; path?: string }>,
  lang: Lang
) {
  const baseUrl = SITE_CONFIG.url;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      ...(crumb.path && { item: `${baseUrl}${crumb.path}` }),
    })),
  };
}

/**
 * Generate organization schema
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/socal.png`,
    description: SITE_CONFIG.description.en,
    sameAs: [SITE_CONFIG.social.facebook],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      availableLanguage: ['Italian', 'English', 'Spanish', 'French'],
    },
  };
}

/**
 * Generate WebApplication schema for calculators
 */
export function generateCalculatorSchema(params: {
  name: string;
  description: string;
  url: string;
  category: string;
  lang: Lang;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: params.name,
    description: params.description,
    url: params.url,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    featureList: [
      'Free calculator',
      'No registration required',
      'Instant results',
      'Mobile responsive',
    ],
    browserRequirements: 'Requires JavaScript',
    inLanguage: params.lang,
  };
}

/**
 * Generate HowTo schema for calculators
 */
export function generateHowToSchema(params: {
  name: string;
  description: string;
  steps: Array<{ name: string; text: string }>;
  totalTime?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to use ${params.name}`,
    description: params.description,
    ...(params.totalTime && { totalTime: params.totalTime }),
    step: params.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

/**
 * Generate FAQPage schema
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate Article schema for content pages
 */
export function generateArticleSchema(params: {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: params.headline,
    description: params.description,
    url: params.url,
    datePublished: params.datePublished,
    dateModified: params.dateModified || params.datePublished,
    author: {
      '@type': 'Organization',
      name: params.author || SITE_CONFIG.author,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}/socal.png`,
      },
    },
    ...(params.image && {
      image: {
        '@type': 'ImageObject',
        url: params.image,
      },
    }),
  };
}

/**
 * Generate CollectionPage schema for category pages
 */
export function generateCollectionSchema(params: {
  name: string;
  description: string;
  url: string;
  numberOfItems: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: params.name,
    description: params.description,
    url: params.url,
    breadcrumb: {
      '@type': 'BreadcrumbList',
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: params.numberOfItems,
    },
  };
}

/**
 * i18n text helpers
 */
export const i18n = {
  calculators: {
    it: 'Calcolatori',
    en: 'Calculators',
    es: 'Calculadoras',
    fr: 'Calculateurs',
  },
  categories: {
    it: 'Categorie',
    en: 'Categories',
    es: 'Categorías',
    fr: 'Catégories',
  },
  home: {
    it: 'Home',
    en: 'Home',
    es: 'Inicio',
    fr: 'Accueil',
  },
  relatedCalculators: {
    it: 'Calcolatori Correlati',
    en: 'Related Calculators',
    es: 'Calculadoras Relacionadas',
    fr: 'Calculateurs Associés',
  },
  calculate: {
    it: 'Calcola',
    en: 'Calculate',
    es: 'Calcular',
    fr: 'Calculer',
  },
  freeCalculator: {
    it: 'Calcolatore gratuito',
    en: 'Free calculator',
    es: 'Calculadora gratuita',
    fr: 'Calculateur gratuit',
  },
  viewAll: {
    it: 'Vedi tutti',
    en: 'View all',
    es: 'Ver todos',
    fr: 'Voir tout',
  },
};
