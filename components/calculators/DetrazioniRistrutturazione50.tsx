'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { CheckCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';


export const meta = {
  title: 'Calcolatore Detrazioni Ristrutturazione 50% (con Bonus Mobili)',
  description: 'Calcola la detrazione fiscale del 50% per le tue spese di ristrutturazione e Bonus Mobili. Genera una checklist documentale personalizzata e stima il tuo risparmio annuale.'
};

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
            "name": "Come funziona la detrazione per ristrutturazione del 50%?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "La detrazione per ristrutturazione edilizia consente di recuperare il 50% delle spese sostenute, fino a un massimale di 96.000 euro per unità immobiliare. Il rimborso avviene sotto forma di detrazione dall'IRPEF in 10 rate annuali di pari importo."
            }
          },
          {
            "@type": "Question",
            "name": "Il Bonus Mobili è collegato alla ristrutturazione?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sì, per usufruire del Bonus Mobili è indispensabile aver realizzato un intervento di ristrutturazione edilizia. La detrazione per mobili ed elettrodomestici è del 50% su una spesa massima di 5.000 euro (per il 2024), anch'essa ripartita in 10 anni."
            }
          },
          {
            "@type": "Question",
            "name": "Quali documenti sono necessari per ottenere le detrazioni?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "I documenti fondamentali includono: fatture delle spese, ricevute dei bonifici 'parlanti' (con causale specifica, codice fiscale del beneficiario e partita IVA del fornitore), titolo abilitativo dei lavori (CILA/SCIA) e visura catastale. Per i condomini è necessaria anche la delibera assembleare."
            }
          }
        ]
      })
    }}
  />
);

// --- [CODICE CORRETTO] Componente per il rendering del contenuto Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => {
        let processedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        processedText = processedText.replace(/_(.*?)_/g, '<em>$1</em>');
        return processedText;
    };

    const blocks = content.split('\n\n');

    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {blocks.map((block, index) => {
                const trimmedBlock = block.trim();
                if (!trimmedBlock) return null;

                if (trimmedBlock.startsWith('### **')) {
                    const innerHtml = processInlineFormatting(trimmedBlock.replace(/^### \*\*/, '').replace(/\*\*$/, ''));
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-4 text-gray-800" dangerouslySetInnerHTML={{ __html: innerHtml }} />;
                }

                if (trimmedBlock.startsWith('#### **')) {
                    const innerHtml = processInlineFormatting(trimmedBlock.replace(/^#### \*\*/, '').replace(/\*\*$/, ''));
                    return <h4 key={index} className="text-lg font-semibold mt-4 mb-3 text-gray-700" dangerouslySetInnerHTML={{ __html: innerHtml }} />;
                }

                if (trimmedBlock.startsWith('- ')) {
                    const items = trimmedBlock.split('\n').map(item => item.replace(/^- /, '').trim());
                    return (
                       <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
                           {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}
                       </ul>
                    );
                }
                
                return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
            })}
        </div>
    );
};


// --- Dati di configurazione del calcolatore ---
const calculatorData = {
  "slug": "detrazioni-ristrutturazione-50",
  "category": "Immobiliare e Casa",
  "title": "Calcolatore Detrazioni Ristrutturazione 50%",
  "lang": "it",
  "inputs": [
    { "id": "spesa_lavori", "label": "Spesa Totale Lavori di Ristrutturazione", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "tooltip": "Inserisci l'importo totale delle spese sostenute per i lavori edilizi, comprensivo di IVA, costi di progettazione e altre spese professionali." },
    { "id": "tipo_immobile", "label": "Tipo di Immobile", "type": "select" as const, "options": ["Unità Immobiliare Singola", "Parti Comuni Condominiali"], "tooltip": "Seleziona se l'intervento riguarda una singola abitazione o le parti comuni di un edificio condominiale. La scelta influisce sulla documentazione necessaria." },
    { "id": "include_bonus_mobili", "label": "Includi anche il Bonus Mobili?", "type": "boolean" as const, "tooltip": "Spunta questa casella se, a seguito della ristrutturazione, hai acquistato anche mobili o grandi elettrodomestici." },
    { "id": "spesa_mobili", "label": "Spesa per Mobili ed Elettrodomestici", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Inserisci il costo totale per l'acquisto di mobili e grandi elettrodomestici (classe A+ o superiore). Il massimale di spesa per questo bonus è 5.000 € (dato 2024).", "condition": "include_bonus_mobili" }
 ],
  "outputs": [
    { "id": "detrazione_totale_lavori", "label": "Detrazione Totale Lavori (in 10 anni)", "unit": "€" },
    { "id": "rata_annuale_lavori", "label": "Risparmio Fiscale Annuo (Lavori)", "unit": "€" },
    { "id": "detrazione_totale_mobili", "label": "Detrazione Totale Mobili (in 10 anni)", "unit": "€", "condition": "include_bonus_mobili" },
    { "id": "rata_annuale_mobili", "label": "Risparmio Fiscale Annuo (Mobili)", "unit": "€", "condition": "include_bonus_mobili" },
    { "id": "detrazione_complessiva", "label": "Detrazione Fiscale Complessiva", "unit": "€" },
    { "id": "rata_annuale_complessiva", "label": "Risparmio Fiscale Annuo Totale", "unit": "€" }
  ],
  "content": "### **Guida Completa al Bonus Ristrutturazione 50% e Bonus Mobili**\n\n**Come funziona, quali spese sono ammesse e come massimizzare il risparmio fiscale.**\n\nIl **Bonus Ristrutturazione** è una delle agevolazioni fiscali più importanti per chi desidera migliorare la propria abitazione. Permette di recuperare una parte significativa dei costi sostenuti attraverso una detrazione dall'imposta sul reddito (IRPEF).\n\nQuesto strumento ti aiuta a simulare il tuo beneficio fiscale e a capire quali documenti sono necessari. Ricorda, i risultati sono una stima: per una consulenza su misura, rivolgiti sempre a un professionista qualificato.\n\n### **Parte 1: Il Bonus Ristrutturazione al 50%**\n\nConsiste in una detrazione dall'IRPEF del **50%** delle spese sostenute per interventi di recupero del patrimonio edilizio.\n\n#### **Massimale di Spesa**\n\nIl limite massimo di spesa su cui calcolare la detrazione è di **96.000 euro** per singola unità immobiliare. Questo importo include sia i costi dei lavori sia le spese professionali (progettazione, perizie, oneri, IVA, etc.).\n\n#### **Modalità di Rimborso**\n\nLa detrazione viene ripartita in **10 quote annuali** di pari importo. Ad esempio, su una spesa di 50.000 €, la detrazione totale sarà di 25.000 €, rimborsata con una detrazione di 2.500 € all'anno dall'IRPEF per 10 anni.\n\n### **Parte 2: Il Bonus Mobili ed Elettrodomestici**\n\nQuesto bonus è strettamente collegato al primo. Per poterne usufruire, è **necessario** aver realizzato un intervento di ristrutturazione su cui si beneficia della detrazione del 50%.\n\n- **Aliquota e Massimale**: La detrazione è del **50%** su una spesa massima di **5.000 euro** (limite per l'anno 2024).\n- **Beni Acquistabili**: Mobili nuovi (cucine, letti, armadi, etc.) e grandi elettrodomestici di classe non inferiore alla A per i forni, E per lavatrici/asciugatrici, F per frigoriferi/congelatori.\n\n_Importante_: La data di inizio dei lavori di ristrutturazione deve essere **precedente** a quella in cui si acquistano i mobili.\n\n### **Parte 3: La Checklist dei Documenti**\n\nPer non avere problemi in fase di controllo da parte dell'Agenzia delle Entrate, è fondamentale conservare tutta la documentazione. I documenti principali sono:\n\n- **Titolo abilitativo**: A seconda del tipo di intervento, può essere la CILA (Comunicazione di Inizio Lavori Asseverata), la SCIA (Segnalazione Certificata di Inizio Attività) o il Permesso di Costruire.\n- **Fatture e Ricevute**: Tutte le fatture intestate a chi sostiene la spesa.\n- **Bonifico Parlante**: I pagamenti devono essere effettuati tramite bonifico bancario o postale 'parlante', che riporti la causale del versamento, il codice fiscale del beneficiario della detrazione e il numero di partita IVA del soggetto a favore del quale il bonifico è effettuato.\n- **Visura Catastale**: Per identificare correttamente l'immobile.\n\nPer gli interventi in **condominio**, è inoltre richiesta la **delibera dell'assemblea** che approva i lavori e la tabella di ripartizione delle spese."
};


const DetrazioniRistrutturazione50: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
      spesa_lavori: 50000,
      tipo_immobile: "Unità Immobiliare Singola",
      include_bonus_mobili: true,
      spesa_mobili: 4000
    };
    const [states, setStates] = useState<{[key: string]: any}>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({...prev, [id]: value}));
    };
    
    const handleReset = () => setStates(initialStates);

    const { calculatedOutputs, checklist } = useMemo(() => {
        const { spesa_lavori, include_bonus_mobili, spesa_mobili, tipo_immobile } = states;

        const MASSIMALE_LAVORI = 96000;
        const MASSIMALE_MOBILI = 5000;
        const ALIQUOTA = 0.50;
        const ANNI_RATE = 10;

        const spesa_ammissibile_lavori = Math.min(spesa_lavori, MASSIMALE_LAVORI);
        const detrazione_totale_lavori = spesa_ammissibile_lavori * ALIQUOTA;
        const rata_annuale_lavori = detrazione_totale_lavori / ANNI_RATE;

        let detrazione_totale_mobili = 0;
        let rata_annuale_mobili = 0;
        if (include_bonus_mobili && spesa_lavori > 0) {
            const spesa_ammissibile_mobili = Math.min(spesa_mobili, MASSIMALE_MOBILI);
            detrazione_totale_mobili = spesa_ammissibile_mobili * ALIQUOTA;
            rata_annuale_mobili = detrazione_totale_mobili / ANNI_RATE;
        }

        const detrazione_complessiva = detrazione_totale_lavori + detrazione_totale_mobili;
        const rata_annuale_complessiva = rata_annuale_lavori + rata_annuale_mobili;
        
        let checklist_items: { text: string; details: string; }[] = [];
        if (spesa_lavori > 0) {
            checklist_items = [
                { text: 'Titolo Abilitativo Lavori', details: 'CILA, SCIA o Permesso di Costruire, a seconda della natura dell\'intervento.' },
                { text: 'Fatture e Ricevute Fiscali', details: 'Tutte le fatture relative alle spese sostenute, intestate a chi beneficia della detrazione.' },
                { text: 'Pagamenti con Bonifico Parlante', details: 'Copia dei bonifici specifici per detrazioni, con causale, C.F. beneficiario e P.IVA fornitore.' },
                { text: 'Visura Catastale', details: 'Documento che attesta i dati catastali dell\'immobile oggetto di intervento.' }
            ];
            if (tipo_immobile === 'Parti Comuni Condominiali') {
                checklist_items.push({ text: 'Delibera Assembleare', details: 'Verbale dell\'assemblea condominiale che approva i lavori e la ripartizione delle spese.' });
            }
        }
        if (include_bonus_mobili && spesa_lavori > 0) {
            checklist_items.push({ text: 'Documentazione Bonus Mobili', details: 'Fatture di acquisto dei beni e ricevute di pagamento (bonifico, carte di credito/debito). Lo scontrino non basta se non riporta il C.F. dell\'acquirente.' });
        }


        return {
             calculatedOutputs: {
                detrazione_totale_lavori,
                rata_annuale_lavori,
                detrazione_totale_mobili,
                rata_annuale_mobili,
                detrazione_complessiva,
                rata_annuale_complessiva,
             },
             checklist: checklist_items
        };
    }, [states]);

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;
            if (!calcolatoreRef.current) return;
            const canvas = await html2canvas(calcolatoreRef.current, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${slug}_simulazione.pdf`);
        } catch (_e) { alert("Impossibile generare il PDF in questo ambiente."); }
    }, [slug]);



    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2">
                    <div ref={calcolatoreRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">Simula il tuo risparmio fiscale e genera la checklist dei documenti necessari.</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce una consulenza fiscale professionale. I massimali indicati sono basati sulla normativa vigente e potrebbero subire variazioni.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                            {inputs.map(input => {
                                 if (input.condition && !states[input.condition]) return null;

                                const inputLabel = (
                                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                        {input.label}
                                        {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                                    </label>
                                );
                                if (input.type === 'boolean') {
                                    return (
                                        <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-3 rounded-md bg-white border">
                                            <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                            <label className="text-sm font-medium text-gray-700" htmlFor={input.id}>{input.label}</label>
                                        </div>
                                    );
                                }
                                if (input.type === 'select') {
                                     return (
                                        <div key={input.id}>
                                            {inputLabel}
                                            <select id={input.id} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2">
                                                {input.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        </div>
                                     );
                                }
                                return (
                                    <div key={input.id}>
                                        {inputLabel}
                                        <div className="flex items-center gap-2">
                                            <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                                            {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 space-y-4">
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati della Simulazione</h2>
                            {outputs.map(output => {
                                 if (output.condition && !states[output.condition]) return null;
                                 if ((calculatedOutputs as any)[output.id] === 0 && output.id.includes('mobili')) return null;

                                 return(
                                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${['rata_annuale_complessiva'].includes(output.id) ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold ${['rata_annuale_complessiva'].includes(output.id) ? 'text-indigo-600' : 'text-gray-800'}`}>
                                        <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                                    </div>
                                </div>
                            )})}
                        </div>
                        
                         {checklist.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                                    <DocumentTextIcon className="h-6 w-6 mr-2 text-indigo-600" />
                                    Checklist Documentale Dinamica
                                </h3>
                                <div className="space-y-3">
                                    {checklist.map((item, index) => (
                                        <div key={index} className="flex items-start p-3 bg-green-50 rounded-lg border border-green-200">
                                            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-gray-800">{item.text}</p>
                                                <p className="text-xs text-gray-600">{item.details}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
                        <h2 className="font-semibold mb-2 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-1 gap-3">
                             <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta Riepilogo PDF</button>
                            <button onClick={handleReset} className="w-full text-sm border border-red-300 rounded-md px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida al Calcolo</h2>
                        <ContentRenderer content={content} />
                    </section>
                     <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/agevolazioni/detrristredil36/schinfodetrristredil36" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Ristrutturazioni edilizie</a></li>
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/agevolazioni/bonus-mobili/scheda-informativa-bonus-mobili" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Bonus Mobili</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default DetrazioniRistrutturazione50;