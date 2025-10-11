import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { generateSEOMetadata, SITE_CONFIG } from '@/lib/seo';
import { LANGUAGE_CONFIG } from '@/lib/i18n';
import { getRequestOrigin } from '@/lib/request-context';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export async function generateMetadata() {
  const origin = getRequestOrigin();
  return generateSEOMetadata({
    title: 'SoCalSolver - Professional Online Calculators',
    description: SITE_CONFIG.description.en,
    keywords: SITE_CONFIG.keywords.en,
    lang: 'en',
    path: '/en',
    type: 'website',
    origin,
  });
}

export default function EnglishLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={LANGUAGE_CONFIG.en.htmlLang} dir={LANGUAGE_CONFIG.en.direction}>
      <body className={inter.className}>
        <Header lang="en" />
        <main className="min-h-screen container mx-auto px-2 sm:px-4 py-6 sm:py-8">
          {children}
        </main>
        <Footer lang="en" />
      </body>
    </html>
  );
}
