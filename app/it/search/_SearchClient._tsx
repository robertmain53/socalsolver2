'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/layout/Breadcrumb';

/* ----- Tipi ------------------------------------------------------------- */
interface SearchResult {
  name: string;
  slug: string;
  category: string;
}

/* ----- Componente ------------------------------------------------------- */
export default function SearchClient() {
  /* Parametro `q` dall’URL */
  const searchParams = useSearchParams();
  const query = useMemo(
    () => searchParams.get('q')?.trim() ?? '',
    [searchParams]
  );

  /* Stato dei risultati */
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  /* Effettua (mock) la ricerca ogni volta che cambia `query` */
  useEffect(() => {
    const fetchResults = () => {
      if (!query) {
        setResults([]);
        return;
      }

      setIsLoading(true);

      /* 👉 Sostituisci con una chiamata API reale */
      const mockData: SearchResult[] = [
        {
          name: 'Calcolatore Mutuo',
          slug: 'calcolo-mutuo',
          category: 'immobiliare-e-casa',
        },
        {
          name: 'Tasse Forfettario',
          slug: 'tasse-forfettario',
          category: 'fisco-e-lavoro-autonomo',
        },
        {
          name: 'IRES IRAP SRL',
          slug: 'calcolo-ires-irap-srl-srls',
          category: 'pmi-e-impresa',
        },
      ];

      const filtered = mockData.filter(
        ({ name, slug }) =>
          name.toLowerCase().includes(query.toLowerCase()) ||
          slug.toLowerCase().includes(query.toLowerCase())
      );

      setResults(filtered);
      setIsLoading(false);
    };

    fetchResults();
  }, [query]);

  /* Briciole di pane */
  const crumbs = [
    { name: 'Home', path: '/it' },
    { name: `Ricerca: "${query}"` },
  ];

  /* ----- UI ------------------------------------------------------------- */
  return (
    <div className="space-y-8">
      <Breadcrumb crumbs={crumbs} />

      <div className="rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-4 text-3xl font-bold">
          Risultati per "{query}"
        </h1>

        {isLoading ? (
          <p>Cercando…</p>
        ) : results.length ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map(({ slug, category, name }) => (
              <Link
                key={slug}
                href={`/it/${category}/${slug}`}
                className="block rounded-lg border p-6 transition-shadow hover:shadow-lg"
              >
                <h3 className="mb-2 text-xl font-bold">{name}</h3>
                <p className="text-gray-600">Categoria: {category}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p>Nessun risultato trovato per "{query}"</p>
        )}
      </div>
    </div>
  );
}
