import { Suspense } from 'react';
import { Lang } from '@/lib/categories';
import { generateSEOMetadata } from '@/lib/seo';
import SearchPageContent from '@/components/calculators/SearchPageContentProps';

const LANG: Lang = 'es';

export async function generateMetadata() {
  return generateSEOMetadata({
    title: 'Resultados de Búsqueda',
    description: 'Resultados de búsqueda para las calculadoras en SoCalSolver.',
    lang: LANG,
    path: `/${LANG}/search`,
  });
}