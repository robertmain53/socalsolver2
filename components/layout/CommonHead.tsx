/**
 * Common <head> elements shared across all language layouts
 */
import Script from 'next/script';
import { generateOrganizationSchema } from '@/lib/seo';

export default function CommonHead() {
  const organizationSchema = generateOrganizationSchema();

  return (
    <>
      {/* Organization Schema */}
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />

      {/* Favicons */}
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
      <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />

      {/* Theme color for mobile browsers */}
      <meta name="theme-color" content="#F9F5E9" />
      <meta name="msapplication-TileColor" content="#F26B2E" />
    </>
  );
}
