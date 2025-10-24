'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Check, X, ArrowRight, Info } from 'lucide-react';

export const meta = {
  title: 'Confronto Conti Deposito Titoli e Trading',
  description: 'Trova il miglior conto per investire. Confronta Fineco, Directa, Scalable Capital e altri per costi, commissioni e strumenti disponibili.'
};

// --- DATI DEI CONTI (sintetizzati dalle fonti fornite) ---
// Nota: Questi dati sono esemplificativi e andrebbero aggiornati periodicamente.
const accountData = [
  {
    id: 1,
    name: 'Fineco Bank',
    logoUrl: 'https://logo.clearbit.com/finecobank.com',
    type: 'Banca con Trading',
    bestFor: ['Principianti', 'Tuttofare'],
    tags: ['Regime Amministrato', 'Banca Solida', 'Piattaforma Completa'],
    description: 'La soluzione unica per banking e trading. Piattaforma robusta e completa, ideale per chi vuole tutti i servizi in un unico posto.',
    fees: {
      canone: 'Gratuito per il primo anno, poi azzerabile con condizioni (es. under 30, accredito stipendio, fondo pensione).',
      commissions: 'Commissioni fisse e decrescenti in base all\'operatività. Tipicamente 19€ o 9,95€ per eseguito, riducibili a 2,95€.',
      bollo: 'Standard di legge (0,20%)'
    },
    tradableAssets: ['Azioni', 'Obbligazioni', 'ETF', 'Fondi', 'Opzioni', 'Futures', 'CFD'],
    pros: ['Piattaforma PowerDesk avanzata', 'Servizi bancari integrati', 'Regime fiscale amministrato'],
    cons: ['Commissioni non competitive per piccoli importi', 'Canone potenzialmente a pagamento'],
    minDeposit: 0,
    userProfile: ['Principiante', 'Intermedio', 'Avanzato']
  },
  {
    id: 2,
    name: 'Directa',
    logoUrl: 'https://logo.clearbit.com/directa.it',
    type: 'Broker Online',
    bestFor: ['Risparmiatori', 'Trader Contenuti'],
    tags: ['Regime Amministrato', 'Pioniere Italiano', 'Commissioni Basse'],
    description: 'Il primo broker online italiano. Offre commissioni molto competitive, ideale per PAC in ETF e per chi cerca semplicità e risparmio.',
    fees: {
      canone: 'Gratuito. Nessun costo di tenuta conto.',
      commissions: 'Piani commissionali variabili o fissi molto bassi (es. 5€ o 1,5‰). Commissioni zero su molti ETF.',
      bollo: 'Standard di legge (0,20%)'
    },
    tradableAssets: ['Azioni', 'Obbligazioni', 'ETF', 'Fondi'],
    pros: ['Regime amministrato gratuito', 'Commissioni tra le più basse in Italia', 'Affidabilità e storia'],
    cons: ['Interfaccia un po\' datata', 'Offerta di strumenti meno ampia di altri'],
    minDeposit: 0,
    userProfile: ['Principiante', 'Intermedio']
  },
  {
    id: 3,
    name: 'Scalable Capital',
    logoUrl: 'https://logo.clearbit.com/scalable.capital',
    type: 'Robo-Advisor & Broker',
    bestFor: ['Risparmiatori', 'Investitori in ETF'],
    tags: ['Piani di Accumulo', 'Broker Moderno', 'Costi Prevedibili'],
    description: 'Broker tedesco moderno con piani tariffari chiari. Perfetto per chi vuole impostare PAC automatici su ETF con costi nulli o fissi.',
    fees: {
      canone: 'Piani da 0€ a 4,99€/mese. Il piano "PRIME Broker" a 4,99€/mese permette scambi illimitati senza commissioni.',
      commissions: 'Zero con i piani a pagamento. 0,99€ per operazione con il piano gratuito.',
      bollo: 'Standard di legge (0,20%)'
    },
    tradableAssets: ['Azioni', 'ETF', 'Fondi', 'Cripto'],
    pros: ['Ideale per PAC in ETF a costo zero', 'Piattaforma moderna e intuitiva', 'Costi fissi e trasparenti'],
    cons: ['Regime fiscale dichiarativo', 'Assistenza clienti non sempre in italiano'],
    minDeposit: 1,
    userProfile: ['Principiante', 'Intermedio']
  },
  {
    id: 4,
    name: 'DEGIRO',
    logoUrl: 'https://logo.clearbit.com/degiro.com',
    type: 'Broker Online',
    bestFor: ['Trader Contenuti', 'Risparmiatori'],
    tags: ['Commissioni Basse', 'Accesso Globale'],
    description: 'Broker olandese noto per le sue commissioni estremamente competitive. Offre accesso a un vasto numero di mercati internazionali.',
    fees: {
        canone: 'Gratuito. Nessun costo di tenuta conto.',
        commissions: 'Commissioni molto basse (es. 1-2€ per azioni Italia/USA). Molti ETF negoziabili senza commissioni (si applica una piccola commissione di gestione).',
        bollo: 'Standard di legge (0,20%)'
    },
    tradableAssets: ['Azioni', 'Obbligazioni', 'ETF', 'Opzioni', 'Futures'],
    pros: ['Commissioni tra le più competitive in Europa', 'Ampia selezione di mercati e ETF', 'Piattaforma semplice da usare'],
    cons: ['Regime fiscale dichiarativo', 'Il modello di business si basa sul prestito titoli'],
    minDeposit: 0,
    userProfile: ['Principiante', 'Intermedio', 'Avanzato']
  },
  {
    id: 5,
    name: 'Intesa Sanpaolo',
    logoUrl: 'https://logo.clearbit.com/intesasanpaolo.com',
    type: 'Banca Tradizionale',
    bestFor: ['Clienti Esistenti'],
    tags: ['Banca Solida', 'Consulenza'],
    description: 'Offerta di trading della più grande banca italiana. Adatta a chi è già cliente e preferisce l\'affidabilità e l\'integrazione con il proprio conto corrente.',
    fees: {
        canone: 'Variabile in base al tipo di conto (spesso incluso in pacchetti come XME Conto).',
        commissions: 'Generalmente più elevate rispetto ai broker online, con profili fissi o variabili.',
        bollo: 'Standard di legge (0,20%)'
    },
    tradableAssets: ['Azioni', 'Obbligazioni', 'ETF', 'Fondi'],
    pros: ['Solidità bancaria', 'Integrazione con i servizi di home banking', 'Possibilità di consulenza in filiale'],
    cons: ['Commissioni elevate', 'Piattaforma meno specializzata rispetto ai broker puri'],
    minDeposit: 0,
    userProfile: ['Principiante']
  }
];


// --- Componenti UI ---

const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

const AccountCard = ({ account, onCompare, isSelected }: any) => (
  <div className={`bg-white rounded-lg shadow-md border ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'} transition-all duration-300 flex flex-col`}>
    <div className="p-5 flex-grow">
      <div className="flex items-center gap-4 mb-4">
        <img src={account.logoUrl} alt={`${account.name} logo`} className="h-10 w-10 rounded-full bg-gray-100 p-1 object-contain" />
        <div>
          <h3 className="text-xl font-bold text-gray-800">{account.name}</h3>
          <p className="text-sm text-gray-500">{account.type}</p>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-4 h-16">{account.description}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {account.tags.map((tag: string) => (
          <span key={tag} className="text-xs font-medium bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">{tag}</span>
        ))}
      </div>
    </div>
    <div className="bg-gray-50 p-4 rounded-b-lg mt-auto">
      <button 
        onClick={() => onCompare(account.id)}
        className={`w-full text-sm font-semibold py-2 px-4 rounded-md transition-colors ${isSelected ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
      >
        {isSelected ? 'Rimuovi dal Confronto' : 'Confronta'}
      </button>
    </div>
  </div>
);

const CompareModal = ({ accounts, onClose }: any) => {
  if (accounts.length === 0) return null;

  const features = ['canone', 'commissions', 'bollo'];
  const featureLabels: { [key: string]: string } = {
      canone: 'Canone Conto',
      commissions: 'Commissioni Trading',
      bollo: 'Imposta di Bollo'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <header className="p-5 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Confronto Dettagliato</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors"><X size={28} /></button>
        </header>
        <div className="overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 p-6 gap-6">
             {/* Header con loghi */}
            <div className="hidden md:block md:col-span-3"></div>
            {accounts.map((acc: any) => (
              <div key={acc.id} className="md:col-span-3 text-center">
                <img src={acc.logoUrl} alt={`${acc.name} logo`} className="h-16 w-16 mx-auto rounded-full mb-2" />
                <h3 className="text-lg font-bold">{acc.name}</h3>
              </div>
            ))}
          </div>

          <div className="px-6 pb-6">
            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Costi Principali</h4>
            {features.map(feature => (
              <div key={feature} className="grid grid-cols-1 md:grid-cols-12 items-center border-b last:border-b-0 py-4">
                <div className="md:col-span-3 font-semibold text-gray-700 mb-2 md:mb-0">{featureLabels[feature]}</div>
                {accounts.map((acc: any) => (
                  <div key={acc.id} className="md:col-span-3 text-sm text-gray-600">{(acc.fees as any)[feature]}</div>
                ))}
              </div>
            ))}
          </div>

           <div className="px-6 pb-6">
            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3 mt-4">Caratteristiche</h4>
            <div className="grid grid-cols-1 md:grid-cols-12 items-start border-b py-4">
              <div className="md:col-span-3 font-semibold text-gray-700">Pro</div>
               {accounts.map((acc: any) => (
                  <ul key={acc.id} className="md:col-span-3 list-none space-y-2">
                    {acc.pros.map((pro: string) => <li key={pro} className="flex items-start gap-2 text-sm text-gray-600"><Check size={16} className="text-green-500 mt-1 flex-shrink-0" /><span>{pro}</span></li>)}
                  </ul>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 items-start py-4">
              <div className="md:col-span-3 font-semibold text-gray-700">Contro</div>
               {accounts.map((acc: any) => (
                  <ul key={acc.id} className="md:col-span-3 list-none space-y-2">
                    {acc.cons.map((con: string) => <li key={con} className="flex items-start gap-2 text-sm text-gray-600"><X size={16} className="text-red-500 mt-1 flex-shrink-0" /><span>{con}</span></li>)}
                  </ul>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const ComparaContiPage = () => {
  const [filters, setFilters] = useState({
    profile: 'Qualsiasi',
    asset: 'Qualsiasi'
  });
  const [compareList, setCompareList] = useState<number[]>([]);

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({...prev, [filterName]: value}));
  };

  const handleCompareToggle = (accountId: number) => {
    setCompareList(prev => {
      if (prev.includes(accountId)) {
        return prev.filter(id => id !== accountId);
      }
      if (prev.length < 3) {
        return [...prev, accountId];
      }
      // Opzionale: notifica che il limite è 3
      alert("Puoi confrontare al massimo 3 conti alla volta.");
      return prev;
    });
  };

  const filteredAccounts = useMemo(() => {
    return accountData.filter(acc => {
      const profileMatch = filters.profile === 'Qualsiasi' || acc.userProfile.includes(filters.profile);
      const assetMatch = filters.asset === 'Qualsiasi' || acc.tradableAssets.includes(filters.asset);
      return profileMatch && assetMatch;
    });
  }, [filters]);
  
  const compareAccountsData = useMemo(() => {
    return accountData.filter(acc => compareList.includes(acc.id));
  }, [compareList]);

  return (
    <>
      <style jsx global>{`
        @keyframes fade-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        
        {/* Sidebar dei Filtri */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Trova il tuo conto</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Che tipo di investitore sei?
                  <Tooltip text="Scegli il profilo che meglio ti descrive. 'Principiante' per chi inizia, 'Intermedio' per chi ha già esperienza, 'Avanzato' per trader esperti.">
                    <Info size={14} className="inline-block ml-2 text-gray-400 cursor-help" />
                  </Tooltip>
                </label>
                <select 
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={filters.profile}
                  onChange={(e) => handleFilterChange('profile', e.target.value)}
                >
                  <option>Qualsiasi</option>
                  <option>Principiante</option>
                  <option>Intermedio</option>
                  <option>Avanzato</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cosa vuoi negoziare principalmente?
                   <Tooltip text="Filtra i conti in base agli strumenti finanziari che offrono. Se sei interessato a un PAC, gli ETF sono la scelta più comune.">
                    <Info size={14} className="inline-block ml-2 text-gray-400 cursor-help" />
                  </Tooltip>
                </label>
                <select 
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={filters.asset}
                  onChange={(e) => handleFilterChange('asset', e.target.value)}
                >
                  <option>Qualsiasi</option>
                  <option>Azioni</option>
                  <option>ETF</option>
                  <option>Obbligazioni</option>
                  <option>Fondi</option>
                </select>
              </div>
            </div>
             <div className="mt-6 pt-4 border-t">
              <p className="text-sm text-gray-600">
                Hai selezionato <span className="font-bold text-indigo-600">{compareList.length}</span> su 3 conti per il confronto.
              </p>
             </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Confronta e Scegli il Conto Deposito Migliore</h1>
            <p className="text-gray-600 mt-2">Usa i filtri per trovare il conto più adatto a te. Seleziona fino a 3 opzioni per un confronto dettagliato.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAccounts.map(account => (
              <AccountCard 
                key={account.id} 
                account={account} 
                onCompare={handleCompareToggle}
                isSelected={compareList.includes(account.id)}
              />
            ))}
          </div>

          {filteredAccounts.length === 0 && (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-700">Nessun conto corrisponde ai filtri</h3>
              <p className="text-gray-500 mt-2">Prova a modificare i criteri di ricerca.</p>
            </div>
          )}
        </main>
      </div>
      
      {/* Bottone flottante per aprire il confronto */}
      {compareList.length > 0 && (
         <div className="sticky bottom-5 flex justify-center">
             <button
                 onClick={() => document.getElementById('compare-modal')?.classList.remove('hidden')}
                 className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-indigo-700 transition-all transform hover:scale-105 flex items-center gap-3"
             >
                 Confronta {compareList.length} Conti <ArrowRight size={20} />
             </button>
             {/* Il modale viene renderizzato qui ma controllato esternamente per semplicità */}
             <div id="compare-modal" className="hidden">
                 <CompareModal accounts={compareAccountsData} onClose={() => document.getElementById('compare-modal')?.classList.add('hidden')} />
             </div>
         </div>
      )}

       {/* Modale di confronto, gestito con un trucco per evitare state complessi */}
       {compareList.length > 0 && (
           <div id="compare-modal-wrapper">
               <CompareModal 
                   accounts={compareAccountsData} 
                   onClose={() => setCompareList([])} 
               />
           </div>
       )}
    </>
  );
};


export default ComparaContiPage;