// lib/i18n.ts
import { Lang } from './categories';

export const SUPPORTED_LANGUAGES: Lang[] = ['it', 'en', 'es', 'fr'];

export const DEFAULT_LANGUAGE: Lang = 'it';

/**
 * Language configuration
 */
export const LANGUAGE_CONFIG: Record<
  Lang,
  {
    code: string;
    name: string;
    nativeName: string;
    locale: string;
    htmlLang: string;
    direction: 'ltr' | 'rtl';
  }
> = {
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    locale: 'it-IT',
    htmlLang: 'it',
    direction: 'ltr',
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    locale: 'en-US',
    htmlLang: 'en',
    direction: 'ltr',
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    locale: 'es-ES',
    htmlLang: 'es',
    direction: 'ltr',
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    locale: 'fr-FR',
    htmlLang: 'fr',
    direction: 'ltr',
  },
};

/**
 * Check if a language code is supported
 */
export function isSupportedLanguage(lang: string): lang is Lang {
  return SUPPORTED_LANGUAGES.includes(lang as Lang);
}

/**
 * Get language config or fallback to default
 */
export function getLanguageConfig(lang: string) {
  if (isSupportedLanguage(lang)) {
    return LANGUAGE_CONFIG[lang];
  }
  return LANGUAGE_CONFIG[DEFAULT_LANGUAGE];
}

/**
 * UI translations for common elements
 */
export const translations = {
  header: {
    menu: {
      it: 'Menu',
      en: 'Menu',
      es: 'Menú',
      fr: 'Menu',
    },
    openMenu: {
      it: 'Apri menu',
      en: 'Open menu',
      es: 'Abrir menú',
      fr: 'Ouvrir le menu',
    },
    closeMenu: {
      it: 'Chiudi menu',
      en: 'Close menu',
      es: 'Cerrar menú',
      fr: 'Fermer le menu',
    },
    search: {
      it: 'Cerca calcolatori…',
      en: 'Search calculators…',
      es: 'Buscar calculadoras…',
      fr: 'Rechercher des calculateurs…',
    },
    categories: {
      it: 'Categorie',
      en: 'Categories',
      es: 'Categorías',
      fr: 'Catégories',
    },
  },
  footer: {
    categories: {
      it: 'Categorie',
      en: 'Categories',
      es: 'Categorías',
      fr: 'Catégories',
    },
    languages: {
      it: 'Lingue',
      en: 'Languages',
      es: 'Idiomas',
      fr: 'Langues',
    },
    legal: {
      it: 'Legale',
      en: 'Legal',
      es: 'Legal',
      fr: 'Légal',
    },
    about: {
      it: 'Chi Siamo',
      en: 'About Us',
      es: 'Sobre Nosotros',
      fr: 'À Propos',
    },
    privacy: {
      it: 'Privacy',
      en: 'Privacy',
      es: 'Privacidad',
      fr: 'Confidentialité',
    },
    terms: {
      it: 'Termini di Servizio',
      en: 'Terms of Service',
      es: 'Términos de Servicio',
      fr: 'Conditions d\'Utilisation',
    },
    contact: {
      it: 'Contatti',
      en: 'Contact',
      es: 'Contacto',
      fr: 'Contact',
    },
    allRightsReserved: {
      it: 'Tutti i diritti riservati',
      en: 'All rights reserved',
      es: 'Todos los derechos reservados',
      fr: 'Tous droits réservés',
    },
    tagline: {
      it: 'Calcolatori professionali gratuiti per fisco, finanza e business',
      en: 'Free professional calculators for tax, finance and business',
      es: 'Calculadoras profesionales gratuitas para impuestos, finanzas y negocios',
      fr: 'Calculateurs professionnels gratuits pour fiscalité, finance et entreprise',
    },
  },
  calculator: {
    calculate: {
      it: 'Calcola',
      en: 'Calculate',
      es: 'Calcular',
      fr: 'Calculer',
    },
    reset: {
      it: 'Reimposta',
      en: 'Reset',
      es: 'Restablecer',
      fr: 'Réinitialiser',
    },
    result: {
      it: 'Risultato',
      en: 'Result',
      es: 'Resultado',
      fr: 'Résultat',
    },
    results: {
      it: 'Risultati',
      en: 'Results',
      es: 'Resultados',
      fr: 'Résultats',
    },
    tools: {
      it: 'Strumenti',
      en: 'Tools',
      es: 'Herramientas',
      fr: 'Outils',
    },
    saveResult: {
      it: '📊 Salva Risultato',
      en: '📊 Save Result',
      es: '📊 Guardar Resultado',
      fr: '📊 Sauvegarder le Résultat',
    },
    exportPDF: {
      it: '📄 Esporta PDF',
      en: '📄 Export PDF',
      es: '📄 Exportar PDF',
      fr: '📄 Exporter en PDF',
    },
    share: {
      it: '🔗 Condividi',
      en: '🔗 Share',
      es: '🔗 Compartir',
      fr: '🔗 Partager',
    },
    loading: {
      it: 'Caricamento…',
      en: 'Loading…',
      es: 'Cargando…',
      fr: 'Chargement…',
    },
  },
  relatedCalculators: {
    title: {
      it: 'Calcolatori Correlati',
      en: 'Related Calculators',
      es: 'Calculadoras Relacionadas',
      fr: 'Calculateurs Associés',
    },
    subtitle: {
      it: 'Altri strumenti utili nella categoria',
      en: 'Other useful tools in the category',
      es: 'Otras herramientas útiles en la categoría',
      fr: 'Autres outils utiles dans la catégorie',
    },
    newSuggestions: {
      it: 'Nuovi Suggerimenti',
      en: 'New Suggestions',
      es: 'Nuevas Sugerencias',
      fr: 'Nouvelles Suggestions',
    },
    freeCalculator: {
      it: 'Calcolatore gratuito',
      en: 'Free calculator',
      es: 'Calculadora gratuita',
      fr: 'Calculateur gratuit',
    },
    calculateNow: {
      it: 'Calcola ora',
      en: 'Calculate now',
      es: 'Calcular ahora',
      fr: 'Calculer maintenant',
    },
    viewAll: {
      it: 'Vedi tutti i calcolatori di questa categoria',
      en: 'View all calculators in this category',
      es: 'Ver todas las calculadoras de esta categoría',
      fr: 'Voir tous les calculateurs de cette catégorie',
    },
  },
  category: {
    calculators: {
      it: 'calcolatori disponibili',
      en: 'calculators available',
      es: 'calculadoras disponibles',
      fr: 'calculateurs disponibles',
    },
    viewCalculator: {
      it: 'Apri Calcolatore',
      en: 'Open Calculator',
      es: 'Abrir Calculadora',
      fr: 'Ouvrir le Calculateur',
    },
    backToHome: {
      it: 'Torna alla Home',
      en: 'Back to Home',
      es: 'Volver al Inicio',
      fr: 'Retour à l\'Accueil',
    },
  },
  home: {
    title: {
      it: 'Calcolatori Online Professionali',
      en: 'Professional Online Calculators',
      es: 'Calculadoras Online Profesionales',
      fr: 'Calculateurs En Ligne Professionnels',
    },
    subtitle: {
      it: 'Strumenti gratuiti per fisco, finanza, immobiliare e business',
      en: 'Free tools for tax, finance, real estate and business',
      es: 'Herramientas gratuitas para impuestos, finanzas, inmobiliaria y negocios',
      fr: 'Outils gratuits pour fiscalité, finance, immobilier et entreprise',
    },
    allCategories: {
      it: 'Tutte le Categorie',
      en: 'All Categories',
      es: 'Todas las Categorías',
      fr: 'Toutes les Catégories',
    },
    popularCalculators: {
      it: 'Calcolatori Popolari',
      en: 'Popular Calculators',
      es: 'Calculadoras Populares',
      fr: 'Calculateurs Populaires',
    },
    recentlyAdded: {
      it: 'Aggiunti di Recente',
      en: 'Recently Added',
      es: 'Añadidos Recientemente',
      fr: 'Ajoutés Récemment',
    },
  },
  breadcrumb: {
    home: {
      it: 'Home',
      en: 'Home',
      es: 'Inicio',
      fr: 'Accueil',
    },
  },
};

/**
 * Get translated text
 */
export function t(
  path: string,
  lang: Lang,
  defaultValue: string = ''
): string {
  const keys = path.split('.');
  let current: unknown = translations;

  for (const key of keys) {
    if (typeof current !== 'object' || current === null || !(key in current)) {
      return defaultValue;
    }
    current = (current as Record<string, unknown>)[key];
  }

  if (
    typeof current === 'object' &&
    current !== null &&
    lang in current &&
    typeof (current as Record<Lang, unknown>)[lang] === 'string'
  ) {
    return (current as Record<Lang, string>)[lang];
  }

  return defaultValue;
}
