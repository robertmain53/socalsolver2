'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

export const meta = {
    title: "Calcolatore Tassazione per Musicisti e Artisti (con ENPALS)",
    description: "Stima il tuo guadagno netto, le tasse e i contributi ENPALS se sei un musicista o un artista con Partita IVA in Regime Forfettario."
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
                        "name": "Come si calcolano i contributi ENPALS per un musicista?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "I contributi ENPALS (ora FPLS) sono pari al 33% del compenso lordo. Di questa percentuale, il 9.19% è a carico del musicista (trattenuto dal compenso) e il 23.81% è a carico del committente. I contributi a carico del lavoratore sono deducibili dal reddito imponibile nel Regime Forfettario."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Quanto paga di tasse un artista in Regime Forfettario?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Un artista in Regime Forfettario paga un'imposta sostitutiva del 15% (o del 5% per i primi 5 anni di attività) calcolata su un reddito imponibile pari al 67% del fatturato, al netto dei contributi previdenziali obbligatori versati."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Questo calcolatore è valido anche per il regime ordinario?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "No, questo strumento è specificamente progettato per simulare la tassazione nel Regime Forfettario, che è il più comune per artisti e musicisti. Il regime ordinario ha una logica di calcolo completamente diversa basata sui costi reali e sugli scaglioni IRPEF."
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
        return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');
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
  "slug": "tassazione-musicisti-artisti",
  "category": "Fisco e Lavoro Autonomo",
  "title": "Calcolatore Tassazione per Musicisti e Artisti (con ENPALS)",
  "lang": "it",
  "inputs": [
    { "id": "compenso_lordo", "label": "Compenso Lordo Annuale", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Inserisci il totale dei compensi lordi che prevedi di incassare in un anno, prima di ogni trattenuta o tassa." },
    { "id": "is_forfettario", "label": "Applichi il Regime Forfettario?", "type": "boolean" as const, "tooltip": "Seleziona questa opzione se hai aderito al regime fiscale forfettario. La maggior parte dei musicisti e artisti con Partita IVA rientra in questa categoria." },
    { "id": "is_nuova_attivita", "label": "Sei una Nuova Attività (primi 5 anni)?", "type": "boolean" as const, "condition": "is_forfettario == true", "tooltip": "Se hai aperto la Partita IVA da meno di 5 anni e rispetti i requisiti, puoi beneficiare dell'imposta sostitutiva ridotta al 5%." }
  ],
  "outputs": [
    { "id": "netto_effettivo", "label": "Netto Effettivo Annuale", "unit": "€" },
    { "id": "imposta_sostitutiva", "label": "Imposta Sostitutiva (Tasse)", "unit": "€" },
    { "id": "contributi_lavoratore", "label": "Contributi ENPALS a carico del Lavoratore", "unit": "€" },
    { "id": "contributi_committente", "label": "Contributi ENPALS a carico del Committente", "unit": "€" },
    { "id": "reddito_imponibile_netto", "label": "Reddito Imponibile Netto", "unit": "€" }
  ],
  "content": "### **Guida Completa alla Tassazione per Musicisti e Artisti**\n\n**Analisi del Regime Forfettario, Calcolo dei Contributi ENPALS e Ottimizzazione Fiscale**\n\nIl mondo fiscale per chi opera nel settore dello spettacolo può sembrare complesso. Tra Partita IVA, regime forfettario e il peculiare sistema contributivo dell'ex-ENPALS, è facile perdere l'orientamento. Questa guida, abbinata al calcolatore, ha l'obiettivo di fare chiarezza, offrendo strumenti pratici e informazioni autorevoli per gestire la propria fiscalità con consapevolezza.\n\n**Disclaimer**: Questo strumento fornisce una stima accurata basata sulla normativa vigente, ma non sostituisce la consulenza di un commercialista o di un consulente del lavoro. I risultati sono a scopo puramente informativo.\n\n### **Parte 1: Il Regime Forfettario per l'Artista**\n\nIl **Regime Forfettario** è la scelta più comune e vantaggiosa per la maggior parte dei musicisti, DJ e artisti che iniziano la loro attività. Ecco perché:\n\n* **Tassazione Semplificata**: Non si paga l'IRPEF, ma un'imposta sostitutiva del **15%**. Per le nuove attività che rispettano specifici requisiti, questa aliquota scende al **5% per i primi 5 anni**.\n* **Niente IVA**: Le fatture vengono emesse senza IVA. Questo permette di essere più competitivi sul mercato, specialmente quando si lavora con privati o enti che non possono scaricare l'IVA.\n* **Costi Calcolati Forfettariamente**: Lo Stato presume che una parte del tuo incasso sia destinata a coprire le spese. Per il Codice ATECO tipico di musicisti e artisti (**90.03.09 - Altre creazioni artistiche e letterarie**), il **coefficiente di redditività è del 67%**. Questo significa che le tasse e i contributi si calcolano solo sul 67% del tuo fatturato, mentre il restante 33% è considerato \"costo\" esentasse, a prescindere dalle spese reali sostenute.\n\n### **Parte 2: I Contributi ENPALS (Fondo Pensione Lavoratori Spettacolo)**\n\nL'ENPALS (oggi **Fondo Pensione Lavoratori Spettacolo - FPLS** presso l'INPS) è la cassa previdenziale obbligatoria per chi lavora nel mondo dello spettacolo. Il suo funzionamento è diverso da quello della Gestione Separata INPS o delle casse artigiani/commercianti.\n\n#### **Come Funziona il Calcolo ENPALS?**\n\nPer ogni prestazione lavorativa, è dovuto un contributo totale del **33%** calcolato sul compenso lordo. Questo contributo è così suddiviso:\n\n* **23.81% a carico del committente**: È il tuo cliente (l'organizzatore dell'evento, il locale, l'agenzia) a dover versare questa quota.\n* **9.19% a carico del lavoratore**: Questa è la tua parte. Viene **trattenuta direttamente dal tuo compenso** al momento del pagamento e versata dal committente per tuo conto.\n\n_Esempio Pratico_: Su un compenso di 1.000 €, il committente tratterrà 91,90 € (il tuo 9.19%) e ti pagherà 908,10 €. Separatamente, lui verserà all'INPS un totale di 330 € (i 91,90 € trattenuti a te + i suoi 238,10 €).\n\n#### **Il Vantaggio Fiscale: Deducibilità dei Contributi**\n\nQui arriva la buona notizia per chi è in regime forfettario. I contributi obbligatori versati sono **interamente deducibili** dal reddito imponibile.\n\nLa quota ENPALS a tuo carico (il 9.19%) che ti viene trattenuta **abbatte la base su cui andrai a pagare l'imposta sostitutiva**. Il nostro calcolatore tiene conto di questo importante vantaggio.\n\n### **Parte 3: La Fatturazione: Un Esempio Concreto**\n\nCome deve essere compilata una fattura da un musicista in regime forfettario? Ecco gli elementi chiave:\n\n1.  **Dati anagrafici** (tuoi e del cliente).\n2.  **Descrizione della prestazione** (es. \"Esibizione musicale del [data] presso [luogo]\").\n3.  **Compenso Lordo**: L'importo pattuito.\n4.  **Trattenuta Previdenziale ENPALS (9.19%)**: Calcolata sul compenso lordo, da sottrarre.\n5.  **Totale Netto a Pagare**: Compenso Lordo - Trattenuta ENPALS.\n6.  **Diciture Obbligatorie**: Devi includere frasi specifiche che indicano l'appartenenza al regime forfettario, l'esenzione IVA e la gestione della ritenuta d'acconto (non applicata).\n\n### **Conclusione: Pianificare per Prosperare**\n\nEssere un artista professionista significa anche essere un imprenditore di sé stessi. Comprendere la logica dietro la tassazione e la contribuzione non solo ti permette di calcolare il tuo netto, ma anche di pianificare le tue finanze e dialogare efficacemente con i committenti e il tuo commercialista. Usa questo strumento per fare simulazioni e prendere decisioni informate sulla tua carriera."
};

const TassazioneMusicistiArtistiCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        compenso_lordo: 25000,
        is_forfettario: true,
        is_nuova_attivita: true
    };
    const [states, setStates] = useState<{[key: string]: any}>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({...prev, [id]: value}));
    };
    
    const handleReset = () => {
        setStates(initialStates);
    };

    const calculatedOutputs = useMemo(() => {
        const { compenso_lordo, is_forfettario, is_nuova_attivita } = states;

        if (!is_forfettario) {
            return {
                netto_effettivo: 0, imposta_sostitutiva: 0, contributi_lavoratore: 0,
                contributi_committente: 0, reddito_imponibile_netto: 0,
            };
        }

        const coefficiente_redditivita = 0.67;
        const reddito_imponibile_lordo = compenso_lordo * coefficiente_redditivita;
        const contributi_lavoratore = compenso_lordo * 0.0919;
        const contributi_committente = compenso_lordo * 0.2381;
        const reddito_imponibile_netto = Math.max(0, reddito_imponibile_lordo - contributi_lavoratore);
        const aliquota_imposta = is_nuova_attivita ? 0.05 : 0.15;
        const imposta_sostitutiva = reddito_imponibile_netto * aliquota_imposta;
        const netto_effettivo = compenso_lordo - contributi_lavoratore - imposta_sostitutiva;

        return {
            netto_effettivo,
            imposta_sostitutiva,
            contributi_lavoratore,
            contributi_committente,
            reddito_imponibile_netto,
        };
    }, [states]);

    const chartData = [
        { 
            name: 'Ripartizione Compenso Lordo', 
            'Netto Effettivo': calculatedOutputs.netto_effettivo, 
            'Tasse': calculatedOutputs.imposta_sostitutiva, 
            'Contributi Lavoratore': calculatedOutputs.contributi_lavoratore,
        },
    ];
    
    const COLORS = ['#4f46e5', '#fca5a5', '#a5b4fc'];

    const formulaUsata = `Reddito Imponibile = (Compenso Lordo * 0.67) - (Compenso Lordo * 0.0919)\nImposta = Reddito Imponibile * (5% o 15%)\nNetto = Compenso Lordo - (Compenso Lordo * 0.0919) - Imposta`;

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
                            <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce in alcun modo la consulenza di un commercialista.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                            {inputs.map(input => {
                                const conditionMet = !input.condition || (input.condition.includes('== true') && states[input.condition.split(' ')[0]]);
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
                                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'netto_effettivo' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold ${output.id === 'netto_effettivo' ? 'text-indigo-600' : 'text-gray-800'}`}>
                                        <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id] || 0) : '...'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ripartizione del Compenso Lordo</h3>
                            <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart layout="vertical" data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <XAxis type="number" hide />
                                            <YAxis type="category" dataKey="name" hide />
                                            <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                            <Legend />
                                            <Bar dataKey="Netto Effettivo" stackId="a" fill={COLORS[0]} />
                                            <Bar dataKey="Tasse" stackId="a" fill={COLORS[1]} />
                                            <Bar dataKey="Contributi Lavoratore" stackId="a" fill={COLORS[2]} />
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
                    <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti</h2>
                    <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                        <li><a href="https://www.inps.it/it/it/dettaglio-approfondimento.schede-informative.50704.calcolo-dei-contributi-ivs-dei-lavoratori-dello-spettacolo.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">INPS - Calcolo Contributi Lavoratori Spettacolo</a></li>
                        <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/regime-forfetario-persone-fisiche" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Regime Forfetario</a></li>
                         <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2014-12-23;190" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Legge di Stabilità 2015, Art. 1, commi 54-89</a> (Istituzione del Regime Forfettario).</li>
                    </ul>
                </section>
            </aside>
        </div>
        </>
    );
};

export default TassazioneMusicistiArtistiCalculator;