'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

export const meta = {
    title: "Calcolatore Tassazione Avvocati con Cassa Forense | Stima Netto",
    description: "Calcola online tasse e contributi per avvocati in regime forfettario, semplificato o ordinario. Stima il tuo netto annuale tenendo conto di Cassa Forense, IRPEF e imposta sostitutiva."
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
                        "name": "Come si calcolano le tasse per un avvocato in regime forfettario?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Per un avvocato in regime forfettario, il reddito imponibile si calcola applicando un coefficiente di redditività del 78% al fatturato. Da questo importo si deducono i contributi previdenziali obbligatori. Sull'imponibile fiscale netto si applica un'imposta sostitutiva del 15% o del 5% per le startup."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Quali sono i contributi obbligatori per un avvocato alla Cassa Forense?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Gli avvocati iscritti alla Cassa Forense devono versare tre contributi: 1) il Contributo Soggettivo (15% del reddito, con un minimo), per la pensione; 2) il Contributo Integrativo (4% del fatturato, a carico del cliente, con un minimo), a fini di solidarietà; 3) il Contributo di Maternità (una quota fissa annuale)."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Questo calcolatore è affidabile?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Questo strumento fornisce una stima accurata basata sulla normativa fiscale e previdenziale vigente. Tuttavia, è uno strumento di simulazione a scopo puramente informativo e non può sostituire la consulenza personalizzata di un commercialista, che può valutare tutti i dettagli specifici della situazione individuale."
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
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (trimmedBlock.startsWith('####')) {
                    const title = trimmedBlock.replace(/####\s*/, '');
                    return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(title) }} />;
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
                    return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                }
                return null;
            })}
        </div>
    );
};

// --- Dati di configurazione del calcolatore (dal JSON) ---
const calculatorData = {
  "slug": "tassazione-avvocati",
  "category": "Fisco e Lavoro Autonomo",
  "title": "Calcolatore Tassazione per Avvocati (con Cassa Forense)",
  "lang": "it",
  "inputs": [
    { "id": "fatturato_lordo", "label": "Fatturato Lordo Annuale", "type": "number", "unit": "€", "min": 0, "step": 1000, "tooltip": "Inserisci il totale dei compensi professionali incassati nell'anno, al lordo di contributi e tasse." },
    { "id": "regime_fiscale", "label": "Regime Fiscale", "type": "select", "options": ["Forfettario", "Semplificato/Ordinario"], "tooltip": "Scegli il tuo regime fiscale. Il Regime Forfettario ha un'imposta sostitutiva e un calcolo a forfait dei costi. Il Semplificato/Ordinario si basa sui costi reali." },
    { "id": "spese_deducibili", "label": "Spese Deducibili Sostenute", "type": "number", "unit": "€", "min": 0, "step": 100, "condition": "regime_fiscale == 'Semplificato/Ordinario'", "tooltip": "Inserisci il totale delle spese inerenti alla tua attività professionale (es. affitto studio, software, utenze, etc.). Rilevante solo per il regime Semplificato/Ordinario." },
    { "id": "is_forfettario_startup", "label": "Applichi l'aliquota startup al 5%?", "type": "boolean", "condition": "regime_fiscale == 'Forfettario'", "tooltip": "Spunta questa casella se sei nei primi 5 anni di attività e rispetti i requisiti per l'aliquota ridotta nel Regime Forfettario." },
    { "id": "anni_iscrizione_albo", "label": "Anni di Iscrizione all'Albo", "type": "number", "unit": "anni", "min": 0, "step": 1, "tooltip": "Indica da quanti anni sei iscritto all'albo. Questo influenza la percentuale e i minimi del contributo soggettivo." },
    { "id": "is_pensionato", "label": "Sei un avvocato pensionato?", "type": "boolean", "tooltip": "Seleziona se sei un pensionato che continua a esercitare la professione. Questo riduce il contributo soggettivo." }
  ],
  "outputs": [
    { "id": "imponibile_fiscale", "label": "Reddito Imponibile Fiscale", "unit": "€" },
    { "id": "contributo_soggettivo", "label": "Contributo Soggettivo Cassa Forense", "unit": "€" },
    { "id": "contributo_integrativo", "label": "Contributo Integrativo Cassa Forense", "unit": "€" },
    { "id": "contributo_maternita", "label": "Contributo di Maternità", "unit": "€" },
    { "id": "totale_contributi", "label": "Totale Contributi Previdenziali", "unit": "€" },
    { "id": "imposta_dovuta", "label": "Imposta Fiscale Dovuta (IRPEF o Sostitutiva)", "unit": "€" },
    { "id": "netto_in_tasca", "label": "Netto Annuale in Tasca", "unit": "€" },
    { "id": "aliquota_effettiva", "label": "Aliquota Effettiva Totale (Tasse + Contributi)", "unit": "%" }
  ],
  "content": "### **Guida Completa alla Tassazione degli Avvocati**\n\n**Analisi dei Regimi Fiscali, Calcolo dei Contributi Cassa Forense e Ottimizzazione del Carico Fiscale**\n\nLa gestione fiscale e previdenziale è un aspetto fondamentale per ogni avvocato. Comprendere come vengono calcolate le tasse e i contributi è essenziale per una corretta pianificazione finanziaria e per garantire la sostenibilità della propria attività professionale. Questo strumento è progettato per offrire una stima chiara e dettagliata del carico fiscale e contributivo, ma va inteso come una simulazione. **I risultati non sostituiscono in alcun modo la consulenza di un commercialista o di un consulente del lavoro, indispensabile per una valutazione precisa e personalizzata.**\n\n### **Parte 1: I Regimi Fiscali per l'Avvocato**\n\nLa prima scelta cruciale per un avvocato che apre la Partita IVA è il regime fiscale. Le opzioni principali sono due, con differenze sostanziali nel calcolo delle imposte e nella gestione contabile.\n\n#### **1. Regime Forfettario**\n\nÈ un regime agevolato pensato per i professionisti con ricavi contenuti (fino a 85.000 € annui). I suoi vantaggi principali sono:\n\n* **Tassazione Semplificata**: Si applica un'imposta sostitutiva del **15%** (o del **5%** per i primi 5 anni in caso di startup) che rimpiazza IRPEF e addizionali.\n* **Costi a Forfait**: I costi non vengono dedotti analiticamente. Lo Stato riconosce una deduzione forfettaria basata su un **coefficiente di redditività**, che per gli avvocati (codice ATECO 69.10.10) è del **78%**.\n* **Esenzione IVA**: Le fatture vengono emesse senza IVA, rendendo il professionista più competitivo verso clienti privati.\n* **Contabilità Semplice**: Adempimenti burocratici ridotti al minimo.\n\nIl reddito imponibile si calcola applicando il 78% al fatturato lordo e sottraendo i contributi previdenziali obbligatori versati.\n\n#### **2. Regime Semplificato e Ordinario**\n\nIn questi regimi, la tassazione si basa sul principio **costi-ricavi**. Il reddito imponibile è dato dalla differenza tra il fatturato lordo e le **spese deducibili** effettivamente sostenute e documentate (es. affitto dello studio, software, cancelleria, costi per il personale, etc.).\n\n* **Tassazione IRPEF**: Il reddito è soggetto all'Imposta sul Reddito delle Persone Fisiche (IRPEF), che è progressiva e suddivisa in scaglioni.\n* **Soggezione a IVA**: Si applica l'IVA sulle fatture e si gestiscono i relativi adempimenti (liquidazioni periodiche, dichiarazione annuale).\n* **Contabilità Complessa**: Richiede la tenuta di registri contabili e una gestione più strutturata.\n\nÈ la scelta obbligata per chi supera i limiti di fatturato del forfettario o per chi prevede di sostenere costi deducibili superiori al 22% del fatturato (la quota forfettaria di costi nel regime agevolato).\n\n### **Parte 2: La Cassa Forense - Guida ai Contributi**\n\nL'iscrizione alla Cassa Forense è obbligatoria per gli avvocati iscritti all'albo. I contributi principali da versare sono tre:\n\n#### **1. Contributo Soggettivo**\n\nÈ il contributo principale ai fini pensionistici. L'aliquota ordinaria è del **15%** del reddito professionale netto. Sono previste importanti riduzioni:\n\n* **Primi 6 anni di iscrizione**: Non è dovuto il minimo, si paga solo in percentuale sul reddito effettivamente prodotto.\n* **Dal 6° all'8° anno**: È dovuto un minimo ridotto del 50%.\n* **Avvocati Pensionati**: L'aliquota è ridotta al **7,5%**.\n\nEsiste un **contributo minimo soggettivo** (per il 2024, circa 3.185 €) che è dovuto indipendentemente dal reddito prodotto, salvo le eccezioni sopra indicate.\n\n#### **2. Contributo Integrativo**\n\nHa una funzione di solidarietà e finanziamento della Cassa. Si calcola applicando il **4%** sul volume d'affari lordo (fatturato) e viene addebitato direttamente in fattura al cliente. Anche per questo contributo è previsto un **minimo** (per il 2024, circa 850 €), con le stesse riduzioni del soggettivo per i primi anni di iscrizione.\n\n#### **3. Contributo di Maternità**\n\nÈ un contributo fisso annuale (per il 2024, pari a 81,97 €) che tutti gli iscritti devono versare per finanziare l'indennità di maternità a favore delle colleghe.\n\n### **Parte 3: Il Flusso di Calcolo: Dal Lordo al Netto**\n\n1.  **Determinazione del Reddito Professionale**: Nel forfettario, è il 78% del fatturato. Nel semplificato/ordinario, è la differenza tra fatturato e spese.\n2.  **Calcolo dei Contributi Cassa Forense**: Si calcolano il soggettivo, l'integrativo e la maternità sulla base del reddito e del fatturato, rispettando i minimi.\n3.  **Determinazione del Reddito Imponibile Fiscale**: Si sottrae dal reddito professionale il totale dei contributi previdenziali deducibili.\n    * **Attenzione**: Nel Regime Forfettario, solo il contributo soggettivo e di maternità sono deducibili. L'integrativo non lo è.\n4.  **Calcolo dell'Imposta**: Si applica l'aliquota corretta (sostitutiva o IRPEF a scaglioni) al reddito imponibile fiscale.\n5.  **Ottenimento del Netto**: Si sottrae dal fatturato lordo sia il totale dei contributi che il totale delle imposte.\n\nQuesto calcolatore automatizza questi passaggi per darti una stima affidabile del tuo guadagno netto e del carico fiscale complessivo."
};


const TassazioneAvvocatiCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates: { [key: string]: any } = {
        fatturato_lordo: 70000,
        regime_fiscale: "Forfettario",
        spese_deducibili: 15000,
        is_forfettario_startup: true,
        anni_iscrizione_albo: 4,
        is_pensionato: false
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };

    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const { fatturato_lordo, regime_fiscale, spese_deducibili, is_forfettario_startup, anni_iscrizione_albo, is_pensionato } = states;

        const COEFFICIENTE_FORFETTARIO = 0.78;
        const ALIQUOTA_FORFETTARIO_STARTUP = 0.05;
        const ALIQUOTA_FORFETTARIO_STANDARD = 0.15;
        const ALIQUOTA_SOGGETTIVO = is_pensionato ? 0.075 : 0.15;
        const ALIQUOTA_INTEGRATIVO = 0.04;
        const CONTRIBUTO_MATERNITA_FISSO = 81.97;
        const MIN_SOGGETTIVO_ORDINARIO = 3185;
        const MIN_INTEGRATIVO_ORDINARIO = 850;

        const reddito_professionale = regime_fiscale === 'Forfettario' ? fatturato_lordo * COEFFICIENTE_FORFETTARIO : fatturato_lordo - spese_deducibili;

        const contributo_integrativo_calcolato = fatturato_lordo * ALIQUOTA_INTEGRATIVO;
        const min_integrativo_applicabile = anni_iscrizione_albo < 6 ? 0 : MIN_INTEGRATIVO_ORDINARIO / (anni_iscrizione_albo < 8 ? 2 : 1);
        const contributo_integrativo = Math.max(contributo_integrativo_calcolato, min_integrativo_applicabile);
        
        const contributo_soggettivo_calcolato = reddito_professionale * ALIQUOTA_SOGGETTIVO;
        let min_soggettivo_applicabile;
        if (is_pensionato) {
            min_soggettivo_applicabile = MIN_SOGGETTIVO_ORDINARIO / 2;
        } else if (anni_iscrizione_albo < 6) {
            min_soggettivo_applicabile = 0;
        } else if (anni_iscrizione_albo < 8) {
            min_soggettivo_applicabile = MIN_SOGGETTIVO_ORDINARIO / 2;
        } else {
            min_soggettivo_applicabile = MIN_SOGGETTIVO_ORDINARIO;
        }
        const contributo_soggettivo = Math.max(contributo_soggettivo_calcolato, min_soggettivo_applicabile);

        const contributo_maternita = CONTRIBUTO_MATERNITA_FISSO;
        const totale_contributi = contributo_soggettivo + contributo_integrativo + contributo_maternita;
        const contributi_deducibili = regime_fiscale === 'Forfettario' ? contributo_soggettivo + contributo_maternita : totale_contributi;
        
        const imponibile_fiscale = Math.max(0, reddito_professionale - contributi_deducibili);
        
        let imposta_dovuta = 0;
        if (regime_fiscale === 'Forfettario') {
            const aliquota = is_forfettario_startup ? ALIQUOTA_FORFETTARIO_STARTUP : ALIQUOTA_FORFETTARIO_STANDARD;
            imposta_dovuta = imponibile_fiscale * aliquota;
        } else {
            const irpef_scaglione1 = Math.max(0, Math.min(imponibile_fiscale, 28000) * 0.23);
            const irpef_scaglione2 = Math.max(0, (Math.min(imponibile_fiscale, 50000) - 28000) * 0.35);
            const irpef_scaglione3 = Math.max(0, (imponibile_fiscale - 50000) * 0.43);
            const irpef_totale = irpef_scaglione1 + irpef_scaglione2 + irpef_scaglione3;
            const addizionali_stimate = imponibile_fiscale * 0.025; // Stima media
            imposta_dovuta = irpef_totale + addizionali_stimate;
        }

        const netto_in_tasca = fatturato_lordo - totale_contributi - imposta_dovuta;
        const aliquota_effettiva = fatturato_lordo > 0 ? ((totale_contributi + imposta_dovuta) / fatturato_lordo) * 100 : 0;

        return {
            imponibile_fiscale, contributo_soggettivo, contributo_integrativo, contributo_maternita,
            totale_contributi, imposta_dovuta, netto_in_tasca, aliquota_effettiva
        };
    }, [states]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
    const formatPercent = (value: number) => `${value.toFixed(2)}%`;

    const chartData = [
        { name: 'Netto in Tasca', value: calculatedOutputs.netto_in_tasca },
        { name: 'Contributi', value: calculatedOutputs.totale_contributi },
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
            pdf.save(`${slug}-risultati.pdf`);
        } catch (e) { alert("Errore durante l'esportazione in PDF. Riprova."); }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            localStorage.setItem("calc_results_avvocati", JSON.stringify(payload));
            alert("Risultato salvato con successo nel browser!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2">
                    <div ref={calcolatoreRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">Stima il tuo carico fiscale e contributivo e scopri il tuo netto annuale.</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce una consulenza professionale. I calcoli si basano sulla normativa del 2024.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 bg-slate-50 p-4 rounded-lg">
                            {inputs.map(input => {
                                const conditionMet = !input.condition || 
                                  (input.condition.includes('==') && states[input.condition.split(' ')[0]] === input.condition.split("'")[1]);
                                if (!conditionMet) return null;

                                const label = (
                                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                        {input.label}
                                        {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-1.5"><InfoIcon /></span></Tooltip>}
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
                                    return (
                                        <div key={input.id}>
                                            {label}
                                            <select id={input.id} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2">
                                                {input.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        </div>
                                    );
                                }
                                
                                return (
                                    <div key={input.id}>
                                        {label}
                                        <div className="flex items-center gap-2">
                                            <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? 0 : Number(e.target.value))} />
                                            {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">Risultati della Simulazione</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {outputs.map(output => (
                                    <div key={output.id} className={`flex items-baseline justify-between p-4 rounded-lg ${output.id === 'netto_in_tasca' ? 'bg-green-50 border-l-4 border-green-500 md:col-span-2' : 'bg-gray-50'}`}>
                                        <div className="text-sm font-medium text-gray-600">{output.label}</div>
                                        <div className={`text-xl font-bold ${output.id === 'netto_in_tasca' ? 'text-green-600' : 'text-gray-800'}`}>
                                            <span>
                                                {isClient ? 
                                                    (output.unit === '%' ? formatPercent((calculatedOutputs as any)[output.id]) : formatCurrency((calculatedOutputs as any)[output.id]))
                                                    : '...'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione del Fatturato Lordo</h3>
                            <div className="h-80 w-full bg-slate-50 p-2 rounded-lg">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={chartData} cx="50%" cy="50%" outerRadius={100} dataKey="value" nameKey="name" labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                                const radius = innerRadius + (outerRadius - innerRadius) * 1.3;
                                                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                                return <text x={x} y={y} fill="#4b5563" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12">{`${(percent * 100).toFixed(0)}%`}</text>;
                                            }}>
                                                {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
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

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-1 gap-3">
                            <button onClick={salvaRisultato} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta in PDF</button>
                            <button onClick={handleReset} className="w-full text-sm border border-red-200 text-red-700 rounded-md px-3 py-2 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolo</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida alla Comprensione</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.cassaforense.it" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Sito Ufficiale Cassa Forense</a></li>
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/ivaimpostesostitutive/regime-forfetario-imprese-e-professionisti" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Regime Forfettario - Agenzia delle Entrate</a></li>
                            <li><a href="https://www.fiscozen.it/guide/tasse-avvocati/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Guida Tasse Avvocati - Fiscozen</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default TassazioneAvvocatiCalculator;