'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

export const meta = {
  title: "Calcolatore Cedolare Secca vs. Tassazione Ordinaria per affitti",
  description: "Simula e confronta la tassazione del tuo affitto con la Cedolare Secca o il regime ordinario IRPEF. Scopri l'opzione più conveniente per te."
};

// --- Componenti UI (Icone e Tooltip) ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// --- Dati Strutturati SEO (JSON-LD) ---
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
            "name": "Quando conviene la cedolare secca?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "La cedolare secca è generalmente più conveniente per i proprietari con un reddito complessivo medio-alto, che li collocherebbe negli scaglioni IRPEF del 35% o 43%. In questi casi, l'aliquota fissa del 21% o 10% offre un risparmio significativo."
            }
          },
          {
            "@type": "Question",
            "name": "Quali tasse sostituisce la cedolare secca?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "La cedolare secca è un'imposta sostitutiva che rimpiazza l'IRPEF, le addizionali regionali e comunali, l'imposta di registro per la prima registrazione e le annualità successive, e l'imposta di bollo."
            }
          },
          {
            "@type": "Question",
            "name": "Posso applicare la cedolare secca per un negozio (uso commerciale)?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No, la cedolare secca si applica solo alle locazioni di immobili ad uso abitativo e alle relative pertinenze, locate congiuntamente all'abitazione."
            }
          }
        ]
      })
    }}
  />
);

// --- Componente per il Rendering del Contenuto Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    const blocks = content.split('\n\n');

    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {blocks.map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) {
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (trimmedBlock.startsWith('*')) {
                    const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
                    return (
                        <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
                            {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}
                        </ul>
                    );
                }
                 if (trimmedBlock.startsWith('#### **')) {
                     return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                 }
                if (trimmedBlock.includes('|')) {
                    const lines = trimmedBlock.split('\n');
                    const headers = lines[0].split('|').map(h => h.trim());
                    const rows = lines.slice(2).map(line => line.split('|').map(cell => cell.trim()));
                    return (
                        <div key={index} className="overflow-x-auto my-4">
                            <table className="min-w-full border text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        {headers.map((header, i) => <th key={i} className="p-2 border text-left font-semibold">{header}</th>)}
                                    </tr>

                                </thead>
                                <tbody>
                                    {rows.map((row, i) => (
                                        <tr key={i}>
                                            {row.map((cell, j) => <td key={j} className="p-2 border" dangerouslySetInnerHTML={{ __html: processInlineFormatting(cell) }} />)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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


// --- Dati e Logica del Calcolatore ---
const calculatorData = {
  "slug": "cedolare-secca-vs-tassazione-ordinaria",
  "category": "Immobiliare e Casa",
  "title": "Calcolatore Cedolare Secca vs. Tassazione Ordinaria per affitti",
  "lang": "it",
  "inputs": [
    { "id": "canone_locazione_annuo", "label": "Canone di Locazione Annuo", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Inserisci l'importo totale che incassi dall'affitto in un anno, al lordo di qualsiasi spesa o tassa." },
    { "id": "altri_redditi_imponibili", "label": "Altri Redditi Imponibili", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Inserisci il tuo reddito imponibile totale annuo, escluso quello derivante dall'affitto in questione (es. stipendio, pensione, altri redditi da fabbricati)." },
    { "id": "aliquota_cedolare", "label": "Aliquota Cedolare Secca", "type": "radio" as const, "options": [ { "value": 21, "label": "21% (Canone Libero)" }, { "value": 10, "label": "10% (Canone Concordato)" } ], "tooltip": "Scegli il 21% per i contratti a canone libero. Scegli il 10% per i contratti a canone concordato in comuni ad alta tensione abitativa." },
    { "id": "addizionale_regionale", "label": "Aliquota Addizionale Regionale", "type": "number" as const, "unit": "%", "min": 0, "max": 5, "step": 0.01, "tooltip": "Inserisci l'aliquota dell'addizionale regionale IRPEF. Varia da regione a regione (es. Lazio 1.73%, Lombardia 1.23%)." },
    { "id": "addizionale_comunale", "label": "Aliquota Addizionale Comunale", "type": "number" as const, "unit": "%", "min": 0, "max": 0.9, "step": 0.01, "tooltip": "Inserisci l'aliquota dell'addizionale comunale IRPEF. Il valore massimo è 0.8%, salvo eccezioni. Controlla il sito del tuo comune." }
  ],
  "outputs": [
    { "id": "importo_cedolare_secca", "label": "Tassazione Totale (Cedolare Secca)", "unit": "€" },
    { "id": "importo_tassazione_ordinaria", "label": "Tassazione Totale (Ordinaria IRPEF)", "unit": "€" },
    { "id": "convenienza_cedolare", "label": "Risparmio Stimato con la Cedolare Secca", "unit": "€" },
    { "id": "netto_cedolare", "label": "Reddito Netto da Affitto (Cedolare Secca)", "unit": "€" },
    { "id": "netto_ordinaria", "label": "Reddito Netto da Affitto (Ordinaria IRPEF)", "unit": "€" },
    { "id": "aliquota_marginale_irpef", "label": "Aliquota Marginale IRPEF Applicata", "unit": "%" }
  ],
  "content": "### **Guida Completa: Cedolare Secca vs. Tassazione Ordinaria IRPEF**\n\n**Analisi dei regimi, calcolo di convenienza e aspetti normativi per la locazione immobiliare.**\n\nLa scelta del regime fiscale da applicare ai redditi da locazione è una delle decisioni più importanti per un proprietario di immobili. Le opzioni principali sono due: la **Tassazione Ordinaria IRPEF** e il regime sostitutivo della **Cedolare Secca**. Comprendere le differenze e i rispettivi vantaggi è fondamentale per ottimizzare il carico fiscale.\n\nQuesto strumento è progettato per offrire una simulazione chiara e dettagliata, ma è importante sottolineare che **i risultati sono una stima e non possono sostituire una consulenza fiscale professionale**.\n\n### **Parte 1: Il Calcolatore - Come Interpretare i Dati**\n\nIl nostro calcolatore confronta i due regimi fiscali sulla base dei dati che fornisci. Ecco una spiegazione dei parametri fondamentali.\n\n* **Canone di Locazione Annuo**: È il reddito lordo generato dall'affitto. Per la Cedolare Secca, questa è la base imponibile. Per la tassazione ordinaria, la base imponibile è ridotta forfettariamente al 95%.\n* **Altri Redditi Imponibili**: Questo dato è cruciale per la Tassazione Ordinaria. Il reddito da affitto si somma agli altri tuoi redditi (lavoro, pensione, ecc.), determinando lo scaglione IRPEF e, di conseguenza, l'aliquota marginale applicata.\n* **Aliquote Addizionali**: Le addizionali regionali e comunali sono dovute solo in regime di Tassazione Ordinaria e aumentano il carico fiscale complessivo.\n\n### **Parte 2: La Cedolare Secca - Vantaggi e Caratteristiche**\n\nLa Cedolare Secca è un'imposta sostitutiva dell'IRPEF e delle relative addizionali. Chi la sceglie, applica un'aliquota fissa al canone di locazione annuo.\n\n**Vantaggi Principali:**\n1.  **Aliquota Fissa**: Indipendente dagli altri redditi. Le aliquote sono:\n    * **21%** per i contratti d'affitto a canone libero.\n    * **10%** per i contratti a canone concordato, stipulati in Comuni con carenze di disponibilità abitative.\n2.  **Semplificazione**: Sostituisce l'IRPEF, le addizionali, l'imposta di registro e l'imposta di bollo.\n3.  **Nessuna Sorpresa**: Il calcolo è semplice e non è influenzato da altre variabili reddituali.\n\n**Svantaggi:**\n* **Nessun Aggiornamento ISTAT**: Il locatore rinuncia alla facoltà di richiedere l'aggiornamento del canone in base all'indice ISTAT.\n* **Esclusione da Deduzioni/Detrazioni**: Il reddito soggetto a cedolare secca è escluso dal reddito complessivo, quindi non contribuisce al calcolo di deduzioni o detrazioni che si basano su di esso.\n\n### **Parte 3: La Tassazione Ordinaria - Il Regime di Default**\n\nSe non si opta per la Cedolare Secca, il reddito da locazione rientra nella Tassazione Ordinaria IRPEF.\n\n**Meccanismo di Calcolo:**\n1.  **Base Imponibile**: Si calcola sul **95%** del canone annuo. Il 5% è una deduzione forfettaria per le spese.\n2.  **Cumulo dei Redditi**: Questa base imponibile si somma agli altri redditi (es. da lavoro dipendente, pensione), formando il **reddito complessivo**.\n3.  **Calcolo IRPEF**: Sul reddito complessivo si applicano le aliquote progressive per scaglioni.\n\n#### **Scaglioni IRPEF 2024/2025**\n* Fino a 28.000 €: **23%**\n* Oltre 28.000 € e fino a 50.000 €: **35%**\n* Oltre 50.000 €: **43%**\n\n4.  **Addizionali**: Al reddito complessivo si applicano anche le addizionali regionali e comunali.\n\n### **Parte 4: Confronto e Criteri di Convenienza**\n\nLa convenienza della Cedolare Secca aumenta al crescere del reddito complessivo del locatore.\n\n**La Cedolare Secca è quasi sempre più conveniente se:**\n* Il tuo reddito complessivo ti colloca nel **secondo o terzo scaglione IRPEF (aliquota del 35% o 43%)**. In questi casi, l'aliquota fissa del 21% (o 10%) è nettamente inferiore.\n* Non hai particolari oneri deducibili o detraibili da far valere.\n\n**La Tassazione Ordinaria potrebbe essere più conveniente se:**\n* Il tuo reddito complessivo è molto basso o nullo. In questo caso, potresti rientrare nella 'no tax area' o comunque beneficiare dell'aliquota più bassa del 23%.\n* Hai ingenti oneri deducibili/detraibili che, applicati su un reddito complessivo più alto (comprensivo dell'affitto), ti darebbero un beneficio fiscale maggiore del risparmio offerto dalla cedolare.\n\n#### **Tabella Comparativa Riepilogativa**\n\n| Caratteristica | Cedolare Secca | Tassazione Ordinaria IRPEF |\n|---|---|---|\n| **Base Imponibile** | 100% del canone | 95% del canone |\n| **Aliquota** | Fissa (21% o 10%) | Progressiva per scaglioni (23% - 43%) |\n| **Addizionali Reg./Com.** | No | Sì |\n| **Imposta di Registro** | No | Sì (sulla prima registrazione e annualità) |\n| **Imposta di Bollo** | No | Sì (sulla prima registrazione) |\n| **Aggiornamento ISTAT** | No | Sì |"
};

const CedolareSeccaVsTassazioneOrdinariaCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        canone_locazione_annuo: 12000,
        altri_redditi_imponibili: 35000,
        aliquota_cedolare: 21,
        addizionale_regionale: 1.73,
        addizionale_comunale: 0.8
    };

    const [states, setStates] = useState<{[key: string]: any}>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({...prev, [id]: value}));
    };

    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const { canone_locazione_annuo, altri_redditi_imponibili, aliquota_cedolare, addizionale_regionale, addizionale_comunale } = states;

        // --- Logica di calcolo IRPEF ---
        const calculateIRPEF = (reddito: number): number => {
            if (reddito <= 0) return 0;
            if (reddito <= 28000) return reddito * 0.23;
            if (reddito <= 50000) return (28000 * 0.23) + ((reddito - 28000) * 0.35);
            return (28000 * 0.23) + (22000 * 0.35) + ((reddito - 50000) * 0.43);
        };
        const getMarginalRate = (reddito: number): number => {
            if (reddito <= 28000) return 23;
            if (reddito <= 50000) return 35;
            return 43;
        };
        
        // --- Cedolare Secca ---
        const importo_cedolare_secca = canone_locazione_annuo * (aliquota_cedolare / 100);

        // --- Tassazione Ordinaria ---
        const base_imponibile_locazione_ordinaria = canone_locazione_annuo * 0.95;
        const reddito_complessivo_ordinario = altri_redditi_imponibili + base_imponibile_locazione_ordinaria;
        
        const irpef_lorda_totale = calculateIRPEF(reddito_complessivo_ordinario);
        const irpef_lorda_altri_redditi = calculateIRPEF(altri_redditi_imponibili);
        
        const irpef_su_locazione = irpef_lorda_totale - irpef_lorda_altri_redditi;
        
        const importo_add_regionale = base_imponibile_locazione_ordinaria * (addizionale_regionale / 100);
        const importo_add_comunale = base_imponibile_locazione_ordinaria * (addizionale_comunale / 100);
        
        const importo_tassazione_ordinaria = irpef_su_locazione + importo_add_regionale + importo_add_comunale;

        // --- Confronto e Risultati ---
        const convenienza_cedolare = importo_tassazione_ordinaria - importo_cedolare_secca;
        const netto_cedolare = canone_locazione_annuo - importo_cedolare_secca;
        const netto_ordinaria = canone_locazione_annuo - importo_tassazione_ordinaria;
        const aliquota_marginale_irpef = getMarginalRate(reddito_complessivo_ordinario);

        return {
            importo_cedolare_secca,
            importo_tassazione_ordinaria,
            convenienza_cedolare,
            netto_cedolare,
            netto_ordinaria,
            aliquota_marginale_irpef
        };
    }, [states]);

    const chartData = [
      { name: 'Tassazione', 'Cedolare Secca': calculatedOutputs.importo_cedolare_secca, 'Ordinaria IRPEF': calculatedOutputs.importo_tassazione_ordinaria },
    ];
    
    const formulaUsata = `Risparmio = TassazioneOrdinaria - TassazioneCedolare; dove TassazioneOrdinaria = IRPEF(AltriRedditi + Canone*95%) - IRPEF(AltriRedditi) + Addizionali(Canone*95%)`;

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;
            if (!calculatorRef.current) return;
            const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${slug}.pdf`);
        } catch (_e) { alert("Impossibile generare il PDF in questo ambiente."); }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            const history = JSON.parse(localStorage.getItem("calc_results") || "[]");
            localStorage.setItem("calc_results", JSON.stringify([payload, ...history].slice(0, 50)));
            alert("Risultato salvato con successo!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
    const formatPercentage = (value: number) => new Intl.NumberFormat('it-IT', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value / 100);

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                {/* Colonna Sinistra: Calcolatore e Grafico */}
                <div className="lg:col-span-2 space-y-6">
                    <div ref={calculatorRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">Confronta i regimi fiscali e scopri quanto puoi risparmiare sulle tasse del tuo affitto.</p>
                        
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce una consulenza fiscale. I calcoli si basano sugli scaglioni IRPEF 2024/2025.
                        </div>

                        {/* --- Sezione Input --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {inputs.map(input => (
                                <div key={input.id} className={input.type === 'radio' ? 'md:col-span-2' : ''}>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                        {input.label}
                                        {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                                    </label>
                                    {input.type === 'number' && (
                                        <div className="relative">
                                            <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" type="number" min={input.min} max={input.max} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                                            <span className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500">{input.unit}</span>
                                        </div>
                                    )}
                                    {input.type === 'radio' && (
                                        <div className="flex flex-wrap gap-4 mt-2">
                                            {input.options?.map(opt => (
                                                <label key={opt.value} className="flex items-center gap-2 cursor-pointer p-2 border rounded-md has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-400">
                                                    <input type="radio" name={input.id} value={opt.value} checked={states[input.id] === opt.value} onChange={() => handleStateChange(input.id, opt.value)} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"/>
                                                    <span className="text-sm font-medium text-gray-800">{opt.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* --- Sezione Output --- */}
                        <div className="mt-8 space-y-4">
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati della Simulazione</h2>
                            {outputs.map(output => (
                                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'convenienza_cedolare' ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'}`}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold ${output.id === 'convenienza_cedolare' && calculatedOutputs.convenienza_cedolare > 0 ? 'text-green-600' : (output.id === 'convenienza_cedolare' ? 'text-red-600' : 'text-gray-800')}`}>
                                        <span>
                                            {isClient ? 
                                                (output.unit === '%' ? formatPercentage((calculatedOutputs as any)[output.id]) : formatCurrency((calculatedOutputs as any)[output.id]))
                                                : '...'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* --- Grafico e Formula --- */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Confronto Visivo della Tassazione</h3>
                        <div className="h-72 w-full bg-gray-50 p-2 rounded-lg">
                            {isClient && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 5 }} layout="vertical">
                                        <XAxis type="number" tickFormatter={(value) => formatCurrency(value as number)} />
                                        <YAxis type="category" dataKey="name" width={1} />
                                        <ChartTooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'rgba(239, 246, 255, 0.5)'}} />
                                        <Legend />
                                        <Bar dataKey="Cedolare Secca" fill="#6366f1" />
                                        <Bar dataKey="Ordinaria IRPEF" fill="#f43f5e" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    <div className="border rounded-lg shadow-md p-4 bg-white">
                        <h3 className="font-semibold text-gray-700">Formula di Calcolo Utilizzata</h3>
                        <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaUsata}</p>
                    </div>
                </div>

                {/* Colonna Destra: Contenuti e Strumenti */}
                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={salvaRisultato} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full text-sm border border-red-300 text-red-700 rounded-md px-3 py-2 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida alla Scelta</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/fabbricatiterreni/cedolare-secca/scheda-informativa-cedolare-secca" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Cedolare Secca</a></li>
                            <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2011-03-14;23!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">D.Lgs. 23/2011, Art. 3</a> (Istituzione della Cedolare Secca)</li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default CedolareSeccaVsTassazioneOrdinariaCalculator;