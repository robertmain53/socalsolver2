import { Suspense } from 'react';
import { Lang } from '@/lib/categories';
import { generateSEOMetadata } from '@/lib/seo';
import SearchPageContent from '@/components/calculators/SearchPageContentProps';

const LANG: Lang = 'en';

export async function generateMetadata() {
  return generateSEOMetadata({
    title: 'Search Results',
    description: 'Search results for calculators on SoCalSolver.',
    lang: LANG,
  });
}

export default function SearchPage() {
  return <Suspense fallback={<div>Loading...</div>}><SearchPageContent lang={LANG} /></Suspense>;
}