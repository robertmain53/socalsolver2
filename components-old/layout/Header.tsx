'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Script from 'next/script';
import { CATEGORIES, type Lang, type Category } from '@/lib/categories';

export type HeaderProps = {
  lang: Lang; // 'it' | 'en' | 'es' | 'fr'
};

const GOOGLE_CX = '2410972eee36045f5';

export default function Header({ lang }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [cseReady, setCseReady] = useState(false);
  const renderedOnce = useRef(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const categories: Category[] = CATEGORIES[lang] ?? CATEGORIES.it;

  // i18n placeholder
  const placeholder =
    lang === 'it' ? 'Cerca calcolatori…' :
    lang === 'es' ? 'Buscar calculadoras…' :
    lang === 'fr' ? 'Rechercher des calculateurs…' :
    'Search calculators…';

  // Close with ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!isOpen) return;
      const target = e.target as Node;
      if (panelRef.current && !panelRef.current.contains(target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [isOpen]);

  // Listen for Google CSE ready
  useEffect(() => {
    const onReady = () => setCseReady(true);
    window.addEventListener('gcse-ready', onReady);
    // Fallback: if script already loaded
    if ((window as any).google?.search?.cse?.element?.render) setCseReady(true);
    return () => window.removeEventListener('gcse-ready', onReady);
  }, []);

  // Render the searchbox once when panel opens and CSE is ready
  useEffect(() => {
    if (!isOpen || !cseReady || renderedOnce.current) return;

    const g = (window as any).google;
    const container = document.getElementById('gcse-searchbox');
    if (!container || !g?.search?.cse?.element?.render) return;

    // Clear (safety) before render
    container.innerHTML = '';

    g.search.cse.element.render({
      div: 'gcse-searchbox',
      tag: 'searchbox-only',
      attributes: {
        resultsUrl: '/search',
        newWindow: false,
        queryParameterName: 'q',
        enableAutoComplete: true,
        autoCompleteMaxCompletions: 5,
        autoCompleteMatchType: 'any',
        mobileLayout: 'responsive',
        placeholder,
      },
    });

    renderedOnce.current = true;
  }, [isOpen, cseReady, placeholder]);

  return (
    <>
      {/* Load CSE config FIRST and emit a custom ready event */}
      <Script id="gcse-config" strategy="beforeInteractive">
        {`
          window.__gcse = {
            parsetags: 'explicit',
            callback: function() {
              window.dispatchEvent(new Event('gcse-ready'));
            }
          };
        `}
      </Script>

      {/* Load CSE library once */}
      <Script
        id="gcse"
        strategy="afterInteractive"
        src={`https://cse.google.com/cse.js?cx=${GOOGLE_CX}`}
      />

      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="container mx-auto px-2 py-2">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href={`/${lang}`} className="flex items-center space-x-5" aria-label="SoCalSolver Home">
              <Image
                src="/socal.png"
                alt="SoCalSolver Logo"
                width={72}
                height={72}
                className="rounded-full"
                priority
              />
            </Link>

            {/* Menu button */}
            <button
              onClick={() => setIsOpen(v => !v)}
              className="p-2 text-gray-700 hover:text-gray-900"
              aria-expanded={isOpen}
              aria-controls="global-menu"
              aria-label={isOpen ? 'Chiudi menu' : 'Apri menu'}
            >
              {isOpen ? <XMarkIcon className="w-7 h-7" /> : <Bars3Icon className="w-7 h-7" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Overlay + Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
          <div
            id="global-menu"
            ref={panelRef}
            className="
              absolute left-1/2 -translate-x-1/2 top-[72px]
              w-[calc(100%-1rem)] max-w-5xl
              bg-white shadow-xl rounded-2xl
              p-4 md:p-6
            "
            role="dialog"
            aria-modal="true"
          >
            {/* SEARCH */}
            <div className="mb-6">
              <div id="gcse-searchbox" className="w-full" />
              {!cseReady && (
                <div className="text-sm text-gray-500">Loading search…</div>
              )}
            </div>

            {/* CATEGORIES */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">
                {lang === 'it' ? 'Categorie' : lang === 'es' ? 'Categorías' : lang === 'fr' ? 'Catégories' : 'Categories'}
              </h3>
              <ul className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                {categories.map((cat) => (
                  <li key={cat.slug}>
                    <Link
                      href={`/${lang}/${cat.slug}`}
                      className="flex items-center px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="mr-2">{cat.icon}</span>
                      <span className="text-sm">{cat.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
