'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

export const meta = {
    title: "Calcolatore Costo Cappotto Termico 2025 con Incentivi (Ecobonus)",
    description: "Stima il costo del cappotto termico al mq, calcola gli incentivi (Ecobonus, Bonus Ristrutturazione) e scopri il costo finale netto e il risparmio in bolletta."
};

// --- Icona per i Tooltip (SVG inline) ---
const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600 transition-colors">
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
                        "name": "Quanto costa un cappotto termico al metro quadro nel 2025?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Il costo di un cappotto termico varia in base al materiale isolante, alla complessità del cantiere e alla località. In media, il prezzo 'chiavi in mano' si attesta tra i 70€ e i 150€ al metro quadro. Questo calcolatore ti aiuta a stimare il costo totale in base alla tua situazione."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Quali incentivi fiscali ci sono per il cappotto termico?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Per il 2025, i principali incentivi sono l'Ecobonus per i condomini (detrazione del 70% su una spesa massima di 40.000€ per unità) e il Bonus Ristrutturazione (detrazione del 50% su una spesa massima di 96.000€), accessibile anche per le case singole."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Quanto si risparmia in bolletta con il cappotto termico?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Il risparmio energetico è significativo e può arrivare fino al 40-50% sui costi di riscaldamento e raffrescamento. Il risparmio esatto dipende dalla situazione di partenza dell'edificio e dalla qualità dell'intervento. Inserendo la tua spesa annua attuale, il calcolatore può fornire una stima del risparmio."
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
                if (trimmedBlock.startsWith('####')) {
                    const title = trimmedBlock.replace(/####\s*/, '');
                    return <h4 key={index} className="text-lg font-semibold mt-4 mb-3 text-gray-700" dangerouslySetInnerHTML={{ __html: processInlineFormatting(title) }} />;
                }
                 if (trimmedBlock.match(/^\d\.\s/)) {
                    return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                }
                if (trimmedBlock.startsWith('*')) {
                     const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
                    return (
                        <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
                            {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}
                        </ul>
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

// --- Dati di configurazione del calcolatore (dal JSON) ---
const calculatorData = {
  "slug": "costo-cappotto-termico-incentivi", "category": "Immobiliare e Casa", "title": "Calcolatore Costo Cappotto Termico (con incentivi)", "lang": "it",
  "inputs": [
    { "id": "superficie_pareti", "label": "Superficie da Isolare", "type": "number", "unit": "m²", "min": 10, "step": 5, "tooltip": "Inserisci l'area totale in metri quadri delle pareti esterne su cui verrà installato il cappotto termico." },
    { "id": "costo_al_mq", "label": "Costo Medio al m²", "type": "number", "unit": "€", "min": 40, "step": 5, "tooltip": "Stima del costo complessivo per metro quadro. Include materiale isolante, manodopera, ponteggi e finiture. Un valore tipico varia da 70€ a 150€." },
    { "id": "tipo_edificio", "label": "Tipo di Edificio", "type": "select", "options": ["Casa Singola / Unifamiliare", "Condominio"], "tooltip": "La scelta influisce sui massimali di spesa e sugli incentivi applicabili." },
    { "id": "numero_unita", "label": "Numero Unità Immobiliari", "type": "number", "unit": "unità", "min": 2, "step": 1, "condition": "tipo_edificio == 'Condominio'", "tooltip": "Indica il numero di appartamenti che compongono il condominio. Il massimale di spesa agevolabile viene moltiplicato per questo numero." },
    { "id": "spese_tecniche", "label": "Spese Tecniche Professionali", "type": "number", "unit": "€", "min": 0, "step": 100, "tooltip": "Costi per il progettista, direttore lavori, certificazioni energetiche (APE), ecc. Anch'esse sono detraibili." },
    { "id": "incentivo", "label": "Incentivo Fiscale Applicabile", "type": "select", "options": ["Bonus Ristrutturazione 50%", "Ecobonus Condomini 70%"], "tooltip": "Seleziona il bonus fiscale. Il Bonus Ristrutturazione è per tutti, l'Ecobonus potenziato è specifico per interventi su parti comuni dei condomini." },
    { "id": "costo_bollette_annuo", "label": "Spesa Annua per Riscaldamento/Raffrescamento", "type": "number", "unit": "€", "min": 0, "step": 50, "tooltip": "Indica la tua spesa annuale attuale per riscaldare e raffrescare la casa. Serve a stimare il tempo di rientro dell'investimento." }
  ],
  "outputs": [
    { "id": "costo_totale_intervento", "label": "Costo Totale dell'Intervento", "unit": "€" }, { "id": "importo_detrazione", "label": "Importo Totale Detrazione Fiscale", "unit": "€" }, { "id": "costo_finale_netto", "label": "Costo Finale a Tuo Carico", "unit": "€" }, { "id": "detrazione_annuale", "label": "Recupero Fiscale Annuo (per 10 anni)", "unit": "€" }, { "id": "risparmio_energetico_annuo", "label": "Risparmio Stimato in Bolletta", "unit": "€/anno" }, { "id": "anni_rientro_investimento", "label": "Anni per il Rientro dell'Investimento", "unit": "anni" }
  ],
  "content": "### **Guida Completa al Cappotto Termico: Costi, Incentivi e Vantaggi**\n\n**Un'analisi dettagliata per pianificare il tuo investimento in efficienza energetica**\n\nL'installazione di un cappotto termico è uno degli interventi più efficaci per migliorare il comfort abitativo e ridurre drasticamente i costi energetici di un edificio. Grazie agli incentivi fiscali, questo investimento è oggi più accessibile che mai. Questo strumento ti aiuta a stimare i costi, il bonus a cui hai diritto e il reale esborso finale. **Ricorda che i risultati sono una simulazione: per un progetto esecutivo e una contabilità precisa, è indispensabile affidarsi a un tecnico qualificato (geometra, architetto o ingegnere).**\n\n### **Parte 1: I Vantaggi di un Cappotto Termico Ben Fatto**\n\nIsolare termicamente un edificio non significa solo 'avere meno freddo d'inverno'. I benefici sono molteplici e duraturi:\n\n* **Risparmio Energetico Drastico**: Un buon isolamento può ridurre i consumi per il riscaldamento e il raffrescamento **fino al 40-50%**, con un impatto diretto e positivo sulla bolletta.\n* **Comfort Abitativo Superiore**: La temperatura interna diventa più stabile e omogenea, eliminando spifferi e zone fredde vicino alle pareti. L'ambiente è più salubre, con una drastica riduzione del rischio di muffe e condense.\n* **Aumento del Valore dell'Immobile**: Un edificio con un'alta efficienza energetica (classe A, B) ha un valore di mercato superiore e si vende o affitta più facilmente.\n* **Isolamento Acustico**: Molti materiali isolanti offrono anche un'ottima protezione contro i rumori esterni.\n\n### **Parte 2: Analisi dei Costi: Cosa Influenza il Prezzo Finale?**\n\nIl costo di un cappotto termico si misura in €/m² e dipende da vari fattori:\n\n1.  **Materiale Isolante**: È la voce più variabile. I più comuni sono:\n    * **EPS (Polistirene Espanso Sinterizzato)**: Il più economico e diffuso, con buone prestazioni.\n    * **Lana di Roccia**: Ottima per isolamento sia termico che acustico, e incombustibile.\n    * **Sughero o Fibra di Legno**: Materiali naturali, ecologici e traspiranti, con un costo superiore.\n2.  **Ponteggi**: Un costo fisso significativo, che incide meno su edifici molto grandi.\n3.  **Manodopera**: La qualità della posa è fondamentale per la riuscita dell'intervento.\n4.  **Spese Tecniche**: Comprendono il progetto, la direzione lavori, le pratiche edilizie e le certificazioni energetiche (APE pre e post intervento), necessarie per accedere ai bonus.\n\n### **Parte 3: Guida agli Incentivi Fiscali per il 2025**\n\nLo Stato incentiva fortemente gli interventi di riqualificazione energetica. Per il cappotto termico, le principali agevolazioni attualmente in vigore sono:\n\n#### **1. Ecobonus Condomini (70%)**\n\nÈ l'incentivo più vantaggioso, dedicato ai **condomini** per interventi sulle parti comuni.\n* **Detrazione**: **70%** delle spese sostenute.\n* **Massimale di Spesa**: **40.000 €** moltiplicato per il numero delle unità immobiliari del condominio.\n* **Requisiti**: L'intervento deve interessare almeno il 25% della superficie disperdente lorda dell'edificio.\n\n#### **2. Bonus Ristrutturazione (50%)**\n\nQuesta detrazione è accessibile sia per le **case singole** che per i **condomini**.\n* **Detrazione**: **50%** delle spese sostenute.\n* **Massimale di Spesa**: **96.000 €** per unità immobiliare. L'installazione del cappotto rientra tra i lavori di manutenzione straordinaria finalizzati al risparmio energetico.\n\nIn entrambi i casi, la detrazione fiscale viene ripartita in **10 rate annuali** di pari importo, da scalare dall'IRPEF dovuta."
};


const CostoCappottoTermicoIncentiviCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates: { [key: string]: any } = {
        superficie_pareti: 120, costo_al_mq: 85, tipo_edificio: "Casa Singola / Unifamiliare",
        numero_unita: 2, spese_tecniche: 3500, incentivo: "Bonus Ristrutturazione 50%", costo_bollette_annuo: 1800
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => setStates(prev => ({ ...prev, [id]: value }));
    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const { superficie_pareti, costo_al_mq, tipo_edificio, numero_unita, spese_tecniche, incentivo, costo_bollette_annuo } = states;

        const costo_lavori = superficie_pareti * costo_al_mq;
        const costo_totale_intervento = costo_lavori + spese_tecniche;
        
        const percentuale_detrazione = incentivo === 'Bonus Ristrutturazione 50%' ? 0.50 : 0.70;
        const massimale_unitario = incentivo === 'Bonus Ristrutturazione 50%' ? 96000 : 40000;
        const moltiplicatore_unita = tipo_edificio === 'Condominio' ? numero_unita : 1;
        
        const massimale_spesa_totale = massimale_unitario * moltiplicatore_unita;
        const spesa_detraibile = Math.min(costo_totale_intervento, massimale_spesa_totale);
        
        const importo_detrazione = spesa_detraibile * percentuale_detrazione;
        const detrazione_annuale = importo_detrazione / 10;
        const costo_finale_netto = costo_totale_intervento - importo_detrazione;
        
        const risparmio_energetico_annuo = costo_bollette_annuo * 0.35; // Stima media del 35%
        const anni_rientro_investimento = risparmio_energetico_annuo > 0 ? costo_finale_netto / risparmio_energetico_annuo : Infinity;

        return { costo_totale_intervento, importo_detrazione, costo_finale_netto, detrazione_annuale, risparmio_energetico_annuo, anni_rientro_investimento };
    }, [states]);
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
    const formatYears = (value: number) => value === Infinity ? "N/A" : `${value.toFixed(1)} anni`;

    const chartData = [
        { name: 'Costo Totale', value: calculatedOutputs.costo_totale_intervento, fill: '#ef4444' },
        { name: 'Incentivo Fiscale', value: calculatedOutputs.importo_detrazione, fill: '#f97316' },
        { name: 'Costo Netto Finale', value: calculatedOutputs.costo_finale_netto, fill: '#22c55e' },
    ];

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2">
                    <div ref={calcolatoreRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">Stima i costi e i benefici del tuo intervento di isolamento termico a cappotto.</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento fornisce una stima a scopo puramente informativo. Le cifre reali possono variare. È indispensabile la consulenza di un tecnico qualificato.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 bg-slate-50 p-4 rounded-lg">
                             {inputs.map(input => {
                                const conditionMet = !input.condition || (input.condition.includes('==') && String(states[input.condition.split(' ')[0]]) === String(input.condition.split("'")[1]));
                                if (!conditionMet) return null;

                                const label = (
                                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                        {input.label}
                                        <Tooltip text={input.tooltip}><span className="ml-1.5"><InfoIcon /></span></Tooltip>
                                    </label>
                                );
                                
                                if (input.type === 'select') {
                                    return (<div key={input.id} className="md:col-span-2">
                                        {label}
                                        <select id={input.id} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 bg-white">
                                            {input.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>);
                                }
                                return (<div key={input.id}>
                                    {label}
                                    <div className="relative">
                                         <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pr-12 pl-3 py-2 text-right" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? 0 : Number(e.target.value))} />
                                         <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 pointer-events-none">{input.unit}</span>
                                    </div>
                                </div>);
                            })}
                        </div>
                        
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Risultati della Stima</h2>
                            <div className="space-y-3">
                                {outputs.map(output => (
                                    <div key={output.id} className={`flex items-baseline justify-between p-4 rounded-lg ${output.id === 'costo_finale_netto' ? 'bg-green-50' : 'bg-gray-50'}`}>
                                        <div className="text-sm font-medium text-gray-600">{output.label}</div>
                                        <div className={`text-xl font-bold ${output.id === 'costo_finale_netto' ? 'text-green-600' : 'text-gray-800'}`}>
                                            {isClient ? (output.unit === 'anni' ? formatYears(calculatedOutputs[output.id as keyof typeof calculatedOutputs] as number) : formatCurrency(calculatedOutputs[output.id as keyof typeof calculatedOutputs] as number)) : '...'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Ripartizione dei Costi e Benefici</h3>
                            <div className="h-80 w-full bg-slate-50 p-4 rounded-lg">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                            <XAxis dataKey="name" />
                                            <YAxis tickFormatter={(value) => `€${Number(value) / 1000}k`} />
                                            <ChartTooltip formatter={(value: number) => formatCurrency(value)} cursor={{ fill: 'rgba(230, 230, 230, 0.5)' }} />
                                            <Bar dataKey="value" barSize={60}>
                                                {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                 <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-1 gap-3">
                             <button onClick={()=>{}} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Stima</button>
                             <button onClick={()=>{}} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta in PDF</button>
                             <button onClick={handleReset} className="w-full text-sm border border-red-200 text-red-700 rounded-md px-3 py-2 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida all'Intervento</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/agevolazioni/detrazione-riqualificazione-energetica-55" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Ecobonus</a></li>
                            <li><a href="https://www.efficienzaenergetica.enea.it/detrazioni-fiscali.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">ENEA - Portale Efficienza Energetica</a></li>
                            <li><a href="https://www.gse.it" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">GSE - Gestore Servizi Energetici</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default CostoCappottoTermicoIncentiviCalculator;