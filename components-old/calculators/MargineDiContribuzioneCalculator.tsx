'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import dynamic from 'next/dynamic';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ChartTooltip, Legend } from 'recharts';

// --- DATI DI CONFIGURAZIONE (inclusi nel componente) ---
const calculatorData = {
  "slug": "margine-di-contribuzione",
  "category": "PMI e Impresa",
  "title": "Calcolatore Margine di Contribuzione",
  "lang": "it",
  "inputs": [
    { "id": "ricavi_totali", "label": "Ricavi Totali di Vendita", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "Il fatturato totale generato dalla vendita dei prodotti o servizi in un determinato periodo, al netto di IVA." },
    { "id": "costi_variabili_totali", "label": "Costi Variabili Totali", "type": "number" as const, "unit": "€", "min": 0, "step": 100, "tooltip": "La somma di tutti i costi che variano in proporzione diretta al volume di produzione o vendita (es. materie prime, commissioni, costi di spedizione)." },
    { "id": "unita_vendute", "label": "Numero di Unità Vendute", "type": "number" as const, "unit": "unità", "min": 1, "step": 1, "tooltip": "La quantità totale di prodotti o servizi venduti nel periodo di riferimento. Questo dato permette di calcolare i valori unitari." }
  ],
  "outputs": [
    { "id": "mdc_totale", "label": "Margine di Contribuzione Totale", "unit": "€" },
    { "id": "mdc_percentuale", "label": "Margine di Contribuzione (%)", "unit": "%" },
    { "id": "prezzo_unitario", "label": "Prezzo di Vendita Unitario", "unit": "€" },
    { "id": "costo_variabile_unitario", "label": "Costo Variabile Unitario", "unit": "€" },
    { "id": "mdc_unitario", "label": "Margine di Contribuzione Unitario", "unit": "€" }
  ],
  "content": "### **Guida Strategica al Margine di Contribuzione (MdC)**\n\n**Cos'è, Come si Calcola e Perché è l'Indicatore Chiave per la Redditività Aziendale**\n\nIl **Margine di Contribuzione (MdC)** è uno degli indicatori più potenti nel controllo di gestione. Misura la capacità di un prodotto, di una linea di prodotti o dell'intera azienda di generare risorse finanziarie per coprire i costi fissi e, una volta coperti, di generare profitto. In parole semplici, ci dice **quanta parte del ricavato di una vendita contribuisce realmente alla salute finanziaria dell'azienda**, dopo aver sostenuto i costi direttamente legati a quella vendita.\n\nComprenderlo e calcolarlo non è un mero esercizio contabile, ma un'attività strategica fondamentale per prendere decisioni informate su prezzi, produzione e strategie commerciali.\n\n### **Parte 1: Il Calcolatore - Dati e Logica di Funzionamento**\n\nIl nostro strumento permette di calcolare il margine di contribuzione sia a livello totale che unitario, fornendo una visione completa della performance.\n\n* **Ricavi Totali di Vendita**: Il fatturato complessivo generato dalle vendite in un certo periodo.\n* **Costi Variabili Totali**: Tutti i costi che aumentano o diminuiscono in relazione diretta al numero di unità prodotte e vendute.\n* **Numero di Unità Vendute**: La quantità fisica di prodotti o servizi venduti.\n\n#### **Il Concetto Fondamentale: Costi Fissi vs. Costi Variabili**\n\nLa distinzione tra queste due categorie di costi è il pilastro su cui si regge l'analisi del margine di contribuzione.\n\n* **Costi Variabili**: Sono i costi 'vivi' del prodotto. Esistono solo se il prodotto viene creato e venduto. Esempi tipici sono: materie prime, manodopera diretta di produzione, commissioni di vendita, costi di imballaggio e spedizione.\n* **Costi Fissi**: Sono i costi di 'struttura' che l'azienda sostiene indipendentemente dal volume di produzione. Anche se l'azienda produce zero, questi costi esistono. Esempi: affitto dei locali, stipendi del personale amministrativo, ammortamenti, assicurazioni, costi di marketing istituzionale.\n\nIl Margine di Contribuzione si focalizza sull'aggredire e coprire questa seconda categoria di costi.\n\n### **Parte 2: Le Formule del Margine di Contribuzione**\n\nEsistono diverse modalità per esprimere il MdC, ognuna con una sua specifica utilità informativa.\n\n1.  **Margine di Contribuzione Totale**: Mostra il valore assoluto generato per coprire i costi fissi. Si calcola come:\n    `MdC Totale = Ricavi Totali - Costi Variabili Totali`\n\n2.  **Margine di Contribuzione Unitario**: Indica quanto contribuisce ogni singola unità venduta. È fondamentale per le decisioni di prezzo. Si calcola come:\n    `MdC Unitario = Prezzo di Vendita Unitario - Costo Variabile Unitario`\n\n3.  **Margine di Contribuzione Percentuale (o Indice di Contribuzione)**: Esprime il margine come percentuale dei ricavi. È utile per confrontare la redditività di prodotti diversi.\n    `MdC % = (MdC Totale / Ricavi Totali) * 100`\n\n### **Parte 3: Perché il MdC è un Alleato Strategico per la Tua Impresa?**\n\nL'analisi del margine di contribuzione è cruciale per rispondere a domande strategiche come:\n\n* **Analisi di Break-Even**: Il MdC è il punto di partenza per calcolare il **Punto di Pareggio (Break-Even Point - BEP)**, ovvero quante unità devi vendere per coprire tutti i costi (fissi e variabili). La formula è:\n    `BEP (in unità) = Costi Fissi Totali / MdC Unitario`\n\n* **Decisioni di Mix di Prodotto**: Aiuta a decidere su quali prodotti puntare. Un prodotto con un MdC più alto è, a parità di altre condizioni, più profittevole e dovrebbe essere spinto maggiormente.\n\n* **Strategie di Prezzo**: Permette di valutare l'impatto di sconti o promozioni. Uno sconto riduce direttamente il MdC unitario: sei sicuro che l'aumento di volume previsto compensi questa riduzione?\n\n* **Valutazione di Nuovi Ordini**: Consente di decidere se accettare un ordine speciale a un prezzo inferiore a quello di listino. Se il prezzo offerto è superiore al costo variabile unitario, l'ordine genererà un margine di contribuzione positivo che aiuterà a coprire i costi fissi.\n\n### **Conclusione: Oltre l'Utile Lordo**\n\nSpesso si confonde il margine di contribuzione con l'utile lordo. La differenza è sostanziale: l'utile lordo sottrae dai ricavi il costo del venduto (COGS), che può contenere anche quote di costi fissi di produzione. Il MdC, invece, isolando **solo i costi variabili**, offre una visione più chiara e immediata della performance economica legata ai volumi di vendita, rendendolo uno strumento insostituibile per il controllo di gestione e la pianificazione strategica.",
  "seoSchema": { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{ "@type": "Question", "name": "Cos'è il margine di contribuzione in parole semplici?", "acceptedAnswer": { "@type": "Answer", "text": "È la quota di ogni euro di ricavo che rimane dopo aver pagato i costi variabili (come le materie prime). Questa quota serve a 'contribuire' alla copertura dei costi fissi (come l'affitto) e, una volta coperti, a generare profitto." } }, { "@type": "Question", "name": "Qual è la differenza tra margine di contribuzione e utile lordo?", "acceptedAnswer": { "@type": "Answer", "text": "L'utile lordo sottrae dai ricavi il costo del venduto (COGS), che può includere anche costi fissi di produzione (es. ammortamento macchinari). Il margine di contribuzione, invece, sottrae solo ed esclusivamente i costi variabili, offrendo un indicatore più preciso per le decisioni basate sui volumi di vendita." } }, { "@type": "Question", "name": "Come si usa il margine di contribuzione per calcolare il punto di pareggio (Break-Even Point)?", "acceptedAnswer": { "@type": "Answer", "text": "Il punto di pareggio in unità si calcola dividendo i costi fissi totali per il margine di contribuzione unitario. Il risultato indica il numero esatto di unità che un'azienda deve vendere per non essere né in perdita né in profitto." } }, { "@type": "Question", "name": "Un margine di contribuzione basso è sempre un segnale negativo?", "acceptedAnswer": { "@type": "Answer", "text": "Non necessariamente. Un margine di contribuzione unitario basso può essere compensato da volumi di vendita molto alti (strategia tipica dei beni di largo consumo). L'importante è che il margine di contribuzione totale sia sufficiente a coprire tutti i costi fissi e a garantire un utile soddisfacente." } }] }
};

// --- COMPONENTI DI UTILITÀ ---
const InfoIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>);
const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (<div className="relative flex items-center group">{children}<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">{text}</div></div>);
const SchemaInjector = ({ schema }: { schema: object }) => (<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />);
const ContentRenderer = ({ content }: { content: string }) => {
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>').replace(/`([^`]+)`/g, '<code class=\"text-sm bg-gray-200 text-red-600 rounded px-1 py-0.5\">$1</code>');
    const blocks = content.split('\n\n');
    return (<div className="prose prose-sm max-w-none text-gray-700">{blocks.map((block, index) => {
        const trimmedBlock = block.trim();
        if (trimmedBlock.startsWith('### **')) return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
        if (trimmedBlock.startsWith('#### **')) return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
        if (trimmedBlock.startsWith('*')) {
            const items = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
            return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ul>;
        }
        if (trimmedBlock.match(/^\d\.\s/)) {
          const items = trimmedBlock.split('\n').map(item => item.replace(/^\d\.\s*/, ''));
          return <ol key={index} className="list-decimal pl-5 space-y-2 mb-4">{items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ol>;
        }
        if (trimmedBlock) return <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
        return null;
    })}</div>);
};

// Componente Wrapper per il grafico (Lazy Loading)
const ClientOnlyRevenueChart = ({ data }: { data: { name: string; value: number }[] }) => {
  const COLORS = ['#f97316', '#22c55e'];
  const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} label={p => `${(p.percent * 100).toFixed(0)}%`}>
          {data.map((_entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
        </Pie>
        <ChartTooltip formatter={(value: number) => formatCurrency(value)} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};
const DynamicRevenueChart = dynamic(() => Promise.resolve(ClientOnlyRevenueChart), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-full"><p>Caricamento grafico...</p></div>,
});


// --- NOME DEL COMPONENTE GENERATO DINAMICAMENTE DALLO SLUG ---
const MargineDiContribuzioneCalculator: React.FC = () => {
  const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
  const calcolatoreRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const initialStates = { ricavi_totali: 50000, costi_variabili_totali: 20000, unita_vendute: 1000 };
  const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

  const handleStateChange = (id: string, value: any) => { setStates(prev => ({ ...prev, [id]: value })); };
  const handleReset = () => { setStates(initialStates); };

  const calculatedOutputs = useMemo(() => {
    const { ricavi_totali, costi_variabili_totali, unita_vendute } = states;
    const mdc_totale = ricavi_totali - costi_variabili_totali;
    const mdc_percentuale = ricavi_totali > 0 ? (mdc_totale / ricavi_totali) * 100 : 0;
    const prezzo_unitario = unita_vendute > 0 ? ricavi_totali / unita_vendute : 0;
    const costo_variabile_unitario = unita_vendute > 0 ? costi_variabili_totali / unita_vendute : 0;
    const mdc_unitario = unita_vendute > 0 ? mdc_totale / unita_vendute : 0;
    return { mdc_totale, mdc_percentuale, prezzo_unitario, costo_variabile_unitario, mdc_unitario };
  }, [states]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
  const formatPercentage = (value: number) => `${value.toFixed(2)}%`;
  
  const chartData = useMemo(() => [
    { name: 'Costi Variabili', value: states.costi_variabili_totali },
    { name: 'Margine di Contribuzione', value: calculatedOutputs.mdc_totale },
  ].filter(item => item.value >= 0), [states, calculatedOutputs]);

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
    } catch (_e) { alert("Errore durante l'esportazione in PDF."); }
  }, [slug]);

  const salvaRisultato = useCallback(() => {
    try {
      const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: Date.now() };
      localStorage.setItem("calc_results", JSON.stringify([payload, ...JSON.parse(localStorage.getItem("calc_results") || "[]")].slice(0, 50)));
      alert("Risultato salvato con successo!");
    } catch { alert("Impossibile salvare il risultato."); }
  }, [states, calculatedOutputs, slug, title]);

  return (
    <>
      <SchemaInjector schema={seoSchema} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50 font-sans">
        <main className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6" ref={calcolatoreRef}>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{title}</h1>
            <p className="text-gray-600 mb-4">Analizza la profittabilità dei tuoi prodotti e prendi decisioni strategiche basate sui dati.</p>
            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
              <strong>Disclaimer:</strong> Questo strumento è a scopo informativo. I risultati devono essere validati da un'analisi finanziaria completa e professionale.
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 p-4 rounded-lg bg-slate-50">
              {inputs.map(input => (
                  <div key={input.id}>
                    <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center" htmlFor={input.id}>
                      {input.label}
                      <Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip>
                    </label>
                    <div className="flex items-center gap-2">
                      <input id={input.id} aria-label={input.label} className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" type="number" min={input.min} step={input.step} value={states[input.id]} onChange={(e) => handleStateChange(input.id, e.target.value === "" ? "" : Number(e.target.value))} />
                      {input.unit && <span className="text-sm text-gray-500">{input.unit}</span>}
                    </div>
                  </div>
              ))}
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Risultati dell'Analisi</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200">
                    <div className="text-sm font-medium text-indigo-800">{outputs[0].label}</div>
                    <div className="text-3xl font-bold text-indigo-600">{isClient ? formatCurrency(calculatedOutputs.mdc_totale) : '...'}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200">
                    <div className="text-sm font-medium text-indigo-800">{outputs[1].label}</div>
                    <div className="text-3xl font-bold text-indigo-600">{isClient ? formatPercentage(calculatedOutputs.mdc_percentuale) : '...'}</div>
                  </div>
                </div>
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg border">
                  <h3 className="text-base font-semibold text-gray-600 mb-2">Dettaglio per Unità</h3>
                  {outputs.slice(2).map(output => (
                     <div key={output.id} className="flex justify-between items-center text-sm p-2 bg-white rounded-md">
                        <span className="text-gray-600">{output.label}</span>
                        <span className="font-medium text-gray-800">{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '...'}</span>
                     </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Composizione dei Ricavi</h3>
                <div className="h-64 w-full bg-gray-50 p-2 rounded-lg border">
                    {isClient && <DynamicRevenueChart data={chartData} />}
                </div>
            </div>
          </div>
        </main>

        <aside className="lg:col-span-1 space-y-6">
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-3 text-gray-800">Azioni Rapide</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={salvaRisultato} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button>
              <button onClick={handleExportPDF} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta PDF</button>
              <button onClick={handleReset} className="col-span-2 w-full border border-red-300 bg-red-50 text-red-700 rounded-md px-3 py-2 hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button>
            </div>
          </section>
          <section className="border rounded-lg p-4 bg-white shadow-md">
            <h2 className="font-semibold mb-2 text-gray-800">Guida Strategica</h2>
            <ContentRenderer content={content} />
          </section>
        </aside>
      </div>
    </>
  );
};

export default MargineDiContribuzioneCalculator;
