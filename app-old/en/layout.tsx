// app/en/layout.tsx
import type { ReactNode } from 'react';
import Header from "@/components/layout/Header";
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header lang="en" />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
