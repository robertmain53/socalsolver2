'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

export const meta = {
  title: "Calcolatore TARI (Tassa Rifiuti) - Guida e Simulazione di Calcolo",
  description: "Calcola la TARI per utenze domestiche. Inserisci superficie, occupanti e le tariffe del tuo Comune per ottenere una stima precisa dell'importo annuo e delle rate."
};

// --- Icona per i Tooltip (SVG inline) ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600 transition-colors">
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
  <script type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "Come si calcola la TARI 2025?", "acceptedAnswer": { "@type": "Answer", "text": "La TARI si calcola sommando una Quota Fissa (data da: Metri Quadri x Tariffa Fissa Comunale) e una Quota Variabile (un importo fisso basato sul numero di occupanti). Al totale si aggiunge il Tributo Provinciale (TEFA), solitamente il 5%." } },
          { "@type": "Question", "name": "Dove trovo le tariffe TARI del mio Comune?", "acceptedAnswer": { "@type": "Answer", "text": "Le tariffe TARI si trovano sul sito ufficiale del tuo Comune, generalmente nella sezione 'Tributi'. Devi cercare il documento 'Delibera Approvazione Tariffe TARI' per l'anno di riferimento e trovare la tabella per le 'Utenze Domestiche'." } },
          { "@type": "Question", "name": "Cos'è la quota fissa e la quota variabile della TARI?", "acceptedAnswer": { "@type": "Answer", "text": "La Quota Fissa copre i costi generali del servizio (es. pulizia strade) ed è basata sui metri quadri dell'immobile. La Quota Variabile copre i costi di raccolta e smaltimento ed è un importo fisso basato sul numero di occupanti." } }
        ]
      })
    }}
  />
);

// --- Componente per il rendering del contenuto Markdown ---
const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>');
    const blocks = content.split('\n\n');
    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            {blocks.map((block, index) => {
                const trimmedBlock = block.trim();
                if (trimmedBlock.startsWith('### **')) return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                if (trimmedBlock.startsWith('*')) {
                    const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
                    return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ul>;
                }
                if (trimmedBlock.startsWith('| N. Occupanti |')) {
                    return (
                         <div key={index} className="overflow-x-auto my-4 p-4 border-2 border-dashed rounded-lg bg-slate-50">
                            <p className="text-center font-semibold text-sm mb-2">Esempio Tabella Tariffe Comunali</p>
                            <table className="min-w-full border text-xs text-center">
                                <thead className="bg-gray-200"><tr><th className="p-2 border">N. Occupanti</th><th className="p-2 border">Tariffa Fissa (€/m²)</th><th className="p-2 border">Tariffa Variabile (€/anno)</th></tr></thead>
                                <tbody>
                                    <tr className="bg-white"><td>1</td><td>1,25</td><td>80,00</td></tr>
                                    <tr className="bg-white"><td>2</td><td>1,40</td><td>105,00</td></tr>
                                    <tr className="bg-yellow-100 font-bold"><td>3</td><td>1,50</td><td>120,00</td></tr>
                                    <tr className="bg-white"><td>4</td><td>1,65</td><td>145,00</td></tr>
                                </tbody>
                            </table>
                        </div>
                    );
                }
                if (trimmedBlock) return <p key={index} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
                return null;
            })}
        </div>
    );
};

// --- Dati di configurazione del calcolatore ---
const calculatorData = {
  "slug": "calcolo-tari-per-comune", "category": "Immobiliare e Casa", "title": "Calcolatore TARI (Tassa sui Rifiuti) per Comune", "lang": "it",
  "inputs": [
    { "id": "superficieImmobile", "label": "Superficie Calpestabile Immobile", "type": "number" as const, "unit": "m²", "min": 1, "step": 1, "tooltip": "Inserisci i metri quadri calpestabili dell'abitazione, escluse aree come balconi, terrazzi e giardini. Trovi questo dato nell'atto di compravendita o nella visura catastale." },
    { "id": "numeroOccupanti", "label": "Numero di Occupanti", "type": "number" as const, "unit": "persone", "min": 1, "step": 1, "tooltip": "Indica il numero di persone che fanno parte del nucleo familiare anagrafico residente nell'immobile." },
    { "id": "tariffaFissa", "label": "Tariffa Fissa Comunale", "type": "number" as const, "unit": "€/m²", "min": 0, "step": 0.01, "tooltip": "Trova questo valore nella delibera TARI del tuo Comune. Cerca la tabella per 'Utenze Domestiche' e individua la tariffa fissa per il tuo numero di occupanti." },
    { "id": "tariffaVariabile", "label": "Tariffa Variabile Comunale", "type": "number" as const, "unit": "€", "min": 0, "step": 1, "tooltip": "Anche questo valore è nella delibera TARI del tuo Comune. Nella stessa tabella, individua la tariffa variabile (un importo fisso annuale) per il tuo numero di occupanti." },
    { "id": "riduzioni", "label": "Riduzioni o Agevolazioni", "type": "number" as const, "unit": "%", "min": 0, "max": 100, "step": 1, "tooltip": "Se hai diritto a riduzioni (es. compostaggio, ISEE), inserisci la percentuale totale. Verifica le condizioni nel regolamento TARI del tuo Comune." },
    { "id": "aliquotaTEFA", "label": "Aliquota Tributo Provinciale (TEFA)", "type": "number" as const, "unit": "%", "min": 0, "max": 10, "step": 0.1, "tooltip": "È un'addizionale provinciale, solitamente tra il 4% e il 5%. Se non la conosci, lascia il valore predefinito. È indicata nella delibera comunale o sull'avviso di pagamento." },
    { "id": "numeroRate", "label": "Numero di Rate di Pagamento", "type": "number" as const, "min": 1, "step": 1, "tooltip": "Indica il numero di rate in cui il Comune suddivide il pagamento annuale (solitamente 2, 3 o 4). Lo trovi nel regolamento TARI." }
  ],
  "outputs": [
    { "id": "quotaFissaCalcolata", "label": "Quota Fissa Calcolata", "unit": "€" }, { "id": "tariAnnuaLorda", "label": "TARI Annuale (Lordo)", "unit": "€" }, { "id": "importoRiduzioni", "label": "Importo Riduzione Applicata", "unit": "€" }, { "id": "importoTEFA", "label": "Maggiorazione Provinciale (TEFA)", "unit": "€" }, { "id": "importoTotaleAnnuo", "label": "Importo Totale Annuo da Pagare", "unit": "€" }, { "id": "importoRata", "label": "Importo Singola Rata", "unit": "€" }
  ],
  "content": "### **Guida Definitiva al Calcolo della TARI**\n\n**Come Funziona, Dove Trovare le Tariffe e Come Verificare l'Importo**\n\nLa TARI (Tassa sui Rifiuti) è l'imposta comunale destinata a finanziare i costi del servizio di raccolta e smaltimento dei rifiuti. Essendo un tributo locale, **le sue tariffe variano da Comune a Comune**, rendendo impossibile un calcolo universale senza dati specifici. \n\nQuesto strumento è stato creato per risolvere questo problema: non solo ti permette di calcolare l'importo esatto, ma **ti guida passo dopo passo a trovare i dati necessari** sul sito del tuo Comune. È lo strumento perfetto per verificare la correttezza dell'avviso di pagamento che hai ricevuto o per stimare la spesa futura.\n\n### **Parte 1: La Formula della TARI Spiegata Semplice**\n\nLa legge nazionale (D.P.R. 158/99) stabilisce che la TARI per le **utenze domestiche** (le case) si calcola sommando due parti:\n\n`TARI = Quota Fissa + Quota Variabile`\n\n* **Quota Fissa**: Si calcola moltiplicando i metri quadri dell'immobile per una tariffa fissa al metro quadro (`€/m²`). Questa parte copre i costi generali del servizio che non dipendono da quanti rifiuti produci (es. spazzamento strade, costi amministrativi).\n    `Quota Fissa Calcolata = Superficie Immobile (m²) * Tariffa Fissa Comunale (€/m²)`\n\n* **Quota Variabile**: È un importo fisso annuale che dipende **esclusivamente dal numero di componenti del nucleo familiare**. Non varia in base ai rifiuti prodotti, ma si presume che una famiglia più numerosa ne produca di più. Copre i costi diretti di raccolta, trasporto e smaltimento.\n\nAl totale così ottenuto si aggiunge infine il **Tributo Provinciale (TEFA)**, una maggiorazione per finanziare le funzioni provinciali di tutela ambientale, solitamente pari al 5%.\n\n### **Parte 2: Guida Pratica - Dove Trovare le Tariffe del Tuo Comune**\n\nQuesta è la parte più importante. Per usare il calcolatore, devi reperire due valori dal tuo Comune. Ecco come fare:\n\n1.  **Vai sul sito web ufficiale del tuo Comune**: La URL è solitamente `www.comune.[nomecomune].[provincia].it` (es. `www.comune.milano.it`).\n2.  **Cerca la sezione \"Tributi\"**: Nel menu principale o tramite la barra di ricerca, cerca sezioni come \"Tributi\", \"Ufficio Tributi\", \"Tasse e Imposte\" o direttamente \"TARI\".\n3.  **Trova il documento giusto**: Cerca un file (solitamente un PDF) chiamato **\"Delibera Approvazione Tariffe TARI [ANNO]\"** o simile. Assicurati che sia quello dell'anno di riferimento.\n4.  **Individua la tabella \"Utenze Domestiche\"**: All'interno del documento, troverai delle tabelle. Ignora quelle per le utenze non domestiche (negozi, uffici) e cerca quella dedicata alle abitazioni.\n5.  **Estrai i tuoi dati**: La tabella avrà un aspetto simile a questo:\n\n| N. Occupanti | Tariffa Fissa (€/m²) | Tariffa Variabile (€/anno) |\n| :--- | :--- | :--- |\n| 1 | 1,25 | 80,00 |\n| 2 | 1,40 | 105,00 |\n| 3 | **1,50** | **120,00** |\n| 4 | 1,65 | 145,00 |\n\n    Se la tua famiglia è composta da 3 persone, i valori da inserire nel calcolatore sono **1,50** (Tariffa Fissa) e **120,00** (Tariffa Variabile).\n\n### **Parte 3: Riduzioni e Agevolazioni Comuni**\n\nOgni Comune può prevedere delle agevolazioni. Controlla il **\"Regolamento TARI\"** (un documento diverso dalla delibera tariffaria) per verificare se hai diritto a sconti. Le riduzioni più comuni includono:\n\n* **Compostaggio domestico**: Se hai un orto o giardino e smaltisci in autonomia i rifiuti organici.\n* **Unico occupante**: Per chi vive da solo in un'abitazione di grandi dimensioni.\n* **Immobili a disposizione**: Per seconde case non locate.\n* **Distanza dal punto di raccolta**: Se la tua abitazione è molto lontana dal cassonetto più vicino.\n* **Agevolazioni ISEE**: Per nuclei familiari con basso reddito.\n\n### **Parte 4: Scadenze e Pagamento**\n\nLa TARI si paga tramite **modello F24**. Solitamente, il Comune invia a casa gli avvisi di pagamento con i modelli F24 precompilati. Il numero di rate e le scadenze (solitamente tra aprile e dicembre) sono decise dal Comune e indicate sull'avviso stesso. Usa questo calcolatore per verificare che l'importo richiesto sia corretto."
};


const CalcoloTariPerComuneCalculator: React.FC = () => {
    const { slug, title, inputs, content, outputs } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        superficieImmobile: 100, numeroOccupanti: 3, tariffaFissa: 1.5,
        tariffaVariabile: 120, riduzioni: 0, aliquotaTEFA: 5, numeroRate: 3,
    };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);
    
    const handleStateChange = (id: string, value: any) => setStates(prev => ({ ...prev, [id]: value }));
    const handleReset = () => setStates(initialStates);

    const calculatedOutputs = useMemo(() => {
        const { superficieImmobile, tariffaFissa, tariffaVariabile, riduzioni, aliquotaTEFA, numeroRate } = states;
        const quotaFissaCalcolata = superficieImmobile * tariffaFissa;
        const tariAnnuaLorda = quotaFissaCalcolata + tariffaVariabile;
        const importoRiduzioni = tariAnnuaLorda * (riduzioni / 100);
        const tariAnnuaNeta = tariAnnuaLorda - importoRiduzioni;
        const importoTEFA = tariAnnuaNeta * (aliquotaTEFA / 100);
        const importoTotaleAnnuo = tariAnnuaNeta + importoTEFA;
        const importoRata = numeroRate > 0 ? importoTotaleAnnuo / Number(numeroRate) : 0;
        return { quotaFissaCalcolata, tariAnnuaLorda, importoRiduzioni, importoTEFA, importoTotaleAnnuo, importoRata };
    }, [states]);

    const chartData = [
      { name: 'Quota Fissa', value: calculatedOutputs.quotaFissaCalcolata },
      { name: 'Quota Variabile', value: states.tariffaVariabile },
      { name: 'Tributo TEFA', value: calculatedOutputs.importoTEFA },
    ];
    const COLORS = ['#0ea5e9', '#84cc16', '#f97316'];

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;
            if (!calculatorRef.current) return;
            const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
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
            localStorage.setItem("calc_results", JSON.stringify([payload, ...JSON.parse(localStorage.getItem("calc_results") || "[]")].slice(0, 50)));
            alert("Risultato salvato con successo!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
    const formulaTrasparente = "Totale = ( ( (Superficie * Tariffa Fissa) + Tariffa Variabile ) - Riduzioni ) * (1 + % TEFA)";

    return (
        <>
            <FaqSchema />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50/80 font-sans">
                <main className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-lg p-6" ref={calculatorRef}>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4 text-base">Verifica l'importo della tassa sui rifiuti per la tua abitazione.</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento è un simulatore e non sostituisce il documento ufficiale del Comune. Le tariffe sono stabilite localmente: usa la nostra guida per trovarle!
                        </div>
                        
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-700 border-b-2 border-indigo-500 pb-2 mb-4">Passo 1: Dati del tuo Immobile</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                    {inputs.slice(0, 2).map(input => (
                                        <div key={input.id}>
                                            <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>{input.label}<Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip></label>
                                            <div className="relative">
                                                <input id={input.id} type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"/>
                                                {input.unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">{input.unit}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <h2 className="text-lg font-semibold text-gray-700 border-b-2 border-indigo-500 pb-2 mb-4">Passo 2: Tariffe e Dati del tuo Comune</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                    {inputs.slice(2).map(input => (
                                        <div key={input.id}>
                                            <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>{input.label}<Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip></label>
                                            <div className="relative">
                                                <input id={input.id} type="number" min={input.min} max={input.max} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" />
                                                {input.unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">{input.unit}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">Risultato del Calcolo</h2>
                            <div className="space-y-2">
                                {outputs.map(output => (
                                    <div key={output.id} className={`flex items-baseline justify-between p-3 rounded-lg ${output.id === 'importoTotaleAnnuo' ? 'bg-indigo-100' : 'bg-gray-50'}`}>
                                        <div className="text-sm font-medium text-gray-700">{output.label}</div>
                                        <div className={`text-lg font-bold ${output.id === 'importoTotaleAnnuo' ? 'text-indigo-600' : 'text-gray-800'}`}>
                                            <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                     <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Composizione del Totale</h3>
                        <div className="h-72 w-full">
                            {isClient && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                                            {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                        </Pie>
                                        <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                        <div className="mt-4 border rounded-lg p-3 bg-slate-50">
                          <h4 className="font-semibold text-gray-700 text-sm">Formula di Calcolo Utilizzata</h4>
                          <p className="text-xs text-gray-600 mt-1 font-mono">{formulaTrasparente}</p>
                        </div>
                    </div>
                </main>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-lg sticky top-6">
                        <h2 className="text-lg font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-1 gap-3">
                            <button onClick={salvaRisultato} className="w-full text-center bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-center bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta in PDF</button>
                            <button onClick={handleReset} className="w-full text-center bg-red-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                        </div>
                    </section>
                    <section className="p-4 bg-white shadow-lg rounded-2xl">
                        <h2 className="text-lg font-semibold mb-3 text-gray-800">Guida al Calcolo</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="p-4 bg-white shadow-lg rounded-2xl">
                        <h2 className="text-lg font-semibold mb-3 text-gray-800">Fonti e Riferimenti</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:presidente.repubblica:decreto:1999-04-27;158" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">D.P.R. n. 158/1999 - Metodo normalizzato per la TARI</a></li>
                            <li><a href="https://www.finanze.gov.it/it/fiscalita-regionale-e-locale/tassa-sui-rifiuti-tari/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Ministero dell'Economia e delle Finanze - TARI</a></li>
                             <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2013-12-27;147" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Legge n. 147/2013 (Legge di Stabilità 2014)</a> - Istituzione della TARI</li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default CalcoloTariPerComuneCalculator;