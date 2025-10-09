'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ChartTooltip, Legend } from 'recharts';

export const meta = {
    title: "Calcolatore Tasse P2P Lending: Calcolo Imposta e Netto",
    description: "Calcola le tasse sui tuoi investimenti in P2P Lending. Simula il regime amministrato (26%) e dichiarativo (IRPEF) per ottimizzare i tuoi rendimenti."
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
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
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
                        "name": "Come vengono tassati i guadagni del P2P Lending in Italia?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "La tassazione dipende dalla piattaforma. Se agisce come 'sostituto d'imposta', applica una ritenuta fissa del 26% alla fonte (regime amministrato). Altrimenti, l'investitore riceve gli interessi lordi e deve dichiararli nel Modello Redditi, dove vengono sommati al reddito complessivo e tassati secondo gli scaglioni IRPEF (regime dichiarativo)."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Quale regime fiscale è più conveniente?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Generalmente, il regime amministrato con aliquota fissa al 26% è più conveniente per chi ha un reddito complessivo superiore a 28.000€ (poiché l'aliquota IRPEF marginale sarebbe del 35% o 43%). Il regime dichiarativo è più vantaggioso per redditi inferiori a 28.000€, dove l'aliquota IRPEF è del 23%."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Devo dichiarare i guadagni da piattaforme P2P estere?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Sì. Le piattaforme estere operano sempre in regime dichiarativo. Oltre a dichiarare i guadagni nel quadro RL del Modello Redditi, è obbligatorio compilare il quadro RW per il monitoraggio delle attività finanziarie detenute all'estero, indipendentemente dall'importo."
                        }
                    }
                ]
            })
        }}
    />
);

// --- Componente per il rendering del contenuto Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/✅/g, '✔️').replace(/❌/g, '✖️');

    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {content.split('\n\n').map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) {
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (trimmedBlock.startsWith('#### **')) {
                    return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (trimmedBlock.startsWith('*')) {
                    return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{trimmedBlock.split('\n').map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item.replace(/^\*\s*/, '')) }} />)}</ul>;
                }
                 if (trimmedBlock.startsWith('| Caratteristica')) {
                    const lines = trimmedBlock.split('\n');
                    const headers = lines[0].split('|').map(h => h.trim()).filter(Boolean);
                    const rows = lines.slice(2).map(rowLine => rowLine.split('|').map(c => c.trim()).filter(Boolean));
                    return (
                         <div key={index} className="overflow-x-auto my-4">
                            <table className="min-w-full border text-sm">
                                <thead className="bg-gray-100">
                                    <tr>{headers.map((header, hIndex) => <th key={hIndex} className="p-2 border text-left font-semibold">{header}</th>)}</tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, rIndex) => (
                                        <tr key={rIndex}>
                                            {row.map((cell, cIndex) => <td key={cIndex} className="p-2 border" dangerouslySetInnerHTML={{ __html: processInlineFormatting(cell) }} />)}
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


// --- Dati di configurazione del calcolatore (inclusi direttamente) ---
const calculatorData = {
  "slug": "tassazione-p2p-lending", "category": "Risparmio e Investimenti", "title": "Calcolatore Tassazione P2P Lending", "description": "Simula la tassazione dei tuoi guadagni da P2P Lending. Confronta il regime amministrato (ritenuta 26%) con il regime dichiarativo (tassazione IRPEF) per una scelta consapevole.", "lang": "it",
  "inputs": [
    { "id": "interessi_lordi", "label": "Interessi Lordi Annuali", "type": "number" as const, "unit": "€", "min": 0, "step": 50, "tooltip": "Inserisci il totale degli interessi lordi che hai ricevuto da tutte le piattaforme di P2P lending in un anno fiscale." },
    { "id": "tipo_piattaforma", "label": "Regime Fiscale della Piattaforma", "type": "select" as const, "options": ["Sostituto d'imposta (regime amministrato)", "Senza sostituto (regime dichiarativo)"], "tooltip": "Scegli 'Sostituto d'imposta' se la piattaforma trattiene le tasse per te (tassazione 26% fissa). Scegli 'Senza sostituto' se ricevi gli interessi lordi e devi dichiararli tu (tassazione IRPEF)." },
    { "id": "reddito_complessivo_irpef", "label": "Tuo Reddito Complessivo Annuale", "type": "number" as const, "unit": "€", "min": 0, "step": 1000, "condition": "tipo_piattaforma == 'Senza sostituto (regime dichiarativo)'", "tooltip": "Inserisci il tuo reddito totale imponibile (es. da lavoro dipendente, autonomo) al netto degli oneri deducibili, escludendo gli interessi P2P. Serve per calcolare la tua aliquota marginale IRPEF." },
    { "id": "perdite_compensabili", "label": "Perdite/Costi da Compensare", "type": "number" as const, "unit": "€", "min": 0, "step": 50, "condition": "tipo_piattaforma == 'Senza sostituto (regime dichiarativo)'", "tooltip": "Inserisci eventuali perdite su prestiti P2P subite nello stesso anno fiscale. Queste possono ridurre la base imponibile." }
  ],
  "outputs": [
    { "id": "base_imponibile", "label": "Base Imponibile", "unit": "€" },
    { "id": "imposta_dovuta", "label": "Imposta Totale Dovuta sui Guadagni P2P", "unit": "€" },
    { "id": "interessi_netti", "label": "Interessi Netti (dopo le tasse)", "unit": "€" },
    { "id": "aliquota_effettiva", "label": "Aliquota Fiscale Effettiva", "unit": "%" }
  ],
  "content": "### **Guida Completa alla Tassazione del P2P Lending in Italia\n\n**Comprendere le regole fiscali per ottimizzare i rendimenti e dichiarare correttamente i tuoi guadagni.**\n\nIl Peer-to-Peer (P2P) Lending si è affermato come una valida forma di investimento, ma la sua gestione fiscale può generare dubbi. Le modalità di tassazione dei proventi cambiano radicalmente in base a un fattore chiave: il ruolo della piattaforma come **sostituto d'imposta**.\n\nQuesta guida, insieme al nostro calcolatore interattivo, ha l'obiettivo di fare chiarezza, fornendoti strumenti e conoscenze per gestire i tuoi investimenti in P2P lending con serenità e consapevolezza. **Le informazioni fornite hanno scopo educativo e non sostituiscono una consulenza fiscale professionale.**\n\n### **Parte 1: La Distinzione Fondamentale: Amministrato vs. Dichiarativo**\n\nIl sistema fiscale italiano prevede due percorsi per la tassazione dei guadagni da P2P lending. La scelta non dipende da te, ma dalla piattaforma su cui investi.\n\n#### **1. Regime Amministrato (con Sostituto d'Imposta)**\n\nÈ la modalità **più semplice** per l'investitore. \n\n* **Come Funziona**: La piattaforma (solitamente italiana e autorizzata) agisce come sostituto d'imposta. Questo significa che calcola, trattiene e versa le tasse per conto tuo, applicando un'**imposta sostitutiva fissa del 26%** sugli interessi lordi.\n* **Cosa Ricevi**: Sul tuo conto ricevi direttamente gli interessi netti.\n* **Obblighi Dichiarativi**: **Nessuno**. Non devi inserire nulla nella tua dichiarazione dei redditi, poiché le tasse sono già state pagate alla fonte.\n* **Svantaggi**: Non è possibile compensare eventuali perdite su prestiti in default con gli interessi guadagnati.\n\n#### **2. Regime Dichiarativo (senza Sostituto d'Imposta)**\n\nQuesta modalità richiede un ruolo **attivo** da parte dell'investitore. È tipica delle piattaforme estere o di alcune piattaforme italiane che hanno scelto questo modello.\n\n* **Come Funziona**: La piattaforma ti accredita gli **interessi lordi**, senza applicare alcuna trattenuta.\n* **Obblighi Dichiarativi**: **Sei tu il responsabile** della dichiarazione di questi redditi. Gli interessi vanno sommati al tuo reddito complessivo (es. da lavoro dipendente o autonomo) e sono soggetti alla **tassazione progressiva IRPEF**.\n* **Dove Dichiarare**: I proventi vanno inseriti nel **Modello Redditi Persone Fisiche, Quadro RL, rigo RL2** (categoria 'Altri redditi di capitale').\n* **Vantaggi**: È possibile portare in deduzione dalla base imponibile le **perdite realizzate** su altri prestiti nello stesso anno fiscale, ottimizzando il carico fiscale.\n\n### **Parte 2: Analisi Comparativa dei Regimi Fiscali**\n\n| Caratteristica | Regime Amministrato (con Sostituto) | Regime Dichiarativo (senza Sostituto) |\n| :--- | :--- | :--- |\n| **Semplicità** | ✅ **Massima** (fa tutto la piattaforma) | ❌ **Minima** (richiede azione del contribuente) |\n| **Aliquota Fiscale** | **26% fissa** | **Aliquota marginale IRPEF (dal 23% al 43%)** |\n| **Convenienza** | Conveniente per redditi medio-alti (>28.000€) | Conveniente per redditi bassi (<28.000€) |\n| **Compensazione Perdite** | No | Sì (nello stesso anno fiscale) |\n| **Adempimenti** | Nessuno | Obbligo di compilazione del Modello Redditi (Quadro RL) |\n| **Piattaforme Estere** | - | Spesso richiede anche la compilazione del **Quadro RW** per il monitoraggio patrimoniale |\n\n### **Parte 3: Il Calcolo dell'IRPEF (Regime Dichiarativo)**\n\nQuando gli interessi P2P si sommano al tuo reddito, vengono tassati secondo gli scaglioni IRPEF. Per l'anno fiscale di riferimento, le aliquote sono:\n\n* **Fino a 28.000 €**: 23%\n* **Da 28.001 € a 50.000 €**: 35%\n* **Oltre 50.000 €**: 43%\n\nIl nostro calcolatore determina l'**imposta marginale**, ovvero calcola la differenza tra le tasse dovute sul tuo reddito *con* e *senza* gli interessi P2P. Questo ti mostra l'esatto impatto fiscale dei tuoi investimenti, che dipende dallo scaglione più alto in cui ricade il tuo reddito.\n\n#### **Un Consiglio Pratico**\n\nSe operi in regime dichiarativo, è fondamentale tenere traccia di tutti i rendimenti e delle eventuali perdite durante l'anno. La maggior parte delle piattaforme fornisce un report fiscale annuale che semplifica notevolmente la compilazione della dichiarazione dei redditi."
};

const TassazioneP2pLendingCalculator: React.FC = () => {
    const { slug, title, description, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        interessi_lordi: 1500,
        tipo_piattaforma: "Sostituto d'imposta (regime amministrato)",
        reddito_complessivo_irpef: 35000,
        perdite_compensabili: 100
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({ ...prev, [id]: value }));
    };
    
    const handleReset = () => setStates(initialStates);
    
    const calculateIrpef = useCallback((reddito: number): number => {
        if (reddito <= 0) return 0;
        if (reddito <= 28000) return reddito * 0.23;
        if (reddito <= 50000) return 28000 * 0.23 + (reddito - 28000) * 0.35;
        return 28000 * 0.23 + 22000 * 0.35 + (reddito - 50000) * 0.43;
    }, []);

    const calculatedOutputs = useMemo(() => {
        const { interessi_lordi, tipo_piattaforma, reddito_complessivo_irpef, perdite_compensabili } = states;
        
        let base_imponibile = 0;
        let imposta_dovuta = 0;

        if (tipo_piattaforma === "Sostituto d'imposta (regime amministrato)") {
            base_imponibile = interessi_lordi;
            imposta_dovuta = base_imponibile * 0.26;
        } else {
            base_imponibile = Math.max(0, interessi_lordi - perdite_compensabili);
            const imposta_pre = calculateIrpef(reddito_complessivo_irpef);
            const imposta_post = calculateIrpef(reddito_complessivo_irpef + base_imponibile);
            imposta_dovuta = imposta_post - imposta_pre;
        }

        const interessi_netti = interessi_lordi - imposta_dovuta;
        const aliquota_effettiva = interessi_lordi > 0 ? (imposta_dovuta / interessi_lordi) * 100 : 0;

        return { base_imponibile, imposta_dovuta, interessi_netti, aliquota_effettiva };
    }, [states, calculateIrpef]);
    
    const chartData = [
      { name: 'Interessi Netti', value: Math.max(0, calculatedOutputs.interessi_netti) },
      { name: 'Imposta Dovuta', value: Math.max(0, calculatedOutputs.imposta_dovuta) },
    ];
    const COLORS = ['#4f46e5', '#fca5a5'];

    const formulaUsata = states.tipo_piattaforma === "Sostituto d'imposta (regime amministrato)"
        ? `Imposta = Interessi Lordi * 26%`
        : `Imposta = IRPEF(Reddito + Interessi Netti) - IRPEF(Reddito)`;

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
        } catch (_e) { alert("Funzione PDF non disponibile."); }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            localStorage.setItem("calc_results", JSON.stringify([payload, ...JSON.parse(localStorage.getItem("calc_results") || "[]")].slice(0, 50)));
            alert("Risultato salvato con successo!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
    const formatPercent = (value: number) => `${value.toFixed(2)}%`;

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 bg-white rounded-lg shadow-md" ref={calcolatoreRef}>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">{description}</p>
                         <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento ha solo scopo informativo e non costituisce una consulenza fiscale. Consulta sempre un commercialista per la tua dichiarazione dei redditi.
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
                                
                                if (input.type === 'select') {
                                     return (
                                        <div key={input.id} className="md:col-span-2">
                                            {inputLabel}
                                            <select id={input.id} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value)}>
                                                {input.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
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
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati della Tassazione</h2>
                             {outputs.map(output => (
                                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'imposta_dovuta' ? 'bg-red-50 border-red-400' : (output.id === 'interessi_netti' ? 'bg-emerald-50 border-emerald-500' : 'bg-gray-50 border-gray-300')}`}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold ${output.id === 'imposta_dovuta' ? 'text-red-600' : (output.id === 'interessi_netti' ? 'text-emerald-600' : 'text-gray-800')}`}>
                                        <span>{isClient ? (output.unit === '%' ? formatPercent((calculatedOutputs as any)[output.id]) : formatCurrency((calculatedOutputs as any)[output.id])) : '...'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione degli Interessi Lordi</h3>
                            <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
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
                     <div className="border rounded-lg shadow-md p-4 bg-white">
                        <h3 className="font-semibold text-gray-700">Formula di Calcolo Utilizzata</h3>
                        <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaUsata}</p>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-1 gap-3">
                            <button onClick={salvaRisultato} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta in PDF</button>
                            <button onClick={handleReset} className="w-full text-sm border border-red-200 rounded-md px-3 py-2 hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                         <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti Normativi</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:presidente.repubblica:decreto:1986-12-22;917" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">D.P.R. n. 917/1986 (TUIR), Art. 44</a> - Redditi di capitale</li>
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/aree-tematiche/investimenti-e-attivita-finanziarie" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Area Tematica Investimenti - Agenzia delle Entrate</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default TassazioneP2pLendingCalculator;