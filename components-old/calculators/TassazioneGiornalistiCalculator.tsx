'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

export const meta = {
    title: 'Calcolatore Tassazione per Giornalisti (con INPGI/INPS)',
    description: 'Stima le tasse e i contributi INPS per giornalisti freelance con Partita IVA in regime forfettario o ordinario. Aggiornato con le ultime aliquote.'
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
                        "name": "Qual è il coefficiente di redditività per un giornalista in regime forfettario?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Per i giornalisti freelance, il cui codice ATECO è spesso 74.90.99 o 90.03.01, il coefficiente di redditività è del 78%. Questo significa che il 78% del fatturato viene considerato reddito imponibile, mentre il 22% è riconosciuto come spesa forfettaria."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "I contributi INPS (ex-INPGI) sono deducibili?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Sì, i contributi previdenziali obbligatori versati alla Gestione Separata INPS sono interamente deducibili dal reddito imponibile, sia nel regime forfettario che in quello ordinario. Questo riduce la base su cui vengono calcolate le imposte."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Come è cambiata la previdenza per i giornalisti freelance?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Dal 1° luglio 2022, la gestione previdenziale dei giornalisti autonomi e collaboratori (precedentemente iscritti alla Gestione Separata INPGI, o 'INPGI 2') è stata trasferita alla Gestione Separata dell'INPS. Le regole di calcolo e le aliquote seguono ora quelle previste dall'INPS."
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
  "slug": "tassazione-giornalisti",
  "category": "Fisco e Lavoro Autonomo",
  "title": "Calcolatore Tassazione per Giornalisti (con INPGI/INPS)",
  "lang": "it",
  "inputs": [
    { "id": "redditoLordoAnnuale", "label": "Reddito Lordo Annuale", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "tooltip": "Inserisci il totale dei compensi lordi incassati nell'anno di riferimento, prima di qualsiasi ritenuta o deduzione." },
    { "id": "isForfettario", "label": "Applichi il Regime Forfettario?", "type": "boolean" as const, "tooltip": "Spunta questa casella se hai aderito al regime fiscale agevolato. Il limite di ricavi per accedere è di 85.000€ annui." },
    { "id": "isNuovaAttivita", "label": "Attività Startup (primi 5 anni)?", "type": "boolean" as const, "condition": "isForfettario == true", "tooltip": "Se sei nei primi 5 anni di attività e rispetti i requisiti, l'imposta sostitutiva del Regime Forfettario è ridotta dal 15% al 5%." },
    { "id": "contributiObbligatoriVersati", "label": "Contributi Previdenziali Versati", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Inserisci l'importo totale dei contributi previdenziali obbligatori (es. acconti INPS) che hai già versato durante l'anno fiscale. Questi importi sono deducibili." },
    { "id": "hasAltraPrevidenza", "label": "Possiedi un'altra copertura previdenziale?", "type": "boolean" as const, "tooltip": "Seleziona se sei anche un lavoratore dipendente, un pensionato o sei iscritto a un'altra cassa di previdenza obbligatoria. Questo riduce l'aliquota contributiva dovuta alla Gestione Separata INPS." }
  ],
  "outputs": [
    { "id": "redditoImponibileFiscale", "label": "Reddito Imponibile Fiscale", "unit": "€" },
    { "id": "contributiInpsDovuti", "label": "Contributi INPS Gestione Separata Dovuti", "unit": "€" },
    { "id": "impostaDovuta", "label": "Imposta Fiscale Dovuta (IRPEF o Sostitutiva)", "unit": "€" },
    { "id": "nettoAnnuale", "label": "Reddito Netto Annuale Stimato", "unit": "€" },
    { "id": "nettoMensile", "label": "Reddito Netto Mensile Stimato", "unit": "€" }
  ],
  "content": "### **Guida Completa alla Tassazione per Giornalisti Autonomi**\n\n**Dal passaggio INPGI a INPS ai Regimi Fiscali: tutto quello che devi sapere.**\n\nDeterminare la corretta tassazione e contribuzione è un aspetto fondamentale per ogni giornalista freelance. Con il recente passaggio della gestione previdenziale dall'INPGI all'INPS (1° luglio 2022), è importante avere un quadro chiaro delle regole attuali.\n\nQuesto calcolatore è progettato per offrire una **stima accurata e informativa** del carico fiscale e contributivo, aiutandoti a pianificare le tue finanze. Ricorda che i risultati sono una simulazione e **non sostituiscono la consulenza di un commercialista qualificato**, che può analizzare la tua situazione specifica.\n\n### **Parte 1: I Regimi Fiscali del Giornalista Freelance**\n\nLa scelta del regime fiscale è il primo, cruciale passo che influenza l'intero calcolo.\n\n#### **1. Il Regime Forfettario**\n\nÈ un regime agevolato pensato per le piccole Partite IVA, molto popolare tra i giornalisti.\n\n* **Requisiti**: Il requisito principale è non superare **85.000 €** di ricavi o compensi annui.\n* **Come funziona**: La tassazione non si basa sul calcolo analitico \"ricavi meno costi\". Invece, il reddito imponibile viene determinato applicando una percentuale fissa ai ricavi, chiamata **coefficiente di redditività**. Per i giornalisti (codici ATECO 74.90.99 o 90.03.01), questo coefficiente è del **78%**. Ciò significa che lo Stato riconosce forfettariamente il 22% dei tuoi ricavi come costi, senza che tu debba documentarli.\n* **Tassazione**: Sul reddito imponibile così calcolato (a cui vengono sottratti i contributi previdenziali versati), si applica un'imposta sostitutiva:\n    * **5% per i primi 5 anni** (regime \"startup\").\n    * **15% dal sesto anno in poi**.\n* **Vantaggi**: Niente IVA in fattura, esonero dalla fatturazione elettronica (verso privati), niente studi di settore (ISA), contabilità semplificata.\n\n#### **2. Il Regime Ordinario (o Semplificato)**\n\nSe non puoi o non vuoi aderire al Forfettario, rientri nel regime ordinario.\n\n* **Come funziona**: Il reddito imponibile si calcola in modo analitico: **Ricavi Lordi - Costi Deducibili**. I costi devono essere inerenti all'attività e documentati (es. acquisto computer, software, spese di viaggio, etc.).\n* **Tassazione**: Il reddito imponibile è soggetto all'**IRPEF** (Imposta sul Reddito delle Persone Fisiche), che funziona a scaglioni progressivi. Per il 2024/2025, gli scaglioni sono:\n    * **23%** su redditi fino a 28.000 €.\n    * **35%** sulla parte eccedente i 28.000 € e fino a 50.000 €.\n    * **43%** sulla parte eccedente i 50.000 €.\n* **Svantaggi**: Maggiore complessità contabile, assoggettamento a IVA e ritenuta d'acconto.\n\n### **Parte 2: La Previdenza: INPS Gestione Separata (ex INPGI 2)**\n\nDal 1° luglio 2022, i giornalisti autonomi non iscritti all'albo che svolgevano attività di lavoro autonomo non giornalistico e i titolari di collaborazioni coordinate e continuative, precedentemente iscritti alla Gestione Separata INPGI (spesso chiamata INPGI 2), sono confluiti nella **Gestione Separata dell'INPS**.\n\nQuesta cassa finanzia le future pensioni, oltre a prestazioni come maternità, malattia e disoccupazione (DIS-COLL).\n\n#### **Aliquote Contributive (Stime 2024/2025)**\n\nI contributi si calcolano sul **reddito lordo annuale**, entro un tetto massimo (**massimale**), che per il 2024 è di 119.650 €.\n\nL'aliquota varia in base alla tua situazione:\n\n* **Aliquota Piena: 26,23%**\n    * Si applica se la Partita IVA è la tua unica fonte di reddito e non sei pensionato.\n* **Aliquota Ridotta: 24,00%**\n    * Si applica se, oltre all'attività da freelance, sei anche un lavoratore dipendente (con contratto a tempo indeterminato o determinato) o se sei già titolare di una pensione.\n\n**Importante**: I contributi versati durante l'anno sono **sempre deducibili** dal reddito imponibile, sia in regime Forfettario che Ordinario."
};

const TassazioneGiornalistiCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);
    
    const initialStates = {
        redditoLordoAnnuale: 50000,
        isForfettario: true,
        isNuovaAttivita: true,
        contributiObbligatoriVersati: 4000,
        hasAltraPrevidenza: false,
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };
    
    const handleReset = useCallback(() => { setStates(initialStates); }, [initialStates]);

    const calculatedOutputs = useMemo(() => {
        const { redditoLordoAnnuale, isForfettario, isNuovaAttivita, contributiObbligatoriVersati, hasAltraPrevidenza } = states;

        // Step previdenziali
        const massimaleInps = 119650; // Valore 2024
        const redditoPrevidenziale = Math.min(redditoLordoAnnuale, massimaleInps);
        const aliquotaInps = hasAltraPrevidenza ? 24.00 : 26.23; // Valori 2024
        const contributiInpsDovuti = redditoPrevidenziale * (aliquotaInps / 100);

        // Step fiscali
        let redditoImponibileFiscale = 0;
        let impostaDovuta = 0;

        if (isForfettario) {
            const coefficienteRedditivita = 0.78;
            const imponibileForfettarioLordo = redditoLordoAnnuale * coefficienteRedditivita;
            redditoImponibileFiscale = Math.max(0, imponibileForfettarioLordo - contributiInpsDovuti);
            const aliquotaForfettario = isNuovaAttivita ? 0.05 : 0.15;
            impostaDovuta = redditoImponibileFiscale * aliquotaForfettario;
        } else { // Regime Ordinario
            redditoImponibileFiscale = Math.max(0, redditoLordoAnnuale - contributiInpsDovuti);
            // Calcolo IRPEF a scaglioni 2024
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
        const nettoMensile = nettoAnnuale / 12;

        return {
            redditoImponibileFiscale,
            contributiInpsDovuti,
            impostaDovuta,
            nettoAnnuale,
            nettoMensile,
            totaleTasseEContributi
        };
    }, [states]);

    const chartData = [
        { 
            name: 'Composizione', 
            'Reddito Netto': calculatedOutputs.nettoAnnuale, 
            'Contributi INPS': calculatedOutputs.contributiInpsDovuti, 
            'Imposte': calculatedOutputs.impostaDovuta 
        }
    ];

    const formulaUsata = useMemo(() => {
        if (states.isForfettario) {
            return `Imponibile = (Lordo * 78%) - Contributi; Imposta = Imponibile * ${states.isNuovaAttivita ? 5 : 15}%`;
        }
        return `Imponibile = Lordo - Contributi; Imposta = Calcolo IRPEF su Imponibile`;
    }, [states.isForfettario, states.isNuovaAttivita]);

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import('html2canvas')).default;
            const jsPDF = (await import('jspdf')).default;
            if (!calcolatoreRef.current) return;
            const canvas = await html2canvas(calcolatoreRef.current, { scale: 2 });
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
            const { totaleTasseEContributi, ...outputsToSave } = calculatedOutputs;
            const payload = { slug, title, inputs: states, outputs: outputsToSave, ts: Date.now() };
            const existingResults = JSON.parse(localStorage.getItem("calc_results") || "[]");
            localStorage.setItem("calc_results", JSON.stringify([payload, ...existingResults].slice(0, 50)));
            alert("Risultato salvato con successo!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(value);
    
    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2">
                    <div ref={calcolatoreRef} className="bg-white rounded-lg shadow-md">
                        <div className="p-6">
                            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                            <p className="text-gray-600 mb-4">{meta.description}</p>
                            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                                <strong>Disclaimer:</strong> Questo strumento offre una stima a scopo puramente informativo e non sostituisce una consulenza fiscale professionale. Le aliquote e le normative possono variare.
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border">
                                {inputs.map(input => {
                                    const conditionMet = !input.condition || (input.condition.includes('== true') && states[input.condition.split(' ')[0]]);
                                    if (!conditionMet) return null;

                                    const inputLabel = (
                                        <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                            {input.label}
                                            {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-1.5"><InfoIcon /></span></Tooltip>}
                                        </label>
                                    );

                                    if (input.type === 'boolean') {
                                        return (
                                            <div key={input.id} className="md:col-span-1 flex items-center gap-3 p-2 rounded-md bg-white border h-full">
                                                <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                                <label className="text-sm font-medium text-gray-700 flex-1" htmlFor={input.id}>{input.label}</label>
                                            </div>
                                        );
                                    }
                                    
                                    return (
                                        <div key={input.id}>
                                            {inputLabel}
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">{input.unit}</span>
                                                <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 pl-7" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? 0 : Number(e.target.value))} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-8 space-y-4">
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">Risultati della Simulazione</h2>
                                {outputs.map(output => (
                                    <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id.includes('netto') ? 'bg-emerald-50 border-emerald-500' : 'bg-gray-50 border-gray-300'}`}>
                                        <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                        <div className={`text-xl md:text-2xl font-bold ${output.id.includes('netto') ? 'text-emerald-600' : 'text-gray-800'}`}>
                                            <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '€...'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Ripartizione del Reddito Lordo</h3>
                                <div className="h-64 w-full bg-gray-50 p-4 rounded-lg">
                                    {isClient && (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                                <XAxis type="number" hide />
                                                <YAxis type="category" width={0} dataKey="name" />
                                                <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                                <Legend />
                                                <Bar dataKey="Reddito Netto" stackId="a" fill="#10b981" />
                                                <Bar dataKey="Contributi INPS" stackId="a" fill="#6366f1" />
                                                <Bar dataKey="Imposte" stackId="a" fill="#ef4444" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 border rounded-lg shadow-md p-4 bg-white">
                        <h3 className="font-semibold text-gray-700">Formula di Calcolo Utilizzata</h3>
                        <p className="text-xs text-gray-600 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaUsata}</p>
                        <p className="text-xs text-gray-500 mt-2">Nota: La formula è una rappresentazione semplificata dei calcoli fiscali e previdenziali, che possono includere ulteriori variabili.</p>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={salvaRisultato} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full text-sm border border-red-200 rounded-md px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolo</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <ContentRenderer content={content} />
                    </section>
                     <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-3 text-gray-800">Fonti e Riferimenti Normativi</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.inps.it/it/it/inps-comunica/dossier/inpgi-passa-a-inps.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Dossier INPS: Passaggio INPGI a INPS</a></li>
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/istanze/regime-forfetario-persone-fisiche" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate: Regime Forfettario</a></li>
                            <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1986-12-22;917!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Testo Unico delle Imposte sui Redditi (TUIR)</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default TassazioneGiornalistiCalculator;