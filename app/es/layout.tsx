import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { generateSEOMetadata, SITE_CONFIG } from '@/lib/seo';
import { LANGUAGE_CONFIG } from '@/lib/i18n';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata = generateSEOMetadata({
  title: 'SoCalSolver - Calculadoras Online Profesionales',
  description: SITE_CONFIG.description.es,
  keywords: SITE_CONFIG.keywords.es,
  lang: 'es',
  path: '/es',
  type: 'website',
});

export default function SpanishLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={LANGUAGE_CONFIG.es.htmlLang} dir={LANGUAGE_CONFIG.es.direction}>
      <body className={inter.className}>
        <Header lang="es" />
        <main className="min-h-screen container mx-auto px-2 sm:px-4 py-6 sm:py-8">
          {children}
        </main>
        <Footer lang="es" />
      </body>
    </html>
  );
}
