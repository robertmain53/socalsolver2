// lib/categories.ts
export type Lang = 'it' | 'en' | 'es' | 'fr';

export interface Category {
  name: string;
  slug: string;
  icon: string;
}

/**
 * Source of truth per le categorie, organizzate per lingua.
 * Importalo sia nel Footer sia nell'Header (mobile menu).
 */
export const CATEGORIES: Record<Lang, Category[]> = {
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
