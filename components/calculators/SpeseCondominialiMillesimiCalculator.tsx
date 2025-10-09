'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as ChartTooltip } from 'recharts';

export const meta = {
  title: 'Calcolatore Spese Condominiali per Millesimi',
  description: 'Calcola facilmente la tua quota di spesa condominiale in base ai millesimi di proprietà. Uno strumento semplice e trasparente per la ripartizione dei costi.'
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
            "name": "Come si calcola la quota di una spesa condominiale?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "La quota si calcola dividendo il costo totale della spesa per i millesimi totali del condominio (di solito 1000) e moltiplicando il risultato per i millesimi della propria unità immobiliare. La formula è: Quota = (Costo Totale / Millesimi Totali) * Millesimi Personali."
            }
          },
          {
            "@type": "Question",
            "name": "Cosa sono le tabelle millesimali?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Le tabelle millesimali sono documenti allegati al regolamento di condominio che esprimono il valore della singola proprietà in rapporto al valore dell'intero edificio, posto convenzionalmente pari a 1000. Sono la base per la ripartizione delle spese generali secondo l'art. 1123 del Codice Civile."
            }
          },
          {
            "@type": "Question",
            "name": "Tutte le spese condominiali si dividono per i millesimi di proprietà?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. Le spese generali per la conservazione delle parti comuni si dividono per millesimi di proprietà. Tuttavia, le spese per servizi che i condomini utilizzano in misura diversa (es. ascensore, scale, riscaldamento) vengono ripartite in base all'uso potenziale, utilizzando tabelle d'uso specifiche."
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
  "slug": "spese-condominiali-millesimi",
  "category": "Immobiliare e Casa",
  "title": "Calcolatore Spese Condominiali per millesimi",
  "lang": "it",
  "inputs": [
    { "id": "costo_totale_spesa", "label": "Costo Totale della Spesa da Ripartire", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Inserisci l'importo totale della spesa approvata dall'assemblea che deve essere suddivisa tra tutti i condomini (es. pulizia scale, manutenzione ascensore, bolletta luce comune)." },
    { "id": "millesimi_tua_unita", "label": "Millesimi della Tua Unità Immobiliare", "type": "number" as const, "unit": "‰", "min": 0, "step": 1, "tooltip": "Inserisci i millesimi di proprietà generale associati al tuo appartamento o negozio. Trovi questo valore nella tabella millesimale allegata al regolamento di condominio." },
    { "id": "millesimi_totali_condominio", "label": "Millesimi Totali del Condominio", "type": "number" as const, "unit": "‰", "min": 1, "step": 1, "tooltip": "Il totale dei millesimi dell'intero edificio. Di norma è 1000, ma in alcuni casi rari può essere diverso. Se non specificato diversamente, lascia il valore predefinito 1000." }
  ],
  "outputs": [
    { "id": "costo_per_millesimo", "label": "Costo per Singolo Millesimo", "unit": "€" },
    { "id": "quota_calcolata", "label": "Quota di Spesa a Tuo Carico", "unit": "€" },
    { "id": "percentuale_spesa", "label": "Tua Incidenza Percentuale sulla Spesa", "unit": "%" }
  ],
  "content": "### **Guida Completa alla Ripartizione delle Spese Condominiali**\n\n**Il Criterio dei Millesimi di Proprietà secondo il Codice Civile**\n\nLa suddivisione delle spese condominiali è uno degli aspetti più importanti e, talvolta, dibattuti della vita in un condominio. Il principio cardine che regola questa materia è basato su un concetto di proporzionalità: chi più possiede, più partecipa alle spese per la conservazione e il godimento delle parti comuni.\n\nQuesto strumento ti permette di calcolare in modo rapido e trasparente la tua quota di spesa in base ai tuoi millesimi, ma è anche una guida per comprendere a fondo la logica e le normative che ne stanno alla base. Le informazioni fornite, pur essendo accurate e autorevoli, hanno scopo informativo e **non sostituiscono il verbale d'assemblea o il piano di riparto redatto dall'amministratore**.\n\n### **Parte 1: Il Fondamento Normativo - Art. 1123 del Codice Civile**\n\nLa legge italiana è molto chiara. L'**articolo 1123 del Codice Civile** stabilisce il criterio principale per la ripartizione delle spese necessarie per le parti comuni dell'edificio:\n\n> \"Le spese necessarie per la conservazione e per il godimento delle parti comuni dell'edificio, per la prestazione dei servizi nell'interesse comune e per le innovazioni deliberate dalla maggioranza sono sostenute dai condomini in misura proporzionale al valore della proprietà di ciascuno, salvo diversa convenzione.\"\n\nIl \"valore della proprietà\" è espresso numericamente dalle **tabelle millesimali**.\n\n### **Parte 2: Cosa Sono i Millesimi e Come si Determinano?**\n\nI **millesimi (‰)** rappresentano la quota di proprietà di ogni singola unità immobiliare rispetto al valore totale dell'intero edificio, convenzionalmente posto pari a 1000.\n\nNon si basano solo sulla superficie calpestabile, ma tengono conto di una serie di **coefficienti correttivi** per rendere la valutazione più equa, tra cui:\n\n* **Coefficiente di destinazione**: Un ufficio ha un coefficiente diverso da un'abitazione.\n* **Coefficiente di piano**: Un attico vale più di un piano terra.\n* **Coefficiente di orientamento ed esposizione**: L'affaccio su una strada rumorosa o su un parco incide sul valore.\n* **Coefficiente di luminosità**.\n\nLa somma di tutti i millesimi di tutte le unità immobiliari deve dare come risultato **1000** (o il diverso valore totale indicato nel regolamento).\n\n### **Parte 3: Il Principio di Ripartizione Proporzionale**\n\nIl calcolo per determinare la quota di un singolo condomino è una semplice operazione matematica basata su questi dati:\n\n1.  **Costo Totale della Spesa**: L'importo complessivo da suddividere (es. 5.000 € per il rifacimento della facciata).\n2.  **Millesimi Totali**: Il valore totale dell'edificio (solitamente 1000).\n3.  **Millesimi dell'Unità Immobiliare**: I millesimi di proprietà del singolo condomino (es. 35 ‰).\n\nLa formula è la seguente:\n\n**Quota Personale = (Costo Totale Spesa / Millesimi Totali) * Millesimi Personali**\n\nQuesto calcolatore automatizza il processo, determinando prima il costo per singolo millesimo e poi moltiplicandolo per i millesimi di tua proprietà.\n\n### **Parte 4: Criteri Diversi per Spese Diverse (Uso Separato)**\n\nÈ fondamentale sapere che non tutte le spese seguono la tabella millesimale di proprietà generale. Il secondo comma dell'art. 1123 specifica:\n\n> \"Se si tratta di cose destinate a servire i condomini in misura diversa, le spese sono ripartite in proporzione dell'uso che ciascuno può farne.\"\n\nQuesto introduce il concetto di **tabelle millesimali d'uso**. Gli esempi più classici sono:\n\n* **Spese per Ascensore e Scale (Tabella Scale/Ascensore)**: Chi abita ai piani più alti paga di più, perché utilizza il servizio in misura maggiore. La spesa viene solitamente ripartita per metà in base ai millesimi di proprietà e per l'altra metà in proporzione all'altezza del piano.\n* **Spese di Riscaldamento Centralizzato**: La ripartizione avviene in base al consumo effettivo (obbligo di contabilizzatori di calore) e a una quota fissa per i consumi involontari (dispersioni), calcolata sui millesimi della tabella \"riscaldamento\".\n\nQuesto calcolatore è pensato per le spese generali ripartite secondo i **millesimi di proprietà**. Per le spese a uso separato, è necessario fare riferimento alle tabelle specifiche e ai criteri definiti nel proprio regolamento condominiale."
};

const SpeseCondominialiMillesimiCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calcolatoreRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
      costo_totale_spesa: 3500,
      millesimi_tua_unita: 45,
      millesimi_totali_condominio: 1000,
    };
    const [states, setStates] = useState<{[key: string]: any}>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({...prev, [id]: value}));
    };
    
    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const { costo_totale_spesa, millesimi_tua_unita, millesimi_totali_condominio } = states;

        if (millesimi_totali_condominio === 0) {
            return { costo_per_millesimo: 0, quota_calcolata: 0, percentuale_spesa: 0 };
        }

        const costo_per_millesimo = costo_totale_spesa / millesimi_totali_condominio;
        const quota_calcolata = costo_per_millesimo * millesimi_tua_unita;
        const percentuale_spesa = (millesimi_tua_unita / millesimi_totali_condominio) * 100;

        return { costo_per_millesimo, quota_calcolata, percentuale_spesa };
    }, [states]);
    
    const COLORS = ['#4f46e5', '#e5e7eb'];
    const chartData = [
        { name: 'Tua Quota', value: calculatedOutputs.quota_calcolata },
        { name: 'Quota Altri Condomini', value: states.costo_totale_spesa - calculatedOutputs.quota_calcolata },
    ];

    const formulaUsata = `Quota = (Costo Totale / Millesimi Totali) * Tuoi Millesimi`;

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
        } catch (_e) { alert("Impossibile generare il PDF."); }
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
    const formatNumber = (value: number, options?: Intl.NumberFormatOptions) => new Intl.NumberFormat('it-IT', options).format(value);

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                <div className="lg:col-span-2">
                    <div ref={calcolatoreRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">Verifica la tua quota di spesa in base alla tabella millesimale di proprietà.</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento è un ausilio al calcolo per le spese generali basate sui millesimi di proprietà. Non si applica a spese con criteri di ripartizione diversi (es. scale, ascensore). Il calcolo ufficiale è quello fornito dall'amministratore.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                           {inputs.map(input => (
                                <div key={input.id}>
                                    <label className="block text-sm font-medium text-gray-700 flex items-center mb-1" htmlFor={input.id}>
                                        {input.label}
                                        {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>}
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? 0 : Number(e.target.value))} />
                                        {input.unit && <span className="text-sm font-semibold text-gray-500">{input.unit}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 space-y-4">
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati del Calcolo</h2>
                            {outputs.map(output => (
                                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'quota_calcolata' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold ${output.id === 'quota_calcolata' ? 'text-indigo-600' : 'text-gray-800'}`}>
                                        <span>
                                            {isClient ? 
                                                (output.unit === '€' ? formatCurrency((calculatedOutputs as any)[output.id]) : formatNumber((calculatedOutputs as any)[output.id], { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ` ${output.unit}`)
                                                : '...'
                                            }
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Visualizzazione della Tua Quota</h3>
                            <div className="h-64 w-full bg-gray-50 p-4 rounded-lg flex justify-center items-center">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                                const RADIAN = Math.PI / 180;
                                                const radius = innerRadius + (outerRadius - innerRadius) * 1.3;
                                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                                return ( <text x={x} y={y} fill={COLORS[index]} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-sm font-semibold"> {`${(percent * 100).toFixed(1)}%`} </text> );
                                                }}>
                                                {chartData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> ))}
                                            </Pie>
                                            <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                            <Legend formatter={(value, entry) => <span className="text-gray-700">{value}</span>} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                     <div className="mt-6 border rounded-lg shadow-md p-4 bg-white">
                        <h3 className="font-semibold text-gray-700">Formula di Calcolo Utilizzata</h3>
                        <p className="text-xs text-gray-500 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaUsata}</p>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md sticky top-6">
                        <h2 className="font-semibold mb-2 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={salvaRisultato} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta PDF</button>
                            <button onClick={handleReset} className="col-span-2 w-full text-sm border border-red-300 rounded-md px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida alla Ripartizione Spese</h2>
                        <ContentRenderer content={content} />
                    </section>
                     <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Riferimenti Normativi</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:regio.decreto:1942-03-16;262!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Codice Civile, Art. 1123</a> - Ripartizione delle spese.</li>
                             <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:regio.decreto:1942-03-16;262!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Codice Civile, Art. 1117</a> - Parti comuni dell'edificio.</li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default SpeseCondominialiMillesimiCalculator;