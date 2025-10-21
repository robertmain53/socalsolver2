import { Suspense } from 'react';
import { Lang } from '@/lib/categories';
import { generateSEOMetadata } from '@/lib/seo';
import SearchPageContent from '@/components/calculators/SearchPageContentProps';

const LANG: Lang = 'fr';

export async function generateMetadata() {
  return generateSEOMetadata({
    title: 'Résultats de Recherche',
    description: 'Résultats de recherche pour les calculateurs sur SoCalSolver.',
    lang: LANG,
    path: `/${LANG}/search`,
  });
}

export default function SearchPage() {
  return <Suspense fallback={<div>Chargement...</div>}><SearchPageContent lang={LANG} /></Suspense>;
}