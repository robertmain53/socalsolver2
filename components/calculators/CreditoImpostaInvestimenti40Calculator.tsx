'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

// --- Type Definitions for our data structure ---
type Input = {
  id: string;
  label: string;
  type: 'number' | 'select' | 'boolean';
  unit?: string;
  min?: number;
  step?: number;
  options?: readonly { value: string; label: string }[]; // 'readonly' is good practice with 'as const'
  tooltip: string;
};

type Output = {
  id: string;
  label: string;
  unit: string;
};

// --- Helper Components ---
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600 transition-colors">
    <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

const SchemaInjector = ({ schemaData }: { schemaData: object }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
  />
);

const ContentRenderer = ({ content }: { content: string }) => {
  const processInlineFormatting = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>');
  };

  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {content.split('\n\n').map((block, index) => {
        const trimmedBlock = block.trim();
        if (trimmedBlock.startsWith('### **')) {
          return <h3 key={index} className="text-xl font-bold mt-6 mb-4 text-gray-800" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
        }
        if (trimmedBlock.startsWith('#### **')) {
          return <h4 key={index} className="text-lg font-semibold mt-4 mb-3 text-gray-800" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
        }
        if (trimmedBlock.startsWith('* ')) {
          return (
            <ul key={index} className="list-disc pl-5 space-y-2 mb-4">
              {trimmedBlock.split('\n').map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item.replace(/^\* /, '')) }} />
              ))}
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

// --- Dynamic Loading for Chart Component ---
const DynamicBarChart = dynamic(() => import('recharts').then(mod => {
    const { BarChart, Bar, XAxis, YAxis, Tooltip: ChartTooltip, ResponsiveContainer, Legend } = mod;
    
    // Create a wrapper component to satisfy JSX return type
    const ChartComponent = (props: any) => (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={props.data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(value) => `€${Number(value) / 1000}k`} tick={{ fontSize: 12 }} />
                <ChartTooltip
                    formatter={(value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value)}
                    cursor={{ fill: 'rgba(238, 242, 255, 0.5)' }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="Costo Investimento" fill="#8884d8" name="Costo Totale" />
                <Bar dataKey="Credito Imposta" fill="#82ca9d" name="Credito d'Imposta" />
            </BarChart>
        </ResponsiveContainer>
    );
    return ChartComponent;
}), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full text-gray-500">Caricamento grafico...</div>,
});


// --- Configuration Data ---
const calculatorData = { "slug": "credito-imposta-investimenti-40", "category": "PMI e Impresa", "title": "Calcolatore Credito d'Imposta per Investimenti 4.0", "lang": "it", "tags": "credito imposta 4.0, transizione 4.0, calcolatore agevolazioni, incentivi imprese, beni strumentali, pmi, industria 4.0, credito d'imposta 2024, credito d'imposta 2025", "inputs": [ { "id": "costo_investimento", "label": "Costo Totale dell'Investimento", "type": "number", "unit": "€", "min": 0, "step": 1000, "tooltip": "Inserisci il costo totale di acquisizione del bene o dei beni, al netto dell'IVA." }, { "id": "tipo_bene", "label": "Tipologia del Bene", "type": "select", "options": [ { "value": "materiale", "label": "Bene Materiale 4.0 (Allegato A)" }, { "value": "immateriale", "label": "Bene Immateriale 4.0 (Allegato B)" } ], "tooltip": "Seleziona se l'investimento riguarda un bene fisico (es. macchinario) o un bene intangibile (es. software)." }, { "id": "anno_investimento", "label": "Anno dell'Investimento", "type": "select", "options": [ { "value": "2024", "label": "2024" }, { "value": "2025", "label": "2025" } ], "tooltip": "Seleziona l'anno in cui l'investimento viene effettuato (o la prenotazione viene accettata con acconto del 20%). Le aliquote cambiano in base all'anno." } ], "outputs": [ { "id": "credito_imposta_totale", "label": "Credito d'Imposta Totale", "unit": "€" }, { "id": "costo_netto_investimento", "label": "Costo Netto dell'Investimento", "unit": "€" }, { "id": "percentuale_agevolazione", "label": "Aliquota Media Effettiva", "unit": "%" } ], "content": "### **Guida Definitiva al Credito d'Imposta per Investimenti 4.0\n\n**Analisi, Calcolo e Novità della Transizione 4.0**\n\nIl Credito d'Imposta per Investimenti in Beni Strumentali Nuovi, noto come \"Piano Transizione 4.0\", è la principale misura di sostegno alle imprese italiane che desiderano innovare i propri processi produttivi attraverso la digitalizzazione e l'automazione. Questo strumento mira a stimolare la competitività del sistema produttivo nazionale, incentivando l'acquisto di tecnologie avanzate.\n\nQuesta guida offre un'analisi completa della misura, spiega in dettaglio i criteri di calcolo e fornisce un quadro normativo chiaro, fungendo da risorsa autorevole per imprenditori, manager e consulenti. **Nota bene: questo calcolatore fornisce una stima accurata basata sulla normativa vigente, ma non sostituisce una consulenza fiscale o una valutazione tecnica (perizia) necessarie per accedere al beneficio.**\n\n### **Parte 1: Il Calcolatore - Come Funziona e Cosa Calcola**\n\nIl nostro calcolatore è progettato per fornire una stima immediata e precisa del credito d'imposta maturato, basandosi sui parametri fondamentali definiti dalla normativa.\n\nI parametri chiave per il calcolo sono:\n\n* **Costo dell'Investimento**: L'importo totale sostenuto per l'acquisto del bene, al netto dell'IVA.\n* **Tipologia del Bene**: La normativa distingue due macro-categorie con aliquote e massimali differenti:\n    * **Beni Materiali 4.0**: Macchinari, robot, stampanti 3D, ecc. elencati nell'**Allegato A** della Legge n. 232/2016.\n    * **Beni Immateriali 4.0**: Software, sistemi IT, piattaforme cloud, ecc. elencati nell'**Allegato B** della Legge n. 232/2016.\n* **Anno dell'Investimento**: Le aliquote del credito d'imposta sono state rimodulate nel tempo. Selezionare l'anno corretto è fondamentale per un calcolo preciso.\n\n#### **Interpretazione dei Risultati**\n\n* **Credito d'Imposta Totale**: È l'importo totale dell'agevolazione che l'impresa matura. Questo credito può essere utilizzato in compensazione tramite modello F24 per pagare altre imposte e contributi.\n* **Costo Netto dell'Investimento**: Rappresenta il costo effettivo del bene per l'azienda, una volta sottratto il beneficio fiscale. È un indicatore chiave del ROI (Return on Investment).\n* **Aliquota Media Effettiva**: Mostra in percentuale l'impatto reale dell'agevolazione sul costo totale. Utile per confrontare la convenienza di investimenti di diversa entità.\n\n### **Parte 2: Approfondimento sulla Normativa**\n\n#### **Soggetti Beneficiari**\n\nTutte le imprese residenti nel territorio dello Stato, indipendentemente dalla forma giuridica, dal settore economico di appartenenza, dalla dimensione e dal regime fiscale di determinazione del reddito, possono accedere al credito d'imposta.\n\nSono escluse le imprese in stato di liquidazione volontaria, fallimento, o altre procedure concorsuali e le imprese destinatarie di sanzioni interdittive.\n\n#### **La Logica di Calcolo a Scaglioni (Beni Materiali)**\n\nPer i beni materiali, il calcolo del credito non è una semplice percentuale sul totale, ma segue un meccanismo \"a scaglioni\" progressivi. Questo significa che diverse aliquote si applicano a diverse porzioni del costo.\n\nPer gli investimenti effettuati nel **2023, 2024 e 2025**, le aliquote sono:\n\n* **20%** sulla quota di investimenti **fino a 2,5 milioni di euro**.\n* **10%** sulla quota di investimenti **tra 2,5 e 10 milioni di euro**.\n* **5%** sulla quota di investimenti **tra 10 e 20 milioni di euro**.\n\nNessun credito è previsto per la parte di investimento che supera i 20 milioni di euro.\n\n#### **Beni Immateriali: Aliquote e Massimali**\n\nPer i beni immateriali (software 4.0), il calcolo è più semplice, con un'aliquota unica applicata fino a un massimale di spesa.\n\n* Investimenti nel **2024**: aliquota del **15%** nel limite massimo di costi ammissibili pari a 1 milione di euro.\n* Investimenti nel **2025**: aliquota del **10%** nel limite massimo di costi ammissibili pari a 1 milione di euro.\n\n#### **Come e Quando si Utilizza il Credito**\n\nIl credito d'imposta è utilizzabile esclusivamente in **compensazione** tramite modello F24 (codice tributo 6936), in **tre quote annuali** di pari importo, a decorrere dall'anno di avvenuta interconnessione del bene al sistema aziendale.\n\n### **Parte 3: Adempimenti e Futuro (Transizione 5.0)**\n\n#### **Adempimenti Documentali**\n\nPer beneficiare del credito, le imprese devono conservare una serie di documenti, tra cui:\n\n1.  **Fatture e documenti di trasporto** con il riferimento esplicito alla normativa (es. \"Bene agevolabile ai sensi dell'art. 1, commi 1051-1063, Legge 178/2020\").\n2.  Una **perizia tecnica giurata** (o un attestato di conformità) che certifichi le caratteristiche 4.0 del bene e la sua interconnessione. Per beni di costo inferiore a 300.000 €, è sufficiente una dichiarazione sostitutiva del legale rappresentante.\n3.  Una **comunicazione al Ministero delle Imprese e del Made in Italy (MIMIT)**.\n\n#### **Verso la Transizione 5.0**\n\nÈ importante notare che il Governo ha introdotto il nuovo piano **\"Transizione 5.0\"** (D.L. 19/2024), che affianca e potenzia il piano 4.0 per il biennio 2024-2025. Questo nuovo piano è specificamente rivolto a progetti di innovazione che generano anche un **risparmio energetico**. Le aliquote sono significativamente più alte ma subordinate al raggiungimento di precisi target di efficienza energetica.\n\nQuesto calcolatore si focalizza sulla misura \"Transizione 4.0\", che rimane pienamente in vigore e accessibile per tutti gli investimenti idonei, a prescindere dal risparmio energetico generato.", "seoSchema": { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [ { "@type": "Question", "name": "Cos'è il Credito d'Imposta per Investimenti 4.0?", "acceptedAnswer": { "@type": "Answer", "text": "È un'agevolazione fiscale per le imprese che investono in beni strumentali nuovi, tecnologicamente avanzati e interconnessi, finalizzati alla trasformazione digitale dei processi produttivi. Il beneficio consiste in un credito d'imposta utilizzabile in compensazione." } }, { "@type": "Question", "name": "Come si calcola il credito per un bene materiale da 3 milioni di euro nel 2024?", "acceptedAnswer": { "@type": "Answer", "text": "Il calcolo è a scaglioni: si applica il 20% sui primi 2,5 milioni di euro (pari a 500.000 €) e il 10% sui restanti 500.000 euro (pari a 50.000 €). Il credito totale è di 550.000 €." } }, { "@type": "Question", "name": "Cosa significa 'bene interconnesso'?", "acceptedAnswer": { "@type": "Answer", "text": "Un bene è interconnesso quando scambia informazioni con sistemi interni (es. gestionali, pianificazione) o esterni (es. clienti, fornitori) tramite un collegamento basato su protocolli standard. L'interconnessione è un requisito fondamentale per accedere al beneficio." } }, { "@type": "Question", "name": "Il credito d'imposta 4.0 e 5.0 sono cumulabili?", "acceptedAnswer": { "@type": "Answer", "text": "No, per gli stessi costi di investimento non è possibile cumulare il Credito d'Imposta 4.0 con il nuovo Credito d'Imposta 5.0, che è specifico per progetti di transizione digitale ed energetica." } } ] } } as const; // <-- FIX APPLIED HERE

// --- Main Component ---
const CreditoImpostaInvestimenti40Calculator: React.FC = () => {
    const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => { setIsClient(true); }, []);

    const initialStates = {
        costo_investimento: 250000,
        tipo_bene: 'materiale',
        anno_investimento: '2024'
    };
    
    const [states, setStates] = useState<{[key: string]: any}>(initialStates);

    const handleStateChange = (id: string, value: any) => {
        setStates(prev => ({...prev, [id]: value}));
    };
    
    const handleReset = useCallback(() => setStates(initialStates), [initialStates]);

    const calculatedOutputs = useMemo(() => {
        const { costo_investimento, tipo_bene, anno_investimento } = states;

        let credito_imposta_totale = 0;

        if (tipo_bene === 'materiale') {
            const aliquote = [0.20, 0.10, 0.05]; // Rates for 2023-2025 are the same
            const scaglione1 = Math.min(costo_investimento, 2500000);
            const scaglione2 = Math.max(0, Math.min(costo_investimento, 10000000) - 2500000);
            const scaglione3 = Math.max(0, Math.min(costo_investimento, 20000000) - 10000000);
            credito_imposta_totale = (scaglione1 * aliquote[0]) + (scaglione2 * aliquote[1]) + (scaglione3 * aliquote[2]);
        } else if (tipo_bene === 'immateriale') {
            const aliquote_immateriali: {[key: string]: number} = { '2024': 0.15, '2025': 0.10 };
            const aliquota = aliquote_immateriali[anno_investimento] || 0;
            credito_imposta_totale = Math.min(costo_investimento, 1000000) * aliquota;
        }

        const costo_netto_investimento = costo_investimento - credito_imposta_totale;
        const percentuale_agevolazione = costo_investimento > 0 ? (credito_imposta_totale / costo_investimento) * 100 : 0;
        
        return {
            credito_imposta_totale,
            costo_netto_investimento,
            percentuale_agevolazione,
        };
    }, [states]);
    
    const chartData = [
        { name: 'Risultato', "Costo Investimento": states.costo_investimento, "Credito Imposta": calculatedOutputs.credito_imposta_totale }
    ];

    const formulaUsata = useMemo(() => {
        if (states.tipo_bene === 'materiale') {
            return `Credito = (MIN(Costo, 2.5M) * 20%) + (MAX(0, MIN(Costo, 10M) - 2.5M) * 10%) + (MAX(0, MIN(Costo, 20M) - 10M) * 5%)`;
        }
        const aliquota = states.anno_investimento === '2024' ? 15 : 10;
        return `Credito = MIN(Costo, 1M) * ${aliquota}%`;
    }, [states.tipo_bene, states.anno_investimento]);

    const handleExportPDF = useCallback(async () => {
        try {
            const html2canvas = (await import('html2canvas')).default;
            const jsPDF = (await import('jspdf')).default;
            if (!calculatorRef.current) return;
            
            const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            const imgHeight = pdfWidth / ratio;
            
            let heightLeft = imgHeight;
            let position = 0;
            
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;
            
            while (heightLeft >= 0) {
              position = heightLeft - imgHeight;
              pdf.addPage();
              pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
              heightLeft -= pdfHeight;
            }
            pdf.save(`${slug}.pdf`);

        } catch (e) {
            console.error(e);
            alert("Errore durante l'esportazione in PDF.");
        }
    }, [slug]);

    const handleSaveResult = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
            const history = JSON.parse(localStorage.getItem("calc_history") || "[]");
            const newHistory = [payload, ...history].slice(0, 10); // Keep last 10 results
            localStorage.setItem("calc_history", JSON.stringify(newHistory));
            alert("Risultato salvato nello storico del browser!");
        } catch {
            alert("Impossibile salvare il risultato.");
        }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
    const formatPercentage = (value: number) => `${value.toFixed(2)}%`;

    const renderInput = (input: Input) => {
        const inputLabel = (
            <label className="block text-sm font-medium mb-2 text-gray-700 flex items-center" htmlFor={input.id}>
                {input.label}
                <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>
            </label>
        );

        if (input.type === 'select') {
            return (
                <div key={input.id}>
                    {inputLabel}
                    <select
                        id={input.id}
                        value={states[input.id]}
                        onChange={(e) => handleStateChange(input.id, e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 bg-white"
                    >
                        {input.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
            );
        }
        
        // Default to number input
        return (
            <div key={input.id}>
                {inputLabel}
                <div className="relative">
                    <input
                        id={input.id}
                        type="number"
                        min={input.min}
                        step={input.step}
                        value={states[input.id]}
                        onChange={(e) => handleStateChange(input.id, e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 pr-12"
                    />
                    {input.unit && <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-sm text-gray-500">{input.unit}</span>}
                </div>
            </div>
        );
    };

    return (
        <>
            <SchemaInjector schemaData={seoSchema} />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
                {/* Main Content: Calculator */}
                <main className="lg:col-span-3">
                    <div ref={calculatorRef} className="bg-white rounded-lg shadow-lg p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">{title}</h1>
                        <p className="text-gray-600 mb-6">Calcola il beneficio fiscale per i tuoi investimenti in beni strumentali tecnologicamente avanzati.</p>

                        <div className="text-xs text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-6">
                            <strong>Disclaimer:</strong> Questo strumento offre una simulazione a scopo informativo e non sostituisce una consulenza professionale. L'accesso al beneficio è subordinato a requisiti tecnici e adempimenti specifici.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 p-4 rounded-lg bg-slate-50 border">
                            {inputs.map(renderInput)}
                        </div>

                        <div className="mt-8 space-y-4">
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">Risultati del Calcolo</h2>
                            {outputs.map(output => (
                                <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-4 rounded-r-lg ${output.id === 'credito_imposta_totale' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                                    <div className="text-sm md:text-base font-medium text-gray-700">{output.label}</div>
                                    <div className={`text-xl md:text-2xl font-bold ${output.id === 'credito_imposta_totale' ? 'text-indigo-600' : 'text-gray-900'}`}>
                                        {isClient ? (output.unit === '€' ? formatCurrency((calculatedOutputs as any)[output.id]) : formatPercentage((calculatedOutputs as any)[output.id])) : '...'}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Visualizzazione Grafica</h3>
                            <div className="h-64 w-full bg-gray-50 p-2 rounded-lg border">
                                {isClient && <DynamicBarChart data={chartData} />}
                            </div>
                        </div>
                    </div>
                     <div className="mt-6 border rounded-lg shadow-lg p-4 bg-white">
                        <h3 className="font-semibold text-gray-800">Formula di Calcolo Utilizzata</h3>
                        <p className="text-xs text-gray-600 mt-2 p-3 bg-gray-100 rounded font-mono break-words">{formulaUsata}</p>
                    </div>
                </main>

                {/* Sidebar */}
                <aside className="lg:col-span-2 space-y-6">
                    <section className="border rounded-lg p-4 bg-white shadow-lg">
                        <h2 className="text-lg font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
                            <button onClick={handleSaveResult} className="w-full text-sm font-medium border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
                            <button onClick={handleExportPDF} className="w-full text-sm font-medium border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta PDF</button>
                            <button onClick={handleReset} className="w-full text-sm font-medium border border-red-300 text-red-700 rounded-md px-3 py-2 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolo</button>
                        </div>
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-lg">
                        <h2 className="text-lg font-semibold mb-2 text-gray-800">Guida e Approfondimenti</h2>
                        <ContentRenderer content={content} />
                    </section>
                    <section className="border rounded-lg p-4 bg-white shadow-lg">
                        <h2 className="text-lg font-semibold mb-2 text-gray-800">Fonti e Riferimenti Normativi</h2>
                        <ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2">
                            <li><a href="https://www.mimit.gov.it/it/incentivi/transizione-4-0" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Pagina Ufficiale Transizione 4.0 - MIMIT</a></li>
                            <li><a href="https://www.gazzettaufficiale.it/eli/id/2020/12/30/20G00202/sg" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Legge di Bilancio 2021 (L. 178/2020)</a></li>
                            <li><a href="https://www.agenziaentrate.gov.it/portale/web/guest/schede/agevolazioni/credito-di-imposta-per-gli-investimenti-in-beni-strumentali-nuovi/scheda-informativa-credito-investimenti-beni-strumentali-nuovi" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Scheda Informativa - Agenzia delle Entrate</a></li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
};

export default CreditoImpostaInvestimenti40Calculator;