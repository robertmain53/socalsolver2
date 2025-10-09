'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

export const meta = {
    title: "Calcolatore Tassazione per Fotografi Freelance",
    description: "Calcola il tuo netto, le tasse e i contributi INPS (Artigiani o Gestione Separata) se sei un fotografo freelance in Regime Forfettario."
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
                        "name": "Quale cassa INPS deve scegliere un fotografo, Gestione Artigiani o Gestione Separata?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "La scelta dipende dalla natura dell'attività. La Gestione Artigiani è per attività come matrimoni, eventi o shooting in studio. La Gestione Separata è indicata per attività professionali come la vendita di stampe d'arte o la consulenza, dove prevale l'aspetto intellettuale."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Come funziona lo sconto del 35% sui contributi INPS per i fotografi?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "I fotografi in Regime Forfettario iscritti alla Gestione Artigiani INPS possono richiedere una riduzione del 35% sui contributi dovuti, sia sulla quota fissa minimale sia sulla parte variabile eccedente il minimale. È un'agevolazione significativa che va richiesta telematicamente all'INPS."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Qual è il coefficiente di redditività per un fotografo in forfettario?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Per il Codice ATECO 74.20.19 (Altre attività di riprese fotografiche), il coefficiente di redditività è del 78%. Ciò significa che tasse e contributi si calcolano sul 78% del fatturato, mentre il 22% è considerato un costo forfettario esentasse."
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
        return text.replace(/\*\*(.*?)\)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');
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


// Dati di configurazione del calcolatore
const calculatorData = {
  "slug": "tassazione-fotografi-freelance",
  "category": "Fisco e Lavoro Autonomo",
  "title": "Calcolatore Tassazione per Fotografi Freelance",
  "lang": "it",
  "inputs": [
    { "id": "fatturato_annuo", "label": "Fatturato Lordo Annuale", "type": "number" as const, "unit": "€", "min": 0, "step": 500, "tooltip": "Inserisci il totale dei compensi che prevedi di incassare in un anno, al lordo di tasse e contributi." },
    { "id": "cassa_previdenziale", "label": "Cassa Previdenziale", "type": "select" as const, "options": [ { "value": "artigiani", "label": "Gestione Artigiani INPS" }, { "value": "gestione_separata", "label": "Gestione Separata INPS" } ], "tooltip": "Scegli la tua cassa di appartenenza. 'Artigiani' è comune per attività come matrimoni e cerimonie. 'Gestione Separata' è per consulenze o cessione di diritti d'autore senza struttura artigianale." },
    { "id": "is_nuova_attivita", "label": "Sei una Nuova Attività (primi 5 anni)?", "type": "boolean" as const, "tooltip": "Se hai aperto la Partita IVA da meno di 5 anni e rispetti i requisiti 'startup', puoi beneficiare dell'imposta sostitutiva ridotta al 5%." },
    { "id": "sconto_contributi_35", "label": "Richiedi la riduzione del 35% sui contributi?", "type": "boolean" as const, "condition": "cassa_previdenziale == 'artigiani'", "tooltip": "Chi aderisce al Regime Forfettario e alla Gestione Artigiani può richiedere all'INPS uno sconto del 35% sui contributi dovuti (sia fissi che variabili)." }
  ],
  "outputs": [
    { "id": "netto_annuale", "label": "Netto Annuale Effettivo", "unit": "€" },
    { "id": "imposta_sostitutiva", "label": "Imposta Sostitutiva (Tasse)", "unit": "€" },
    { "id": "contributi_previdenziali", "label": "Contributi INPS Annuali", "unit": "€" },
    { "id": "costo_totale_attivita", "label": "Costo Totale Attività (Tasse + Contributi)", "unit": "€" },
    { "id": "reddito_imponibile_netto", "label": "Reddito Imponibile Netto", "unit": "€" }
  ],
  "content": "### **Guida Definitiva alla Tassazione per Fotografi Freelance (2025)**\n\n**Dal Regime Forfettario alla Scelta della Cassa INPS: Tutto Ciò Che Devi Sapere**\n\nIntraprendere la carriera di fotografo freelance è entusiasmante, ma la gestione fiscale può apparire complessa. Questo strumento è progettato per offrirti una stima chiara e precisa del tuo guadagno netto, delle tasse e dei contributi, permettendoti di pianificare con serenità la tua attività.\n\n**Disclaimer**: I calcoli si basano sulla normativa fiscale e previdenziale attuale (con riferimento ai valori 2024 per i minimali INPS) e sono intesi a scopo informativo. Non sostituiscono una consulenza personalizzata da parte di un commercialista qualificato.\n\n### **Parte 1: Il Regime Forfettario, l'Alleato del Fotografo**\n\nPer un fotografo freelance, il **Regime Forfettario** è quasi sempre la scelta più vantaggiosa. Ecco i suoi punti di forza:\n\n* **Tassazione Agevolata**: Paghi un'unica imposta sostitutiva del **15%**, che scende al **5% per i primi 5 anni** se avvii una nuova attività.\n* **Niente IVA né Ritenuta d'Acconto**: Semplifica enormemente la fatturazione e ti rende più competitivo.\n* **Costi a Forfait**: Le tue spese vengono stimate in modo forfettario. Per il Codice ATECO **74.20.19 – Altre attività di riprese fotografiche**, il coefficiente di redditività è del **78%**. Questo significa che tasse e contributi si calcolano solo sul 78% del tuo fatturato. Il restante 22% è considerato il tuo costo forfettario, esentasse.\n\n### **Parte 2: La Scelta Cruciale: Gestione Artigiani o Gestione Separata INPS?**\n\nQuesta è la decisione più importante dal punto di vista previdenziale. La scelta dipende dalla natura della tua attività.\n\n#### **Opzione A: Gestione Artigiani INPS**\n\nÈ la scelta **obbligatoria** se la tua attività è prevalentemente **artigianale**. Pensa a:\n\n* Fotografo di matrimoni, cerimonie, eventi.\n* Fotografo con uno studio/laboratorio dove realizzi shooting (ritratti, still-life).\n* In generale, quando crei un'opera su commissione del cliente.\n\n**Come funziona?** Si basa su un sistema misto:\n\n1.  **Contributi Fissi (Minimale)**: Si paga una quota fissa di circa **4.515 €** all'anno, a prescindere dal fatturato, fino a un reddito imponibile di circa 18.415 €.\n2.  **Contributi Variabili**: Sulla parte di reddito che supera il minimale, si paga un'aliquota aggiuntiva del **24%**.\n\n**⭐ Il Vantaggio del Forfettario**: Puoi richiedere all'INPS uno **sconto del 35%** sia sulla parte fissa che su quella variabile! Questo riduce notevolmente il carico contributivo annuale.\n\n#### **Opzione B: Gestione Separata INPS**\n\nÈ la scelta corretta se la tua attività è più simile a quella di un **libero professionista** senza albo, dove l'aspetto intellettuale e artistico prevale su quello artigianale. Ad esempio:\n\n* Vendita di stampe fine-art in serie limitata.\n* Attività di docenza e workshop.\n* Cessione del diritto d'autore su immagini già esistenti (es. fotografia di stock, reportage).\n\n**Come funziona?** È molto più semplice: non ci sono contributi fissi. Paghi una percentuale del **26,07%** calcolata direttamente sul tuo reddito imponibile lordo (il 78% del fatturato). Se non fatturi, non paghi nulla.\n\n### **Parte 3: Cessione del Diritto d'Autore**\n\nUn'altra modalità di guadagno per un fotografo è la **cessione del diritto d'autore**. Questa forma di reddito ha una tassazione separata e vantaggiosa, specialmente per chi non ha una Partita IVA. Si tratta di redditi derivanti dalla vendita di opere dell'ingegno (le tue foto) non su commissione. Questo calcolatore **non copre** tale regime, che può comunque affiancarsi all'attività in Partita IVA, ma è importante conoscerne l'esistenza e parlarne con il proprio commercialista.\n\n### **Conclusione: Simula e Pianifica**\n\nUsa questo calcolatore per esplorare diversi scenari di fatturato e per capire l'impatto della scelta della cassa previdenziale. Una corretta pianificazione fiscale e contributiva è il primo passo per trasformare la tua passione per la fotografia in una professione sostenibile e di successo."
};

const TassazioneFotografiFreelanceCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        fatturato_annuo: 35000,
        cassa_previdenziale: "artigiani",
        is_nuova_attivita: true,
        sconto_contributi_35: true,
    };
    const [states, setStates] = useState<{[key: string]: any}>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({...prev, [id]: value}));
    };
    
    const handleReset = () => {
        setStates(initialStates);
    };

    const calculatedOutputs = useMemo(() => {
        const { fatturato_annuo, cassa_previdenziale, is_nuova_attivita, sconto_contributi_35 } = states;

        const coefficiente_redditivita = 0.78;
        const reddito_imponibile_lordo = fatturato_annuo * coefficiente_redditivita;

        let contributi_previdenziali = 0;
        if (cassa_previdenziale === 'gestione_separata') {
            contributi_previdenziali = reddito_imponibile_lordo * 0.2607; // Aliquota Gestione Separata
        } else { // Gestione Artigiani
            const minimale_reddituale = 18415;
            const contributi_fissi = 4515.43;
            const aliquota_variabile = 0.24;
            
            const contributi_variabili = Math.max(0, reddito_imponibile_lordo - minimale_reddituale) * aliquota_variabile;
            const contributi_totali_lordi = contributi_fissi + contributi_variabili;
            
            contributi_previdenziali = sconto_contributi_35 ? contributi_totali_lordi * 0.65 : contributi_totali_lordi;
        }

        const reddito_imponibile_netto = Math.max(0, reddito_imponibile_lordo - contributi_previdenziali);
        const aliquota_imposta = is_nuova_attivita ? 0.05 : 0.15;
        const imposta_sostitutiva = reddito_imponibile_netto * aliquota_imposta;
        const costo_totale_attivita = imposta_sostitutiva + contributi_previdenziali;
        const netto_annuale = fatturato_annuo - costo_totale_attivita;

        return {
            netto_annuale,
            imposta_sostitutiva,
            contributi_previdenziali,
            costo_totale_attivita,
            reddito_imponibile_netto,
        };
    }, [states]);

    const chartData = [
        { 
            name: 'Ripartizione Fatturato', 
            'Netto Annuale': calculatedOutputs.netto_annuale > 0 ? calculatedOutputs.netto_annuale : 0, 
            'Tasse': calculatedOutputs.imposta_sostitutiva, 
            'Contributi INPS': calculatedOutputs.contributi_previdenziali,
        },
    ];

    const formulaUsata = states.cassa_previdenziale === 'gestione_separata'
        ? `Contributi = (Fatturato * 0.78) * 0.2607\nImponibile Netto = (Fatturato * 0.78) - Contributi\nImposta = Imponibile Netto * (5% o 15%)`
        : `Contributi Lordi = 4515.43€ + MAX(0, (Fatturato * 0.78) - 18415€) * 0.24\nContributi Netti = Contributi Lordi * (sconto 35%? 0.65 : 1)\nImposta = MAX(0, (Fatturato * 0.78) - Contributi Netti) * (5% o 15%)`;

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
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
            localStorage.setItem("calc_results", JSON.stringify([payload, ...existingResults].slice(0, 50)));
            alert("Risultato salvato con successo!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

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
                            <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce in alcun modo una consulenza fiscale qualificata.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                            {inputs.map(input => {
                                const conditionMet = !input.condition || (input.condition.includes('==') && states[input.condition.split(' ')[0]] === input.condition.split(' ')[2].replace(/'/g, ''));
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
                                if (input.type === 'select') {
                                    return (
                                        <div key={input.id}>
                                            {inputLabel}
                                            <select id={input.id} value={states[input.id]} onChange={e => handleStateChange(input.id, e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2">
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
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati della Simulazione</h2>
                            {outputs.map(output => (
                                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'netto_annuale' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold ${output.id === 'netto_annuale' ? 'text-indigo-600' : 'text-gray-800'}`}>
                                        <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id] || 0) : '...'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione del Fatturato Lordo</h3>
                            <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <XAxis dataKey="name" />
                                            <YAxis tickFormatter={(value) => `€${Number.isFinite(value) ? (value / 1000).toFixed(0) : 0}k`} />
                                            <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                            <Legend />
                                            <Bar dataKey="Netto Annuale" fill="#4f46e5" />
                                            <Bar dataKey="Tasse" fill="#fca5a5" />
                                            <Bar dataKey="Contributi INPS" fill="#a5b4fc" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-6 border rounded-lg shadow-md p-4 bg-white">
                    <h3 className="font-semibold text-gray-700">Formula di Calcolo Utilizzata</h3>
                    <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-100 rounded font-mono whitespace-pre-wrap">{formulaUsata}</p>
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
                    <h2 className="font-semibold mb-2 text-gray-800">Guida alla Tassazione</h2>
                    <ContentRenderer content={content} />
                </section>
                 <section className="border rounded-lg p-4 bg-white shadow-md">
                    <h2 className="font-semibold mb-2 text-gray-800">Riferimenti Normativi</h2>
                    <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                        <li><a href="https://www.inps.it/it/it/dettaglio-scheda.schede-servizio-strumento.50153.gestione-separata-aliquote-contributive-e-massimale.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">INPS - Aliquote Gestione Separata</a></li>
                        <li><a href="https://www.inps.it/it/it/dettaglio-scheda.schede-servizio-strumento.1028.contributi-dovuti-da-artigiani-e-commercianti.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">INPS - Contributi Artigiani e Commercianti</a></li>
                        <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/regime-forfetario-persone-fisiche" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Regime Forfettario</a></li>
                    </ul>
                </section>
            </aside>
        </div>
        </>
    );
};

export default TassazioneFotografiFreelanceCalculator;