'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

// --- Icona per i Tooltip (SVG inline per evitare dipendenze) ---
const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600">
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
                        "name": "Qual è il Codice ATECO per un agente immobiliare?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Il Codice ATECO per l'attività di mediazione immobiliare è 68.31.00. Questo codice determina un coefficiente di redditività dell'86% nel Regime Forfettario e l'iscrizione alla Gestione Commercianti INPS."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Posso dedurre i costi nel Regime Forfettario?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "No, nel Regime Forfettario i costi vengono detratti in modo forfettario attraverso il coefficiente di redditività (100% - 86% = 14%). Non è possibile dedurre analiticamente costi come affitto, marketing o software."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "La riduzione INPS del 35% per forfettari è sempre conveniente?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "La riduzione del 35% sui contributi INPS offre un risparmio fiscale immediato, ma riduce l'importo che verrà accreditato per la pensione futura. La scelta va ponderata in base alla propria pianificazione previdenziale a lungo termine."
                        }
                    }
                ]
            })
        }}
    />
);

// --- Componente per il rendering del contenuto Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
    // Semplice parser Markdown per questa specifica applicazione
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    const blocks = content.split('\n\n');

    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {blocks.map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) {
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-4 text-gray-800" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/, '').replace(/\*\*/, '')) }} />;
                }
                if (trimmedBlock.startsWith('#### **')) {
                    return <h4 key={index} className="text-lg font-semibold mt-4 mb-3 text-gray-800" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/, '').replace(/\*\*/, '')) }} />;
                }
                 if (trimmedBlock.startsWith('* **')) { // Per liste con grassetto
                    const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
                    return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ul>;
                }
                if (trimmedBlock.startsWith('*')) {
                    const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
                    return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ul>;
                }
                if (trimmedBlock) {
                    return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                }
                return null;
            })}
        </div>
    );
};

// --- Dati di Configurazione (incollati direttamente per l'esempio) ---
const calculatorData = {
    slug: "tassazione-agenti-immobiliari-inps",
    title: "Calcolatore Tassazione Agenti Immobiliari (con INPS Commercianti)",
    inputs: [
        { id: "fatturato_annuo", label: "Fatturato Lordo Annuale", type: "number" as const, unit: "€", min: 0, step: 1000, tooltip: "Inserisci il totale dei ricavi o compensi incassati nell'anno, senza IVA." },
        { id: "regime_forfettario", label: "Applichi il Regime Forfettario?", type: "boolean" as const, tooltip: "Seleziona questa opzione se aderisci al regime fiscale agevolato. In caso contrario, verrà simulato il regime ordinario semplificato." },
        { id: "start_up", label: "Sei in regime Start-up (primi 5 anni)?", type: "boolean" as const, condition: "regime_forfettario == true", tooltip: "Se hai aperto la Partita IVA da meno di 5 anni e rispetti i requisiti, puoi beneficiare dell'imposta sostitutiva ridotta al 5%." },
        { id: "riduzione_inps_forfettario", label: "Richiedi la riduzione INPS del 35%?", type: "boolean" as const, condition: "regime_forfettario == true", tooltip: "Chi è in regime forfettario può richiedere una riduzione del 35% sui contributi INPS. Attenzione: questa scelta ridurrà anche l'importo della pensione futura." },
        { id: "costi_deducibili", label: "Costi Deducibili Sostenuti", type: "number" as const, unit: "€", min: 0, step: 100, condition: "regime_forfettario == false", tooltip: "Solo in regime ordinario. Inserisci i costi inerenti alla tua attività (es. software, marketing, affitto ufficio, etc.)." },
        { id: "contributi_previdenziali_versati", label: "Contributi INPS già versati nell'anno", type: "number" as const, unit: "€", min: 0, step: 50, tooltip: "Inserisci l'importo dei contributi INPS già pagati durante l'anno di riferimento (es. acconti). Questi sono interamente deducibili." }
    ],
    outputs: [
        { id: "reddito_imponibile", label: "Reddito Imponibile (Fiscale)", unit: "€" },
        { id: "contributi_inps_totali", label: "Contributi INPS Totali Dovuti", unit: "€" },
        { id: "imposta_dovuta", label: "Imposta Totale Dovuta (IRPEF o Sostitutiva)", unit: "€" },
        { id: "reddito_netto_annuale", label: "Reddito Netto Annuale Stimato", unit: "€" },
        { id: "tassazione_effettiva", label: "Aliquota Effettiva Totale (Tasse + INPS)", unit: "%" }
    ],
    content: "### **Guida Completa alla Tassazione per Agenti Immobiliari\n**\n**Analisi Approfondita dei Regimi Fiscali e Contributivi per Professionisti del Real Estate**\n\nL'attività di agente immobiliare, normata dalla legge 39/1989, richiede non solo competenze commerciali e giuridiche, ma anche una solida comprensione del quadro fiscale e previdenziale. La scelta del regime fiscale e la corretta gestione dei contributi sono decisive per la sostenibilità e la redditività della professione.\n\nQuesto strumento è progettato per offrire una **simulazione chiara e dettagliata** del carico fiscale e contributivo, consentendo di confrontare i due principali regimi a disposizione: il **Regime Forfettario** e il **Regime Ordinario Semplificato**. Ricordiamo che i risultati sono una stima e non sostituiscono una consulenza personalizzata da parte di un Dottore Commercialista.\n\n### **Parte 1: Inquadramento dell'Agente Immobiliare**\n\nL'agente immobiliare è un professionista che opera come intermediario nella compravendita o locazione di immobili. Dal punto di vista fiscale, l'attività è classificata con il **Codice ATECO 68.31.00 - Attività di mediazione immobiliare**.\n\nQuesto codice è fondamentale perché determina due aspetti chiave:\n1.  **Iscrizione Previdenziale**: L'agente immobiliare è obbligato all'iscrizione presso la **Gestione Artigiani e Commercianti dell'INPS**.\n2.  **Coefficiente di Redditività**: In caso di adesione al Regime Forfettario, a questo codice è associato un coefficiente dell'**86%**, che rappresenta la percentuale di fatturato considerata come reddito imponibile.\n\n### **Parte 2: Analisi Comparata dei Regimi Fiscali**\n\nLa scelta tra Regime Forfettario e Ordinario dipende da molteplici fattori, tra cui il volume di fatturato previsto e l'ammontare dei costi di gestione.\n\n#### **Il Regime Forfettario: Semplicità e Tassazione Agevolata**\n\nÈ il regime naturale per chi avvia l'attività, grazie ai suoi notevoli vantaggi.\n\n* **Requisiti**: Il requisito primario è non superare **85.000 € di ricavi** o compensi annui.\n* **Come si calcolano le tasse**: Non si deducono analiticamente i costi. L'imponibile fiscale si ottiene applicando al fatturato lordo il coefficiente di redditività dell'86%. Su questo importo si calcola un'unica **imposta sostitutiva**:\n    * **5% per i primi 5 anni** (regime start-up), a patto di rispettare specifici requisiti.\n    * **15% dal sesto anno in poi**.\n* **Vantaggi**: Esenzione da IVA, IRAP e studi di settore. Contabilità semplificata.\n* **Svantaggi**: Impossibilità di dedurre i costi reali (affitto ufficio, marketing, etc.) e di detrarre l'IVA sugli acquisti.\n\n#### **La Gestione Contributiva INPS per i Commercianti**\n\nL'iscrizione alla Gestione Commercianti INPS prevede un doppio binario contributivo:\n\n1.  **Contributi Fissi (Minimali)**: Si pagano obbligatoriamente a prescindere dal fatturato, calcolati su un reddito minimo (o \"minimale\") stabilito annualmente dall'INPS (per il 2024: **18.415 €**). I contributi fissi ammontano a circa **4.515 €** annui.\n2.  **Contributi a Percentuale (Variabili)**: Se il reddito imponibile supera il minimale di 18.415 €, sulla parte eccedente si applica un'aliquota del **24,48%**.\n\n**Agevolazione per Forfettari**: Chi aderisce al Regime Forfettario può richiedere una **riduzione del 35%** sia sui contributi fissi che su quelli variabili. È una scelta opzionale da valutare attentamente, poiché a un risparmio immediato corrisponde un montante contributivo inferiore ai fini pensionistici.\n\n#### **Il Regime Ordinario Semplificato**\n\nDiventa obbligatorio superati gli 85.000 € di fatturato o può essere una scelta di convenienza se si prevedono costi di gestione elevati.\n\n* **Come si calcolano le tasse**: Il reddito imponibile è dato dalla **differenza tra ricavi e costi deducibili** (es. acquisto materiali, utenze, collaboratori). Su questo reddito si applica la **tassazione progressiva IRPEF** a scaglioni.\n\n* **Scaglioni IRPEF (in vigore dal 2024)**:\n    * Fino a 28.000 €: **23%**\n    * Da 28.001 € a 50.000 €: **35%**\n    * Oltre 50.000 €: **43%**\n* **Contributi INPS**: Si calcolano con le stesse regole dei forfettari (fissi + variabili), ma **senza la possibilità di richiedere la riduzione del 35%**. I contributi versati sono interamente deducibili dal reddito imponibile ai fini IRPEF.\n\n### **Parte 3: FAQ - Domande Frequenti**\n\n* **Quando conviene il Regime Ordinario?**\n    Quando i costi reali deducibili superano il 14% del fatturato (ovvero la quota di costi \"forfettizzata\" nel Regime Forfettario). Se, ad esempio, su 60.000 € di fatturato si sostengono 15.000 € di costi, il regime ordinario potrebbe essere più vantaggioso.\n\n* **Posso passare da un regime all'altro?**\n    Sì, il passaggio dal forfettario all'ordinario (e viceversa, se si rientra nei requisiti) avviene per comportamento concludente dall'inizio dell'anno fiscale.\n\n* **Cosa sono gli acconti e i saldi?**\n    Le imposte e i contributi si pagano tramite un meccanismo di acconti (durante l'anno di riferimento) e un saldo (l'anno successivo). Questo calcolatore stima l'importo totale dovuto per l'anno, che andrà poi versato secondo le scadenze fiscali (tipicamente 30 Giugno e 30 Novembre)."
};

const TassazioneAgentiImmobiliariInpsCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);
    
    const initialStates = {
        fatturato_annuo: 60000,
        regime_forfettario: true,
        start_up: true,
        riduzione_inps_forfettario: true,
        costi_deducibili: 8000,
        contributi_previdenziali_versati: 0
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };
    
    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const { fatturato_annuo, regime_forfettario, start_up, riduzione_inps_forfettario, costi_deducibili, contributi_previdenziali_versati } = states;
        
        // --- Costanti Fiscali (basate su dati 2024) ---
        const COEFFICIENTE_REDDITIVITA = 0.86;
        const REDDITO_MINIMALE_INPS = 18415;
        const ALIQUOTA_INPS = 0.2448;
        const CONTRIBUTI_FISSI_INPS_PIENI = REDDITO_MINIMALE_INPS * ALIQUOTA_INPS;

        let reddito_imponibile = 0, imposta_dovuta = 0, contributi_inps_totali = 0, reddito_netto_annuale = 0;
        let imponibile_previdenziale = 0;

        if (regime_forfettario) {
            imponibile_previdenziale = fatturato_annuo * COEFFICIENTE_REDDITIVITA;
            reddito_imponibile = Math.max(0, imponibile_previdenziale - contributi_previdenziali_versati);
            
            const aliquota_imposta = start_up ? 0.05 : 0.15;
            imposta_dovuta = reddito_imponibile * aliquota_imposta;
            
            const contributi_dovuti_pieni = imponibile_previdenziale > REDDITO_MINIMALE_INPS
                ? CONTRIBUTI_FISSI_INPS_PIENI + (imponibile_previdenziale - REDDITO_MINIMALE_INPS) * ALIQUOTA_INPS
                : CONTRIBUTI_FISSI_INPS_PIENI;
            
            contributi_inps_totali = riduzione_inps_forfettario ? contributi_dovuti_pieni * 0.65 : contributi_dovuti_pieni;

        } else { // Regime Ordinario
            imponibile_previdenziale = Math.max(0, fatturato_annuo - costi_deducibili);
            reddito_imponibile = Math.max(0, imponibile_previdenziale - contributi_previdenziali_versati);

            // Calcolo IRPEF progressivo
            if (reddito_imponibile <= 28000) {
                imposta_dovuta = reddito_imponibile * 0.23;
            } else if (reddito_imponibile <= 50000) {
                imposta_dovuta = (28000 * 0.23) + ((reddito_imponibile - 28000) * 0.35);
            } else {
                imposta_dovuta = (28000 * 0.23) + (22000 * 0.35) + ((reddito_imponibile - 50000) * 0.43);
            }

            contributi_inps_totali = imponibile_previdenziale > REDDITO_MINIMALE_INPS
                ? CONTRIBUTI_FISSI_INPS_PIENI + (imponibile_previdenziale - REDDITO_MINIMALE_INPS) * ALIQUOTA_INPS
                : CONTRIBUTI_FISSI_INPS_PIENI;
        }

        const costi_effettivi = regime_forfettario ? 0 : costi_deducibili;
        reddito_netto_annuale = fatturato_annuo - imposta_dovuta - contributi_inps_totali - costi_effettivi;
        const tassazione_effettiva = fatturato_annuo > 0 ? ((imposta_dovuta + contributi_inps_totali) / fatturato_annuo) * 100 : 0;
        
        return { reddito_imponibile, imposta_dovuta, contributi_inps_totali, reddito_netto_annuale, tassazione_effettiva };
    }, [states]);

    const chartData = [
        { name: 'Reddito Netto', value: calculatedOutputs.reddito_netto_annuale, fill: '#22c55e' },
        { name: 'Imposte (IRPEF/Sost.)', value: calculatedOutputs.imposta_dovuta, fill: '#ef4444' },
        { name: 'Contributi INPS', value: calculatedOutputs.contributi_inps_totali, fill: '#3b82f6' },
    ];
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
    const formatPercentage = (value: number) => `${value.toFixed(2)} %`;

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
        } catch (_e) { alert("Errore durante l'esportazione in PDF."); }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
            const newResults = [payload, ...existingResults].slice(0, 50);
            localStorage.setItem("calc_results", JSON.stringify(newResults));
            alert("Risultato salvato con successo!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2">
                    <div ref={calcolatoreRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">Simula il tuo carico fiscale e contributivo e confronta i regimi fiscali.</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo calcolatore fornisce una stima a scopo puramente informativo e non sostituisce una consulenza fiscale professionale. I calcoli si basano sulla normativa e sui dati del 2024.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 bg-slate-50 p-4 rounded-lg">
                            {inputs.map(input => {
                                const conditionMet = !input.condition || (input.condition.includes('== true') && states[input.condition.split(' ')[0]]);
                                if (!conditionMet) return null;

                                const inputLabel = (
                                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                        {input.label}
                                        {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                                    </label>
                                );

                                if (input.type === 'boolean') {
                                    return (
                                        <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-2 rounded-md bg-white border">
                                           <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={!!states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                            <div>{inputLabel}</div>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={input.id} className={input.id === 'fatturato_annuo' ? 'md:col-span-2' : ''}>
                                        {inputLabel}
                                        <div className="relative">
                                            <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-3 pr-10 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                                            {input.unit && <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">{input.unit}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="mt-8">
                           <h2 className="text-xl font-semibold text-gray-800 mb-4">Risultati della Simulazione ({states.regime_forfettario ? 'Forfettario' : 'Ordinario'})</h2>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div className="md:col-span-2 space-y-3">
                                   {outputs.map(output => (
                                       <div key={output.id} className={`flex items-baseline justify-between p-4 rounded-lg ${output.id === 'reddito_netto_annuale' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-gray-50 border-l-4 border-gray-300'}`}>
                                           <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                           <div className={`text-xl md:text-2xl font-bold ${output.id === 'reddito_netto_annuale' ? 'text-green-600' : 'text-gray-800'}`}>
                                               <span>{isClient ? (output.unit === '€' ? formatCurrency((calculatedOutputs as any)[output.id]) : formatPercentage((calculatedOutputs as any)[output.id])) : '...'}</span>
                                           </div>
                                       </div>
                                   ))}
                               </div>
                               <div className="md:col-span-2 mt-4">
                                   <h3 className="text-lg font-semibold text-gray-700 mb-2 text-center">Ripartizione del Fatturato</h3>
                                   <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                                       {isClient && (
                                           <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(entry) => formatCurrency(entry.value)}>
                                                        {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
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
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={salvaRisultato} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 rounded-md px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                        </div>
                    </section>
                     <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="text-xl font-semibold mb-2 text-gray-800">Guida alla Tassazione</h2>
                         <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti Normativi</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/iva-e-imposte-indirette/regime-forfetario-persone-fisiche" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Regime Forfettario</a></li>
                            <li><a href="https://www.inps.it/it/it/dettaglio-scheda-prestazione.schede-servizio-strumento.50058.gestione-commercianti.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">INPS - Gestione Commercianti</a></li>
                            <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2014-12-23;190" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Legge di Stabilità 2015, Art. 1, commi 54-89</a> (Istituzione Regime Forfettario).</li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default TassazioneAgentiImmobiliariInpsCalculator;