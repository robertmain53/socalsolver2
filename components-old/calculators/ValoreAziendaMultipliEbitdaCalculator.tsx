'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import dynamic from 'next/dynamic';
import Head from 'next/head';

// --- TIPI PER I DATI DI CONFIGURAZIONE ---
type InputField = {
  id: string;
  label: string;
  type: 'number' | 'select';
  unit?: string;
  min?: number;
  step?: number;
  tooltip: string;
  options?: { value: string; label: string }[];
};

type OutputField = {
  id: string;
  label: string;
  unit: string;
};

// TIPO CORRETTO - Aggiunte category e lang
type CalculatorData = {
  slug: string;
  category: string; // <-- AGGIUNTO
  title: string;
  lang: string; // <-- AGGIUNTO
  inputs: InputField[];
  outputs: OutputField[];
  formulaSteps: { id: string; expr: string; description: string }[];
  content: string;
  seoSchema: object;
};

// --- COMPONENTI UI ATOMICI ---
const InfoIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600 transition-colors">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const Tooltip: React.FC<{ text: string, children: React.ReactNode }> = ({ text, children }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-sm text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// --- COMPONENTE PER INIETTARE DATI STRUTTURATI SEO ---
const SchemaInjector: React.FC<{ schema: object }> = ({ schema }) => (
  <Head>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  </Head>
);

// --- COMPONENTE PER IL RENDERING DEL CONTENUTO MARKDOWN ---
const ContentRenderer: React.FC<{ content: string }> = ({ content }) => {
    const renderMarkdown = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');
    const sections = content.split('\n\n');
    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {sections.map((section, index) => {
                const trimmed = section.trim();
                if (trimmed.startsWith('### **')) return <h3 key={index} className="text-xl font-bold mt-6 mb-4 text-gray-800" dangerouslySetInnerHTML={{ __html: renderMarkdown(trimmed.replace(/### \*\*/, '').replace(/\*\*$/, '')) }} />;
                if (trimmed.startsWith('####')) return <h4 key={index} className="text-lg font-semibold mt-4 mb-3 text-gray-800" dangerouslySetInnerHTML={{ __html: renderMarkdown(trimmed.replace(/####\s*/, '')) }} />;
                if (trimmed.startsWith('* ')) return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{trimmed.split('\n').map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: renderMarkdown(item.replace(/^\*\s*/, '')) }} />)}</ul>;
                if (trimmed.match(/^\d\.\s/)) return <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">{trimmed.split('\n').map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: renderMarkdown(item.replace(/^\d\.\s*/, '')) }} />)}</ol>;
                return <p key={index} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMarkdown(trimmed) }} />;
            })}
        </div>
    );
};


// --- LAZY LOADING DEL GRAFICO ---
const DynamicBarChart = dynamic(() => import('recharts').then(mod => {
    const { BarChart, Bar, XAxis, YAxis, Tooltip: ChartTooltip, ResponsiveContainer, Legend } = mod;
    
    const CustomBarChart: React.FC<{ data: any[] }> = ({ data }) => (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" tickFormatter={(value) => `€${value / 1_000_000}M`} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                <ChartTooltip
                    formatter={(value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', notation: 'compact' }).format(value)}
                    cursor={{ fill: 'rgba(239, 246, 255, 0.7)' }}
                 />
                <Legend />
                <Bar dataKey="Valore" fill="#4f46e5" />
            </BarChart>
        </ResponsiveContainer>
    );
    return CustomBarChart;
}), {
    loading: () => <div className="flex items-center justify-center h-full text-gray-500">Caricamento grafico...</div>,
    ssr: false,
});


// --- DATI DI CONFIGURAZIONE DEL CALCOLATORE ---
const calculatorData: CalculatorData = {
  "slug": "valore-azienda-multipli-ebitda", "category": "PMI e Impresa", "title": "Calcolatore Valore di un'Azienda (metodo multipli EBITDA)", "lang": "it",
  "inputs": [
    { "id": "ebitda", "label": "EBITDA (Margine Operativo Lordo)", "type": "number", "unit": "€", "min": 0, "step": 10000, "tooltip": "Inserisci l'EBITDA, ovvero l'utile prima di interessi, tasse, svalutazioni e ammortamenti. È un indicatore chiave della redditività operativa dell'azienda." },
    { "id": "settore_aziendale", "label": "Settore di Appartenenza", "type": "select", "options": [ { "value": "6.5", "label": "Manifatturiero / Industriale (6x - 8x)" }, { "value": "7.5", "label": "Commercio / Retail (7x - 9x)" }, { "value": "12.0", "label": "Software / SaaS (10x - 15x)" }, { "value": "9.0", "label": "Servizi Professionali / IT (8x - 11x)" }, { "value": "10.0", "label": "Salute / Farmaceutico (9x - 12x)" }, { "value": "5.5", "label": "Edilizia / Costruzioni (4x - 6x)" }, { "value": "8.0", "label": "Alimentare / Food & Beverage (7x - 10x)" }, { "value": "7.0", "label": "Trasporti / Logistica (6x - 8x)" } ], "tooltip": "Il multiplo varia significativamente per settore. Seleziona il settore più vicino alla tua attività per applicare un multiplo standard di mercato." },
    { "id": "posizione_finanziaria_netta", "label": "Posizione Finanziaria Netta (PFN)", "type": "number", "unit": "€", "step": 10000, "tooltip": "È la differenza tra debiti finanziari e liquidità. Inserisci un valore positivo per un debito netto (es. 100.000) o un valore negativo per una cassa netta (es. -50.000)." }
  ],
  "outputs": [
    { "id": "equity_value", "label": "Equity Value Stimato (Valore per i soci)", "unit": "€" },
    { "id": "enterprise_value", "label": "Enterprise Value Stimato (Valore dell'azienda)", "unit": "€" },
    { "id": "valore_range", "label": "Range di Valutazione Stimato (Equity Value)", "unit": "€" }
  ],
  "formulaSteps": [
    { "id": "multiplo_selezionato", "expr": "parseFloat(settore_aziendale)", "description": "Multiplo medio basato sul settore selezionato." },
    { "id": "enterprise_value", "expr": "ebitda * multiplo_selezionato", "description": "Calcolo dell'Enterprise Value (EV)." },
    { "id": "equity_value", "expr": "enterprise_value - posizione_finanziaria_netta", "description": "Calcolo dell'Equity Value, sottraendo la PFN dall'EV." },
    { "id": "multiplo_min", "expr": "multiplo_selezionato > 2 ? multiplo_selezionato - 1.5 : multiplo_selezionato * 0.8", "description": "Calcolo di un multiplo minimo per il range di valutazione." },
    { "id": "multiplo_max", "expr": "multiplo_selezionato + 2.0", "description": "Calcolo di un multiplo massimo per il range di valutazione." },
    { "id": "equity_value_min", "expr": "(ebitda * multiplo_min) - posizione_finanziaria_netta", "description": "Valore minimo del range." },
    { "id": "equity_value_max", "expr": "(ebitda * multiplo_max) - posizione_finanziaria_netta", "description": "Valore massimo del range." }
  ],
  "content": "### **Guida Completa alla Valutazione d'Azienda con i Multipli dell'EBITDA**\n\nDeterminare il valore di un'azienda è un processo complesso, cruciale per operazioni di vendita, acquisizione (M&A), ricerca di investimenti o semplice pianificazione strategica. Il metodo dei multipli dell'EBITDA è uno degli approcci più diffusi per ottenere una stima rapida e di mercato.\n\nQuesto strumento è progettato per imprenditori, manager e consulenti che necessitano di una valutazione preliminare, chiara e basata su benchmark di settore.\n\n### **Parte 1: La Logica del Metodo dei Multipli**\n\nIl metodo si basa su un principio semplice: il valore di un'azienda (Enterprise Value) può essere espresso come un **multiplo** della sua capacità di generare profittabilità operativa, misurata dall'**EBITDA**.\n\nLa formula di base è:\n**Enterprise Value (EV) = EBITDA × Multiplo di Settore**\n\nSuccessivamente, per trovare il valore per i soci (Equity Value), si sottrae l'indebitamento:\n**Equity Value = Enterprise Value - Posizione Finanziaria Netta (PFN)**\n\n#### **1. EBITDA (Earnings Before Interest, Taxes, Depreciation, and Amortization)**\nÈ il **Margine Operativo Lordo**, un indicatore che misura la performance della gestione caratteristica dell'azienda, ignorando gli effetti delle politiche fiscali (Taxes), finanziarie (Interest) e di ammortamento (Depreciation & Amortization). È apprezzato perché offre una visione 'pura' della capacità dell'azienda di generare cassa dalla sua attività principale.\n\n#### **2. Il Multiplo**\nQuesto è il fattore più critico e soggettivo. Rappresenta 'quante volte' il mercato è disposto a pagare l'EBITDA di un'azienda in un determinato settore. Un multiplo più alto suggerisce maggiori aspettative di crescita e minore rischio. I fattori che lo influenzano sono:\n* **Settore di appartenenza**: Settori in rapida crescita come il software hanno multipli molto più alti rispetto a settori maturi come l'edilizia.\n* **Dimensioni dell'azienda**: Le grandi aziende consolidate tendono ad avere multipli più alti.\n* **Tassi di crescita**: Aziende con una crescita storica e prospettica elevata spuntano multipli migliori.\n* **Posizionamento competitivo**: Leadership di mercato, barriere all'ingresso e marchi forti aumentano il multiplo.\n\n#### **3. Posizione Finanziaria Netta (PFN)**\nIndica l'esposizione debitoria dell'azienda. Si calcola come: **Debiti Finanziari (a breve e lungo termine) - Liquidità e Crediti Finanziari**. \n* Una **PFN positiva** indica un debito netto.\n* Una **PFN negativa** indica una cassa netta, che si aggiunge al valore per i soci.\n\n### **Parte 2: I Limiti del Metodo e Quando Usarlo**\n\nSebbene rapido e intuitivo, il metodo dei multipli dell'EBITDA ha dei **limiti significativi** che è fondamentale conoscere per non commettere errori di valutazione:\n\n1.  **Ignora gli Investimenti (CAPEX)**: L'EBITDA non considera gli investimenti in capitale fisso necessari per sostenere la crescita. Due aziende con lo stesso EBITDA potrebbero avere necessità di investimento radicalmente diverse.\n2.  **Non considera il Capitale Circolante**: Variazioni nel capitale circolante (crediti, debiti, magazzino) possono avere un impatto enorme sulla cassa effettivamente generata.\n3.  **È una 'fotografia'**: Si basa su dati storici e non cattura in modo esplicito le dinamiche future, a meno che non si utilizzi un EBITDA 'normalizzato' o atteso.\n4.  **La scelta del multiplo è delicata**: Usare un multiplo di settore medio per un'azienda con caratteristiche specifiche può portare a stime errate.\n\n**Quando è più utile?** È perfetto per una **prima stima**, per confronti rapidi tra aziende dello stesso settore e come 'sanity check' per validare i risultati di metodi più complessi come il Discounted Cash Flow (DCF).\n\n### **Parte 3: Altri Metodi di Valutazione**\n\nPer una valutazione completa, è prassi affiancare al metodo dei multipli altri approcci:\n\n* **Metodo Finanziario (DCF - Discounted Cash Flow)**: Considerato il più completo, attualizza i flussi di cassa futuri attesi dell'azienda. È più complesso ma cattura meglio le dinamiche specifiche dell'impresa.\n* **Metodo Patrimoniale**: Valuta l'azienda sulla base del valore di mercato dei suoi singoli asset, al netto delle passività. Utile per holding o aziende con importanti asset immobiliari.\n\n### **Conclusione**\n\nUtilizza questo calcolatore come un potente punto di partenza per comprendere l'ordine di grandezza del valore della tua azienda. La stima fornisce un range plausibile basato su benchmark di mercato. Per una valutazione formale e difendibile in sede di negoziazione, è sempre consigliabile rivolgersi a un professionista della finanza aziendale che possa applicare diversi metodi e analizzare in profondità le specificità del business.",
  "seoSchema": { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [ { "@type": "Question", "name": "Come si calcola il valore di un'azienda con l'EBITDA?", "acceptedAnswer": { "@type": "Answer", "text": "Il valore di un'azienda (Enterprise Value) si calcola moltiplicando il suo EBITDA (Margine Operativo Lordo) per un 'multiplo' specifico del settore di appartenenza. Per ottenere il valore per gli azionisti (Equity Value), si sottrae la Posizione Finanziaria Netta (debiti meno cassa) dall'Enterprise Value." } }, { "@type": "Question", "name": "Cos'è l'Enterprise Value e qual è la differenza con l'Equity Value?", "acceptedAnswer": { "@type": "Answer", "text": "L'Enterprise Value (EV) rappresenta il valore totale dell'azienda, comprensivo sia del capitale proprio che del debito. È il prezzo teorico di acquisizione. L'Equity Value, invece, rappresenta il valore spettante ai soli soci/azionisti e si ottiene sottraendo i debiti netti dall'EV." } }, { "@type": "Question", "name": "Perché questo metodo di valutazione è considerato una stima?", "acceptedAnswer": { "@type": "Answer", "text": "È una stima perché si basa su multipli di mercato medi e non tiene conto di fattori specifici dell'azienda come il management, il posizionamento competitivo, il potenziale di crescita unico o le necessità di investimento (CAPEX). Metodi più accurati, come il DCF, analizzano i flussi di cassa futuri attesi." } }, { "@type": "Question", "name": "Come viene scelto il multiplo EBITDA corretto?", "acceptedAnswer": { "@type": "Answer", "text": "Il multiplo corretto dipende da numerosi fattori: il settore di mercato, le dimensioni dell'azienda, i tassi di crescita attesi, la marginalità e il rischio percepito. Viene determinato analizzando le valutazioni di aziende comparabili (quotate in borsa) o le transazioni di M&A recenti nello stesso settore." } } ] }
};


// --- COMPONENTE PRINCIPALE DEL CALCOLATORE ---
const ValoreAziendaMultipliEbitdaCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, formulaSteps, content, seoSchema } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates: { [key: string]: any } = {
        ebitda: 500000,
        settore_aziendale: '6.5',
        posizione_finanziaria_netta: 200000,
    };
    const [states, setStates] = useState(initialStates);

    const handleStateChange = (id: string, value: any) => setStates(prev => ({ ...prev, [id]: value }));
    const handleReset = useCallback(() => setStates(initialStates), [initialStates]);

    const calculatedOutputs = useMemo(() => {
        const context = { ...states };
        const results: { [key: string]: number | string } = {};
        const evaluate = (expr: string): any => {
            try {
                // This is a simplified, scoped evaluation. Be cautious with complex expressions.
                const func = new Function(...Object.keys(context), `return ${expr}`);
                return func(...Object.values(context)) || 0;
            } catch (e) { console.error(`Error evaluating expression: "${expr}"`, e); return 0; }
        };
        formulaSteps.forEach(step => {
            const value = evaluate(step.expr);
            results[step.id] = value;
            (context as any)[step.id] = value;
        });

        const equity_value_min_num = results.equity_value_min as number;
        const equity_value_max_num = results.equity_value_max as number;
        results.valore_range = `${new Intl.NumberFormat('it-IT').format(equity_value_min_num)} - ${new Intl.NumberFormat('it-IT').format(equity_value_max_num)}`;

        return results;
    }, [states, formulaSteps]);

    const chartData = useMemo(() => [
        { name: 'Valore Minimo', Valore: calculatedOutputs.equity_value_min as number || 0 },
        { name: 'Valore Medio', Valore: calculatedOutputs.equity_value as number || 0 },
        { name: 'Valore Massimo', Valore: calculatedOutputs.equity_value_max as number || 0 },
    ], [calculatedOutputs]);

    const handleExportPDF = useCallback(async () => {
        const { default: jsPDF } = await import('jspdf');
        const { default: html2canvas } = await import('html2canvas');
        if (!calculatorRef.current) return;
        const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'pt', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${slug}-valutazione.pdf`);
    }, [slug]);

    const handleSaveResult = useCallback(() => {
        try {
            const resultToSave = { title, slug, timestamp: new Date().toISOString(), inputs: states, outputs: calculatedOutputs };
            const history = JSON.parse(localStorage.getItem('calculatorHistory') || '[]');
            history.unshift(resultToSave);
            localStorage.setItem('calculatorHistory', JSON.stringify(history.slice(0, 10)));
            alert('Risultato salvato!');
        } catch (e) { alert('Impossibile salvare il risultato.'); }
    }, [slug, title, states, calculatedOutputs]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value || 0);
    const formulaText = "Equity Value = (EBITDA × Multiplo di Settore) - Posizione Finanziaria Netta";

    return (
        <>
            <SchemaInjector schema={seoSchema} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <main className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md">
                        <div className="p-6" ref={calculatorRef}>
                            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                            <p className="text-gray-600 mb-6">Ottieni una stima rapida del valore della tua azienda basata su benchmark di mercato.</p>
                            <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
                                <strong>DISCLAIMER:</strong> Questo strumento fornisce una stima a scopo puramente informativo e didattico. La valutazione d'azienda è un'attività complessa che richiede un'analisi approfondita. Questo calcolo non sostituisce una perizia professionale.
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                {inputs.map(input => (
                                    <div key={input.id} className={input.type === 'select' ? 'md:col-span-2' : ''}>
                                        <label className="block text-sm font-medium mb-2 text-gray-700 flex items-center" htmlFor={input.id}>
                                            {input.label}
                                            <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>
                                        </label>
                                        {input.type === 'select' ? (
                                            <select id={input.id} value={states[input.id]} onChange={e => handleStateChange(input.id, e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2">
                                                {input.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                            </select>
                                        ) : (
                                            <div className="relative">
                                                <input id={input.id} type="number" value={states[input.id]} onChange={e => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} min={input.min} step={input.step} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 pr-12"/>
                                                {input.unit && <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">{input.unit}</span>}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-b-lg">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Risultati della Valutazione</h2>
                            <div className="space-y-3">
                                <div className="flex items-baseline justify-between p-4 rounded-lg bg-indigo-100 border-l-4 border-indigo-500">
                                    <div className="text-base font-medium text-indigo-800">{outputs[0].label}</div>
                                    <div className="text-2xl font-bold text-indigo-600">
                                        {isClient ? formatCurrency(calculatedOutputs.equity_value as number) : '...'}
                                    </div>
                                </div>
                                {outputs.slice(1).map(output => (
                                    <div key={output.id} className="flex items-baseline justify-between p-4 rounded-lg bg-white">
                                        <div className="text-base font-medium text-gray-700">{output.label}</div>
                                        <div className="text-xl font-bold text-gray-800">
                                            {isClient ? (typeof (calculatedOutputs as any)[output.id] === 'number' ? formatCurrency((calculatedOutputs as any)[output.id]) : (calculatedOutputs as any)[output.id]) : '...'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Visualizzazione del Range di Valore</h3>
                                <div className="h-64 w-full bg-white p-2 rounded-lg border">
                                    {isClient && <DynamicBarChart data={chartData} />}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="text-lg font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-1 gap-3">
                            <button onClick={handleSaveResult} className="w-full text-center bg-indigo-600 text-white rounded-md px-4 py-2 hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Valutazione</button>
                            <button onClick={handleExportPDF} className="w-full text-center border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta in PDF</button>
                            <button onClick={handleReset} className="w-full text-center border border-gray-300 text-red-700 rounded-md px-4 py-2 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="text-lg font-semibold mb-3 text-gray-800">Formula Utilizzata</h2>
                        <p className="text-sm text-gray-600 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaText}</p>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="text-lg font-semibold mb-3 text-gray-800">Guida alla Valutazione</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="text-lg font-semibold mb-3 text-gray-800">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.borsaitaliana.it/borsa/gliondici/glossario/multiplo.htm" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Borsa Italiana - Glossario Finanziario</a></li>
                            <li><a href="https://www.pwc.com/it/it/publications/ma-in-italy.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Analisi di mercato M&A (PwC)</a></li>
                            <li><a href="https://aswin.damodaran.net/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Aswath Damodaran - Risorse sulla Valutazione</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default ValoreAziendaMultipliEbitdaCalculator;