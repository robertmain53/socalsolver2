'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

export const meta = {
    title: "Calcolatore Tasse Sviluppatore Freelance | Stima Netto P.IVA 2025",
    description: "Simula la tassazione per sviluppatori software freelance in Italia. Calcola il tuo netto annuale e mensile in regime forfettario o semplificato, inclusi i contributi INPS."
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
                        "name": "Qual è il codice ATECO per uno sviluppatore software freelance?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Il codice ATECO più comune per gli sviluppatori software freelance è 62.01.00 - 'Produzione di software non connesso all'edizione'. Questo codice ha un coefficiente di redditività del 67% nel Regime Forfettario."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Conviene il Regime Forfettario per un programmatore?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Il Regime Forfettario è molto conveniente per la maggior parte degli sviluppatori freelance, specialmente all'inizio, grazie all'imposta sostitutiva bassa (5% o 15%) e alla gestione semplificata. Diventa meno vantaggioso se si hanno costi deducibili molto alti (superiori al 33% del fatturato)."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Come si calcolano i contributi INPS per un freelance IT?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "I contributi si calcolano applicando un'aliquota (generalmente 26,07% nel 2024/2025) al reddito imponibile lordo (fatturato per il coefficiente del 67% nel forfettario, o fatturato meno costi nel semplificato). I contributi versati sono poi interamente deducibili ai fini fiscali."
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
  "slug": "tassazione-sviluppatori-software-freelance",
  "category": "Fisco e Lavoro Autonomo",
  "title": "Calcolatore Tassazione per Sviluppatori Software Freelance",
  "lang": "it",
  "inputs": [
    { "id": "fatturato_annuo", "label": "Fatturato Lordo Annuale", "type": "number", "unit": "€", "min": 0, "step": 1000, "tooltip": "Inserisci il totale dei compensi incassati nell'anno, al lordo di contributi e imposte. Non includere l'IVA se sei in regime ordinario." },
    { "id": "regime_fiscale", "label": "Regime Fiscale Adottato", "type": "select", "options": ["Forfettario", "Semplificato/Ordinario"], "tooltip": "Il Regime Forfettario è un'opzione agevolata con imposta sostitutiva e costi a forfait, disponibile sotto i 85.000€ di fatturato." },
    { "id": "spese_sostenute", "label": "Costi Annuali Deducibili", "type": "number", "unit": "€", "min": 0, "step": 100, "condition": "regime_fiscale == 'Semplificato/Ordinario'", "tooltip": "Inserisci i costi reali legati alla tua attività (es. acquisto hardware, software, licenze, corsi, commercialista). Rilevante solo per il regime Semplificato/Ordinario." },
    { "id": "is_forfettario_startup", "label": "Applichi l'aliquota startup al 5%?", "type": "boolean", "condition": "regime_fiscale == 'Forfettario'", "tooltip": "Seleziona se sei nei primi 5 anni di attività e rispetti i requisiti per l'aliquota ridotta (5%) nel Regime Forfettario." },
    { "id": "has_altra_previdenza", "label": "Versi già contributi obbligatori ad altra cassa?", "type": "boolean", "tooltip": "Seleziona se sei anche un lavoratore dipendente o iscritto ad un'altra cassa di previdenza. Questo riduce l'aliquota INPS dovuta." }
  ],
  "outputs": [
    { "id": "contributi_inps", "label": "Contributi INPS (Gestione Separata)", "unit": "€" },
    { "id": "imponibile_fiscale", "label": "Reddito Imponibile Fiscale", "unit": "€" },
    { "id": "imposta_dovuta", "label": "Imposta Dovuta (IRPEF o Sostitutiva)", "unit": "€" },
    { "id": "netto_annuale", "label": "Netto Annuale Stimato", "unit": "€" },
    { "id": "netto_mensile", "label": "Netto Mensile Medio", "unit": "€" },
    { "id": "tassazione_effettiva", "label": "Aliquota Effettiva Totale (Tasse + INPS)", "unit": "%" }
  ],
  "content": "### **Guida Definitiva alla Tassazione per Sviluppatori Software Freelance**\n\n**Dal Fatturato Lordo al Netto Mensile: Un'Analisi Dettagliata per Programmatori con Partita IVA**\n\nIl mondo dello sviluppo software freelance in Italia è in piena espansione, ma orientarsi tra regimi fiscali, codici ATECO e contributi previdenziali può essere complesso. Questo strumento è progettato per offrirti una stima chiara e accurata del tuo guadagno netto, aiutandoti a pianificare le tue finanze con maggiore consapevolezza. Ricorda: questa è una simulazione. **Consulta sempre un commercialista per una consulenza fiscale personalizzata e per la gestione dei tuoi adempimenti.**\n\n### **Parte 1: Il Codice ATECO e il Regime Fiscale**\n\nIl primo passo per un programmatore freelance è l'apertura della Partita IVA con il corretto codice ATECO.\n\n#### **Il Codice ATECO: 62.01.00**\n\nPer l'attività di **produzione di software non connesso all'edizione** (sviluppo di app, web, software custom, etc.), il codice di riferimento è il **62.01.00**. Questo codice è cruciale perché determina il **coefficiente di redditività** nel Regime Forfettario, fissato al **67%**.\n\n#### **Quale Regime Fiscale Scegliere?**\n\n1.  **Regime Forfettario**: La scelta più comune per chi inizia. È un regime agevolato con notevoli semplificazioni:\n    * **Requisito**: Fatturato annuo inferiore a 85.000€.\n    * **Tassazione**: Un'imposta sostitutiva del **15%**, che scende al **5% per i primi 5 anni** se si rispettano i requisiti \"startup\".\n    * **Calcolo dei Costi**: I costi non si deducono analiticamente. Vengono calcolati a forfait come il 33% del fatturato (il 100% - 67% del coefficiente).\n    * **Vantaggi**: Niente IVA in fattura, contabilità semplificata, niente studi di settore.\n\n2.  **Regime Semplificato/Ordinario**: Diventa obbligatorio sopra i 85.000€ di fatturato o conveniente se si prevedono costi deducibili superiori al 33% del fatturato.\n    * **Tassazione**: Si applica l'**IRPEF progressiva a scaglioni** sul reddito reale (Fatturato - Costi Deducibili).\n    * **Costi Deducibili**: Puoi scaricare tutte le spese inerenti la tua attività: hardware, software, corsi di formazione, utenze, affitto dello studio, ecc.\n    * **Svantaggi**: Gestione dell'IVA, contabilità più complessa e tassazione potenzialmente più alta a parità di fatturato con costi bassi.\n\n### **Parte 2: I Contributi Previdenziali (INPS)**\n\nGli sviluppatori software, in quanto professionisti senza un albo specifico, devono iscriversi alla **Gestione Separata INPS**. Questo è il tuo salvadanaio per la pensione.\n\n* **Come si calcola**: I contributi si calcolano in percentuale sul tuo **reddito imponibile lordo** (fatturato x 67% nel forfettario; fatturato - costi nel semplificato).\n* **Aliquote (dati 2024/2025)**:\n    * **Aliquota Piena: 26,07%**. È quella applicata alla maggior parte dei freelance.\n    * **Aliquota Ridotta: 24%**. Si applica se sei contemporaneamente un lavoratore dipendente o già iscritto ad un'altra forma di previdenza obbligatoria.\n* **Massimale Contributivo**: Esiste un tetto massimo di reddito (circa 119.650€ per il 2024) oltre il quale non si versano più contributi.\n\n**Importante**: I contributi INPS versati sono **completamente deducibili** dal reddito, riducendo così la base su cui si calcolano le imposte finali.\n\n### **Parte 3: Dal Lordo al Netto, Passo Dopo Passo**\n\nIl flusso logico per calcolare il tuo netto è il seguente:\n\n1.  **Calcola il Reddito Imponibile Lordo**: Applica il coefficiente del 67% (Forfettario) o sottrai i costi reali (Semplificato) dal tuo fatturato.\n2.  **Calcola i Contributi INPS**: Applica l'aliquota INPS corretta al reddito imponibile lordo.\n3.  **Calcola il Reddito Imponibile Fiscale**: Sottrai i contributi INPS versati dal reddito imponibile lordo.\n4.  **Calcola l'Imposta Finale**: Applica l'aliquota del 5%/15% (Forfettario) o gli scaglioni IRPEF (Semplificato) al reddito imponibile fiscale.\n5.  **Trova il Tuo Netto**: Sottrai dal fatturato lordo iniziale sia i contributi INPS che l'imposta finale.\n\nQuesto calcolatore esegue questi passaggi in automatico per darti una visione chiara e immediata delle tue finanze."
};

const TassazioneSviluppatoriSoftwareFreelanceCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates: { [key: string]: any } = {
        fatturato_annuo: 65000,
        regime_fiscale: "Forfettario",
        spese_sostenute: 12000,
        is_forfettario_startup: true,
        has_altra_previdenza: false
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => setStates(prev => ({ ...prev, [id]: value }));
    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const { fatturato_annuo, regime_fiscale, spese_sostenute, is_forfettario_startup, has_altra_previdenza } = states;

        const COEFFICIENTE_FORFETTARIO = 0.67;
        const ALIQUOTA_FORFETTARIO_STARTUP = 0.05;
        const ALIQUOTA_FORFETTARIO_STANDARD = 0.15;
        const ALIQUOTA_INPS_PIENA = 0.2607;
        const ALIQUOTA_INPS_RIDOTTA = 0.24;
        const MASSIMALE_INPS = 119650;

        const imponibile_lordo = regime_fiscale === 'Forfettario' ? fatturato_annuo * COEFFICIENTE_FORFETTARIO : fatturato_annuo - spese_sostenute;
        const imponibile_previdenziale = Math.min(imponibile_lordo, MASSIMALE_INPS);
        const aliquota_inps_applicata = has_altra_previdenza ? ALIQUOTA_INPS_RIDOTTA : ALIQUOTA_INPS_PIENA;
        const contributi_inps = imponibile_previdenziale * aliquota_inps_applicata;
        const imponibile_fiscale = Math.max(0, imponibile_lordo - contributi_inps);

        let imposta_dovuta = 0;
        if (regime_fiscale === 'Forfettario') {
            imposta_dovuta = imponibile_fiscale * (is_forfettario_startup ? ALIQUOTA_FORFETTARIO_STARTUP : ALIQUOTA_FORFETTARIO_STANDARD);
        } else {
            const irpef_scaglione1 = Math.max(0, Math.min(imponibile_fiscale, 28000) * 0.23);
            const irpef_scaglione2 = Math.max(0, (Math.min(imponibile_fiscale, 50000) - 28000) * 0.35);
            const irpef_scaglione3 = Math.max(0, (imponibile_fiscale - 50000) * 0.43);
            const addizionali_stimate = imponibile_fiscale * 0.025; // Stima media
            imposta_dovuta = irpef_scaglione1 + irpef_scaglione2 + irpef_scaglione3 + addizionali_stimate;
        }

        const netto_annuale = fatturato_annuo - contributi_inps - imposta_dovuta;
        const netto_mensile = netto_annuale / 12;
        const tassazione_effettiva = fatturato_annuo > 0 ? ((contributi_inps + imposta_dovuta) / fatturato_annuo) * 100 : 0;
        
        return { contributi_inps, imponibile_fiscale, imposta_dovuta, netto_annuale, netto_mensile, tassazione_effettiva };
    }, [states]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
    const formatPercent = (value: number) => `${value.toFixed(2)}%`;

    const chartData = [
        { name: 'Netto in Tasca', value: Math.max(0, calculatedOutputs.netto_annuale) },
        { name: 'Contributi INPS', value: calculatedOutputs.contributi_inps },
        { name: 'Imposte', value: calculatedOutputs.imposta_dovuta },
    ].filter(d => d.value > 0);
    const COLORS = ['#22c55e', '#f97316', '#ef4444'];

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;
            if (!calcolatoreRef.current) return;
            const canvas = await html2canvas(calcolatoreRef.current, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);
            pdf.save(`${slug}-simulazione.pdf`);
        } catch (e) { alert("Errore durante l'esportazione in PDF."); }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            localStorage.setItem(`calc_results_${slug}`, JSON.stringify(payload));
            alert("Risultato salvato nel browser!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2">
                    <div ref={calcolatoreRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">Simula il tuo carico fiscale e contributivo per pianificare al meglio la tua attività freelance.</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo calcolatore fornisce una stima a scopo informativo basata sulla normativa fiscale 2024/2025. Non sostituisce la consulenza di un commercialista.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 bg-slate-50 p-4 rounded-lg">
                            {inputs.map(input => {
                                const conditionMet = !input.condition || (input.condition.includes('==') && states[input.condition.split(' ')[0]] === input.condition.split("'")[1]);
                                if (!conditionMet) return null;

                                const label = (
                                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                        {input.label}
                                        <Tooltip text={input.tooltip}><span className="ml-1.5"><InfoIcon /></span></Tooltip>
                                    </label>
                                );

                                if (input.type === 'boolean') {
                                    return (
                                        <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-2 rounded-md bg-white border self-center">
                                            <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={!!states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                            <label className="text-sm font-medium text-gray-700" htmlFor={input.id}>{input.label}</label>
                                        </div>
                                    );
                                }
                                if (input.type === 'select') {
                                    return (<div key={input.id}>
                                        {label}
                                        <select id={input.id} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 bg-white">
                                            {input.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>);
                                }
                                return (<div key={input.id}>
                                    {label}
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">{input.unit}</span>
                                        <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-7 pr-3 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? 0 : Number(e.target.value))} />
                                    </div>
                                </div>);
                            })}
                        </div>

                        <div className="mt-8">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Risultati della Simulazione</h2>
                            <div className="space-y-3">
                                {outputs.map(output => (
                                    <div key={output.id} className={`flex items-baseline justify-between p-4 rounded-lg ${output.id === 'netto_annuale' ? 'bg-green-50' : (output.id === 'netto_mensile' ? 'bg-sky-50' : 'bg-gray-50')}`}>
                                        <div className="text-sm font-medium text-gray-600">{output.label}</div>
                                        <div className={`text-xl font-bold ${output.id === 'netto_annuale' ? 'text-green-600' : (output.id === 'netto_mensile' ? 'text-sky-600' : 'text-gray-800')}`}>
                                            {isClient ? (output.unit === '%' ? formatPercent((calculatedOutputs as any)[output.id]) : formatCurrency((calculatedOutputs as any)[output.id])) : '...'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Ripartizione del Fatturato</h3>
                            <div className="h-80 w-full bg-slate-50 p-2 rounded-lg">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={chartData} cx="50%" cy="50%" outerRadius={100} dataKey="value" nameKey="name" labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                                if (!percent) return null;
                                                const radius = innerRadius + (outerRadius - innerRadius) * 1.35;
                                                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                                return <text x={x} y={y} fill="#4b5563" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12">{`${(percent * 100).toFixed(0)}%`}</text>;
                                            }}>
                                                {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                            </Pie>
                                            <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                            <Legend iconSize={10} />
                                        </PieChart>
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
                            <button onClick={salvaRisultato} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Simulazione</button>
                            <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta in PDF</button>
                            <button onClick={handleReset} className="w-full text-sm border border-red-200 text-red-700 rounded-md px-3 py-2 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida alla Tassazione</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.inps.it/it/it/dettaglio-scheda.schede-servizio-strumento.schede-contributi.50165.gestione-separata.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">INPS - Gestione Separata</a></li>
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/ivaimpostesostitutive/regime-forfetario-imprese-e-professionisti" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Regime Forfettario</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default TassazioneSviluppatoriSoftwareFreelanceCalculator;