import { Lang } from '@/lib/categories';
import { generateSEOMetadata } from '@/lib/seo';
import { translations } from '@/lib/i18n';
import HomePageContent from '@/components/HomePageContent';

const LANG: Lang = 'es';

export async function generateMetadata() {
  const t = (translations as any)[LANG];
  return generateSEOMetadata({
    title: t.home.title,
    description: t.home.description,
    lang: LANG,
    path: `/${LANG}`,
  });
}

export default function HomePage() {
  return <HomePageContent lang={LANG} />;
}