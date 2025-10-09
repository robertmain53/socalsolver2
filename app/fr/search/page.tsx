import { Suspense } from 'react';
import SearchClient from './SearchClient';

/**
 * Se vuoi evitare che Next.js provi comunque a prerenderizzare questa pagina
 * puoi tenere la direttiva qui sotto.  In caso contrario, puoi rimuoverla:
 */
export const dynamic = 'force-dynamic';

export default function SearchPage() {
  return (
    <Suspense fallback={<p>Caricamento…</p>}>
      <SearchClient />
    </Suspense>
  );
}

