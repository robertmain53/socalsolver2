'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

// --- Icona per i Tooltip (SVG inline) ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
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
            "name": "Come calcola le tasse un musicista in regime forfettario?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Un musicista o artista in regime forfettario calcola le tasse applicando un'imposta sostitutiva (5% o 15%) a un reddito imponibile. Questo si ottiene moltiplicando il fatturato per il coefficiente di redditività del 67% e sottraendo i contributi INPS versati."
            }
          },
          {
            "@type": "Question",
            "name": "Quali contributi paga un musicista con Partita IVA?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "I musicisti e artisti con Partita IVA come liberi professionisti sono tipicamente iscritti alla Gestione Separata INPS. Versano un'aliquota contributiva (attualmente intorno al 26,07%) calcolata sul loro reddito imponibile, con un minimale e un massimale annui."
            }
          },
          {
            "@type": "Question",
            "name": "È meglio il regime forfettario o quello ordinario per un artista?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "La scelta dipende dalle spese reali. Il forfettario è vantaggioso se le spese effettive sono inferiori al 33% del fatturato (la quota di spese forfettarie riconosciuta). Se le spese sono superiori, il regime ordinario, che permette di dedurre analiticamente tutti i costi, potrebbe essere più conveniente."
            }
          }
        ]
      })
    }}
  />
);

// --- Componente per il rendering del contenuto Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');
    const blocks = content.split('\n\n');
    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {blocks.map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) return <h3 key={index} className="text-xl font-bold mt-6 mb-4 text-gray-800" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                if (trimmedBlock.startsWith('#### **')) return <h4 key={index} className="text-lg font-semibold mt-4 mb-3 text-gray-700" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
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
  "slug": "tassazione-musicisti-artisti",
  "category": "Fisco e Lavoro Autonomo",
  "title": "Calcolatore Tassazione per Musicisti e Artisti",
  "lang": "it",
  "content": "### **Guida alla Tassazione per Musicisti e Artisti**\n\n**Analisi dei Regimi Fiscali, Contributi INPS e Strumenti di Simulazione**\n\nLa fiscalità per artisti e musicisti presenta diverse opzioni. Comprendere le differenze tra i regimi fiscali e il funzionamento della previdenza (INPS Gestione Separata e ex-ENPALS) è cruciale per una gestione serena della propria attività.\n\nQuesto strumento avanzato offre una **simulazione dettagliata** per aiutarti a stimare il tuo carico fiscale e a pianificare le tue finanze. Ricorda, i risultati sono una stima e **non sostituiscono la consulenza di un commercialista**.\n\n### **Parte 1: I Regimi Fiscali a Confronto**\n\nUn artista può operare principalmente in tre modi:\n\n#### **Regime Forfettario**\nIl più comune per chi inizia. Prevede una tassazione agevolata con un'imposta sostitutiva unica.\n* **Coefficiente di Redditività (Codice ATECO 90.03.09): 67%**. Lo Stato considera il 33% del tuo fatturato come spese forfettarie.\n* **Imposta Sostitutiva**: **5%** per i primi 5 anni (start-up), **15%** dopo.\n* _Vantaggi_: Semplicità, esenzione IVA, contabilità ridotta.\n\n#### **Regime Ordinario Semplificato**\nAdatto a chi ha spese deducibili elevate (superiori al 33% del fatturato).\n* **Tassazione**: Si applica l'**IRPEF** a scaglioni progressivi (dal 23% al 43%) sul reddito calcolato come *Fatturato - Spese Deducibili - Contributi INPS*.\n* _Vantaggi_: Deducibilità di tutte le spese inerenti all'attività.\n\n#### **Prestazione Occasionale**\nPer lavori sporadici e non continuativi, entro il limite di 5.000 € annui.\n* **Tassazione**: Si applica una **ritenuta d'acconto del 20%** sul compenso lordo.\n* _Vantaggi_: Nessuna Partita IVA, nessun contributo INPS sotto i 5.000 €.\n\n### **Parte 2: La Previdenza (INPS e ex-ENPALS)**\n\nL'iscrizione alla **Gestione Separata INPS** è obbligatoria per i professionisti senza una cassa specifica. L'aliquota è circa del **26,07%** (per il 2025) sul reddito imponibile. I contributi versati sono **interamente deducibili**.\n\nPer le esibizioni live, entra in gioco il certificato di agibilità **ex-ENPALS**. Si tratta di un contributo pari al 33% del compenso, di cui il **9,19%** è a carico del lavoratore e viene trattenuto dal committente. Questo importo può essere dedotto dal reddito.\n\n### **Parte 3: Esempio di Calcolo (Forfettario)**\n\n* **Fatturato Annuo**: 30.000 € (start-up)\n* **Reddito Imponibile Lordo (67%)**: 30.000 € * 67% = 20.100 €\n* **Contributi INPS (26,07%)**: 20.100 € * 26,07% = 5.240,07 €\n* **Reddito Imponibile Fiscale Netto**: 20.100 € - 5.240,07 € = 14.859,93 €\n* **Imposta Sostitutiva (5%)**: 14.859,93 € * 5% = 743,00 €\n* **Totale Uscite**: 5.240,07 € + 743,00 € = 5.983,07 €\n* **Reddito Netto Effettivo**: 30.000 € - 5.983,07 € = **24.016,93 €**"
};

// --- Funzione Helper per calcolo IRPEF progressivo ---
const calcolaIrpef = (reddito: number) => {
    const scaglioni = [
        { limite: 28000, aliquota: 0.23 },
        { limite: 50000, aliquota: 0.35 },
        { limite: Infinity, aliquota: 0.43 },
    ];
    let irpef = 0;
    let redditoResiduo = reddito;
    let limitePrecedente = 0;

    for (const scaglione of scaglioni) {
        if (redditoResiduo <= 0) break;
        const baseImponibileScaglione = Math.min(redditoResiduo, scaglione.limite - limitePrecedente);
        irpef += baseImponibileScaglione * scaglione.aliquota;
        redditoResiduo -= baseImponibileScaglione;
        limitePrecedente = scaglione.limite;
    }
    return irpef;
};


// --- Componente Principale del Calcolatore ---
const TassazioneMusicistiArtisti: React.FC = () => {
    const { slug, title, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
      fatturato_annuo: 30000,
      regime_fiscale: 'forfettario' as 'forfettario' | 'ordinario' | 'occasionale',
      nuova_attivita: true,
      spese_deducibili: 5000,
      acconti_versati_imposte: 0,
      acconti_versati_contributi: 0,
    };
    const [states, setStates] = useState(initialStates);

    const handleStateChange = (id: string, value: any) => setStates(prev => ({...prev, [id]: value}));
    const handleReset = () => setStates(initialStates);
    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

    // --- Logica di Calcolo ---
    const calculatedOutputs = useMemo(() => {
        const { fatturato_annuo, regime_fiscale, nuova_attivita, spese_deducibili } = states;
        
        // Costanti
        const COEFFICIENTE_FORFETTARIO = 0.67;
        const ALIQUOTA_INPS_GS = 0.2607; // Stima per il 2025
        const RITENUTA_ACCONTO = 0.20;

        let reddito_imponibile = 0, contributi_dovuti = 0, imposta_dovuta = 0, netto_annuo = 0;

        if (regime_fiscale === 'forfettario') {
            const reddito_imponibile_lordo = fatturato_annuo * COEFFICIENTE_FORFETTARIO;
            contributi_dovuti = reddito_imponibile_lordo * ALIQUOTA_INPS_GS;
            reddito_imponibile = reddito_imponibile_lordo - contributi_dovuti;
            const aliquota_imposta = nuova_attivita ? 0.05 : 0.15;
            imposta_dovuta = Math.max(0, reddito_imponibile * aliquota_imposta);
        } else if (regime_fiscale === 'ordinario') {
            const reddito_imponibile_lordo = fatturato_annuo - spese_deducibili;
            contributi_dovuti = reddito_imponibile_lordo * ALIQUOTA_INPS_GS;
            reddito_imponibile = reddito_imponibile_lordo - contributi_dovuti;
            imposta_dovuta = calcolaIrpef(reddito_imponibile);
        } else { // occasionale
            imposta_dovuta = fatturato_annuo * RITENUTA_ACCONTO;
            contributi_dovuti = 0; // Semplificato, no INPS sotto i 5k
            reddito_imponibile = fatturato_annuo;
        }

        const totale_uscite = contributi_dovuti + imposta_dovuta;
        netto_annuo = fatturato_annuo - totale_uscite;

        return {
            reddito_imponibile: reddito_imponibile < 0 ? 0 : reddito_imponibile,
            contributi_dovuti,
            imposta_dovuta,
            totale_tasse_e_contributi: totale_uscite,
            netto_annuo,
            netto_mensile: netto_annuo / 12,
        };
    }, [states]);

    const chartData = [
      { name: 'Ripartizione Fatturato', 'Netto Stimato': calculatedOutputs.netto_annuo, 'Contributi INPS': calculatedOutputs.contributi_dovuti, 'Imposte': calculatedOutputs.imposta_dovuta },
    ];

    // --- Funzionalità Avanzate ---
    const handleExportPDF = useCallback(async () => { /* ... logica PDF ... */ }, [slug]);
    const salvaRisultato = useCallback(() => { /* ... logica salvataggio ... */ }, [states, calculatedOutputs, slug, title]);

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                {/* Colonna Principale */}
                <div className="lg:col-span-2">
                    <div ref={calcolatoreRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">Simula tasse e contributi per la tua attività di musicista o artista professionista.</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce una consulenza fiscale professionale.</div>

                        {/* Input Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                           <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">Fatturato Lordo Annuo</label>
                                <div className="flex items-center gap-2">
                                <input type="number" min="0" step="1000" value={states.fatturato_annuo} onChange={(e) => handleStateChange('fatturato_annuo', Number(e.target.value))} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" />
                                <span className="text-sm text-gray-500">€</span>
                                </div>
                           </div>
                           <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">Regime Fiscale</label>
                               <select value={states.regime_fiscale} onChange={(e) => handleStateChange('regime_fiscale', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2">
                                   <option value="forfettario">Regime Forfettario</option>
                                   <option value="ordinario">Regime Ordinario</option>
                                   <option value="occasionale">Prestazione Occasionale</option>
                               </select>
                           </div>
                            {states.regime_fiscale === 'forfettario' && (
                                <div className="md:col-span-2 flex items-center gap-3 p-2 rounded-md bg-white border">
                                    <input id="nuova_attivita" type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600" checked={states.nuova_attivita} onChange={(e) => handleStateChange('nuova_attivita', e.target.checked)} />
                                    <label htmlFor="nuova_attivita" className="text-sm font-medium text-gray-700">Applichi il regime start-up (tassazione al 5%)?</label>
                                </div>
                            )}
                            {states.regime_fiscale === 'ordinario' && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Spese Deducibili Annuali Stimate</label>
                                     <div className="flex items-center gap-2">
                                        <input type="number" min="0" step="100" value={states.spese_deducibili} onChange={(e) => handleStateChange('spese_deducibili', Number(e.target.value))} className="w-full border-gray-300 rounded-md shadow-sm px-3 py-2" />
                                        <span className="text-sm text-gray-500">€</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Risultati */}
                        <div className="mt-8 space-y-4">
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati della Simulazione</h2>
                            {[
                                {id: 'reddito_imponibile', label: 'Reddito Imponibile Fiscale'},
                                {id: 'contributi_dovuti', label: 'Contributi INPS Dovuti'},
                                {id: 'imposta_dovuta', label: states.regime_fiscale === 'forfettario' ? 'Imposta Sostitutiva' : (states.regime_fiscale === 'ordinario' ? 'IRPEF' : 'Ritenuta d\'Acconto')},
                                {id: 'netto_annuo', label: 'Reddito Netto Annuo Stimato'},
                                {id: 'netto_mensile', label: 'Reddito Netto Mensile Stimato'},
                            ].map(output => (
                                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${['netto_annuo', 'netto_mensile'].includes(output.id) ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold ${['netto_annuo', 'netto_mensile'].includes(output.id) ? 'text-indigo-600' : 'text-gray-800'}`}>
                                        <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Grafico */}
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione del Fatturato Lordo</h3>
                            <div className="h-72 w-full bg-gray-50 p-2 rounded-lg">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart layout="vertical" data={chartData} stackOffset="expand">
                                            <XAxis type="number" hide />
                                            <YAxis type="category" dataKey="name" hide />
                                            <ChartTooltip formatter={(value, name, props) => `${(props.payload.value / states.fatturato_annuo * 100).toFixed(2)}% (${formatCurrency(props.payload.value)})`} />
                                            <Legend formatter={(value) => <span className="text-gray-700 text-sm">{value}</span>} />
                                            <Bar dataKey="Netto Stimato" stackId="a" fill="#4f46e5" />
                                            <Bar dataKey="Contributi INPS" stackId="a" fill="#818cf8" />
                                            <Bar dataKey="Imposte" stackId="a" fill="#fca5a5" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Colonna Laterale */}
                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni e Strumenti</h2>
                         <div className="grid grid-cols-2 gap-3 mb-4">
                            <button onClick={salvaRisultato} className="w-full text-sm border rounded-md px-3 py-2 hover:bg-gray-100">Salva</button>
                            <button onClick={handleExportPDF} className="w-full text-sm border rounded-md px-3 py-2 hover:bg-gray-100">Esporta PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full text-sm border-red-300 rounded-md px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700">Reset Calcolatore</button>
                        </div>
                        {/* Strumenti Innovativi */}
                        <div className="space-y-4">
                           <ToolObiettivoNetto />
                           <ToolConfrontoRegimi />
                           <ToolSingolaEsibizione />
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida al Calcolo</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.inps.it" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Sito Ufficiale INPS (Gestione Separata)</a></li>
                            <li><a href="https://www.agenziaentrate.gov.it" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};


// --- Componenti per Strumenti Innovativi ---

const ToolObiettivoNetto = () => {
    const [obiettivo, setObiettivo] = useState(25000);
    const [risultato, setRisultato] = useState<string | null>(null);

    const calcolaLordo = () => {
        // Logica semplificata per la stima inversa (ciclo iterativo)
        let lordoStimato = obiettivo * 1.6; // Stima iniziale
        for (let i = 0; i < 10; i++) {
            const redditoImponibileLordo = lordoStimato * 0.67;
            const contributi = redditoImponibileLordo * 0.2607;
            const redditoImponibileNetto = redditoImponibileLordo - contributi;
            const imposte = redditoImponibileNetto * 0.15; // Ipotizzando forfettario standard
            const nettoCalcolato = lordoStimato - contributi - imposte;
            const differenza = obiettivo - nettoCalcolato;
            lordoStimato += differenza * 0.8; // Correzione
        }
        setRisultato(`Per ottenere un netto di ${new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(obiettivo)}, dovresti fatturare circa **${new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(lordoStimato)}**.`);
    };

    return (
        <div className="p-3 border rounded-lg bg-slate-50">
            <h3 className="font-semibold text-sm text-gray-700 mb-2">Simulatore: Obiettivo Netto</h3>
             <input type="number" value={obiettivo} onChange={e => setObiettivo(Number(e.target.value))} className="w-full text-sm border-gray-300 rounded-md px-2 py-1 mb-2" />
             <button onClick={calcolaLordo} className="w-full text-sm bg-indigo-600 text-white rounded-md py-1 hover:bg-indigo-700">Calcola Lordo</button>
             {risultato && <p className="text-xs mt-2 text-gray-600" dangerouslySetInnerHTML={{__html: risultato}}></p>}
        </div>
    );
};

const ToolConfrontoRegimi = () => {
    // Logica di calcolo semplificata per il confronto
    const nettoForfettario = (30000 * 0.67 * (1 - 0.2607)) * (1 - 0.15);
    const nettoOrdinario = ((30000 - 5000) * (1 - 0.2607)) * (1 - 0.23);
    return (
         <div className="p-3 border rounded-lg bg-slate-50">
            <h3 className="font-semibold text-sm text-gray-700 mb-2">Confronto Rapido Regimi</h3>
            <p className="text-xs text-gray-600">Esempio (30k€ fatturato, 5k€ spese):</p>
            <ul className="text-xs list-disc pl-4 mt-1 text-gray-700">
                <li>**Forfettario:** ~ {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(nettoForfettario)}</li>
                <li>**Ordinario:** ~ {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(nettoOrdinario)}</li>
            </ul>
        </div>
    )
};

const ToolSingolaEsibizione = () => {
    const [cachet, setCachet] = useState(500);
    const nettoStimato = cachet * (1 - 0.20) - (cachet * 0.0919); // Ritenuta 20% e ENPALS a carico
     return (
        <div className="p-3 border rounded-lg bg-slate-50">
            <h3 className="font-semibold text-sm text-gray-700 mb-2">Calcolo Netto Singola Esibizione</h3>
             <input type="number" value={cachet} onChange={e => setCachet(Number(e.target.value))} className="w-full text-sm border-gray-300 rounded-md px-2 py-1 mb-2" placeholder="Compenso Lordo"/>
            <p className="text-xs text-gray-600">Da un cachet di **{new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(cachet)}**, il netto stimato (con R.A. e Agibilità) è circa:</p>
            <p className="text-center font-bold text-lg text-indigo-600 mt-1">{new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(nettoStimato)}</p>
        </div>
    )
};


export default TassazioneMusicistiArtisti;