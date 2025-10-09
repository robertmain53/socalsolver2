import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { generateSEOMetadata, SITE_CONFIG } from '@/lib/seo';
import { LANGUAGE_CONFIG } from '@/lib/i18n';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata = generateSEOMetadata({
  title: 'SoCalSolver - Calculateurs En Ligne Professionnels',
  description: SITE_CONFIG.description.fr,
  keywords: SITE_CONFIG.keywords.fr,
  lang: 'fr',
  path: '/fr',
  type: 'website',
});

export default function FrenchLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={LANGUAGE_CONFIG.fr.htmlLang} dir={LANGUAGE_CONFIG.fr.direction}>
      <body className={inter.className}>
        <Header lang="fr" />
        <main className="min-h-screen container mx-auto px-2 sm:px-4 py-6 sm:py-8">
          {children}
        </main>
        <Footer lang="fr" />
      </body>
    </html>
  );
}
