'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

export const meta = {
    title: "Calcolatore Tassazione per Medici in Partita IVA (con ENPAM)",
    description: "Simula il tuo carico fiscale e contributivo come medico in Partita IVA. Confronta Regime Forfettario e Ordinario e calcola i contributi ENPAM (Quota A e B)."
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
                        "name": "Quando conviene il Regime Forfettario per un medico?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Il Regime Forfettario conviene quando i costi reali deducibili sono inferiori al 22% del fatturato. Il regime forfettario, infatti, riconosce un costo forfettario del 22% (essendo il coefficiente di redditività del 78%). Offre una tassazione agevolata al 5% o 15% e semplificazioni contabili, ma non permette di dedurre analiticamente i costi."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Come si calcolano i contributi ENPAM Quota B?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "I contributi ENPAM Quota B si calcolano applicando un'aliquota percentuale al reddito da libera professione (fatturato meno costi per il regime ordinario, o fatturato per il 78% per il forfettario). L'aliquota intera è del 19,50%, mentre quella ridotta (per chi ha altra previdenza obbligatoria) è del 9,75%."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "I contributi ENPAM sono deducibili dal reddito?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Sì, tutti i contributi ENPAM (sia Quota A che Quota B) effettivamente versati nell'anno di imposta sono interamente deducibili dal reddito imponibile, sia in regime forfettario che ordinario. Questo riduce la base imponibile su cui vengono calcolate le tasse."
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
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-4 text-gray-800" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (trimmedBlock.startsWith('#### **')) {
                    return <h4 key={index} className="text-lg font-semibold mt-4 mb-3 text-gray-800" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (trimmedBlock.startsWith('*')) {
                    const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
                    return (
                        <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
                            {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}
                        </ul>
                    );
                }
                if (trimmedBlock.match(/^\d\.\s/)) {
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

// --- Dati di configurazione del calcolatore ---
const calculatorData = {
  "slug": "tassazione-medici",
  "category": "Fisco e Lavoro Autonomo",
  "title": "Calcolatore Tassazione per Medici in Partita IVA (con ENPAM)",
  "lang": "it",
  "inputs": [
    { "id": "fatturato_annuo", "label": "Fatturato annuo lordo", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "tooltip": "Inserisci il totale dei compensi incassati nell'anno, al lordo di qualsiasi spesa o contributo." },
    { "id": "is_forfettario", "label": "Applichi il Regime Forfettario?", "type": "boolean" as const, "tooltip": "Seleziona se rientri nel regime fiscale agevolato. In caso contrario, verrà applicato il regime ordinario (semplificato)." },
    { "id": "is_startup_forfettario", "label": "Benefici dell'aliquota startup al 5%?", "type": "boolean" as const, "condition": "is_forfettario == true", "tooltip": "Spunta se la tua Partita IVA è attiva da meno di 5 anni e rispetti i requisiti per l'imposta sostitutiva ridotta." },
    { "id": "costi_deducibili", "label": "Costi deducibili sostenuti nell'anno", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "condition": "is_forfettario == false", "tooltip": "Solo per il regime ordinario: inserisci il totale delle spese inerenti all'attività (es. affitto studio, acquisto materiali, utenze)." },
    { "id": "eta_medico", "label": "Età anagrafica", "type": "number" as const, "unit": "anni", "min": 24, "step": 1, "tooltip": "L'età determina l'importo del contributo fisso ENPAM (Quota A)." },
    { "id": "enpam_b_ridotta", "label": "Hai diritto all'aliquota ENPAM B ridotta?", "type": "boolean" as const, "tooltip": "Seleziona se hai un'altra copertura previdenziale obbligatoria (es. lavoro dipendente) che ti dà diritto all'aliquota ENPAM B dimezzata (9,75%)." },
    { "id": "contributi_versati", "label": "Contributi previdenziali versati nell'anno", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Inserisci il totale dei contributi ENPAM (Quota A e B) effettivamente pagati nell'anno di riferimento. Questi importi sono deducibili dal reddito." }
  ],
  "outputs": [
    { "id": "reddito_imponibile_fiscale", "label": "Reddito Imponibile Fiscale Netto", "unit": "€" },
    { "id": "contributi_enpam_quota_a", "label": "Contributi ENPAM Quota A (stima)", "unit": "€" },
    { "id": "contributi_enpam_quota_b", "label": "Contributi ENPAM Quota B (stima)", "unit": "€" },
    { "id": "imposte_dovute", "label": "Imposte Dovute (IRPEF o Sostitutiva)", "unit": "€" },
    { "id": "totale_tasse_e_contributi", "label": "Totale Tasse e Contributi Dovuti", "unit": "€" },
    { "id": "netto_in_tasca", "label": "Reddito Netto Stimato", "unit": "€" }
  ],
  "content": "### **Guida Completa alla Tassazione per Medici con Partita IVA (Anno 2025)**\n\n**Analisi dei Regimi Fiscali, Calcolo Contributi ENPAM e Ottimizzazione del Carico Fiscale**\n\nLa gestione fiscale per un medico libero professionista è un'attività complessa che richiede una conoscenza approfondita delle normative vigenti. La scelta del regime fiscale e il corretto calcolo dei contributi previdenziali ENPAM sono decisioni cruciali che impattano direttamente sul reddito netto. \n\nQuesto strumento è progettato per offrire una **simulazione chiara e dettagliata** del carico fiscale e contributivo, aiutando i professionisti a comprendere le variabili in gioco. Tuttavia, si ricorda che **questo calcolatore ha uno scopo puramente informativo e non può sostituire una consulenza personalizzata da parte di un commercialista o di un consulente fiscale.**\n\n### **Parte 1: I Regimi Fiscali a Confronto**\n\nUn medico che apre la Partita IVA si trova di fronte a una scelta fondamentale: aderire al Regime Forfettario o al Regime Ordinario Semplificato. \n\n#### **Il Regime Forfettario**\n\nÈ un regime agevolato pensato per i professionisti con ricavi non superiori a **85.000 € annui**. I suoi principali vantaggi sono:\n\n* **Tassazione Semplificata**: Si applica un'imposta sostitutiva unica, senza IRPEF, addizionali regionali/comunali e IRAP.\n* **Aliquota Agevolata**: L'imposta è del **15%**. Per le nuove attività (startup), scende al **5% per i primi 5 anni**.\n* **Calcolo del Reddito a Forfait**: Il reddito imponibile non viene calcolato sottraendo analiticamente i costi, ma applicando un **coefficiente di redditività** al fatturato. Per i medici (codice ATECO 86.2x.xx), questo coefficiente è del **78%**.\n* **Franchigia IVA**: Le fatture vengono emesse senza IVA, rendendo il professionista più competitivo.\n\n_Esempio_: Su 60.000 € di fatturato, il reddito imponibile lordo sarà 60.000 € * 78% = 46.800 €.\n\n#### **Il Regime Ordinario (Semplificato)**\n\nQuesto regime non ha limiti di fatturato. La tassazione si basa sul principio **costi-ricavi**.\n\n* **Determinazione del Reddito**: Il reddito imponibile si ottiene sottraendo dal fatturato totale i **costi deducibili** effettivamente sostenuti e documentati (es. affitto studio, utenze, software, congressi, etc.).\n* **Tassazione IRPEF**: Il reddito imponibile è soggetto a tassazione IRPEF progressiva a scaglioni.\n* **Adempimenti Complessi**: Richiede la tenuta di una contabilità più strutturata e l'applicazione dell'IVA sulle fatture.\n\n**Quando conviene?** Il regime ordinario è vantaggioso quando le spese deducibili superano il 22% del fatturato (ovvero la quota di costi riconosciuta a forfait nel regime agevolato).\n\n### **Parte 2: La Previdenza Obbligatoria: ENPAM**\n\nL'ENPAM (Ente Nazionale di Previdenza ed Assistenza dei Medici e degli Odontoiatri) è la cassa di previdenza obbligatoria per tutti i medici iscritti all'albo. La contribuzione si divide in due quote.\n\n#### **Quota A: Il Contributo Fisso**\n\nÈ un contributo **obbligatorio e fisso**, indipendente dal reddito, il cui importo varia in base all'età del professionista. A questo si aggiunge un contributo di maternità.\n\nPer il 2025, gli importi annui sono (escluso contributo maternità di 95,54 €):\n\n* **Fino a 30 anni**: 291,61 €\n* **Da 30 a 35 anni**: 566,00 €\n* **Da 35 a 40 anni**: 1.062,12 €\n* **Oltre 40 anni**: 1.961,56 €\n\n#### **Quota B: Il Contributo Proporzionale al Reddito**\n\nQuesto contributo è calcolato in percentuale sul **reddito da libera professione** (reddito imponibile lordo, prima della deduzione dei contributi versati).\n\n* **Aliquota Intera**: L'aliquota ordinaria è del **19,50%**.\n* **Aliquota Ridotta (Dimezzata)**: È del **9,75%**. Possono richiederla i medici che hanno un'altra copertura previdenziale obbligatoria (es. lavoro dipendente, gestione separata INPS, etc.).\n* **Massimale Contributivo**: L'aliquota si applica fino a un reddito di circa **140.000 €**. Sulla parte eccedente, si applica un contributo di solidarietà dell'**1%**.\n\n**Importante**: I contributi ENPAM (sia Quota A che Quota B) versati durante l'anno fiscale sono **interamente deducibili** dal reddito imponibile, riducendo così la base su cui si calcolano le imposte.\n\n### **Parte 3: Il Processo di Calcolo: Passo dopo Passo**\n\n1.  **Definizione del Reddito Imponibile Lordo**: \n    * _Forfettario_: Fatturato Annuo * 78%.\n    * _Ordinario_: Fatturato Annuo - Costi Deducibili.\n2.  **Calcolo del Reddito Imponibile Netto**: \n    * Reddito Imponibile Lordo - Contributi Previdenziali Versati nell'Anno.\n3.  **Calcolo delle Imposte**: \n    * _Forfettario_: Reddito Imponibile Netto * 5% o 15%.\n    * _Ordinario_: Si applicano gli scaglioni IRPEF 2025 al Reddito Imponibile Netto:\n        * **23%** fino a 28.000 €\n        * **35%** da 28.001 € a 50.000 €\n        * **43%** oltre 50.000 €\n4.  **Calcolo dei Contributi ENPAM Dovuti per l'Anno**: \n    * Si calcola la **Quota A** in base all'età.\n    * Si calcola la **Quota B** applicando l'aliquota (19,50% o 9,75%) al Reddito Imponibile Lordo (punto 1).\n5.  **Determinazione del Netto**: \n    * Fatturato Annuo - Imposte Dovute - Contributi ENPAM Dovuti.\n\n### **Conclusione**\n\nLa pianificazione fiscale è essenziale per la sostenibilità della professione medica. Utilizzare questo calcolatore permette di avere una visione d'insieme e di effettuare scelte più consapevoli. Per decisioni operative, come la scelta del regime fiscale o la pianificazione degli investimenti, è sempre raccomandato il supporto di un esperto."
};

const TassazioneMediciCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        fatturato_annuo: 65000,
        is_forfettario: true,
        is_startup_forfettario: true,
        costi_deducibili: 15000,
        eta_medico: 33,
        enpam_b_ridotta: false,
        contributi_versati: 4500
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };

    const handleReset = () => {
        setStates(initialStates);
    };

    const calculatedOutputs = useMemo(() => {
        const { fatturato_annuo, is_forfettario, is_startup_forfettario, costi_deducibili, eta_medico, enpam_b_ridotta, contributi_versati } = states;
        
        const COEFFICIENTE_FORFETTARIO = 0.78;
        const reddito_imponibile_lordo = is_forfettario ? fatturato_annuo * COEFFICIENTE_FORFETTARIO : fatturato_annuo - costi_deducibili;
        const reddito_imponibile_fiscale = Math.max(0, reddito_imponibile_lordo - contributi_versati);

        const quota_a_base = eta_medico < 30 ? 291.61 : (eta_medico < 35 ? 566 : (eta_medico < 40 ? 1062.12 : 1961.56));
        const maternita = 95.54;
        const contributi_enpam_quota_a = quota_a_base + maternita;

        const ALIQUOTA_B_INTERA = 0.195;
        const ALIQUOTA_B_RIDOTTA = 0.0975;
        const MASSIMALE_B = 140000;
        const ALIQUOTA_ECCEDENTE_B = 0.01;

        const aliquota_b_scelta = enpam_b_ridotta ? ALIQUOTA_B_RIDOTTA : ALIQUOTA_B_INTERA;
        const b_imponibile = Math.min(reddito_imponibile_lordo, MASSIMALE_B);
        const b_eccedente = Math.max(0, reddito_imponibile_lordo - MASSIMALE_B);
        const contributi_enpam_quota_b = (b_imponibile * aliquota_b_scelta) + (b_eccedente * ALIQUOTA_ECCEDENTE_B);

        let imposte_dovute = 0;
        if (is_forfettario) {
            imposte_dovute = reddito_imponibile_fiscale * (is_startup_forfettario ? 0.05 : 0.15);
        } else {
            if (reddito_imponibile_fiscale <= 28000) {
                imposte_dovute = reddito_imponibile_fiscale * 0.23;
            } else if (reddito_imponibile_fiscale <= 50000) {
                imposte_dovute = (28000 * 0.23) + ((reddito_imponibile_fiscale - 28000) * 0.35);
            } else {
                imposte_dovute = (28000 * 0.23) + (22000 * 0.35) + ((reddito_imponibile_fiscale - 50000) * 0.43);
            }
        }
        
        const totale_tasse_e_contributi = imposte_dovute + contributi_enpam_quota_a + contributi_enpam_quota_b;
        const netto_in_tasca = fatturato_annuo - totale_tasse_e_contributi;
        
        return {
            reddito_imponibile_fiscale,
            contributi_enpam_quota_a,
            contributi_enpam_quota_b,
            imposte_dovute,
            totale_tasse_e_contributi,
            netto_in_tasca
        };
    }, [states]);

    const chartData = [
        { name: 'Ripartizione Fatturato', 'Reddito Netto': Math.max(0, calculatedOutputs.netto_in_tasca), 'Imposte': Math.max(0, calculatedOutputs.imposte_dovute), 'Contributi ENPAM': Math.max(0, calculatedOutputs.contributi_enpam_quota_a + calculatedOutputs.contributi_enpam_quota_b) }
    ];

    const formulaUsata = states.is_forfettario
      ? "Reddito Netto = Fatturato - ( ( (Fatturato * 0.78) - ContributiVersati ) * AliquotaImposta ) - ContributiDovuti"
      : "Reddito Netto = Fatturato - ( IRPEF(Fatturato - Costi - ContributiVersati) ) - ContributiDovuti";

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;
            const element = calcolatoreRef.current;
            if (!element) return;
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${slug}.pdf`);
        } catch (e) {
            console.error(e);
            alert("Errore durante l'esportazione in PDF.");
        }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
            const newResults = [payload, ...existingResults].slice(0, 50);
            localStorage.setItem("calc_results", JSON.stringify(newResults));
            alert("Risultato salvato con successo!");
        } catch {
            alert("Impossibile salvare il risultato.");
        }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2">
                    <div ref={calcolatoreRef}>
                        <div className=" -lg -md p-6">
                            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                            <p className="text-gray-600 mb-4">{meta.description}</p>
                            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                                <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce in alcun modo la consulenza di un commercialista. I calcoli si basano sulla normativa vigente per il 2025.
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                                {inputs.map(input => {
                                    const conditionMet = !input.condition || (input.condition.includes('== true') ? states[input.condition.split(' ')[0]] : !states[input.condition.split(' ')[0]]);
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
                                                {inputLabel}
                                                <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 ml-auto" checked={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
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
                                    <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'netto_in_tasca' ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'}`}>
                                        <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                        <div className={`text-xl md:text-2xl font-bold ${output.id === 'netto_in_tasca' ? 'text-green-600' : 'text-gray-800'}`}>
                                            <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione del Fatturato</h3>
                                <div className="h-80 w-full bg-gray-50 p-2 rounded-lg">
                                    {isClient && (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                <XAxis type="number" hide />
                                                <YAxis type="category" dataKey="name" hide />
                                                <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                                <Legend />
                                                <Bar dataKey="Reddito Netto" stackId="a" fill="#22c55e" />
                                                <Bar dataKey="Imposte" stackId="a" fill="#ef4444" />
                                                <Bar dataKey="Contributi ENPAM" stackId="a" fill="#3b82f6" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 border rounded-lg shadow-md p-4 bg-white">
                        <h3 className="font-semibold text-gray-700">Formula di Calcolo Sintetizzata</h3>
                        <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaUsata}</p>
                        <p className="text-xs text-gray-500 mt-2">Nota: la formula reale applica una logica più complessa (es. scaglioni IRPEF, massimali contributivi) qui semplificata per chiarezza.</p>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={salvaRisultato} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta PDF</button>
                            <button onClick={handleReset} className="col-span-2 text-sm w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolo</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida al Calcolo</h2>
                        <ContentRenderer content={content} />
                    </section>
                     <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.enpam.it/comefareper/pagare-i-contributi/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Fondazione ENPAM - Pagamento Contributi</a></li>
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/istanze/regime-forfetario-persone-fisiche" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Regime Forfettario</a></li>
                            <li><a href="https://www.mef.gov.it/focus/Riforma-fiscale-in-sintesi/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">MEF - Riforma Fiscale (Scaglioni IRPEF)</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default TassazioneMediciCalculator;