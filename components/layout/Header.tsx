'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Script from 'next/script';
import { CATEGORIES, type Lang, type Category } from '@/lib/categories';
import { t } from '@/lib/i18n';

export type HeaderProps = {
  lang: Lang;
};

const GOOGLE_CX = '2410972eee36045f5';

export default function Header({ lang }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [cseReady, setCseReady] = useState(false);
  const renderedOnce = useRef(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const categories: Category[] = CATEGORIES[lang] ?? CATEGORIES.it;

  const placeholder = t('header.search', lang, 'Search calculators…');
  const openMenuLabel = t('header.openMenu', lang, 'Open menu');
  const closeMenuLabel = t('header.closeMenu', lang, 'Close menu');
  const categoriesLabel = t('header.categories', lang, 'Categories');

  // Close with ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
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
    if ((window as any).google?.search?.cse?.element?.render) setCseReady(true);
    return () => window.removeEventListener('gcse-ready', onReady);
  }, []);

  // Render the searchbox once when panel opens and CSE is ready
  useEffect(() => {
    if (!isOpen || !cseReady || renderedOnce.current) return;

    const g = (window as any).google;
    const container = document.getElementById('gcse-searchbox');
    if (!container || !g?.search?.cse?.element?.render) return;

    container.innerHTML = '';

    g.search.cse.element.render({
      div: 'gcse-searchbox',
      tag: 'searchbox-only',
      attributes: {
        resultsUrl: `/${lang}/search`,
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
  }, [isOpen, cseReady, placeholder, lang]);

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
        <nav className="container mx-auto px-2 sm:px-4 py-2" aria-label="Main navigation">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href={`/${lang}`}
              className="flex items-center space-x-3 sm:space-x-5"
              aria-label="SoCalSolver Home"
            >
              <Image
                src="/socal.png"
                alt="SoCalSolver Logo"
                width={60}
                height={60}
                className="rounded-full sm:w-[72px] sm:h-[72px]"
                priority
              />
            </Link>

            {/* Menu button */}
            <button
              onClick={() => setIsOpen((v) => !v)}
              className="p-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md"
              aria-expanded={isOpen}
              aria-controls="global-menu"
              aria-label={isOpen ? closeMenuLabel : openMenuLabel}
            >
              {isOpen ? (
                <XMarkIcon className="w-6 h-6 sm:w-7 sm:h-7" />
              ) : (
                <Bars3Icon className="w-6 h-6 sm:w-7 sm:h-7" />
              )}
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
              absolute left-1/2 -translate-x-1/2 top-16 sm:top-[72px]
              w-[96%] sm:w-[calc(100%-2rem)] max-w-5xl
              bg-white shadow-xl rounded-2xl
              p-3 sm:p-4 md:p-6
              max-h-[85vh] overflow-y-auto
            "
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            {/* SEARCH */}
            <div className="mb-4 sm:mb-6">
              <div id="gcse-searchbox" className="w-full" />
              {!cseReady && (
                <div className="text-sm text-gray-500">Loading search…</div>
              )}
            </div>

            {/* CATEGORIES */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3 text-sm sm:text-base">
                {categoriesLabel}
              </h3>
              <ul className="grid gap-2 grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                {categories.map((cat) => (
                  <li key={cat.slug}>
                    <Link
                      href={`/${lang}/${cat.slug}`}
                      className="flex items-center px-2 sm:px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="mr-2 text-base sm:text-lg">{cat.icon}</span>
                      <span className="text-xs sm:text-sm line-clamp-2">{cat.name}</span>
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
