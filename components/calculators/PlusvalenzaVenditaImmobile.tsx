'use client';

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

// --- Icona per i Tooltip ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 inline-block">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// --- Componente Tooltip ---
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// --- Dati Strutturati per SEO (JSON-LD) ---
const FaqSchema = () => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Quando si paga la plusvalenza sulla vendita di un immobile?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "La plusvalenza sulla vendita di un immobile è tassata se la vendita avviene entro 5 anni dall'acquisto. Sono esenti dalla tassazione gli immobili adibiti ad abitazione principale del venditore per la maggior parte del periodo di possesso e quelli ricevuti per successione."
            }
          },
          {
            "@type": "Question",
            "name": "A quanto ammonta l'imposta sulla plusvalenza immobiliare?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "L'imposta sulla plusvalenza immobiliare è pari al 26% della plusvalenza netta (differenza tra prezzo di vendita e prezzo di acquisto, al netto dei costi deducibili). Questa è un'imposta sostitutiva che può essere versata direttamente al notaio al momento del rogito."
            }
          },
          {
            "@type": "Question",
            "name": "Quali costi posso dedurre dal calcolo della plusvalenza?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "È possibile dedurre tutti i costi inerenti all'immobile, purché documentati. Tra questi rientrano: le imposte pagate all'acquisto (registro, IVA), le spese notarili, i costi di mediazione immobiliare e le spese sostenute per lavori di ristrutturazione e manutenzione straordinaria che hanno aumentato il valore dell'immobile."
            }
          }
        ]
      })
    }}
  />
);

// --- Componente per il rendering del contenuto Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {content.split('\n\n').map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) {
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-4 text-gray-800" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (trimmedBlock.startsWith('#### **')) {
                    return <h4 key={index} className="text-lg font-semibold mt-4 mb-3 text-gray-700" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (trimmedBlock.match(/^\d\.\s/)) {
                     const items = trimmedBlock.split('\n').map(item => item.replace(/^\d\.\s*/, ''));
                     return <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ol>;
                }
                if (trimmedBlock) return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                return null;
            })}
        </div>
    );
};

// --- Dati di configurazione del calcolatore ---
const calculatorData = {
  "slug": "plusvalenza-vendita-immobile",
  "title": "Calcolatore Avanzato Plusvalenza Immobiliare",
  "content": `### **Guida al Calcolo della Plusvalenza**\n\nLa **plusvalenza immobiliare** è il guadagno che si ottiene dalla vendita di un immobile a un prezzo superiore a quello di acquisto. Questo guadagno, in determinate condizioni, è soggetto a una **tassazione del 26%**. Questo strumento ti aiuta a calcolare l'imposta e a pianificare la tua vendita in modo consapevole.\n\n#### **1. Quando si applica la tassazione?**\n\nLa regola principale è il **periodo di possesso**. La plusvalenza è tassabile se vendi l'immobile **entro 5 anni** dalla data di acquisto. Se vendi dopo 5 anni, non dovrai pagare alcuna imposta sulla plusvalenza.\n\n#### **2. Esistono eccezioni?**\n\nSì, ci sono due importanti casi di esenzione, anche se vendi entro i 5 anni:\n\n* **Abitazione Principale**: Se l'immobile che vendi è stato la tua residenza principale (e del tuo nucleo familiare) per la maggior parte del tempo in cui ne sei stato proprietario.\n* **Successione**: Se hai ricevuto l'immobile tramite un'eredità, la plusvalenza sulla sua vendita non è mai tassata.\n\n#### **3. Come si calcola la base imponibile?**\n\nLa base su cui si applica l'imposta del 26% non è semplicemente la differenza tra vendita e acquisto. Puoi (e devi) sottrarre tutti i costi inerenti all'immobile:\n\n* **Prezzo di Acquisto**: Il costo originale dell'immobile.\n* **Costi Deducibili**: Qualsiasi spesa documentata sostenuta, come:\n    * Imposte pagate al momento dell'acquisto (IVA, imposta di registro, ecc.).\n    * Spese notarili per l'atto di acquisto.\n    * Costi di mediazione dell'agenzia immobiliare.\n    * Spese per lavori di ristrutturazione o manutenzione straordinaria che hanno aumentato il valore dell'immobile.\n\n**Formula**: _Plusvalenza Netta = Prezzo Vendita - (Prezzo Acquisto + Costi Deducibili)_`
};

type CalculatorMode = 'standard' | 'inverso' | 'scenario';

// --- Componente Principale del Calcolatore ---
export default function PlusvalenzaVenditaImmobile() {
    const { title, content, slug } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);
    
    const [mode, setMode] = useState<CalculatorMode>('standard');

    const initialStandardState = {
        prezzo_acquisto: 150000,
        prezzo_vendita: 200000,
        costi_deducibili: 10000,
        vendita_entro_5_anni: true,
        abitazione_principale: false,
    };
    const [standardState, setStandardState] = useState(initialStandardState);

    const initialInversoState = {
        prezzo_acquisto_inv: 150000,
        costi_deducibili_inv: 10000,
        guadagno_netto_desiderato: 30000,
    };
    const [inversoState, setInversoState] = useState(initialInversoState);

    const initialScenarioState = {
        // Scenario A
        prezzo_acquisto_a: 150000,
        prezzo_vendita_a: 200000,
        costi_deducibili_a: 10000,
        // Scenario B
        prezzo_acquisto_b: 150000,
        prezzo_vendita_b: 220000,
        costi_deducibili_b: 15000,
    };
    const [scenarioState, setScenarioState] = useState(initialScenarioState);

    const handleReset = () => {
        setStandardState(initialStandardState);
        setInversoState(initialInversoState);
        setScenarioState(initialScenarioState);
    };

    const calculatePlusvalenza = (prezzo_acquisto: number, prezzo_vendita: number, costi_deducibili: number, vendita_entro_5_anni: boolean, abitazione_principale: boolean) => {
        const plusvalenza_lorda = Math.max(0, prezzo_vendita - prezzo_acquisto);
        const plusvalenza_netta = Math.max(0, plusvalenza_lorda - costi_deducibili);
        
        const isTassabile = vendita_entro_5_anni && !abitazione_principale;
        const imposta = isTassabile ? plusvalenza_netta * 0.26 : 0;
        const messaggio_tassazione = !vendita_entro_5_anni ? "Non tassabile (vendita oltre 5 anni)." : (abitazione_principale ? "Non tassabile (abitazione principale)." : `Tassabile al 26%.`);
        const guadagno_netto = plusvalenza_netta - imposta;

        return { plusvalenza_lorda, plusvalenza_netta, imposta, guadagno_netto, messaggio_tassazione };
    };

    const standardOutputs = useMemo(() => {
        const { prezzo_acquisto, prezzo_vendita, costi_deducibili, vendita_entro_5_anni, abitazione_principale } = standardState;
        return calculatePlusvalenza(prezzo_acquisto, prezzo_vendita, costi_deducibili, vendita_entro_5_anni, abitazione_principale);
    }, [standardState]);

    const inversoOutputs = useMemo(() => {
        const { prezzo_acquisto_inv, costi_deducibili_inv, guadagno_netto_desiderato } = inversoState;
        const costo_totale = prezzo_acquisto_inv + costi_deducibili_inv;
        const prezzo_vendita_minimo = (guadagno_netto_desiderato / 0.74) + costo_totale;
        return { prezzo_vendita_minimo };
    }, [inversoState]);
    
    const scenarioOutputs = useMemo(() => {
        const scenario_a = calculatePlusvalenza(scenarioState.prezzo_acquisto_a, scenarioState.prezzo_vendita_a, scenarioState.costi_deducibili_a, true, false);
        const scenario_b = calculatePlusvalenza(scenarioState.prezzo_acquisto_b, scenarioState.prezzo_vendita_b, scenarioState.costi_deducibili_b, true, false);
        return { scenario_a, scenario_b };
    }, [scenarioState]);
    
    const chartData = [
      { name: 'Ripartizione Prezzo di Vendita', 'Prezzo Acquisto': standardState.prezzo_acquisto, 'Costi Deducibili': standardState.costi_deducibili, 'Guadagno Netto': standardOutputs.guadagno_netto, 'Imposta 26%': standardOutputs.imposta },
    ];
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

    // --- RENDER ---
    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                {/* Colonna Sinistra - Calcolatore */}
                <div className="lg:col-span-2">
                    <div ref={calcolatoreRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-6">Simula l'imposta, calcola il prezzo di vendita o confronta scenari.</p>
                        
                        {/* Tabs di Navigazione Modalità */}
                        <div className="flex border-b mb-6">
                            {(['standard', 'inverso', 'scenario'] as CalculatorMode[]).map(m => (
                                <button key={m} onClick={() => setMode(m)} className={`px-4 py-2 font-semibold text-sm -mb-px border-b-2 ${mode === m ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                                    {m === 'standard' ? 'Calcolo Standard' : m === 'inverso' ? 'Calcolo Inverso' : 'Confronto Scenari'}
                                </button>
                            ))}
                        </div>

                        {/* Contenuto Dinamico basato sulla modalità */}
                        {mode === 'standard' && (
                            <div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                                    {/* Input Standard */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700">Prezzo di Acquisto (€)</label>
                                        <input type="number" value={standardState.prezzo_acquisto} onChange={e => setStandardState(s => ({...s, prezzo_acquisto: Number(e.target.value)}))} className="w-full border-gray-300 rounded-md" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700">Prezzo di Vendita (€)</label>
                                        <input type="number" value={standardState.prezzo_vendita} onChange={e => setStandardState(s => ({...s, prezzo_vendita: Number(e.target.value)}))} className="w-full border-gray-300 rounded-md" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-1 text-gray-700">Costi Deducibili Documentati (€)</label>
                                        <input type="number" value={standardState.costi_deducibili} onChange={e => setStandardState(s => ({...s, costi_deducibili: Number(e.target.value)}))} className="w-full border-gray-300 rounded-md" />
                                    </div>
                                    <div className="md:col-span-2 space-y-3">
                                        <div className="flex items-center gap-3 p-2 rounded-md bg-white border">
                                            <input id="vendita_entro_5_anni" type="checkbox" className="h-5 w-5 rounded" checked={standardState.vendita_entro_5_anni} onChange={e => setStandardState(s => ({...s, vendita_entro_5_anni: e.target.checked}))} />
                                            <label htmlFor="vendita_entro_5_anni" className="text-sm font-medium text-gray-700">La vendita avviene entro 5 anni dall'acquisto?</label>
                                        </div>
                                        <div className="flex items-center gap-3 p-2 rounded-md bg-white border">
                                            <input id="abitazione_principale" type="checkbox" className="h-5 w-5 rounded" checked={standardState.abitazione_principale} onChange={e => setStandardState(s => ({...s, abitazione_principale: e.target.checked}))} />
                                            <label htmlFor="abitazione_principale" className="text-sm font-medium text-gray-700">L'immobile è stato la tua abitazione principale?</label>
                                        </div>
                                    </div>
                                </div>
                                {/* Risultati Standard */}
                                <div className="mt-8 space-y-4">
                                     <h2 className="text-xl font-semibold text-gray-700">Risultati Calcolo Standard</h2>
                                     <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"><span className="font-medium">Plusvalenza Lorda</span><span className="font-bold text-xl">{formatCurrency(standardOutputs.plusvalenza_lorda)}</span></div>
                                     <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"><span className="font-medium">Plusvalenza Netta Imponibile</span><span className="font-bold text-xl">{formatCurrency(standardOutputs.plusvalenza_netta)}</span></div>
                                     <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg border-l-4 border-red-400"><span className="font-medium">Imposta Sostitutiva (26%)</span><span className="font-bold text-xl text-red-600">{formatCurrency(standardOutputs.imposta)}</span></div>
                                     <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border-l-4 border-green-400"><span className="font-medium">Guadagno Netto dalla Vendita</span><span className="font-bold text-xl text-green-600">{formatCurrency(standardOutputs.guadagno_netto)}</span></div>
                                     <div className="text-center p-2 bg-blue-50 text-blue-800 rounded-md text-sm font-semibold">{standardOutputs.messaggio_tassazione}</div>
                                </div>
                                {/* Grafico */}
                                <div className="mt-8">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione del Prezzo di Vendita</h3>
                                    <div className="h-72 w-full bg-gray-50 p-2 rounded-lg">
                                        {isClient && (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={chartData} layout="vertical" stackOffset="expand">
                                                    <XAxis type="number" hide />
                                                    <YAxis type="category" dataKey="name" hide />
                                                    <ChartTooltip formatter={(value: number) => `${(value / standardState.prezzo_vendita * 100).toFixed(1)}% (${formatCurrency(value)})`} />
                                                    <Legend formatter={(value) => <span className="text-gray-700 text-sm">{value}</span>} />
                                                    <Bar dataKey="Guadagno Netto" stackId="a" fill="#10b981" />
                                                    <Bar dataKey="Imposta 26%" stackId="a" fill="#f87171" />
                                                    <Bar dataKey="Costi Deducibili" stackId="a" fill="#a5b4fc" />
                                                    <Bar dataKey="Prezzo Acquisto" stackId="a" fill="#6366f1" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {mode === 'inverso' && (
                             <div>
                                <p className="text-sm text-gray-600 mb-4 bg-slate-50 p-3 rounded-lg">Questa modalità calcola il prezzo minimo a cui devi vendere l'immobile per raggiungere un determinato guadagno netto, tenendo già conto della tassazione al 26%.</p>
                                <div className="grid grid-cols-1 md:grid-cols-1 gap-6 bg-slate-50 p-4 rounded-lg">
                                    {/* Input Inverso */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700">Guadagno Netto Desiderato (€)</label>
                                        <input type="number" value={inversoState.guadagno_netto_desiderato} onChange={e => setInversoState(s => ({...s, guadagno_netto_desiderato: Number(e.target.value)}))} className="w-full border-gray-300 rounded-md" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700">Prezzo di Acquisto (€)</label>
                                        <input type="number" value={inversoState.prezzo_acquisto_inv} onChange={e => setInversoState(s => ({...s, prezzo_acquisto_inv: Number(e.target.value)}))} className="w-full border-gray-300 rounded-md" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700">Costi Deducibili Documentati (€)</label>
                                        <input type="number" value={inversoState.costi_deducibili_inv} onChange={e => setInversoState(s => ({...s, costi_deducibili_inv: Number(e.target.value)}))} className="w-full border-gray-300 rounded-md" />
                                    </div>
                                </div>
                                {/* Risultati Inverso */}
                                <div className="mt-8">
                                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border-2 border-indigo-200 text-center">
                                        <h3 className="text-lg font-semibold text-indigo-900 mb-2">Prezzo Minimo di Vendita Suggerito</h3>
                                        <p className="text-4xl font-bold text-indigo-600">
                                            {formatCurrency(inversoOutputs.prezzo_vendita_minimo)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {mode === 'scenario' && (
                            <div>
                                <p className="text-sm text-gray-600 mb-4 bg-slate-50 p-3 rounded-lg">Confronta fianco a fianco i risultati di due diversi scenari di vendita per prendere la decisione migliore.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Scenario A */}
                                    <div className="bg-slate-50 p-4 rounded-lg space-y-4">
                                        <h3 className="font-bold text-lg text-center text-gray-700">Scenario A</h3>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600">Prezzo Vendita</label>
                                            <input type="number" value={scenarioState.prezzo_vendita_a} onChange={e => setScenarioState(s => ({...s, prezzo_vendita_a: Number(e.target.value)}))} className="w-full border-gray-300 rounded-md text-sm" />
                                        </div>
                                         <div>
                                            <label className="block text-xs font-medium text-gray-600">Costi Deducibili</label>
                                            <input type="number" value={scenarioState.costi_deducibili_a} onChange={e => setScenarioState(s => ({...s, costi_deducibili_a: Number(e.target.value)}))} className="w-full border-gray-300 rounded-md text-sm" />
                                        </div>
                                        <div className="mt-4 pt-4 border-t space-y-2">
                                            <div className="flex justify-between text-sm"><span className="font-semibold">Imposta:</span> <span className="font-bold text-red-600">{formatCurrency(scenarioOutputs.scenario_a.imposta)}</span></div>
                                            <div className="flex justify-between text-sm"><span className="font-semibold">Netto:</span> <span className="font-bold text-green-600">{formatCurrency(scenarioOutputs.scenario_a.guadagno_netto)}</span></div>
                                        </div>
                                    </div>
                                    {/* Scenario B */}
                                    <div className="bg-slate-50 p-4 rounded-lg space-y-4">
                                         <h3 className="font-bold text-lg text-center text-gray-700">Scenario B</h3>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600">Prezzo Vendita</label>
                                            <input type="number" value={scenarioState.prezzo_vendita_b} onChange={e => setScenarioState(s => ({...s, prezzo_vendita_b: Number(e.target.value)}))} className="w-full border-gray-300 rounded-md text-sm" />
                                        </div>
                                         <div>
                                            <label className="block text-xs font-medium text-gray-600">Costi Deducibili</label>
                                            <input type="number" value={scenarioState.costi_deducibili_b} onChange={e => setScenarioState(s => ({...s, costi_deducibili_b: Number(e.target.value)}))} className="w-full border-gray-300 rounded-md text-sm" />
                                        </div>
                                        <div className="mt-4 pt-4 border-t space-y-2">
                                            <div className="flex justify-between text-sm"><span className="font-semibold">Imposta:</span> <span className="font-bold text-red-600">{formatCurrency(scenarioOutputs.scenario_b.imposta)}</span></div>
                                            <div className="flex justify-between text-sm"><span className="font-semibold">Netto:</span> <span className="font-bold text-green-600">{formatCurrency(scenarioOutputs.scenario_b.guadagno_netto)}</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Colonna Destra - Guida e Azioni */}
                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
                        <h2 className="font-semibold mb-2 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-1 gap-3">
                            <button onClick={handleReset} className="w-full text-sm border border-red-300 rounded-md px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 transition-colors">Reset Calcolatore</button>
                             <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mt-2">
                                <strong>Disclaimer:</strong> Questo strumento offre una stima a scopo puramente informativo e non sostituisce una consulenza fiscale professionale.
                            </div>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida Rapida</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/fabbricatiterreni/plusvalenze/schedainfo-plusvalenze" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Plusvalenze</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
}