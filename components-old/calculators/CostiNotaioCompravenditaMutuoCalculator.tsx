'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as ChartTooltip } from 'recharts';

export const meta = {
    title: "Calcolatore Costi Notaio per Atto di Compravendita e Mutuo",
    description: "Stima in modo preciso le imposte (Registro o IVA) e l'onorario del notaio per l'acquisto della tua prima o seconda casa, con o senza mutuo."
};

// --- Icona per i Tooltip (SVG inline per evitare dipendenze) ---
const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
        <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
);

// --- Componente Tooltip ---
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
    <div className="relative flex items-center group">
        {children}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
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
                        "name": "Qual è la differenza tra prezzo di acquisto e valore catastale?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Il prezzo di acquisto è il valore di mercato dell'immobile. Il valore catastale è un valore fiscale, generalmente più basso, utilizzato come base per calcolare le imposte (come l'Imposta di Registro) quando si acquista da un privato. Questa regola, detta 'prezzo-valore', permette un notevole risparmio fiscale."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Quando si paga l'IVA e quando l'Imposta di Registro sull'acquisto di una casa?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Si paga l'Imposta di Registro (calcolata sul valore catastale) se si acquista da un venditore privato. Si paga l'IVA (calcolata sul prezzo di vendita) se si acquista direttamente da un'impresa costruttrice entro 5 anni dalla fine dei lavori."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "L'onorario del notaio è fisso?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "No, dal 2012 le tariffe notarili sono state liberalizzate. L'onorario varia in base al valore e alla complessità dell'atto. Questo calcolatore fornisce una stima basata su parametri medi di mercato, ma il preventivo finale va richiesto direttamente al notaio scelto."
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
        return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');
    };

    const blocks = content.split('\n\n');

    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {blocks.map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) {
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (trimmedBlock.startsWith('#### **')) {
                    return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
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
                    return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                }
                return null;
            })}
        </div>
    );
};


// Dati di configurazione del calcolatore
const calculatorData = {
  "slug": "costi-notaio-compravendita-mutuo",
  "category": "Immobiliare e Casa",
  "title": "Calcolatore Costi Notaio per Atto di Compravendita e Mutuo",
  "lang": "it",
  "inputs": [
    { "id": "prezzo_immobile", "label": "Prezzo di Acquisto dell'Immobile", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "tooltip": "Il prezzo di mercato concordato con il venditore per l'acquisto della proprietà." },
    { "id": "valore_catastale", "label": "Valore Catastale dell'Immobile", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Questo valore, più basso del prezzo di mercato, è la base per il calcolo delle imposte se acquisti da un privato. Lo trovi nella visura catastale." },
    { "id": "is_prima_casa", "label": "È la tua 'Prima Casa'?", "type": "boolean" as const, "tooltip": "Seleziona se l'immobile sarà la tua residenza principale e rispetti i requisiti di legge. Questo riduce drasticamente le imposte." },
    { "id": "venditore_is_impresa", "label": "Il venditore è un'impresa costruttrice?", "type": "boolean" as const, "tooltip": "Se acquisti da un costruttore (entro 5 anni dalla costruzione/ristrutturazione), pagherai l'IVA invece dell'Imposta di Registro." },
    { "id": "con_mutuo", "label": "Stai richiedendo un mutuo?", "type": "boolean" as const, "tooltip": "Seleziona se stai finanziando l'acquisto con un mutuo ipotecario. Questo comporta un secondo atto notarile e costi specifici." },
    { "id": "importo_mutuo", "label": "Importo del Mutuo", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "condition": "con_mutuo == true", "tooltip": "L'importo totale che la banca ti finanzierà per l'acquisto." }
  ],
  "outputs": [
    { "id": "costo_totale_operazione", "label": "Costo Totale Stimato (Imposte + Notaio)", "unit": "€" },
    { "id": "imposte_compravendita", "label": "Totale Imposte sulla Compravendita", "unit": "€" },
    { "id": "onorario_notaio_compravendita", "label": "Stima Onorario Notaio (Compravendita)", "unit": "€" },
    { "id": "costi_totali_mutuo", "label": "Costi Totali Atto di Mutuo", "unit": "€" }
  ],
  "content": "### **Guida Completa ai Costi Notarili per l'Acquisto di Casa**\n\n**Un'Analisi Dettagliata di Imposte, Onorari e Spese Accessorie**\n\nL'acquisto di un immobile è un passo importante, e comprendere l'ammontare totale dell'investimento è fondamentale. Oltre al prezzo della casa, una fetta significativa dei costi è rappresentata dalle spese notarili e dalle imposte. Questo calcolatore è progettato per darti una stima realistica e trasparente di questi costi, aiutandoti a pianificare il tuo budget con precisione.\n\n**Disclaimer**: Questo strumento fornisce una stima attendibile basata sulla normativa e su parametri medi. L'onorario del notaio non è fissato per legge e può variare. Per un preventivo esatto, è sempre necessario consultare direttamente un notaio.\n\n### **Parte 1: Le Voci di Costo nel Dettaglio**\n\nIl costo totale che dovrai sostenere si compone principalmente di due macro-categorie: le **imposte** dovute allo Stato e l'**onorario** del notaio per la sua prestazione professionale.\n\n#### **A. Le Imposte sulla Compravendita: Registro o IVA?**\n\nLa prima, grande distinzione dipende da chi è il venditore:\n\n1.  **Acquisto da Privato (o da impresa dopo 5 anni)**: Si paga l'**Imposta di Registro**. La base imponibile è il **Valore Catastale** (più basso del prezzo di mercato), grazie alla regola del 'prezzo-valore'.\n    * **Prima Casa**: Imposta di Registro al **2%** del valore catastale (con un minimo di 1.000 €).\n    * **Seconda Casa**: Imposta di Registro al **9%** del valore catastale (con un minimo di 1.000 €).\n    A queste si aggiungono le imposte Ipotecaria e Catastale in misura fissa, per un totale di **100 €**.\n\n2.  **Acquisto da Impresa Costruttrice (entro 5 anni)**: Si paga l'**IVA**. La base imponibile è il **prezzo di acquisto** dichiarato in atto.\n    * **Prima Casa**: IVA al **4%**.\n    * **Seconda Casa**: IVA al **10%** (o 22% per immobili di lusso).\n    In questo caso, le imposte di Registro, Ipotecaria e Catastale sono fisse, per un totale di **600 €**.\n\n#### **B. Le Agevolazioni \"Prima Casa\"**\n\nPer beneficiare delle tasse ridotte, devi soddisfare alcuni requisiti, tra cui:\n\n* Non possedere altri immobili ad uso abitativo nello stesso Comune.\n* Non possedere, su tutto il territorio nazionale, un altro immobile acquistato con le agevolazioni 'prima casa'.\n* Stabilire la tua residenza nel Comune dell'immobile entro 18 mesi dall'acquisto.\n\n#### **C. L'Onorario del Notaio**\n\nDal 2012 le tariffe notarili sono state liberalizzate. L'onorario è proporzionale al valore dell'atto e alla sua complessità. Il lavoro del notaio non si limita a leggere e firmare il rogito, ma include una serie di controlli cruciali (visure ipotecarie e catastali, verifica della conformità urbanistica) che garantiscono la sicurezza del tuo acquisto. L'onorario è soggetto a IVA al 22%.\n\n### **Parte 2: I Costi Specifici dell'Atto di Mutuo**\n\nSe acquisti casa con un mutuo, il notaio dovrà redigere un secondo atto pubblico: l'**atto di mutuo**. Anche questo ha dei costi associati:\n\n* **Imposta Sostitutiva**: Un'imposta agevolata che sostituisce tutte le altre. È pari allo **0,25%** dell'importo del mutuo per la 'prima casa'.\n* **Onorario del Notaio**: Un secondo onorario, generalmente un po' più basso di quello per la compravendita, per la stipula del contratto di mutuo e l'iscrizione dell'ipoteca a favore della banca.\n\nUsa questo strumento per visualizzare la ripartizione di tutti questi costi e arrivare preparato al giorno del rogito."
};

const CostiNotaioCompravenditaMutuoCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        prezzo_immobile: 220000,
        valore_catastale: 95000,
        is_prima_casa: true,
        venditore_is_impresa: false,
        con_mutuo: true,
        importo_mutuo: 180000
    };
    const [states, setStates] = useState<{[key: string]: any}>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({...prev, [id]: value}));
    };
    
    const handleReset = () => {
        setStates(initialStates);
    };

    const calculatedOutputs = useMemo(() => {
        const { prezzo_immobile, valore_catastale, is_prima_casa, venditore_is_impresa, con_mutuo, importo_mutuo } = states;
        
        // --- CALCOLO COMPRAVENDITA ---
        const base_imponibile = venditore_is_impresa ? prezzo_immobile : valore_catastale;
        let imposta_principale;
        if (venditore_is_impresa) {
            imposta_principale = is_prima_casa ? base_imponibile * 0.04 : base_imponibile * 0.10;
        } else {
            imposta_principale = is_prima_casa ? Math.max(1000, base_imponibile * 0.02) : Math.max(1000, base_imponibile * 0.09);
        }
        const imposte_fisse_compravendita = venditore_is_impresa ? 600 : 100;
        const imposte_compravendita = imposta_principale + imposte_fisse_compravendita;

        // Stima onorario notaio (formula non lineare per maggiore realismo)
        const onorario_compravendita_netto = prezzo_immobile > 0 ? (1400 + Math.log10(prezzo_immobile) * 200 * (1 + (prezzo_immobile/500000))) : 0;
        const onorario_notaio_compravendita = onorario_compravendita_netto * 1.22 + 300; // Aggiunge IVA 22% e spese fisse

        // --- CALCOLO MUTUO ---
        const imposte_mutuo = (con_mutuo && importo_mutuo > 0) ? importo_mutuo * 0.0025 : 0; // Semplificato 0.25% per prima casa
        const onorario_mutuo_netto = (con_mutuo && importo_mutuo > 0) ? (1000 + Math.log10(importo_mutuo) * 150 * (1 + (importo_mutuo/700000))) : 0;
        const onorario_notaio_mutuo = onorario_mutuo_netto * 1.22 + 200; // Aggiunge IVA 22% e spese fisse

        const costi_totali_mutuo = con_mutuo ? (imposte_mutuo + onorario_notaio_mutuo) : 0;
        const costo_totale_operazione = imposte_compravendita + onorario_notaio_compravendita + costi_totali_mutuo;

        return {
            costo_totale_operazione,
            imposte_compravendita,
            onorario_notaio_compravendita,
            costi_totali_mutuo,
            imposte_mutuo, // needed for chart
            onorario_notaio_mutuo // needed for chart
        };
    }, [states]);

    const chartData = [
        { name: 'Imposte Compravendita', value: calculatedOutputs.imposte_compravendita },
        { name: 'Onorario Notaio Compravendita', value: calculatedOutputs.onorario_notaio_compravendita },
        ...(states.con_mutuo ? [
            { name: 'Imposte Mutuo', value: calculatedOutputs.imposte_mutuo },
            { name: 'Onorario Notaio Mutuo', value: calculatedOutputs.onorario_notaio_mutuo }
        ] : [])
    ].filter(d => d.value > 0);

    const COLORS = ['#4f46e5', '#818cf8', '#fca5a5', '#fb7185'];

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

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
            pdf.save(`${slug}.pdf`);
        } catch (e) { alert("Errore durante l'esportazione in PDF."); }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const { imposte_mutuo, onorario_notaio_mutuo, ...outputsToSave } = calculatedOutputs;
            const payload = { slug, title, inputs: states, outputs: outputsToSave, ts: Date.now() };
            const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
            localStorage.setItem("calc_results", JSON.stringify([payload, ...existingResults].slice(0, 50)));
            alert("Risultato salvato con successo!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);

    return (
        <>
        <FaqSchema />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
            <div className="lg:col-span-2">
                <div className="p-0" ref={calcolatoreRef}>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">{meta.description}</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una stima a scopo puramente informativo e non sostituisce un preventivo ufficiale di un notaio.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                            {inputs.map(input => {
                                const conditionMet = !input.condition || (input.condition.includes('== true') && states[input.condition.split(' ')[0]]);
                                if (!conditionMet) return null;

                                const inputLabel = (
                                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                        {input.label}
                                        {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip>}
                                    </label>
                                );
                                if (input.type === 'boolean') {
                                    return (
                                        <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-2 rounded-md bg-white border">
                                            <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                            {inputLabel}
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
                            {outputs.map(output => (
                                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'costo_totale_operazione' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold ${output.id === 'costo_totale_operazione' ? 'text-indigo-600' : 'text-gray-800'}`}>
                                        <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id] || 0) : '...'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione dei Costi</h3>
                            <div className="h-72 w-full bg-gray-50 p-2 rounded-lg">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <aside className="lg:col-span-1 space-y-6">
                <section className="border rounded-lg p-4 bg-white shadow-md">
                    <h2 className="font-semibold mb-2 text-gray-800">Azioni Rapide</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={salvaRisultato} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva</button>
                        <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">PDF</button>
                        <button onClick={handleReset} className="col-span-2 w-full text-sm border border-red-300 rounded-md px-3 py-2 hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset</button>
                    </div>
                </section>
                <section className="border rounded-lg p-4 bg-white shadow-md">
                    <h2 className="font-semibold mb-2 text-gray-800">Guida ai Costi</h2>
                    <ContentRenderer content={content} />
                </section>
                 <section className="border rounded-lg p-4 bg-white shadow-md">
                    <h2 className="font-semibold mb-2 text-gray-800">Riferimenti Normativi</h2>
                    <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                        <li><a href="https://www.gazzettaufficiale.it/eli/id/1986/03/01/086U0131/sg" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">D.P.R. 131/1986 (Testo Unico Imposta di Registro)</a></li>
                        <li><a href="https://www.gazzettaufficiale.it/eli/id/1972/11/11/072U0633/sg" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">D.P.R. 633/1972 (Istituzione dell'IVA)</a></li>
                        <li><a href="https://www.notariato.it/it/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Consiglio Nazionale del Notariato</a></li>
                    </ul>
                </section>
            </aside>
        </div>
        </>
    );
};

export default CostiNotaioCompravenditaMutuoCalculator;