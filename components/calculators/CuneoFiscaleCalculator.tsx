'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ChartTooltip, Legend } from 'recharts';

// --- Icona per i Tooltip (SVG inline per evitare dipendenze) ---
const InfoIcon = () => (
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600 transition-colors">
<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
</svg>
);

// --- Componente Tooltip ---
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
<div className="relative flex items-center group">
{children}
<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
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
"name": "Cos'è il cuneo fiscale?",
"acceptedAnswer": {
"@type": "Answer",
"text": "Il cuneo fiscale è la differenza tra il costo totale che un'azienda sostiene per un dipendente e lo stipendio netto che il dipendente riceve in busta paga. È composto da due parti principali: il cuneo contributivo (contributi previdenziali a carico di azienda e lavoratore) e il cuneo fiscale (imposte sul reddito come l'IRPEF)."
}
},
{
"@type": "Question",
"name": "Come si calcola il costo totale di un dipendente per l'azienda?",
"acceptedAnswer": {
"@type": "Answer",
"text": "Il costo totale per l'azienda si calcola partendo dalla Retribuzione Annua Lorda (RAL) e aggiungendo i costi a carico del datore di lavoro. La formula base è: RAL + Contributi Previdenziali Aziendali + Quota TFR maturata nell'anno + Premio INAIL. A questo si può aggiungere l'IRAP, se dovuta."
}
},
{
"@type": "Question",
"name": "Quali tasse paga un dipendente sulla sua busta paga?",
"acceptedAnswer": {
"@type": "Answer",
"text": "Un dipendente paga principalmente due tipi di oneri: i contributi previdenziali (INPS), che vengono sottratti dalla RAL per calcolare l'imponibile fiscale, e l'IRPEF (Imposta sul Reddito delle Persone Fisiche), calcolata sull'imponibile fiscale tramite un sistema di scaglioni progressivi. L'IRPEF può essere ridotta da detrazioni fiscali."
}
}
]
})
}}
/>
);

// --- Componente per il rendering del contenuto Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');
    const blocks = content.split('\n\n');

    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {blocks.map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                if (trimmedBlock.startsWith('#### **')) return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                if (trimmedBlock.startsWith('* ')) {
                    const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
                    return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{items.map((i, k) => <li key={k} dangerouslySetInnerHTML={{ __html: processInlineFormatting(i) }} />)}</ul>;
                }
                if (trimmedBlock.includes("|")) { // Basic table detection
                    const lines = trimmedBlock.split('\n');
                    const header = lines[0].split('|').map(h => h.trim());
                    const rows = lines.slice(2).map(r => r.split('|').map(c => c.trim()));
                    return (
                        <div key={index} className="overflow-x-auto my-4">
                            <table className="min-w-full border text-sm">
                                <thead className="bg-gray-100">
                                    <tr>{header.map((h, i) => <th key={i} className="p-2 border text-left font-semibold" dangerouslySetInnerHTML={{ __html: processInlineFormatting(h) }} />)}</tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, i) => (
                                        <tr key={i}>{row.map((cell, j) => <td key={j} className="p-2 border" dangerouslySetInnerHTML={{ __html: processInlineFormatting(cell) }} />)}</tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                }
                if (trimmedBlock) return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                return null;
            })}
        </div>
    );
};


// --- Dati e configurazione del calcolatore ---
const calculatorData = {
    "slug": "cuneo-fiscale",
    "category": "PMI e Impresa",
    "title": "Calcolatore Costo Totale Dipendente (Cuneo Fiscale)",
    "lang": "it",
    "inputs": [
        { "id": "ral", "label": "Retribuzione Annua Lorda (RAL)", "type": "number" as const, "unit": "€", "min": 15000, "step": 1000, "tooltip": "La RAL è il compenso lordo annuale concordato tra azienda e dipendente, prima di ogni trattenuta fiscale e previdenziale." },
        { "id": "mensilita", "label": "Numero di Mensilità", "type": "select" as const, "options": [13, 14], "tooltip": "Seleziona se il contratto prevede la tredicesima (13 mensilità) o anche la quattordicesima (14 mensilità)." },
        { "id": "include_irap", "label": "Includi stima IRAP nel costo", "type": "boolean" as const, "tooltip": "Spunta per aggiungere una stima dell'IRAP (Imposta Regionale sulle Attività Produttive), che incide sul costo del lavoro per l'azienda. L'aliquota standard è del 3,9%." }
    ],
    "outputs": [
        { "id": "costo_totale_azienda", "label": "Costo Totale Annuo per l'Azienda", "unit": "€" },
        { "id": "stipendio_netto_annuale", "label": "Stipendio Netto Annuale del Dipendente", "unit": "€" },
        { "id": "stipendio_netto_mensile", "label": "Stipendio Netto Mensile Medio", "unit": "€" },
        { "id": "cuneo_fiscale_totale", "label": "Cuneo Fiscale e Contributivo Totale", "unit": "€" }
    ],
    "tags": "cuneo fiscale, costo dipendente, RAL, stipendio netto, busta paga, IRPEF, contributi INPS, tassazione lavoro, costo del lavoro, sgravio contributivo",
    "content": `### **Guida Completa al Cuneo Fiscale e al Costo del Lavoro**

Comprendere il **cuneo fiscale** è fondamentale sia per i datori di lavoro, che devono pianificare i costi del personale, sia per i lavoratori, che vogliono capire la differenza tra il loro stipendio lordo e quello netto. Il cuneo fiscale rappresenta la somma di tutte le imposte e i contributi che gravano sul costo del lavoro.

Questo calcolatore offre una stima dettagliata per visualizzare come la Retribuzione Annua Lorda (RAL) si trasforma nel costo totale per l'azienda e nello stipendio netto per il dipendente.

### **Parte 1: Come si Legge il Calcolatore**

Il nostro strumento scompone il costo del lavoro in tre macro-aree:

1.  **Costo per l'Azienda**: Oltre alla RAL, l'azienda sostiene costi significativi come i contributi previdenziali e la quota TFR.
2.  **Cuneo Fiscale e Contributivo**: L'insieme di tasse (IRPEF) e contributi (INPS) versati sia dall'azienda che dal dipendente. È la differenza tra il costo azienda e il netto percepito.
3.  **Netto in Busta Paga**: La somma che il dipendente riceve effettivamente.

Inserendo la RAL, il calcolatore esegue una simulazione basata sulla normativa fiscale e previdenziale vigente.

### **Parte 2: La Composizione del Costo del Lavoro**

Analizziamo il percorso dal lordo al netto e al costo totale.

#### **Dal Lordo al Netto (Prospettiva del Dipendente)**

Il calcolo dello stipendio netto parte dalla RAL e segue questi passaggi:
1.  **RAL (Retribuzione Annua Lorda)**: Il punto di partenza.
2.  **(-) Contributi INPS a carico del lavoratore**: Una quota (solitamente 9,19%) della RAL viene versata all'INPS. Per i redditi più bassi, sono previsti degli **sgravi contributivi** (esoneri parziali) che riducono questa trattenuta, aumentando il netto.
3.  **(=) Imponibile Fiscale (o Reddito Imponibile)**: È la base su cui si calcolano le tasse. (RAL - Contributi INPS).
4.  **(-) IRPEF Lorda**: All'imponibile si applica l'imposta sul reddito, calcolata con un sistema a scaglioni progressivi. Più alto è il reddito, maggiore è l'aliquota.
5.  **(+) Detrazioni Fiscali**: Lo Stato riconosce delle "sconti" sull'IRPEF, principalmente le **detrazioni per lavoro dipendente**, che variano in base al reddito.
6.  **(=) IRPEF Netta**: L'imposta effettiva da pagare dopo aver applicato le detrazioni.
7.  **(+) Trattamento Integrativo (ex Bonus Renzi)**: Per i redditi fino a 15.000 €, spetta un bonus fino a 1.200 € annui che si aggiunge al netto.
8.  **(=) Stipendio Netto Annuale**: L'importo finale che il dipendente riceve.

#### **Dal Lordo al Costo Aziendale (Prospettiva dell'Azienda)**
Il costo che l'azienda sostiene è molto più alto della RAL.
1.  **RAL**: Il salario lordo del dipendente.
2.  **(+) Contributi INPS/INAIL a carico dell'azienda**: L'onere maggiore, circa il **30-32%** della RAL, per finanziare pensioni, assicurazione contro gli infortuni, etc.
3.  **(+) Quota TFR (Trattamento di Fine Rapporto)**: L'azienda accantona ogni anno una somma pari alla RAL divisa per 13,5.
4.  **(+) Stima IRAP (se applicabile)**: L'Imposta Regionale sulle Attività Produttive, calcolata sul costo del lavoro, con un'aliquota media del 3,9%.
5.  **(=) Costo Totale Annuo Aziendale**.

### **Parte 3: Focus sulla Normativa Fiscale (Anno 2025)**

La normativa è soggetta a cambiamenti. Per questa simulazione, si fa riferimento alle regole in vigore.

| Scaglioni IRPEF 2025 | Aliquota |
| :--- | :--- |
| Fino a 28.000 € | 23% |
| Da 28.001 € a 50.000 € | 35% |
| Oltre 50.000 € | 43% |

Un elemento chiave è lo **sgravio contributivo** a favore dei dipendenti, che per il 2025 è tipicamente strutturato così:
* **-6%** sui contributi per imponibili mensili fino a 2.692 €.
* **-7%** sui contributi per imponibili mensili fino a 1.923 €.

Questo sgravio **non riduce il costo per l'azienda**, ma aumenta significativamente il netto in busta paga per le fasce di reddito medio-basse.

### **Conclusione: Un Numero, Tante Prospettive**

Il costo del lavoro in Italia è un tema complesso. Strumenti come questo calcolatore aiutano a fare chiarezza, mostrando come un singolo valore (la RAL) generi flussi finanziari molto diversi: un costo elevato per l'impresa e un netto percepito dal lavoratore notevolmente inferiore. La differenza, il cuneo fiscale e contributivo, è ciò che finanzia il sistema di welfare state (sanità, pensioni, ammortizzatori sociali).

**Disclaimer**: Questa è una simulazione basata su parametri standard. Il calcolo preciso in busta paga può variare in base a CCNL, addizionali regionali/comunali, carichi di famiglia e altre variabili non considerate. Consultare sempre un Consulente del Lavoro per dati ufficiali.`
};


const CuneoFiscaleCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        ral: 32000,
        mensilita: 13,
        include_irap: false,
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };

    const handleReset = () => {
        setStates(initialStates);
    };

    const calculatedOutputs = useMemo(() => {
        const { ral, mensilita, include_irap } = states;
        
        // --- Parametri di calcolo (aggiornati a normative recenti) ---
        const ALIQUOTA_INPS_DIPENDENTE = 0.0919;
        const ALIQUOTA_CONTRIBUTI_AZIENDA = 0.31; // Stima media INPS + INAIL
        const ALIQUOTA_IRAP = 0.039;

        // 1. Calcolo Contributi a carico del dipendente (con sgravio)
        const lordoMensile = ral / mensilita;
        let sgravioPerc = 0;
        if (lordoMensile <= 2692) sgravioPerc = 0.06;
        if (lordoMensile <= 1923) sgravioPerc = 0.07;
        const aliquotaEffettivaInpsDipendente = ALIQUOTA_INPS_DIPENDENTE - (ALIQUOTA_INPS_DIPENDENTE * sgravioPerc / 0.0919); // Lo sgravio si applica sulla quota IVS
        const contributi_inps_dipendente = ral * (sgravioPerc > 0 ? (ALIQUOTA_INPS_DIPENDENTE - sgravioPerc) : ALIQUOTA_INPS_DIPENDENTE);
        
        // 2. Calcolo Imponibile Fiscale e IRPEF
        const imponibile_fiscale = ral - contributi_inps_dipendente;

        const calcolaIrpef = (reddito: number) => {
            if (reddito <= 28000) return reddito * 0.23;
            if (reddito <= 50000) return 28000 * 0.23 + (reddito - 28000) * 0.35;
            return 28000 * 0.23 + 22000 * 0.35 + (reddito - 50000) * 0.43;
        };
        const irpef_lorda = calcolaIrpef(imponibile_fiscale);

        // 3. Calcolo Detrazioni
        const calcolaDetrazioni = (reddito: number) => {
            if (reddito <= 15000) return 1955;
            if (reddito <= 28000) return 1910 + 1190 * ((28000 - reddito) / 13000);
            if (reddito <= 50000) return 1910 * ((50000 - reddito) / 22000);
            return 0;
        };
        const detrazioni = calcolaDetrazioni(imponibile_fiscale);
        
        // 4. Trattamento integrativo (ex Bonus Renzi)
        const trattamento_integrativo = imponibile_fiscale <= 15000 ? 1200 : 0;
        
        const irpef_netta = Math.max(0, irpef_lorda - detrazioni);

        // 5. Calcolo Stipendio Netto
        const stipendio_netto_annuale = imponibile_fiscale - irpef_netta + trattamento_integrativo;
        const stipendio_netto_mensile = stipendio_netto_annuale / mensilita;

        // 6. Calcolo Costo Aziendale
        const contributi_azienda = ral * ALIQUOTA_CONTRIBUTI_AZIENDA;
        const tfr_annuo = ral / 13.5;
        const irap_annua = include_irap ? (ral + contributi_azienda) * ALIQUOTA_IRAP : 0;
        const costo_totale_azienda = ral + contributi_azienda + tfr_annuo + irap_annua;

        // 7. Cuneo Fiscale
        const cuneo_fiscale_totale = costo_totale_azienda - stipendio_netto_annuale;
        
        const contributi_totali_lavoratore = ral - imponibile_fiscale;
        const tasse_lavoratore = irpef_netta - trattamento_integrativo;
        const oneri_azienda = costo_totale_azienda - ral;

        return {
            costo_totale_azienda,
            stipendio_netto_annuale,
            stipendio_netto_mensile,
            cuneo_fiscale_totale,
            ral_output: ral,
            // for chart
            tasse_lavoratore,
            contributi_totali_lavoratore,
            oneri_azienda,
        };
    }, [states]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

    const chartData = [
        { name: 'Stipendio Netto Dipendente', value: calculatedOutputs.stipendio_netto_annuale },
        { name: 'Contributi Dipendente', value: calculatedOutputs.contributi_totali_lavoratore },
        { name: 'IRPEF Dipendente', value: calculatedOutputs.tasse_lavoratore },
        { name: 'Costi a Carico Azienda', value: calculatedOutputs.oneri_azienda },
    ];
    const COLORS = ['#4ade80', '#fbbf24', '#f87171', '#60a5fa'];

    const formulaUsata = `CostoAzienda = RAL + ContributiAzienda (~31%) + TFR (RAL/13.5) + IRAP (opz.)
NettoDipendente = RAL - ContributiDipendente (9.19% con sgravi) - IRPEF_Netta`;

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;
            if (!calculatorRef.current) return;
            const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${slug}.pdf`);
        } catch (_e) { alert("Errore durante l'esportazione in PDF."); }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const { tasse_lavoratore, contributi_totali_lavoratore, oneri_azienda, ...outputsToSave } = calculatedOutputs;
            const payload = { slug, title, inputs: states, outputs: outputsToSave, timestamp: new Date().toISOString() };
            const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
            const newResults = [payload, ...existingResults].slice(0, 50);
            localStorage.setItem("calc_results", JSON.stringify(newResults));
            alert("Risultato salvato correttamente!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2">
                    <div ref={calculatorRef}>
                        <div className=" -lg -md p-6">
                            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                            <p className="text-gray-600 mb-4">Scopri il costo reale di un dipendente per l'azienda e il suo stipendio netto partendo dalla RAL.</p>
                            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                                <strong>Disclaimer:</strong> Questa è una simulazione che usa parametri standard (es. medie per contributi aziendali, assenza di addizionali locali). Per un calcolo preciso, consultare un Consulente del Lavoro.
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 bg-slate-50 p-4 rounded-lg items-center">
                                {inputs.map(input => (
                                    <div key={input.id}>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                            {input.label}
                                            {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                                        </label>
                                        {input.type === 'number' &&
                                            <div className="relative">
                                                <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-3 pr-12 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                                                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">{input.unit}</span>
                                            </div>
                                        }
                                        {input.type === 'select' &&
                                            <select id={input.id} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" value={states[input.id]} onChange={(e) => handleStateChange(input.id, Number(e.target.value))}>
                                                {input.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        }
                                        {input.type === 'boolean' &&
                                            <div className="flex items-center gap-2 mt-2 h-8">
                                                <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                                <label htmlFor={input.id} className="text-sm text-gray-600">{input.label}</label>
                                            </div>
                                        }
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 space-y-4">
                                <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati della Simulazione</h2>
                                {outputs.map(output => (
                                    <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'costo_totale_azienda' ? 'bg-red-50 border-red-400' : (output.id === 'stipendio_netto_annuale' ? 'bg-green-50 border-green-400' : 'bg-gray-50 border-gray-300')}`}>
                                        <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                        <div className={`text-xl md:text-2xl font-bold ${output.id === 'costo_totale_azienda' ? 'text-red-600' : (output.id === 'stipendio_netto_annuale' ? 'text-green-600' : 'text-gray-800')}`}>
                                            <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">Ripartizione del Costo Totale Aziendale</h3>
                                <div className="h-80 w-full bg-gray-50 p-2 rounded-lg">
                                    {isClient && (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={chartData} cx="50%" cy="50%" labelLine={false} outerRadius="80%" dataKey="value" nameKey="name">
                                                    {chartData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> ))}
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
                     <div className="mt-6 border rounded-lg shadow-md p-4 bg-white">
                        <h3 className="font-semibold text-gray-700">Logica di Calcolo Semplificata</h3>
                        <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaUsata}</p>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={salvaRisultato} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full border border-red-300 bg-red-50 text-red-700 rounded-md px-3 py-2 text-sm hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida al Cuneo Fiscale</h2>
                         <ContentRenderer content={content} />
                    </section>
                     <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.inps.it/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Istituto Nazionale della Previdenza Sociale (INPS)</a></li>
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/cittadini/dichiarazioni/irpef-cittadini" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - IRPEF</a></li>
                             <li><a href="https://www.mef.gov.it/focus/La-Legge-di-Bilancio-2025/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Ministero dell'Economia e delle Finanze - Legge di Bilancio</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default CuneoFiscaleCalculator;