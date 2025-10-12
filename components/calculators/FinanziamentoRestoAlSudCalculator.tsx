'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';

// --- OTTIMIZZAZIONE PERFORMANCE: Lazy Loading del Grafico ---
const DynamicPieChart = dynamic(() =>
  import('recharts').then(mod => {
    const { PieChart, Pie, Cell, Tooltip: ChartTooltip, Legend, ResponsiveContainer } = mod;
    const COLORS = { 
      'Contributo a Fondo Perduto': '#4f46e5', 
      'Finanziamento a Tasso Zero': '#818cf8', 
      'Mezzi Propri Necessari': '#fca5a5' 
    };

    return (props: { data: { name: string; value: number }[] }) => (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={props.data} cx="50%" cy="50%" labelLine={false} outerRadius={85} fill="#8884d8" dataKey="value" nameKey="name">
            {props.data.map((entry) => (
              <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
            ))}
          </Pie>
          <ChartTooltip formatter={(value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value)} />
          <Legend wrapperStyle={{ fontSize: "12px", bottom: 0, lineHeight: '1.5em' }} />
        </PieChart>
      </ResponsiveContainer>
    );
  }), {
  loading: () => <div className="flex items-center justify-center h-full w-full text-sm text-gray-500">Caricamento grafico...</div>,
  ssr: false
});

// --- OTTIMIZZAZIONE SEO: Componente per Iniezione Dati Strutturati ---
const SchemaInjector: React.FC<{ schema: object }> = ({ schema }) => (
  <Head>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}/>
  </Head>
);

// --- Componenti UI di base ---
const InfoIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-gray-600 transition-colors"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg> );
const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => ( <div className="relative flex items-center group">{children}<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">{text}</div></div> );

// --- Componente per Rendering Contenuto Markdown ---
const ContentRenderer: React.FC<{ content: string }> = ({ content }) => {
    const processInlineFormatting = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return (
      <div className="prose prose-sm max-w-none text-gray-700">
        {content.split('\n\n').map((block, index) => {
          const trimmedBlock = block.trim();
          if (trimmedBlock.startsWith('### **')) return <h3 key={index} className="text-xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/### \*\*/g, '').replace(/\*\*/g, '')) }} />;
          if (trimmedBlock.startsWith('#### **')) return <h4 key={index} className="text-lg font-semibold mt-4 mb-3" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock.replace(/#### \*\*/g, '').replace(/\*\*/g, '')) }} />;
          if (trimmedBlock.startsWith('*')) {
            const listItems = trimmedBlock.split('\n').map(item => item.replace(/^\*\s*/, ''));
            return <ul key={index} className="list-disc pl-5 space-y-2 mb-4">{listItems.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />)}</ul>;
          }
          if (trimmedBlock) return <p key={index} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedBlock) }} />;
          return null;
        })}
      </div>
    );
};

// --- Dati Self-Contained del Calcolatore ---
const calculatorData = { "slug": "finanziamento-resto-al-sud", "category": "PMI e Impresa", "title": "Calcolatore Finanziamento \"Resto al Sud\"", "lang": "it", "inputs": [{ "id": "investimentoAmmissibile", "label": "Investimento Totale Ammissibile", "type": "number", "unit": "€", "min": 0, "step": 1000, "tooltip": "Inserisci l'importo totale delle spese che prevedi di sostenere, al netto dell'IVA. Le spese devono rientrare tra quelle ammesse dal bando (es. macchinari, opere murarie, software)." }, { "id": "numeroProponenti", "label": "Numero di Proponenti/Soci", "type": "number", "unit": "soci", "min": 1, "max": 10, "step": 1, "tooltip": "Indica il numero di persone che richiedono il finanziamento. Per le società, inserire il numero di soci. Il massimale finanziabile dipende da questo valore (fino a 200.000€)." }], "outputs": [{ "id": "importoFinanziato", "label": "Importo Totale Finanziato da Invitalia", "unit": "€" }, { "id": "contributoFondoPerduto", "label": "Contributo a Fondo Perduto (50%)", "unit": "€" }, { "id": "finanziamentoTassoZero", "label": "Finanziamento Bancario a Tasso Zero (50%)", "unit": "€" }, { "id": "mezziPropriNecessari", "label": "Mezzi Propri Necessari", "unit": "€" }], "formulaSteps": [{ "id": "massimaleFinanziabile", "expr": "Math.min(200000, numeroProponenti * 50000)" }, { "id": "importoFinanziato", "expr": "Math.min(investimentoAmmissibile, massimaleFinanziabile)" }, { "id": "contributoFondoPerduto", "expr": "importoFinanziato * 0.5" }, { "id": "finanziamentoTassoZero", "expr": "importoFinanziato * 0.5" }, { "id": "mezziPropriNecessari", "expr": "Math.max(0, investimentoAmmissibile - importoFinanziato)" }], "examples": [{ "inputs": { "investimentoAmmissibile": 180000, "numeroProponenti": 4 }, "outputs": { "importoFinanziato": 180000, "contributoFondoPerduto": 90000, "finanziamentoTassoZero": 90000, "mezziPropriNecessari": 0 } }], "tags": "resto al sud, invitalia, finanziamento agevolato, contributo a fondo perduto, finanziamento a tasso zero, autoimprenditorialità, impresa sud italia, bando resto al sud, agevolazioni pmi, giovani imprenditori, mezzogiorno", "content": "### **Guida Completa a Resto al Sud: l'Incentivo per Creare Impresa nel Mezzogiorno**\n\n**Sogni di avviare la tua attività nel Sud Italia? Resto al Sud, gestito da Invitalia, è una delle più importanti agevolazioni per sostenere la nascita e lo sviluppo di nuove imprese e attività professionali.**\n\nQuesta guida dettagliata, unita al nostro calcolatore interattivo, ti fornirà un quadro completo per capire come funziona il finanziamento, chi può richiederlo e come calcolare la ripartizione delle agevolazioni. Ricorda, tuttavia, che questo strumento è una simulazione e **non sostituisce la valutazione ufficiale di Invitalia e la consulenza di un professionista.**\n\n### **Parte 1: Il Calcolatore - Come si Struttura il Finanziamento**\n\nResto al Sud è un'agevolazione \"ibrida\", progettata per coprire il 100% delle spese ammissibili del tuo progetto imprenditoriale, entro determinati massimali. La struttura del finanziamento è così ripartita:\n\n* **50% come Contributo a Fondo Perduto**: Una somma di denaro che viene erogata senza obbligo di restituzione, fornita direttamente da Invitalia.\n* **50% come Finanziamento a Tasso Zero**: Un prestito bancario senza interessi, da restituire in 10 anni (con 2 di preammortamento), il cui importo è garantito dal Fondo di Garanzia per le PMI.\n\nIl **massimale di spesa** finanziabile varia in base al numero di richiedenti:\n\n* **50.000 €** per le imprese individuali e le attività professionali svolte in forma individuale.\n* Fino a **200.000 €** per le società, calcolato come 50.000 € per ogni socio (fino a un massimo di 4 soci).\n\nIl nostro calcolatore ti permette di simulare questa ripartizione inserendo il tuo investimento e il numero di soci.\n\n### **Parte 2: Guida Approfondita - Requisiti e Spese Ammissibili**\n\n#### **Chi può richiedere Resto al Sud?**\n\nL'incentivo è rivolto a chi possiede i seguenti requisiti al momento della presentazione della domanda:\n* Età compresa **tra i 18 e i 55 anni**.\n* **Residenza** in una delle regioni ammesse (o trasferimento entro 60 giorni dall'approvazione).\n* **Non essere titolari** di altre attività d'impresa in esercizio.\n* **Non aver ricevuto** altre agevolazioni nazionali per l'autoimprenditorialità negli ultimi tre anni.\n* **Non avere un rapporto di lavoro** a tempo indeterminato (e mantenerlo per tutta la durata del finanziamento).\n\nLe **regioni ammesse** sono: Abruzzo, Basilicata, Calabria, Campania, Molise, Puglia, Sardegna, Sicilia, e le aree del cratere sismico del Centro Italia (Lazio, Marche, Umbria), oltre alle isole minori marine, lagunari e lacustri del Centro-Nord.\n\n#### **Quali spese sono finanziabili?**\n\nLe agevolazioni coprono una vasta gamma di spese per avviare l'attività (al netto dell'IVA):\n* **Opere murarie** e ristrutturazioni (nel limite del 30% del programma di spesa).\n* **Macchinari, impianti e attrezzature** nuovi.\n* **Programmi informatici** e servizi per le tecnologie dell'informazione e della comunicazione (TIC).\n* **Spese di gestione** come materie prime, utenze, canoni di locazione (nel limite del 20% del programma di spesa).\n\nSono **escluse** le spese per l'acquisto di beni usati, i costi di progettazione, le consulenze e le spese relative al personale.\n\n### **Parte 3: L'Iter di Domanda e l'Ulteriore Contributo a Fondo Perduto**\n\nLa domanda si presenta **esclusivamente online** attraverso il portale di Invitalia. È necessario avere una firma digitale e un indirizzo PEC. Invitalia valuta il progetto entro 60 giorni.\n\n**Novità Importante**: Alle imprese che completano il loro programma di spesa, viene concesso un **ulteriore contributo a fondo perduto** per sostenere il fabbisogno di circolante:\n\n* **15.000 €** per le ditte individuali e liberi professionisti.\n* **10.000 € per ogni socio**, fino a un massimo di 40.000 €, per le società.\n\nQuesto contributo aggiuntivo rafforza ulteriormente il supporto alle nuove imprese nelle fasi più delicate del loro ciclo di vita.", "seoSchema": { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{ "@type": "Question", "name": "Chi può richiedere il finanziamento Resto al Sud?", "acceptedAnswer": { "@type": "Answer", "text": "Possono richiederlo gli imprenditori e i professionisti tra i 18 e i 55 anni, residenti nelle regioni del Mezzogiorno, nelle aree del cratere sismico del Centro Italia o in specifiche isole minori. Non devono essere già titolari di imprese attive o avere un lavoro a tempo indeterminato." } }, { "@type": "Question", "name": "Qual è l'importo massimo che posso ottenere con Resto al Sud?", "acceptedAnswer": { "@type": "Answer", "text": "L'importo massimo finanziabile è di 50.000 € per le imprese individuali e arriva fino a 200.000 € per le società composte da un massimo di quattro soci (50.000 € per ogni socio)." } }, { "@type": "Question", "name": "Cosa significa '50% a fondo perduto e 50% a tasso zero'?", "acceptedAnswer": { "@type": "Answer", "text": "Significa che metà dell'importo finanziato è un regalo (contributo a fondo perduto) che non deve essere restituito. L'altra metà è un prestito bancario che va restituito, ma senza pagare alcun interesse. Lo Stato, tramite Invitalia, copre gli interessi per te." } }, { "@type": "Question", "name": "Posso usare i fondi di Resto al Sud per comprare l'immobile dove avviare l'attività?", "acceptedAnswer": { "@type": "Answer", "text": "No, l'acquisto di immobili non rientra tra le spese ammissibili. È invece possibile finanziare le opere di ristrutturazione e adeguamento di un immobile di proprietà o in locazione, entro il limite massimo del 30% del programma di spesa totale." } }] } };

// --- Componente Principale del Calcolatore ---
const FinanziamentoRestoAlSud: React.FC = () => {
    const { slug, title, inputs, outputs, content, seoSchema } = calculatorData;
    const calculatorRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true); }, []);

    const initialStates = { investimentoAmmissibile: 120000, numeroProponenti: 3 };
    const [states, setStates] = useState<{ [key: string]: any }>(initialStates);

    const handleStateChange = (id: string, value: any) => setStates(prev => ({ ...prev, [id]: value }));
    const handleReset = () => setStates(initialStates);
    
    const calculatedOutputs = useMemo(() => {
        const investimento = Number(states.investimentoAmmissibile) || 0;
        const proponenti = Number(states.numeroProponenti) || 1;
        
        const massimaleFinanziabile = Math.min(200000, proponenti * 50000);
        const importoFinanziato = Math.min(investimento, massimaleFinanziabile);
        const contributoFondoPerduto = importoFinanziato * 0.5;
        const finanziamentoTassoZero = importoFinanziato * 0.5;
        const mezziPropriNecessari = Math.max(0, investimento - importoFinanziato);

        return { importoFinanziato, contributoFondoPerduto, finanziamentoTassoZero, mezziPropriNecessari };
    }, [states]);

    const chartData = useMemo(() => {
      const { contributoFondoPerduto, finanziamentoTassoZero, mezziPropriNecessari } = calculatedOutputs;
      const data = [
        { name: 'Contributo a Fondo Perduto', value: contributoFondoPerduto },
        { name: 'Finanziamento a Tasso Zero', value: finanziamentoTassoZero },
        { name: 'Mezzi Propri Necessari', value: mezziPropriNecessari },
      ];
      return data.filter(d => d.value > 0);
    }, [calculatedOutputs]);

    const handleExportPDF = useCallback(async () => {
      try {
          const html2canvas = (await import('html2canvas')).default;
          const jsPDF = (await import('jspdf')).default;
          if (!calculatorRef.current) return;
          const canvas = await html2canvas(calculatorRef.current, { scale: 2 });
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save(`${slug}.pdf`);
      } catch (e) { alert("Errore durante l'esportazione in PDF."); }
    }, [slug]);

    const handleSaveResult = useCallback(() => {
        try {
            const payload = { slug, title, inputs: states, outputs: calculatedOutputs, ts: new Date().toISOString() };
            const results = JSON.parse(localStorage.getItem("calc_results") || "[]");
            localStorage.setItem("calc_results", JSON.stringify([payload, ...results].slice(0, 10)));
            alert("Risultato salvato nel browser!");
        } catch { alert("Impossibile salvare il risultato."); }
    }, [states, calculatedOutputs, slug, title]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
    const formulaUsata = `Finanziato = MIN(Investimento, MIN(200.000€, Soci * 50.000€))`;

    return (
        <>
            <SchemaInjector schema={seoSchema} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 bg-gray-50/80 font-sans">
                <div className="lg:col-span-2">
                    <div ref={calculatorRef} className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">{title}</h1>
                        <p className="text-gray-600 mb-6">Simula la struttura del finanziamento Resto al Sud e scopri la ripartizione tra fondo perduto, tasso zero e mezzi propri.</p>
                        
                        <div className="text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"><strong>Disclaimer:</strong> Questo è uno strumento di simulazione. L'ammissibilità e l'approvazione finale del progetto sono soggette alla valutazione insindacabile di Invitalia.</div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                            {inputs.map(input => (
                              <div key={input.id}>
                                <label htmlFor={input.id} className="block text-sm font-medium mb-1.5 text-gray-700 flex items-center">{input.label}<Tooltip text={input.tooltip}><span className="ml-2 cursor-help"><InfoIcon /></span></Tooltip></label>
                                <div className="relative"><input id={input.id} type="number" className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pl-3 pr-12 py-2" min={input.min} max={input.max} step={input.step} value={states[input.id]} onChange={e => handleStateChange(input.id, e.target.value === '' ? '' : Number(e.target.value))} /><div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500 text-sm">{input.unit}</div></div>
                              </div>
                            ))}
                        </div>

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="space-y-3">
                                <h2 className="text-xl font-semibold text-gray-800 mb-1">Ripartizione del Finanziamento</h2>
                                {outputs.map(output => (
                                    <div key={output.id} className={`flex items-baseline justify-between border-l-4 p-3 rounded-r-lg ${output.id === 'importoFinanziato' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                                        <span className="text-sm font-medium text-gray-700">{output.label}</span>
                                        <span className={`text-lg font-bold ${output.id === 'importoFinanziato' ? 'text-indigo-600' : 'text-gray-800'}`}>{isClient ? formatCurrency((calculatedOutputs as any)[output.id]) : '€...'}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="h-64 w-full bg-gray-50 p-2 rounded-lg border">
                                {isClient && (states.investimentoAmmissibile > 0 ? <DynamicPieChart data={chartData} /> : <div className="flex items-center justify-center h-full text-sm text-gray-500">Inserisci un importo per visualizzare il grafico.</div>)}
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 border  -xl -lg p-4"><h3 className="font-semibold text-gray-700">Formula di Calcolo Utilizzata</h3><p className="text-sm text-gray-600 mt-2 p-3 bg-gray-100 rounded-md font-mono break-words">{formulaUsata}</p></div>
                </div>

                <aside className="lg:col-span-1 space-y-6">
                    <section className="border rounded-xl p-4 bg-white shadow-lg"><h2 className="text-lg font-semibold mb-3 text-gray-800">Azioni Rapide</h2><div className="grid grid-cols-1 gap-3"><button onClick={handleSaveResult} className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Salva Risultato</button><button onClick={handleExportPDF} className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Esporta in PDF</button><button onClick={handleReset} className="w-full bg-red-50 border border-transparent rounded-md px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset Calcolatore</button></div></section>
                    <section className="border rounded-xl p-5 bg-white shadow-lg"><h2 className="text-lg font-semibold mb-3 text-gray-800">Guida all'Incentivo</h2><ContentRenderer content={content} /></section>
                    <section className="border rounded-xl p-5 bg-white shadow-lg"><h2 className="text-lg font-semibold mb-3 text-gray-800">Fonti e Riferimenti</h2><ul className="prose prose-sm max-w-none text-gray-700 list-disc pl-5 space-y-2"><li><a href="https://www.invitalia.it/cosa-facciamo/creiamo-nuove-aziende/resto-al-sud" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Invitalia - Sito Ufficiale Resto al Sud</a></li><li><a href="https://www.fondidigaranzia.it/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Fondo di Garanzia per le PMI</a></li></ul></section>
                </aside>
            </div>
        </>
    );
};

export default FinanziamentoRestoAlSud;
