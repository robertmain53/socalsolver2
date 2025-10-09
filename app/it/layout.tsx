import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { generateSEOMetadata, SITE_CONFIG } from '@/lib/seo';
import { LANGUAGE_CONFIG } from '@/lib/i18n';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata = generateSEOMetadata({
  title: 'SoCalSolver - Calcolatori Online Professionali',
  description: SITE_CONFIG.description.it,
  keywords: SITE_CONFIG.keywords.it,
  lang: 'it',
  path: '/it',
  type: 'website',
});

export default function ItalianLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={LANGUAGE_CONFIG.it.htmlLang} dir={LANGUAGE_CONFIG.it.direction}>
      <body className={inter.className}>
        <Header lang="it" />
        <main className="min-h-screen container mx-auto px-2 sm:px-4 py-6 sm:py-8">
          {children}
        </main>
        <Footer lang="it" />
      </body>
    </html>
  );
}
