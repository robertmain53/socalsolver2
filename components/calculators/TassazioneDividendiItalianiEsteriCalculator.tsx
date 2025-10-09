'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

export const meta = {
  title: "Calcolatore Tassazione Dividendi (Italiani/Esteri) e Doppia Imposizione",
  description: "Simula la tassazione netta sui dividendi di azioni italiane ed estere. Calcola il credito d'imposta per evitare la doppia imposizione e scopri il tuo netto finale."
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
          "name": "Come vengono tassati i dividendi di azioni italiane?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "I dividendi da azioni italiane sono soggetti a una ritenuta a titolo d'imposta del 26%. L'imposta è definitiva e di solito viene trattenuta direttamente dall'intermediario finanziario (broker), quindi il provento è già netto e non va inserito nella dichiarazione dei redditi IRPEF."
          }
        },
        {
          "@type": "Question",
          "name": "Cos'è la doppia imposizione sui dividendi esteri?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "La doppia imposizione si verifica quando un dividendo estero viene tassato sia nel Paese della società (ritenuta alla fonte) sia in Italia (tassazione del 26%). Per evitare questo, l'Italia riconosce un credito d'imposta per le tasse già pagate all'estero, a condizione che esista una convenzione tra i due Paesi."
          }
        },
        {
          "@type": "Question",
          "name": "Come funziona il credito d'imposta per i dividendi esteri?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Il credito d'imposta ti permette di sottrarre dall'imposta italiana (26%) le tasse che hai già pagato all'estero. Il credito non può mai superare l'imposta dovuta in Italia. Questo meccanismo, nella maggior parte dei casi, allinea la tassazione effettiva totale al 26%, eliminando la doppia imposizione."
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
                if (block.startsWith('### **')) return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(block.replace(/### \*\*|\*\*/g, '')) }} />;
                if (block.startsWith('#### **')) return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(block.replace(/#### \*\*|\*\*/g, '')) }} />;
                 if (block.startsWith('| Paese |')) {
                    const rows = block.split('\n').slice(2);
                    const headers = block.split('\n')[0].split('|').slice(1, -1).map(h => h.trim());
                    return (
                        <div key={index} className="overflow-x-auto my-4">
                            <table className="min-w-full border text-sm">
                                <thead className="bg-gray-100">
                                    <tr>{headers.map((h, i) => <th key={i} className="p-2 border text-left">{h}</th>)}</tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, i) => (
                                        <tr key={i}>{row.split('|').slice(1, -1).map((cell, j) => <td key={j} className="p-2 border" dangerouslySetInnerHTML={{ __html: processInlineFormatting(cell.trim()) }} />)}</tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                }
                if (block.startsWith('*')) {
                    const items = block.split('\n').map(item => item.replace(/^\*\s*/, ''));
                    return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ul>;
                }
                if (block) return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(block) }} />;
                return null;
            })}
        </div>
    );
};

// --- Dati di configurazione del calcolatore ---
const calculatorData = {
  "slug": "tassazione-dividendi-italiani-esteri", "category": "Risparmio e Investimenti", "title": "Calcolatore Tassazione Dividendi Azioni Italiane ed Estere", "lang": "it",
  "inputs": [
    {"id": "dividendo_lordo", "label": "Dividendo Lordo Annuale", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Inserisci l'importo totale del dividendo ricevuto prima di qualsiasi tassazione. Questo è l'importo comunicato dalla società."},
    {"id": "is_estero", "label": "È un dividendo di fonte estera?", "type": "boolean" as const, "tooltip": "Seleziona se il dividendo è pagato da una società con sede legale fuori dall'Italia. Questo attiva il calcolo per la doppia imposizione."},
    {"id": "ritenuta_fonte_percentuale", "label": "Ritenuta alla Fonte subita (%)", "type": "number" as const, "unit": "%", "min": 0, "max": 100, "step": 0.5, "condition": "is_estero == true", "tooltip": "Inserisci l'aliquota della tassa già pagata nel Paese di origine della società. Es: 15% per USA, 26.375% per Germania (con convenzione), 30% per molti altri paesi senza convenzione."}
  ],
  "outputs": [
    {"id": "ritenuta_alla_fonte", "label": "Imposta pagata all'Estero (Ritenuta alla Fonte)", "unit": "€"},
    {"id": "imposta_italiana_lorda", "label": "Imposta Lorda dovuta in Italia (26%)", "unit": "€"},
    {"id": "credito_imposta_estera", "label": "Credito d'Imposta Riconosciuto", "unit": "€"},
    {"id": "imposta_italiana_netta", "label": "Imposta Netta dovuta in Italia (Saldo)", "unit": "€"},
    {"id": "tassazione_totale", "label": "Tassazione Totale Effettiva", "unit": "€"},
    {"id": "dividendo_netto", "label": "Dividendo Netto Incassato", "unit": "€"},
    {"id": "aliquota_effettiva_totale", "label": "Aliquota Fiscale Effettiva Totale", "unit": "%"}
  ],
  "content": "### **Guida Completa alla Tassazione dei Dividendi (Italiani ed Esteri)**\n\n**Come Evitare la Doppia Imposizione e Calcolare Correttamente il Tuo Netto**\n\nInvestire in azioni che distribuiscono dividendi è una strategia apprezzata da molti risparmiatori. Tuttavia, la gestione fiscale di questi proventi può diventare complessa, specialmente quando si ricevono dividendi da società estere. Comprendere la differenza tra tassazione italiana, ritenute alla fonte e meccanismi di credito d'imposta è fondamentale per non pagare più tasse del dovuto e per compilare correttamente la propria dichiarazione dei redditi.\n\nQuesto calcolatore avanzato ti permette di simulare con precisione la tassazione applicata, sia nel caso semplice di dividendi italiani sia in quello complesso di dividendi esteri, mostrando l'impatto della doppia imposizione e il beneficio del credito d'imposta.\n\n**Disclaimer**: Questo strumento è un simulatore a scopo puramente informativo. La normativa fiscale è complessa e soggetta a variazioni. Per una gestione accurata della tua posizione fiscale, è indispensabile la consulenza di un commercialista o di un intermediario finanziario abilitato.\n\n### **Parte 1: Il Caso Semplice - Dividendi da Azioni Italiane**\n\nPer un investitore persona fisica che non agisce in regime d'impresa, la tassazione dei dividendi provenienti da società italiane è molto semplice. Viene applicata una **ritenuta a titolo d'imposta del 26%**. \n\nQuesto significa che l'imposta viene pagata alla fonte (solitamente trattenuta dal tuo broker se in regime amministrato) e il provento non deve essere ulteriormente dichiarato in IRPEF. Il tuo compito è praticamente nullo.\n\n* **Esempio**: Su un dividendo lordo di 1.000 €, la banca trattiene 260 € (26%). Ricevi un netto di 740 €.\n\n### **Parte 2: Il Problema - La Doppia Imposizione sui Dividendi Esteri**\n\nQuando ricevi un dividendo da una società estera (es. Apple, Microsoft, LVMH), la situazione si complica. Sei soggetto a una **doppia tassazione**:\n\n1.  **Tassazione alla Fonte (Paese Estero)**: Il Paese in cui ha sede la società applica una sua tassa sul dividendo (ritenuta alla fonte).\n2.  **Tassazione in Italia**: L'Italia, in quanto tuo Paese di residenza fiscale, tassa a sua volta l'intero dividendo lordo con l'aliquota del 26%.\n\nSenza correttivi, questo porterebbe a un prelievo fiscale insostenibile. Qui entra in gioco la soluzione.\n\n### **Parte 3: La Soluzione - Il Credito d'Imposta**\n\nPer evitare la doppia imposizione, l'Italia ha siglato delle **Convenzioni Contro le Doppie Imposizioni (CDI)** con numerosi Paesi. Queste convenzioni ti permettono di ottenere un **credito d'imposta** per le tasse già pagate all'estero.\n\nLa regola fondamentale del credito d'imposta è:\n\n> **Puoi detrarre dall'imposta italiana un importo pari alla tassa pagata all'estero, ma non superiore all'imposta che avresti pagato in Italia su quello stesso reddito.**\n\nIn pratica, il credito d'imposta non può mai superare la quota di imposta italiana (il 26% del dividendo lordo). \n\n* **Esempio Pratico (Dividendo USA)**:\n    * Dividendo Lordo: 1.000 €\n    * Ritenuta alla Fonte USA (grazie alla convenzione): 15% -> **150 €**\n    * Imposta teorica in Italia: 1.000 € * 26% = **260 €**\n    * **Credito d'Imposta**: Puoi recuperare **150 €** (perché 150 € è inferiore a 260 €).\n    * **Saldo da pagare in Italia**: 260 € (imposta lorda) - 150 € (credito) = **110 €**.\n    * **Tassazione Totale**: 150 € (pagati in USA) + 110 € (pagati in Italia) = **260 €**. \n    * **Aliquota Effettiva Totale**: 26%.\n\nCome vedi, il risultato finale è che paghi un'aliquota complessiva del 26%, esattamente come per un dividendo italiano. Il meccanismo serve a ripartire il gettito tra i due Stati.\n\n#### **Ritenute alla Fonte (con Convenzione)**\n\n| Paese | Aliquota Standard | Aliquota con Convenzione per l'Italia |\n| :--- | :--- | :--- |\n| **Stati Uniti** | 30% | **15%** |\n| **Germania** | 26,375% | **15%** |\n| **Francia** | 25% | **15%** |\n| **Svizzera** | 35% | **15%** |\n| **Regno Unito** | 0% | **0%** |\n\n**Nota Bene**: Per ottenere l'aliquota convenzionale ridotta, è spesso necessario compilare moduli specifici (come il W-8BEN per gli USA) tramite il proprio broker. Altrimenti, si subisce l'aliquota standard e il credito d'imposta in Italia potrebbe non coprire tutta la tassa pagata all'estero."
};

const TassazioneDividendiItalianiEsteriCalculator: React.FC = () => {
    const { slug, title, inputs, outputs } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        dividendo_lordo: 1000,
        is_estero: true,
        ritenuta_fonte_percentuale: 15,
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => setStates(prev => ({ ...prev, [id]: value }));
    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const { dividendo_lordo, is_estero, ritenuta_fonte_percentuale } = states;
        
        const ALIQUOTA_ITALIANA = 0.26;
        const ritenuta_alla_fonte = is_estero ? dividendo_lordo * (ritenuta_fonte_percentuale / 100) : 0;
        const imposta_italiana_lorda = dividendo_lordo * ALIQUOTA_ITALIANA;
        const credito_imposta_estera = is_estero ? Math.min(ritenuta_alla_fonte, imposta_italiana_lorda) : 0;
        const imposta_italiana_netta = imposta_italiana_lorda - credito_imposta_estera;
        const tassazione_totale = ritenuta_alla_fonte + imposta_italiana_netta;
        const dividendo_netto = dividendo_lordo - tassazione_totale;
        const aliquota_effettiva_totale = dividendo_lordo > 0 ? (tassazione_totale / dividendo_lordo) * 100 : 0;

        return { ritenuta_alla_fonte, imposta_italiana_lorda, credito_imposta_estera, imposta_italiana_netta, tassazione_totale, dividendo_netto, aliquota_effettiva_totale };
    }, [states]);

    const chartData = [
        { name: 'Dividendo Netto', value: Math.max(0, calculatedOutputs.dividendo_netto) },
        { name: 'Tassa Estera', value: Math.max(0, calculatedOutputs.ritenuta_alla_fonte) },
        { name: 'Tassa Italiana (Saldo)', value: Math.max(0, calculatedOutputs.imposta_italiana_netta) },
    ];
    const COLORS = ['#22c55e', '#f97316', '#ef4444'];

    const formulaUsata = states.is_estero
        ? "Tassazione Tot. = Tassa Estera + (Tassa Lorda ITA - Credito Imposta)"
        : "Tassazione Tot. = Dividendo Lordo * 26%";
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
    const formatPercent = (value: number) => `${value.toFixed(2)}%`;

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;
            if (!calcolatoreRef.current) return;
            const canvas = await html2canvas(calcolatoreRef.current, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({ orientation: "p", unit: "px", format: "a4" });
            const width = pdf.internal.pageSize.getWidth();
            const height = (canvas.height * width) / canvas.width;
            pdf.addImage(imgData, "PNG", 0, 0, width, height);
            pdf.save(`${slug}.pdf`);
        } catch (_e) { alert("Errore durante l'esportazione PDF."); }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            localStorage.setItem("calc_results", JSON.stringify([payload, ...JSON.parse(localStorage.getItem("calc_results") || "[]")].slice(0, 50)));
            alert("Risultato salvato!");
        } catch { alert("Impossibile salvare."); }
    }, [states, calculatedOutputs, slug, title]);

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md p-6" ref={calcolatoreRef}>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">Simula la tassazione sui tuoi dividendi, calcola il credito d'imposta ed evita la doppia imposizione.</p>
                         <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento è un simulatore a scopo informativo. La consulenza di un professionista è indispensabile per la gestione fiscale.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                           {inputs.map(input => {
                                const conditionMet = !input.condition || (input.condition.includes('== true') && states[input.condition.split(' ')[0]]);
                                if (!conditionMet) return null;
                                if (input.type === 'boolean') {
                                    return (
                                        <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-2 rounded-md bg-white border">
                                            <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={!!states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                            <label className="text-sm font-medium text-gray-700 flex items-center" htmlFor={input.id}>
                                                {input.label}
                                                <Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip>
                                            </label>
                                        </div>
                                    );
                                }
                                return (
                                    <div key={input.id}>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                            {input.label}
                                            <Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip>
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" type="number" min={input.min} step={input.step} max={input.max} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                                            {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="mt-8 space-y-4">
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati del Calcolo</h2>
                            {outputs.map(output => {
                                if (!states.is_estero && ['ritenuta_alla_fonte', 'credito_imposta_estera', 'imposta_italiana_netta', 'imposta_italiana_lorda'].includes(output.id)) return null;
                                return (
                                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'dividendo_netto' ? 'bg-green-50 border-green-500' : (output.id === 'tassazione_totale' ? 'bg-red-50 border-red-400' : 'bg-gray-50 border-gray-300')}`}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold ${output.id === 'dividendo_netto' ? 'text-green-600' : (output.id === 'tassazione_totale' ? 'text-red-600' : 'text-gray-800')}`}>
                                        <span>{isClient ? (output.unit === '%' ? formatPercent((calculatedOutputs as any)[output.id]) : formatCurrency((calculatedOutputs as any)[output.id])) : '...'}</span>
                                    </div>
                                </div>
                            )})}
                        </div>

                         <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione del Dividendo Lordo</h3>
                             <div className="h-64 w-full bg-gray-50 p-4 rounded-lg">
                                {isClient && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                            {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                        </Pie>
                                        <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 border rounded-lg shadow-md p-4 bg-white">
                            <h3 className="font-semibold text-gray-700">Formula Sintetizzata</h3>
                            <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaUsata}</p>
                         </div>
                    </div>
                </div>

                 <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={salvaRisultato} className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors">Esporta PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full border border-red-300 bg-red-50 text-red-700 rounded-md px-3 py-2 hover:bg-red-100 transition-colors">Reset</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida Approfondita</h2>
                        <ContentRenderer content={calculatorData.content} />
                    </section>
                     <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/agevolazioni/crediti-d-imposta-per-imposte-pagate-all-estero/scheda-informativa-crediti-imposta-imposte-estero" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia Entrate - Credito per Imposte Estere</a></li>
                            <li><a href="https://www.finanze.gov.it/it/Fiscalita-internazionale/Convenzioni-contro-le-doppie-imposizioni/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">MEF - Convenzioni Contro le Doppie Imposizioni</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default TassazioneDividendiItalianiEsteriCalculator;