import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { generateSEOMetadata, SITE_CONFIG, generateOrganizationSchema } from '@/lib/seo';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata = generateSEOMetadata({
  title: 'SoCalSolver - Professional Online Calculators',
  description: SITE_CONFIG.description.en,
  keywords: SITE_CONFIG.keywords.en,
  lang: 'en',
  path: '/',
  type: 'website',
});

export default function RootLayout({ children }: { children: ReactNode }) {
  const organizationSchema = generateOrganizationSchema();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Organization Schema */}
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/socal.png" />

        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#F9F5E9" />
        <meta name="msapplication-TileColor" content="#F26B2E" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
