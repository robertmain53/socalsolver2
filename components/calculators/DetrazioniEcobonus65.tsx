'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

export const meta = {
  title: 'Calcolatore Detrazioni Fiscali Ecobonus 65% (e 50%)',
  description: 'Simula il calcolo della detrazione fiscale per interventi di riqualificazione energetica (Ecobonus). Stima il tuo risparmio fiscale, la rata annuale e il risparmio energetico atteso.'
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
            "name": "Come funziona l'Ecobonus 65%?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "L'Ecobonus è una detrazione fiscale dall'IRPEF o IRES che viene ripartita in 10 rate annuali di pari importo. Permette di recuperare una parte delle spese sostenute per interventi di riqualificazione energetica degli edifici, come la sostituzione di infissi, l'installazione di pannelli solari o la coibentazione."
            }
          },
          {
            "@type": "Question",
            "name": "Quali sono i massimali di spesa per l'Ecobonus?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Ogni intervento ha un massimale di spesa specifico. Ad esempio, per la sostituzione degli infissi il massimale di detrazione è di 60.000 euro, mentre per la coibentazione dell'involucro opaco è di 92.307 euro (che corrisponde a una detrazione massima di 60.000 euro al 65%). Questo calcolatore mostra il massimale corretto in base all'intervento selezionato."
            }
          },
          {
            "@type": "Question",
            "name": "Cosa si intende per 'bonifico parlante'?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Il bonifico parlante è un metodo di pagamento obbligatorio per usufruire delle detrazioni fiscali. Deve contenere la causale del versamento con riferimento normativo, il codice fiscale del beneficiario della detrazione e il codice fiscale o Partita IVA della ditta che ha eseguito i lavori."
            }
          }
        ]
      })
    }}
  />
);

// --- Componente per il rendering del contenuto Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/_(.*?)_/g, '<em>$1</em>');
    };

    const blocks = content.split('\n\n');

    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {blocks.map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) {
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-4 text-gray-800" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (trimmedBlock.startsWith('#### **')) {
                    return <h4 key={index} className="text-lg font-semibold mt-4 mb-3 text-gray-700" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                 if (trimmedBlock.match(/^\d\.\s/)) {
                     const items = trimmedBlock.split('\n').map(item => item.replace(/^\d\.\s*/, ''));
                     return (
                        <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">
                            {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}
                        </ol>
                     );
                }
                if (trimmedBlock) {
                    return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                }
                return null;
            })}
        </div>
    );
};

// --- Tipi di intervento e relativi parametri ---
const tipiIntervento = {
  coibentazione: { label: "Coibentazione involucro (es. cappotto)", massimale: 92307.69, percentuale: 0.65, risparmioEnergeticoStimato: 0.18 },
  infissi: { label: "Sostituzione infissi e serramenti", massimale: 92307.69, percentuale: 0.50, risparmioEnergeticoStimato: 0.12 },
  pannelli_solari: { label: "Installazione pannelli solari termici", massimale: 92307.69, percentuale: 0.65, risparmioEnergeticoStimato: 0.25 },
  caldaia_biomassa: { label: "Caldaie a biomassa", massimale: 46153.84, percentuale: 0.65, risparmioEnergeticoStimato: 0.20 },
  schermature_solari: { label: "Schermature solari", massimale: 92307.69, percentuale: 0.50, risparmioEnergeticoStimato: 0.05 }
};

// --- Dati di configurazione del calcolatore ---
const calculatorData = {
  "slug": "detrazioni-ecobonus-65",
  "category": "Immobiliare e Casa",
  "title": "Calcolatore Avanzato Ecobonus",
  "lang": "it",
  "inputs": [
    { "id": "importo_spesa", "label": "Importo Totale Lavori (IVA inclusa)", "type": "number" as const, "unit": "€", "min": 0, "step": 500, "tooltip": "Inserisci la spesa totale che hai sostenuto per l'intervento, comprensiva di IVA." },
    { "id": "tipo_intervento", "label": "Tipologia di Intervento", "type": "select" as const, "options": tipiIntervento, "tooltip": "Seleziona il tipo di lavoro di riqualificazione energetica effettuato. Il massimale e la percentuale di detrazione cambieranno di conseguenza." }
  ],
  "outputs": [
    { "id": "massimale_spesa", "label": "Massimale di Spesa Ammesso", "unit": "€" },
    { "id": "detrazione_totale", "label": "Detrazione Fiscale Totale", "unit": "€" },
    { "id": "rata_annuale", "label": "Rata di Detrazione Annuale (per 10 anni)", "unit": "€" },
    { "id": "costo_reale_intervento", "label": "Costo Reale Finale dell'Intervento", "unit": "€" },
    { "id": "risparmio_energetico_annuo_stimato", "label": "Risparmio Energetico Annuo Stimato", "unit": "€" }
  ],
  "content": "### **Guida Completa all'Ecobonus: Come Funziona e Come Calcolarlo**\n\n**Massimizza il Tuo Risparmio Fiscale e Energetico**\n\nL'Ecobonus è uno degli incentivi fiscali più importanti per migliorare l'efficienza energetica della propria casa, riducendo i costi in bolletta e aumentando il valore dell'immobile. Si tratta di una **detrazione dall'IRPEF** (o IRES per le società) che lo Stato riconosce per le spese sostenute in specifici lavori di riqualificazione.\n\nQuesto calcolatore avanzato ti permette non solo di calcolare l'importo esatto della detrazione, ma anche di comprendere il **costo reale** del tuo investimento e stimare il **risparmio energetico** che potrai ottenere.\n\n### **Parte 1: I Concetti Chiave dell'Ecobonus**\n\nPer usare al meglio questo strumento, è utile capire tre concetti fondamentali:\n\n1.  **Percentuale di Detrazione**: È la quota della spesa che puoi recuperare. Per la maggior parte degli interventi è il **65%**, ma per alcuni, come infissi e schermature solari, è scesa al **50%**.\n\n2.  **Massimale di Spesa**: È l'importo massimo di spesa su cui puoi calcolare la detrazione per ogni singola unità immobiliare. Se spendi di più del massimale, potrai calcolare la detrazione solo fino a quella soglia.\n\n3.  **Ripartizione in 10 Anni**: La detrazione totale non viene rimborsata in un'unica soluzione, ma viene suddivisa in **10 rate annuali** di pari importo, che andranno a ridurre l'IRPEF che dovresti pagare ogni anno.\n\n### **Parte 2: Generatore di Causale per Bonifico Parlante**\n\nUn errore nella compilazione del bonifico può compromettere il diritto alla detrazione. Usa il nostro generatore per creare una causale corretta e sicura.\n\n_Questo strumento ti aiuterà a generare la causale corretta da inserire nel tuo bonifico bancario o postale._\n\n### **Parte 3: Esempio di Calcolo Passo-Passo**\n\nIpotizziamo di sostituire gli infissi (percentuale 50%) spendendo 15.000 €.\n\n1.  **Spesa Sostenuta**: 15.000 €\n\n2.  **Verifica Massimale**: Il massimale di spesa per gli infissi è 92.307,69 €. La nostra spesa è inferiore, quindi possiamo calcolare la detrazione su tutti i 15.000 €.\n\n3.  **Calcolo Detrazione Totale**: 15.000 € * 50% = **7.500 €**. Questo è l'importo totale che recupererai in 10 anni.\n\n4.  **Calcolo Rata Annuale**: 7.500 € / 10 anni = **750 €/anno**. Ogni anno, per 10 anni, pagherai 750 € in meno di tasse.\n\n5.  **Calcolo Costo Reale dell'Intervento**: 15.000 € (spesa) - 7.500 € (detrazione) = **7.500 €**. Questo è il costo effettivo dell'investimento.\n\n### **Parte 4: L'Innovazione: Stima del Risparmio Energetico**\n\nOltre al vantaggio fiscale, il vero obiettivo dell'Ecobonus è ridurre i consumi. Il nostro calcolatore, basandosi su dati statistici, fornisce una stima del **risparmio annuale che potresti vedere sulla tua bolletta** del gas o dell'elettricità. Questo ti aiuta a valutare il ritorno complessivo del tuo investimento, combinando il beneficio fiscale con quello energetico."
};

const DetrazioniEcobonus65: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    
    // --- State per il generatore di causale ---
    const [codiceFiscaleBeneficiario, setCodiceFiscaleBeneficiario] = useState('');
    const [partitaIvaFornitore, setPartitaIvaFornitore] = useState('');
    const [numeroFattura, setNumeroFattura] = useState('');
    const [dataFattura, setDataFattura] = useState('');
    const [causaleGenerata, setCausaleGenerata] = useState('');


    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
      importo_spesa: 20000,
      tipo_intervento: 'coibentazione',
    };
    const [states, setStates] = useState<{[key: string]: any}>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({...prev, [id]: value}));
    };
    
    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const { importo_spesa, tipo_intervento } = states;
        const interventoSelezionato = tipiIntervento[tipo_intervento as keyof typeof tipiIntervento];
        
        const { massimale, percentuale, risparmioEnergeticoStimato } = interventoSelezionato;

        const spesaAmmessa = Math.min(importo_spesa, massimale);
        const detrazione_totale = spesaAmmessa * percentuale;
        const rata_annuale = detrazione_totale / 10;
        const costo_reale_intervento = importo_spesa - detrazione_totale;
        const risparmio_energetico_annuo_stimato = importo_spesa * risparmioEnergeticoStimato;
        
        return {
            massimale_spesa: massimale,
            detrazione_totale,
            rata_annuale,
            costo_reale_intervento,
            risparmio_energetico_annuo_stimato
        };
    }, [states]);

    const chartData = [
      { name: 'Ripartizione Spesa', 'Costo Reale a Tuo Carico': calculatedOutputs.costo_reale_intervento, 'Detrazione Fiscale (in 10 anni)': calculatedOutputs.detrazione_totale },
    ];

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

    const salvaRisultato = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
            const newResults = [payload, ...existingResults].slice(0, 50);
            localStorage.setItem("calc_results", JSON.stringify(newResults));
            alert("Risultato salvato con successo!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);
    
    const generaCausale = () => {
        if (!codiceFiscaleBeneficiario || !partitaIvaFornitore || !numeroFattura || !dataFattura) {
            alert("Per favore, compila tutti i campi per generare la causale.");
            return;
        }
        const causale = `Bonifico per lavori di riqualificazione energetica (Ecobonus art. 1, c. 344-347, L. 296/2006). Fattura n. ${numeroFattura} del ${dataFattura}. Beneficiario detrazione: ${codiceFiscaleBeneficiario}. P.IVA fornitore: ${partitaIvaFornitore}.`;
        setCausaleGenerata(causale);
    };

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2">
                    <div ref={calcolatoreRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">Calcola la detrazione, il costo reale e il risparmio in bolletta per i tuoi lavori di riqualificazione energetica.</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce una consulenza fiscale o tecnica. Le percentuali e i massimali sono aggiornati alla normativa vigente, ma potrebbero subire variazioni.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                            {inputs.map(input => {
                                const inputLabel = (
                                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                        {input.label}
                                        {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                                    </label>
                                );
                                if (input.type === 'select') {
                                    return (
                                        <div key={input.id} className="md:col-span-2">
                                            {inputLabel}
                                            <select id={input.id} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2">
                                                {Object.entries(input.options!).map(([key, value]) => (
                                                    <option key={key} value={key}>{(value as any).label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )
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
                            {outputs.map(output => (
                                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${['costo_reale_intervento', 'risparmio_energetico_annuo_stimato'].includes(output.id) ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold ${['costo_reale_intervento', 'risparmio_energetico_annuo_stimato'].includes(output.id) ? 'text-indigo-600' : 'text-gray-800'}`}>
                                        <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione del Costo Totale</h3>
                            <div className="h-72 w-full bg-gray-50 p-2 rounded-lg">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <XAxis dataKey="name" hide />
                                            <YAxis tickFormatter={(tick) => formatCurrency(tick)} />
                                            <ChartTooltip formatter={(value) => formatCurrency(value as number)} />
                                            <Legend formatter={(value, entry) => <span className="text-gray-700 text-sm">{value}</span>} />
                                            <Bar dataKey="Costo Reale a Tuo Carico" stackId="a" fill="#4f46e5" />
                                            <Bar dataKey="Detrazione Fiscale (in 10 anni)" stackId="a" fill="#818cf8" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                     <div className="mt-6 border rounded-lg shadow-md p-6 bg-white">
                        <h3 className="font-semibold text-gray-800 text-xl">Generatore Causale Bonifico Parlante</h3>
                        <p className="text-sm text-gray-600 mt-2 mb-4">Evita errori e compila i campi qui sotto per generare la causale esatta da usare nel tuo bonifico.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Il tuo Codice Fiscale" value={codiceFiscaleBeneficiario} onChange={e => setCodiceFiscaleBeneficiario(e.target.value.toUpperCase())} className="w-full border-gray-300 rounded-md" />
                            <input type="text" placeholder="P.IVA / CF Fornitore" value={partitaIvaFornitore} onChange={e => setPartitaIvaFornitore(e.target.value)} className="w-full border-gray-300 rounded-md" />
                            <input type="text" placeholder="Numero Fattura" value={numeroFattura} onChange={e => setNumeroFattura(e.target.value)} className="w-full border-gray-300 rounded-md" />
                            <input type="date" placeholder="Data Fattura" value={dataFattura} onChange={e => setDataFattura(e.target.value)} className="w-full border-gray-300 rounded-md" />
                        </div>
                        <button onClick={generaCausale} className="mt-4 w-full bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700">Genera Causale</button>
                        {causaleGenerata && (
                            <div className="mt-4 p-3 bg-gray-100 rounded">
                                <p className="text-xs text-gray-500 mb-1">Copia e incolla questa causale:</p>
                                <p className="font-mono text-sm break-words">{causaleGenerata}</p>
                            </div>
                        )}
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
                        <h2 className="font-semibold mb-2 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={salvaRisultato} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full text-sm border border-red-300 rounded-md px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida all'Ecobonus</h2>
                        <ContentRenderer content={content} />
                    </section>
                     <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti Ufficiali</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://detrazionifiscali.enea.it/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Portale ENEA per le Detrazioni Fiscali</a></li>
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/agevolazioni/detrazione-riqualificazione-energetica-55-2016" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Guida Agenzia delle Entrate</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default DetrazioniEcobonus65;