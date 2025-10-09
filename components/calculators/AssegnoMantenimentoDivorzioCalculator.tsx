'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Cell } from 'recharts';

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
                        "name": "Come si calcola l'assegno di mantenimento?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Il calcolo non segue una formula fissa, ma considera vari fattori come i redditi dei coniugi, la durata del matrimonio, l'assegnazione della casa familiare e il contributo dato alla vita familiare. Questo calcolatore fornisce una stima basata su questi criteri."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "L'assegno di mantenimento per il coniuge è tassato?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Sì, per chi lo riceve, l'assegno di mantenimento è considerato un reddito e va dichiarato ai fini IRPEF. Per chi lo versa, l'importo è interamente deducibile dal proprio reddito imponibile."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Questo calcolatore include l'assegno per i figli?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "No, questo strumento calcola solo l'assegno di mantenimento per il coniuge. L'assegno per i figli è un obbligo separato e prioritario, calcolato sulla base delle loro esigenze specifiche e dei redditi di entrambi i genitori."
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
                if (trimmedBlock.includes("Tipo di Assegno")) {
                    const rows = trimmedBlock.split('\n').slice(1);
                    return (
                        <div key={index} className="overflow-x-auto my-4">
                            <table className="min-w-full border text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-2 border text-left">Tipo di Assegno</th>
                                        <th className="p-2 border text-left">Per chi VERSA (Coniuge Obbligato)</th>
                                        <th className="p-2 border text-left">Per chi RICEVE (Coniuge Beneficiario)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="p-2 border font-semibold" dangerouslySetInnerHTML={{ __html: processInlineFormatting(rows[0].split('**')[1]) }} />
                                        <td className="p-2 border" dangerouslySetInnerHTML={{ __html: processInlineFormatting(rows[0].split('**')[2]) }} />
                                        <td className="p-2 border" dangerouslySetInnerHTML={{ __html: processInlineFormatting(rows[0].split('**')[4]) }} />
                                    </tr>
                                     <tr>
                                        <td className="p-2 border font-semibold" dangerouslySetInnerHTML={{ __html: processInlineFormatting(rows[1].split('**')[1]) }} />
                                        <td className="p-2 border" dangerouslySetInnerHTML={{ __html: processInlineFormatting(rows[1].split('**')[2]) }} />
                                        <td className="p-2 border" dangerouslySetInnerHTML={{ __html: processInlineFormatting(rows[1].split('**')[4]) }} />
                                    </tr>
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


// Dati di configurazione del calcolatore
const calculatorData = {
  "slug": "assegno-mantenimento-divorzio",
  "category": "famiglia-e-vita-quotidiana",
  "title": "Calcolatore Assegno di Mantenimento per Divorzio/Separazione",
  "lang": "it",
  "inputs": [
    { "id": "reddito_coniuge_forte", "label": "Reddito mensile netto coniuge abbiente", "type": "number" as const, "unit": "€", "min": 0, "step": 50, "tooltip": "Inserire il reddito mensile netto (stipendio, rendite, etc.) del coniuge con le entrate maggiori." },
    { "id": "reddito_coniuge_debole", "label": "Reddito mensile netto coniuge debole", "type": "number" as const, "unit": "€", "min": 0, "step": 50, "tooltip": "Inserire il reddito mensile netto (stipendio, part-time, etc.) del coniuge con le entrate minori o nulle." },
    { "id": "spese_fisse_coniuge_forte", "label": "Spese fisse mensili coniuge abbiente", "type": "number" as const, "unit": "€", "min": 0, "step": 50, "tooltip": "Indicare le spese mensili non comprimibili come rata del mutuo, affitto o finanziamenti a lungo termine." },
    { "id": "spese_fisse_coniuge_debole", "label": "Spese fisse mensili coniuge debole", "type": "number" as const, "unit": "€", "min": 0, "step": 50, "tooltip": "Indicare le spese mensili non comprimibili come rata del mutuo, affitto o finanziamenti a lungo termine." },
    { "id": "durata_matrimonio", "label": "Durata del matrimonio", "type": "number" as const, "unit": "anni", "min": 0, "step": 1, "tooltip": "Inserire il numero totale di anni di matrimonio. Una durata maggiore può influenzare l'importo dell'assegno." },
    { "id": "assegnazione_casa_familiare", "label": "Assegnazione casa familiare al coniuge debole?", "type": "boolean" as const, "tooltip": "Spuntare se la casa di proprietà comune è stata assegnata dal giudice al coniuge economicamente più debole." },
    { "id": "valore_locativo_casa", "label": "Valore locativo mensile della casa", "type": "number" as const, "unit": "€", "min": 0, "step": 50, "condition": "assegnazione_casa_familiare == true", "tooltip": "Indicare una stima dell'affitto mensile per un immobile simile nella stessa zona. Questo valore riduce l'assegno monetario." }
  ],
  "outputs": [
    { "id": "assegno_mantenimento_stimato", "label": "Stima dell'Assegno di Mantenimento Mensile", "unit": "€" },
    { "id": "reddito_disponibile_forte_post", "label": "Reddito Disponibile Coniuge Forte (dopo assegno)", "unit": "€" },
    { "id": "reddito_disponibile_debole_post", "label": "Reddito Disponibile Coniuge Debole (dopo assegno)", "unit": "€" }
  ],
  "content": `### **Guida Completa al Calcolo dell'Assegno di Mantenimento per il Coniuge**

**Analisi dei Criteri, Metodologie di Calcolo e Aspetti Fiscali**

La determinazione dell'assegno di mantenimento in sede di separazione o divorzio rappresenta un punto cruciale che richiede un'analisi ponderata di molteplici fattori. Sebbene non esista una formula matematica imposta per legge, la prassi giurisprudenziale ha consolidato dei criteri guida.

Questo documento si propone come una guida completa, partendo dalla logica di funzionamento di un calcolatore di stima, per poi approfondire i principi giuridici, le metodologie applicate nei tribunali e le implicazioni fiscali. L'obiettivo è fornire uno strumento informativo per professionisti e utenti consapevoli, fermo restando che **nessun calcolatore automatico può sostituire la valutazione analitica di un giudice o la consulenza strategica di un legale**.

### **Parte 1: Il Calcolatore - Funzionamento e Parametri Fondamentali**

Un calcolatore per l'assegno di mantenimento opera come un modello di simulazione basato sui parametri quantitativi e qualitativi che i tribunali italiani considerano prevalentemente. La sua funzione è offrire una **stima orientativa** dell'importo.

L'obiettivo dell'assegno, secondo l'articolo 156 del Codice Civile, è duplice:

1.  **Funzione Assistenziale**: Garantire al coniuge economicamente più debole un tenore di vita analogo a quello goduto in costanza di matrimonio.
2.  **Funzione Perequativo-Compensativa**: Riequilibrare le posizioni economiche e compensare il coniuge per il contributo dato alla vita familiare e alla formazione del patrimonio comune e personale dell'altro, spesso a discapito della propria carriera.

I parametri chiave su cui si fonda il calcolo sono:

* **Redditi dei Coniugi**: Il fondamento del calcolo. Si analizzano i redditi netti mensili di entrambe le parti, comprensivi di ogni fonte di entrata (lavoro dipendente, autonomo, rendite finanziarie, canoni di locazione, profitti societari).
* **Spese Fisse e Tenore di Vita**: Si considerano le uscite essenziali (es. mutuo per la casa coniugale, affitto) per definire il reddito "disponibile" che sosteneva il tenore di vita della famiglia.
* **Durata del Matrimonio**: Un fattore di grande peso. Un matrimonio di lunga durata, in cui un coniuge ha sacrificato le proprie opportunità professionali per la famiglia, giustifica un assegno più consistente e duraturo.
* **Assegnazione della Casa Familiare**: Qualora la casa di proprietà comune venga assegnata al coniuge economicamente più debole, il mancato esborso per un canone di locazione (il cosiddetto "valore locativo") viene considerato un beneficio economico. Tale valore è spesso detratto dall'importo dell'assegno in denaro.
* **Contributo alla Vita Familiare**: Sebbene non sia un dato numerico, la logica del calcolo tiene implicitamente conto del lavoro domestico e della cura della prole, attività che hanno permesso all'altro coniuge di sviluppare la propria carriera e capacità reddituale.

#### **Interpretazione dei Risultati del Calcolatore**

* **Stima dell'Assegno**: Rappresenta l'importo mensile potenziale. È una stima basata su un modello matematico e sulla prassi, non un valore definitivo.
* **Reddito Disponibile Post-Assegno**: Una metrica cruciale che mostra la potenziale capacità di spesa di entrambi i coniugi _dopo_ il trasferimento dell'assegno. L'obiettivo del giudice è spesso mitigare squilibri eccessivi, pur riconoscendo le disparità reddituali di partenza.

### **Parte 2: Guida Approfondita all'Assegno di Mantenimento**

#### **Distinzione Fondamentale: Assegno di Mantenimento vs. Assegno Divorzile**

È essenziale distinguere tra:

* **Assegno di Mantenimento (in sede di separazione)**: Ha lo scopo di conservare, per quanto possibile, il tenore di vita goduto durante il matrimonio. Il presupposto è la non addebitabilità della separazione al coniuge richiedente e la disparità economica.
* **Assegno Divorzile (in sede di divorzio)**: A seguito di importanti interventi della Corte di Cassazione (in particolare la sentenza n. 18287/2018), la sua funzione è prevalentemente **assistenziale, compensativa e perequativa**. Il parametro del "tenore di vita" è stato superato in favore di una valutazione più complessa basata sull'impossibilità oggettiva del coniuge debole di procurarsi mezzi adeguati e sul suo contributo alla vita familiare.

#### **I Criteri Legali nel Dettaglio**

Oltre ai fattori già visti, il giudice analizza:

* **L'età e le condizioni di salute** del coniuge richiedente.
* **Le sue potenzialità professionali e la sua collocabilità sul mercato del lavoro**, considerando anche la zona di residenza.
* La titolarità di **patrimoni mobiliari e immobiliari**.
* La presenza di altri obblighi di mantenimento (es. verso altri figli o genitori).

#### **L'Assegno per i Figli: Un Obbligo Distinto e Prioritario**

È fondamentale ribadire che l'assegno di mantenimento per il coniuge è **distinto, aggiuntivo e non sostitutivo** di quello per i figli. Quest'ultimo è un obbligo primario per entrambi i genitori e viene calcolato secondo il principio di proporzionalità rispetto ai redditi, tenendo conto delle esigenze concrete dei figli (età, percorso educativo, esigenze sanitarie, inclinazioni personali).

### **Parte 3: Implicazioni Fiscali: Un Quadro Completo**

Tipo di AssegnoPer chi VERSA (Coniuge Obbligato)Per chi RICEVE (Coniuge Beneficiario)
**Assegno per il CONIUGE**Pienamente deducibile dal reddito complessivo.** L'importo versato abbatte la base imponibile IRPEF, riducendo l'imposta dovuta.**Costituisce reddito e va dichiarato.** È tassato ai fini IRPEF come "reddito assimilato a quello da lavoro dipendente".
**Assegno per i FIGLI**Non deducibile.** Non produce alcun beneficio fiscale diretto in termini di riduzione del reddito imponibile.**Non costituisce reddito e non va dichiarato.** È una somma esente da tassazione.

**Nota Bene**: Il genitore che versa l'assegno per i figli può comunque beneficiare delle **detrazioni per carichi di famiglia**, secondo le regole e le percentuali stabilite dalla legge, a meno che non sia stato raggiunto un diverso accordo tra le parti omologato dal tribunale.

### **Conclusione**

Il calcolo dell'assegno di mantenimento è un processo complesso che bilancia dati oggettivi e valutazioni discrezionali. Un calcolatore online fornisce un'utile e rapida prima approssimazione, indispensabile per orientarsi. Tuttavia, la determinazione finale dell'importo è di esclusiva competenza dell'autorità giudiziaria, che pondera tutte le circostanze specifiche del caso. Per una valutazione accurata e la difesa dei propri diritti, è imprescindibile l'assistenza di un avvocato specializzato in diritto di famiglia.`
};

const AssegnoMantenimentoDivorzioCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        reddito_coniuge_forte: 3500,
        reddito_coniuge_debole: 1200,
        spese_fisse_coniuge_forte: 800,
        spese_fisse_coniuge_debole: 600,
        durata_matrimonio: 15,
        assegnazione_casa_familiare: true,
        valore_locativo_casa: 700
    };
    const [states, setStates] = useState<{[key: string]: any}>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({...prev, [id]: value}));
    };
    
    const handleReset = () => {
        setStates(initialStates);
    };

    const calculatedOutputs = useMemo(() => {
        const {
            reddito_coniuge_forte, reddito_coniuge_debole,
            spese_fisse_coniuge_forte, spese_fisse_coniuge_debole,
            durata_matrimonio, assegnazione_casa_familiare, valore_locativo_casa
        } = states;

        const reddito_disponibile_forte = reddito_coniuge_forte - spese_fisse_coniuge_forte;
        const reddito_disponibile_debole = reddito_coniuge_debole - spese_fisse_coniuge_debole;
        const differenza_reddituale = reddito_disponibile_forte - reddito_disponibile_debole;
        const base_assegno = differenza_reddituale > 0 ? differenza_reddituale / 3 : 0;
        const correttivo_durata = 1 + (Math.min(durata_matrimonio, 25) / 50);
        const correttivo_casa = assegnazione_casa_familiare ? valore_locativo_casa * 0.5 : 0;
        const assegno_lordo = base_assegno * correttivo_durata;
        const assegno_mantenimento_stimato = Math.max(0, assegno_lordo - correttivo_casa);
        const reddito_disponibile_forte_post = reddito_disponibile_forte - assegno_mantenimento_stimato;
        const reddito_disponibile_debole_post = reddito_disponibile_debole + assegno_mantenimento_stimato;

        return {
            assegno_mantenimento_stimato,
            reddito_disponibile_forte_post,
            reddito_disponibile_debole_post,
            reddito_disponibile_forte,
            reddito_disponibile_debole
        };
    }, [states]);

    const chartData = [
        { name: 'Prima', 'Coniuge Forte': calculatedOutputs.reddito_disponibile_forte, 'Coniuge Debole': calculatedOutputs.reddito_disponibile_debole },
        { name: 'Dopo', 'Coniuge Forte': calculatedOutputs.reddito_disponibile_forte_post, 'Coniuge Debole': calculatedOutputs.reddito_disponibile_debole_post },
    ];

    const formulaUsata = `Assegno = MAX(0, ( ( (RedditoForte - SpeseForte) - (RedditoDebole - SpeseDebole) ) / 3 ) * (1 + MIN(AnniMatrimonio, 25) / 50) - (ValoreCasaAssegnata * 0.5) )`;

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;
            if (!calcolatoreRef.current) return;
            const canvas = await html2canvas(calcolatoreRef.current, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
            const w = pdf.internal.pageSize.getWidth();
            const h = pdf.internal.pageSize.getHeight();
            pdf.addImage(imgData, "PNG", 0, 0, w, h);
            pdf.save(`${slug}.pdf`);
        } catch (_e) { alert("Funzione PDF non disponibile in questo ambiente"); }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const { reddito_disponibile_forte, reddito_disponibile_debole, ...outputsToSave } = calculatedOutputs;
            const payload = { slug, title, inputs: states, outputs: outputsToSave, ts: Date.now() };
            localStorage.setItem("calc_results", JSON.stringify([payload, ...JSON.parse(localStorage.getItem("calc_results") || "[]")].slice(0, 50)));
            alert("Risultato salvato con successo!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

    return (
        <>
        <FaqSchema />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
            <div className="lg:col-span-2">
                <div className="p-6" ref={calcolatoreRef}>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">Una stima basata sui criteri dei tribunali per orientarti nella complessa materia della separazione.</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce in alcun modo una consulenza legale. La determinazione finale dell'assegno spetta esclusivamente all'autorità giudiziaria.
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
                                            <label className="text-sm font-medium text-gray-700" htmlFor={input.id}>{input.label}</label>
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
                                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'assegno_mantenimento_stimato' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold ${output.id === 'assegno_mantenimento_stimato' ? 'text-indigo-600' : 'text-gray-800'}`}>
                                        <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Equilibrio dei Redditi Disponibili</h3>
                            <div className="h-64 w-full bg-gray-50 p-2 rounded-lg">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                            <XAxis dataKey="name" />
                                            <YAxis tickFormatter={(value) => `€${value / 1000}k`} />
                                            <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                            <Bar dataKey="Coniuge Forte" name="Coniuge Forte">
                                                {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={index === 0 ? '#a5b4fc' : '#4f46e5'} />))}
                                            </Bar>
                                            <Bar dataKey="Coniuge Debole" name="Coniuge Debole">
                                                {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={index === 0 ? '#fca5a5' : '#dc2626'} />))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-6 border rounded-lg shadow-md p-4 bg-white">
                    <h3 className="font-semibold text-gray-700">Formula di Calcolo Utilizzata</h3>
                    <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaUsata}</p>
                    <p className="text-xs text-gray-500 mt-2">Nota: questa formula è una semplificazione dei complessi criteri legali e serve a scopo puramente indicativo.</p>
                </div>
            </div>

            <aside className="lg:col-span-1 space-y-6">
                <section className="border rounded-lg p-4 bg-white shadow-md">
                    <h2 className="font-semibold mb-2 text-gray-800">Strumenti</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={salvaRisultato} className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva</button>
                        <button onClick={handleExportPDF} className="w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">PDF</button>
                        <button onClick={handleReset} className="col-span-2 w-full border border-gray-300 rounded-md px-3 py-2 hover:bg-red-50 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset</button>
                    </div>
                </section>
                <section className="border rounded-lg p-4 bg-white shadow-md">
                    <h2 className="font-semibold mb-2 text-gray-800">Guida alla Comprensione</h2>
                    <div className="prose prose-sm max-w-none text-gray-700">
                        <ContentRenderer content={content} />
                    </div>
                </section>
                 <section className="border rounded-lg p-4 bg-white shadow-md">
                    <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti Normativi</h2>
                    <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                        <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:regio.decreto:1942-03-16;262!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Codice Civile, Art. 156</a> - Effetti della separazione sui rapporti personali tra i coniugi.</li>
                        <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:1970-12-01;898!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Legge sul Divorzio (L. 898/1970)</a> - Disciplina dei casi di scioglimento del matrimonio.</li>
                         <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:regio.decreto:1942-03-16;262!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Codice Civile, Art. 337-ter</a> - Provvedimenti riguardo ai figli.</li>
                    </ul>
                </section>
            </aside>
        </div>
        </>
    );
};

export default AssegnoMantenimentoDivorzioCalculator;
