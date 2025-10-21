import { Suspense } from 'react';
import { Lang } from '@/lib/categories';
import { generateSEOMetadata } from '@/lib/seo';
import SearchPageContent from '@/components/calculators/SearchPageContent';

const LANG: Lang = 'it';

export async function generateMetadata() {
  return generateSEOMetadata({
    title: 'Risultati della Ricerca',
    description: 'Risultati della ricerca per i calcolatori su SoCalSolver.',
    lang: LANG,
    path: `/${LANG}/search`,
  });
}

export default function SearchPage() {
  return <Suspense fallback={<div>Caricamento...</div>}><SearchPageContent lang={LANG} /></Suspense>;
}