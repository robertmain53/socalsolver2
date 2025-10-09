'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
// 1. Aggiunto 'Cell' all'importazione da recharts
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

export const meta = {
  title: "Calcolatore Tassazione ETF (armonizzati vs. non armonizzati)",
  description: "Simula e confronta la tassazione su plusvalenze da ETF armonizzati (UCITS) e non armonizzati. Calcola il capital gain, l'imposta dovuta e il netto realizzato."
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
            "name": "Cos'è un ETF armonizzato (UCITS)?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Un ETF armonizzato è un fondo conforme alla direttiva europea UCITS, che impone regole stringenti a tutela degli investitori. Gode di un regime fiscale semplificato in Italia, con un'imposta sostitutiva del 26% sulle plusvalenze."
            }
          },
          {
            "@type": "Question",
            "name": "Come viene tassato un ETF non armonizzato?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "I proventi (plusvalenze) di un ETF non armonizzato non sono soggetti a imposta sostitutiva, ma concorrono a formare il reddito complessivo dell'investitore e sono tassati secondo la sua aliquota IRPEF marginale (dal 23% al 43%). È obbligatorio il regime dichiarativo."
            }
          },
          {
            "@type": "Question",
            "name": "Devo dichiarare i miei ETF nel Modello Redditi?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Se detieni ETF armonizzati tramite un intermediario italiano in regime amministrato, non devi dichiarare nulla; la banca agisce da sostituto d'imposta. Se invece possiedi ETF non armonizzati o usi un broker estero, sei obbligato a compilare i quadri RT, RM e RW del Modello Redditi."
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
                if (block.startsWith('### **')) {
                    return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(block.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (block.startsWith('#### **')) {
                    return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(block.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
                }
                if (block.startsWith('*')) {
                    return (
                        <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
                            {block.split('\n').map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item.replace(/^\*\s*/, '')) }} />)}
                        </ul>
                    );
                }
                if (block.startsWith('|')) {
                    const rows = block.split('\n').map(row => row.split('|').map(cell => cell.trim()).slice(1, -1));
                    const headers = rows[0];
                    const body = rows.slice(2);
                    return (
                        <div key={index} className="overflow-x-auto my-4">
                            <table className="min-w-full border text-sm">
                                <thead className="bg-gray-100">
                                    <tr>{headers.map((th, i) => <th key={i} className="p-2 border text-left font-semibold" dangerouslySetInnerHTML={{ __html: processInlineFormatting(th) }} />)}</tr>
                                </thead>
                                <tbody>
                                    {body.map((row, i) => <tr key={i}>{row.map((td, j) => <td key={j} className="p-2 border" dangerouslySetInnerHTML={{ __html: processInlineFormatting(td) }} />)}</tr>)}
                                </tbody>
                            </table>
                        </div>
                    );
                }
                if (block) {
                    return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(block) }} />;
                }
                return null;
            })}
        </div>
    );
};

// --- Dati di configurazione del calcolatore (self-contained) ---
const calculatorData = {
  "slug": "tassazione-etf-armonizzati-non",
  "category": "Risparmio e Investimenti",
  "title": "Calcolatore Tassazione ETF (armonizzati vs. non armonizzati)",
  "lang": "it",
  "inputs": [
    { "id": "costo_acquisto", "label": "Costo Totale di Acquisto (PMR)", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Il Prezzo Medio di Carico, ovvero il costo totale sostenuto per l'acquisto delle quote dell'ETF, incluse le commissioni di acquisto." },
    { "id": "valore_realizzo", "label": "Controvalore Totale di Vendita", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "L'importo totale incassato dalla vendita delle quote dell'ETF, al netto delle commissioni di vendita." },
    { "id": "is_armonizzato", "label": "L'ETF è armonizzato (UCITS)?", "type": "boolean" as const, "tooltip": "Spunta questa casella se l'ETF è conforme alla direttiva europea UCITS. La maggior parte degli ETF disponibili in Italia lo è. Se non lo è, la tassazione cambia radicalmente." },
    { "id": "aliquota_irpef", "label": "La tua aliquota IRPEF marginale", "type": "select" as const, "options": [ { "value": 0.23, "label": "23% (fino a 28.000€)" }, { "value": 0.35, "label": "35% (da 28.001€ a 50.000€)" }, { "value": 0.43, "label": "43% (oltre 50.000€)" } ], "condition": "is_armonizzato == false", "tooltip": "Seleziona l'aliquota IRPEF più alta a cui è soggetto il tuo reddito. Questa si applica solo ai proventi degli ETF non armonizzati." },
    { "id": "imposte_estere", "label": "Imposte già pagate all'estero", "type": "number" as const, "unit": "€", "min": 0, "step": 10, "condition": "is_armonizzato == false", "tooltip": "Solo per ETF non armonizzati: inserisci l'importo delle tasse già pagate nel paese di domicilio del fondo. Questo genera un credito d'imposta in Italia." }
  ],
  "outputs": [ { "id": "plusvalenza", "label": "Plusvalenza / Provento Lordo", "unit": "€" }, { "id": "imposta_dovuta", "label": "Imposta Totale Dovuta", "unit": "€" }, { "id": "netto_realizzato", "label": "Netto Realizzato (dopo le imposte)", "unit": "€" } ],
  "content": "### **Guida Definitiva alla Tassazione degli ETF in Italia**\n\n**Analisi Comparata del Regime Fiscale per Fondi Armonizzati (UCITS) e Non Armonizzati**\n\nComprendere la fiscalità degli Exchange-Traded Fund (ETF) è un pilastro fondamentale per ogni investitore consapevole. La distinzione più critica, con impatti radicali sul carico fiscale, è quella tra ETF **armonizzati (UCITS)** e **non armonizzati**. Questo calcolatore è progettato per simulare entrambi gli scenari, ma la guida che segue mira a chiarire ogni dubbio, superando le informazioni frammentarie e fornendo un quadro E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) completo.\n\n### **Parte 1: La Distinzione Chiave - Armonizzato vs. Non Armonizzato**\n\nUn ETF si definisce **armonizzato** quando è conforme alla direttiva europea **UCITS** (\"Undertakings for Collective Investment in Transferable Securities\"). Questa conformità garantisce standard rigorosi in termini di diversificazione, liquidità, gestione del rischio e trasparenza, a tutela degli investitori retail.\n\n* **ETF Armonizzati (UCITS)**: Sono domiciliati in Unione Europea (spesso Lussemburgo o Irlanda) e sono gli unici che possono essere offerti al pubblico retail in Italia. Godono di un regime fiscale agevolato e semplificato.\n* **ETF Non Armonizzati (Non-UCITS)**: Sono fondi domiciliati al di fuori dell'UE (es. Stati Uniti, Svizzera). Non possono essere sollecitati al pubblico in Italia e sono tipicamente accessibili solo a investitori professionali o tramite broker esteri. La loro fiscalità è notevolmente più complessa e spesso più onerosa.\n\n### **Parte 2: Tassazione degli ETF Armonizzati (UCITS)**\n\nIl regime fiscale per gli ETF armonizzati è relativamente semplice e si basa su un'imposta sostitutiva.\n\n#### **Tassazione dei Redditi di Capitale (Dividendi)**\nSe l'ETF è a distribuzione, i dividendi percepiti sono tassati con un'**imposta sostitutiva del 26%** applicata direttamente dall'intermediario finanziario (regime amministrato).\n\n#### **Tassazione dei Redditi Diversi (Capital Gain)**\nLa plusvalenza (capital gain), ovvero la differenza positiva tra il prezzo di vendita e il prezzo di acquisto (PMR), è soggetta a un'**imposta sostitutiva del 26%**.\n\n**Formula Semplificata (Capital Gain)**:\n`Imposta = (Controvalore di Vendita - Costo di Acquisto) * 0.26`\n\n**Vantaggi del Regime Armonizzato**:\n* **Semplicità**: L'imposta è trattenuta alla fonte dall'intermediario (banca o broker) che agisce come sostituto d'imposta.\n* **Certezza dell'Aliquota**: L'aliquota è fissa al 26% e non dipende dal reddito complessivo dell'investitore.\n* **Nessun Cumulo**: I proventi non si sommano al reddito imponibile IRPEF.\n\n### **Parte 3: Tassazione degli ETF Non Armonizzati - Il Regime Complesso**\n\nLa fiscalità degli ETF non armonizzati è radicalmente diversa e si basa sul principio della **tassazione ordinaria IRPEF**.\n\n#### **Come si Calcola l'Imponibile**\nIl provento derivante da un ETF non armonizzato è calcolato come la **differenza tra il valore di realizzo e il costo di acquisto**. Questo provento, a differenza del regime armonizzato, **concorre interamente alla formazione del reddito complessivo del contribuente**.\n\nQuesto significa che la plusvalenza non è tassata al 26%, ma viene sommata agli altri redditi (da lavoro, da affitti, ecc.) e tassata secondo gli scaglioni di reddito IRPEF (dal 23% al 43%).\n\n**Formula di Calcolo Tassazione Non Armonizzata**:\n1.  **Calcolo del Provento**: `Provento = Valore di Realizzo - Costo di Acquisto`\n2.  **Aumento Base Imponibile IRPEF**: `Nuovo Reddito Lordo = Reddito Lordo Precedente + Provento`\n3.  **Calcolo Imposta**: L'imposta finale è calcolata applicando le aliquote IRPEF al `Nuovo Reddito Lordo`.\n\n#### **Il Problema della Doppia Imposizione e il Credito d'Imposta**\nPoiché l'ETF è domiciliato all'estero, è probabile che le imposte siano già state pagate nel paese di origine (es. una ritenuta sui dividendi o sulle plusvalenze). Per evitare una doppia tassazione, la normativa italiana prevede un **credito d'imposta**.\n\n* L'investitore può detrarre dalle imposte IRPEF dovute in Italia le imposte pagate all'estero a titolo definitivo.\n* **Attenzione**: Il credito d'imposta non può mai superare la quota di imposta italiana riferibile a quel reddito estero. Ad esempio, se in Italia si deve pagare 1.500€ di IRPEF sul provento e all'estero si sono pagati 2.000€, il credito massimo utilizzabile sarà di 1.500€.\n\n#### **Obblighi Dichiarativi: Quadro RW e Regime Dichiarativo**\nI proventi e il possesso di ETF non armonizzati devono essere gestiti in **regime dichiarativo**. Questo comporta:\n\n* **Quadro RT**: I proventi (plusvalenze) devono essere indicati nel Quadro RT del Modello Redditi Persone Fisiche.\n* **Quadro RM**: I dividendi percepiti vanno indicati nel Quadro RM.\n* **Quadro RW**: È obbligatorio compilare il quadro RW per il monitoraggio fiscale delle attività finanziarie detenute all'estero. La mancata compilazione comporta sanzioni severe.\n\n### **Tabella Comparativa Riepilogativa**\n\n| Caratteristica | ETF Armonizzato (UCITS) | ETF Non Armonizzato (Non-UCITS) |\n| :--- | :--- | :--- |\n| **Base Imponibile** | Solo la plusvalenza (guadagno). | La plusvalenza concorre al reddito totale. |\n| **Aliquota Fiscale** | **26% fissa** (imposta sostitutiva). | **Aliquota marginale IRPEF** (23% - 43%). |\n| **Regime Fiscale** | Amministrato (gestito dalla banca). | Dichiarativo (a carico dell'investitore). |\n| **Obblighi** | Nessuno per l'investitore (in regime amministrato). | Compilazione Modello Redditi (RT, RM, RW). |\n| **Credito d'Imposta** | Non applicabile. | Disponibile per imposte pagate all'estero. |\n\n### **Conclusione: Quale Scegliere?**\n\nPer l'investitore retail italiano, la scelta è quasi obbligata: gli **ETF armonizzati UCITS** offrono un percorso fiscale infinitamente più semplice, prevedibile e, nella maggior parte dei casi, economicamente più vantaggioso. L'investimento in ETF non armonizzati introduce complessità dichiarative e un potenziale carico fiscale molto più elevato, specialmente per i redditi medio-alti, rendendolo un'opzione da considerare solo per investitori esperti con specifiche esigenze strategiche e adeguata consulenza fiscale.\n"
};

const TassazioneEtfArmonizzatiNonCalculator: React.FC = () => {
    const { slug, title, inputs, outputs, content } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);
    
    const initialStates = {
        costo_acquisto: 10000,
        valore_realizzo: 15000,
        is_armonizzato: true,
        aliquota_irpef: 0.35,
        imposte_estere: 0,
    };
    const [states, setStates] = useState<{[key: string]: any}>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({...prev, [id]: value}));
    };

    const handleReset = () => {
        setStates(initialStates);
    };
    
    const calculatedOutputs = useMemo(() => {
        const { costo_acquisto, valore_realizzo, is_armonizzato, aliquota_irpef, imposte_estere } = states;

        const plusvalenza_lorda = Math.max(0, valore_realizzo - costo_acquisto);
        
        // Calcolo per ETF Armonizzato
        const imposta_armonizzato = plusvalenza_lorda * 0.26;

        // Calcolo per ETF Non Armonizzato
        const provento_non_armonizzato = plusvalenza_lorda;
        const irpef_lorda_non_armonizzato = provento_non_armonizzato * aliquota_irpef;
        const credito_imposta = Math.min(irpef_lorda_non_armonizzato, imposte_estere);
        const imposta_netta_non_armonizzato = irpef_lorda_non_armonizzato - credito_imposta;

        const imposta_dovuta = is_armonizzato ? imposta_armonizzato : imposta_netta_non_armonizzato;
        const netto_realizzato = valore_realizzo - imposta_dovuta;

        return {
            plusvalenza: plusvalenza_lorda,
            imposta_dovuta,
            netto_realizzato
        };
    }, [states]);

    const comparisonChartData = useMemo(() => {
        const { costo_acquisto, valore_realizzo, aliquota_irpef, imposte_estere } = states;
        const plusvalenza_lorda = Math.max(0, valore_realizzo - costo_acquisto);
        
        const imposta_armonizzato = plusvalenza_lorda * 0.26;

        const irpef_lorda_non_armonizzato = plusvalenza_lorda * aliquota_irpef;
        const credito_imposta = Math.min(irpef_lorda_non_armonizzato, imposte_estere);
        const imposta_netta_non_armonizzato = irpef_lorda_non_armonizzato - credito_imposta;
        
        return [
            { name: 'Plusvalenza', value: plusvalenza_lorda },
            { name: 'Imposta Armonizzato', value: imposta_armonizzato },
            { name: 'Imposta Non Armonizzato', value: imposta_netta_non_armonizzato },
        ];
    }, [states]);
    
    const formulaUsata = states.is_armonizzato 
        ? "Imposta = MAX(0, Valore Realizzo - Costo Acquisto) * 26%"
        : "Imposta = (MAX(0, Valore Realizzo - Costo Acquisto) * Aliquota IRPEF) - Credito Imposta Estera";

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
        } catch (_e) { alert("Funzione PDF non disponibile in questo ambiente."); }
    }, [slug]);

    const salvaRisultato = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
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
                    <div ref={calculatorRef} className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
                        <p className="text-gray-600 mb-4">{meta.description}</p>
                        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo puramente informativo e non sostituisce in alcun modo una consulenza fiscale professionale. I calcoli si basano sulla normativa vigente e potrebbero non tenere conto di tutte le variabili individuali.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                            {inputs.map(input => {
                                const conditionMet = !input.condition || (input.condition.includes('== false') && !states[input.condition.split(' ')[0]]);
                                if (!conditionMet) return null;

                                const inputLabel = (
                                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                                        {input.label}
                                        {input.tooltip && <Tooltip text={input.tooltip}><span className="ml-2"><InfoIcon /></span></Tooltip>}
                                    </label>
                                );
                                
                                if (input.type === 'boolean') {
                                    return (
                                        <div key={input.id} className="md:col-span-2 flex items-center gap-3 p-3 rounded-md bg-white border shadow-sm">
                                            <input id={input.id} type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.checked)} />
                                            {inputLabel}
                                        </div>
                                    );
                                }
                                
                                 if (input.type === 'select') {
                                    return (
                                      <div key={input.id}>
                                        {inputLabel}
                                        <select id={input.id} value={states[input.id]} onChange={(e) => handleStateChange(input.id, parseFloat(e.target.value))} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2">
                                          {input.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
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
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">Risultati della Simulazione</h2>
                            {outputs.map(output => (
                                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'imposta_dovuta' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold ${output.id === 'imposta_dovuta' ? 'text-indigo-600' : 'text-gray-800'}`}>
                                        <span>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Confronto Visivo della Tassazione</h3>
                            <div className="h-72 w-full bg-gray-50 p-4 rounded-lg">
                                {isClient && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={comparisonChartData} layout="vertical" margin={{ top: 5, right: 20, left: 50, bottom: 5 }}>
                                            <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                                            <YAxis type="category" dataKey="name" width={120} />
                                            <ChartTooltip formatter={(value: number) => formatCurrency(value)} cursor={{ fill: 'rgba(230, 230, 230, 0.5)' }}/>
                                            <Bar dataKey="value" name="Valore">
                                                {comparisonChartData.map((entry, index) => (
                                                    // 2. Sostituito <Bar> con <Cell> per la colorazione individuale
                                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#6366f1' : index === 1 ? '#a5b4fc' : '#ef4444'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 border rounded-lg shadow-sm p-4 bg-gray-50">
                            <h3 className="font-semibold text-gray-700">Formula di Calcolo Utilizzata</h3>
                            <p className="text-xs text-gray-600 mt-2 p-3 bg-white rounded font-mono break-words">{formulaUsata}</p>
                        </div>
                    </div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={salvaRisultato} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta PDF</button>
                            <button onClick={handleReset} className="col-span-2 text-sm w-full border border-red-300 bg-red-50 rounded-md px-3 py-2 hover:bg-red-100 text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Guida alla Tassazione ETF</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-md">
                        <h2 className="font-semibold mb-2 text-gray-800">Fonti e Riferimenti Normativi</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/pagamenti/imposta-sostitutiva-redditi-capitale/scheda-informativa-imposta-sostitutiva-redditi-capitale" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Agenzia delle Entrate - Imposta Sostitutiva</a></li>
                            <li><a href="https://www.tesoro.it/static/it/doc/capitolo_iv_la_tassazione_dei_redditi_di_natura_finanziaria.pdf" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Dipartimento del Tesoro - Tassazione Redditi Finanziari</a></li>
                            <li><a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.del.presidente.della.repubblica:1986-12-22;917!vig=" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">TUIR (Testo Unico delle Imposte sui Redditi)</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default TassazioneEtfArmonizzatiNonCalculator;