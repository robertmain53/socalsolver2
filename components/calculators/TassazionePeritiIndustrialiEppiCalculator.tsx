'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';
import { FaFilePdf, FaSave, FaUndo } from 'react-icons/fa';

// --- Icona per i Tooltip ---
const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600 transition-colors">
        <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
);

// --- Componente Tooltip ---
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
    <div className="relative flex items-center group">
        {children}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-xs font-medium text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
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
                        "name": "Qual è il coefficiente di redditività per un Perito Industriale in Regime Forfettario?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Il coefficiente di redditività per i Periti Industriali e altri professionisti è del 78%. Questo significa che il reddito imponibile lordo è calcolato come il 78% del fatturato annuo."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "I contributi EPPI sono deducibili dalle tasse?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Sì, i contributi soggettivi versati all'EPPI sono interamente deducibili dal reddito imponibile sia in Regime Forfettario che in Regime Ordinario. Questo riduce la base su cui si calcolano le imposte."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "A quanto ammonta il contributo integrativo EPPI?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Il contributo integrativo EPPI è pari al 4% del volume d'affari lordo. Deve essere addebitato in fattura al cliente e versato dal professionista all'EPPI. Non concorre alla formazione del montante pensionistico."
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
                if (trimmedBlock.startsWith('### **')) return <h3 key={index} className="text-xl font-bold mt-6 mb-4 text-gray-800" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/^### \*\*/, '').replace(/\*\*$/, '')) }} />;
                if (trimmedBlock.startsWith('#### **')) return <h4 key={index} className="text-lg font-semibold mt-4 mb-3 text-gray-800" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/^#### \*\*/, '').replace(/\*\*$/, '')) }} />;
                if (trimmedBlock.startsWith('*')) return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{trimmedBlock.split('\n').map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item.replace(/^\*\s*/, '')) }} />)}</ul>;
                if (trimmedBlock) return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                return null;
            })}
        </div>
    );
};

// --- Dati e Logica del Calcolatore ---
const calculatorData = {
  "slug": "tassazione-periti-industriali-eppi",
  "category": "Fisco e Lavoro Autonomo",
  "title": "Calcolatore Tassazione per Periti Industriali (con EPPI)",
  "lang": "it",
  "inputs": [
    {
      "id": "regime_fiscale",
      "label": "Regime Fiscale Applicato",
      "type": "select",
      "options": ["Regime Forfettario", "Regime Ordinario Semplificato"],
      "tooltip": "Il Regime Forfettario offre una tassazione agevolata al 5% o 15% ma ha un limite di fatturato (85.000€) e non permette di dedurre i costi analitici. L'Ordinario applica l'IRPEF a scaglioni sul reddito reale (ricavi - costi)."
    },
    {
      "id": "fatturato_annuo",
      "label": "Fatturato Lordo Annuo",
      "type": "number",
      "unit": "€",
      "min": 0,
      "step": 1000,
      "defaultValue": 50000,
      "tooltip": "Inserire il totale dei ricavi incassati nell'anno solare, al lordo di tasse e contributi."
    },
    {
      "id": "nuova_attivita",
      "label": "Sei una nuova attività (primi 5 anni)?",
      "type": "boolean",
      "defaultValue": true,
      "condition": "regime_fiscale == 'Regime Forfettario'",
      "tooltip": "Per i primi 5 anni, il Regime Forfettario prevede un'imposta sostitutiva ridotta al 5% invece del 15% standard, a determinate condizioni."
    },
    {
      "id": "costi_deducibili",
      "label": "Costi di Esercizio Deducibili",
      "type": "number",
      "unit": "€",
      "min": 0,
      "step": 100,
      "defaultValue": 8000,
      "condition": "regime_fiscale == 'Regime Ordinario Semplificato'",
      "tooltip": "Inserire il totale dei costi sostenuti per l'attività professionale (es. software, utenze, affitto ufficio, materiali). Questi costi riducono la base imponibile solo in regime ordinario."
    }
  ],
  "outputs": [
    { "id": "reddito_imponibile", "label": "Reddito Imponibile Fiscale", "unit": "€" },
    { "id": "imposte_dovute", "label": "Imposte Dovute (IRPEF o Sostitutiva)", "unit": "€" },
    { "id": "contributi_eppi", "label": "Totale Contributi EPPI Dovuti", "unit": "€" },
    { "id": "totale_da_versare", "label": "Totale da Versare (Imposte + Contributi)", "unit": "€" },
    { "id": "netto_in_tasca", "label": "Netto Rimanente (Stimato)", "unit": "€" },
    { "id": "aliquota_effettiva", "label": "Aliquota Effettiva Complessiva", "unit": "%" }
  ],
  "formulaSteps": [
    {
      "id": "forfettario_reddito_imponibile_lordo",
      "expr": "Fatturato * 0.78 (Coefficiente di Redditività)"
    },
    {
      "id": "ordinario_reddito_imponibile_lordo",
      "expr": "Fatturato - Costi Deducibili"
    },
    {
      "id": "contributi_eppi_soggettivo",
      "expr": "Reddito Professionale Netto * 10% (con minimale)"
    },
    {
      "id": "reddito_imponibile_netto",
      "expr": "Reddito Imponibile Lordo - Contributi EPPI Soggettivi (versati nell'anno)"
    },
    {
      "id": "calcolo_imposte",
      "expr": "Reddito Imponibile Netto * Aliquota (5%, 15% o Scaglioni IRPEF)"
    }
  ],
  "examples": [
    {
      "inputs": {
        "regime_fiscale": "Regime Forfettario",
        "fatturato_annuo": 45000,
        "nuova_attivita": true,
        "costi_deducibili": 0
      },
      "outputs": {
        "imposte_dovute": "€ 1.579,50",
        "contributi_eppi": "€ 5.485,00",
        "netto_in_tasca": "€ 37.935,50"
      }
    }
  ],
  "tags": "tassazione periti industriali, calcolo tasse, EPPI, regime forfettario periti, contributi eppi, partita iva perito industriale, fisco, lavoro autonomo",
  "content": "### **Guida Completa alla Tassazione per Periti Industriali e iscritti EPPI**\n\n**Analisi dei Regimi Fiscali e del Calcolo Contributivo**\n\nLa gestione fiscale e contributiva è un aspetto cruciale per ogni libero professionista. Per i Periti Industriali, la corretta comprensione delle imposte e dei contributi dovuti alla cassa di previdenza **EPPI** (Ente di Previdenza dei Periti Industriali e dei Periti Industriali Laureati) è fondamentale per una pianificazione finanziaria efficace e per evitare sorprese.\n\nQuesto strumento interattivo è stato progettato per fornire una **stima chiara e dettagliata del carico fiscale e contributivo**, superando le semplici guide testuali. L'obiettivo è offrire un quadro realistico per aiutare i professionisti a navigare le complessità del sistema italiano.\n\n**Disclaimer**: Questo calcolatore offre una simulazione a scopo puramente informativo e non può sostituire una consulenza personalizzata da parte di un commercialista o di un consulente fiscale. I calcoli si basano sulla normativa vigente per l'anno 2025 e non tengono conto di tutte le variabili individuali (es. detrazioni per familiari a carico in regime ordinario).\n\n### **Parte 1: La Scelta del Regime Fiscale**\n\nUn Perito Industriale all'inizio della sua attività deve scegliere tra due principali regimi fiscali. Questa decisione impatta profondamente sul metodo di calcolo delle tasse.\n\n#### **Regime Forfettario**\n\nÈ un regime agevolato pensato per le Partite IVA con fatturato annuo inferiore a 85.000 €.\n\n* **Vantaggi**: Semplificazione contabile e tassazione ridotta. L'imposta non è l'IRPEF, ma un'**imposta sostitutiva** del **15%**, che scende al **5% per i primi 5 anni** di attività a determinate condizioni.\n* **Calcolo del Reddito**: Non si deducono i costi analiticamente. Il reddito imponibile si calcola applicando al fatturato un **coefficiente di redditività** fisso, che per i Periti Industriali è del **78%**. Ciò significa che lo Stato riconosce forfettariamente il 22% del fatturato come costi di esercizio.\n* **Svantaggi**: Non si possono \"scaricare\" i costi reali. Se le spese effettive superano il 22% del fatturato, potrebbe non essere conveniente. L'IVA non viene applicata in fattura.\n\n#### **Regime Ordinario Semplificato**\n\nÈ il regime standard per i professionisti.\n\n* **Calcolo del Reddito**: Il reddito imponibile è calcolato in modo analitico: **Reddito = Fatturato Lordo - Costi Deducibili**. Tutti i costi inerenti all'attività possono essere portati in deduzione.\n* **Tassazione**: Sul reddito imponibile si applica l'**IRPEF a scaglioni**, con aliquote progressive che partono dal 23%.\n* **Vantaggi**: Permette di dedurre tutti i costi reali sostenuti, risultando più vantaggioso se le spese sono elevate.\n* **Svantaggi**: Maggiore complessità contabile e aliquote fiscali potenzialmente più alte.\n\n### **Parte 2: I Contributi Previdenziali EPPI**\n\nL'iscrizione all'EPPI è obbligatoria per tutti i Periti Industriali iscritti all'albo che esercitano la libera professione. I contributi principali sono tre:\n\n1.  **Contributo Soggettivo**: È il contributo principale, obbligatorio, che costruisce la futura pensione. Si calcola in percentuale sul **reddito professionale netto**. L'aliquota ordinaria è del **10%**, ma è possibile optare per un'aliquota superiore (fino al 20%) per aumentare il montante pensionistico. È previsto un **contributo minimale** annuo (per il 2025, stimato intorno a 1.850 €).\n2.  **Contributo Integrativo**: È una maggiorazione del **4%** da applicare sul volume d'affari lordo e addebitare in fattura al cliente. Anche se pagato dal cliente, il professionista deve versarlo all'EPPI. Non contribuisce alla pensione. È previsto un **contributo minimale** annuo (per il 2025, stimato intorno a 550 €).\n3.  **Contributo di Maternità**: È un contributo fisso annuo, pagato da tutti gli iscritti per finanziare l'indennità di maternità delle colleghe. L'importo viene stabilito annualmente (per il 2025, stimato intorno a 85 €).\n\n#### **Deducibilità dei Contributi**\n\nUn aspetto fondamentale è che i **contributi soggettivi EPPI versati nell'anno sono interamente deducibili** dal reddito imponibile, sia in regime forfettario che ordinario. Questo riduce la base su cui si calcolano le imposte, generando un risparmio fiscale.\n\n### **Conclusione**\n\nLa scelta del regime fiscale e una corretta comprensione del sistema contributivo EPPI sono essenziali per la salute finanziaria di un Perito Industriale. Questo calcolatore permette di simulare diversi scenari di fatturato e costi, offrendo una visione chiara del proprio netto e aiutando a prendere decisioni più informate. Per una strategia fiscale ottimale, il confronto con un commercialista rimane il passo più importante."
};

const TassazionePeritiIndustrialiEppiCalculator: React.FC = () => {
    const { slug, title, inputs, content } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        regime_fiscale: "Regime Forfettario",
        fatturato_annuo: 50000,
        nuova_attivita: true,
        costi_deducibili: 8000,
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };
    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const { regime_fiscale, fatturato_annuo, costi_deducibili, nuova_attivita } = states;

        // Costanti EPPI 2025 (stimate)
        const MINIMALE_SOGGETTIVO = 1850;
        const MINIMALE_INTEGRATIVO = 550;
        const CONTRIBUTO_MATERNITA = 85;
        const COEFFICIENTE_FORFETTARIO = 0.78;

        let reddito_professionale, reddito_imponibile_fiscale, imposte_dovute;

        // Calcolo Contributi EPPI (la base di calcolo cambia, le aliquote no)
        const base_calcolo_soggettivo = regime_fiscale === 'Regime Forfettario'
            ? fatturato_annuo * COEFFICIENTE_FORFETTARIO
            : fatturato_annuo - costi_deducibili;
            
        const contributo_soggettivo_calcolato = Math.max(base_calcolo_soggettivo * 0.10, MINIMALE_SOGGETTIVO);
        const contributo_integrativo_calcolato = Math.max(fatturato_annuo * 0.04, MINIMALE_INTEGRATIVO);
        const contributi_eppi = contributo_soggettivo_calcolato + contributo_integrativo_calcolato + CONTRIBUTO_MATERNITA;

        if (regime_fiscale === 'Regime Forfettario') {
            const reddito_imponibile_lordo = fatturato_annuo * COEFFICIENTE_FORFETTARIO;
            // Si deducono i contributi versati nell'anno, per semplicità simuliamo che coincidano con quelli calcolati
            reddito_imponibile_fiscale = Math.max(0, reddito_imponibile_lordo - contributo_soggettivo_calcolato);
            const aliquota = nuova_attivita ? 0.05 : 0.15;
            imposte_dovute = reddito_imponibile_fiscale * aliquota;
        } else { // Regime Ordinario Semplificato
            reddito_professionale = Math.max(0, fatturato_annuo - costi_deducibili);
            // Anche qui, si deducono i contributi
            reddito_imponibile_fiscale = Math.max(0, reddito_professionale - contributo_soggettivo_calcolato);
            
            // Calcolo IRPEF a scaglioni 2025
            if (reddito_imponibile_fiscale <= 28000) {
                imposte_dovute = reddito_imponibile_fiscale * 0.23;
            } else if (reddito_imponibile_fiscale <= 50000) {
                imposte_dovute = (28000 * 0.23) + ((reddito_imponibile_fiscale - 28000) * 0.35);
            } else {
                imposte_dovute = (28000 * 0.23) + (22000 * 0.35) + ((reddito_imponibile_fiscale - 50000) * 0.43);
            }
        }

        const totale_da_versare = imposte_dovute + contributi_eppi;
        const netto_in_tasca = fatturato_annuo - totale_da_versare;
        const aliquota_effettiva = fatturato_annuo > 0 ? (totale_da_versare / fatturato_annuo) * 100 : 0;
        
        return {
            reddito_imponibile: reddito_imponibile_fiscale,
            imposte_dovute,
            contributi_eppi,
            totale_da_versare,
            netto_in_tasca,
            aliquota_effettiva,
        };
    }, [states]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
    
    const chartData = [
        { name: 'Netto Rimanente', value: Math.max(0, calculatedOutputs.netto_in_tasca) },
        { name: 'Imposte', value: Math.max(0, calculatedOutputs.imposte_dovute) },
        { name: 'Contributi EPPI', value: Math.max(0, calculatedOutputs.contributi_eppi) },
    ];
    const COLORS = ['#22c55e', '#ef4444', '#3b82f6'];

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                {/* Colonna Principale */}
                <div className="lg:col-span-2 space-y-6" ref={calculatorRef}>
                    <div className=" -lg -md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">Simula il tuo carico fiscale e contributivo per pianificare al meglio la tua attività professionale.</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una stima a scopo puramente informativo e non sostituisce una consulenza fiscale personalizzata.
                        </div>
                        {/* Input Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                            {inputs.map(input => {
                                const conditionMet = !input.condition || (input.condition.includes('==') && states[input.condition.split(' ')[0]] === input.condition.split("'")[1]);
                                if (!conditionMet) return null;

                                const inputLabel = <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>{input.label}{input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}</label>;
                                
                                if (input.type === 'select') return <div key={input.id} className="md:col-span-2">{inputLabel}<select id={input.id} value={states[input.id]} onChange={e => handleStateChange(input.id, e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2">{input.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>;
                                
                                if (input.type === 'boolean') return <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-2 rounded-md bg-white border"><input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={!!states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />{inputLabel}</div>;

                                return <div key={input.id}>{inputLabel}<div className="flex items-center gap-2"><input id={input.id} type="number" min={input.min} step={input.step} value={states[input.id]} onChange={e => handleStateChange(input.id, Number(e.target.value))} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" /><span className="text-sm font-semibold text-gray-500">{input.unit}</span></div></div>;
                            })}
                        </div>
                    </div>
                    {/* Results Section */}
                    <div className=" -lg -md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Risultati della Simulazione</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Ripartizione Grafica */}
                            <div className="flex flex-col items-center justify-center">
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione del Fatturato</h3>
                                <div className="h-52 w-52">
                                    {isClient && (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => { const radius = innerRadius + (outerRadius - innerRadius) * 0.5; const x = cx + radius * Math.cos(-midAngle * Math.PI / 180); const y = cy + radius * Math.sin(-midAngle * Math.PI / 180); return (<text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central"> {`${(percent * 100).toFixed(0)}%`}</text>);}}>
                                                    {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                                </Pie>
                                                <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                                 <div className="flex justify-center flex-wrap mt-2 text-xs gap-x-4">
                                    {chartData.map((entry, index) => (
                                    <div key={index} className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index] }}></div><span>{entry.name}</span></div>
                                    ))}
                                </div>
                            </div>
                            {/* Dati numerici */}
                            <div className="space-y-3">
                                {calculatorData.outputs.map(output => (
                                    <div key={output.id} className={`flex justify-between items-baseline p-3 rounded-md ${output.id === 'netto_in_tasca' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-gray-50'}`}>
                                        <span className="text-sm font-medium text-gray-700">{output.label}</span>
                                        <span className={`text-lg font-bold ${output.id === 'netto_in_tasca' ? 'text-green-700' : 'text-gray-800'}`}>
                                            {isClient ? (output.unit === '%' ? (calculatedOutputs as any)[output.id].toFixed(2) + '%' : formatCurrency((calculatedOutputs as any)[output.id])) : '...'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="lg:col-span-1 space-y-6">
                     <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="flex flex-col space-y-2">
                             <button onClick={() => {}} className="flex items-center justify-center gap-2 w-full border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-100 transition-colors"><FaSave /> Salva Risultato</button>
                             <button onClick={() => {}} className="flex items-center justify-center gap-2 w-full border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-100 transition-colors"><FaFilePdf /> Esporta PDF</button>
                             <button onClick={handleReset} className="flex items-center justify-center gap-2 w-full border border-red-300 text-red-700 rounded-md px-3 py-2 text-sm hover:bg-red-50 transition-colors"><FaUndo /> Reset</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida alla Comprensione</h2>
                        <ContentRenderer content={content} />
                    </section>
                     <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.eppi.it/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Sito Ufficiale EPPI</a> - Ente Previdenza Periti Industriali.</li>
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/istanze/regime-forfetario-art-1-commi-54-89-l-190-2014" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Regime Forfettario</a>.</li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default TassazionePeritiIndustrialiEppiCalculator;