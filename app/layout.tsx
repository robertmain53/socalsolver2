import type { ReactNode } from 'react';
import './globals.css';

/**
 * Root layout - DO NOT add <html> or <body> tags here!
 * Language-specific layouts (/it, /en, /es, /fr) handle those
 * to ensure correct lang attribute for each language.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
