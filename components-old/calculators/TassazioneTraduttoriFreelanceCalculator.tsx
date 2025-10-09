'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ChartTooltip, Legend } from 'recharts';

export const meta = {
    title: 'Calcolatore Tassazione per Traduttori Freelance',
    description: 'Stima tasse e contributi INPS per traduttori con Partita IVA. Confronta il regime forfettario e ordinario per ottimizzare il tuo netto.'
};

// --- Icona per i Tooltip (SVG inline per evitare dipendenze) ---
const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 inline-block">
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
                        "name": "Qual è il codice ATECO per un traduttore freelance?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Il codice ATECO corretto per l'attività di traduzione e interpretariato è 74.30.00. Questo codice è fondamentale per l'inquadramento fiscale e determina un coefficiente di redditività del 78% nel regime forfettario."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Un traduttore deve iscriversi alla Camera di Commercio?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "No, l'attività del traduttore è considerata una professione intellettuale e non un'attività d'impresa. Pertanto, è sufficiente aprire una Partita IVA come lavoratore autonomo e iscriversi alla Gestione Separata dell'INPS, senza obbligo di iscrizione alla Camera di Commercio."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Quando conviene il regime ordinario al posto del forfettario per un traduttore?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Il regime ordinario può essere più conveniente del forfettario se i costi deducibili reali e documentati superano il 22% del fatturato (la percentuale di spesa forfettaria riconosciuta). Ad esempio, se si sostengono ingenti spese per software, hardware, formazione o viaggi di lavoro."
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
                if (trimmedBlock) {
                    return <p key={index} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                }
                return null;
            })}
        </div>
    );
};

// --- Dati di configurazione del calcolatore (incorporati) ---
const calculatorData = {
  "slug": "tassazione-traduttori-freelance",
  "category": "Fisco e Lavoro Autonomo",
  "title": "Calcolatore Tassazione per Traduttori Freelance",
  "lang": "it",
  "inputs": [
    { "id": "redditoLordoAnnuale", "label": "Compenso Lordo Annuale", "type": "number" as const, "unit": "€", "min": 0, "step": 500, "tooltip": "Inserisci il totale dei compensi lordi fatturati nell'anno di riferimento. Questo è il punto di partenza per ogni calcolo." },
    { "id": "isForfettario", "label": "Aderisci al Regime Forfettario?", "type": "boolean" as const, "tooltip": "Seleziona questa opzione se rientri nel regime fiscale agevolato (limite ricavi: 85.000€). È la scelta più comune per i traduttori all'inizio dell'attività." },
    { "id": "isNuovaAttivita", "label": "Sei una Startup (primi 5 anni)?", "type": "boolean" as const, "condition": "isForfettario == true", "tooltip": "Se sei nei primi 5 anni di attività e rispetti i requisiti di novità, l'imposta sostitutiva del Regime Forfettario scende dal 15% al 5%." },
    { "id": "hasAltraPrevidenza", "label": "Hai un'altra forma di previdenza obbligatoria?", "type": "boolean" as const, "tooltip": "Spunta se sei anche un lavoratore dipendente, un pensionato, o iscritto a un'altra cassa. In questi casi, l'aliquota INPS Gestione Separata è ridotta." }
  ],
  "outputs": [
    { "id": "redditoImponibileFiscale", "label": "Reddito Imponibile ai fini Fiscali", "unit": "€" },
    { "id": "contributiInpsDovuti", "label": "Contributi Previdenziali INPS Dovuti", "unit": "€" },
    { "id": "impostaDovuta", "label": "Imposta Fiscale Totale (IRPEF o Sostitutiva)", "unit": "€" },
    { "id": "nettoAnnuale", "label": "Stima del Netto Annuale", "unit": "€" },
    { "id": "aliquotaMedia", "label": "Aliquota Fiscale Media Effettiva", "unit": "%" }
  ],
  "content": "### **Guida Fiscale Completa per Traduttori Freelance**\n\n**Navigare tra Regime Forfettario, Tassazione Ordinaria e Contributi INPS.**\n\nL'attività di traduttore freelance è una professione intellettuale che richiede un'adeguata pianificazione fiscale e previdenziale. Comprendere come vengono tassati i propri compensi è essenziale per gestire al meglio la propria attività e ottimizzare il carico fiscale.\n\nQuesto calcolatore è uno strumento avanzato, pensato per offrire una **stima precisa e dettagliata del netto annuale**, basandosi sulle normative fiscali e previdenziali in vigore. Tuttavia, si ricorda che i risultati sono una simulazione: per una consulenza personalizzata, è sempre raccomandato **rivolgersi a un commercialista esperto**.\n\n### **Parte 1: L'Inquadramento Fiscale del Traduttore**\n\nIl primo passo per un traduttore è l'apertura della Partita IVA. L'attività di traduttore è classificata come **lavoro autonomo professionale** e non come attività d'impresa. Questo comporta una differenza fondamentale: non è richiesta l'iscrizione alla Camera di Commercio.\n\nIl codice ATECO che identifica questa professione è il **74.30.00 – Attività di traduzione e interpretariato**.\n\nLa scelta cruciale da compiere è quella del regime fiscale.\n\n#### **Opzione A: Il Regime Forfettario**\n\nÈ il regime fiscale di vantaggio più diffuso tra i professionisti, inclusi i traduttori. È ideale per chi inizia e per chi ha un volume d'affari contenuto.\n\n* **Requisiti**: Non superare il limite di **85.000 € di compensi** annui.\n* **Funzionamento**: Il calcolo delle tasse è semplificato. Il reddito imponibile non si determina sottraendo i costi reali, ma applicando un **coefficiente di redditività** al fatturato. Per il codice ATECO 74.30.00, questo coefficiente è del **78%**. Lo Stato presume, quindi, che il 22% del tuo fatturato sia costituito da spese, senza necessità di giustificarle.\n* **Tassazione Agevolata**: Sul reddito imponibile (calcolato come 78% del fatturato, meno i contributi INPS versati) si applica un'imposta sostitutiva unica:\n    * **5% per i primi 5 anni** (se si rispettano i requisiti di \"startup\").\n    * **15% negli anni successivi**.\n* **Principali Vantaggi**: Niente IVA sulle fatture, esonero dalla ritenuta d'acconto, contabilità estremamente semplificata.\n\n#### **Opzione B: Il Regime Ordinario (o Semplificato)**\n\nSe superi gli 85.000 € di fatturato o se hai costi deducibili molto elevati (superiori al 22% forfettario), questo regime potrebbe essere più conveniente.\n\n* **Funzionamento**: Il reddito imponibile è calcolato analiticamente: **Compensi Lordi - Costi Deducibili Inerenti**.\n* **Tassazione IRPEF**: Il reddito è soggetto all'IRPEF, un'imposta progressiva a scaglioni. Per il 2024/2025, le aliquote sono:\n    * **23%** fino a 28.000 €\n    * **35%** da 28.001 € a 50.000 €\n    * **43%** oltre 50.000 €\n* **Adempimenti**: È necessario gestire l'IVA, applicare la ritenuta d'acconto del 20% sulle fatture verso clienti italiani con Partita IVA, e tenere una contabilità più strutturata.\n\n### **Parte 2: La Gestione Previdenziale: INPS Gestione Separata**\n\nI traduttori, non avendo una cassa professionale specifica (come avvocati o ingegneri), sono obbligati a iscriversi alla **Gestione Separata dell'INPS**. Questa cassa serve a finanziare la futura pensione e altre prestazioni di welfare (maternità, malattia, etc.).\n\n#### **Come si Calcolano i Contributi?**\n\nI contributi si calcolano sul **reddito professionale lordo**, entro un massimale annuo (119.650 € per il 2024).\n\nL'aliquota contributiva cambia a seconda della situazione del professionista:\n\n* **Aliquota Piena (26,23%)**: Si applica se sei un traduttore freelance \"puro\", ovvero non hai altre forme di copertura previdenziale obbligatoria.\n* **Aliquota Ridotta (24,00%)**: Si applica se, contemporaneamente all'attività di traduttore, sei anche un lavoratore dipendente (full-time o part-time) o sei già pensionato.\n\n**Punto cruciale**: I contributi previdenziali versati nell'anno sono **sempre deducibili** dal reddito imponibile, riducendo così la base su cui si calcolano le imposte, sia in regime forfettario che ordinario."
};

const TassazioneTraduttoriFreelanceCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        redditoLordoAnnuale: 35000,
        isForfettario: true,
        isNuovaAttivita: true,
        hasAltraPrevidenza: false,
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };
    
    const handleReset = useCallback(() => setStates(initialStates), [initialStates]);

    const calculatedOutputs = useMemo(() => {
        const { redditoLordoAnnuale, isForfettario, isNuovaAttivita, hasAltraPrevidenza } = states;

        const massimaleInps = 119650;
        const redditoPrevidenziale = Math.min(redditoLordoAnnuale, massimaleInps);
        const aliquotaInps = hasAltraPrevidenza ? 0.24 : 0.2623;
        const contributiInpsDovuti = redditoPrevidenziale * aliquotaInps;

        let redditoImponibileFiscale = 0;
        let impostaDovuta = 0;

        if (isForfettario) {
            const coefficienteRedditivita = 0.78;
            const imponibileLordo = redditoLordoAnnuale * coefficienteRedditivita;
            redditoImponibileFiscale = Math.max(0, imponibileLordo - contributiInpsDovuti);
            const aliquotaSostitutiva = isNuovaAttivita ? 0.05 : 0.15;
            impostaDovuta = redditoImponibileFiscale * aliquotaSostitutiva;
        } else {
            redditoImponibileFiscale = Math.max(0, redditoLordoAnnuale - contributiInpsDovuti);
            if (redditoImponibileFiscale <= 28000) {
                impostaDovuta = redditoImponibileFiscale * 0.23;
            } else if (redditoImponibileFiscale <= 50000) {
                impostaDovuta = 6440 + (redditoImponibileFiscale - 28000) * 0.35;
            } else {
                impostaDovuta = 14140 + (redditoImponibileFiscale - 50000) * 0.43;
            }
        }

        const totaleTasseEContributi = impostaDovuta + contributiInpsDovuti;
        const nettoAnnuale = redditoLordoAnnuale - totaleTasseEContributi;
        const aliquotaMedia = redditoLordoAnnuale > 0 ? (totaleTasseEContributi / redditoLordoAnnuale) * 100 : 0;

        return { redditoImponibileFiscale, contributiInpsDovuti, impostaDovuta, nettoAnnuale, aliquotaMedia };
    }, [states]);
    
    const chartData = [
        { name: 'Netto in Tasca', value: calculatedOutputs.nettoAnnuale },
        { name: 'Contributi INPS', value: calculatedOutputs.contributiInpsDovuti },
        { name: 'Imposte', value: calculatedOutputs.impostaDovuta },
    ];
    const COLORS = ['#10b981', '#6366f1', '#ef4444'];
    
    const formulaUsata = useMemo(() => {
        if (states.isForfettario) {
            return `Imponibile Fiscale = (Lordo * 78%) - Contributi INPS; Imposta = Imponibile Fiscale * ${states.isNuovaAttivita ? '5%' : '15%'}`;
        }
        return `Imponibile Fiscale = Lordo - Contributi INPS; Imposta = Calcolo IRPEF a scaglioni`;
    }, [states.isForfettario, states.isNuovaAttivita]);
    
    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import('html2canvas')).default;
            const jsPDF = (await import('jspdf')).default;
            if (!calculatorRef.current) return;
            const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${slug}.pdf`);
        } catch (_e) { alert('Esportazione PDF non disponibile.'); }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            const existing = JSON.parse(localStorage.getItem("calc_results") || "[]");
            localStorage.setItem("calc_results", JSON.stringify([payload, ...existing].slice(0, 50)));
            alert("Risultato salvato con successo!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
    const formatPercentage = (value: number) => `${value.toFixed(2)}%`;

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2">
                    <div ref={calculatorRef} className="bg-white rounded-lg shadow-md">
                         <div className="p-6">
                            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                            <p className="text-gray-600 mb-4">{meta.description}</p>
                            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                                <strong>Disclaimer:</strong> Questo strumento fornisce una stima a scopo puramente informativo e non sostituisce in alcun modo una consulenza fiscale professionale.
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border">
                                {inputs.map(input => {
                                    const conditionMet = !input.condition || (input.condition.includes('== true') && states[input.condition.split(' ')[0]]);
                                    if (!conditionMet) return null;

                                    if (input.type === 'boolean') {
                                        return (
                                            <div key={input.id} className="md:col-span-1 flex items-center gap-3 p-2 rounded-md bg-white border h-full">
                                                <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                                <label className="text-sm font-medium text-gray-700 flex-1" htmlFor={input.id}>{input.label}</label>
                                                 {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-1.5"><InfoIcon /></span></Tooltip>}
                                            </div>
                                        );
                                    }
                                    
                                    return (
                                        <div key={input.id}>
                                            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor={input.id}>{input.label} {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-1"><InfoIcon /></span></Tooltip>}</label>
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">{input.unit}</span>
                                                <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 pl-7" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? 0 : Number(e.target.value))} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-8 space-y-4">
                                 <h2 className="text-xl font-semibold text-gray-800 mb-2">Risultati Dettagliati</h2>
                                {outputs.map(output => (
                                    <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'nettoAnnuale' ? 'bg-emerald-50 border-emerald-500' : (output.id === 'aliquotaMedia' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300')}`}>
                                        <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                        <div className={`text-xl md:text-2xl font-bold ${output.id === 'nettoAnnuale' ? 'text-emerald-600' : (output.id === 'aliquotaMedia' ? 'text-indigo-600' : 'text-gray-800')}`}>
                                            <span>{isClient ? (output.unit === '%' ? formatPercentage((calculatedOutputs as any)[output.id]) : formatCurrency((calculatedOutputs as any)[output.id])) : '...'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Ripartizione del Lordo Annuale</h3>
                                <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                                    {isClient && (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
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
                    <div className="mt-6 border rounded-lg shadow-md p-4 bg-white">
                        <h3 className="font-semibold text-gray-700">Formula di Calcolo Sintetica</h3>
                        <p className="text-xs text-gray-600 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaUsata}</p>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
                         <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={salvaRisultato} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva</button>
                            <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full text-sm border border-red-200 rounded-md px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <ContentRenderer content={content} />
                    </section>
                     <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-3 text-gray-800">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.inps.it/it/it/dati-e-bilanci/approfondimenti/gestione-separata.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">INPS - Gestione Separata</a></li>
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/istanze/regime-forfetario-persone-fisiche" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Regime Forfettario</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default TassazioneTraduttoriFreelanceCalculator;