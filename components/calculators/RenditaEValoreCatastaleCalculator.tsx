'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

export const meta = {
    title: 'Calcolatore Rendita Catastale e Valore Catastale',
    description: 'Calcola facilmente il valore catastale del tuo immobile partendo dalla rendita. Utile per IMU, compravendite, successioni e donazioni. Include tutti i coefficienti aggiornati.'
};

// --- Icona per i Tooltip (SVG inline) ---
const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 inline-block">
        <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
);

// --- Componente Tooltip ---
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
    <div className="relative flex items-center group">
        {children}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
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
                        "name": "Dove si trova la rendita catastale di un immobile?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "La rendita catastale è un dato ufficiale che si trova sulla visura catastale dell'immobile, un documento richiedibile presso l'Agenzia delle Entrate (Catasto). È anche riportata nell'atto notarile di compravendita."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Che differenza c'è tra valore catastale e valore di mercato?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Il valore catastale è un valore fiscale, usato per calcolare le tasse, ed è quasi sempre molto più basso del valore di mercato. Il valore di mercato, invece, è il prezzo reale a cui un immobile viene comprato o venduto. Il nostro calcolatore li mette a confronto."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Per calcolare l'IMU si usa il valore catastale?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "No, ed è un punto importante. Per calcolare l'IMU si parte dalla rendita catastale rivalutata del 5%, ma la si moltiplica per un coefficiente specifico per l'IMU (di solito 160 per le abitazioni), che è diverso da quello usato per il valore catastale ai fini dell'imposta di registro."
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

    const blocks = content.split('\n\n');

    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {blocks.map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) {
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-4 text-gray-800" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (trimmedBlock.startsWith('#### **')) {
                    return <h4 key={index} className="text-lg font-semibold mt-4 mb-3 text-gray-800" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                 if (trimmedBlock.startsWith('|')) {
                    const rows = trimmedBlock.split('\n').map(row => row.split('|').map(cell => cell.trim()).slice(1, -1));
                    const headers = rows[0];
                    const body = rows.slice(2);
                    return (
                        <div key={index} className="overflow-x-auto my-4">
                            <table className="min-w-full border text-sm">
                                <thead className="bg-gray-100">
                                    <tr>{headers.map((h, i) => <th key={i} className="p-2 border text-left font-semibold">{h}</th>)}</tr>
                                </thead>
                                <tbody>
                                    {body.map((row, i) => (
                                        <tr key={i}>{row.map((cell, j) => <td key={j} className="p-2 border" dangerouslySetInnerHTML={{ __html: processInlineFormatting(cell) }} />)}</tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                }
                if (trimmedBlock) {
                    return <p key={index} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                }
                return null;
            })}
        </div>
    );
};


// --- Dati di configurazione del calcolatore (incorporati) ---
const calculatorData = {
  "slug": "rendita-e-valore-catastale", "category": "Immobiliare e Casa", "title": "Calcolatore Rendita Catastale e Valore Catastale", "lang": "it",
  "inputs": [
    { "id": "renditaCatastale", "label": "Rendita Catastale", "type": "number" as const, "unit": "€", "min": 0, "step": 10, "tooltip": "Inserisci il valore della rendita catastale non rivalutata. Puoi trovarlo sulla visura catastale dell'immobile o nell'atto di compravendita." },
    { "id": "categoriaCatastale", "label": "Categoria Catastale", "type": "select" as const, "options": [
        {"value": "A", "label": "Gruppo A (Abitazioni, escl. A/10)"}, {"value": "A10", "label": "A/10 (Uffici e studi privati)"}, {"value": "B", "label": "Gruppo B (Alloggi collettivi)"},
        {"value": "C1", "label": "C/1 (Negozi e botteghe)"}, {"value": "C", "label": "Gruppo C (escl. C/1)"}, {"value": "D", "label": "Gruppo D (Immobili speciali)"},
        {"value": "E", "label": "Gruppo E (Immobili particolari)"}, {"value": "T", "label": "Terreni non edificabili"}
      ], "tooltip": "Seleziona il gruppo catastale di appartenenza dell'immobile, come indicato sulla visura catastale (es. A/2 rientra nel Gruppo A)."
    },
    { "id": "isPrimaCasa", "label": "È la tua 'Prima Casa'?", "type": "boolean" as const, "condition": "categoriaCatastale == 'A'", "tooltip": "Spunta questa casella se l'immobile è la tua abitazione principale e benefici delle agevolazioni 'prima casa'. Questo modifica il coefficiente e le imposte." },
    { "id": "valoreDiMercato", "label": "Valore di Mercato (Opzionale)", "type": "number" as const, "unit": "€", "min": 0, "step": 5000, "tooltip": "Inserisci una stima del valore commerciale attuale dell'immobile. Questo dato verrà usato solo per un confronto grafico." }
  ],
  "outputs": [
    { "id": "renditaRivalutata", "label": "Rendita Catastale Rivalutata (al 5%)", "unit": "€" },
    { "id": "valoreCatastale", "label": "Valore Catastale (Base Fiscale)", "unit": "€" },
    { "id": "valoreBaseIMU", "label": "Valore Base per Calcolo IMU", "unit": "€" },
    { "id": "impostaRegistro", "label": "Imposta di Registro (Stima Compravendita)", "unit": "€" }
  ],
  "content": "### **Guida Definitiva al Calcolo del Valore Catastale**\n\n**Tutto ciò che devi sapere su Rendita, Coefficienti e Tasse Immobiliari.**\n\nIl **Valore Catastale** è uno dei dati più importanti quando si ha a che fare con un immobile. È un **valore fiscale**, non di mercato, utilizzato dallo Stato come base per calcolare diverse imposte legate alla proprietà e ai trasferimenti immobiliari. Comprendere come si calcola e a cosa serve è fondamentale per chiunque possieda, acquisti, venda o erediti una proprietà.\n\nQuesto strumento è stato progettato per offrire un calcolo preciso e trasparente, arricchito da spiegazioni dettagliate per aiutarti a comprendere ogni passaggio. Ricorda, però, che per atti ufficiali e situazioni complesse, la consulenza di un notaio o di un commercialista è insostituibile.\n\n### **Parte 1: I Concetti Fondamentali**\n\nPer calcolare il valore catastale, è necessario partire da due elementi chiave: la Rendita Catastale e i Coefficienti Catastali.\n\n#### **1. La Rendita Catastale: Il 'Reddito' Fittizio dell'Immobile**\n\nLa **Rendita Catastale (RC)** è il valore che l'Agenzia delle Entrate attribuisce a ogni immobile, rappresentando il suo potenziale reddito annuo. È un dato fondamentale che trovi sulla **visura catastale** del tuo immobile. Non va confusa con l'eventuale canone di affitto.\n\n#### **2. I Coefficienti Catastali: I Moltiplicatori Stabiliti dalla Legge**\n\nI **Coefficienti Catastali** (o moltiplicatori) sono dei valori numerici fissati per legge, che variano in base alla **categoria catastale** dell'immobile (es. abitazione, negozio, ufficio) e, in alcuni casi, al suo utilizzo (es. 'prima casa').\n\nEcco una tabella riassuntiva dei principali coefficienti:\n\n| Categoria Catastale | Utilizzo | Coefficiente | \n|:--- |:--- |:--- |\n| Gruppo A (escl. A/10) | **Prima Casa** | **110** |\n| Gruppo A (escl. A/10) | Seconda Casa | 120 |\n| A/10 e Gruppo D | Uffici, Immobili speciali | 60 |\n| Gruppo B | Collegi, Scuole, Ospedali | 140 |\n| C/1 e Gruppo E | Negozi, Immobili particolari | 40.80 |\n| Gruppo C (escl. C/1) | Magazzini, Laboratori | 120 |\n| Terreni non edificabili | - | 90 |\n\n### **Parte 2: La Formula del Valore Catastale**\n\nIl calcolo è un processo a due fasi, semplice ma rigoroso:\n\n1.  **Rivalutazione della Rendita**: Per prima cosa, la Rendita Catastale deve essere rivalutata del 5%. \n    _Formula: `Rendita Rivalutata = Rendita Catastale × 1,05`_\n\n2.  **Moltiplicazione per il Coefficiente**: Successivamente, la rendita rivalutata viene moltiplicata per il coefficiente catastale corretto.\n    _Formula: `Valore Catastale = Rendita Rivalutata × Coefficiente Catastale`_\n\n### **Parte 3: A Cosa Serve il Valore Catastale?**\n\nIl valore catastale è la base imponibile per diverse imposte:\n\n* **Imposte su Compravendita, Donazione e Successione**: È la base su cui si calcolano l'**imposta di registro, ipotecaria e catastale**. Grazie al meccanismo del **'prezzo-valore'**, nelle compravendite tra privati puoi scegliere di pagare le imposte sul valore catastale (solitamente più basso) anziché sul prezzo di mercato.\n    * **Imposta di Registro**: 2% sul valore catastale per la 'prima casa', 9% per gli altri immobili (con un minimo di 1.000 €).\n    * **Imposte Ipotecaria e Catastale**: In misura fissa (50 € ciascuna) per la 'prima casa', o in percentuale negli altri casi.\n\n* **Calcolo dell'IMU**: **ATTENZIONE!** Per calcolare l'IMU, la base imponibile è diversa. Si parte sempre dalla rendita catastale rivalutata del 5%, ma la si moltiplica per un coefficiente specifico per l'IMU (es. **160** per le abitazioni). Il nostro calcolatore mostra anche questo valore per massima chiarezza.\n\n### **Parte 4: Valore Catastale vs. Valore di Mercato**\n\nÈ fondamentale non confondere i due. \n* Il **Valore Catastale** è un dato **fiscale**, quasi sempre inferiore a quello di mercato.\n* Il **Valore di Mercato** è il prezzo al quale un immobile verrebbe realisticamente venduto oggi sul mercato libero. \n\nIl nostro calcolatore ti permette di inserire una stima del valore di mercato per visualizzare graficamente questa differenza, aiutandoti a comprendere meglio il contesto fiscale del tuo immobile."
};

const RenditaEValoreCatastaleCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);
    
    const initialStates = {
        renditaCatastale: 850,
        categoriaCatastale: "A",
        isPrimaCasa: true,
        valoreDiMercato: 250000,
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };
    
    const handleReset = useCallback(() => setStates(initialStates), [initialStates]);

    const calculatedOutputs = useMemo(() => {
        const { renditaCatastale, categoriaCatastale, isPrimaCasa } = states;
        
        const renditaRivalutata = renditaCatastale * 1.05;

        const getCoefficiente = () => {
            if (categoriaCatastale === 'A') return isPrimaCasa ? 110 : 120;
            if (categoriaCatastale === 'A10' || categoriaCatastale === 'D') return 60;
            if (categoriaCatastale === 'B') return 140;
            if (categoriaCatastale === 'C1' || categoriaCatastale === 'E') return 40.80;
            if (categoriaCatastale === 'C') return 120;
            if (categoriaCatastale === 'T') return 90;
            return 120; // Default
        };
        const coefficiente = getCoefficiente();
        const valoreCatastale = renditaRivalutata * coefficiente;
        
        const getCoefficienteIMU = () => {
            if (['A', 'C'].includes(categoriaCatastale)) return 160;
            if (categoriaCatastale === 'A10') return 80;
            if (categoriaCatastale === 'B') return 140;
            if (categoriaCatastale === 'C1') return 55;
            if (categoriaCatastale === 'D') return 65;
            return 160;
        };
        const valoreBaseIMU = renditaRivalutata * getCoefficienteIMU();

        const aliquotaRegistro = isPrimaCasa && categoriaCatastale === 'A' ? 0.02 : 0.09;
        const impostaRegistro = Math.max(1000, valoreCatastale * aliquotaRegistro);

        return { renditaRivalutata, valoreCatastale, valoreBaseIMU, impostaRegistro, coefficiente };
    }, [states]);

    const chartData = [
        { name: 'Valore Catastale', value: calculatedOutputs.valoreCatastale, fill: '#8884d8' },
        { name: 'Base IMU', value: calculatedOutputs.valoreBaseIMU, fill: '#82ca9d' },
        ...(states.valoreDiMercato > 0 ? [{ name: 'Valore di Mercato', value: states.valoreDiMercato, fill: '#ffc658' }] : []),
    ];
    
    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import('html2canvas')).default;
            const jsPDF = (await import('jspdf')).default;
            if (!calculatorRef.current) return;
            const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${slug}.pdf`);
        } catch (_e) { alert('Esportazione PDF non disponibile.'); }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            const existing = JSON.parse(localStorage.getItem("calc_results") || "[]");
            localStorage.setItem("calc_results", JSON.stringify([payload, ...existing].slice(0, 50)));
            alert("Risultato salvato con successo!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(value);

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg-col-span-2">
                    <div ref={calculatorRef} className="bg-white rounded-lg shadow-md">
                         <div className="p-6">
                            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                            <p className="text-gray-600 mb-4">{meta.description}</p>
                            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                                <strong>Disclaimer:</strong> Questo calcolatore fornisce una stima a scopo informativo. I calcoli fiscali definitivi devono essere verificati da un professionista.
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border">
                                {inputs.map(input => {
                                    const conditionMet = !input.condition || (input.condition.includes('==') && states[input.condition.split(' ')[0]] === input.condition.split(' ')[2].replace(/'/g, ''));
                                    if (!conditionMet) return null;

                                    if (input.type === 'boolean') {
                                        return (
                                            <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-2 rounded-md bg-white border h-full">
                                                <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                                <label className="text-sm font-medium text-gray-700 flex-1" htmlFor={input.id}>{input.label}</label>
                                                {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-1.5"><InfoIcon /></span></Tooltip>}
                                            </div>
                                        );
                                    }
                                     if (input.type === 'select') {
                                        return (
                                            <div key={input.id}>
                                                 <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor={input.id}>{input.label} {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-1"><InfoIcon /></span></Tooltip>}</label>
                                                <select id={input.id} value={states[input.id]} onChange={e => handleStateChange(input.id, e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2">
                                                    {input.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                                </select>
                                            </div>
                                        );
                                    }
                                    return (
                                        <div key={input.id}>
                                            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor={input.id}>{input.label} {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-1"><InfoIcon /></span></Tooltip>}</label>
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">{input.unit}</span>
                                                <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 pl-7" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? 0 : Number(e.target.value))} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-8">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Risultati del Calcolo</h2>
                                <div className="p-4 bg-indigo-50 border-l-4 border-indigo-500 rounded-r-lg mb-4">
                                     <p className="text-sm text-indigo-700">Formula Applicata</p>
                                     <p className="text-base md:text-lg font-mono text-indigo-900 break-words">{`${states.renditaCatastale}€ (RC) × 1.05 × ${calculatedOutputs.coefficiente} (Coeff.) = ${isClient ? formatCurrency(calculatedOutputs.valoreCatastale) : '...'}`}</p>
                                </div>
                                <div className="space-y-3">
                                {outputs.map(output => (
                                    <div key={output.id} className="flex items-baseline justify-between bg-gray-50 p-3 rounded-md">
                                        <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                        <div className="text-xl font-bold text-gray-800">
                                            <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '€...'}</span>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </div>
                            
                             {states.valoreDiMercato > 0 && (
                                <div className="mt-8">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Confronto: Valore Fiscale vs. Valore di Mercato</h3>
                                    <div className="h-80 w-full bg-gray-50 p-4 rounded-lg">
                                        {isClient && (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis type="number" tickFormatter={(value) => `€${Number(value) / 1000}k`} />
                                                    <YAxis type="category" dataKey="name" width={120} />
                                                    <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                                    <Bar dataKey="value" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>
                                </div>
                             )}
                        </div>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
                         <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={salvaRisultato} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva</button>
                            <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full text-sm border border-red-200 rounded-md px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <ContentRenderer content={content} />
                    </section>
                     <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-3 text-gray-800">Riferimenti Normativi</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/fabbricatiterreni/visura-catastale/informazioni-visura-catastale" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Visura Catastale</a></li>
                            <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1986-04-26;131!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">D.P.R. n. 131/1986 (Testo Unico Imposta di Registro)</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default RenditaEValoreCatastaleCalculator;