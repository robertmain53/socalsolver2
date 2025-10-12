'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

export const meta = {
    title: "Simulatore Convenienza: Forfettario vs. Semplificato",
    description: "Calcola le tasse e il reddito netto per scoprire se per la tua Partita IVA è più conveniente il Regime Forfettario o quello Semplificato."
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
                        "name": "Quando conviene il Regime Forfettario?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Il Regime Forfettario è generalmente più conveniente quando i costi reali dell'attività sono inferiori a quelli calcolati forfettariamente tramite il coefficiente di redditività. Grazie all'imposta sostitutiva al 5% o 15%, è ideale per professionisti e piccole imprese con basse spese di gestione."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Quando conviene il Regime Semplificato?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Il Regime Semplificato diventa conveniente quando i costi aziendali deducibili (come acquisto di materie prime, affitti, utenze) sono molto alti e superano la quota di costi riconosciuta forfettariamente. Permette di dedurre analiticamente ogni spesa, riducendo l'imponibile IRPEF."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Chi può accedere al Regime Forfettario?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Possono accedere al Regime Forfettario le persone fisiche che esercitano un'attività d'impresa, arte o professione con ricavi o compensi non superiori a 85.000 euro annui e che rispettano specifici requisiti di legge, come non possedere partecipazioni in società di persone o srl controllate che svolgono attività simili."
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
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace('### **', '').replace('**', '')) }} />;
                }
                if (trimmedBlock.startsWith('#### **')) {
                    return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace('#### **', '').replace('**', '')) }} />;
                }
                 if (trimmedBlock.startsWith('*')) {
                    const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
                    return (
                        <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
                            {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}
                        </ul>
                    );
                }
                if (trimmedBlock.match(/^\d\./)) {
                    const items = trimmedBlock.split('\n').map(item => item.replace(/^\d\.\s*/, ''));
                     return (
                        <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">
                            {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}
                        </ol>
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


// --- Dati di configurazione del calcolatore (inclusi direttamente) ---
const calculatorData = {
  "slug": "gestione-separata",
  "category": "fisco-e-lavoro-autonomo",
  "title": "Simulatore Convenienza: Forfettario vs. Semplificato",
  "lang": "it",
  "inputs": [
    { "id": "ricavi", "label": "Ricavi o Compensi Annuali", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "tooltip": "Inserisci il totale dei ricavi o compensi che prevedi di incassare nell'anno, al lordo di imposte e contributi." },
    { "id": "costi_deducibili", "label": "Costi Aziendali Deducibili Sostenuti", "type": "number" as const, "unit": "€", "min": 0, "step": 500, "tooltip": "Inserisci il totale dei costi inerenti alla tua attività (es. affitto ufficio, utenze, materie prime, consulenze). Questi costi sono rilevanti solo per il Regime Semplificato." },
    { "id": "contributi_obbligatori", "label": "Contributi Previdenziali Obbligatori Versati", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Inserisci l'importo totale dei contributi previdenziali (es. INPS Gestione Separata, Cassa Forense) che hai versato nell'anno. Questi sono deducibili in entrambi i regimi." },
    { "id": "coefficiente_redditivita", "label": "Coefficiente di Redditività (ATECO)", "type": "select" as const, "options": [ { "label": "Attività Professionali/Scientifiche (ATECO 78%)", "value": 0.78 }, { "label": "Costruzioni e Attività Immobiliari (ATECO 86%)", "value": 0.86 }, { "label": "Commercio (Ingrosso e Dettaglio) (ATECO 40%)", "value": 0.40 }, { "label": "Commercio Ambulante (Alimenti e Bevande) (ATECO 40%)", "value": 0.40 }, { "label": "Commercio Ambulante (Altri Prodotti) (ATECO 54%)", "value": 0.54 }, { "label": "Intermediari del Commercio (ATECO 62%)", "value": 0.62 }, { "label": "Alloggio e Ristorazione (ATECO 40%)", "value": 0.40 }, { "label": "Altre Attività Economiche (ATECO 67%)", "value": 0.67 } ], "tooltip": "Seleziona il coefficiente associato al tuo codice ATECO. Questo valore determina il reddito imponibile nel Regime Forfettario." },
    { "id": "nuova_attivita", "label": "Sei una Nuova Attività (Startup)?", "type": "boolean" as const, "tooltip": "Spunta questa casella se rispetti i requisiti per l'imposta sostitutiva agevolata al 5% per i primi 5 anni nel Regime Forfettario." }
  ],
  "outputs": [
    { "id": "tasse_forfettario", "label": "Tasse Totali (Regime Forfettario)", "unit": "€" },
    { "id": "tasse_semplificato", "label": "Tasse Totali (Regime Semplificato)", "unit": "€" },
    { "id": "netto_forfettario", "label": "Reddito Netto (Regime Forfettario)", "unit": "€" },
    { "id": "netto_semplificato", "label": "Reddito Netto (Regime Semplificato)", "unit": "€" },
    { "id": "regime_conveniente", "label": "Regime Più Conveniente", "unit": "" }
  ],
  "content": "### **Guida Completa: Regime Forfettario vs. Semplificato - La Scelta Vincente per la Tua Partita IVA**\n\n**Analisi Approfondita, Criteri di Calcolo e Strategie Fiscali per Ottimizzare il Tuo Reddito**\n\nLa scelta del regime fiscale è una delle decisioni più strategiche per un lavoratore autonomo o un'impresa individuale. Da questa scelta dipendono non solo l'ammontare delle tasse da versare, ma anche la complessità degli adempimenti burocratici e la gestione dell'IVA. L'ordinamento italiano offre principalmente due alternative per le piccole attività: il **Regime Forfettario** e il **Regime Semplificato** (o Ordinario Semplificato).\n\nQuesto simulatore è progettato per offrire un confronto chiaro e basato su dati concreti, aiutandoti a comprendere quale regime sia fiscalmente più vantaggioso per la tua situazione specifica. Tuttavia, è fondamentale capire la logica sottostante, i requisiti di accesso e le differenze sostanziali tra i due sistemi. Questa guida si pone l'obiettivo di superare in chiarezza e completezza le risorse esistenti, fornendo un quadro E-E-A-T (Esperienza, Competenza, Autorevolezza, Affidabilità).\n\n**Disclaimer:** Questo strumento fornisce una stima a scopo puramente informativo. I calcoli sono basati sulla normativa vigente ma non possono sostituire una consulenza fiscale personalizzata da parte di un commercialista, che potrà analizzare tutti i dettagli specifici della tua posizione.\n\n### **Parte 1: I Due Regimi a Confronto - Logica e Funzionamento**\n\n#### **Il Regime Forfettario: Semplicità e Tassazione Agevolata**\n\nIl Regime Forfettario è stato introdotto per semplificare la vita ai piccoli imprenditori e professionisti. La sua caratteristica principale è la **determinazione forfettaria del reddito imponibile**.\n\n* **Come funziona?** Invece di dedurre analiticamente ogni singolo costo sostenuto, lo Stato presume che una certa percentuale del tuo fatturato rappresenti i costi. Questa percentuale è definita dal **coefficiente di redditività**, che varia in base al codice ATECO della tua attività. Il reddito imponibile si calcola applicando questo coefficiente ai ricavi incassati.\n* **Vantaggi Principali**:\n    1.  **Imposta Sostitutiva Unica (Flat Tax)**: Non si paga l'IRPEF a scaglioni, ma un'imposta unica del **15%**. Per le nuove attività (startup), questa aliquota scende al **5%** per i primi 5 anni, a patto di rispettare determinati requisiti.\n    2.  **Esenzione IVA**: Non si addebita l'IVA in fattura e non si detrae l'IVA sugli acquisti. Questo semplifica enormemente la contabilità.\n    3.  **Adempimenti Ridotti**: Esenzione dalla fatturazione elettronica (anche se consigliata), dagli studi di settore (ISA) e dalla tenuta delle scritture contabili complesse.\n* **Svantaggi**:\n    1.  **Costi non Deducibili Analiticamente**: Se i tuoi costi reali superano la percentuale forfettaria stabilita dal coefficiente, potresti pagare tasse su un reddito superiore a quello effettivo.\n    2.  **IVA Indetraibile**: L'IVA pagata sugli acquisti di beni e servizi per l'attività diventa un costo non recuperabile.\n\n#### **Il Regime Semplificato: Deducibilità Analitica dei Costi**\n\nIl Regime Semplificato è il regime naturale per le imprese individuali e le società di persone che superano i limiti del forfettario. La sua logica è basata sulla **determinazione analitica del reddito**.\n\n* **Come funziona?** Il reddito imponibile è calcolato come **Ricavi meno Costi Deducibili**. Tutti i costi inerenti all'attività possono essere portati in deduzione, riducendo la base su cui si calcolano le imposte.\n* **Vantaggi Principali**:\n    1.  **Deducibilità dei Costi Reali**: È ideale per attività con elevate spese di gestione. Ogni costo sostenuto e documentato contribuisce a ridurre il carico fiscale.\n    2.  **Detraibilità dell'IVA**: L'IVA pagata sugli acquisti può essere portata in detrazione dall'IVA incassata sulle vendite, con la possibilità di generare un credito IVA.\n* **Svantaggi**:\n    1.  **Tassazione IRPEF Progressiva**: Il reddito imponibile è soggetto a IRPEF, con aliquote a scaglioni che partono dal 23% e arrivano al 43%. Questo può portare a un carico fiscale molto più elevato rispetto alla flat tax del forfettario.\n    2.  **Adempimenti Complessi**: Richiede la tenuta di registri contabili (IVA, incassi e pagamenti), la gestione delle liquidazioni IVA periodiche, la fatturazione elettronica obbligatoria e la presentazione degli Indici Sintetici di Affidabilità (ISA).\n\n### **Parte 2: Il Calcolatore - Guida ai Parametri di Input**\n\nPer utilizzare correttamente il simulatore, è essenziale comprendere il significato di ogni campo:\n\n* **Ricavi o Compensi Annuali**: Il totale di quanto prevedi di fatturare e incassare nell'anno solare. Per il regime forfettario, il limite massimo è di 85.000 €.\n* **Costi Aziendali Deducibili**: La somma di tutte le spese che sosterrai per la tua attività (es. acquisto merci, software, affitto, bollette, consulenze, carburante). **Questo dato è cruciale per il calcolo nel Regime Semplificato**.\n* **Contributi Previdenziali Obbligatori**: L'importo dei contributi che versi alla tua cassa di previdenza (es. Gestione Separata INPS, cassa professionale). Questi sono deducibili dal reddito imponibile in entrambi i regimi.\n* **Coefficiente di Redditività**: Valore percentuale che identifica la parte di fatturato considerata come reddito nel regime forfettario. È legato al tuo codice ATECO.\n* **Nuova Attività (Startup)**: Seleziona questa opzione se hai avviato l'attività da meno di 5 anni e rispetti i requisiti normativi per beneficiare dell'aliquota del 5%.\n\n### **Parte 3: Quando Conviene un Regime Rispetto all'Altro?**\n\nLa convenienza dipende quasi esclusivamente dal rapporto tra i **costi reali** e i **costi forfettizzati** dal coefficiente di redditività.\n\n* **Il Regime Forfettario è quasi sempre più conveniente se**: I tuoi costi reali sono **bassi** o comunque **inferiori** alla percentuale di costi forfettizzati dal tuo coefficiente. Ad esempio, un professionista con coefficiente del 78% ha un costo forfettario del 22%. Se i suoi costi reali sono solo il 10% del fatturato, il forfettario è estremamente vantaggioso.\n\n* **Il Regime Semplificato può diventare più conveniente se**: I tuoi costi reali sono **molto alti** e **superano significativamente** la percentuale forfettaria. Ad esempio, un commerciante con coefficiente del 40% ha costi forfettizzati del 60%. Se i suoi costi reali (acquisto merci, affitto negozio, etc.) ammontano al 75% del fatturato, il regime semplificato potrebbe portare a un reddito imponibile inferiore, nonostante le aliquote IRPEF più alte.\n\n### **Conclusione e Passi Successivi**\n\nUtilizza questo simulatore come punto di partenza per una riflessione strategica. Inserisci i dati relativi alla tua attività e osserva i risultati. Se il simulatore indica una chiara convenienza per uno dei due regimi, discuti questo risultato con il tuo commercialista. Ricorda che fattori come la gestione dell'IVA, le detrazioni personali (es. spese mediche, ristrutturazioni) che non sono considerate nel forfettario, e le prospettive di crescita del tuo business sono elementi qualitativi altrettanto importanti nella decisione finale."
};

const GestioneSeparataCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);
    
    const initialStates = {
        ricavi: 60000,
        costi_deducibili: 12000,
        contributi_obbligatori: 9000,
        coefficiente_redditivita: 0.78,
        nuova_attivita: true,
    };
    const [states, setStates] = useState<{[key: string]: any}>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({...prev, [id]: value}));
    };
    
    const handleReset = () => {
        setStates(initialStates);
    };

    // --- Funzione di calcolo IRPEF ---
    const calculateIRPEF = (imponibile: number): number => {
        if (imponibile <= 0) return 0;
        let irpef = 0;
        const scaglioni = [
            {limite: 28000, aliquota: 0.23},
            {limite: 50000, aliquota: 0.35},
            {limite: Infinity, aliquota: 0.43}
        ];
        let redditoResiduo = imponibile;
        let scaglionePrecedente = 0;

        for (const scaglione of scaglioni) {
            if (redditoResiduo > 0) {
                const importoNelloScaglione = Math.min(redditoResiduo, scaglione.limite - scaglionePrecedente);
                irpef += importoNelloScaglione * scaglione.aliquota;
                redditoResiduo -= importoNelloScaglione;
                scaglionePrecedente = scaglione.limite;
            }
        }
        return irpef;
    };


    const calculatedOutputs = useMemo(() => {
        const { ricavi, costi_deducibili, contributi_obbligatori, coefficiente_redditivita, nuova_attivita } = states;

        // Calcolo Regime Forfettario
        const reddito_imponibile_forfettario = ricavi * coefficiente_redditivita;
        const imponibile_netto_forfettario = Math.max(0, reddito_imponibile_forfettario - contributi_obbligatori);
        const aliquota_forfettario = nuova_attivita ? 0.05 : 0.15;
        const tasse_forfettario = imponibile_netto_forfettario * aliquota_forfettario;
        const netto_forfettario = ricavi - tasse_forfettario - contributi_obbligatori;

        // Calcolo Regime Semplificato
        const reddito_imponibile_semplificato = Math.max(0, ricavi - costi_deducibili - contributi_obbligatori);
        const tasse_semplificato = calculateIRPEF(reddito_imponibile_semplificato);
        const netto_semplificato = ricavi - tasse_semplificato - contributi_obbligatori;

        const regime_conveniente = tasse_forfettario < tasse_semplificato ? 'Regime Forfettario' : 'Regime Semplificato';

        return {
            tasse_forfettario,
            tasse_semplificato,
            netto_forfettario,
            netto_semplificato,
            regime_conveniente
        };
    }, [states]);

    const chartData = [
        { name: 'Tasse da Pagare', Forfettario: calculatedOutputs.tasse_forfettario, Semplificato: calculatedOutputs.tasse_semplificato },
        { name: 'Reddito Netto', Forfettario: calculatedOutputs.netto_forfettario, Semplificato: calculatedOutputs.netto_semplificato },
    ];

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

    const handleExportPDF = useCallback(async () => {
        alert("Funzionalità di esportazione PDF in fase di sviluppo.");
    }, []);

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
                <div className="p-0 md:p-6" ref={calcolatoreRef}>
                    <div className=" -lg -md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">{meta.description}</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce in alcun modo una consulenza fiscale professionale.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                            {inputs.map(input => {
                                const inputLabel = (
                                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                        {input.label}
                                        {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                                    </label>
                                );

                                if (input.type === 'boolean') {
                                    return (
                                        <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-2 rounded-md bg-white border">
                                            <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                            <label className="text-sm font-medium text-gray-700" htmlFor={input.id}>{input.label}</label>
                                        </div>
                                    );
                                }

                                if (input.type === 'select') {
                                    return (
                                         <div key={input.id} className="md:col-span-2">
                                            {inputLabel}
                                            <select id={input.id} value={states[input.id]} onChange={(e) => handleStateChange(input.id, parseFloat(e.target.value))} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2">
                                                {input.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                            </select>
                                        </div>
                                    )
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
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">Risultati della Simulazione</h2>
                             <div className="flex items-center justify-center border-2 border-dashed border-green-400 bg-green-50 p-4 rounded-lg">
                                <div className="text-center">
                                    <div className="text-base font-medium text-gray-600">Regime Più Conveniente</div>
                                    <div className="text-3xl font-bold text-green-700 mt-1">
                                        {calculatedOutputs.regime_conveniente}
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {outputs.filter(o => o.id !== 'regime_conveniente').map(output => (
                                    <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id.includes('forfettario') ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-400'}`}>
                                        <div className="text-sm font-medium text-gray-700">{output.label}</div>
                                        <div className="text-2xl font-bold ${output.id.includes('forfettario') ? 'text-indigo-600' : 'text-gray-800'}">
                                            <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Confronto Visivo</h3>
                            <div className="h-80 w-full bg-gray-50 p-4 rounded-lg">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                            <XAxis dataKey="name" />
                                            <YAxis tickFormatter={(value) => `${formatCurrency(value)}`} width={80} />
                                            <ChartTooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'rgba(230, 230, 230, 0.5)'}} />
                                            <Legend />
                                            <Bar dataKey="Forfettario" name="Regime Forfettario" fill="#4f46e5" />
                                            <Bar dataKey="Semplificato" name="Regime Semplificato" fill="#6b7280" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <aside className="lg:col-span-1 space-y-6">
                <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
                    <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                    <div className="flex flex-col gap-3">
                        <button onClick={salvaRisultato} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                        <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta in PDF</button>
                        <button onClick={handleReset} className="w-full text-sm border border-red-300 text-red-700 rounded-md px-3 py-2 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                    </div>
                </section>
                <section className="border rounded-lg p-4 bg-white shadow-md">
                    <h2 className="font-semibold mb-2 text-gray-800">Guida alla Comprensione</h2>
                    <ContentRenderer content={content} />
                </section>
                 <section className="border rounded-lg p-4 bg-white shadow-md">
                    <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti Normativi</h2>
                    <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                        <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2014-12-23;190" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Legge n. 190/2014, art. 1, commi 54-89</a> (Legge di Stabilità 2015) - Istituzione del Regime Forfettario.</li>
                        <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/istanze/regime-forfetario-imprese-professionisti/infogen-reg-forfetario-imprese-professionisti" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Regime forfetario</a> - Pagina informativa ufficiale.</li>
                    </ul>
                </section>
            </aside>
        </div>
        </>
    );
};

export default GestioneSeparataCalculator;