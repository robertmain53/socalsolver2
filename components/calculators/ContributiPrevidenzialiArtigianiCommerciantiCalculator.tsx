'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

export const meta = {
    title: "Calcolatore Contributi INPS Artigiani e Commercianti 2025",
    description: "Calcola con precisione i contributi previdenziali (fissi e variabili) per artigiani e commercianti, anche in regime forfettario. Stima le rate e il totale annuo."
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
                        "name": "Come si calcolano i contributi INPS per un artigiano?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "I contributi si calcolano su due livelli: una quota fissa (contributi minimali) dovuta da tutti fino a un reddito di 18.415€, e una quota variabile calcolata in percentuale sulla parte di reddito che eccede tale minimale. Questo calcolatore automatizza entrambi i calcoli."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Quanto si risparmia con la riduzione del 35% per i forfettari?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "I contribuenti in regime forfettario possono richiedere una riduzione del 35% sia sui contributi fissi che su quelli variabili. Questo comporta un notevole risparmio, ma è importante sapere che riduce anche il montante contributivo ai fini pensionistici."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Quali sono le scadenze per pagare i contributi fissi INPS?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "I contributi fissi si versano in quattro rate trimestrali tramite modello F24, con scadenze fisse: 16 maggio, 20 agosto, 16 novembre e 16 febbraio dell'anno successivo."
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
                if (trimmedBlock.startsWith('| Categoria')) {
                     const rows = trimmedBlock.split('\n').map(row => row.split('|').map(cell => cell.trim()).slice(1, -1));
                     const headers = rows[0];
                     const bodyRows = rows.slice(2);
                     return (
                         <div key={index} className="overflow-x-auto my-4">
                             <table className="min-w-full border text-sm">
                                 <thead className="bg-gray-100">
                                     <tr>
                                         {headers.map((header, i) => <th key={i} className="p-2 border text-left font-semibold">{header}</th>)}
                                     </tr>
                                 </thead>
                                 <tbody>
                                     {bodyRows.map((row, i) => (
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

// --- Dati di configurazione del calcolatore (dal JSON) ---
const calculatorData = {
  "slug": "contributi-previdenziali-artigiani-commercianti",
  "category": "Fisco e Lavoro Autonomo",
  "title": "Calcolatore Contributi Previdenziali per Artigiani e Commercianti (fissi e variabili)",
  "lang": "it",
  "inputs": [
    { "id": "reddito_imponibile", "label": "Reddito Imponibile Lordo", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Inserisci il tuo reddito imponibile annuo. Per il regime forfettario, è il fatturato moltiplicato per il coefficiente di redditività." },
    { "id": "is_commerciante", "label": "Sei un Commerciante?", "type": "boolean" as const, "tooltip": "Spunta questa casella se sei iscritto alla Gestione Commercianti. Lasciala deselezionata se sei un Artigiano." },
    { "id": "under_21", "label": "Hai meno di 21 anni?", "type": "boolean" as const, "tooltip": "I soggetti con meno di 21 anni beneficiano di un'aliquota ridotta." },
    { "id": "is_forfettario", "label": "Applichi il Regime Forfettario?", "type": "boolean" as const, "tooltip": "Seleziona se aderisci al regime fiscale forfettario." },
    { "id": "richiesta_riduzione_forfettario", "label": "Hai richiesto la riduzione del 35%?", "type": "boolean" as const, "condition": "is_forfettario == true", "tooltip": "La riduzione del 35% sui contributi per i forfettari non è automatica, ma va richiesta esplicitamente all'INPS." }
  ],
  "outputs": [
    { "id": "contributi_fissi", "label": "Contributi Fissi Annuali (sul minimale)", "unit": "€" },
    { "id": "contributi_variabili", "label": "Contributi Variabili Annuali (sull'eccedenza)", "unit": "€" },
    { "id": "totale_contributi_ivs", "label": "Totale Contributi IVS (Fissi + Variabili)", "unit": "€" },
    { "id": "contributo_maternita", "label": "Contributo Maternità", "unit": "€" },
    { "id": "totale_annuo_dovuto", "label": "Totale Annuo Complessivo Dovuto", "unit": "€" },
    { "id": "rata_trimestrale_fissi", "label": "Rata Trimestrale Contributi Fissi", "unit": "€" }
  ],
  "content": "### **Guida Completa ai Contributi INPS per Artigiani e Commercianti**\n\n**Principi di Calcolo, Scadenze e Strategie di Ottimizzazione per Lavoratori Autonomi**\n\nLa gestione dei contributi previdenziali rappresenta uno degli aspetti più critici e complessi per artigiani e commercianti. Comprendere il meccanismo di calcolo, le aliquote applicate e le scadenze di pagamento è fondamentale non solo per essere in regola con gli obblighi di legge, ma anche per una corretta pianificazione finanziaria e fiscale della propria attività. \n\nQuesto strumento è progettato per offrire una stima precisa e affidabile dei contributi IVS (Invalidità, Vecchiaia e Superstiti) dovuti, ma anche per fungere da guida autorevole e dettagliata. L'obiettivo è superare la semplice esecuzione di un calcolo, fornendo il contesto normativo e strategico necessario. **Ricorda che questo calcolatore offre una stima e non sostituisce la consulenza di un commercialista o di un consulente del lavoro.**\n\n### **Parte 1: Il Calcolatore - Logica di Funzionamento**\n\nIl nostro calcolatore si basa sulle normative INPS vigenti e utilizza i parametri ufficiali per determinare l'importo dovuto. I dati chiave richiesti sono:\n\n* **Reddito Imponibile Lordo**: È la base su cui vengono calcolati i contributi. Per chi opera in regime ordinario, corrisponde all'utile d'impresa. Per i forfettari, si ottiene applicando il coefficiente di redditività al fatturato annuo.\n* **Tipologia di Attività**: Le aliquote contributive differiscono leggermente tra la Gestione Artigiani e la Gestione Commercianti.\n* **Età**: Gli imprenditori con meno di 21 anni godono di un'aliquota agevolata.\n* **Regime Fiscale**: L'adesione al Regime Forfettario consente di accedere a una significativa riduzione contributiva, ma è un'opzione da valutare attentamente.\n\n### **Parte 2: La Struttura dei Contributi IVS - Fissi e Variabili**\n\nIl sistema contributivo per artigiani e commercianti è duale: si compone di una parte fissa e una parte variabile.\n\n#### **1. Contributi Fissi (sul Reddito Minimale)**\n\nIndipendentemente dal reddito effettivo prodotto (anche se pari a zero), ogni iscritto è tenuto a versare un contributo fisso obbligatorio. Questo importo è calcolato su un **reddito minimale** stabilito annualmente dall'INPS (per il 2025, la stima è di **18.415 €**).\n\nIn pratica, si paga una quota fissa come se si fosse prodotto almeno il reddito minimale. Questi contributi si versano in **quattro rate trimestrali** di pari importo con scadenze fisse:\n\n* 16 Maggio\n* 20 Agosto\n* 16 Novembre\n* 16 Febbraio (dell'anno successivo)\n\n#### **2. Contributi Variabili (a Percentuale sull'Eccedenza)**\n\nSe il reddito imponibile supera il minimale di 18.415 €, sulla parte eccedente si applica un'aliquota percentuale per calcolare i contributi variabili.\n\nEsempio: Con un reddito di 30.000 €, i contributi si calcolano così:\n* **Contributi Fissi**: Calcolati su 18.415 €.\n* **Contributi Variabili**: Calcolati sulla differenza, ovvero 30.000 € - 18.415 € = 11.585 €.\n\nI contributi variabili si pagano in concomitanza con le scadenze delle imposte sui redditi (tipicamente 30 Giugno e 30 Novembre).\n\n### **Parte 3: Aliquote e Massimali per il 2025**\n\nLe aliquote sono il cuore del calcolo. Di seguito una tabella riassuntiva basata sulle stime per il 2025.\n\n| Categoria                 | Titolari > 21 anni | Titolari < 21 anni |\n|---------------------------|--------------------|--------------------|\n| **Artigiani** | 24,00%             | 23,25%             |\n| **Commercianti** | 24,48%             | 23,73%             |\n\n**Il Massimale Imponibile**: Esiste un tetto massimo al reddito su cui calcolare i contributi IVS, noto come **massimale imponibile** (stimato a **91.680 €** per il 2025 per chi ha iniziato a versare dopo il 1996). Sui redditi che superano questa soglia, non si pagano ulteriori contributi IVS, ma è previsto un contributo di solidarietà aggiuntivo.\n\n### **Parte 4: Il Regime Forfettario e la Riduzione del 35%**\n\nChi aderisce al Regime Forfettario può beneficiare di un'agevolazione di grande impatto: una **riduzione del 35%** sull'importo totale dei contributi dovuti (sia fissi che variabili).\n\n**Attenzione, ci sono tre aspetti cruciali da considerare:**\n\n1.  **Non è automatica**: La riduzione deve essere richiesta esplicitamente tramite il cassetto previdenziale INPS entro il 28 Febbraio di ogni anno.\n2.  **È opzionale**: Si può scegliere di non avvalersene e pagare i contributi in misura piena.\n3.  **Impatto sulla Pensione**: L'applicazione della riduzione comporta un accredito di mesi ai fini pensionistici proporzionale a quanto effettivamente versato. Pagando il 35% in meno, si maturerà una pensione proporzionalmente più bassa per quell'anno. Se il versamento scende al di sotto del minimo richiesto per validare un intero anno di contributi, si otterrà un'accredito ridotto (es. 8 mesi invece di 12).\n\n### **Conclusione: Pianificazione e Consulenza**\n\nUna corretta gestione dei contributi INPS è un pilastro per la salute finanziaria di un'impresa individuale e per la costruzione di un futuro previdenziale solido. Utilizza questo calcolatore per avere una chiara visione del tuo carico contributivo, simulare diversi scenari di reddito e comprendere l'impatto delle tue scelte fiscali. Per decisioni strategiche, come la richiesta della riduzione per forfettari, il confronto con un professionista è sempre la scelta più saggia."
};

const ContributiPrevidenzialiArtigianiCommerciantiCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        reddito_imponibile: 35000,
        is_commerciante: false,
        under_21: false,
        is_forfettario: false,
        richiesta_riduzione_forfettario: false
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };
    
    const handleReset = () => {
        setStates(initialStates);
    };

    const calculatedOutputs = useMemo(() => {
        // Costanti INPS 2025 (stime basate su dati 2024 + inflazione)
        const MINIMALE_REDDITO = 18415;
        const MASSIMALE_REDDITO = 91680; // Per iscritti post 1996
        const ALIQUOTA_ARTIGIANI = 0.24;
        const ALIQUOTA_COMMERCIANTI = 0.2448;
        const ALIQUOTA_ARTIGIANI_UNDER21 = 0.2325;
        const ALIQUOTA_COMMERCIANTI_UNDER21 = 0.2373;
        const CONTRIBUTO_MATERNITA = 7.77;
        const RIDUZIONE_FORFETTARIO = 0.35;

        const { reddito_imponibile, is_commerciante, under_21, is_forfettario, richiesta_riduzione_forfettario } = states;
        
        let aliquota;
        if (is_commerciante) {
            aliquota = under_21 ? ALIQUOTA_COMMERCIANTI_UNDER21 : ALIQUOTA_COMMERCIANTI;
        } else {
            aliquota = under_21 ? ALIQUOTA_ARTIGIANI_UNDER21 : ALIQUOTA_ARTIGIANI;
        }

        const contributi_fissi_lordi = MINIMALE_REDDITO * aliquota;
        
        const reddito_eccedente = Math.max(0, reddito_imponibile - MINIMALE_REDDITO);
        const reddito_imponibile_variabili = Math.min(reddito_eccedente, MASSIMALE_REDDITO - MINIMALE_REDDITO);
        const contributi_variabili_lordi = reddito_imponibile_variabili * aliquota;

        const riduzione = is_forfettario && richiesta_riduzione_forfettario ? (1 - RIDUZIONE_FORFETTARIO) : 1;

        const contributi_fissi = contributi_fissi_lordi * riduzione;
        const contributi_variabili = contributi_variabili_lordi * riduzione;
        const totale_contributi_ivs = contributi_fissi + contributi_variabili;
        const totale_annuo_dovuto = totale_contributi_ivs + CONTRIBUTO_MATERNITA;
        // La riduzione forfettaria non si applica al contributo di maternità
        const rata_trimestrale_fissi = (contributi_fissi_lordi * riduzione + CONTRIBUTO_MATERNITA) / 4;

        return {
            contributi_fissi,
            contributi_variabili,
            totale_contributi_ivs,
            contributo_maternita: CONTRIBUTO_MATERNITA,
            totale_annuo_dovuto,
            rata_trimestrale_fissi,
        };

    }, [states]);

    const chartData = [
        { name: 'Composizione', 'Contributi Fissi': calculatedOutputs.contributi_fissi, 'Contributi Variabili': calculatedOutputs.contributi_variabili, 'Maternità': calculatedOutputs.contributo_maternita },
    ];
    
    const formulaUsata = `Contributi = (MINIMALE * Aliquota) + MAX(0, REDDITO - MINIMALE) * Aliquota) * [se Forfettario: (1 - 0.35)] + Maternità`;

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
        } catch (_e) { alert("Funzione PDF non disponibile in questo ambiente"); }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            localStorage.setItem("calc_results", JSON.stringify([payload, ...JSON.parse(localStorage.getItem("calc_results") || "[]")].slice(0, 50)));
            alert("Risultato salvato con successo!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md" ref={calcolatoreRef}>
                        <div className="p-6">
                            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                            <p className="text-gray-600 mb-4">{meta.description}</p>
                            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                                <strong>Disclaimer:</strong> Questo strumento offre una stima basata sui dati del 2024 aggiornati con l'inflazione programmata per il 2025. I valori ufficiali INPS per il 2025 potrebbero variare leggermente.
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                                {inputs.map(input => {
                                    const conditionMet = !input.condition || (input.condition.includes('== true') && states[input.condition.split(' ')[0]]);
                                    if (!conditionMet) return null;

                                    if (input.type === 'boolean') {
                                        return (
                                            <div key={input.id} className="md:col-span-1 flex items-center gap-3 p-3 rounded-md bg-white border h-full">
                                                <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={!!states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                                <label className="text-sm font-medium text-gray-700 flex items-center" htmlFor={input.id}>
                                                    {input.label}
                                                    <Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip>
                                                </label>
                                            </div>
                                        );
                                    }
                                    
                                    return (
                                        <div key={input.id} className="md:col-span-2">
                                            <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                                {input.label}
                                                <Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip>
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                                                {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-8 space-y-4">
                                <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati del Calcolo</h2>
                                {outputs.map(output => (
                                    <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'totale_annuo_dovuto' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                                        <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                        <div className={`text-xl md:text-2xl font-bold ${output.id === 'totale_annuo_dovuto' ? 'text-indigo-600' : 'text-gray-800'}`}>
                                            <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Composizione dei Contributi Annuali</h3>
                                <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                                    {isClient && (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                <XAxis type="number" hide />
                                                <YAxis type="category" dataKey="name" hide />
                                                <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                                <Legend />
                                                <Bar dataKey="Contributi Fissi" stackId="a" fill="#818cf8" />
                                                <Bar dataKey="Contributi Variabili" stackId="a" fill="#4f46e5" />
                                                <Bar dataKey="Maternità" stackId="a" fill="#fbbf24" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 border rounded-lg shadow-md p-4 bg-white">
                        <h3 className="font-semibold text-gray-700">Formula di Calcolo Utilizzata</h3>
                        <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaUsata}</p>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={salvaRisultato} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva</button>
                            <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full text-sm border border-red-300 rounded-md px-3 py-2 hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolo</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida Approfondita</h2>
                        <ContentRenderer content={content} />
                    </section>
                     <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti Normativi</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.inps.it/it/it/dettaglio-scheda.schede-servizio-strumento.schede-servizi.artigiani-e-commercianti-contribuzione-50186.artigiani-e-commercianti-contribuzione.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">INPS - Contribuzione Artigiani e Commercianti</a></li>
                            <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:1990-08-02;233!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Legge 2 agosto 1990, n. 233</a> - Riforma dei trattamenti pensionistici dei lavoratori autonomi.</li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default ContributiPrevidenzialiArtigianiCommerciantiCalculator;