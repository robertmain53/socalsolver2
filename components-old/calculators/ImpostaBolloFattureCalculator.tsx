'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const meta = {
    title: "Calcolatore Imposta di Bollo su Fatture Elettroniche (annuale)",
    description: "Calcola l'imposta di bollo annuale dovuta sulle tue fatture elettroniche e scopri le scadenze di pagamento personalizzate in base alle nuove soglie."
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
                        "name": "Quanto costa l'imposta di bollo sulle fatture elettroniche?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "L'imposta di bollo è fissa e ammonta a 2,00 € per ogni fattura elettronica con importo superiore a 77,47 € che non sia soggetta a IVA."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Quali sono le scadenze per pagare il bollo sulle fatture?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Le scadenze sono trimestrali: 31 Maggio, 30 Settembre, 30 Novembre e 28 Febbraio dell'anno successivo. Tuttavia, se l'importo del primo trimestre (o dei primi due cumulati) è inferiore a 5.000 €, il pagamento può essere posticipato. Il nostro calcolatore fornisce le scadenze esatte per il tuo caso specifico."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Chi deve pagare l'imposta di bollo virtuale?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Sono obbligati tutti i soggetti passivi IVA che emettono fatture per operazioni esenti da IVA di importo superiore a 77,47€. Un caso tipico è quello dei contribuenti in regime forfettario."
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
        return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    };

    const blocks = content.split('\n\n');

    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {blocks.map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) {
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                 if (trimmedBlock.startsWith('|')) {
                    const lines = trimmedBlock.split('\n');
                    const headers = lines[0].split('|').slice(1, -1).map(h => h.trim());
                    const rows = lines.slice(2).map(line => line.split('|').slice(1, -1).map(cell => cell.trim()));
                    
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
const calculatorData = { "slug": "imposta-bollo-fatture", "category": "Fisco e Lavoro Autonomo", "title": "Calcolatore Imposta di Bollo su Fatture Elettroniche (annuale)", "lang": "it", "inputs": [{ "id": "trimestre_1", "label": "N° fatture soggette a bollo (1° Trimestre: Gen-Mar)", "type": "number", "min": 0, "step": 1, "tooltip": "Inserisci il numero totale di fatture emesse tra Gennaio e Marzo con importo superiore a 77,47€ e non soggette a IVA (es. operazioni esenti, regime forfettario)." }, { "id": "trimestre_2", "label": "N° fatture soggette a bollo (2° Trimestre: Apr-Giu)", "type": "number", "min": 0, "step": 1, "tooltip": "Inserisci il numero totale di fatture emesse tra Aprile e Giugno con importo superiore a 77,47€ e non soggette a IVA." }, { "id": "trimestre_3", "label": "N° fatture soggette a bollo (3° Trimestre: Lug-Set)", "type": "number", "min": 0, "step": 1, "tooltip": "Inserisci il numero totale di fatture emesse tra Luglio e Settembre con importo superiore a 77,47€ e non soggette a IVA." }, { "id": "trimestre_4", "label": "N° fatture soggette a bollo (4° Trimestre: Ott-Dic)", "type": "number", "min": 0, "step": 1, "tooltip": "Inserisci il numero totale di fatture emesse tra Ottobre e Dicembre con importo superiore a 77,47€ e non soggette a IVA." }], "outputs": [{ "id": "bollo_totale_annuale", "label": "Imposta di Bollo Totale Annua Dovuta", "unit": "€" }], "formulaSteps": [{ "id": "imposta_fissa", "expr": "2" }, { "id": "bollo_trimestre_1", "expr": "trimestre_1 * imposta_fissa" }, { "id": "bollo_trimestre_2", "expr": "trimestre_2 * imposta_fissa" }, { "id": "bollo_trimestre_3", "expr": "trimestre_3 * imposta_fissa" }, { "id": "bollo_trimestre_4", "expr": "trimestre_4 * imposta_fissa" }, { "id": "bollo_totale_annuale", "expr": "bollo_trimestre_1 + bollo_trimestre_2 + bollo_trimestre_3 + bollo_trimestre_4" }], "examples": [{ "inputs": { "trimestre_1": 15, "trimestre_2": 25, "trimestre_3": 30, "trimestre_4": 40 }, "outputs": { "bollo_totale_annuale": 220 } }], "tags": "calcolo imposta di bollo, bollo fatture elettroniche, scadenze bollo virtuale, F24 bollo fatture, codice tributo 2521, regime forfettario, agenzia entrate, imposta 2 euro", "content": "### **Guida Completa all'Imposta di Bollo sulle Fatture Elettroniche**\n\n**Analisi Normativa, Criteri di Calcolo, Scadenze e Modalità di Versamento**\n\nL'imposta di bollo sulle fatture elettroniche è un adempimento fiscale cruciale per molti professionisti e imprese, in particolare per coloro che operano in regimi di esenzione IVA come il regime forfettario. Sebbene il meccanismo di base sia semplice (un'imposta fissa di 2€), le regole sulle scadenze di pagamento possono generare confusione.\n\nQuesta guida offre una panoramica completa e autorevole, spiegando il funzionamento del calcolatore, i presupposti normativi dell'imposta, le modalità di calcolo e le esatte scadenze di versamento, aggiornate alle ultime disposizioni. L'obiettivo è fornire uno strumento chiaro e affidabile, fermo restando che **non sostituisce una consulenza fiscale professionale**.\n\n### **Parte 1: Il Calcolatore - Come Funziona e Come Usarlo**\n\nQuesto strumento è progettato per calcolare l'imposta di bollo annuale dovuta e, soprattutto, per fornire un **piano di pagamento personalizzato** basato sugli importi trimestrali. Il calcolo si basa su un principio semplice:\n\n* **Presupposto**: Si applica un'imposta di **2,00 €** su ogni fattura (o documento fiscale equivalente) che soddisfi contemporaneamente due condizioni: \n    1.  L'importo totale supera **77,47 €**.\n    2.  L'operazione **non è soggetta a IVA**.\n\nPer utilizzare il calcolatore, è sufficiente inserire il numero di fatture che rispettano tali criteri per ciascun trimestre solare dell'anno di riferimento.\n\n#### **Interpretazione dei Risultati**\n\nIl calcolatore non solo restituisce l'importo totale annuo, ma elabora un calendario di pagamento che tiene conto delle soglie di importo che possono far slittare le scadenze, una delle principali fonti di errore per i contribuenti.\n\n### **Parte 2: Quando si Applica l'Imposta di Bollo? (Analisi dei Casi)**\n\nL'obbligo di apporre il bollo virtuale sorge quando un documento fiscale certifica un'operazione non gravata da Imposta sul Valore Aggiunto (IVA). Ecco i casi più comuni:\n\n* **Regime Forfettario e dei Minimi**: Tutte le fatture emesse da contribuenti in questi regimi agevolati sono, per loro natura, senza IVA e quindi soggette a bollo se superano 77,47€.\n* **Operazioni Esenti IVA**: Fatture relative a operazioni esenti ai sensi dell'art. 10 del D.P.R. 633/72 (es. prestazioni sanitarie, locazioni immobiliari, operazioni finanziarie).\n* **Operazioni Fuori Campo IVA**: Per mancanza del presupposto territoriale o soggettivo.\n* **Fatture verso la Pubblica Amministrazione (PA)**: Se non assoggettate a IVA.\n\n**Tabella Riepilogativa: Bollo SÌ / Bollo NO**\n\n| Caso d'Uso | Imposta di Bollo Dovuta? |\n| --- | --- |\n| Fattura di un professionista in regime forfettario | **SÌ**, se > 77,47€ |\n| Fattura per prestazione sanitaria esente IVA | **SÌ**, se > 77,47€ |\n| Fattura con IVA esposta (regime ordinario) | **NO** |\n| Fattura con \"reverse charge\" (inversione contabile) | **NO** |\n| Fattura di importo inferiore a 77,47€ | **NO** |\n\n### **Parte 3: Come e Quando si Paga - Le Scadenze di Versamento**\n\nL'Agenzia delle Entrate calcola l'imposta dovuta per ogni trimestre sulla base delle fatture inviate al Sistema di Interscambio (SdI) e la rende disponibile nell'area riservata del portale \"Fatture e Corrispettivi\". Il contribuente è tenuto a verificare e versare l'importo.\n\nIl pagamento avviene tramite **modello F24**, utilizzando i codici tributo specifici, oppure tramite addebito diretto sul conto corrente dal portale dell'Agenzia.\n\n#### **Le Scadenze Ufficiali (Aggiornate al 2024)**\n\nLe scadenze standard sono fissate all'ultimo giorno del secondo mese successivo a ogni trimestre. Tuttavia, esistono delle **eccezioni cruciali** basate sull'importo dovuto, introdotte per semplificare i pagamenti di modesta entità.\n\n* **Regola Generale:**\n    * 1° Trimestre (Gen-Mar): **31 Maggio**\n    * 2° Trimestre (Apr-Giu): **30 Settembre**\n    * 3° Trimestre (Lug-Set): **30 Novembre**\n    * 4° Trimestre (Ott-Dic): **28 Febbraio** dell'anno successivo\n\n* **Eccezione 1 (Primo Trimestre):**\n    * Se l'importo dovuto per il 1° trimestre è **inferiore a 5.000 €**, il pagamento può essere posticipato e unito a quello del 2° trimestre, con scadenza al **30 Settembre**.\n\n* **Eccezione 2 (Primo e Secondo Trimestre):**\n    * Se l'importo **complessivo** dovuto per 1° e 2° trimestre è **inferiore a 5.000 €**, il pagamento di entrambi può essere posticipato e unito a quello del 3° trimestre, con scadenza al **30 Novembre**.\n\nIl nostro calcolatore applica automaticamente queste regole per fornirti un piano di scadenze chiaro e corretto.\n\n#### **Codici Tributo per F24**\n\n| Trimestre | Codice Tributo | Anno di Riferimento |\n|---|---|---|\n| 1° Trimestre | 2521 | Anno della fattura |\n| 2° Trimestre | 2522 | Anno della fattura |\n| 3° Trimestre | 2523 | Anno della fattura |\n| 4° Trimestre | 2524 | Anno della fattura |\n| Sanzioni | 2525 | Anno della fattura |\n| Interessi | 2526 | Anno della fattura |\n\n\n### **Parte 4: Sanzioni e Ravvedimento Operoso**\n\nIn caso di omesso, insufficiente o tardivo versamento, l'Agenzia delle Entrate invia una comunicazione di irregolarità. È possibile regolarizzare la propria posizione tramite il **ravvedimento operoso**, versando l'imposta dovuta, una sanzione ridotta e gli interessi legali. La sanzione varia in base al ritardo con cui si effettua il pagamento.\n\n### **Conclusione**\n\nLa gestione dell'imposta di bollo è un processo semplificato dalla fatturazione elettronica ma che richiede attenzione alle scadenze. Utilizzare questo strumento aiuta a pianificare i pagamenti ed evitare errori. Per casi complessi o dubbi normativi, è sempre consigliabile rivolgersi al proprio commercialista o a un consulente fiscale." };


const ImpostaBolloFattureCalculator: React.FC = () => {
    const { slug, title, inputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);
    
    const initialStates = {
        trimestre_1: 0,
        trimestre_2: 0,
        trimestre_3: 0,
        trimestre_4: 0,
    };
    const [states, setStates] = useState<{[key: string]: any}>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({...prev, [id]: value}));
    };
    
    const handleReset = () => {
        setStates(initialStates);
    };
    
    const { bollo_totale_annuale, pagamenti, chartData } = useMemo(() => {
        const imposta_fissa = 2;
        const bollo_t1 = (states.trimestre_1 || 0) * imposta_fissa;
        const bollo_t2 = (states.trimestre_2 || 0) * imposta_fissa;
        const bollo_t3 = (states.trimestre_3 || 0) * imposta_fissa;
        const bollo_t4 = (states.trimestre_4 || 0) * imposta_fissa;
        
        const bollo_totale_annuale = bollo_t1 + bollo_t2 + bollo_t3 + bollo_t4;

        const pagamenti = [];
        const soglia = 5000;

        // Gestione T1 e T2
        if (bollo_t1 < soglia) {
            if ((bollo_t1 + bollo_t2) < soglia) {
                // T1 e T2 si pagano con T3 a Novembre
            } else {
                 if (bollo_t1 + bollo_t2 > 0) {
                    pagamenti.push({ label: "1° e 2° Trimestre", importo: bollo_t1 + bollo_t2, scadenza: "30 Settembre" });
                 }
            }
        } else {
            pagamenti.push({ label: "1° Trimestre", importo: bollo_t1, scadenza: "31 Maggio" });
            pagamenti.push({ label: "2° Trimestre", importo: bollo_t2, scadenza: "30 Settembre" });
        }

        // Gestione T3
        let importoDaPagareNov = bollo_t3;
        let labelNov = "3° Trimestre";
        if (bollo_t1 < soglia && (bollo_t1 + bollo_t2) < soglia) {
            importoDaPagareNov += bollo_t1 + bollo_t2;
            labelNov = "1°, 2° e 3° Trimestre";
        }
        if (importoDaPagareNov > 0) {
            pagamenti.push({ label: labelNov, importo: importoDaPagareNov, scadenza: "30 Novembre" });
        }

        // Gestione T4
        if (bollo_t4 > 0) {
            pagamenti.push({ label: "4° Trimestre", importo: bollo_t4, scadenza: "28 Febbraio (anno succ.)" });
        }
        
        const chartData = [
            { name: '1° Trim.', importo: bollo_t1 },
            { name: '2° Trim.', importo: bollo_t2 },
            { name: '3° Trim.', importo: bollo_t3 },
            { name: '4° Trim.', importo: bollo_t4 },
        ];

        return { bollo_totale_annuale, pagamenti, chartData };
    }, [states]);

    const handleExportPDF = useCallback(async () => {
        const input = calcolatoreRef.current;
        if (!input) return;
        try {
            const canvas = await html2canvas(input, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'pt', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 30;
            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save(`${slug}.pdf`);
        } catch (e) {
            console.error(e);
            alert("Errore durante l'esportazione in PDF.");
        }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: { bollo_totale_annuale, pagamenti }, ts: Date.now() };
            const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
            const newResults = [payload, ...existingResults].slice(0, 50);
            localStorage.setItem("calc_results", JSON.stringify(newResults));
            alert("Risultato salvato con successo!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, bollo_totale_annuale, pagamenti, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

    return (
        <>
        <FaqSchema />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
            <div className="lg:col-span-2">
                <div ref={calcolatoreRef} className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                    <p className="text-gray-600 mb-4">{meta.description}</p>
                    <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                        <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce una consulenza fiscale. Le scadenze e gli importi definitivi sono quelli comunicati dall'Agenzia delle Entrate.
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                        {inputs.map(input => (
                            <div key={input.id}>
                                <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                    {input.label}
                                    <Tooltip text={input.tooltip || ""}><span className="ml-2"><InfoIcon /></span></Tooltip>
                                </label>
                                <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 space-y-4">
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati del Calcolo</h2>
                        <div className="flex items-baseline justify-between border-l-4 bg-indigo-50 border-indigo-500 p-4 rounded-r-lg">
                            <div className="text-sm md:text-base font-medium text-gray-700">Imposta di Bollo Totale Annua Dovuta</div>
                            <div className="text-xl md:text-2xl font-bold text-indigo-600">
                                <span>{isClient ? formatCurrency(bollo_totale_annuale) : '...'}</span>
                            </div>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-700 pt-4">Piano Scadenze di Pagamento</h3>
                        {bollo_totale_annuale > 0 ? (
                            <div className="space-y-3">
                                {pagamenti.map((p, i) => (
                                    <div key={i} className="grid grid-cols-3 items-center gap-4 bg-gray-50 p-3 rounded-md border">
                                        <div className="col-span-1 text-sm font-medium text-gray-600">{p.label}</div>
                                        <div className="col-span-1 text-center text-sm font-semibold text-gray-800">{p.scadenza}</div>
                                        <div className="col-span-1 text-right text-base font-bold text-gray-900">{isClient ? formatCurrency(p.importo) : '...'}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">Nessuna imposta dovuta in base ai dati inseriti.</p>
                        )}
                        
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione Annuale dell'Imposta</h3>
                             <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                            <XAxis dataKey="name" />
                                            <YAxis tickFormatter={(value) => `€${value}`} />
                                            <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                            <Bar dataKey="importo" name="Importo Bollo">
                                                {chartData.map((_entry, index) => (<Cell key={`cell-${index}`} fill={['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'][index % 4]} />))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
                 <div className="mt-6 border rounded-lg shadow-md p-4 bg-white">
                    <h3 className="font-semibold text-gray-700">Formula di Calcolo Utilizzata</h3>
                    <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-100 rounded font-mono break-words">Bollo Trimestrale = Numero Fatture del Trimestre * 2,00 €</p>
                </div>
            </div>

            <aside className="lg:col-span-1 space-y-6">
                <section className="border rounded-lg p-4 bg-white shadow-md">
                    <h2 className="font-semibold mb-2 text-gray-800">Azioni Rapide</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={salvaRisultato} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                        <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta PDF</button>
                        <button onClick={handleReset} className="col-span-2 w-full border border-red-300 text-red-700 bg-red-50 rounded-md px-3 py-2 hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                    </div>
                </section>
                <section className="border rounded-lg p-4 bg-white shadow-md">
                    <h2 className="font-semibold mb-2 text-gray-800">Guida all'Imposta di Bollo</h2>
                    <ContentRenderer content={content} />
                </section>
                 <section className="border rounded-lg p-4 bg-white shadow-md">
                    <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti Normativi</h2>
                    <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                        <li><a href="https://www.agenziaentrate.gov.it/portale/versamento-dell-imposta-di-bollo-e-controlli" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Guida al versamento</a></li>
                        <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1972-10-26;633!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">D.P.R. 26 ottobre 1972, n. 633 (Decreto IVA)</a></li>
                         <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1972-10-26;642!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">D.P.R. 26 ottobre 1972, n. 642 (Disciplina imposta di bollo)</a></li>
                    </ul>
                </section>
            </aside>
        </div>
        </>
    );
};

export default ImpostaBolloFattureCalculator;